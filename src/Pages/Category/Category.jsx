import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ThreeDot } from "react-loading-indicators";
import { apiFetch } from "@/Components/apiFetch";
const SERVER_BASE = import.meta.env.VITE_SERVER_BASE
import { useAuth } from "@/context/AuthContext";

function Category() {
    const { can } = useAuth();
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editImage, setEditImage] = useState(null);
    const [editPerviewImage, setEditPerviewImage] = useState(null);
    const [editSubmitLoading, setEditSubmitLoading] = useState(false);
    const token = localStorage.getItem("token");
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await apiFetch("categories", { method: "GET" });


            const data = await response.json();
            setCategories(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async (e) => {
        e.preventDefault();
        if (!name || name.trim() === "") {
            Swal.fire({ toast: true, position: "top-start", icon: "error", title: "اسم الفئة مطلوب", showConfirmButton: false, timer: 3000 });
            return;
        }
        try {
            setSubmitLoading(true);
            const formData = new FormData();
            formData.append("name", name);
            if (image) formData.append("image", image);

            const response = await apiFetch("categories", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم إضافة الفئة بنجاح", showConfirmButton: false, timer: 2000 });
                setName("");
                setImage(null);
                fetchCategories();
                document.getElementById("addModal").querySelector('[data-bs-dismiss="modal"]').click();
            } else {
                Swal.fire({ toast: true, position: "top-start", icon: "error", title: "حدث خطأ أثناء الحفظ", timer: 3000, showConfirmButton: false });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitLoading(false);
        }
    };

    // ✅ بدون window.bootstrap
    const openEditModal = (category) => {
        setEditId(category.id);
        setEditName(category.name);
        setEditImage(null);
        setEditPerviewImage(category.image)
    };

    const editCategory = async (e) => {
        e.preventDefault();
        if (!editName || editName.trim() === "") {
            Swal.fire({ toast: true, position: "top-start", icon: "error", title: "اسم الفئة مطلوب", showConfirmButton: false, timer: 3000 });
            return;
        }
        try {
            setEditSubmitLoading(true);
            const formData = new FormData();
            formData.append("name", editName);
            formData.append("_method", "PUT");
            if (editImage) formData.append("image", editImage);

            const response = await apiFetch(`categories/${editId}`, {
                method: "POST",
                body: formData
            })

            // fetch(`${API_BASE}/categories/${editId}`, {
            //     method: "POST",
            //     body: formData,
            //     headers: { Accept: "application/json", "Authorization": `Bearer ${token}` },
            // });

            if (response.ok) {
                Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم التعديل بنجاح", showConfirmButton: false, timer: 2000 });
                fetchCategories();
                document.getElementById("editModal").querySelector('[data-bs-dismiss="modal"]').click();
            } else {
                Swal.fire({ toast: true, position: "top-start", icon: "error", title: "حدث خطأ أثناء التعديل", timer: 3000, showConfirmButton: false });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setEditSubmitLoading(false);
        }
    };

    const deleteCategory = async (id) => {
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
            setLoading(true);
            const response = await apiFetch(`categories/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (response.ok) {
                Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم الحذف بنجاح", showConfirmButton: false, timer: 2000 });
                fetchCategories();
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
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {can('categories.create') && (

                <div className="mb-2 btn btn-primary" data-bs-toggle="modal" data-bs-target="#addModal">
                    اضافه فئه جديده
                </div>
            )}

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                    <ThreeDot color="#8B5E3C" size="medium" />
                </div>
            ) : (
                <div className={categories.length > 0 ? "products-grid" : ""}>
                    {categories.length > 0 ? (
                        categories.map((p) => (
                            <div key={p.id} className="product-card">
                                <div className="product-img">
                                    <img src={`${SERVER_BASE}/` + p.image} alt="" style={{ width: "50px" }} />
                                </div>
                                <div className="product-body">
                                    <div className="pname">{p.name}</div>
                                </div>
                                <div className="product-actions">
                                    {/* ✅ data-bs-toggle على الزرار مباشرة */}
                                    {can('categories.edit') && (

                                        <button
                                            onClick={() => openEditModal(p)}
                                            className="btn btn-ghost btn-sm btn-icon"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editModal"
                                        >
                                            <FiEdit2 />
                                        </button>
                                    )}
                                    {can('categories.delete') && (

                                        <button onClick={() => deleteCategory(p.id)} className="btn btn-danger btn-sm btn-icon">
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-card product-card w-100">لا يوجد فئات</div>
                    )}
                </div>
            )}

            {/* ===== ADD MODAL ===== */}
            <div className="modal fade" id="addModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">اضافة فئة</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col">
                                    <input type="text" className="form-control" placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="col">
                                    <input type="file" className="form-control" onChange={(e) => setImage(e.target.files[0])} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
                            <button type="button" className="btn btn-primary" disabled={submitLoading} onClick={addCategory}>
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
                            <h1 className="modal-title fs-5">تعديل فئة</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3 " style={{ alignItems: 'end' }}>
                                <div className="col">
                                    <input type="text" className="form-control" placeholder="الاسم" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                </div>
                                <div className="col">
                                    <img src={SERVER_BASE + '/' + editPerviewImage} alt="" style={{ width: '50px' }} />
                                    <input type="file" className="form-control" onChange={(e) => setEditImage(e.target.files[0])} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
                            <button type="button" className="btn btn-primary" disabled={editSubmitLoading} onClick={editCategory}>
                                {editSubmitLoading ? (<><span className="spinner-border spinner-border-sm me-2" />جاري التعديل...</>) : "حفظ التعديلات"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Category;