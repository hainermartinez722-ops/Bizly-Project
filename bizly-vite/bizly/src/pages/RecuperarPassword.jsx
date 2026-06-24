import { useState } from 'react'

export default function RecuperarPassword({ onIrLogin }) {
  const [paso, setPaso]         = useState(1) // 1=correo, 2=código+nueva password
  const [correo, setCorreo]     = useState('')
  const [codigo, setCodigo]     = useState('')
  const [nueva, setNueva]       = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError]       = useState('')
  const [exito, setExito]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function enviarCodigo() {
    if (!correo) { setError('Ingresa tu correo'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:3001/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); return }
      setPaso(2)
      setExito('Si el correo está registrado, recibirás el código en unos segundos.')
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword() {
    if (!codigo || !nueva || !confirmar) { setError('Completa todos los campos'); return }
    if (nueva !== confirmar) { setError('Las contraseñas no coinciden'); return }
    if (nueva.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('http://localhost:3001/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, codigo, nuevaPassword: nueva }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Código inválido o expirado'); return }
      setExito('¡Contraseña actualizada! Ya puedes iniciar sesión.')
      setTimeout(onIrLogin, 2000)
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

        <div style={styles.title}>Recuperar contraseña</div>
        <div style={styles.sub}>
          {paso === 1 ? 'Te enviaremos un código de 6 dígitos a tu correo.' : `Revisa tu correo ${correo} e ingresa el código.`}
        </div>

        {error  && <div style={styles.errorBox}>{error}</div>}
        {exito  && <div style={styles.successBox}>{exito}</div>}

        {paso === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" type="email" placeholder="tu@correo.com"
                value={correo} onChange={e => setCorreo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && enviarCodigo()} autoFocus />
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 4 }}
              onClick={enviarCodigo} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </>
        )}

        {paso === 2 && (
          <>
            <div className="form-group">
              <label className="form-label">Código de 6 dígitos</label>
              <input className="form-input" placeholder="123456" maxLength={6}
                value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
                style={{ letterSpacing: 8, fontSize: 20, textAlign: 'center' }} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <input className="form-input" type="password" placeholder="Mínimo 6 caracteres"
                value={nueva} onChange={e => setNueva(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar contraseña</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={confirmar} onChange={e => setConfirmar(e.target.value)} />
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 4 }}
              onClick={resetPassword} disabled={loading}>
              {loading ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
            <button style={styles.reenviar} onClick={() => { setPaso(1); setError(''); setExito('') }}>
              ← Volver a ingresar correo
            </button>
          </>
        )}

        <div style={styles.links}>
          <button style={styles.linkBtn} onClick={onIrLogin}>← Volver al login</button>
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
  successBox: { background: '#dcfce7', color: '#166534', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  links: { display: 'flex', justifyContent: 'center', marginTop: 20 },
  linkBtn: { background: 'none', border: 'none', color: '#7c5cbf', fontSize: 13, cursor: 'pointer', padding: 0 },
  reenviar: { background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer', marginTop: 12, display: 'block', width: '100%', textAlign: 'center' },
}
