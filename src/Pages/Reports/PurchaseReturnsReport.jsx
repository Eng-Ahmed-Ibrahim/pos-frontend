import { useEffect, useState } from "react";
import Select from "react-select";
import { apiFetch } from "@/Components/apiFetch";

function PurchaseReturnsReports() {
  const [returns, setReturns] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    supplier_id: "",
    from: today,
    to: today,
  });

  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const filterParameters = `supplier_id=${filters.supplier_id}&to=${filters.to}&from=${filters.from}`;
      const response = await apiFetch(`purchase-returns-reports?${filterParameters}`);
      const data = await response.json();

      // افتراض الهيكل القادم من الـ Backend بناءً على النمط السابق
      setReturns(data.data.returns);
      setTotalAmount(data.data.total_amount);
      setTotalCount(data.data.total_count);
      setSuppliers(data.data.suppliers);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3"> تقارير مرتجعات المشتريات </h3>
      <div className="row mb-4">
        {/* فلتر الموردين */}
        <div className="col-lg-4 col-md-6 mb-3">
          <label className="form-label fw-semibold">
            <i className="bi bi-truck me-1"></i>
            المورد
          </label>

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
                .map(sup => ({
                  value: sup.id,
                  label: sup.name
                }))
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

        {/* تاريخ البداية */}
        <div className="col-md-3 mb-3">
          <label className="form-label">من</label>
          <input
            type="date"
            className="form-control"
            value={filters.from}
            onChange={(e) =>
              setFilters({
                ...filters,
                from: e.target.value
              })
            }
          />
        </div>

        {/* تاريخ النهاية */}
        <div className="col-md-3 mb-3">
          <label className="form-label">إلى</label>
          <input
            type="date"
            className="form-control"
            value={filters.to}
            onChange={(e) =>
              setFilters({
                ...filters,
                to: e.target.value
              })
            }
          />
        </div>

        {/* زر البحث */}
        <div className="col-md-2 d-flex align-items-end mb-3">
          <button
            className="btn btn-primary w-100 d-flex justify-center"
            onClick={fetchData}
          >
            بحث
          </button>
        </div>
      </div>

      {/* بطاقات الملخص الإحصائي */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            minWidth: "250px",
            boxShadow: "0 2px 10px rgba(0,0,0,.08)",
            borderLeft: "5px solid #dc3545",
          }}
        >
          <div style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>
            إجمالي مبلغ المرتجعات
          </div>
          <div style={{ fontSize: "30px", fontWeight: "bold", color: "#dc3545" }}>
            <div>
              {Number(totalAmount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              جنيه
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            minWidth: "250px",
            boxShadow: "0 2px 10px rgba(0,0,0,.08)",
            borderLeft: "5px solid #0dcaf0",
          }}
        >
          <div style={{ fontSize: "14px", color: "#6c757d", marginBottom: "8px" }}>
            عدد فواتير المرتجع
          </div>
          <div style={{ fontSize: "30px", fontWeight: "bold", color: "#0dcaf0" }}>
            <div>{totalCount} فواتير</div>
          </div>
        </div>
      </div>

      {/* جدول العرض */}
      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              <th>م </th>
              <th>المورد</th>
              <th>المنتجات المرتجعة</th>
              <th>السبب</th>
              <th>إجمالي المبلغ</th>
              <th>بواسطة</th>
              <th>التاريخ</th>
            </tr>
          </thead>

          <tbody>
            {returns && returns.length > 0 ? (
              returns.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.supplier?.name ?? "غير معروف"}</td>
                  <td>
                    {item.items?.map((subItem) => (
                      <div key={subItem.id}>
                        {subItem.product?.name} ({subItem.quantity} × {subItem.price})
                      </div>
                    ))}
                  </td>
                  <td>{item.reason || "لا يوجد سبب"}</td>
                  <td className="text-danger fw-bold">{item.total_amount}</td>
                  <td>{item.user?.name ?? "غير معروف"}</td>
                  <td className="muted">
                    {new Date(item.created_at).toLocaleString('ar-EG')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  لا توجد بيانات متاحة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PurchaseReturnsReports;