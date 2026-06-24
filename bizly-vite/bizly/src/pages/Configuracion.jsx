import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Configuracion() {
  const { state, guardarConfig } = useApp()
  const cfg = state.config

  const [tab, setTab]       = useState('empresa')
  const [nombre, setNombre] = useState(cfg.nombre || '')
  const [tel, setTel]       = useState(cfg.tel || '')
  const [email, setEmail]   = useState(cfg.email || '')
  const [dir, setDir]       = useState(cfg.dir || '')
  const [moneda, setMoneda] = useState(cfg.moneda || 'COP')
  const [iva, setIva]       = useState(cfg.iva ?? 19)
  const [umbral, setUmbral] = useState(cfg.umbral ?? 10)

  function guardar() {
    guardarConfig({
      nombre, tel, email, dir, moneda,
      iva: parseFloat(iva) || 19,
      umbral: parseInt(umbral) || 10,
    })
    alert('Configuración guardada ✓')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Configuración</div>
        <div className="page-sub">Administra tu empresa y suscripción</div>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'empresa' ? ' active' : ''}`} onClick={() => setTab('empresa')}>Mi empresa</button>
        <button className={`tab${tab === 'plan' ? ' active' : ''}`} onClick={() => setTab('plan')}>Plan</button>
      </div>

      {tab === 'empresa' && (
        <div className="config-section">
          <div className="config-section-title">Información del negocio</div>
          <div className="config-body">
            <div className="form-group">
              <label className="form-label">Nombre del negocio</label>
              <input className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input className="form-input" placeholder="3001234567" value={tel} onChange={e => setTel(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="negocio@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input className="form-input" placeholder="Calle 1 # 2-3" value={dir} onChange={e => setDir(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Moneda</label>
                <select className="form-input" value={moneda} onChange={e => setMoneda(e.target.value)}>
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">IVA / Impuesto (%)</label>
                <input className="form-input" type="number" value={iva} onChange={e => setIva(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Umbral de stock bajo (unidades)</label>
              <input className="form-input" type="number" value={umbral} onChange={e => setUmbral(e.target.value)} />
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Recibirás alertas cuando el stock caiga por debajo de este número
              </div>
            </div>
            <button className="btn-primary" onClick={guardar}>Guardar cambios</button>
          </div>
        </div>
      )}

      {tab === 'plan' && (
        <div className="config-section">
          <div className="config-section-title">Plan actual</div>
          <div className="config-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-md)' }}>
              <i className="ti ti-crown" style={{ fontSize: 24, color: '#7c5cbf' }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>Business</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Acceso completo a todos los módulos</div>
              </div>
              <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>Activo</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
