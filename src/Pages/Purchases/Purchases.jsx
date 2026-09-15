import { useEffect, useState } from "react";
import { NavLink, useSearchParams, useLocation } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ThreeDot } from "react-loading-indicators";
import { apiFetch } from "@/Components/apiFetch";
import { useAuth } from "@/context/AuthContext";

const SERVER_BASE = import.meta.env.VITE_SERVER_BASE;

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0); // حالة إجمالي المبالغ
  const [loading, setLoading] = useState(false);
  const { can } = useAuth();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'normal'; 
  const location = useLocation();

  const today = new Date().toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    supplier_id: "",
    from: today,
    to: today,   
  });

  useEffect(() => {
    fetchPurchases();
  }, [location.search]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        type: type,
        supplier_id: filters.supplier_id,
        from: filters.from,
        to: filters.to,
      }).toString();

      const response = await apiFetch(`purchases?${queryParams}`, {
        method: "GET",
      });
      const data = await response.json();
      
      setPurchases(data.purchases);
      setTotalAmount(data.total_amount || 0); // استقبال الإجمالي من الـ API
      if (data.suppliers) {
        setSuppliers(data.suppliers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      fetchPurchases();
    } else {
      Swal.fire({ toast: true, position: "top-start", icon: "error", title: "حدث خطأ أثناء الحذف", timer: 3000, showConfirmButton: false });
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        {can('invoices.create') && (
          <NavLink to={type === "bonus" ? "/create-bonus" : "/invoices/create"} className="btn btn-primary">
            اضافه فاتوره
          </NavLink>
        )}
      </div>

      {/* قسم الفلاتر (الموردين والتاريخ) */}
      <div className="row mb-4 bg-white p-3 rounded shadow-sm">
        <div className="col-lg-4 col-md-6 mb-3">
          <label className="form-label fw-semibold">المورد</label>
          <Select
            isClearable
            isSearchable
            placeholder="ابحث عن مورد..."
            options={suppliers.map(sup => ({
              value: sup.id,
              label: sup.name
            }))}
            value={
              suppliers
                .map(sup => ({ value: sup.id, label: sup.name }))
                .find(option => option.value == filters.supplier_id) || null
            }
            onChange={(selected) =>
              setFilters({
                ...filters,
                supplier_id: selected?.value || ""
              })
            }
          />
        </div>

        <div className="col-md-3 mb-3">
          <label className="form-label">من تاريخ</label>
          <input
            type="date"
            className="form-control"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>

        <div className="col-md-3 mb-3">
          <label className="form-label">إلى تاريخ</label>
          <input
            type="date"
            className="form-control"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>

        <div className="col-md-2 d-flex align-items-end mb-3">
          <button
            className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
            onClick={fetchPurchases}
          >
            بحث
          </button>
        </div>
      </div>

      {/* بطاقة عرض إجمالي المبالغ المفلترة */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,.08)",
            borderLeft: "5px solid #198754",
          }}>
            <div style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>
              إجمالي مبلغ الفواتير 
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#198754" }}>
              {Number(totalAmount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} جنيه
            </div>
          </div>
        </div>
      </div>

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
                <th>صوره الفاتوره</th>
                <th>تاريخ الفاتوره</th>
                {(can('invoices.delete') || can('invoices.edit')) && (
                  <th>الإجراءات</th>
                )}
              </tr>
            </thead>
            <tbody>
              {purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td><NavLink to={`/invoices/edit/${purchase.id}`}>#{purchase.id}</NavLink></td>
                    <td>{purchase.supplier?.name}</td>
                    <td>{purchase.items_count}</td>
                    <td>{purchase.items_sum_total}</td>
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
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    لا يوجد فواتير
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default Purchases;