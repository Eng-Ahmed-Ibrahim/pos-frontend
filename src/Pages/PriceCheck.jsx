import { useState, useEffect, useRef } from 'react'
import Swal from "sweetalert2";
import { CiLogout } from "react-icons/ci";

function PriceCheck() {
    const [products, setProducts] = useState([])
    const [productsByBarcode, setProductsByBarcode] = useState({})
    const [loadingData, setLoadingData] = useState(true)

    const [barcodeInput, setBarcodeInput] = useState('')
    const [result, setResult] = useState(null)
    const [notFound, setNotFound] = useState(false)
    const [pulseKey, setPulseKey] = useState(0)

    const inputRef = useRef(null)
    const clearTimeoutRef = useRef(null)

    const SCALE_PREFIX = '20'
    const BARCODE_LENGTH = 13

    useEffect(() => {

        fetchProducts()
        return () => clearTimeoutRef.current && clearTimeout(clearTimeoutRef.current)
    }, [])

    useEffect(() => {
        if (!loadingData) inputRef.current?.focus()
    }, [loadingData])

    const fetchProducts = async () => {
        setLoadingData(true)
        try {
            const API_BASE = import.meta.env.VITE_API_URL

            const res = await fetch(`${API_BASE}/point-of-sale/products`, { method: "GET" })
            const json = await res.json()
            if (json.status) {
                const fetchedProducts = json.data.products || []
                setProducts(fetchedProducts)
                const barcodeMap = {}
                fetchedProducts.forEach(p => {
                    if (p.barcode) barcodeMap[p.barcode.toString().trim()] = p
                })
                setProductsByBarcode(barcodeMap)
            } else {
                Swal.fire({ toast: true, position: 'center', icon: "error", title: 'فشل تحميل بيانات المنتجات', showConfirmButton: false, timer: 3000 })
            }
        } catch (err) {
            Swal.fire({ toast: true, position: 'center', icon: "error", title: 'تعذر الاتصال بالخادم', showConfirmButton: false, timer: 3000 })
        } finally {
            setLoadingData(false)
        }
    }
    const handleLogout = async () => {
        localStorage.clear()
        window.location.href = "/login";
    }
    const scheduleClear = () => {
        if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current)
        clearTimeoutRef.current = setTimeout(() => {
            setResult(null)
            setNotFound(false)
        }, 7000)
    }

    const handleScan = (e) => {
        if (e.key !== 'Enter') return
        e.preventDefault()

        const barcode = e.target.value.trim()
        setBarcodeInput('')
        if (!barcode) return

        setNotFound(false)

        let product = productsByBarcode[barcode]

        if (product) {
            // مهم: السعر جاي من الـ API كـ string، لازم نحوله Number قبل ما نستخدم toFixed
            setResult({
                name: product.name,
                price: Number(product.price) || 0,
                barcode: product.barcode,
                isWeighted: false,
            })
            setPulseKey(k => k + 1)
            scheduleClear()
            return
        }

        if (barcode.length === BARCODE_LENGTH && barcode.startsWith(SCALE_PREFIX)) {
            const productBarcode = barcode.slice(0, 7)
            const weightGrams = barcode.slice(7, 12)
            const weightKg = Number(weightGrams) / 1000
            const weightedProduct = productsByBarcode[productBarcode]

            if (weightedProduct && weightKg > 0) {
                const unitPrice = Number(weightedProduct.price) || 0
                setResult({
                    name: weightedProduct.name,
                    price: unitPrice,
                    totalPrice: unitPrice * weightKg,
                    barcode: weightedProduct.barcode,
                    isWeighted: true,
                    weightKg,
                })
                setPulseKey(k => k + 1)
                scheduleClear()
                return
            }
        }

        setResult(null)
        setNotFound(true)
        scheduleClear()
    }

    if (loadingData) {
        return (
            <div style={styles.page}>
                <div style={styles.loaderWrap}>
                    <div style={styles.spinner} />
                    <p style={styles.loaderText}>جاري تحميل بيانات المنتجات...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.page} dir="rtl">
            <button style={styles.btnLogout} onClick={handleLogout}><CiLogout fontSize={30} /></button>
            <div style={styles.card}>
                <div style={styles.iconCircle}>
                    <BarcodeIcon />
                </div>

                <h1 style={styles.title}>استعلام سعر</h1>
                <p style={styles.subtitle}>اسكان الباركود لمعرفة سعر المنتج</p>

                <input
                    ref={inputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={handleScan}
                    placeholder="في انتظار السكان..."
                    autoComplete="off"
                    style={styles.input}
                />

                <div style={styles.resultZone}>
                    {result && (
                        <div key={pulseKey} style={styles.resultCard}>
                            <div style={styles.productName}>{result.name}</div>
                            <div style={styles.barcodeTag}>{result.barcode}</div>

                            {result.isWeighted ? (
                                <>
                                    <div style={styles.priceRow}>
                                        <span style={styles.priceLabel}>سعر الكيلو</span>
                                        <span style={styles.priceSmall}>{result.price.toFixed(2)} ج.م</span>
                                    </div>
                                    <div style={styles.priceRow}>
                                        <span style={styles.priceLabel}>الوزن</span>
                                        <span style={styles.priceSmall}>{result.weightKg.toFixed(3)} كجم</span>
                                    </div>
                                    <div style={styles.bigPrice}>
                                        {result.totalPrice.toFixed(2)} <span style={styles.currency}>ج.م</span>
                                    </div>
                                </>
                            ) : (
                                <div style={styles.bigPrice}>
                                    {result.price.toFixed(2)} <span style={styles.currency}>ج.م</span>
                                </div>
                            )}
                        </div>
                    )}

                    {notFound && (
                        <div style={styles.notFoundCard}>
                            <div style={styles.notFoundIcon}>!</div>
                            <div style={styles.notFoundText}>الباركود غير موجود</div>
                        </div>
                    )}

                    {!result && !notFound && (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyDot} />
                            <div style={styles.emptyDot} />
                            <div style={styles.emptyDot} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function BarcodeIcon() {
    return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="2" height="16" fill="white" />
            <rect x="6" y="4" width="1" height="16" fill="white" />
            <rect x="9" y="4" width="2" height="16" fill="white" />
            <rect x="13" y="4" width="1" height="16" fill="white" />
            <rect x="15" y="4" width="2" height="16" fill="white" />
            <rect x="19" y="4" width="1" height="16" fill="white" />
            <rect x="21" y="4" width="1" height="16" fill="white" />
        </svg>
    )
}

const BRAND = '#803D3B'
const BRAND_DARK = '#5f2d2b'
const BRAND_LIGHT = '#a85957'

const styles = {
    btnLogout: {
        position: 'fixed',
        bottom: '10px',
        left: '10px'
    },
    page: {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cairo', 'Tahoma', sans-serif",
        padding: '1.5rem',
        boxSizing: 'border-box',
        fontWeight: '900'
    },
    card: {
        width: '100%',
        maxWidth: '460px',
        background: '#fff',
        color: 'black',
        fontWeight: "900",
        borderRadius: '28px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    },
    iconCircle: {
        width: '64px',
        height: '64px',
        borderRadius: '18px',
        background: `linear-gradient(135deg, ${BRAND_LIGHT}, ${BRAND})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        boxShadow: `0 8px 24px rgba(128,61,59,0.35)`,
    },
    title: {
        color: '#1f2937',
        fontSize: '1.6rem',
        fontWeight: 800,
        margin: 0,
    },
    subtitle: {
        color: '#6b7280',
        fontSize: '0.95rem',
        marginTop: '0.4rem',
        marginBottom: '1.75rem',
    },
    input: {
        width: '100%',
        padding: '1rem 1.25rem',
        fontSize: '1.1rem',
        textAlign: 'center',
        borderRadius: '14px',
        border: `2px solid #e5dcdc`,
        background: '#fdfafa',
        color: '#1f2937',
        outline: 'none',
        boxSizing: 'border-box',
        caretColor: BRAND,
    },
    resultZone: {
        width: '100%',
        marginTop: '1.75rem',
        minHeight: '190px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultCard: {
        width: '100%',
        background: '#fdf6f6',
        border: `1px solid #eddede`,
        borderRadius: '18px',
        padding: '1.5rem',
        animation: 'priceCheckPop 0.35s ease',
    },
    productName: {
        color: '#1f2937',
        fontSize: '1.15rem',
        fontWeight: 700,
        marginBottom: '0.35rem',
    },
    barcodeTag: {
        color: '#9ca3af',
        fontSize: '0.8rem',
        fontFamily: 'monospace',
        marginBottom: '1rem',
        letterSpacing: '1px',
    },
    priceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.4rem 0',
        borderBottom: '1px dashed #eddede',
        fontSize: '0.9rem',
    },
    priceLabel: { color: '#9ca3af' },
    priceSmall: { color: '#374151', fontWeight: 600 },
    bigPrice: {
        marginTop: '1rem',
        fontSize: '2.75rem',
        fontWeight: 800,
        color: BRAND,
        lineHeight: 1,
    },
    currency: {
        fontSize: '1.1rem',
        fontWeight: 600,
        color: BRAND_LIGHT,
        marginRight: '0.35rem',
    },
    notFoundCard: {
        width: '100%',
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '18px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
        animation: 'priceCheckPop 0.35s ease',
    },
    notFoundIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(239,68,68,0.12)',
        color: '#dc2626',
        fontWeight: 800,
        fontSize: '1.3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notFoundText: {
        color: '#dc2626',
        fontWeight: 700,
        fontSize: '1.05rem',
    },
    emptyState: {
        display: 'flex',
        gap: '0.5rem',
    },
    emptyDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#e5dcdc',
    },
    loaderWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: `3px solid rgba(255,255,255,0.25)`,
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'priceCheckSpin 0.8s linear infinite',
    },
    loaderText: {
        color: '#fff',
        fontSize: '0.95rem',
    },
}

if (typeof document !== 'undefined' && !document.getElementById('price-check-keyframes')) {
    const styleTag = document.createElement('style')
    styleTag.id = 'price-check-keyframes'
    styleTag.innerHTML = `
    @keyframes priceCheckPop {
      0% { opacity: 0; transform: scale(0.92) translateY(6px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes priceCheckSpin {
      to { transform: rotate(360deg); }
    }
  `
    document.head.appendChild(styleTag)
}

export default PriceCheck