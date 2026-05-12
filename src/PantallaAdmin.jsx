import { useState, useEffect, useMemo } from "react"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const T = "#00ACC1"   // turquesa principal
const TL = "#e0f7fa"  // turquesa claro

export default function PantallaAdmin() {
  const [seccion, setSeccion] = useState("relevamiento") // "relevamiento" | "vendedores"
  const [datos, setDatos] = useState([])
  const [tabActiva, setTabActiva] = useState(0)
  const [filtroCat, setFiltroCat] = useState("")
  const [filtroClasif, setFiltroClasif] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [soloRelevados, setSoloRelevados] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/admin/resumen`)
      .then(r => r.json())
      .then(d => { setDatos(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const ubicacion = datos[tabActiva]

  const categorias = useMemo(() => {
    if (!ubicacion) return []
    return [...new Set(ubicacion.lineas.map(l => l.categoria).filter(Boolean))].sort()
  }, [ubicacion])

  const clasificaciones = useMemo(() => {
    if (!ubicacion) return []
    return [...new Set(
      ubicacion.lineas.filter(l => !filtroCat || l.categoria === filtroCat)
        .map(l => l.clasificacion).filter(Boolean)
    )].sort()
  }, [ubicacion, filtroCat])

  const lineasFiltradas = useMemo(() => {
    if (!ubicacion) return []
    return ubicacion.lineas.filter(l => {
      if (soloRelevados && !l.relevado) return false
      if (filtroCat && l.categoria !== filtroCat) return false
      if (filtroClasif && l.clasificacion !== filtroClasif) return false
      if (busqueda) {
        const q = busqueda.toLowerCase()
        if (!l.sku.toLowerCase().includes(q) && !l.descripcion.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [ubicacion, filtroCat, filtroClasif, busqueda, soloRelevados])

  const totalRelevados = useMemo(() => ubicacion?.lineas.filter(l => l.relevado).length || 0, [ubicacion])

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "white" }}>
      <span style={{ color: "#9ca3af", fontSize: 14 }}>Cargando relevamientos...</span>
    </div>
  )

  if (seccion === "vendedores") return <SeccionVendedores setSeccion={setSeccion} seccion={seccion} />

  return (
    <div style={{ minHeight: "100vh", background: "white", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Top nav */}
      <div style={{ background: "#1a1f2e", padding: "0 32px", height: 52, display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>🍬 CandyMovil</span>
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {[["relevamiento", "Relevamientos"], ["vendedores", "Vendedores"]].map(([id, label]) => (
            <button key={id} onClick={() => setSeccion(id)} style={{
              padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: seccion === id ? T : "transparent",
              color: seccion === id ? "white" : "#9ca3af",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: "32px 40px 0" }}>

        {/* Título */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>Relevamiento de Stock</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
            {ubicacion?.lineas.length || 0} SKUs · {totalRelevados} relevados
            {ubicacion?.fecha && ` · Último: ${new Date(ubicacion.fecha).toLocaleString("es-AR")} — Vendedor ${ubicacion.operario}`}
          </p>
        </div>

        {/* Tabs ubicaciones — igual estilo que CandyPanel */}
        <div style={{ borderBottom: "1px solid #e5e7eb", display: "flex", gap: 0, marginBottom: 0 }}>
          {datos.map((d, i) => (
            <button key={d.ubicacion_id}
              onClick={() => { setTabActiva(i); setFiltroCat(""); setFiltroClasif(""); setBusqueda(""); setSoloRelevados(false) }}
              style={{
                padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
                background: "none", border: "none",
                borderBottom: tabActiva === i ? `3px solid ${T}` : "3px solid transparent",
                color: tabActiva === i ? T : "#6b7280",
                marginBottom: -1,
              }}
            >
              {d.ubicacion}
            </button>
          ))}
        </div>


        {/* Buscador + contador */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" placeholder="Buscar SKU, nombre..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{
                paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                fontSize: 14, border: "1px solid #e5e7eb", borderRadius: 8,
                outline: "none", width: 280, color: "#111827",
              }}
              onFocus={e => e.target.style.borderColor = T}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select
              value={filtroCat}
              onChange={e => { setFiltroCat(e.target.value); setFiltroClasif("") }}
              style={{ padding: "7px 12px", fontSize: 13, border: "1px solid #e5e7eb", borderRadius: 8, color: filtroCat ? "#111827" : "#9ca3af", outline: "none", cursor: "pointer" }}
              onFocus={e => e.target.style.borderColor = T}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            >
              <option value="">Categoría</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filtroClasif}
              onChange={e => setFiltroClasif(e.target.value)}
              style={{ padding: "7px 12px", fontSize: 13, border: "1px solid #e5e7eb", borderRadius: 8, color: filtroClasif ? "#111827" : "#9ca3af", outline: "none", cursor: "pointer" }}
              onFocus={e => e.target.style.borderColor = T}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            >
              <option value="">Clasificación</option>
              {clasificaciones.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => setSoloRelevados(!soloRelevados)}
              style={{
                padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: "pointer",
                background: soloRelevados ? T : "white",
                border: `1px solid ${soloRelevados ? T : "#e5e7eb"}`,
                color: soloRelevados ? "white" : "#6b7280",
              }}
            >
              Solo relevados
            </button>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>{lineasFiltradas.length} productos</span>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
              <th style={{ textAlign: "left", padding: "12px 40px 12px 40px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>SKU</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nombre</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>Categoría</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>Clasificación</th>
              <th style={{ textAlign: "right", padding: "12px 40px 12px 16px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>Unidades</th>
            </tr>
          </thead>
          <tbody>
            {lineasFiltradas.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "80px", color: "#9ca3af", fontSize: 14 }}>Sin resultados</td></tr>
            ) : lineasFiltradas.map((l, i) => (
              <tr key={l.sku} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "11px 40px", fontFamily: "monospace", fontSize: 13, color: "#374151", fontWeight: 500 }}>{l.sku}</td>
                <td style={{ padding: "11px 16px", color: l.relevado ? T : "#111827", fontWeight: l.relevado ? 600 : 400 }}>{l.descripcion}</td>
                <td style={{ padding: "11px 16px", color: "#6b7280" }}>{l.categoria}</td>
                <td style={{ padding: "11px 16px", color: "#6b7280" }}>{l.clasificacion}</td>
                <td style={{ padding: "11px 40px 11px 16px", textAlign: "right", fontWeight: 700, color: l.relevado ? T : "#d1d5db", fontSize: l.relevado ? 15 : 13 }}>
                  {l.relevado ? l.total : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "2px solid #f3f4f6", background: "#fafafa" }}>
              <td colSpan={4} style={{ padding: "12px 40px", fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
                {lineasFiltradas.length} artículos · {lineasFiltradas.filter(l => l.relevado).length} relevados
              </td>
              <td style={{ padding: "12px 40px 12px 16px", textAlign: "right", fontWeight: 700, color: T, fontSize: 15 }}>
                {lineasFiltradas.filter(l => l.relevado).reduce((s, l) => s + l.total, 0).toLocaleString("es-AR")} u.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function SeccionVendedores({ seccion, setSeccion }) {
  const [vendedores, setVendedores] = useState([])
  const [numero, setNumero] = useState("")
  const [nombre, setNombre] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    fetch(`${API}/vendedores/`).then(r => r.json()).then(setVendedores).catch(() => {})
  }, [])

  async function handleCrear(e) {
    e.preventDefault()
    if (!numero.trim() || !nombre.trim() || !pin.trim()) { setError("Completá todos los campos"); return }
    setGuardando(true); setError("")
    try {
      const r = await fetch(`${API}/vendedores/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: numero.trim(), nombre: nombre.trim(), pin: pin.trim() }),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.detail || "Error") }
      const v = await r.json()
      setVendedores(prev => [...prev, v])
      setNumero(""); setNombre(""); setPin("")
    } catch (err) { setError(err.message) }
    finally { setGuardando(false) }
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Dar de baja este vendedor?")) return
    await fetch(`${API}/vendedores/${id}`, { method: "DELETE" })
    setVendedores(prev => prev.filter(v => v.id !== id))
  }

  return (
    <div style={{ minHeight: "100vh", background: "white", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Top nav */}
      <div style={{ background: "#1a1f2e", padding: "0 32px", height: 52, display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>🍬 CandyMovil</span>
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {[["relevamiento", "Relevamientos"], ["vendedores", "Vendedores"]].map(([id, label]) => (
            <button key={id} onClick={() => setSeccion(id)} style={{
              padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: seccion === id ? T : "transparent",
              color: seccion === id ? "white" : "#9ca3af",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: 800 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Vendedores</h1>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 32 }}>Alta y baja de operarios que usan CandyMóvil</p>

        {/* Formulario */}
        <form onSubmit={handleCrear} style={{
          background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12,
          padding: "24px", marginBottom: 32,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T, letterSpacing: "0.05em", marginBottom: 16, textTransform: "uppercase" }}>
            Nuevo vendedor
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 120 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Número</label>
              <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ej: 22"
                style={inputStyle} onFocus={e => e.target.style.borderColor = T} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Nombre completo</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: María García"
                style={inputStyle} onFocus={e => e.target.style.borderColor = T} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>PIN</label>
              <input value={pin} onChange={e => setPin(e.target.value)} placeholder="Ej: 1234" type="password"
                style={inputStyle} onFocus={e => e.target.style.borderColor = T} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <button type="submit" disabled={guardando} style={{
                height: 38, padding: "0 20px", borderRadius: 8, border: "none", cursor: "pointer",
                background: T, color: "white", fontSize: 13, fontWeight: 700,
                opacity: guardando ? 0.6 : 1,
              }}>{guardando ? "Guardando..." : "Dar de alta"}</button>
            </div>
          </div>
          {error && <p style={{ margin: "10px 0 0", fontSize: 13, color: "#e53935" }}>{error}</p>}
        </form>

        {/* Tabla */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
              {["#", "Número", "Nombre", ""].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "10px 16px", fontSize: 12, fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendedores.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>No hay vendedores dados de alta</td></tr>
            ) : vendedores.map((v, i) => (
              <tr key={v.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "11px 16px", color: "#9ca3af", fontSize: 13 }}>{i + 1}</td>
                <td style={{ padding: "11px 16px", fontFamily: "monospace", fontWeight: 700, color: T }}>{v.numero}</td>
                <td style={{ padding: "11px 16px", color: "#111827" }}>{v.nombre}</td>
                <td style={{ padding: "11px 16px", textAlign: "right" }}>
                  <button onClick={() => handleEliminar(v.id)} style={{
                    padding: "5px 14px", borderRadius: 6, border: "1px solid #fecaca",
                    background: "white", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>Dar de baja</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const inputStyle = {
  height: 38, padding: "0 12px", borderRadius: 8,
  border: "1px solid #e5e7eb", fontSize: 14, outline: "none",
  background: "white", color: "#111827",
}
