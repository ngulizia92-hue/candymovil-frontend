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

function HeaderBlock({ children }) {
  return (
    <div style={{
      background: T.header, color: T.headerInk,
      padding: "10px 20px 20px", borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{ position: "absolute", top: -40, right: -30, width: 130, height: 130, borderRadius: "50%", background: T.headerDecor }} />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  )
}

export default function PantallaRelevamiento({ sesion, conteo, onChangeLocation }) {
  // mode: "sku" → construyendo SKU | "qty" → construyendo cantidad
  const [mode, setMode] = useState("sku")
  const [skuValue, setSkuValue] = useState("")
  const [qtyValue, setQtyValue] = useState("")
  const [articulo, setArticulo] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [error, setError] = useState("")

  async function handleBuscar() {
    if (!skuValue.trim()) return
    setBuscando(true); setArticulo(null); setNoEncontrado(false); setError("")
    try {
      const art = await buscarArticulo(skuValue.trim())
      if (art) { setArticulo(art); setMode("qty") }
      else setNoEncontrado(true)
    } catch { setError("Error al buscar") }
    finally { setBuscando(false) }
  }

  async function handleConfirmar() {
    if (!articulo || !qtyValue || qtyValue === "0") return
    setGuardando(true)
    try {
      await agregarStockLog(sesion.ubicacion_id, articulo.sku, Number(qtyValue), sesion.vendedor)
      conteo.agregar()
      // reset para siguiente SKU
      setSkuValue(""); setQtyValue(""); setArticulo(null); setNoEncontrado(false); setMode("sku")
    } catch { setError("Error al guardar") }
    finally { setGuardando(false) }
  }

  function onKey(k) {
    if (mode === "sku") {
      if (k === "del") { setSkuValue(v => v.slice(0, -1)); setNoEncontrado(false) }
      else if (k === "clr") { setSkuValue(""); setNoEncontrado(false) }
      else if (k === "ok") handleBuscar()
      else if (skuValue.length < 12) setSkuValue(v => v + k)
    } else {
      if (k === "del") setQtyValue(v => v.slice(0, -1))
      else if (k === "clr") { setQtyValue(""); setArticulo(null); setMode("sku") }
      else if (k === "ok") handleConfirmar()
      else if (qtyValue.length < 4) setQtyValue(v => (v + k).replace(/^0+(?=\d)/, ""))
    }
  }

  const canConfirm = articulo && qtyValue && qtyValue !== "0" && !guardando

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HeaderBlock>
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

        {/* Location card */}
        <button onClick={onChangeLocation} style={{
          width: "100%", cursor: "pointer",
          background: "rgba(255,255,255,0.96)", border: "none", borderRadius: 20,
          padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
          textAlign: "left", boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: T.skuBg, color: T.primary,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}><IcPin s={24} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.18)", display: "inline-block" }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.8px", color: T.primary }}>UBICACIÓN ACTUAL</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, fontFamily: T.brand, letterSpacing: "-0.5px" }}>{sesion.ubicacion}</div>
          </div>
          <div style={{ color: T.primary, fontWeight: 800, fontSize: 11, letterSpacing: "1.2px", background: T.skuBg, padding: "5px 10px", borderRadius: 999, flexShrink: 0 }}>CAMBIAR</div>
        </button>
      </HeaderBlock>

      {/* Display area */}
      <div style={{ padding: "14px 18px 8px", flexShrink: 0 }}>
        {mode === "sku" ? (
          <div style={{
            background: T.card, border: noEncontrado ? "2px solid #ef4444" : T.cardBorderStrong,
            borderRadius: 20, padding: "14px 18px",
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: T.primary, marginBottom: 6 }}>
              {noEncontrado ? "❌ SKU NO ENCONTRADO — INTENTÁ DE NUEVO" : "INGRESÁ EL SKU"}
            </div>
            <div style={{
              fontSize: 36, fontWeight: 800, fontFamily: T.brand, letterSpacing: "2px",
              color: skuValue ? T.ink : T.muted, minHeight: 44, lineHeight: 1.1,
            }}>
              {skuValue || <span style={{ fontSize: 28, letterSpacing: 0 }}>_ _ _ _</span>}
            </div>
          </div>
        ) : (
          <div style={{
            background: T.card, border: T.cardBorderStrong, borderRadius: 20,
            padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: T.skuBg, color: T.primary,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "1px", opacity: 0.7 }}>SKU</div>
                <div style={{ fontSize: 12, fontWeight: 800, fontFamily: T.brand }}>{articulo.sku}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", color: T.primary, textTransform: "uppercase" }}>
                  {articulo.categoria || articulo.familia || ""}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: T.brand, lineHeight: 1.2 }}>
                  {articulo.descripcion}
                </div>
              </div>
            </div>
            <div style={{
              background: T.qtyBg, borderRadius: 12, padding: "8px 14px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: T.primary }}>UNIDADES</div>
              <div style={{
                fontSize: 34, fontWeight: 800, fontFamily: T.brand, letterSpacing: "-1px",
                color: qtyValue ? T.ink : T.muted,
              }}>{qtyValue || "0"}</div>
            </div>
          </div>
        )}
      </div>

      {/* Keypad */}
      <div style={{ flex: 1, padding: "0 18px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Keypad mode={mode} onKey={onKey} buscando={buscando} guardando={guardando} canConfirm={canConfirm} />
        {error && <div style={{ textAlign: "center", fontSize: 13, color: "#e53935", fontWeight: 600 }}>{error}</div>}
      </div>
    </div>
  )
}

