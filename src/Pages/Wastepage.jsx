import { useState, useEffect, useRef, useMemo } from 'react'
import { apiFetch } from "@/Components/apiFetch";
import Swal from "sweetalert2";
import Pagination from '../Components/Pagination';

function WastePage() {
  // ---------- بيانات المنتجات ----------
  const [products, setProducts] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  // ---------- سلة الهالك ----------
  const [items, setItems] = useState([])

  // ---------- البحث عن منتج / السكانر ----------
  const [displaySearchTerm, setDisplaySearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [page, setPage] = useState(1)
  const [reason, setReason] = useState('')

  const searchInputRef = useRef(null)
  const quantityInputRef = useRef(null)

  const [submitting, setSubmitting] = useState(false)

  // ---------- سجل الهالك السابق ----------
  const [wasteHistory, setWasteHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchWasteHistory()
  }, [])

  useEffect(() => {
    if (!loadingData) {
      searchInputRef.current?.focus()
    }
  }, [loadingData])

  const fetchProducts = async () => {
    setLoadingData(true)
    try {
      const res = await apiFetch(`point-of-sale/products`, { method: "GET" })
      const json = await res.json()
      if (json.status) {
        setProducts(json.data.products || [])
      } else {
        Swal.fire({
          toast: true,
          position: 'center',
          icon: "error",
          title: 'فشل تحميل بيانات المنتجات',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (err) {
      Swal.fire({
        toast: true,
        position: 'center',
        icon: "error",
        title: 'تعذر الاتصال بالخادم، تأكد من تشغيل السيرفر',
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setLoadingData(false)
    }
  }

  const fetchWasteHistory = async (newPage) => {
    setLoadingHistory(true)
    try {
      const res = await apiFetch(`wastes?page=${newPage}`, { method: "GET" })
      const json = await res.json()
      if (json.status) {
        // paginate() في Laravel بترجع الصفوف جوه json.data.data مش json.data مباشرة
        setWasteHistory(json.data.data || [])
        setPage(json.data.current_page)
        setLastPage(json.data.last_page)

      } else {
        Swal.fire({
          toast: true,
          position: 'center',
          icon: "error",
          title: 'فشل تحميل سجل الهالك',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        toast: true,
        position: 'center',
        icon: "error",
        title: 'تعذر تحميل سجل الهالك',
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setLoadingHistory(false)
    }
  }
  const handlePageChange = (newPage) => {
    fetchWasteHistory(newPage);
  };

  const searchResults = useMemo(() => {
    const term = displaySearchTerm.trim().toLowerCase()
    if (!term || selectedProduct) return []

    const filtered = [];
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (p.barcode?.toString().toLowerCase().includes(term) || p.name?.toLowerCase().includes(term)) {
        filtered.push(p);
        if (filtered.length >= 12) break;
      }
    }
    return filtered;
  }, [displaySearchTerm, products, selectedProduct]);

  const noResultsFound = displaySearchTerm.trim() !== '' && !selectedProduct && searchResults.length === 0

  const resetSearchState = () => {
    setDisplaySearchTerm('')
    setSelectedProduct(null)
    setQuantity(1)
    setReason('')
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }

  const handleSearchChange = (value) => {
    setDisplaySearchTerm(value)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()

    const barcode = e.target.value.trim()
    const product = products.find(p => String(p.barcode).trim() === barcode)

    if (product) {
      handleSelectProduct(product)
      return
    }

    Swal.fire({
      toast: true,
      position: 'center',
      icon: "error",
      title: 'الباركود غير موجود',
      showConfirmButton: false,
      timer: 3000,
    });
  }

  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setDisplaySearchTerm(product.name)
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
      Swal.fire({
        toast: true,
        position: 'center',
        icon: "error",
        title: 'اختر منتجًا أولاً',
        showConfirmButton: false,
        timer: 3000,
      });
      return
    }

    const quantityNum = Number(quantity)
    if (!quantityNum || quantityNum <= 0) {
      Swal.fire({
        toast: true,
        position: 'center',
        icon: "error",
        title: 'الكمية غير صحيحة',
        showConfirmButton: false,
        timer: 3000,
      });
      return
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product_id === selectedProduct.id)
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantityNum,
          reason: reason || updated[existingIndex].reason,
        }
        return updated
      }
      return [
        {
          product_id: selectedProduct.id,
          name: selectedProduct.name,
          barcode: selectedProduct.barcode,
          quantity: quantityNum,
          reason: reason || '',
        },
        ...prev
      ]
    })

    Swal.fire({
      toast: true,
      position: 'center',
      icon: "success",
      title: `تمت إضافة "${selectedProduct.name}" لقائمة الهالك`,
      showConfirmButton: false,
      timer: 3000,
    });

    resetSearchState()
  }

  const handleRemoveItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId))
  }

  const handleUpdateItem = (productId, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item
        if (field === 'quantity') {
          const numValue = Number(value)
          return { ...item, quantity: Number.isNaN(numValue) ? 0 : numValue }
        }
        return { ...item, [field]: value }
      })
    )
  }

  const resetForm = () => {
    setItems([])
    resetSearchState()
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      Swal.fire({
        toast: true,
        position: 'center',
        icon: "error",
        title: 'أضف صنفًا واحدًا على الأقل',
        showConfirmButton: false,
        timer: 3000,
      });
      return
    }

    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'تأكيد تسجيل الهالك',
      text: `هيتم خصم ${items.length} صنف من المخزون نهائيًا، متأكد؟`,
      showCancelButton: true,
      confirmButtonText: 'تأكيد',
      cancelButtonText: 'إلغاء',
    })

    if (!confirm.isConfirmed) return

    setSubmitting(true)
    try {
      const res = await apiFetch(`wastes`, {
        headers: { "Content-Type": "application/json" },
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            reason: i.reason || null,
          })),
        }),
      })

      const json = await res.json()

      if (json.status) {
        Swal.fire({
          toast: true,
          position: 'center',
          icon: "success",
          title: 'تم تسجيل الهالك وخصمه من المخزون',
          showConfirmButton: false,
          timer: 3000,
        });
        resetForm()
        fetchWasteHistory()
      } else {
        Swal.fire({
          toast: true,
          position: 'center',
          icon: "error",
          title: json.message || 'فشل تسجيل الهالك',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        toast: true,
        position: 'center',
        icon: "error",
        title: 'حدث خطأ أثناء تسجيل الهالك',
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="invoice-page pos-screen-only" dir="rtl">
        <p className="loading-text">جاري تحميل البيانات </p>
      </div>
    )
  }

  return (
    <div className="invoice-page pos-screen-only" dir="rtl">
      <div className="invoice-header">
        <h3>تسجيل الهالك</h3>
        <p className="invoice-subtitle">اختر المنتج، حدد الكمية والسبب، وسيتم خصمها من المخزون عند التأكيد</p>
      </div>

      <section className="card">
        <h4 className="card-title">اختيار المنتج</h4>

        <div className="form-row">
          <div className="field search-field">
            <label>بحث بالاسم أو الباركود</label>
            <input
              ref={searchInputRef}
              type="text"
              value={displaySearchTerm}
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
                    <span className="dropdown-item-barcode">{p.barcode || '-'}</span>
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
                <label>الكمية</label>
                <input
                  ref={quantityInputRef}
                  type="number"
                  min="0.01"
                  step="0.01"
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
              <div className="field">
                <label>السبب (اختياري)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: انتهاء الصلاحية، كسر..."
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
        <h4 className="card-title">قائمة الهالك ({items.length})</h4>

        {items.length === 0 ? (
          <p className="empty-text">لم تتم إضافة أي صنف بعد</p>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الباركود</th>
                <th>الكمية</th>
                <th>السبب</th>
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
                      min="0.01"
                      step="0.01"
                      value={i.quantity}
                      onChange={(e) => handleUpdateItem(i.product_id, 'quantity', e.target.value)}
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={i.reason}
                      onChange={(e) => handleUpdateItem(i.product_id, 'reason', e.target.value)}
                      className="table-input"
                    />
                  </td>
                  <td>
                    <button type="button" className="btn btn-danger-text" onClick={() => handleRemoveItem(i.product_id)}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="submit-bar">
        <button
          type="button"
          className="btn btn-primary btn-large"
          disabled={submitting || items.length === 0}
          onClick={handleSubmit}
        >
          {submitting ? 'جارٍ التسجيل...' : `تسجيل الهالك وخصمه من المخزون (${items.length} صنف)`}
        </button>
      </div>

      <section className="card">
        <h4 className="card-title">سجل الهالك السابق</h4>

        {loadingHistory ? (
          <p className="loading-text">جاري التحميل...</p>
        ) : wasteHistory.length === 0 ? (
          <p className="empty-text">لا يوجد هالك مسجل بعد</p>
        ) : (
          <>
            <table className="items-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>السبب</th>
                  <th>بواسطة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {wasteHistory.map((w) => (
                  <tr key={w.id}>
                    <td>{w.product?.name || '-'}</td>
                    <td>{w.quantity}</td>
                    <td className="muted">{w.reason || '-'}</td>
                    <td className="muted">{w.user?.name || '-'}</td>
                    <td className="muted">{new Date(w.created_at).toLocaleString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={page}
              lastPage={lastPage}
              onPageChange={handlePageChange}
            />
          </>

        )}
      </section>
    </div>
  )
}

export default WastePage;