# Bizly — Sistema Integral de Gestión Comercial

Bizly es una plataforma web desarrollada para apoyar la transformación digital de microempresas, emprendimientos y pequeños negocios mediante la automatización de procesos administrativos y comerciales.

La aplicación permite centralizar la gestión de productos, inventario, ventas, clientes, reportes y estadísticas dentro de una única plataforma accesible desde cualquier dispositivo con conexión a internet.

## Problemática

Muchos pequeños negocios administran sus operaciones mediante registros manuales, hojas de cálculo o herramientas no integradas, lo que genera:

* Errores en el control de inventario.
* Pérdidas económicas.
* Duplicidad de información.
* Falta de trazabilidad.
* Dificultades para la toma de decisiones.

Bizly surge como una solución tecnológica que facilita la administración y el crecimiento de estos negocios.

## Objetivo General

Desarrollar una plataforma web integral para la gestión comercial y administrativa de microempresas, permitiendo automatizar procesos de inventario, ventas, clientes y generación de reportes.

## Funcionalidades Principales

* Gestión de productos.
* Control de inventario.
* Registro y seguimiento de ventas.
* Administración de clientes.
* Dashboard estadístico.
* Generación de reportes.
* Auditoría de cambios.
* Configuración del sistema.
* Gestión de usuarios y roles.
* Alertas de inventario.

## Tecnologías Utilizadas

### Frontend

* React
* JavaScript
* CSS3
* Vite

### Backend

* API REST
* Arquitectura Cliente-Servidor

### Base de Datos

* MySQL

### Herramientas

* Git
* GitHub
* Figma
* Visual Studio Code

---

## Requisitos

* Node.js 18 o superior
* npm 9 o superior

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

| Comando           | Descripción                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con hot reload |
| `npm run build`   | Build de producción en `/dist`        |
| `npm run preview` | Previsualiza el build de producción   |

## Estructura del proyecto

```text
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
    │   ├── Sidebar.jsx
    │   ├── Modal.jsx
    │   ├── Badge.jsx
    │   ├── BarChart.jsx
    │   └── DoughnutChart.jsx
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

Para restablecer toda la información:

```js
localStorage.removeItem('bizly-state')
```

## Notas Técnicas

* Estado global manejado con `useReducer` + Context API.
* Persistencia local mediante `localStorage`.
* Gráficas implementadas con Chart.js.
* Iconos mediante Tabler Icons.
* Navegación basada en estado interno.
* Arquitectura modular orientada a componentes.

## Metodología de Desarrollo

El proyecto fue desarrollado utilizando la metodología ágil Scrum, organizada en los siguientes sprints:

1. Levantamiento de requisitos.
2. Diseño UI/UX.
3. Gestión de usuarios.
4. Inventario.
5. Ventas.
6. Dashboard.
7. Reportes.
8. Pruebas e integración.

## Equipo de Desarrollo

* Hainer Alfredo Castellanos Martínez — Líder de Proyecto.
* Andrés Felipe Díaz Afanador — Diseñador UI/UX.
* Cristian David Ballén Contreras — Documentador y Tester.
* Jhoan Sebastián Agudelo Rodríguez — Desarrollador Backend.

## Licencia

Proyecto desarrollado como parte del programa de formación Análisis y Desarrollo de Software (ADSO) del Servicio Nacional de Aprendizaje (SENA).

