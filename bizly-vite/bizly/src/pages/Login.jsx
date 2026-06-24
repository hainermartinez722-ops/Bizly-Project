import { useState } from 'react'

export default function Login({ onLogin, onIrRegistro, onIrRecuperar }) {
  const [correo, setCorreo]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    if (!correo || !password) { setError('Completa todos los campos'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return }
      onLogin(data.token, data.usuario)
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) { if (e.key === 'Enter') handleLogin() }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}><i className="ti ti-building-store" style={{ fontSize: 28, color: '#e0d4ff' }} /></div>
          <div style={styles.logoName}>Bizly</div>
        </div>
        <div style={styles.title}>Bienvenido de vuelta</div>
        <div style={styles.sub}>Inicia sesión para continuar</div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div className="form-group">
          <label className="form-label">Correo electrónico</label>
          <input className="form-input" type="email" placeholder="tu@correo.com"
            value={correo} onChange={e => setCorreo(e.target.value)} onKeyDown={handleKey} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} />
        </div>

        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 4 }}
          onClick={handleLogin} disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>

        <div style={styles.links}>
          <button style={styles.linkBtn} onClick={onIrRecuperar}>¿Olvidaste tu contraseña?</button>
          <span style={{ color: '#ccc' }}>·</span>
          <button style={styles.linkBtn} onClick={onIrRegistro}>Crear cuenta</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  bg: { minHeight: '100vh', background: '#1a0f3d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: '0 24px 48px rgba(0,0,0,0.3)' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoIcon: { width: 44, height: 44, borderRadius: 10, background: '#2d1b69', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoName: { fontSize: 22, fontWeight: 700, color: '#2d1b69' },
  title: { fontSize: 20, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 },
  sub: { fontSize: 13, color: '#888', marginBottom: 24 },
  errorBox: { background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  links: { display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20, alignItems: 'center' },
  linkBtn: { background: 'none', border: 'none', color: '#7c5cbf', fontSize: 13, cursor: 'pointer', padding: 0 },
}
