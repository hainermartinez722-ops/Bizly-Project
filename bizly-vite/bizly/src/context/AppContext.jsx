import { createContext, useContext, useReducer, useEffect } from 'react'
import { defaultState } from '../data/defaultState'

const AppContext = createContext(null)
const API = 'http://localhost:3001'

// ── Helpers API ───────────────────────────────────────────
async function apiFetch(path, options) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ── Reducer (solo actualiza el estado local, API se llama aparte) ──
function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload }

    case 'SET_PRODUCTOS':
      return { ...state, productos: action.data }

    case 'SET_CLIENTES':
      return { ...state, clientes: action.data }

    case 'SET_VENTAS':
      return { ...state, ventas: action.data }

    case 'SET_AUDITORIA':
      return { ...state, auditoria: action.data }

    case 'ADD_PRODUCTO':
      return { ...state, productos: [...state.productos, action.data] }

    case 'UPDATE_PRODUCTO':
      return {
        ...state,
        productos: state.productos.map(p =>
          p.id === action.data.id ? { ...p, ...action.data } : p
        ),
      }

    case 'DELETE_PRODUCTO':
      return { ...state, productos: state.productos.filter(p => p.id !== action.id) }

    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.data] }

    case 'ADD_VENTA': {
      // Descontar stock localmente
      const productos = state.productos.map(p => {
        const item = action.data.items.find(i => i.pid === p.id)
        return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p
      })
      // Actualizar totales del cliente
      const clientes = state.clientes.map(c =>
        c.id === action.data.clienteId
          ? { ...c, totalCompras: (c.totalCompras || 0) + action.data.total, numCompras: (c.numCompras || 0) + 1 }
          : c
      )
      return { ...state, ventas: [action.data, ...state.ventas], productos, clientes }
    }

    case 'ANULAR_VENTA': {
      const ventas = state.ventas.map(v =>
        v.id === action.id ? { ...v, estado: 'anulada' } : v
      )
      const venta = state.ventas.find(v => v.id === action.id)
      const productos = state.productos.map(p => {
        const item = (venta?.items || []).find(i => i.pid === p.id)
        return item ? { ...p, stock: p.stock + item.qty } : p
      })
      return { ...state, ventas, productos }
    }

    case 'ADD_AUDIT': {
      const entry = {
        id: Date.now(),
        user: state.config.adminName || 'Admin',
        accion: action.accion,
        tipo: action.tipo,
        detalle: action.detalle,
        fecha: new Date().toISOString(),
      }
      return { ...state, auditoria: [entry, ...state.auditoria].slice(0, 200) }
    }

    case 'GUARDAR_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } }

    default:
      return state
  }
}

// ── Provider ──────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, defaultState)

  // Cargar todos los datos desde MySQL al montar
  useEffect(() => {
    Promise.all([
      apiFetch('/productos'),
      apiFetch('/clientes'),
      apiFetch('/ventas'),
      apiFetch('/auditoria'),
    ])
      .then(([productos, clientes, ventas, auditoria]) => {
        dispatch({ type: 'LOAD', payload: { productos, clientes, ventas, auditoria } })
      })
      .catch(err => console.error('Error cargando datos desde MySQL:', err))
  }, [])

  // ── Acciones que llaman a la API y luego actualizan el estado ──

  async function guardarProducto(payload) {
    const { id, nombre, sku, categoria, precio, stock } = payload
    try {
      if (id) {
        await apiFetch(`/productos/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ nombre, sku, categoria, precio, stock }),
        })
        dispatch({ type: 'UPDATE_PRODUCTO', data: payload })
        registrarAudit('Actualizó', 'Product', `Editó producto: ${nombre}`)
      } else {
        const nuevo = await apiFetch('/productos', {
          method: 'POST',
          body: JSON.stringify({ nombre, sku, categoria, precio, stock }),
        })
        dispatch({ type: 'ADD_PRODUCTO', data: nuevo })
        registrarAudit('Creó', 'Product', `Creó producto: ${nombre}`)
      }
    } catch (e) {
      console.error('Error guardando producto:', e)
      alert('Error al guardar el producto')
    }
  }

  async function eliminarProducto(id, nombre) {
    try {
      await apiFetch(`/productos/${id}`, { method: 'DELETE' })
      dispatch({ type: 'DELETE_PRODUCTO', id })
      registrarAudit('Eliminó', 'Product', `Eliminó producto: ${nombre}`)
    } catch (e) {
      console.error('Error eliminando producto:', e)
      alert('Error al eliminar el producto')
    }
  }

  async function guardarCliente(payload) {
    try {
      const nuevo = await apiFetch('/clientes', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      dispatch({ type: 'ADD_CLIENTE', data: nuevo })
      registrarAudit('Creó', 'Client', `Creó cliente: ${payload.nombre}`)
    } catch (e) {
      console.error('Error guardando cliente:', e)
      alert('Error al guardar el cliente')
    }
  }

  async function registrarVenta(payload) {
    // payload: { items, clienteId, clienteNombre, pago }
    const { items, clienteId, clienteNombre, pago } = payload
    const total = items.reduce((s, i) => s + i.precio * i.qty, 0)
    try {
      const resultado = await apiFetch('/ventas', {
        method: 'POST',
        body: JSON.stringify({
          items,
          clienteId,
          clienteNombre,
          pago,
          total,
          iva: state.config.iva || 19,
        }),
      })
      const venta = {
        id: resultado.id,
        id_venta: resultado.id_venta,
        fecha: new Date().toISOString(),
        clienteId,
        clienteNombre,
        pago,
        items,
        total,
        estado: 'completada',
      }
      dispatch({ type: 'ADD_VENTA', data: venta })
      registrarAudit('Creó', 'Sale', `Registró venta ${resultado.id} por $${Math.round(total).toLocaleString('es-CO')}`)
      return venta
    } catch (e) {
      console.error('Error registrando venta:', e)
      alert('Error al registrar la venta')
    }
  }

  async function anularVenta(id, id_venta) {
    try {
      await apiFetch(`/ventas/${id_venta}/anular`, { method: 'PUT' })
      dispatch({ type: 'ANULAR_VENTA', id })
      registrarAudit('Anuló', 'Sale', `Anuló venta ${id}`)
    } catch (e) {
      console.error('Error anulando venta:', e)
      alert('Error al anular la venta')
    }
  }

  async function registrarAudit(accion, tipo, detalle) {
    dispatch({ type: 'ADD_AUDIT', accion, tipo, detalle })
    try {
      await apiFetch('/auditoria', {
        method: 'POST',
        body: JSON.stringify({ accion, tipo, detalle }),
      })
    } catch (e) {
      console.error('Error guardando auditoría:', e)
    }
  }

  function guardarConfig(payload) {
    dispatch({ type: 'GUARDAR_CONFIG', payload })
    registrarAudit('Actualizó', 'Company', 'Actualizó configuración de la empresa')
  }

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      // Acciones con API
      guardarProducto,
      eliminarProducto,
      guardarCliente,
      registrarVenta,
      anularVenta,
      registrarAudit,
      guardarConfig,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
