import { useState } from 'react'

export default function Registro({ onLogin, onIrLogin }) {
  const [nombre, setNombre]     = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo]     = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleRegistro() {
    if (!nombre || !correo || !password || !confirmar) { setError('Completa todos los campos'); return }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:3001/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, correo, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al crear la cuenta'); return }
      onLogin(data.token, data.usuario)
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}><i className="ti ti-building-store" style={{ fontSize: 28, color: '#e0d4ff' }} /></div>
          <div style={styles.logoName}>Bizly</div>
        </div>
        <div style={styles.title}>Crear cuenta</div>
        <div style={styles.sub}>Regístrate para empezar a usar Bizly</div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" placeholder="Juan" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Apellido</label>
            <input className="form-input" placeholder="Pérez" value={apellido} onChange={e => setApellido(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Correo electrónico</label>
          <input className="form-input" type="email" placeholder="tu@correo.com" value={correo} onChange={e => setCorreo(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Confirmar contraseña</label>
          <input className="form-input" type="password" placeholder="••••••••" value={confirmar} onChange={e => setConfirmar(e.target.value)} />
        </div>

        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 4 }}
          onClick={handleRegistro} disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <div style={styles.links}>
          <span style={{ color: '#888', fontSize: 13 }}>¿Ya tienes cuenta?</span>
          <button style={styles.linkBtn} onClick={onIrLogin}>Iniciar sesión</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  bg: { minHeight: '100vh', background: '#1a0f3d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 48px rgba(0,0,0,0.3)' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoIcon: { width: 44, height: 44, borderRadius: 10, background: '#2d1b69', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoName: { fontSize: 22, fontWeight: 700, color: '#2d1b69' },
  title: { fontSize: 20, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 },
  sub: { fontSize: 13, color: '#888', marginBottom: 24 },
  errorBox: { background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  links: { display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, alignItems: 'center' },
  linkBtn: { background: 'none', border: 'none', color: '#7c5cbf', fontSize: 13, cursor: 'pointer', padding: 0 },
}