function Keypad({ mode, onKey, buscando, guardando, canConfirm }) {
  // Filas 1-9 iguales, última fila cambia según modo
  const digits = [["1","2","3"],["4","5","6"],["7","8","9"]]
  const lastRow = mode === "sku"
    ? ["clr", "0", "ok"]   // ok = BUSCAR
    : ["clr", "0", "del"]

  const okLabel = mode === "sku"
    ? (buscando ? "..." : "IR")
    : "⌫"

  const clrLabel = mode === "qty" ? "C" : "C"

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{
        flex: 1, display: "grid", gridTemplateRows: "repeat(4, 1fr)", gap: 8,
        background: T.keypadBg, padding: 10, borderRadius: 22,
      }}>
        {[...digits, lastRow].map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {row.map(k => {
              const isOk = k === "ok"
              const isSpecial = k === "clr" || k === "del"
              const disabled = (isOk && mode === "sku" && buscando) || (isOk && mode === "qty" && !canConfirm)
              const label = k === "clr" ? clrLabel : k === "del" ? "⌫" : k === "ok" ? (mode === "sku" ? (buscando ? "..." : "IR") : "⌫") : k

              // En modo qty la última fila es clr/0/del — no hay ok
              const bg = isOk
                ? (disabled ? T.disabledBg : T.accent)
                : isSpecial
                  ? T.keySpecialBg
                  : T.keyBg
              const color = isOk
                ? (disabled ? T.disabledInk : T.accentInk)
                : isSpecial
                  ? T.keySpecialInk
                  : T.ink

              return (
                <button key={k} onClick={() => !disabled && onKey(k)} style={{
                  borderRadius: 14, border: "none", cursor: disabled ? "default" : "pointer",
                  background: bg, color,
                  fontSize: isOk ? 14 : isSpecial ? 18 : 24,
                  fontWeight: 800, fontFamily: T.brand,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: disabled ? 0.5 : 1,
                }}>{label}</button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Botón de acción principal */}
      {mode === "qty" && (
        <button onClick={() => onKey("ok")} disabled={!canConfirm} style={{
          marginTop: 8, height: 52, borderRadius: 999, border: "none",
          background: canConfirm ? T.accent : T.disabledBg,
          color: canConfirm ? T.accentInk : T.disabledInk,
          fontSize: 15, fontWeight: 800, letterSpacing: "0.4px", cursor: canConfirm ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: canConfirm ? "0 10px 22px " + T.accentShadow : "none",
          flexShrink: 0,
        }}>
          <IcCheck /> {guardando ? "GUARDANDO..." : "CONFIRMAR CARGA"}
        </button>
      )}
    </div>
  )
}
