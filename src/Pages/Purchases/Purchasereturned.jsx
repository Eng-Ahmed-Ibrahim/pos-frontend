import { useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { apiFetch } from "@/Components/apiFetch";

// Debounce بسيط للبحث عشان منضربش API مع كل حرف
function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function PurchaseReturned() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])

  const [supplierId, setSupplierId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [pagination, setPagination] = useState(null) // { current_page, last_page, ... }

  // { [product_id]: { quantity, max, name, barcode, price } }
  const [selected, setSelected] = useState({})

  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const requestSeq = useRef(0)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch(`purchase/return`)
      const json = await res.json()
      if (res.ok && json.status) {
        setSuppliers(json.suppliers || [])
        setCategories(json.categories || [])
      } else {
        setError(json.message || 'تعذر تحميل بيانات الصفحة')
      }
    } catch (err) {
      console.error(err)
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  // كل ما المورد أو القسم أو البحث يتغيروا، هات المنتجات من أول صفحة
  useEffect(() => {
    if (!supplierId) {
      setProducts([])
      setPagination(null)
      return
    }
    fetchProducts(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId, categoryId, debouncedSearch])

  const fetchProducts = async (page = 1) => {
    if (!supplierId) return
    const seq = ++requestSeq.current
    setProductsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        supplier_id: supplierId,
        page: String(page),
      })
      if (categoryId) params.append('category_id', categoryId)
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim())

      const res = await apiFetch(`purchase/return/products?${params.toString()}`)
      const json = await res.json()

      // لو فيه طلب أحدث بعده اتبعت، تجاهل النتيجة القديمة دي
      if (seq !== requestSeq.current) return

      if (res.ok && json.status) {
        const list = json.products?.data || []
        setProducts(list)
        setPagination(json.products || null)
      } else {
        setError(json.message || 'تعذر تحميل منتجات المورد')
        setProducts([])
      }
    } catch (err) {
      console.error(err)
      if (seq === requestSeq.current) {
        setError('تعذر الاتصال بالخادم')
        setProducts([])
      }
    } finally {
      if (seq === requestSeq.current) setProductsLoading(false)
    }
  }

  const toggleProduct = (product, checked) => {
    setSelected((prev) => {
      const updated = { ...prev }
      if (checked) {
        updated[product.product_id] = {
          quantity: product.available_qty,
          max: product.available_qty,
          name: product.product_name,
          barcode: product.product_barcode,
          price: product.last_price,
        }
      } else {
        delete updated[product.product_id]
      }
      return updated
    })
  }

  const setProductQuantity = (product, value) => {
    let qty = Number(value)
    if (Number.isNaN(qty)) qty = 0
    if (qty > product.available_qty) qty = product.available_qty
    if (qty < 0) qty = 0
    setSelected((prev) => ({
      ...prev,
      [product.product_id]: {
        quantity: qty,
        max: product.available_qty,
        name: product.product_name,
        barcode: product.product_barcode,
        price: product.last_price,
      },
    }))
  }

  const removeSelected = (productId) => {
    setSelected((prev) => {
      const updated = { ...prev }
      delete updated[productId]
      return updated
    })
  }

  const selectedList = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v.quantity > 0)
        .map(([productId, v]) => ({ productId: Number(productId), ...v })),
    [selected]
  )

  const returnTotal = useMemo(
    () => selectedList.reduce((sum, it) => sum + it.quantity * Number(it.price || 0), 0),
    [selectedList]
  )

  const handleSubmitReturn = async () => {
    if (!supplierId) {
      setError('اختر المورد أولًا')
      return
    }
    if (selectedList.length === 0) {
      setError('اختر صنفًا واحدًا على الأقل لإرجاعه')
      return
    }

    const result = await Swal.fire({
      title: 'تأكيد إرجاع المشتريات للمورد',
      text: `سيتم إرجاع ${selectedList.length} صنف بإجمالي ${returnTotal.toFixed(2)} ج.م`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، تنفيذ الإرجاع',
      cancelButtonText: 'إلغاء',
    })
    if (!result.isConfirmed) return

    setSubmitting(true)
    setError('')
    try {
      const res = await apiFetch(`purchase/return`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: supplierId,
          reason: reason || null,
          items: selectedList.map((it) => ({
            product_id: it.productId,
            quantity: it.quantity,
          })),
        }),
      })
      const json = await res.json()
      if (res.ok && json.status) {
        Swal.fire({
          toast: true,
          position: 'top-start',
          icon: 'success',
          title: 'تم تنفيذ إرجاع المشتريات بنجاح',
          showConfirmButton: false,
          timer: 2500,
        })
        setSelected({})
        setReason('')
        fetchProducts(pagination?.current_page || 1) // تحديث الكميات المتاحة
      } else {
        setError(json.message || 'فشلت عملية الإرجاع')
      }
    } catch (err) {
      console.error(err)
      setError('حدث خطأ أثناء تنفيذ الإرجاع')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div dir="rtl">
        <p>جارٍ التحميل...</p>
      </div>
    )
  }

  return (
    <div dir="rtl">
      <div className="page-header">
        <h2>مرتجعات المشتريات</h2>
        <p>اختر المورد، ابحث عن المنتج بالاسم أو الباركود، وحدد الكمية المراد إرجاعها</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-panel card-spacer" style={{ maxWidth: 'none' }}>
        <div className="search-row" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="form-group">
            <label>المورد</label>
            <select value={supplierId} onChange={(e) => { setSupplierId(e.target.value); setSelected({}) }}>
              <option value="">-- اختر المورد --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>القسم</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">كل الأقسام</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
            <label>بحث بالاسم أو الباركود</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="اكتب اسم المنتج أو الباركود..."
              disabled={!supplierId}
            />
          </div>
        </div>
      </div>

      {!supplierId && (
        <div className="form-panel" style={{ maxWidth: 'none', textAlign: 'center', color: '#888' }}>
          اختر مورد الأول عشان تظهر منتجاته
        </div>
      )}

      {supplierId && (
        <>
          <div className="table-wrap card-spacer">
            <div className="table-header">
              <div className="section-title" style={{ margin: 0 }}>
                منتجات المورد {productsLoading && <span style={{ fontSize: 12, color: '#888' }}>(جارٍ التحميل...)</span>}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>المنتج</th>
                  <th>الباركود</th>
                  <th>المتاح للإرجاع</th>
                  <th>السعر</th>
                  <th>الكمية المراد إرجاعها</th>
                  <th>إجمالي الإرجاع</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && !productsLoading && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>
                      لا يوجد منتجات متاحة للإرجاع بهذه الشروط
                    </td>
                  </tr>
                )}
                {products.map((product) => {
                  const sel = selected[product.product_id]
                  const selectedQty = sel?.quantity || 0
                  return (
                    <tr key={product.product_id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedQty > 0}
                          onChange={(e) => toggleProduct(product, e.target.checked)}
                        />
                      </td>
                      <td>{product.product_name}</td>
                      <td className="muted">{product.product_barcode || '-'}</td>
                      <td>{product.available_qty}</td>
                      <td>{product.last_price}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={product.available_qty}
                          className="qty-input"
                          disabled={selectedQty === 0}
                          value={selectedQty}
                          onChange={(e) => setProductQuantity(product, e.target.value)}
                        />
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {(selectedQty * Number(product.last_price || 0)).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {pagination && pagination.last_page > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 12 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pagination.current_page <= 1 || productsLoading}
                  onClick={() => fetchProducts(pagination.current_page - 1)}
                >
                  السابق
                </button>
                <span style={{ alignSelf: 'center' }}>
                  صفحة {pagination.current_page} من {pagination.last_page}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pagination.current_page >= pagination.last_page || productsLoading}
                  onClick={() => fetchProducts(pagination.current_page + 1)}
                >
                  التالي
                </button>
              </div>
            )}
          </div>

          {selectedList.length > 0 && (
            <div className="table-wrap card-spacer">
              <div className="table-header">
                <div className="section-title" style={{ margin: 0 }}>
                  الأصناف المحددة للإرجاع <span>({selectedList.length})</span>
                </div>
              </div>
              <table>
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
                  {selectedList.map((it) => (
                    <tr key={it.productId}>
                      <td>{it.name}</td>
                      <td className="muted">{it.barcode || '-'}</td>
                      <td>{it.quantity}</td>
                      <td>{it.price}</td>
                      <td style={{ fontWeight: 700 }}>{(it.quantity * Number(it.price || 0)).toFixed(2)}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => removeSelected(it.productId)}>
                          إزالة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="form-panel card-spacer" style={{ maxWidth: 'none' }}>
            <div className="form-group full">
              <label>سبب الإرجاع (اختياري)</label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="مثال: منتج تالف، خطأ في الكمية المستلمة..."
              />
            </div>
          </div>

          <div className="form-panel" style={{ maxWidth: 'none' }}>
            <div className="total-row grand" style={{ marginBottom: 16 }}>
              <span>إجمالي الإرجاع</span>
              <span>{returnTotal.toFixed(2)} ج.م</span>
            </div>
            <button
              type="button"
              className="return-btn"
              disabled={submitting || selectedList.length === 0}
              onClick={handleSubmitReturn}
            >
              {submitting ? 'جارٍ تنفيذ الإرجاع...' : 'تنفيذ الإرجاع'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default PurchaseReturned