const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function getUbicaciones() {
  const r = await fetch(`${BASE}/ubicaciones/`)
  return r.json()
}

export async function buscarArticulo(sku) {
  const r = await fetch(`${BASE}/articulos/?q=${encodeURIComponent(sku)}`)
  const data = await r.json()
  return data[0] || null
}

export async function agregarStockLog(ubicacion_id, sku, cantidad, operario) {
  const r = await fetch(`${BASE}/stock-log/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ubicacion_id, sku, cantidad, operario }),
  })
  if (!r.ok) throw new Error("Error al guardar")
  return r.json()
}
