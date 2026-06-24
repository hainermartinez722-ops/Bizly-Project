import { useApp } from '../context/AppContext'
import { fmtCOP, fmtDate } from '../services/utils'
import BarChart from '../components/BarChart'
import Badge from '../components/Badge'

export default function Dashboard({ onNav, usuario }) {
  const { state } = useApp()
  const { ventas, productos, clientes, config } = state
  const umbral = config.umbral ?? 10
  const esAdmin = usuario?.rol === 'admin'
  const rolLabel = esAdmin ? 'Administrador' : 'Empleado'

  // Métricas
  const today      = new Date().toDateString()
  const ventasHoy  = ventas.filter((v) => new Date(v.fecha).toDateString() === today && v.estado === 'completada')
  const totalHoy   = ventasHoy.reduce((s, v) => s + v.total, 0)
  const mesActual  = new Date().getMonth()
  const anio       = new Date().getFullYear()
  const ventasMes  = ventas.filter((v) => {
    const d = new Date(v.fecha)
    return d.getMonth() === mesActual && d.getFullYear() === anio && v.estado === 'completada'
  })
  const totalMes   = ventasMes.reduce((s, v) => s + v.total, 0)
  const stockBajo  = productos.filter((p) => p.stock <= umbral)

  // Gráfica 7 días
  const labels7 = []
  const data7   = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    labels7.push(d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' }))
    const ds = d.toDateString()
    data7.push(
      ventas
        .filter((v) => new Date(v.fecha).toDateString() === ds && v.estado === 'completada')
        .reduce((s, v) => s + v.total, 0)
    )
  }

  // Top productos
  const prodCount = {}
  ventas.filter((v) => v.estado === 'completada').forEach((v) =>
    (v.items || []).forEach((it) => {
      prodCount[it.nombre] = (prodCount[it.nombre] || 0) + it.qty
    })
  )
  const topProds = Object.entries(prodCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxQty   = topProds[0]?.[1] || 1

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Resumen del negocio en tiempo real</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            {usuario?.nombreCompleto || usuario?.nombre || 'Usuario'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {rolLabel}
          </div>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">
            <i className="ti ti-shopping-cart" style={{ color: '#7c5cbf', fontSize: 16 }} />
            Ventas hoy
          </div>
          <div className="metric-value">{fmtCOP(totalHoy)}</div>
          <div className="metric-sub">{ventasHoy.length} transacciones</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">
            <i className="ti ti-trending-up" style={{ color: '#059669', fontSize: 16 }} />
            Ingresos del mes
          </div>
          <div className="metric-value">{fmtCOP(totalMes)}</div>
          <div className="metric-sub">{ventasMes.length} ventas</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">
            <i className="ti ti-package" style={{ color: '#d97706', fontSize: 16 }} />
            Productos activos
          </div>
          <div className="metric-value">{productos.length}</div>
          <div className="metric-sub">{stockBajo.length} con stock bajo</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">
            <i className="ti ti-users" style={{ color: '#3b82f6', fontSize: 16 }} />
            Clientes
          </div>
          <div className="metric-value">{clientes.length}</div>
          <div className="metric-sub">registrados</div>
        </div>
      </div>

      <div className="three-col">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Ingresos últimos 7 días</span>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <BarChart labels={labels7} data={data7} height={200} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Top productos</span></div>
          <div className="card-body" style={{ paddingTop: 4 }}>
            {topProds.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', padding: '8px 0' }}>
                Sin ventas aún
              </p>
            ) : (
              <ul className="top-products-list">
                {topProds.map(([nombre, qty], i) => (
                  <li key={nombre}>
                    <div className="rank-num">{i + 1}</div>
                    <span style={{ flex: 1, fontSize: 13 }}>{nombre}</span>
                    <div className="prog-bar">
                      <div className="prog-fill" style={{ width: `${Math.round((qty / maxQty) * 100)}%` }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', minWidth: 40, textAlign: 'right' }}>
                      {qty} ud.
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ color: '#d97706' }}>⚠ Stock bajo</span>
            <button className="link-action" onClick={() => onNav('inventario')}>Ver todo →</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <tbody>
                {stockBajo.length === 0 ? (
                  <tr><td colSpan={2} className="empty-state">Todo en orden ✓</td></tr>
                ) : (
                  stockBajo.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td><Badge color="yellow">{p.stock} en stock</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Ventas recientes</span>
            <button className="link-action" onClick={() => onNav('ventas')}>Ver todo →</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <tbody>
                {ventas.length === 0 ? (
                  <tr><td colSpan={3} className="empty-state">Sin ventas aún</td></tr>
                ) : (
                  ventas.slice(0, 5).map((v) => (
                    <tr key={v.id}>
                      <td style={{ fontSize: 12, color: '#7c5cbf' }}>{v.id}</td>
                      <td style={{ textAlign: 'right' }}>{fmtCOP(v.total)}</td>
                      <td><Badge color={v.estado === 'completada' ? 'green' : 'red'}>{v.estado}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}