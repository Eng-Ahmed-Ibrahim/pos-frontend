import { useEffect, useState } from 'react'
import Swal from "sweetalert2";
import { ThreeDot } from "react-loading-indicators";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
const SERVER_BASE = import.meta.env.VITE_SERVER_BASE
const API_BASE = import.meta.env.VITE_API_URL;
function Suppliers() {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAddress, setEditAddress] = useState("");
    useEffect(() => {

        fetchSuppliers();
    }
        , [])
    const fetchSuppliers = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_BASE}/suppliers`)
            const data = await response.json()
            setSuppliers(data.suppliers)
        } catch (error) {
            console.log("error ", error);

        } finally {
            setLoading(false)
        }
    }
    const openEditModal = (supplier) => {
        setEditId(supplier.id);
        setEditName(supplier.name);
        setEditPhone(supplier.phone);
        setEditAddress(supplier.address);
    };
    const updateSupplier = async () => {
        if (!editName.trim() || !editPhone || !editAddress) {
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
            formData.append("name", editName);
            formData.append("phone", editPhone);
            formData.append("address", editAddress);

            const response = await fetch(
                `${API_BASE}/suppliers/${editId}`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                    body: formData,
                }
            );

            if (response.ok) {
                Swal.fire({
                    toast: true,
                    position: "top-start",
                    icon: "success",
                    title: "تم التعديل بنجاح",
                    showConfirmButton: false,
                    timer: 2000,
                });

                fetchSuppliers();

                document
                    .getElementById("editModal")
                    .querySelector('[data-bs-dismiss="modal"]')
                    .click();
            }
        } catch (error) {
            console.log(error);
        } finally {
            setSubmitLoading(false);
        }
    };
    const deleteSupplier = async (id) => {
        const result = await Swal.fire({
            title: "هل أنت متأكد؟",
            text: "لن تستطيع استرجاع المورد بعد الحذف",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "نعم، احذف",
            cancelButtonText: "إلغاء",
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE}/suppliers/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (response.ok) {
                Swal.fire({
                    toast: true,
                    position: "top-start",
                    icon: "success",
                    title: "تم الحذف بنجاح",
                    showConfirmButton: false,
                    timer: 2000,
                });

                fetchSuppliers();
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    const addSupplier = async () => {
        if (!name?.trim() || !phone || !address) {
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
            formData.append('name', name)
            formData.append('phone', phone)
            formData.append('address', address)
            const response = await fetch(`${API_BASE}/suppliers`, {
                method: "POST",
                headers: { Accept: "application/json" },
                body: formData
            })

            if (response.ok) {
                Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم الاضافه بنجاح", showConfirmButton: false, timer: 2000 });
                fetchSuppliers(); // ✅ الاسم الصح
                setName('')
                setPhone('')
                setAddress('')
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
    return (
        <>
            <div className="mb-2 btn btn-primary" data-bs-toggle="modal" data-bs-target="#Modal">
                اضافه مورد
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
                                <th>اسم  </th>
                                <th> رقم التلفون </th>
                                <th> العنوان </th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.length > 0 ? (
                                suppliers.map((supplier, index) => (
                                    <tr key={supplier.id}>
                                        <td>{index + 1}</td>
                                        <td>{supplier.name}</td>
                                        <td>{supplier.phone}</td>
                                        <td>{supplier.address}</td>

                                        <td>
                                            <button
                                                className="btn btn-ghost btn-sm btn-icon me-1"
                                                onClick={() => openEditModal(supplier)}
                                                data-bs-toggle="modal"
                                                data-bs-target="#editModal"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm btn-icon mx-2"
                                                onClick={() => deleteSupplier(supplier.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                                        لا يوجد موردين
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
                            <h1 className="modal-title fs-5">اضافه مورد</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">الاسم</label>
                                    <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="form-control" placeholder="الاسم" />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">رقم التلفون</label>
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} type="text" className="form-control" placeholder="رقم التلفون" />
                                </div>
                                <div className="mb-3 col-12">
                                    <label for="Address" className="form-label">العنوان</label>
                                    <textarea value={address} name='address' onChange={(e) => setAddress(e.target.value)} className="form-control" id="Address" rows="3"></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
                            <button type="button" className="btn btn-primary" disabled={submitLoading} onClick={addSupplier}>
                                {submitLoading ? (<><span className="spinner-border spinner-border-sm me-2" />جاري الإضافة...</>) : "اضافه"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Modal */}
            <div
                className="modal fade"
                id="editModal"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex={-1}
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">تعديل مورد</h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                            />
                        </div>

                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">الاسم</label>
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        type="text"
                                        className="form-control"
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">رقم التلفون</label>
                                    <input
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        type="text"
                                        className="form-control"
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">العنوان</label>
                                    <textarea
                                        value={editAddress}
                                        onChange={(e) => setEditAddress(e.target.value)}
                                        className="form-control"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                الغاء
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={submitLoading}
                                onClick={updateSupplier}
                            >
                                {submitLoading ? "جاري التحديث..." : "تحديث"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Suppliers
