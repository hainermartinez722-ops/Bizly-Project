import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { fmtCOP } from '../services/utils'
import Modal from '../components/Modal'

const CAT_COLORS = ['#ede9fe', '#dcfce7', '#dbeafe', '#fef9c3', '#fee2e2', '#e0f2fe', '#fce7f3']

export default function Inventario() {
  const { state, guardarProducto, eliminarProducto } = useApp()
  const { productos, config } = state
  const umbral = config.umbral ?? 10

  const [query, setQuery]         = useState('')
  const [catFil, setCatFil]       = useState('')
  const [stkFil, setStkFil]       = useState('')
  const [modal, setModal]         = useState(false)
  const [editId, setEditId]       = useState(null)
  const [nombre, setNombre]       = useState('')
  const [sku, setSku]             = useState('')
  const [categoria, setCategoria] = useState('')
  const [precio, setPrecio]       = useState('')
  const [stock, setStock]         = useState('')

  const cats = [...new Set(productos.map(p => p.categoria).filter(Boolean))]
  const catMap = Object.fromEntries(cats.map((c, i) => [c, CAT_COLORS[i % CAT_COLORS.length]]))

  let filtered = productos
  if (query)             filtered = filtered.filter(p => p.nombre.toLowerCase().includes(query.toLowerCase()) || (p.sku || '').toLowerCase().includes(query.toLowerCase()))
  if (catFil)            filtered = filtered.filter(p => p.categoria === catFil)
  if (stkFil === 'bajo') filtered = filtered.filter(p => p.stock <= umbral)
  if (stkFil === 'ok')   filtered = filtered.filter(p => p.stock > umbral)

  const bajo = productos.filter(p => p.stock <= umbral)

  function abrirNuevo() {
    setEditId(null); setNombre(''); setSku(''); setCategoria(''); setPrecio(''); setStock('')
    setModal(true)
  }

  function abrirEditar(p) {
    setEditId(p.id); setNombre(p.nombre); setSku(p.sku || '')
    setCategoria(p.categoria || ''); setPrecio(p.precio); setStock(p.stock)
    setModal(true)
  }

  async function guardar() {
    if (!nombre.trim()) { alert('El nombre es obligatorio'); return }
    await guardarProducto({
      id: editId,
      nombre: nombre.trim(),
      sku: sku.trim(),
      categoria: categoria.trim(),
      precio: parseFloat(precio) || 0,
      stock: parseInt(stock) || 0,
    })
    setModal(false)
  }

  async function eliminar(p) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return
    await eliminarProducto(p.id, p.nombre)
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <div className="page-title">Inventario</div>
          <div className="page-sub">{productos.length} productos · {bajo.length} con stock bajo</div>
        </div>
        <button className="btn-primary" onClick={abrirNuevo}>
          <i className="ti ti-plus" /> Nuevo producto
        </button>
      </div>

      {bajo.length > 0 && (
        <div className="alert-banner">
          <i className="ti ti-alert-triangle" />
          {bajo.length} producto(s) con stock bajo o agotado
        </div>
      )}

      <div className="top-bar">
        <div className="search-wrap">
          <i className="ti ti-search" />
          <input className="search-bar" placeholder="Buscar por nombre o SKU..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 160 }} value={catFil} onChange={e => setCatFil(e.target.value)}>
          <option value="">Todas las categorías</option>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="form-input" style={{ width: 140 }} value={stkFil} onChange={e => setStkFil(e.target.value)}>
          <option value="">Todo el stock</option>
          <option value="bajo">Stock bajo</option>
          <option value="ok">Stock normal</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">Sin productos. Agrega tu primer producto.</div>
      ) : (
        <div className="inv-grid">
          {filtered.map(p => (
            <div className="inv-card" key={p.id}>
              <div className="inv-img"><i className="ti ti-package" /></div>
              <div className="inv-name">{p.nombre}</div>
              <div className="inv-sku">SKU: {p.sku || '—'}</div>
              {p.categoria && (
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 11, background: catMap[p.categoria] || '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 20 }}>
                    {p.categoria}
                  </span>
                </div>
              )}
              <div className="inv-row">
                <span className="inv-price">{fmtCOP(p.precio)}</span>
                <span className="inv-stock" style={p.stock <= umbral ? { background: '#fee2e2', color: '#991b1b' } : {}}>
                  {p.stock} und.
                </span>
              </div>
              <div className="inv-actions">
                <button className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px', flex: 1 }} onClick={() => abrirEditar(p)}>
                  <i className="ti ti-edit" /> Editar
                </button>
                <button className="btn-danger" onClick={() => eliminar(p)}>
                  <i className="ti ti-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} title={editId ? 'Editar producto' : 'Nuevo producto'} onClose={() => setModal(false)}
        footer={<><button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button><button className="btn-primary" onClick={guardar}>Guardar</button></>}>
        <div className="form-group">
          <label className="form-label">Nombre del producto</label>
          <input className="form-input" placeholder="Leche entera 1L" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input className="form-input" placeholder="BEB-001" value={sku} onChange={e => setSku(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <input className="form-input" placeholder="Bebidas" value={categoria} onChange={e => setCategoria(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Precio (COP)</label>
            <input className="form-input" type="number" min={0} placeholder="2200" value={precio} onChange={e => setPrecio(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Stock (unidades)</label>
            <input className="form-input" type="number" min={0} placeholder="100" value={stock} onChange={e => setStock(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
