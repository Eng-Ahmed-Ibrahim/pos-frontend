import { useEffect, useState } from 'react';
import { apiFetch } from "@/Components/apiFetch";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2, FiFilter } from "react-icons/fi";
import { ThreeDot } from "react-loading-indicators";
import Pagination from "@/Components/Pagination";
import { IoIosPrint } from "react-icons/io";
import { NavLink } from 'react-router-dom';
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";

function Reports() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // حالات الفلترة (Filter States)
  const [filterType, setFilterType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // حالة حفظ الإجمالي الإجمالي القادم من الباك ايند
  const [summary, setSummary] = useState({ grand_total: 0, grand_amount_paid: 0 });

  // دالة جلب التقارير مدمج بها الفلاتر
  const fetchReports = async (pageNumber = 1) => {
    setLoading(true);
    try {
      // بناء الـ Query Parameters للـ API
      let queryParams = `page=${pageNumber}`;
      if (filterType) {
        queryParams += `&filter_type=${filterType}`;
      }
      if (filterType === 'custom') {
        if (fromDate) queryParams += `&from_date=${fromDate}`;
        if (toDate) queryParams += `&to_date=${toDate}`;
      }

      const response = await apiFetch(`reports?${queryParams}`);
      const data = await response.json();

      setReports(data.reports || []);
      setSummary(data.summary || { grand_total: 0, grand_amount_paid: 0 });
      setPage(data.pagination?.current_page || 1);
      setLastPage(data.pagination?.last_page || 1);
    } catch (error) {
      Swal.fire({
        toast: true,
        position: "top-start",
        icon: "error",
        title: "حدث خطأ ما",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // دالة تُنفذ عند الضغط على زر "تطبيق الفلتر"
  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReports(1); // البدء من الصفحة الأولى دائماً عند الفلترة الجديدة
  };

  // دالة لتغيير الصفحة عند الضغط على الـ Pagination
  const handlePageChange = (pageNumber) => {
    fetchReports(pageNumber);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <>
      {/* ===== SECTION FILTERS ===== */}
      <div className="filter-wrapper  p-3 mb-4" >
        <form onSubmit={handleApplyFilter} className="row align-items-end g-3">
          
          <div className="col-md-3">
            <select 
              className="form-select" 
              value={filterType} 
              onChange={(e) => {
                setFilterType(e.target.value);
                if(e.target.value !== 'custom') {
                  setFromDate("");
                  setToDate("");
                }
              }}
            >
              <option disabled>--- اختر  --- </option>
              <option value="daily" selected>تقرير يومي</option>
              <option value="weekly">تقرير أسبوعي</option>
              <option value="monthly">تقرير شهري</option>
              <option value="custom">تاريخ مخصص (من / إلى)</option>
            </select>
          </div>

          {filterType === "custom" && (
            <>
              <div className="col-md-3">
                <label className="form-label fw-bold" style={{ color: '#8B5E3C' }}>من تاريخ</label>
                <input 
                  type="date" 
                  className="form-select" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold" style={{ color: '#8B5E3C' }}>إلى تاريخ</label>
                <input 
                  type="date" 
                  className="form-select" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="col-md-2">
            <button type="submit" className="btn w-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#8B5E3C', color: '#fff' }}>
              <FiFilter className="me-2" /> فلتر
            </button>
          </div>
        </form>
      </div>

      {/* ===== TABLE ===== */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <ThreeDot color="#8B5E3C" size="medium" />
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>المنتج</th>
                  <th>الكميه</th>
                  <th>المبلغ</th>
                </tr>
              </thead>

              <tbody>
                {reports.length > 0 ? (
                  reports.map((rep, index) => (
                    <tr key={rep.id}>
                      <td>{index + 1}</td>
                      <td>{rep.product.name}</td>
                      <td>{rep.total_quantity}</td>
                      <td>{rep.total_sales}</td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                      لا يوجد تقارير تطابق البحث
                    </td>
                  </tr>
                )}
              </tbody>

              {/* صف الإجماليات الشامل (Grand Total Row) لجميع الفواتير المتطابقة وليس الـ pagination فقط */}
              {reports.length > 0 && (
                <tfoot style={{ backgroundColor: '#f5f0eb', fontWeight: 'bold', borderTop: '2px solid #8B5E3C' }}>
                  <tr>
                    <td style={{ color: '#8B5E3C' }}>الإجمالي  :</td>
                    <td style={{ fontSize:"18px" }}>{summary.grand_total.toFixed(2)}</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* PAGINATION COMPONENT */}
          <Pagination
            currentPage={page}
            lastPage={lastPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}

export default Reports;