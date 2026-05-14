import { useState } from "react"
import { T } from "./theme"
import { buscarArticulo, agregarStockLog } from "./api"

const IcPin = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-8 8-13a8 8 0 1 0-16 0c0 5 8 13 8 13z"/><circle cx="12" cy="9" r="2.8"/>
  </svg>
)
const IcCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12l5 5L20 6"/>
  </svg>
)

export default function PantallaRelevamiento({ sesion, conteo, onChangeLocation }) {
  const [mode, setMode] = useState("sku")   // "sku" | "qty"
  const [skuValue, setSkuValue] = useState("")
  const [qtyValue, setQtyValue] = useState("")
  const [articulo, setArticulo] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [bloqueado, setBloqueado] = useState(false)
  const [error, setError] = useState("")

  async function handleBuscar() {
    if (!skuValue.trim()) return
    setBuscando(true); setNoEncontrado(false); setBloqueado(false); setError("")
    try {
      const art = await buscarArticulo(skuValue.trim())
      if (art) {
        setArticulo(art)
        if (art.bloqueado) { setBloqueado(true) }
        else { setMode("qty") }
      } else { setNoEncontrado(true) }
    } catch { setError("Error al buscar") }
    finally { setBuscando(false) }
  }

  async function handleConfirmar() {
    if (!articulo || !qtyValue || qtyValue === "0") return
    setGuardando(true)
    try {
      await agregarStockLog(sesion.ubicacion_id, articulo.sku, Number(qtyValue), sesion.vendedor)
      conteo.agregar()
      setSkuValue(""); setQtyValue(""); setArticulo(null); setNoEncontrado(false); setMode("sku")
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

      {/* Display fijo — misma altura siempre */}
      <div style={{ padding: "12px 18px 0", flexShrink: 0 }}>
        <div style={{
          background: T.card,
          border: noEncontrado ? "2px solid #ef4444" : bloqueado ? "2px solid #f59e0b" : mode === "qty" ? T.cardBorderStrong : T.cardBorder,
          borderRadius: 20, padding: "12px 16px",
          minHeight: 100,
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          {mode === "sku" ? (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", marginBottom: 6,
                color: noEncontrado ? "#ef4444" : bloqueado ? "#f59e0b" : T.primary }}>
                {noEncontrado ? "❌  SKU NO ENCONTRADO — INTENTÁ DE NUEVO"
                  : bloqueado ? "🔒  SKU BLOQUEADO — CONSULTÁ CON EL ADMIN"
                  : "SKU"}
              </div>
              <div style={{
                fontSize: 38, fontWeight: 800, fontFamily: T.brand, letterSpacing: "3px",
                color: bloqueado ? "#f59e0b" : skuValue ? T.ink : T.muted, lineHeight: 1,
              }}>
                {skuValue || <span style={{ fontSize: 24, letterSpacing: 1, fontWeight: 600 }}>· · · ·</span>}
              </div>
              {bloqueado && articulo && (
                <div style={{ fontSize: 11, color: "#92400e", fontWeight: 600, marginTop: 4 }}>
                  {articulo.descripcion}
                </div>
              )}
            </>
          ) : (
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
              <div style={{
                background: T.qtyBg, borderRadius: 12, padding: "6px 14px", flexShrink: 0, textAlign: "center",
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "1.5px", color: T.primary }}>UNIADES</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: T.brand, color: qtyValue ? T.ink : T.muted, lineHeight: 1 }}>
                  {qtyValue || "0"}
                </div>
              </div>
            </div>
          )}
        </div>
        {error && <div style={{ textAlign: "center", fontSize: 12, color: "#e53935", fontWeight: 600, marginTop: 6 }}>{error}</div>}
      </div>

      {/* Teclado — siempre en el mismo lugar */}
      <div style={{ flex: 1, padding: "10px 18px 12px", display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
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

        {/* Botón del del teclado numérico separado para no romper grid */}
        <button onClick={() => onKey("del")} style={{
          height: 44, borderRadius: 14, border: "none", cursor: "pointer",
          background: T.keySpecialBg, color: T.keySpecialInk,
          fontSize: 20, fontWeight: 800, fontFamily: T.brand, flexShrink: 0,
        }}>⌫</button>
      </div>
    </div>
  )
}
