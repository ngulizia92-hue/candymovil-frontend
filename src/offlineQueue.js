const DB_NAME = 'candymovil-offline'
const DB_VERSION = 2
const STORE = 'pending-logs'
const ART_STORE = 'articulos-cache'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains(ART_STORE)) {
        db.createObjectStore(ART_STORE, { keyPath: 'sku' })
      }
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(req.error)
  })
}

export async function queueLog(data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).add({ ...data, queued_at: new Date().toISOString() })
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingLogs() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function deleteLog(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

export async function countPending() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// --- Caché de artículos para uso offline ---

export async function guardarArticulosCache(lista) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ART_STORE, 'readwrite')
    const store = tx.objectStore(ART_STORE)
    store.clear()
    lista.forEach(a => store.put(a))
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

export async function buscarArticulosLocal(q) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ART_STORE, 'readonly')
    const req = tx.objectStore(ART_STORE).getAll()
    req.onsuccess = () => {
      const query = q.toLowerCase()
      const matches = req.result.filter(a =>
        a.sku?.toLowerCase().includes(query) ||
        a.descripcion?.toLowerCase().includes(query)
      ).slice(0, 50)
      resolve(matches)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function buscarArticuloLocal(q) {
  const todos = await buscarArticulosLocal(q)
  const exacto = todos.find(a => a.sku?.toLowerCase() === q.toLowerCase())
  return exacto || todos[0] || null
}
