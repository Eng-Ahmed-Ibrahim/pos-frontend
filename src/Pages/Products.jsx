import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ThreeDot } from "react-loading-indicators";
const SERVER_BASE = import.meta.env.VITE_SERVER_BASE
const API_BASE = import.meta.env.VITE_API_URL;
import { apiFetch } from "@/Components/apiFetch";

function Products() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [barcodeNumber, setBarcodeNumber] = useState('');
    const [name, setName] = useState('');
    const [minimumStock, setMinimumStock] = useState(0);
    const [price, setPrice] = useState(0);
    const [subCategoryId, setSubCategoryId] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [editCategoryId, setEditCategoryId] = useState('');
    const [editBarcodeNumber, setEditBarcodeNumber] = useState('');
    const [editMinimumStock, setEditMinimumStock] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editName, setEditName] = useState('');
    const [editProductId, setEditProductId] = useState('');
    const [editSubCategoryId, setEditSubCategoryId] = useState('');
    const token = localStorage.getItem("token");
    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await apiFetch(`products`,{
                method:"GET",
            })
            const data = await response.json();
            setCategories(data.data['categories'])
            setSubCategories(data.data['sub_categories'])
            setProducts(data.data['products'])
            console.log("products ", products);


        } catch (error) {
            console.log("error ", error);

        } finally {
            setLoading(false)
        }
    }
    const openEditModal = (pro) => {
        setEditCategoryId(pro.category_id)
        setEditBarcodeNumber(pro.barcode)
        setEditName(pro.name)
        setEditProductId(pro.id)
        setEditSubCategoryId(pro.sub_category_id)
        setEditMinimumStock(pro.minimum_stock)
        setEditPrice(pro.price)
    }
    useEffect(() => {
        fetchProducts()
    }, [])
    const addProduct = async () => {
        if (!name?.trim() || !categoryId || !barcodeNumber) {
            Swal.fire({
                toast: true,
                position: "top-start",
                icon: "error",
                title: "من فضلك أكمل جميع البيانات",
                showConfirmButton: false,
                timer: 3000,
            });

            return;
        }
        try {
            setSubmitLoading(true)
            const formData = new FormData();
            formData.append('category_id', categoryId)
            formData.append('sub_category_id', subCategoryId)
            formData.append('name', name)
            formData.append('price',price)
            formData.append('minimum_stock',minimumStock)
            formData.append('barcode', barcodeNumber)
            const response = await apiFetch(`products`, {
                method: "POST",
                body: formData
            })

            if (response.ok) {
                Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم الاضافه بنجاح", showConfirmButton: false, timer: 2000 });
                fetchProducts(); // ✅ الاسم الصح
                setName('')
                setCategoryId('')
                setSubCategoryId('')
                setBarcodeNumber('')
                document.getElementById("Modal").querySelector('[data-bs-dismiss="modal"]').click(); // ✅ ID الصح
            } else {
                Swal.fire({ toast: true, position: "top-start", icon: "error", title: "حدث خطأ أثناء الاضافه", timer: 3000, showConfirmButton: false });
            }
        } catch (error) {
            console.log("error", error);

        } finally {
            setSubmitLoading(false)
        }
    }
    const updateProduct = async () => {
        if (!editName?.trim() || !editCategoryId || !editBarcodeNumber) {
            Swal.fire({
                toast: true,
                position: "top-start",
                icon: "error",
                title: "من فضلك أكمل جميع البيانات",
                showConfirmButton: false,
                timer: 3000,
            });

            return;
        }
        try {
            setSubmitLoading(true);
            const formData = new FormData();
            formData.append("_method", "PUT");

            formData.append('name', editName)
            formData.append('price', editPrice)
            formData.append('minimum_stock', editMinimumStock)
            formData.append('category_id', editCategoryId)
            if (editSubCategoryId) {
                formData.append('sub_category_id', editSubCategoryId);
            }
            formData.append('barcode', editBarcodeNumber)
            const response = await apiFetch(`products/${editProductId}`, {
                method: "POST",
                body: formData
            })
            if (response.ok) {
                Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم التعديل بنجاح", showConfirmButton: false, timer: 2000 });
                fetchProducts(); // ✅ الاسم الصح

                document.getElementById("editModal").querySelector('[data-bs-dismiss="modal"]').click(); // ✅ ID الصح
            } else {
                Swal.fire({ toast: true, position: "top-start", icon: "error", title: "حدث خطأ أثناء التعديل", timer: 3000, showConfirmButton: false });
            }
        } catch (error) {
            console.log("error ", error);
        } finally {
            setSubmitLoading(false);
        }

    }
    const deleteProduct = async (id) => {
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
            const response = await apiFetch(`products/${id}`, {
                method: "DELETE",
            })
            if (response.ok) {
                Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم الحذف بنجاح", showConfirmButton: false, timer: 2000 });
                fetchProducts(); // ✅ الاسم الصح

                document.getElementById("editModal").querySelector('[data-bs-dismiss="modal"]').click(); // ✅ ID الصح
            } else {
                Swal.fire({ toast: true, position: "top-start", icon: "error", title: "حدث خطأ أثناء الحذف", timer: 3000, showConfirmButton: false });
            }
        } catch (error) {
            console.log("error ", error);

        }
    }
    return (
        <>
            <div className="mb-2 btn btn-primary" data-bs-toggle="modal" data-bs-target="#Modal">
                اضافه منتج
            </div>


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
                                <th>الاسم</th>
                                <th>باركود</th>
                                <th>سعر البيع</th>
                                <th>الحد الامان</th>
                                <th>الفئة الرئيسية</th>
                                <th>اسم الفئة الفرعية</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((pro, index) => (
                                    <tr key={pro.id}>
                                        <td>{index + 1}</td>
                                        <td>{pro.name}</td>
                                        <td>{pro.barcode}</td>
                                        <td>{pro.price}</td>
                                        <td>{pro.minimum_stock}</td>
                                        <td>{pro.category?.name}</td>
                                        <td>
                                            {
                                                pro.sub_category?.name ? pro.sub_category?.name
                                                    : (<span className="badge text-bg-secondary">لا يوجد</span>)
                                            }
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-ghost btn-sm btn-icon me-1"
                                                onClick={() => openEditModal(pro)}
                                                data-bs-toggle="modal"
                                                data-bs-target="#editModal"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm btn-icon mx-2"
                                                onClick={() => deleteProduct(pro.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                                        لا يوجد منتجات
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
                            <h1 className="modal-title fs-5">اضافه منتج </h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-6">
                                    <label className="form-label">الاسم</label>
                                    <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="form-control" placeholder="الاسم" />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">باركود</label>
                                    <input value={barcodeNumber} onChange={(e) => setBarcodeNumber(e.target.value)} type="number" className="form-control" placeholder="باركود" />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">سعر البيع</label>
                                    <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="form-control" placeholder="سعر البيع" />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">الحد الامان</label>
                                    <input value={minimumStock} onChange={(e) => setMinimymStock(e.target.value)} type="number" className="form-control" placeholder="الحد الامان" />
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
                                <div className="col-12">
                                    <label className="form-label">اختار الفئة الفرعية</label>
                                    <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} className="form-select">
                                        <option value="">اختار الفئة الفرعية</option>
                                        {subCategories.map((sub) => (
                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
                            <button type="button" className="btn btn-primary" disabled={submitLoading} onClick={addProduct}>
                                {submitLoading ? (<><span className="spinner-border spinner-border-sm me-2" />جاري الإضافة...</>) : "اضافه"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* ===== Edit MODAL ===== */}
            <div className="modal fade" id="editModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">تعديل منتج </h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-6">
                                    <label className="form-label">الاسم</label>
                                    <input value={editName} onChange={(e) => setEditName(e.target.value)} type="text" className="form-control" placeholder="الاسم" />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">باركود</label>
                                    <input value={editBarcodeNumber} onChange={(e) => setEditBarcodeNumber(e.target.value)} type="number" className="form-control" placeholder="باركود" />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">سعر البيع</label>
                                    <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} type="number" className="form-control" placeholder="سعر البيع" />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">الحد الامان</label>
                                    <input value={editMinimumStock} onChange={(e) => setEditMinimumStock(e.target.value)} type="number" className="form-control" placeholder="الحد الامان" />
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
                                <div className="col-12">
                                    <label className="form-label">اختار الفئة الفرعية</label>
                                    <select value={editSubCategoryId} onChange={(e) => setEditSubCategoryId(e.target.value)} className="form-select">
                                        <option value="">اختار الفئة الفرعية</option>
                                        {subCategories.map((sub) => (
                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
                            <button type="button" className="btn btn-primary" disabled={submitLoading} onClick={updateProduct}>
                                {submitLoading ? (<><span className="spinner-border spinner-border-sm me-2" />جاري الحفظ...</>) : "حفظ"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default Products;

