require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const bcrypt   = require('bcrypt')
const jwt      = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const db       = require('./config/db')

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'bizly_secret'

// ── Nodemailer ────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ── Health check ──────────────────────────────────────────
app.get('/', (req, res) => res.send('OK'))

app.get('/test-db', (req, res) => {
  db.query('SELECT NOW() AS fecha', (err, result) => {
    if (err) return res.status(500).json(err)
    res.json(result)
  })
})

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════

// POST /auth/login
app.post('/auth/login', (req, res) => {
  const { correo, password } = req.body
  if (!correo || !password) return res.status(400).json({ error: 'Correo y contraseña son obligatorios' })

  db.query(
    `SELECT u.*, r.nombre_rol FROM usuarios u
     LEFT JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.correo = ?`,
    [correo],
    async (err, rows) => {
      if (err) return res.status(500).json(err)
      if (rows.length === 0) return res.status(401).json({ error: 'Correo o contraseña incorrectos' })

      const usuario = rows[0]
      const valido = await bcrypt.compare(password, usuario.password)
      if (!valido) return res.status(401).json({ error: 'Correo o contraseña incorrectos' })

      const token = jwt.sign({ id: usuario.id_usuario, correo: usuario.correo, id_rol: usuario.id_rol }, JWT_SECRET, { expiresIn: '7d' })
      res.json({
        token,
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          nombreCompleto: usuario.nombre + ' ' + usuario.apellido,
          id_rol: usuario.id_rol,
          rol: usuario.nombre_rol || 'empleado',
        },
      })
    }
  )
})

// POST /auth/registro
app.post('/auth/registro', async (req, res) => {
  const { nombre, apellido, correo, password } = req.body
  if (!nombre || !correo || !password) return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' })

  db.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo], async (err, rows) => {
    if (err) return res.status(500).json(err)
    if (rows.length > 0) return res.status(400).json({ error: 'Ya existe una cuenta con ese correo' })

    const hash = await bcrypt.hash(password, 10)
    db.query(
      'INSERT INTO usuarios (nombre, apellido, correo, password, estado, id_rol) VALUES (?, ?, ?, ?, "activo", 2)',
      [nombre.trim(), apellido?.trim() || '', correo.trim(), hash],
      (err2, result) => {
        if (err2) return res.status(500).json(err2)
        const token = jwt.sign({ id: result.insertId, correo, id_rol: 2 }, JWT_SECRET, { expiresIn: '7d' })
        res.json({
          token,
          usuario: {
            id: result.insertId,
            nombre,
            apellido: apellido || '',
            correo,
            nombreCompleto: nombre + ' ' + (apellido || ''),
            id_rol: 2,
            rol: 'empleado',
          },
        })
      }
    )
  })
})

// POST /auth/recuperar — envía código numérico de 6 dígitos al correo
app.post('/auth/recuperar', (req, res) => {
  const { correo } = req.body
  if (!correo) return res.status(400).json({ error: 'El correo es obligatorio' })

  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, rows) => {
    if (err) return res.status(500).json(err)
    // Responder siempre ok por seguridad (no revelar si el correo existe)
    if (rows.length === 0) return res.json({ ok: true })

    const usuario = rows[0]
    const codigo = Math.floor(100000 + Math.random() * 900000).toString() // 6 dígitos
    const expiracion = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    // Borrar tokens anteriores del usuario
    db.query('DELETE FROM tokens_recuperacion WHERE id_usuario = ?', [usuario.id_usuario], (err2) => {
      if (err2) return res.status(500).json(err2)

      db.query(
        'INSERT INTO tokens_recuperacion (token, fecha_expiracion, utilizado, id_usuario) VALUES (?, ?, 0, ?)',
        [codigo, expiracion, usuario.id_usuario],
        (err3) => {
          if (err3) return res.status(500).json(err3)

          // Enviar email
          transporter.sendMail({
            from: `"Bizly" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: 'Código de recuperación de contraseña — Bizly',
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px;">
                <h2 style="color:#2d1b69;margin-bottom:8px;">Recuperar contraseña</h2>
                <p style="color:#555;margin-bottom:24px;">Usa el siguiente código para restablecer tu contraseña. Expira en <strong>15 minutos</strong>.</p>
                <div style="background:#2d1b69;color:#fff;font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:20px;border-radius:8px;">
                  ${codigo}
                </div>
                <p style="color:#999;font-size:12px;margin-top:24px;">Si no solicitaste esto, ignora este correo.</p>
              </div>
            `,
          }, (mailErr) => {
            if (mailErr) {
              console.error('Error enviando email:', mailErr)
              return res.status(500).json({ error: 'No se pudo enviar el correo' })
            }
            res.json({ ok: true })
          })
        }
      )
    })
  })
})

