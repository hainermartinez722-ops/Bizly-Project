export function fmtCOP(n) {
  return '$ ' + Math.round(n).toLocaleString('es-CO')
}

export function fmtDate(d) {
  return new Date(d).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function genId(prefix) {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return (
    prefix +
    '-' +
    now.getFullYear().toString().slice(2) +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    Math.floor(Math.random() * 100)
  )
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function exportarCSV(ventas) {
  const rows = [['# Venta', 'Fecha', 'Cliente', 'Pago', 'Total', 'Estado']]
  ventas.forEach((v) =>
    rows.push([v.id, fmtDate(v.fecha), v.clienteNombre, v.pago, v.total, v.estado])
  )
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'ventas.csv'
  a.click()
}
