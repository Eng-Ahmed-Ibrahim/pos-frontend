import { useEffect, useState } from 'react'

import Swal from "sweetalert2";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ThreeDot } from "react-loading-indicators";
import { apiFetch } from "@/Components/apiFetch";
import { useAuth } from "@/context/AuthContext";

const SERVER_BASE = import.meta.env.VITE_SERVER_BASE
const API_BASE = import.meta.env.VITE_API_URL;
function SubCategory() {
  const { can } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('')
  const [modalMode, setModalMode] = useState('add')
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const token = localStorage.getItem("token");
  // Edit states
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')

  useEffect(() => {
    fetchSubCategories()
  }, [])

  const fetchSubCategories = async () => {
    try {
      setLoading(true)
      const response = await apiFetch(`sub-categories`, {
        method: "GET",
      })
      const data = await response.json()
      setCategories(data.data['categories'])
      setSubCategories(data.data['sub_categories'])
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  const addSubCategory = async () => {
    if (!name.trim() || !categoryId) {
      Swal.fire({ toast: true, position: "top-start", icon: "error", title: "الاسم والفئة مطلوبان", showConfirmButton: false, timer: 3000 });
      return;
    }
    try {
      setSubmitLoading(true)
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category_id", categoryId)

      const response = await apiFetch(`sub-categories`, {
        method: "POST",
        body: formData
      })
      if (response.ok) {
        Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم الاضافه بنجاح", showConfirmButton: false, timer: 2000 });
        fetchSubCategories(); // ✅ الاسم الصح
        setName('')
        setCategoryId('')
        document.getElementById("Modal").querySelector('[data-bs-dismiss="modal"]').click(); // ✅ ID الصح
      } else {
        Swal.fire({ toast: true, position: "top-start", icon: "error", title: "حدث خطأ أثناء الاضافه", timer: 3000, showConfirmButton: false });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitLoading(false)
    }
  }

  const openEditModal = (sub) => {
    setEditId(sub.id)
    setEditName(sub.name)
    setEditCategoryId(sub.category_id)
    setModalMode('edit')
  }

  const editSubCategory = async () => {
    if (!editName.trim() || !editCategoryId) {
      Swal.fire({ toast: true, position: "top-start", icon: "error", title: "الاسم والفئة مطلوبان", showConfirmButton: false, timer: 3000 });
      return;
    }
    try {
      setSubmitLoading(true)
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("category_id", editCategoryId);
      formData.append("_method", "PUT");

      const response = await apiFetch(`sub-categories/${editId}`, {
        method: "POST",
        body: formData
      })
      if (response.ok) {
        Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم التعديل بنجاح", showConfirmButton: false, timer: 2000 });
        fetchSubCategories();
        document.getElementById("editModal").querySelector('[data-bs-dismiss="modal"]').click();
      } else {
        Swal.fire({ toast: true, position: "top-start", icon: "error", title: "حدث خطأ أثناء التعديل", timer: 3000, showConfirmButton: false });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitLoading(false)
    }
  }

  const deleteSubCategory = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تستطيع التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true)
      const response = await apiFetch(`sub-categories/${id}`, {
        method: "DELETE",
      })
      const data = await response.json();
      if (response.ok) {
        Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم الحذف بنجاح", showConfirmButton: false, timer: 2000 });
        fetchSubCategories();
      } else {
        Swal.fire({
          toast: true,
          position: "top-start",
          icon: "error",
          title: data.message || "حدث خطأ أثناء الحذف",
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {can('sub_categories.create') && (

        <div className="mb-3 btn btn-primary" onClick={() => setModalMode('add')} data-bs-toggle="modal" data-bs-target="#Modal">
          اضافه فئه فرعيه جديده
        </div>
      )}

      {/* ===== TABLE ===== */}
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
                <th>اسم الفئة الفرعية</th>
                <th>الفئة الرئيسية</th>
                {(can('sub_categories.eidt') || can('sub_categories.delete')) && (

                  <th>الإجراءات</th>
                )}
              </tr>
            </thead>
            <tbody>
              {subCategories.length > 0 ? (
                subCategories.map((sub, index) => (
                  <tr key={sub.id}>
                    <td>{index + 1}</td>
                    <td>{sub.name}</td>
                    <td>
                      <span className="badge-category">
                        {categories.find(c => c.id === sub.category_id)?.name || '—'}
                      </span>
                    </td>
                    {(can('sub_categories.eidt') || can('sub_categories.delete')) && (

                      <td>
                        {can('sub_categories.edit') && (

                          <button
                            className="btn btn-ghost btn-sm btn-icon me-1"
                            onClick={() => openEditModal(sub)}
                            data-bs-toggle="modal"
                            data-bs-target="#editModal"
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {can('sub_categories.delete') && (

                          <button
                            className="btn btn-danger btn-sm btn-icon mx-2"
                            onClick={() => deleteSubCategory(sub.id)}
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
                  <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    📭 لا يوجد فئات فرعية
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== ADD MODAL ===== */}
      <div className="modal fade" id="Modal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">اضافه فئه فرعيه</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">الاسم</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="form-control" placeholder="الاسم" />
                </div>
                <div className="col-12">
                  <label className="form-label">اختار الفئة</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="form-select">
                    <option value="">اختار الفئة</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
              <button type="button" className="btn btn-primary" disabled={submitLoading} onClick={addSubCategory}>
                {submitLoading ? (<><span className="spinner-border spinner-border-sm me-2" />جاري الإضافة...</>) : "اضافه"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      <div className="modal fade" id="editModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">تعديل فئه فرعيه</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">الاسم</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} type="text" className="form-control" placeholder="الاسم" />
                </div>
                <div className="col-12">
                  <label className="form-label">اختار الفئة</label>
                  <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} className="form-select">
                    <option value="">اختار الفئة</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
              <button type="button" className="btn btn-primary" disabled={submitLoading} onClick={editSubCategory}>
                {submitLoading ? (<><span className="spinner-border spinner-border-sm me-2" />جاري التعديل...</>) : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SubCategory