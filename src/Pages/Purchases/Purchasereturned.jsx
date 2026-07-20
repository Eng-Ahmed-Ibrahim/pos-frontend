import { useState } from 'react'
import Swal from 'sweetalert2'
import { apiFetch } from "@/Components/apiFetch";


function PurchaseReturned() {
  const [searchId, setSearchId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [purchase, setPurchase] = useState(null)

  const [returnQuantities, setReturnQuantities] = useState({})
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // الفرق الأساسي عن المبيعات: المتاح للإرجاع هو remaining_stock مباشرة
  // (اللي لسه في المخزن ومترجعش قبل كده)، مش quantity - returned
  const availableToReturn = (item) => item.remaining_stock

  const fetchPurchase = async () => {
    const id = searchId.trim()
    if (!id) {
      setError('من فضلك أدخل رقم فاتورة المشتريات')
      return
    }
    setError('')
    setPurchase(null)
    setReturnQuantities({})
    setLoading(true)
    try {
      const res = await apiFetch(`purchases/${id}`)
      const json = await res.json()
      if (res.ok && json.status) {
        setPurchase(json.purchase) 
      } else {
        setError(json.message || 'لم يتم العثور على فاتورة بهذا الرقم')
      }
    } catch (err) {
      console.error(err)
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      fetchPurchase()
    }
  }

  const toggleItem = (item, checked) => {
    setReturnQuantities((prev) => {
      const updated = { ...prev }
      if (checked) {
        updated[item.id] = availableToReturn(item)
      } else {
        delete updated[item.id]
      }
      return updated
    })
  }

  const setItemQuantity = (item, value) => {
    const max = availableToReturn(item)
    let qty = Number(value)
    if (Number.isNaN(qty)) qty = 0
    if (qty > max) qty = max
    if (qty < 0) qty = 0
    setReturnQuantities((prev) => ({ ...prev, [item.id]: qty }))
  }

  const selectAll = () => {
    if (!purchase) return
    const all = {}
    purchase.items.forEach((item) => {
      const max = availableToReturn(item)
      if (max > 0) all[item.id] = max
    })
    setReturnQuantities(all)
  }

  const clearSelection = () => setReturnQuantities({})

  const selectedItems = purchase
    ? purchase.items.filter((item) => (returnQuantities[item.id] || 0) > 0)
    : []

  const returnTotal = selectedItems.reduce(
    (sum, item) => sum + returnQuantities[item.id] * Number(item.price),
    0
  )

  const handleSubmitReturn = async () => {
    if (!purchase) return
    if (selectedItems.length === 0) {
      setError('اختر صنفًا واحدًا على الأقل لإرجاعه')
      return
    }

    const result = await Swal.fire({
      title: 'تأكيد إرجاع المشتريات للمورد',
      text: `سيتم إرجاع ${selectedItems.length} صنف بإجمالي ${returnTotal.toFixed(2)} ج.م`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، تنفيذ الإرجاع',
      cancelButtonText: 'إلغاء',
    })
    if (!result.isConfirmed) return

    setSubmitting(true)
    setError('')
    try {
      const res = await apiFetch(`purchases/${purchase.id}/return`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reason || null,
          items: selectedItems.map((item) => ({
            purchase_item_id: item.id,
            quantity: returnQuantities[item.id],
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
        setPurchase(json.data.sale) // عدّلها لو غيرت المفتاح
        setReturnQuantities({})
        setReason('')
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

  const statusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-green">مكتملة</span>
      case 'partially_returned':
        return <span className="badge badge-amber">مرتجعة جزئيًا</span>
      case 'returned':
        return <span className="badge badge-red">مرتجعة بالكامل</span>
      default:
        return <span className="badge badge-blue">{status}</span>
    }
  }

  return (
    <div dir="rtl">
      <div className="page-header">
        <h2>مرتجعات المشتريات</h2>
        <p>ابحث برقم فاتورة المشتريات لإرجاع كل أو بعض الأصناف للمورد</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-panel card-spacer" style={{ maxWidth: 'none' }}>
        <div className="search-row">
          <div className="form-group">
            <label>رقم فاتورة المشتريات</label>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="ادخل رقم الفاتورة..."
              autoFocus
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={fetchPurchase} disabled={loading}>
            {loading ? 'جارٍ البحث...' : 'بحث'}
          </button>
        </div>
      </div>

      {purchase && (
        <>
          <div className="form-panel card-spacer" style={{ maxWidth: 'none' }}>
            <div className="section-title">
              بيانات فاتورة المشتريات #{purchase.id}
            </div>
            <div className="invoice-summary">
              <div className="item">
                <span className="label">المورد</span>
                <span className="value">{purchase.supplier?.name || '-'}</span>
              </div>
              <div className="item">
                <span className="label">الإجمالي</span>
                <span className="value">{purchase.total} ج.م</span>
              </div>
              <div className="item">
                <span className="label">الحالة</span>
                <span className="value">{statusBadge(purchase.status)}</span>
              </div>
              <div className="item">
                <span className="label">التاريخ</span>
                <span className="value">{new Date(purchase.date || purchase.created_at).toLocaleString('ar-EG')}</span>
              </div>
            </div>
          </div>

          <div className="table-wrap card-spacer">
            <div className="table-header">
              <div className="section-title" style={{ margin: 0 }}>
                أصناف الفاتورة <span>({purchase.items.length})</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={selectAll}>
                  تحديد الكل (إرجاع كامل)
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearSelection}>
                  إلغاء التحديد
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>المنتج</th>
                  <th>الباركود</th>
                  <th>الكمية المشتراة</th>
                  <th>مرتجع سابقًا</th>
                  <th>المتاح للإرجاع</th>
                  <th>الكمية المراد إرجاعها</th>
                  <th>السعر</th>
                  <th>إجمالي الإرجاع</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item) => {
                  const max = availableToReturn(item)
                  const selectedQty = returnQuantities[item.id] || 0
                  const noneAvailable = max === 0
                  return (
                    <tr key={item.id} className={noneAvailable ? 'row-disabled' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          disabled={noneAvailable}
                          checked={selectedQty > 0}
                          onChange={(e) => toggleItem(item, e.target.checked)}
                        />
                      </td>
                      <td>{item.product?.name}</td>
                      <td className="muted">{item.product?.barcode || '-'}</td>
                      <td>{item.quantity}</td>
                      <td>{item.returned_quantity || 0}</td>
                      <td>{max}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={max}
                          className="qty-input"
                          disabled={noneAvailable || selectedQty === 0}
                          value={selectedQty}
                          onChange={(e) => setItemQuantity(item, e.target.value)}
                        />
                      </td>
                      <td>{item.price}</td>
                      <td style={{ fontWeight: 700 }}>
                        {(selectedQty * Number(item.price)).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

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
              disabled={submitting || selectedItems.length === 0}
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