import { useState, useEffect, useRef } from "react"
import { T } from "./theme"
import { buscarArticulo, agregarStockLog, buscarArticulosPorNombre } from "./api"

const IcPin = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-8 8-13a8 8 0 1 0-16 0c0 5 8 13 8 13z"/><circle cx="12" cy="9" r="2.8"/>
  </svg>
)

export default function PantallaRelevamiento({ sesion, conteo, onChangeLocation }) {
  const [mode, setMode] = useState("sku")        // "sku" | "qty"
  const [busquedaTipo, setBusquedaTipo] = useState("sku") // "sku" | "nombre"

  // SKU mode
  const [skuValue, setSkuValue] = useState("")
  const [buscando, setBuscando] = useState(false)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [bloqueado, setBloqueado] = useState(false)

  // Nombre mode
  const [nombreQuery, setNombreQuery] = useState("")
  const [resultados, setResultados] = useState([])
  const [buscandoNombre, setBuscandoNombre] = useState(false)
  const nombreInputRef = useRef(null)
  const searchTimer = useRef(null)

  // Cantidad
  const [qtyValue, setQtyValue] = useState("")
  const [guardando, setGuardando] = useState(false)

  // Artículo seleccionado
  const [articulo, setArticulo] = useState(null)
  const [error, setError] = useState("")

  // Búsqueda por nombre con debounce
  useEffect(() => {
    if (busquedaTipo !== "nombre" || mode !== "sku") return
    clearTimeout(searchTimer.current)
    if (!nombreQuery.trim()) { setResultados([]); return }
    setBuscandoNombre(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const data = await buscarArticulosPorNombre(nombreQuery.trim())
        setResultados(data)
      } catch {}
      finally { setBuscandoNombre(false) }
    }, 350)
  }, [nombreQuery, busquedaTipo, mode])

  // Focus en el input cuando cambia a modo nombre
  useEffect(() => {
    if (busquedaTipo === "nombre" && mode === "sku") {
      setTimeout(() => nombreInputRef.current?.focus(), 100)
    }
  }, [busquedaTipo, mode])

  function seleccionarArticulo(art) {
    setArticulo(art)
    setNombreQuery("")
    setResultados([])
    if (art.bloqueado) { setBloqueado(true) }
    else { setMode("qty") }
  }

  async function handleBuscar() {
    if (!skuValue.trim()) return
    setBuscando(true); setNoEncontrado(false); setBloqueado(false); setError("")
    try {
      const art = await buscarArticulo(skuValue.trim())
      if (art) { seleccionarArticulo(art) }
      else { setNoEncontrado(true) }
    } catch { setError("Error al buscar") }
    finally { setBuscando(false) }
  }

  async function handleConfirmar() {
    if (!articulo || !qtyValue || qtyValue === "0") return
    setGuardando(true)
    try {
      await agregarStockLog(sesion.ubicacion_id, articulo.sku, Number(qtyValue), sesion.vendedor)
      conteo.agregar()
      setSkuValue(""); setQtyValue(""); setArticulo(null)
      setNoEncontrado(false); setBloqueado(false); setMode("sku")
    } catch { setError("Error al guardar") }
    finally { setGuardando(false) }
  }

  function resetSku() {
    setSkuValue(""); setNoEncontrado(false); setBloqueado(false); setArticulo(null)
  }

  function onKey(k) {
    if (mode === "sku") {
      if (k === "del") { setSkuValue(v => v.slice(0, -1)); setNoEncontrado(false); setBloqueado(false) }
      else if (k === "clr") resetSku()
      else if (k === "ok") handleBuscar()
      else if (skuValue.length < 12) setSkuValue(v => v + k)
    } else {
      if (k === "del") setQtyValue(v => v.slice(0, -1))
      else if (k === "clr") { setQtyValue(""); setSkuValue(""); setArticulo(null); setMode("sku") }
      else if (k === "ok") handleConfirmar()
      else if (qtyValue.length < 4) setQtyValue(v => (v + k).replace(/^0+(?=\d)/, ""))
    }
  }

  function cambiarTipo(tipo) {
    setBusquedaTipo(tipo)
    resetSku()
    setNombreQuery("")
    setResultados([])
    setBloqueado(false)
  }

  const canConfirm = articulo && qtyValue && qtyValue !== "0" && !guardando

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{
        background: T.header, color: T.headerInk,
        padding: "10px 20px 18px", borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        position: "relative", overflow: "hidden", flexShrink: 0,
      }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 130, height: 130, borderRadius: "50%", background: T.headerDecor }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: T.avatarBg, color: T.avatarInk,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 14, fontFamily: T.brand, border: T.avatarBorder, flexShrink: 0,
              }}>#{sesion.vendedor}</div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "2px", fontWeight: 800, opacity: 0.85 }}>VENDEDOR</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: T.brand, letterSpacing: "-0.4px", lineHeight: 1 }}>Relevamiento</div>
              </div>
            </div>
            <div style={{
              background: T.accent, color: T.accentInk,
              borderRadius: 999, padding: "6px 14px", fontWeight: 800, fontSize: 13, fontFamily: T.brand,
            }}>{conteo.total} items</div>
          </div>

          <button onClick={onChangeLocation} style={{
            width: "100%", cursor: "pointer",
            background: "rgba(255,255,255,0.96)", border: "none", borderRadius: 20,
            padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
            textAlign: "left", boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: T.skuBg, color: T.primary,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}><IcPin s={22} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "1.8px", color: T.primary }}>UBICACIÓN ACTUAL</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, fontFamily: T.brand, letterSpacing: "-0.4px" }}>{sesion.ubicacion}</div>
            </div>
            <div style={{ color: T.primary, fontWeight: 800, fontSize: 11, letterSpacing: "1.2px", background: T.skuBg, padding: "5px 10px", borderRadius: 999, flexShrink: 0 }}>CAMBIAR</div>
          </button>
        </div>
      </div>

      {/* Display */}
      <div style={{ padding: "12px 18px 0", flexShrink: 0 }}>
        <div style={{
          background: T.card,
          border: noEncontrado ? "2px solid #ef4444" : bloqueado ? "2px solid #f59e0b" : mode === "qty" ? T.cardBorderStrong : T.cardBorder,
          borderRadius: 20, padding: "12px 16px", minHeight: 100,
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          {mode === "qty" ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: T.skuBg, color: T.primary,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "1px", opacity: 0.7 }}>SKU</div>
                <div style={{ fontSize: 13, fontWeight: 800, fontFamily: T.brand }}>{articulo.sku}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", color: T.primary, textTransform: "uppercase" }}>
                  {articulo.categoria || articulo.familia || ""}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: T.brand, lineHeight: 1.25 }}>{articulo.descripcion}</div>
              </div>
              <div style={{ background: T.qtyBg, borderRadius: 12, padding: "6px 14px", flexShrink: 0, textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "1.5px", color: T.primary }}>UNIDADES</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: T.brand, color: qtyValue ? T.ink : T.muted, lineHeight: 1 }}>
                  {qtyValue || "0"}
                </div>
              </div>
            </div>
          ) : bloqueado && articulo ? (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: "#f59e0b", marginBottom: 6 }}>
                🔒  SKU BLOQUEADO — CONSULTÁ CON EL ADMIN
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#92400e" }}>{articulo.descripcion}</div>
              <div style={{ fontSize: 12, color: "#b45309", marginTop: 2 }}>SKU {articulo.sku}</div>
            </>
          ) : busquedaTipo === "sku" ? (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: noEncontrado ? "#ef4444" : T.primary, marginBottom: 6 }}>
                {noEncontrado ? "❌  SKU NO ENCONTRADO — INTENTÁ DE NUEVO" : "SKU"}
              </div>
              <div style={{ fontSize: 38, fontWeight: 800, fontFamily: T.brand, letterSpacing: "3px", color: skuValue ? T.ink : T.muted, lineHeight: 1 }}>
                {skuValue || <span style={{ fontSize: 24, letterSpacing: 1, fontWeight: 600 }}>· · · ·</span>}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: T.primary, marginBottom: 8 }}>NOMBRE DEL ARTÍCULO</div>
              <div style={{ fontSize: 14, color: T.muted, fontWeight: 500 }}>Escribí abajo para buscar</div>
            </>
          )}
        </div>
        {error && <div style={{ textAlign: "center", fontSize: 12, color: "#e53935", fontWeight: 600, marginTop: 6 }}>{error}</div>}
      </div>

      {/* Toggle SKU / NOMBRE — solo cuando estamos eligiendo artículo */}
      {mode === "sku" && (
        <div style={{ padding: "10px 18px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", background: T.keypadBg, borderRadius: 14, padding: 4, gap: 4 }}>
            {[["sku", "# SKU"], ["nombre", "🔍 Nombre"]].map(([tipo, label]) => (
              <button key={tipo} onClick={() => cambiarTipo(tipo)} style={{
                flex: 1, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 13, fontFamily: T.brand,
                background: busquedaTipo === tipo ? T.primary : "transparent",
                color: busquedaTipo === tipo ? "#fff" : T.muted,
                transition: "all .15s",
              }}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Contenido del teclado */}
      <div style={{ flex: 1, padding: "8px 18px 12px", display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>

        {/* MODO NOMBRE: input + resultados */}
        {mode === "sku" && busquedaTipo === "nombre" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
            <div style={{ background: T.keypadBg, borderRadius: 18, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{ fontSize: 18 }}>🔍</span>
              <input
                ref={nombreInputRef}
                type="text"
                value={nombreQuery}
                onChange={e => setNombreQuery(e.target.value)}
                placeholder="Escribí el nombre del artículo..."
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: 15, fontWeight: 600, color: T.ink,
                  fontFamily: T.brand,
                }}
              />
              {nombreQuery && (
                <button onClick={() => { setNombreQuery(""); setResultados([]) }} style={{
                  background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 18, padding: 0,
                }}>✕</button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {buscandoNombre ? (
                <div style={{ textAlign: "center", padding: 24, color: T.muted, fontSize: 13 }}>Buscando...</div>
              ) : nombreQuery && resultados.length === 0 ? (
                <div style={{ textAlign: "center", padding: 24, color: T.muted, fontSize: 13 }}>Sin resultados</div>
              ) : resultados.map(art => (
                <button key={art.sku} onClick={() => seleccionarArticulo(art)} style={{
                  background: art.bloqueado ? "#fffbeb" : T.card,
                  border: art.bloqueado ? "1px solid #fde68a" : T.cardBorder,
                  borderRadius: 16, padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 10,
                  textAlign: "left", cursor: "pointer", width: "100%",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: art.bloqueado ? "#fef9c3" : T.skuBg,
                    color: art.bloqueado ? "#92400e" : T.primary,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 7, fontWeight: 700 }}>SKU</div>
                    <div style={{ fontSize: 11, fontWeight: 800, fontFamily: T.brand }}>{art.sku}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {art.descripcion}
                    </div>
                    <div style={{ fontSize: 11, color: T.muted }}>{art.categoria || art.familia || ""}</div>
                  </div>
                  {art.bloqueado && <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>}
                </button>
              ))}
            </div>
          </div>

        ) : (
          /* MODO SKU o CANTIDAD: teclado numérico */
          <>
            <div style={{
              flex: 1, display: "grid", gridTemplateRows: "repeat(4, 1fr)", gap: 8,
              background: T.keypadBg, padding: 10, borderRadius: 22,
            }}>
              {[["1","2","3"],["4","5","6"],["7","8","9"],["clr","0","ok"]].map((row, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {row.map(k => {
                    const isOk = k === "ok"
                    const isClr = k === "clr"
                    const okDisabled = isOk && (
                      (mode === "sku" && (buscando || !skuValue)) ||
                      (mode === "qty" && !canConfirm)
                    )
                    const bg = isOk
                      ? (okDisabled ? T.disabledBg : mode === "sku" ? T.primary : T.accent)
                      : isClr ? T.keySpecialBg : T.keyBg
                    const color = isOk
                      ? (okDisabled ? T.disabledInk : mode === "sku" ? T.primaryInk : T.accentInk)
                      : isClr ? T.keySpecialInk : T.ink
                    const label = isClr ? "C" : isOk
                      ? (mode === "sku" ? (buscando ? "·" : "IR") : (guardando ? "·" : "✓"))
                      : k

                    return (
                      <button key={k} onClick={() => !okDisabled && onKey(k)} style={{
                        borderRadius: 14, border: "none",
                        cursor: okDisabled ? "default" : "pointer",
                        background: bg, color,
                        fontSize: isOk ? 15 : isClr ? 17 : 24,
                        fontWeight: 800, fontFamily: T.brand,
                        opacity: okDisabled ? 0.4 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{label}</button>
                    )
                  })}
                </div>
              ))}
            </div>
            <button onClick={() => onKey("del")} style={{
              height: 44, borderRadius: 14, border: "none", cursor: "pointer",
              background: T.keySpecialBg, color: T.keySpecialInk,
              fontSize: 20, fontWeight: 800, fontFamily: T.brand, flexShrink: 0,
            }}>⌫</button>
          </>
        )}
      </div>
    </div>
  )
}
