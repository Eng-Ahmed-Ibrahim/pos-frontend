import { useState, useEffect } from 'react'
import { apiFetch } from "@/Components/apiFetch";
import { ThreeDot } from "react-loading-indicators";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

function Units() {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState([]);

    // form fields
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState('');

    const [errors, setErrors] = useState({});

    const resetForm = () => {
        setEditId(null);
        setName('');
        setErrors({});
    }

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('units');
            const json = await res.json();
            if (json.status) {
                setUnits(json.data.units);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUnits();
    }, []);

    const openAddModal = () => {
        resetForm();
    }

    const openEditModal = (unit) => {
        resetForm();
        setEditId(unit.id);
        setName(unit.name);
    };

    const validateClientSide = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'اسم الوحدة مطلوب';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const addUnit = async () => {
        if (!validateClientSide()) return;

        setSubmitLoading(true);
        try {
            const res = await apiFetch('units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            const json = await res.json();

            if (res.status === 422) {
                setErrors(json.errors || {});
                return;
            }
            if (!res.ok || !json.status) {
                console.error(json);
                alert(json.message || 'حدث خطأ أثناء الإضافة');
                return;
            }

            fetchUnits()
            resetForm();

        } catch (err) {
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    }

    const updateUnit = async () => {
        if (!validateClientSide()) return;

        setSubmitLoading(true);
        try {
            const res = await apiFetch(`units/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            const json = await res.json();

            if (res.status === 422) {
                setErrors(json.errors || {});
                return;
            }
            if (!res.ok || !json.status) {
                console.error(json);
                alert(json.message || 'حدث خطأ أثناء التعديل');
                return;
            }

            fetchUnits()
            resetForm();

        } catch (err) {
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    }

    const deleteUnit = async (id) => {
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
            const res = await apiFetch(`units/${id}`, { method: 'DELETE' });
            const json = await res.json();

            if (!res.ok || !json.status) {
                alert(json.message || 'حدث خطأ أثناء الحذف');
                return;
            }

            fetchUnits()
        } catch (err) {
            console.error(err);
            alert('حدث خطأ أثناء الحذف');
        }
    }

    const fieldError = (field) => {
        const err = errors[field];
        if (!err) return null;
        return <div className="text-danger small mt-1">{Array.isArray(err) ? err[0] : err}</div>;
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUnitModal" onClick={openAddModal}>
                    اضافه وحدة جديدة
                </div>
            </div>

            <div className="">
                <div className="card-body">
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
                                        <th>اسم الوحدة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center text-muted py-3">لا يوجد وحدات</td>
                                        </tr>
                                    ) : (
                                        units.map((unit, index) => (
                                            <tr key={unit.id}>
                                                <td>{index + 1}</td>
                                                <td>{unit.name}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary me-1" data-bs-toggle="modal" data-bs-target="#editUnitModal" onClick={() => openEditModal(unit)}>
                                                        <FiEdit2 />
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUnit(unit.id)}>
                                                        <FiTrash2 />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== ADD MODAL ===== */}
            <div className="modal fade" id="addUnitModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">اضافة وحدة جديدة</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <input type="text" className="form-control" placeholder="اسم الوحدة (مثال: كيلو، علبة، كرتونة)" value={name} onChange={(e) => setName(e.target.value)} />
                                    {fieldError('name')}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
                            <button type="button" className="btn btn-primary" disabled={submitLoading} data-bs-dismiss="modal" onClick={addUnit}>
                                {submitLoading ? (<><span className="spinner-border spinner-border-sm me-2" />جاري الإضافة...</>) : "اضافه"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== EDIT MODAL ===== */}
            <div className="modal fade" id="editUnitModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">تعديل وحدة</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <input type="text" className="form-control" placeholder="اسم الوحدة" value={name} onChange={(e) => setName(e.target.value)} />
                                    {fieldError('name')}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
                            <button type="button" className="btn btn-primary" disabled={submitLoading} data-bs-dismiss="modal" onClick={updateUnit}>
                                {submitLoading ? (<><span className="spinner-border spinner-border-sm me-2" />جاري الحفظ...</>) : "حفظ التعديلات"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Units