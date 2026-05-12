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

export async function crearRelevamiento(ubicacion_id, operario) {
  const r = await fetch(`${BASE}/relevamiento/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ubicacion_id, operario }),
  })
  return r.json()
}

export async function agregarLinea(relevamiento_id, sku, cantidad) {
  const r = await fetch(`${BASE}/relevamiento/${relevamiento_id}/lineas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sku, cantidad }),
  })
  return r.json()
}

export async function getLineas(relevamiento_id) {
  const r = await fetch(`${BASE}/relevamiento/${relevamiento_id}/lineas`)
  return r.json()
}

export async function finalizarRelevamiento(relevamiento_id) {
  const r = await fetch(`${BASE}/relevamiento/${relevamiento_id}/finalizar`, {
    method: "PUT",
  })
  return r.json()
}
