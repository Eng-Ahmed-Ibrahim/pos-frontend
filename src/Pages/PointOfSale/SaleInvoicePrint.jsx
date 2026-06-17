import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './styles.css'
const API_BASE = import.meta.env.VITE_API_URL

function SaleInvoicePrint() {
    const { id } = useParams()
    const [sale, setSale] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchSale()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const fetchSale = async () => {
        setLoading(true)
        setError('')
        try {
            // عدّل المسار حسب الراوت الموجود لديك لجلب بيانات عملية بيع واحدة
            const res = await fetch(`${API_BASE}/sales/${id}`)
            const json = await res.json()
            if (json.status) {
                setSale(json.sale || json.data)
            } else {
                setError('تعذر تحميل بيانات الفاتورة')
            }
        } catch (err) {
            setError('تعذر الاتصال بالخادم')
        } finally {
            setLoading(false)
        }
    }

    // طباعة تلقائية فور تحميل بيانات الفاتورة بنجاح
    useEffect(() => {
        if (sale) {
            const timer = setTimeout(() => window.print(), 300)
            return () => clearTimeout(timer)
        }
    }, [sale])

    if (loading) {
        return <p className="receipt-loading">جاري تحميل الفاتورة...</p>
    }

    if (error || !sale) {
        return <p className="receipt-loading">{error || 'الفاتورة غير موجودة'}</p>
    }

    const items = sale.items || []
    const total = Number(
        sale.total ?? items.reduce((sum, i) => sum + Number(i.total ?? i.quantity * i.price), 0)
    )
    const amountPaid = sale.amount_paid != null ? Number(sale.amount_paid) : null
    const change = amountPaid != null ? amountPaid - total : null

    return (
        <div className="receipt-page" dir="rtl">
            <div className="receipt">
                <div className="receipt-header">
                    {/* عدّل اسم المتجر وبياناته هنا */}
                    <h2>هايبر دار ضباط المشاة</h2>
                    <p>فاتورة بيع رقم #{sale.id}</p>
                    <p>{sale.created_at ? String(sale.created_at).slice(0, 16).replace('T', ' ') : ''}</p>
                    {sale.customer_name && <p>العميل: {sale.customer_name}</p>}
                </div>

                <table className="receipt-table">
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>كمية</th>
                            <th>سعر</th>
                            <th>إجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it) => (
                            <tr key={it.id || it.product_id}>
                                <td>{it.product?.name || it.name}</td>
                                <td>{it.quantity}</td>
                                <td>{Number(it.price).toFixed(2)}</td>
                                <td>{Number(it.total ?? it.quantity * it.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="receipt-totals">
                    <div className="receipt-total-row bold">
                        <span>الإجمالي</span>
                        <span>{total.toFixed(2)}</span>
                    </div>
                    {amountPaid != null && (
                        <>
                            <div className="receipt-total-row">
                                <span>المدفوع</span>
                                <span>{amountPaid.toFixed(2)}</span>
                            </div>
                            <div className="receipt-total-row">
                                <span>الباقى</span>
                                <span>{change >= 0 ? change.toFixed(2) : '0.00'}</span>
                            </div>
                        </>
                    )}
                </div>

                <p className="receipt-footer">شكرًا لتعاملكم معنا</p>
            </div>

        </div>
    )
}

export default SaleInvoicePrint