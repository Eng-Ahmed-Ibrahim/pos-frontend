import { useState } from 'react'
import Swal from 'sweetalert2'
import { apiFetch } from "@/Components/apiFetch";


function Returned() {
  const [searchId, setSearchId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sale, setSale] = useState(null)

  const [returnQuantities, setReturnQuantities] = useState({})
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const remainingQty = (item) => item.quantity - (item.returned_quantity || 0)

  const fetchSale = async () => {
    const id = searchId.trim()
    if (!id) {
      setError('من فضلك أدخل رقم الفاتورة')
      return
    }
    setError('')
    setSale(null)
    setReturnQuantities({})
    setLoading(true)
    try {
      const res = await apiFetch(`sales/${id}`)
      const json = await res.json()
      if (res.ok && json.status) {
        setSale(json.data.sale)
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
      fetchSale()
    }
  }

  const toggleItem = (item, checked) => {
    setReturnQuantities((prev) => {
      const updated = { ...prev }
      if (checked) {
        updated[item.id] = remainingQty(item)
      } else {
        delete updated[item.id]
      }
      return updated
    })
  }

  const setItemQuantity = (item, value) => {
    const max = remainingQty(item)
    let qty = Number(value)
    if (Number.isNaN(qty)) qty = 0
    if (qty > max) qty = max
    if (qty < 0) qty = 0
    setReturnQuantities((prev) => ({ ...prev, [item.id]: qty }))
  }

  const selectAll = () => {
    if (!sale) return
    const all = {}
    sale.items.forEach((item) => {
      const max = remainingQty(item)
      if (max > 0) all[item.id] = max
    })
    setReturnQuantities(all)
  }

  const clearSelection = () => setReturnQuantities({})

  const selectedItems = sale
    ? sale.items.filter((item) => (returnQuantities[item.id] || 0) > 0)
    : []

  const returnTotal = selectedItems.reduce(
    (sum, item) => sum + returnQuantities[item.id] * Number(item.price),
    0
  )

  const handleSubmitReturn = async () => {
    if (!sale) return
    if (selectedItems.length === 0) {
      setError('اختر صنفًا واحدًا على الأقل لإرجاعه')
      return
    }

    const result = await Swal.fire({
      title: 'تأكيد عملية الإرجاع',
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
      const res = await apiFetch(`sales/${sale.id}/return`, {
        method: 'POST',
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({
          reason: reason || null,
          items: selectedItems.map((item) => ({
            sale_item_id: item.id,
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
          title: 'تم تنفيذ الإرجاع بنجاح',
          showConfirmButton: false,
          timer: 2500,
        })
        setSale(json.data.sale)
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
        <h2>مرتجعات المبيعات</h2>
        <p>ابحث برقم الفاتورة لاسترجاع كل أو بعض الأصناف</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-panel card-spacer" style={{ maxWidth: 'none' }}>
        <div className="search-row">
          <div className="form-group">
            <label>رقم الفاتورة</label>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="ادخل رقم الفاتورة..."
              autoFocus
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={fetchSale} disabled={loading}>
            {loading ? 'جارٍ البحث...' : 'بحث'}
          </button>
        </div>
      </div>

      {sale && (
        <>
          <div className="form-panel card-spacer" style={{ maxWidth: 'none' }}>
            <div className="section-title">
              بيانات الفاتورة #{sale.id}
            </div>
            <div className="invoice-summary">
              <div className="item">
                <span className="label">العميل</span>
                <span className="value">{sale.customer_name || 'عميل نقدي'}</span>
              </div>
              <div className="item">
                <span className="label">الإجمالي</span>
                <span className="value">{sale.total} ج.م</span>
              </div>
              <div className="item">
                <span className="label">الحالة</span>
                <span className="value">{statusBadge(sale.status)}</span>
              </div>
              <div className="item">
                <span className="label">التاريخ</span>
                <span className="value">{new Date(sale.created_at).toLocaleString('ar-EG')}</span>
              </div>
            </div>
          </div>

          <div className="table-wrap card-spacer">
            <div className="table-header">
              <div className="section-title" style={{ margin: 0 }}>
                أصناف الفاتورة <span>({sale.items.length})</span>
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
                  <th>الكمية المباعة</th>
                  <th>مرتجع سابقًا</th>
                  <th>المتاح للإرجاع</th>
                  <th>الكمية المراد إرجاعها</th>
                  <th>السعر</th>
                  <th>إجمالي الإرجاع</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => {
                  const max = remainingQty(item)
                  const selectedQty = returnQuantities[item.id] || 0
                  const fullyReturned = max === 0
                  return (
                    <tr key={item.id} className={fullyReturned ? 'row-disabled' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          disabled={fullyReturned}
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
                          disabled={fullyReturned || selectedQty === 0}
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
                placeholder="مثال: منتج تالف، عميل غيّر رأيه..."
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

export default Returned