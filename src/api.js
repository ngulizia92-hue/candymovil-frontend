import { queueLog } from './offlineQueue'

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
  const data = { ubicacion_id, sku, cantidad, operario }

  // Sin conexión → encolar y devolver éxito simulado
  if (!navigator.onLine) {
    await queueLog(data)
    return { offline: true, sku, cantidad }
  }

  try {
    const r = await fetch(`${BASE}/stock-log/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!r.ok) throw new Error("Error al guardar")
    return r.json()
  } catch (err) {
    // Falla de red aunque navigator.onLine diga que hay conexión
    if (err instanceof TypeError) {
      await queueLog(data)
      return { offline: true, sku, cantidad }
    }
    throw err
  }
}

export async function getStockLogHoy(operario) {
  const r = await fetch(`${BASE}/stock-log/?operario=${encodeURIComponent(operario)}`)
  if (!r.ok) throw new Error("Error al obtener historial")
  return r.json()
}

export async function deleteStockLog(id, operario) {
  const r = await fetch(`${BASE}/stock-log/${id}?operario=${encodeURIComponent(operario)}`, {
    method: "DELETE",
  })
  if (!r.ok) throw new Error("Error al eliminar")
  return r.json()
}