// POST /auth/reset-password — verifica código y cambia contraseña
app.post('/auth/reset-password', async (req, res) => {
  const { correo, codigo, nuevaPassword } = req.body
  if (!correo || !codigo || !nuevaPassword) return res.status(400).json({ error: 'Todos los campos son obligatorios' })

  db.query(
    `SELECT t.*, u.id_usuario FROM tokens_recuperacion t
     JOIN usuarios u ON t.id_usuario = u.id_usuario
     WHERE u.correo = ? AND t.token = ? AND t.utilizado = 0 AND t.fecha_expiracion > NOW()`,
    [correo, codigo],
    async (err, rows) => {
      if (err) return res.status(500).json(err)
      if (rows.length === 0) return res.status(400).json({ error: 'Código inválido o expirado' })

      const hash = await bcrypt.hash(nuevaPassword, 10)
      const id_usuario = rows[0].id_usuario
      const id_token   = rows[0].id_token

      db.query('UPDATE usuarios SET password = ? WHERE id_usuario = ?', [hash, id_usuario], (err2) => {
        if (err2) return res.status(500).json(err2)
        db.query('UPDATE tokens_recuperacion SET utilizado = 1 WHERE id_token = ?', [id_token])
        res.json({ ok: true })
      })
    }
  )
})

// ══════════════════════════════════════════════════════════
// PRODUCTOS
// ══════════════════════════════════════════════════════════

app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos ORDER BY nombre', (err, rows) => {
    if (err) return res.status(500).json(err)
    res.json(rows.map(p => ({
      id: p.id_producto, nombre: p.nombre, sku: p.sku || '',
      categoria: p.categoria || '', precio: parseFloat(p.precio), stock: p.stock,
    })))
  })
})

app.post('/productos', (req, res) => {
  const { nombre, sku, categoria, precio, stock } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' })
  db.query(
    'INSERT INTO productos (nombre, sku, categoria, precio, stock) VALUES (?, ?, ?, ?, ?)',
    [nombre, sku || '', categoria || '', precio || 0, stock || 0],
    (err, result) => {
      if (err) return res.status(500).json(err)
      res.json({ id: result.insertId, nombre, sku, categoria, precio, stock })
    }
  )
})

app.put('/productos/:id', (req, res) => {
  const { nombre, sku, categoria, precio, stock } = req.body
  db.query(
    'UPDATE productos SET nombre=?, sku=?, categoria=?, precio=?, stock=? WHERE id_producto=?',
    [nombre, sku || '', categoria || '', precio || 0, stock || 0, req.params.id],
    (err) => { if (err) return res.status(500).json(err); res.json({ ok: true }) }
  )
})

app.delete('/productos/:id', (req, res) => {
  db.query('DELETE FROM productos WHERE id_producto=?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err)
    res.json({ ok: true })
  })
})

// ══════════════════════════════════════════════════════════
// CLIENTES
// ══════════════════════════════════════════════════════════

app.get('/clientes', (req, res) => {
  db.query('SELECT * FROM clientes ORDER BY nombre', (err, rows) => {
    if (err) return res.status(500).json(err)
    res.json(rows.map(c => ({
      id: c.id_cliente,
      nombre: c.nombre + (c.apellido ? ' ' + c.apellido : ''),
      doc: c.documento || '', tipo: c.tipo_doc || 'CC',
      tel: c.telefono || '', email: c.correo || '',
      totalCompras: parseFloat(c.total_compras || 0), numCompras: c.num_compras || 0,
    })))
  })
})

app.post('/clientes', (req, res) => {
  const { nombre, doc, tipo, tel, email } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' })
  const partes = nombre.trim().split(' ')
  db.query(
    'INSERT INTO clientes (nombre, apellido, correo, telefono, tipo_doc, documento, total_compras, num_compras) VALUES (?, ?, ?, ?, ?, ?, 0, 0)',
    [partes[0], partes.slice(1).join(' ') || '', email || '', tel || '', tipo || 'CC', doc || ''],
    (err, result) => {
      if (err) return res.status(500).json(err)
      res.json({ id: result.insertId, nombre, doc, tipo, tel, email, totalCompras: 0, numCompras: 0 })
    }
  )
})

// ══════════════════════════════════════════════════════════
// VENTAS
// ══════════════════════════════════════════════════════════

