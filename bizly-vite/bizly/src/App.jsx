import { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Ventas from './pages/Ventas'
import Inventario from './pages/Inventario'
import Clientes from './pages/Clientes'
import Reportes from './pages/Reportes'
import Auditoria from './pages/Auditoria'
import Configuracion from './pages/Configuracion'
import Login from './pages/Login'
import Registro from './pages/Registro'
import RecuperarPassword from './pages/RecuperarPassword'

const PAGES = {
  dashboard:     Dashboard,
  ventas:        Ventas,
  inventario:    Inventario,
  clientes:      Clientes,
  reportes:      Reportes,
  auditoria:     Auditoria,
  configuracion: Configuracion,
}

const ADMIN_ONLY_PAGES = ['auditoria', 'configuracion']

function Shell({ usuario, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard')
  const esAdmin = usuario?.rol === 'admin'

  // Si un empleado intenta entrar a una página solo-admin, redirigir al dashboard
  const pageSegura = ADMIN_ONLY_PAGES.includes(activePage) && !esAdmin ? 'dashboard' : activePage
  const PageComponent = PAGES[pageSegura] || Dashboard

  return (
    <div className="app-shell">
      <Sidebar activePage={pageSegura} onNav={setActivePage} usuario={usuario} onLogout={onLogout} />
      <main className="main-content">
        <PageComponent onNav={setActivePage} usuario={usuario} />
      </main>
    </div>
  )
}

export default function App() {
  const [auth, setAuth]         = useState(null)  // { token, usuario }
  const [pantalla, setPantalla] = useState('login') // 'login' | 'registro' | 'recuperar'

  // Al montar, verificar si hay sesión guardada
  useEffect(() => {
    const token   = localStorage.getItem('bizly_token')
    const usuario = localStorage.getItem('bizly_usuario')
    if (token && usuario) {
      setAuth({ token, usuario: JSON.parse(usuario) })
    }
  }, [])

  function handleLogin(token, usuario) {
    localStorage.setItem('bizly_token', token)
    localStorage.setItem('bizly_usuario', JSON.stringify(usuario))
    setAuth({ token, usuario })
  }

  function handleLogout() {
    localStorage.removeItem('bizly_token')
    localStorage.removeItem('bizly_usuario')
    setAuth(null)
    setPantalla('login')
  }

  // Si está autenticado → mostrar el sistema
  if (auth) {
    return (
      <AppProvider usuario={auth.usuario}>
        <Shell usuario={auth.usuario} onLogout={handleLogout} />
      </AppProvider>
    )
  }

  // Si no → mostrar pantallas de auth
  if (pantalla === 'registro') {
    return <Registro onLogin={handleLogin} onIrLogin={() => setPantalla('login')} />
  }
  if (pantalla === 'recuperar') {
    return <RecuperarPassword onIrLogin={() => setPantalla('login')} />
  }
  return (
    <Login
      onLogin={handleLogin}
      onIrRegistro={() => setPantalla('registro')}
      onIrRecuperar={() => setPantalla('recuperar')}
    />
  )
}