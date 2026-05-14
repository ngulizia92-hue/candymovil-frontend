import { useState, useEffect, useCallback } from 'react'
import { getPendingLogs, deleteLog, countPending } from './offlineQueue'
import { syncArticulosCache } from './api'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useSync() {
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const refreshCount = useCallback(async () => {
    try { setPendingCount(await countPending()) } catch {}
  }, [])

  const sync = useCallback(async () => {
    const pending = await getPendingLogs()
    if (pending.length === 0) return 0
    setSyncing(true)
    let synced = 0
    for (const item of pending) {
      try {
        const r = await fetch(`${BASE}/stock-log/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ubicacion_id: item.ubicacion_id,
            sku: item.sku,
            cantidad: item.cantidad,
            operario: item.operario,
          }),
        })
        if (r.ok) { await deleteLog(item.id); synced++ }
      } catch { break } // si falla uno, para — probablemente sin red todavía
    }
    setSyncing(false)
    await refreshCount()
    return synced
  }, [refreshCount])

  // Cargar count inicial + cachear artículos
  useEffect(() => {
    refreshCount()
    syncArticulosCache()
  }, [refreshCount])

  // Detectar cambios de conectividad
  useEffect(() => {
    const goOnline = async () => { setIsOnline(true); await sync(); syncArticulosCache() }
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [sync])

  return { pendingCount, syncing, isOnline, sync, refreshCount }
}
