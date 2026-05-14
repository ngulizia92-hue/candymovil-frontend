import { queueLog, guardarArticulosCache, buscarArticuloLocal, buscarArticulosLocal, queueObs } from './offlineQueue'

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function getUbicaciones() {
  const r = await fetch(`${BASE}/ubicaciones/`)
  return r.json()
}

// Descarga todos los artículos y los guarda en IndexedDB para uso offline
export async function syncArticulosCache() {
  if (!navigator.onLine) return
  try {
    const r = await fetch(`${BASE}/articulos/todos`)
    if (!r.ok) return
    const lista = await r.json()
    await guardarArticulosCache(lista)
  } catch {}
}

export async function buscarArticulo(q) {
  if (!navigator.onLine) return buscarArticuloLocal(q)
  try {
    const r = await fetch(`${BASE}/articulos/?q=${encodeURIComponent(q)}`)
    const data = await r.json()
    return data[0] || null
  } catch {
    return buscarArticuloLocal(q)
  }
}

export async function buscarArticulosPorNombre(q) {
  if (!navigator.onLine) return buscarArticulosLocal(q)
  try {
    const r = await fetch(`${BASE}/articulos/?q=${encodeURIComponent(q)}`)
    return r.json()
  } catch {
    return buscarArticulosLocal(q)
  }
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

export async function getStockLogHoy(operario, desde = null, hasta = null) {
  const params = new URLSearchParams({ operario })
  if (desde) params.set("desde", desde)
  if (hasta) params.set("hasta", hasta)
  const r = await fetch(`${BASE}/stock-log/?${params}`)
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

export async function crearObservacion(data) {
  if (!navigator.onLine) {
    await queueObs(data)
    return { offline: true, ...data }
  }
  try {
    const r = await fetch(`${BASE}/observaciones/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!r.ok) throw new Error('Error al guardar')
    return r.json()
  } catch (err) {
    if (err instanceof TypeError) {
      await queueObs(data)
      return { offline: true, ...data }
    }
    throw err
  }
}

export async function getObservaciones(operario) {
  const r = await fetch(`${BASE}/observaciones/?operario=${encodeURIComponent(operario)}`)
  if (!r.ok) throw new Error('Error')
  return r.json()
}

export async function resolverObservacion(id, por) {
  const r = await fetch(`${BASE}/observaciones/${id}/resolver?por=${encodeURIComponent(por)}`, {
    method: 'PATCH',
  })
  if (!r.ok) throw new Error('Error')
  return r.json()
}

export async function deleteObservacion(id, operario) {
  const r = await fetch(`${BASE}/observaciones/${id}?operario=${encodeURIComponent(operario)}`, {
    method: 'DELETE',
  })
  if (!r.ok) throw new Error('Error al eliminar')
  return r.json()
}
