import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { fmtDate, getInitials } from '../services/utils'
import Badge from '../components/Badge'

function badgeColor(accion) {
  if (accion === 'Creó') return 'green'
  if (accion === 'Anuló' || accion === 'Eliminó') return 'red'
  return 'blue'
}

export default function Auditoria() {
  const { state } = useApp()
  const [query, setQuery] = useState('')

  const filtered = state.auditoria.filter(
    (a) =>
      !query ||
      a.user.toLowerCase().includes(query.toLowerCase()) ||
      a.detalle.toLowerCase().includes(query.toLowerCase()) ||
      a.tipo.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Centro de Auditoría</div>
        <div className="page-sub">Registro completo de actividades</div>
      </div>

      <div className="top-bar">
        <div className="search-wrap">
          <i className="ti ti-search" />
          <input
            className="search-bar"
            placeholder="Buscar por usuario, acción..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {filtered.length === 0 ? (
            <div className="empty-state">Sin actividad registrada</div>
          ) : (
            filtered.map((a) => (
              <div className="audit-item" key={a.id}>
                <div className="audit-avatar">{getInitials(a.user)}</div>
                <div style={{ flex: 1 }}>
                  <div className="audit-action">
                    <strong style={{ color: 'var(--color-text-primary)' }}>{a.user}</strong>
                    {' '}
                    <Badge color={badgeColor(a.accion)} style={{ margin: '0 4px' }}>{a.accion}</Badge>
                    {' '}
                    <span style={{ color: 'var(--color-text-secondary)' }}>{a.tipo}</span>
                    <br />
                    <span>{a.detalle}</span>
                  </div>
                </div>
                <div className="audit-time">{fmtDate(a.fecha)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
