import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ThreeDot } from "react-loading-indicators";
import { apiFetch } from "@/Components/apiFetch";
import { useAuth } from "@/context/AuthContext";

const SERVER_BASE = import.meta.env.VITE_SERVER_BASE
function Invoices() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { can } = useAuth();

  const token = localStorage.getItem("token");
  useEffect(() => {
    fetchPurchases()
  }, [])
  const fetchPurchases = async () => {

    try {
      setLoading(true)
      const response = await apiFetch(`purchases`, {
        method: "GET",
      }
      );
      const data = await response.json()
      setPurchases(data.purchases);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setLoading(false);
    }
  }
  const deletePurchaseduct = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تستطيع التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });
    if (!result.isConfirmed) return;
    const formData = new FormData();
    formData.append("_method", "DELETE");
    const response = await apiFetch(`purchases/${id}`, {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم الحذف بنجاح", showConfirmButton: false, timer: 2000 });
      fetchPurchases(); // ✅ الاسم الصح

    } else {
      Swal.fire({ toast: true, position: "top-start", icon: "error", title: "حدث خطأ أثناء الحذف", timer: 3000, showConfirmButton: false });
    }

  }

  return (
    <>

      {can('invoices.create') && (
        <NavLink to="/invoices/create" className="mb-2 btn btn-primary" >
          اضافه فاتوره
        </NavLink>
      )}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <ThreeDot color="#8B5E3C" size="medium" />
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="styled-table">
            <thead>
              <tr>
                <th>#</th>
                <th>المورد</th>
                <th>عدد المنتجات</th>
                <th>المبلغ</th>
                <th>صوره الفاتوره </th>
                <th> تاريخ الفاتوره </th>
                {(can('invoices.delete') || can('invoices.edit')) && (
                  <th>الإجراءات</th>
                )}
              </tr>
            </thead>
            <tbody>
              {purchases.length > 0 ? (
                purchases.map((purchase, index) => (
                  <tr key={purchase.id}>
                    <td><NavLink to={`/invoices/edit/${purchase.id}`}>#{purchase.id}</NavLink></td>
                    <td>{purchase.supplier.name}</td>
                    <td>{purchase.items_count}</td>
                    <td>{purchase.total}</td>
                    <td>
                      <a
                        href={`${SERVER_BASE}/${purchase.image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        عرض
                      </a>
                    </td>
                    <td>{purchase.date}</td>
                    {(can('invoices.delete') || can('invoices.edit')) && (

                      <td>
                        {can('invoices.edit') && (

                          <NavLink
                            className="btn btn-ghost btn-sm btn-icon me-1"
                            to={`/invoices/edit/${purchase.id}`}
                          >
                            <FiEdit2 />
                          </NavLink>
                        )}
                        {can('invoices.delete') && (
                          <button
                            className="btn btn-danger btn-sm btn-icon mx-2"
                            onClick={() => deletePurchaseduct(purchase.id)}
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    لا يوجد فواتير
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )

      }


    </>
  )
}

export default Invoices
