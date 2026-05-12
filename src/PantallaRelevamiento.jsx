import { useState, useRef } from "react"
import { T } from "./theme"
import { buscarArticulo, agregarStockLog } from "./api"

const IcSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
  </svg>
)
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

function Keypad({ onKey }) {
  const rows = [["1","2","3"],["4","5","6"],["7","8","9"],["clr","0","del"]]
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8,
      background: T.keypadBg, padding: 10, borderRadius: 22, flexShrink: 0,
    }}>
      {rows.flat().map(k => {
        const special = k === "clr" || k === "del"
        return (
          <button key={k} onClick={() => onKey(k)} style={{
            height: 52, borderRadius: 16, border: "none", cursor: "pointer",
            background: special ? T.keySpecialBg : T.keyBg,
            color: special ? T.keySpecialInk : T.ink,
            fontSize: special ? 18 : 24, fontWeight: 800, fontFamily: T.brand,
          }}>
            {k === "clr" ? "C" : k === "del" ? "⌫" : k}
          </button>
        )
      })}
    </div>
  )
}

export default function PantallaRelevamiento({ sesion, conteo, onChangeLocation }) {
  const [sku, setSku] = useState("")
  const [articulo, setArticulo] = useState(null)
  const [qty, setQty] = useState("")
  const [buscando, setBuscando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [error, setError] = useState("")
  const skuRef = useRef(null)

  async function handleBuscar() {
    const q = sku.trim()
    if (!q) return
    setBuscando(true); setArticulo(null); setNoEncontrado(false); setQty(""); setError("")
    try {
      const art = await buscarArticulo(q)
      if (art) setArticulo(art)
      else setNoEncontrado(true)
    } catch { setError("Error al buscar") }
    finally { setBuscando(false) }
  }

  function onKey(k) {
    if (k === "del") return setQty(q => q.slice(0, -1))
    if (k === "clr") return setQty("")
    if (qty.length >= 4) return
    setQty(q => (q + k).replace(/^0+(?=\d)/, ""))
  }

  async function handleConfirmar() {
    if (!articulo || !qty || qty === "0") return
    setGuardando(true)
    try {
      await agregarStockLog(sesion.ubicacion_id, articulo.sku, Number(qty), sesion.vendedor)
      conteo.agregar(articulo.sku, articulo.descripcion, Number(qty))
      setQty(""); setSku(""); setArticulo(null); setNoEncontrado(false)
      setTimeout(() => skuRef.current?.focus(), 100)
    } catch { setError("Error al guardar") }
    finally { setGuardando(false) }
  }

  const canConfirm = articulo && qty && qty !== "0" && !guardando

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HeaderBlock>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: T.avatarBg, color: T.avatarInk,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 14, fontFamily: T.brand,
              border: T.avatarBorder, flexShrink: 0,
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
            width: 48, height: 48, borderRadius: 16, background: T.skuBg, color: T.primary,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}><IcPin s={26} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.18)", display: "inline-block" }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.8px", color: T.primary }}>UBICACIÓN ACTUAL</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, fontFamily: T.brand, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
              {sesion.ubicacion}
            </div>
          </div>
          <div style={{
            color: T.primary, fontWeight: 800, fontSize: 11, letterSpacing: "1.2px",
            background: T.skuBg, padding: "5px 10px", borderRadius: 999, flexShrink: 0,
          }}>CAMBIAR</div>
        </button>
      </HeaderBlock>

      {/* SKU search */}
      <div style={{ padding: "14px 18px 8px" }}>
        <div style={{
          background: T.card, border: T.cardBorder, borderRadius: 999,
          height: 54, display: "flex", alignItems: "center", padding: "0 6px 0 20px",
          gap: 10, boxShadow: T.searchShadow,
        }}>
          <span style={{ color: T.primary, display: "inline-flex" }}><IcSearch /></span>
          <input
            ref={skuRef} autoFocus
            value={sku}
            onChange={e => { setSku(e.target.value.toUpperCase()); setArticulo(null); setNoEncontrado(false) }}
            onKeyDown={e => e.key === "Enter" && handleBuscar()}
            placeholder="SKU o código del producto"
            autoCapitalize="characters" autoCorrect="off"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontSize: 15, fontWeight: 700, color: T.ink, letterSpacing: "0.5px",
            }}
          />
          <button onClick={handleBuscar} disabled={buscando || !sku.trim()} style={{
            height: 42, padding: "0 16px", borderRadius: 999, border: "none",
            background: buscando || !sku.trim() ? T.disabledBg : T.primary,
            color: buscando || !sku.trim() ? T.disabledInk : T.primaryInk,
            fontWeight: 800, fontSize: 12, cursor: "pointer", letterSpacing: "0.5px",
          }}>{buscando ? "..." : "BUSCAR"}</button>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "0 18px 12px", gap: 10 }}>
        {articulo ? (
          <>
            {/* Product card */}
            <div style={{
              background: T.card, border: T.cardBorderStrong, borderRadius: 20,
              padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, background: T.skuBg, color: T.primary,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "1px", opacity: 0.7 }}>SKU</div>
                  <div style={{ fontSize: 13, fontWeight: 800, fontFamily: T.brand, lineHeight: 1 }}>{articulo.sku}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.6px", color: T.primary, textTransform: "uppercase" }}>
                    {articulo.categoria || articulo.familia || ""}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.2, marginTop: 2, fontFamily: T.brand }}>
                    {articulo.descripcion}
                  </div>
                </div>
              </div>
              <div style={{
                background: T.qtyBg, borderRadius: 14, padding: "8px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "2px", color: T.primary }}>¿CUÁNTAS UNIDADES?</div>
                <div style={{
                  fontSize: 32, fontWeight: 800, fontFamily: T.brand, letterSpacing: "-1px", lineHeight: 1,
                  color: qty ? T.ink : T.muted,
                }}>{qty || "0"}</div>
              </div>
            </div>

            <Keypad onKey={onKey} />

            <button onClick={handleConfirmar} disabled={!canConfirm} style={{
              height: 54, borderRadius: 999, border: "none",
              background: canConfirm ? T.accent : T.disabledBg,
              color: canConfirm ? T.accentInk : T.disabledInk,
              fontSize: 16, fontWeight: 800, letterSpacing: "0.4px", cursor: canConfirm ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: canConfirm ? "0 10px 22px " + T.accentShadow : "none",
              flexShrink: 0,
            }}>
              <IcCheck /> {guardando ? "GUARDANDO..." : "CONFIRMAR CARGA"}
            </button>

            {error && <div style={{ textAlign: "center", fontSize: 13, color: "#e53935", fontWeight: 600 }}>{error}</div>}
          </>
        ) : (
          <EmptyState sku={sku} noEncontrado={noEncontrado} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ sku, noEncontrado }) {
  if (noEncontrado) {
    return (
      <div style={{
        background: T.card, border: T.cardBorder, borderRadius: 20,
        padding: "28px 22px", textAlign: "center", color: T.muted, flexShrink: 0,
      }}>
        <div style={{ fontSize: 38, marginBottom: 8 }}>🤔</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, fontFamily: T.brand }}>SKU no encontrado</div>
        <div style={{ fontSize: 12.5, marginTop: 4 }}>Revisá el código e intentá de nuevo.</div>
      </div>
    )
  }
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 22px", textAlign: "center", color: T.muted, gap: 12 }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: T.skuBg, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
        <IcSearch />
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, fontFamily: T.brand, letterSpacing: "-0.3px" }}>Buscá un producto</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.4, maxWidth: 260 }}>Ingresá el SKU en el buscador y presioná BUSCAR.</div>
    </div>
  )
}
