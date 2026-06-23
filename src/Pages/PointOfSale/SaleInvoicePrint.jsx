import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './SaleInvoicePrint.css'
import { apiFetch } from "@/Components/apiFetch";
import logo from '/black_logo.png'
import { useAuth } from "../../context/AuthContext";

const VITE_SERVER_BASE = import.meta.env.VITE_SERVER_BASE
const invoice_logo = `${VITE_SERVER_BASE}/uploads/settings/invoice_logo.png`


const API_BASE = import.meta.env.VITE_API_URL


function SaleInvoicePrint({ invoiceId }) {
    const params = useParams()
    const id = invoiceId || params?.id
    console.log(id);
    const { systemSetting} = useAuth();

    const [sale, setSale] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const token = localStorage.getItem("token");
    useEffect(() => {
        if (id) {
            fetchSale()
        }
    }, [id])

    const fetchSale = async () => {
        setLoading(true)
        setError('')
        try {
            // عدّل المسار حسب الراوت الموجود لديك لجلب بيانات عملية بيع واحدة
            const res = await apiFetch(`sales/${id}`, {
                method: "GET",
            })
            const json = await res.json()
            console.log(json);

            if (json.status) {
                setSale(json.data.sale || json.data)
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
            const timer = setTimeout(() => window.print(), 500)
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
                    <div className='d-flex align-items-center justify-center'>
                        <img style={{ width: "100px" }} src={invoice_logo} alt="" />
                    </div>
                    <h2> {systemSetting('system_name')}  </h2>
                    <p>فاتورة بيع رقم #{sale.id}</p>
                    <p>
                        {sale.created_at
                            ? new Date(sale.created_at).toLocaleDateString("en-GB") +
                            " " +
                            new Date(sale.created_at).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })
                            : ""}
                    </p>
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
                                <td >{it.product?.name || it.name}</td>
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

                <p className="receipt-footer"> {systemSetting('invoice_address')} </p>
                <p className="receipt-footer"> للمقترحات والشكاوي {systemSetting('invoice_phone')}  </p>
                <p className="receipt-footer">شكرًا لتعاملكم معنا</p>
            </div>

        </div>
    )
}

export default SaleInvoicePrint