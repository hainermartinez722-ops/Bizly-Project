# Bizly — Sistema de Gestión

Aplicación React + Vite para gestión de tienda/minimercado.  
Módulos: Dashboard, Ventas, Inventario, Clientes, Reportes, Auditoría y Configuración.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalación

```bash
# 1. Entra a la carpeta del proyecto
cd bizly

# 2. Instala dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

Abre http://localhost:5173 en el navegador.

## Scripts disponibles

| Comando         | Descripción                            |
|-----------------|----------------------------------------|
| `npm run dev`   | Servidor de desarrollo con hot reload  |
| `npm run build` | Build de producción en `/dist`         |
| `npm run preview` | Previsualiza el build de producción  |

## Estructura del proyecto

```
bizly/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # Punto de entrada
    ├── App.jsx               # Componente raíz + routing
    ├── index.css             # Estilos globales
    ├── context/
    │   └── AppContext.jsx    # Estado global (useReducer)
    ├── services/
    │   ├── storage.js        # Persistencia con localStorage
    │   └── utils.js          # fmtCOP, fmtDate, genId, exportarCSV
    ├── data/
    │   └── defaultState.js   # Estado inicial vacío
    ├── components/
    │   ├── Sidebar.jsx       # Navegación lateral
    │   ├── Modal.jsx         # Modal reutilizable
    │   ├── Badge.jsx         # Badge de estado
    │   ├── BarChart.jsx      # Gráfica de barras (Chart.js)
    │   └── DoughnutChart.jsx # Gráfica donut (Chart.js)
    └── pages/
        ├── Dashboard.jsx
        ├── Ventas.jsx
        ├── Inventario.jsx
        ├── Clientes.jsx
        ├── Reportes.jsx
        ├── Auditoria.jsx
        └── Configuracion.jsx
```

## Datos

Los datos se guardan automáticamente en `localStorage` bajo la clave `bizly-state`.  
Para resetear todo, ejecuta en la consola del navegador:

```js
localStorage.removeItem('bizly-state')
```

## Notas técnicas

- Estado global manejado con `useReducer` + Context API (sin librerías externas)
- Gráficas con Chart.js registradas por módulo (tree-shakeable)
- Iconos: Tabler Icons via CDN (sin instalación)
- Sin dependencias de routing — navegación por estado interno
