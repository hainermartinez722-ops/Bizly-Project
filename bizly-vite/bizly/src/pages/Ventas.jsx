import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { fmtCOP, fmtDate } from '../services/utils'
import Modal from '../components/Modal'
import Badge from '../components/Badge'

export default function Ventas() {
  const { state, registrarVenta, anularVenta } = useApp()
  const { ventas, productos, clientes, config } = state

  const [query, setQuery]           = useState('')
  const [modalVenta, setModalVenta] = useState(false)
  const [modalDetalle, setModalDetalle] = useState(null)

  const [clienteId, setClienteId] = useState('general')
  const [pago, setPago]           = useState('Efectivo')
  const [prodId, setProdId]       = useState('')
  const [qty, setQty]             = useState(1)
  const [items, setItems]         = useState([])

  const filtered = ventas.filter(v =>
    !query ||
    v.id.toLowerCase().includes(query.toLowerCase()) ||
    (v.clienteNombre || '').toLowerCase().includes(query.toLowerCase())
  )

  function abrirNuevaVenta() {
    setItems([]); setClienteId('general'); setPago('Efectivo')
    setProdId(productos[0]?.id || ''); setQty(1)
    setModalVenta(true)
  }

  function agregarItem() {
    const prod = productos.find(p => String(p.id) === String(prodId))
    if (!prod) return
    setItems(prev => {
      const ex = prev.find(i => String(i.pid) === String(prodId))
      if (ex) return prev.map(i => String(i.pid) === String(prodId) ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { pid: prod.id, nombre: prod.nombre, precio: prod.precio, qty }]
    })
  }

  function quitarItem(idx) { setItems(prev => prev.filter((_, i) => i !== idx)) }

  async function handleRegistrar() {
    if (!items.length) { alert('Agrega al menos un producto'); return }
    const cli = clientes.find(c => String(c.id) === String(clienteId))
    await registrarVenta({
      items,
      clienteId: cli ? cli.id : null,
      clienteNombre: cli?.nombre || 'Cliente general',
      pago,
    })
    setModalVenta(false)
  }

  async function handleAnular(v) {
    await anularVenta(v.id, v.id_venta)
    setModalDetalle(null)
  }

  const total = items.reduce((s, i) => s + i.precio * i.qty, 0)

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <div className="page-title">Ventas</div>
          <div className="page-sub">{ventas.filter(v => v.estado === 'completada').length} completadas</div>
        </div>
        <button className="btn-primary" onClick={abrirNuevaVenta}>
          <i className="ti ti-plus" /> Nueva venta
        </button>
      </div>

      <div className="top-bar">
        <div className="search-wrap">
          <i className="ti ti-search" />
          <input className="search-bar" placeholder="Buscar por # venta, cliente..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th># Venta</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th>Total</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="empty-state">Sin ventas registradas</td></tr>
            ) : filtered.map(v => (
              <tr key={v.id}>
                <td><button className="link-action" onClick={() => setModalDetalle(v)}>{v.id}</button></td>
                <td>{fmtDate(v.fecha)}</td>
                <td>{v.clienteNombre}</td>
                <td>{v.pago}</td>
                <td>{fmtCOP(v.total)}</td>
                <td><Badge color={v.estado === 'completada' ? 'green' : 'red'}>{v.estado}</Badge></td>
                <td><i className="ti ti-eye" style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => setModalDetalle(v)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalVenta} title="Nueva venta" onClose={() => setModalVenta(false)}
        footer={<><button className="btn-secondary" onClick={() => setModalVenta(false)}>Cancelar</button><button className="btn-primary" onClick={handleRegistrar}>Registrar venta</button></>}>
        <div className="form-group">
          <label className="form-label">Cliente</label>
          <select className="form-input" value={clienteId} onChange={e => setClienteId(e.target.value)}>
            <option value="general">Cliente general</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Método de pago</label>
          <select className="form-input" value={pago} onChange={e => setPago(e.target.value)}>
            {['Efectivo', 'Nequi', 'Daviplata', 'Transferencia', 'Tarjeta'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Agregar productos</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <select className="form-input" style={{ flex: 1 }} value={prodId} onChange={e => setProdId(e.target.value)}>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} — {fmtCOP(p.precio)}</option>)}
            </select>
            <input type="number" className="form-input" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} style={{ width: 70 }} />
            <button className="btn-primary" onClick={agregarItem}>+</button>
          </div>
          <table className="sale-items-table">
            <thead><tr><th>Producto</th><th>Precio</th><th>Cant.</th><th>Subtotal</th><th></th></tr></thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.nombre}</td><td>{fmtCOP(it.precio)}</td><td>{it.qty}</td><td>{fmtCOP(it.precio * it.qty)}</td>
                  <td><i className="ti ti-trash" style={{ cursor: 'pointer', color: '#e24b4a' }} onClick={() => quitarItem(idx)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 500, marginTop: 8 }}>Total: {fmtCOP(total)}</div>
        </div>
      </Modal>

      {modalDetalle && (
        <Modal open={!!modalDetalle} title={modalDetalle.id} onClose={() => setModalDetalle(null)}
          footer={<><button className="btn-secondary" onClick={() => setModalDetalle(null)}>Cerrar</button>{modalDetalle.estado === 'completada' && <button className="btn-primary" onClick={() => handleAnular(modalDetalle)}>Anular venta</button>}</>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            <div><div className="form-label">Cliente</div><div style={{ fontSize: 13 }}>{modalDetalle.clienteNombre}</div></div>
            <div><div className="form-label">Método de pago</div><div style={{ fontSize: 13 }}>{modalDetalle.pago}</div></div>
            <div><div className="form-label">Fecha</div><div style={{ fontSize: 13 }}>{fmtDate(modalDetalle.fecha)}</div></div>
            <div><div className="form-label">Estado</div><Badge color={modalDetalle.estado === 'completada' ? 'green' : 'red'}>{modalDetalle.estado}</Badge></div>
          </div>
          <table style={{ fontSize: 12, width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
            <thead><tr>
              <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '0.5px solid var(--color-border-tertiary)', fontSize: 11, textTransform: 'uppercase' }}>Producto</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '0.5px solid var(--color-border-tertiary)', fontSize: 11 }}>Precio</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '0.5px solid var(--color-border-tertiary)', fontSize: 11 }}>Cant.</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '0.5px solid var(--color-border-tertiary)', fontSize: 11 }}>Subtotal</th>
            </tr></thead>
            <tbody>
              {(modalDetalle.items || []).map((it, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 8px' }}>{it.nombre}</td>
                  <td style={{ textAlign: 'right', padding: '6px 8px' }}>{fmtCOP(it.precio)}</td>
                  <td style={{ textAlign: 'right', padding: '6px 8px' }}>{it.qty}</td>
                  <td style={{ textAlign: 'right', padding: '6px 8px' }}>{fmtCOP(it.precio * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            IVA incluido ({config.iva}%): {fmtCOP(modalDetalle.total * config.iva / (100 + config.iva))}
          </div>
          <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 500, marginTop: 4 }}>Total: {fmtCOP(modalDetalle.total)}</div>
        </Modal>
      )}
    </div>
  )
}
