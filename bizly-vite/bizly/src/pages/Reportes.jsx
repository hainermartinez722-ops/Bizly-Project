import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { fmtCOP, exportarCSV } from '../services/utils'
import BarChart from '../components/BarChart'
import DoughnutChart from '../components/DoughnutChart'

function todayStr() { return new Date().toISOString().split('T')[0] }
function monthStartStr() { const t = todayStr(); return t.slice(0, 8) + '01' }

export default function Reportes() {
  const { state } = useApp()
  const { ventas, config } = state
  const iva = config.iva ?? 19

  const [desde, setDesde] = useState(monthStartStr())
  const [hasta, setHasta] = useState(todayStr())

  const filtradas = ventas.filter((v) => {
    if (v.estado !== 'completada') return false
    const d = new Date(v.fecha)
    if (desde && d < new Date(desde)) return false
    if (hasta && d > new Date(hasta + 'T23:59:59')) return false
    return true
  })

  const total    = filtradas.reduce((s, v) => s + v.total, 0)
  const ivaAmt   = total * iva / (100 + iva)
  const ticket   = filtradas.length ? total / filtradas.length : 0

  // Gráfica mensual 6 meses
  const labMes  = []
  const dataMes = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i)
    labMes.push(d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }))
    dataMes.push(
      ventas
        .filter((v) => {
          const vd = new Date(v.fecha)
          return vd.getMonth() === d.getMonth() && vd.getFullYear() === d.getFullYear() && v.estado === 'completada'
        })
        .reduce((s, v) => s + v.total, 0)
    )
  }

  // Gráfica métodos de pago
  const pagoMap = {}
  filtradas.forEach((v) => { pagoMap[v.pago] = (pagoMap[v.pago] || 0) + v.total })
  const pagoLabels = Object.keys(pagoMap)
  const pagoData   = Object.values(pagoMap)

  // Top 5 productos
  const prodIngresos = {}
  const prodUnidades = {}
  filtradas.forEach((v) =>
    (v.items || []).forEach((it) => {
      prodIngresos[it.nombre] = (prodIngresos[it.nombre] || 0) + it.precio * it.qty
      prodUnidades[it.nombre] = (prodUnidades[it.nombre] || 0) + it.qty
    })
  )
  const top5 = Object.entries(prodIngresos).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <div className="page-title">Reportes</div>
          <div className="page-sub">Análisis y exportación de datos</div>
        </div>
        <button className="btn-secondary" onClick={() => exportarCSV(ventas)}>
          <i className="ti ti-download" /> Exportar CSV
        </button>
      </div>

      {/* Filtro de período */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 'var(--border-radius-lg)', padding: '14px 20px' }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Período:</span>
        <input type="date" className="form-input" style={{ width: 160 }} value={desde} onChange={(e) => setDesde(e.target.value)} />
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>hasta</span>
        <input type="date" className="form-input" style={{ width: 160 }} value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </div>

      {/* Métricas del período */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Ventas del período</div>
          <div className="metric-value">{filtradas.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Ingresos</div>
          <div className="metric-value">{fmtCOP(total)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Ticket promedio</div>
          <div className="metric-value">{fmtCOP(ticket)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">IVA recaudado</div>
          <div className="metric-value">{fmtCOP(ivaAmt)}</div>
        </div>
      </div>

      <div className="three-col">
        <div className="card">
          <div className="card-header"><span className="card-title">Tendencia mensual (6 meses)</span></div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <BarChart labels={labMes} data={dataMes} height={220} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Métodos de pago</span></div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            {pagoLabels.length === 0
              ? <div className="empty-state">Sin datos en el período</div>
              : <DoughnutChart labels={pagoLabels} data={pagoData} height={220} />
            }
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><span className="card-title">Top 5 productos (por ingresos)</span></div>
        <div className="card-body" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr><th>Producto</th><th>Unidades</th><th>Ingresos</th></tr>
            </thead>
            <tbody>
              {top5.length === 0 ? (
                <tr><td colSpan={3} className="empty-state">Sin datos en el período</td></tr>
              ) : (
                top5.map(([nombre, ing]) => (
                  <tr key={nombre}>
                    <td>{nombre}</td>
                    <td>{prodUnidades[nombre]}</td>
                    <td>{fmtCOP(ing)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