app.get('/ventas', (req, res) => {
  db.query('SELECT * FROM ventas ORDER BY fecha_venta DESC', (err, rows) => {
    if (err) return res.status(500).json(err)
    if (rows.length === 0) return res.json([])
    const ids = rows.map(v => v.id_venta)
    db.query(
      `SELECT dv.*, p.nombre FROM detalle_ventas dv
       JOIN productos p ON dv.id_producto = p.id_producto
       WHERE dv.id_venta IN (?)`,
      [ids],
      (err2, detalles) => {
        if (err2) return res.status(500).json(err2)
        res.json(rows.map(v => ({
          id: 'VTA-' + String(v.id_venta).padStart(6, '0'),
          id_venta: v.id_venta,
          fecha: v.fecha_venta,
          clienteId: v.id_cliente,
          clienteNombre: v.cliente_nombre || 'Cliente general',
          pago: v.metodo_pago || 'Efectivo',
          total: parseFloat(v.total || 0),
          estado: v.estado || 'completada',
          items: detalles.filter(d => d.id_venta === v.id_venta).map(d => ({
            pid: d.id_producto, nombre: d.nombre,
            precio: parseFloat(d.precio_unitario), qty: d.cantidad,
          })),
        })))
      }
    )
  })
})

app.post('/ventas', (req, res) => {
  const { items, clienteId, clienteNombre, pago, total, iva } = req.body
  if (!items || !items.length) return res.status(400).json({ error: 'Sin items' })
  const impuesto = parseFloat(total) * parseFloat(iva || 19) / (100 + parseFloat(iva || 19))
  const subtotal = parseFloat(total) - impuesto
  db.query(
    'INSERT INTO ventas (subtotal, impuesto, total, metodo_pago, estado, cliente_nombre, id_cliente) VALUES (?, ?, ?, ?, "completada", ?, ?)',
    [subtotal, impuesto, total, pago || 'Efectivo', clienteNombre || 'Cliente general', clienteId || null],
    (err, result) => {
      if (err) return res.status(500).json(err)
      const id_venta = result.insertId
      db.query(
        'INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES ?',
        [items.map(i => [id_venta, i.pid, i.qty, i.precio, i.precio * i.qty])],
        (err2) => {
          if (err2) return res.status(500).json(err2)
          Promise.all(items.map(i => new Promise((resolve, reject) =>
            db.query('UPDATE productos SET stock = GREATEST(0, stock - ?) WHERE id_producto = ?',
              [i.qty, i.pid], e => e ? reject(e) : resolve())
          ))).then(() => {
            if (clienteId) db.query(
              'UPDATE clientes SET total_compras = total_compras + ?, num_compras = num_compras + 1 WHERE id_cliente = ?',
              [total, clienteId]
            )
            res.json({ id_venta, id: 'VTA-' + String(id_venta).padStart(6, '0') })
          }).catch(e => res.status(500).json(e))
        }
      )
    }
  )
})

app.put('/ventas/:id/anular', (req, res) => {
  const id_venta = req.params.id
  db.query('UPDATE ventas SET estado="anulada" WHERE id_venta=?', [id_venta], (err) => {
    if (err) return res.status(500).json(err)
    db.query('SELECT * FROM detalle_ventas WHERE id_venta=?', [id_venta], (err2, items) => {
      if (err2) return res.status(500).json(err2)
      Promise.all(items.map(i => new Promise((resolve, reject) =>
        db.query('UPDATE productos SET stock = stock + ? WHERE id_producto = ?',
          [i.cantidad, i.id_producto], e => e ? reject(e) : resolve())
      ))).then(() => res.json({ ok: true })).catch(e => res.status(500).json(e))
    })
  })
})

// ══════════════════════════════════════════════════════════
// AUDITORIA
// ══════════════════════════════════════════════════════════

app.get('/auditoria', (req, res) => {
  db.query(
    `SELECT a.*, u.nombre as user_nombre, u.apellido as user_apellido
     FROM auditoria a LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
     ORDER BY a.fecha DESC LIMIT 200`,
    (err, rows) => {
      if (err) return res.status(500).json(err)
      res.json(rows.map(a => ({
        id: a.id_auditoria,
        user: a.user_nombre ? a.user_nombre + ' ' + (a.user_apellido || '') : 'Admin',
        accion: a.accion, tipo: a.tipo || '', detalle: a.descripcion, fecha: a.fecha,
      })))
    }
  )
})

app.post('/auditoria', (req, res) => {
  const { accion, tipo, detalle, id_usuario } = req.body
  db.query(
    'INSERT INTO auditoria (accion, tipo, descripcion, id_usuario) VALUES (?, ?, ?, ?)',
    [accion, tipo || '', detalle, id_usuario || null],
    (err, result) => {
      if (err) return res.status(500).json(err)
      res.json({ id: result.insertId })
    }
  )
})

app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, rows) => {
    if (err) return res.status(500).json(err)
    res.json(rows)
  })
})

app.listen(process.env.PORT || 3001, () => {
  console.log(' Servidor ejecutándose en puerto ' + (process.env.PORT || 3001))
})