import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ThreeDot } from "react-loading-indicators";
const SERVER_BASE = import.meta.env.VITE_SERVER_BASE
const API_BASE = import.meta.env.VITE_API_URL;
import { apiFetch } from "@/Components/apiFetch";
import { useAuth } from "@/context/AuthContext";
import Pagination from "../Components/Pagination";
import Barcode from "react-barcode";

function Products() {

    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [barcodeNumber, setBarcodeNumber] = useState('');
    const [name, setName] = useState('');
    const [minimumStock, setMinimumStock] = useState(0);
    const [price, setPrice] = useState(0);
    const [unitId, setUnitId] = useState(0);
    const [subCategoryId, setSubCategoryId] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [editCategoryId, setEditCategoryId] = useState('');
    const [editBarcodeNumber, setEditBarcodeNumber] = useState('');
    const [editMinimumStock, setEditMinimumStock] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editName, setEditName] = useState('');
    const [editUnitId, setEditUnitId] = useState('');
    const [editProductId, setEditProductId] = useState('');
    const [editSubCategoryId, setEditSubCategoryId] = useState('');
    const { can } = useAuth();
    const token = localStorage.getItem("token");
    const fetchProducts = async (pageNumber = 1) => {
        try {
            setLoading(true);

            const response = await apiFetch(`products?page=${pageNumber}&search=${searchValue}`, {
                method: "GET",
            });

            const data = await response.json();

            setProducts(data.data.products);
            setUnits(data.data.units);
            setCategories(data.data.categories || []);
            setSubCategories(data.data.sub_categories || []);

            setPage(data.data.pagination.current_page);
            setLastPage(data.data.pagination.last_page);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (prod) => {
        setEditCategoryId(prod.category_id)
        setEditBarcodeNumber(prod.barcode)
        setEditName(prod.name)
        setEditProductId(prod.id)
        setEditSubCategoryId(prod.sub_category_id)
        setEditMinimumStock(prod.minimum_stock)
        setEditPrice(prod.price)
        setEditUnitId(prod.unit_id)
    }
    useEffect(() => {
        fetchProducts(1);
    }, []);

    const handlePageChange = (newPage) => {
        fetchProducts(newPage);
    };

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
            formData.append('price', price)
            formData.append('unit_id', unitId)
            formData.append('minimum_stock', minimumStock)
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
            formData.append('unit_id', editUnitId)
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
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(1, searchValue);
        }, 500); // يستنى 500ms بعد آخر كتابة

        return () => clearTimeout(timer);
    }, [searchValue]);
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">

                {/* Left: Search */}
                <div style={{ width: "300px", maxWidth: "100%" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="ابحث بالاسم أو الباركود..."
                        onChange={(e) => setSearchValue(e.target.value)}

                    />
                </div>

                {/* Right: Add Button */}
                {can('products.create') && (
                    <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#Modal"
                    >
                        اضافه منتج
                    </button>
                )}

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
                                    <th>الاسم</th>
                                    <th>الوحده</th>
                                    <th>باركود</th>
                                    <th>سعر البيع</th>
                                    <th>الحد الامان</th>
                                    <th>الفئة</th>
                                    <th>الفرعية</th>
                                    {(can('products.delete') || can('products.edit')) && (
                                        <th>الإجراءات</th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {products.length > 0 ? (
                                    products.map((prod, index) => (
                                        <tr key={prod.id}>
                                            <td>{index + 1}</td>
                                            <td>{prod.name}</td>
                                            <td>{prod.unit.name}</td>
                                            <td>
                                                <Barcode
                                                    value={prod.barcode}
                                                    width={1}
                                                    height={30}
                                                    displayValue={true}
                                                    fontSize={8}
                                                />
                                            </td>
                                            <td>{prod.price}</td>
                                            <td>{prod.minimum_stock}</td>
                                            <td>{prod.category?.name}</td>
                                            <td>{prod.sub_category?.name || "لا يوجد"}</td>
                                            <td>
                                                {can('products.edit') &&
                                                    (<button className="btn btn-ghost btn-sm btn-icon me-1" onClick={() => openEditModal(prod)} data-bs-toggle="modal" data-bs-target="#editModal" >
                                                        <FiEdit2 />
                                                    </button>
                                                    )}
                                                {can('dprodducts.delete') &&
                                                    (<button className="btn btn-danger btn-sm btn-icon mx-2" onClick={() => deleteProduct(prod.id)} >
                                                        <FiTrash2 /> </button>
                                                    )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                                            لا يوجد منتجات
                                        </td>
                                    </tr>
                                )}
                            </tbody>
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
            {/* ===== ADD MODAL ===== */}
            <div className="modal fade" id="Modal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
                <div className="modal-dialog modal-lg">
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
                                <div className="col-12">
                                    <label className="form-label">الوحده</label>
                                    <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="form-select">
                                        <option value="">اختار الوحده</option>
                                        {units.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
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
                <div className="modal-dialog modal-lg">
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
                                <div className="col-12">
                                    <label className="form-label">الوحده</label>
                                    <select value={editUnitId} onChange={(e) => setEditUnitId(e.target.value)} className="form-select">
                                        <option value="">اختار الوحده</option>
                                        {units.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
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

