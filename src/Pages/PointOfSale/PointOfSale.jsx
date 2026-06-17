import { useState, useEffect, useRef } from 'react'
// import './CreateInvoice.css' // إعادة استخدام نفس الاستايل المستخدم فى صفحة فاتورة الشراء
import './SaleInvoicePrint.css' // استايل الفاتورة نفسها + كلاسات التحكم فى الطباعة
import ReceiptContent from './SaleInvoicePrint'

const API_BASE = import.meta.env.VITE_API_URL

function PointOfSale() {
  const addSound = new Audio('./beep.mp3');

  // ---------- بيانات المنتجات ----------
  const [products, setProducts] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // ---------- بيانات البيع ----------
  const [customerName, setCustomerName] = useState('')
  const [amountPaid, setAmountPaid] = useState('')

  // ---------- سلة البيع ----------
  const [items, setItems] = useState([])

  // ---------- البحث عن منتج / السكانر ----------
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [itemPrice, setItemPrice] = useState('')

  const searchInputRef = useRef(null)
  const quantityInputRef = useRef(null)

  const [submitting, setSubmitting] = useState(false)

  // الفاتورة اللى خلصت توها وعايزين نطبعها فى نفس الصفحة
  const [completedSale, setCompletedSale] = useState(null)

  // جلب المنتجات عند تحميل الصفحة، والتركيز على حقل البحث فورًا (جاهز للسكانر)
  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!loadingData) {
      searchInputRef.current?.focus()
    }
  }, [loadingData])

  const fetchInitialData = async () => {
    setLoadingData(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/products`)
      const json = await res.json()
      if (json.status) {
        setProducts(json.data.products || [])
      } else {
        setError('فشل تحميل بيانات الصفحة')
      }
    } catch (err) {
      setError('تعذر الاتصال بالخادم، تأكد من تشغيل السيرفر')
    } finally {
      setLoadingData(false)
    }
  }

  // نتائج البحث (بالاسم أو الباركود) - فلترة محلية من المنتجات المحملة
  const searchResults = (() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term || selectedProduct) return []
    return products.filter(
      (p) =>
        p.barcode?.toLowerCase().includes(term) ||
        p.name?.toLowerCase().includes(term)
    )
  })()

  const noResultsFound = searchTerm.trim() !== '' && !selectedProduct && searchResults.length === 0

  // مطابقة كاملة (تامة) للباركود - هي اللي بتفرق بين "بحث جزئي بالاسم" و "سكان باركود حقيقي"
  const findExactBarcodeMatch = (value) => {
    const term = value.trim()
    if (!term) return null
    return products.find((p) => p.barcode && p.barcode === term) || null
  }

  // الكمية المتاحة فعليًا لمنتج معين (المخزون مطروحًا منه ما هو موجود بالفعل فى السلة)
  const getRemainingStock = (product) => {
    const inCart = items.find((i) => i.product_id === product.id)?.quantity || 0
    return (product.stock ?? 0) - inCart
  }

  const resetSearchState = () => {
    setSearchTerm('')
    setSelectedProduct(null)
    setItemPrice('')
    setQuantity(1)
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }

  // إضافة المنتج فعليًا لسلة البيع (تُستخدم في الإضافة اليدوية وفي السكان التلقائي)
  const addItemToCart = (product, qty, price) => {
    setError('')
    if (!product) return

    const quantityNum = Number(qty)
    const priceNum = Number(price)

    if (!quantityNum || quantityNum <= 0) {
      setError('الكمية غير صحيحة')
      return
    }
    if (price === '' || price === null || Number.isNaN(priceNum) || priceNum < 0) {
      setError('السعر غير صحيح')
      return
    }

    const existing = items.find((i) => i.product_id === product.id)
    const currentQtyInCart = existing?.quantity || 0
    if (currentQtyInCart + quantityNum > (product.stock ?? 0)) {
      setError(`الكمية المطلوبة أكبر من المخزون المتاح (${product.stock} فقط)`)
      return
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product_id === product.id)
      if (existingIndex > -1) {
        const updated = [...prev]
        const newQty = updated[existingIndex].quantity + quantityNum
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          price: priceNum,
          subtotal: newQty * priceNum,
        }
        return updated
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          barcode: product.barcode,
          stock: product.stock,
          quantity: quantityNum,
          price: priceNum,
          subtotal: quantityNum * priceNum,
        },
      ]
    })

    setSuccessMsg(`تمت إضافة "${product.name}"`)
    addSound.play();

  }

  // أي تغيير في حقل البحث - هنا بيتم اكتشاف السكان التلقائي
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setError('')

    const exact = findExactBarcodeMatch(value)
    if (exact) {
      // باركود مطابق تمامًا = سكانر => بيع وحدة واحدة فورًا بسعر البيع المسجل للمنتج
      addItemToCart(exact, 1, exact.price ?? 0)
      resetSearchState()
      return
    }

    setSelectedProduct(null)
    setItemPrice('')
  }

  // دعم السكانرات اللي بترسل Enter بعد الباركود، وكذلك الإضافة بالكيبورد فقط
  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    if (selectedProduct) {
      handleAddItem()
      return
    }

    const exact = findExactBarcodeMatch(searchTerm)
    if (exact) {
      addItemToCart(exact, 1, exact.price ?? 0)
      resetSearchState()
      return
    }

    if (searchResults.length === 1) {
      handleSelectProduct(searchResults[0])
    }
  }

  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setSearchTerm(product.name)
    setItemPrice(product.price ?? 0)
    setQuantity(1)
    requestAnimationFrame(() => {
      quantityInputRef.current?.focus()
      quantityInputRef.current?.select()
    })
  }

  const handleClearSelection = () => {
    resetSearchState()
  }

  const handleAddItem = () => {
    if (!selectedProduct) {
      setError('اختر منتجًا أولاً')
      return
    }
    addItemToCart(selectedProduct, quantity, itemPrice)
    resetSearchState()
  }

  const handleRemoveItem = (productId) => {
    addSound.play();
    setItems((prev) => prev.filter((i) => i.product_id !== productId))

  }

  // تعديل الكمية أو السعر مباشرة من سلة البيع
  const handleUpdateItem = (productId, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item
        const numValue = Number(value)
        const updated = { ...item, [field]: Number.isNaN(numValue) ? 0 : numValue }
        updated.subtotal = updated.quantity * updated.price
        return updated
      })
    )
  }

  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0)
  const paidNum = Number(amountPaid) || 0
  const changeAmount = paidNum - totalAmount

  const resetSaleForm = () => {
    setItems([])
    setCustomerName('')
    setAmountPaid('')
    resetSearchState()
  }

  // بمجرد ما الفاتورة المكتملة تتحط فى completedSale، الفاتورة بتترندر فى منطقة مخفية
  // فى نفس الصفحة، وهذا الـ effect بيشغل الطباعة. window.print() فى أغلب المتصفحات
  // (Chrome/Firefox) بتوقف تنفيذ الجافاسكريبت لحد ما المستخدم يقفل نافذة الطباعة،
  // يعنى السطر اللى بعده (تصفير الفورم) بيتنفذ تلقائيًا أول ما الطباعة تخلص - فتكون
  // الصفحة جاهزة للعميل اللى بعده على طول من غير أي خطوة إضافية
  useEffect(() => {
    if (completedSale) {
      window.print()
      setCompletedSale(null)
      resetSaleForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSale])

  // إتمام عملية البيع: حفظها فى السيرفر، ثم طباعة فاتورتها فى نفس الصفحة فورًا
  // (الفورم بيتصفر تلقائيًا بعد ما الطباعة تخلص - راجع الـ effect اللى فوق)
  const handleCheckout = async () => {
    setError('')
    setSuccessMsg('')

    if (items.length === 0) {
      setError('أضف صنفًا واحدًا على الأقل لإتمام البيع')
      return
    }

    setSubmitting(true)
    try {
      // عدّل المسار حسب الراوت الموجود لديك لإنشاء عملية بيع
      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName || null,
          amount_paid: amountPaid === '' ? null : Number(amountPaid),
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      })

      const json = await res.json()

      if (json.status) {
        setSuccessMsg('تم إتمام عملية البيع بنجاح')
        setCompletedSale(json.data)
      } else {
        setError(json.message || 'فشلت عملية البيع')
      }
    } catch (err) {
      console.error(err)
      setError('حدث خطأ أثناء إتمام عملية البيع')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="invoice-page pos-screen-only" dir="rtl">
        <p className="loading-text">جاري تحميل البيانات...</p>
      </div>
    )
  }

  return (
    <>
      <div className="invoice-page pos-screen-only" dir="rtl">
        <div className="invoice-header">
          <h3>نقطة البيع</h3>
          <p className="invoice-subtitle">اسكان الباركود أو اكتب اسم المنتج لإضافته للفاتورة فورًا</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}



        <section className="card">
          <h4 className="card-title">المنتجات (سكان الباركود مباشر هنا)</h4>

          <div className="form-row">
            <div className="field search-field">
              <label>بحث بالاسم أو الباركود</label>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="اسكان الباركود أو اكتب اسم المنتج..."
                autoComplete="off"
              />

              {searchResults.length > 0 && (
                <div className="dropdown">
                  {searchResults.map((p) => (
                    <div key={p.id} className="dropdown-item" onClick={() => handleSelectProduct(p)}>
                      <span className="dropdown-item-name">{p.name}</span>
                      <span className="dropdown-item-barcode">
                        {p.barcode || '-'} • متاح: {p.stock}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {noResultsFound && (
                <div className="dropdown">
                  <div className="no-result">
                    <span>لا يوجد منتج مطابق</span>
                  </div>
                </div>
              )}
            </div>

            {selectedProduct && (
              <>
                <div className="field small">
                  <label>الكمية (متاح {getRemainingStock(selectedProduct)})</label>
                  <input
                    ref={quantityInputRef}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddItem()
                      }
                    }}
                  />
                </div>
                <div className="field small">
                  <label>سعر البيع</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddItem()
                      }
                    }}
                  />
                </div>
                <div className="field action-field">
                  <label>&nbsp;</label>
                  <div className="btn-group">
                    <button type="button" className="btn btn-primary" onClick={handleAddItem}>
                      إضافة
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={handleClearSelection}>
                      إلغاء
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="card">
          <h4 className="card-title">سلة البيع ({items.length})</h4>

          {items.length === 0 ? (
            <p className="empty-text">لم تتم إضافة أي صنف بعد - اسكان أول باركود لبدء عملية البيع</p>
          ) : (
            <table className="items-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الباركود</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.product_id}>
                    <td>{i.name}</td>
                    <td className="muted">{i.barcode || '-'}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max={i.stock}
                        value={i.quantity}
                        onChange={(e) => handleUpdateItem(i.product_id, 'quantity', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={i.price}
                        onChange={(e) => handleUpdateItem(i.product_id, 'price', e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td className="bold">{i.subtotal.toFixed(2)}</td>
                    <td>
                      <button type="button" className="btn btn-danger-text" onClick={() => handleRemoveItem(i.product_id)}>
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="bold">الإجمالي الكلي</td>
                  <td className="bold total-cell" colSpan="2">{totalAmount.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        <section className="card">
          <h4 className="card-title">الدفع</h4>
          <div className="form-row">
            <div className="field">
              <label>المبلغ المدفوع من العميل</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={totalAmount.toFixed(2)}
              />
            </div>
            <div className="field">
              <label>الباقى للعميل</label>
              <input type="text" value={changeAmount > 0 ? changeAmount.toFixed(2) : '0.00'} readOnly />
            </div>
          </div>
        </section>

        <div className="submit-bar">
          <button
            type="button"
            className="btn btn-primary btn-large"
            disabled={submitting || items.length === 0}
            onClick={handleCheckout}
          >
            {submitting ? 'جارٍ إتمام البيع...' : `إتمام البيع وطباعة الفاتورة (${totalAmount.toFixed(2)})`}
          </button>
        </div>
      </div>

      {/* منطقة مخفية فى الوضع الطبيعي، وتظهر هى بس وقت الطباعة (راجع SaleInvoicePrint.css) */}
      <div className="pos-receipt-print-area" dir="rtl">
        <ReceiptContent sale={completedSale} />
      </div>
    </>
  )
}

export default PointOfSale