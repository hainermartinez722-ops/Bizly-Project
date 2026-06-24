import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { fmtCOP, getInitials } from '../services/utils'
import Modal from '../components/Modal'

export default function Clientes() {
  const { state, guardarCliente } = useApp()
  const { clientes } = state

  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(false)
  const [nombre, setNombre] = useState('')
  const [doc, setDoc]       = useState('')
  const [tipo, setTipo]     = useState('CC')
  const [tel, setTel]       = useState('')
  const [email, setEmail]   = useState('')

  const filtered = clientes.filter(c =>
    !query ||
    c.nombre.toLowerCase().includes(query.toLowerCase()) ||
    (c.tel || '').includes(query) ||
    (c.email || '').toLowerCase().includes(query.toLowerCase())
  )
  const sorted = [...filtered].sort((a, b) => (b.totalCompras || 0) - (a.totalCompras || 0))

  function abrirNuevo() {
    setNombre(''); setDoc(''); setTipo('CC'); setTel(''); setEmail('')
    setModal(true)
  }

  async function guardar() {
    if (!nombre.trim()) { alert('El nombre es obligatorio'); return }
    await guardarCliente({ nombre: nombre.trim(), doc, tipo, tel, email })
    setModal(false)
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <div className="page-title">Clientes</div>
          <div className="page-sub">{clientes.length} registrados</div>
        </div>
        <button className="btn-primary" onClick={abrirNuevo}>
          <i className="ti ti-plus" /> Nuevo cliente
        </button>
      </div>

      <div className="top-bar">
        <div className="search-wrap">
          <i className="ti ti-search" />
          <input className="search-bar" placeholder="Buscar por nombre, teléfono, email..."
            value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">Sin clientes registrados.</div>
      ) : (
        <div className="client-grid">
          {sorted.map(c => (
            <div className="client-card" key={c.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div className="client-avatar">{getInitials(c.nombre)}</div>
                <div>
                  <div className="client-name">{c.nombre}</div>
                  <div className="client-id">{c.tipo} {c.doc}</div>
                </div>
              </div>
              <div className="client-stats">
                <span>
                  <i className="ti ti-shopping-bag" style={{ fontSize: 14, verticalAlign: -2 }} />
                  {' '}{c.numCompras || 0} compras
                </span>
                <span className="client-amount">{fmtCOP(c.totalCompras || 0)}</span>
              </div>
              {c.tel && (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>
                  <i className="ti ti-phone" style={{ fontSize: 13, verticalAlign: -2 }} /> {c.tel}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} title="Nuevo cliente" onClose={() => setModal(false)}
        footer={<><button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button><button className="btn-primary" onClick={guardar}>Guardar</button></>}>
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input className="form-input" placeholder="María López" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Documento (CC/NIT)</label>
            <input className="form-input" placeholder="12345678" value={doc} onChange={e => setDoc(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select className="form-input" value={tipo} onChange={e => setTipo(e.target.value)}>
              <option>CC</option><option>NIT</option><option>CE</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-input" placeholder="3001234567" value={tel} onChange={e => setTel(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="cliente@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
