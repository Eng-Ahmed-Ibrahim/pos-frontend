import { useState, useEffect, useMemo } from 'react'
import { apiFetch } from "@/Components/apiFetch";
import { ThreeDot } from "react-loading-indicators";

import Swal from "sweetalert2";

import { FaEye } from "react-icons/fa";

import { FiEdit2, FiTrash2 } from "react-icons/fi";

const ADMIN_ROLE_ID = 1;

// Groups a flat permissions array into { sectionName: [perm, perm, ...] }
const groupPermissionsBySection = (permissions) => {
    return permissions.reduce((groups, perm) => {
        const section = perm.section || 'عام';
        if (!groups[section]) groups[section] = [];
        groups[section].push(perm);
        return groups;
    }, {});
}

// Reusable checkbox grid, grouped by section, with per-section "select all"
function PermissionsGrid({ permissions, selected, onToggle, onToggleSection, idPrefix }) {
    const grouped = useMemo(() => groupPermissionsBySection(permissions), [permissions]);
    const sections = Object.keys(grouped);

    if (sections.length === 0) {
        return <p className="text-muted">لا يوجد صلاحيات</p>;
    }

    return (
        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {sections.map((section) => {
                const sectionPerms = grouped[section];
                const sectionNames = sectionPerms.map((p) => p.name);
                const allChecked = sectionNames.every((n) => selected.includes(n));

                return (
                    <div className="mb-3" key={section}>
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
                            <span className="fw-bold text-primary">{section}</span>
                            <div className="form-check mb-0">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`${idPrefix}-section-${section}`}
                                    checked={allChecked}
                                    onChange={() => onToggleSection(sectionNames, allChecked)}
                                />
                                <label className="form-check-label small" htmlFor={`${idPrefix}-section-${section}`}>
                                    تحديد الكل
                                </label>
                            </div>
                        </div>
                        <div className="row">
                            {sectionPerms.map((perm) => (
                                <div className="col-md-4 col-6 mb-2" key={perm.id}>
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`${idPrefix}-perm-${perm.id}`}
                                            checked={selected.includes(perm.name)}
                                            onChange={() => onToggle(perm.name)}
                                        />
                                        <label className="form-check-label" htmlFor={`${idPrefix}-perm-${perm.id}`}>
                                            {perm.display_name || perm.name}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function Roles() {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    // form fields
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    // show modal
    const [showRole, setShowRole] = useState(null);

    const [errors, setErrors] = useState({});

    const resetForm = () => {
        setEditId(null);
        setName('');
        setSelectedPermissions([]);
        setErrors({});
    }

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('roles');
            const json = await res.json();
            if (json.status) {
                setRoles(json.data.roles);
                setPermissions(json.data.permissions);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRoles();
    }, []);

    const openAddModal = () => {
        resetForm();
    }

    const openEditModal = (role) => {
        if (role.id === ADMIN_ROLE_ID) return; // safety guard, buttons are hidden anyway

        resetForm();
        setEditId(role.id);
        setName(role.name);
        setSelectedPermissions(role.permissions?.map((p) => p.name) || []);
    }

    const openShowModal = (role) => {
        setShowRole(role);
    }

    const togglePermission = (permName) => {
        setSelectedPermissions((prev) =>
            prev.includes(permName)
                ? prev.filter((p) => p !== permName)
                : [...prev, permName]
        );
    }

    // Toggles all permissions within a single section at once
    const toggleSection = (sectionNames, allChecked) => {
        setSelectedPermissions((prev) => {
            if (allChecked) {
                // unselect everything in this section
                return prev.filter((p) => !sectionNames.includes(p));
            }
            // select everything in this section (without duplicating existing ones)
            const merged = new Set([...prev, ...sectionNames]);
            return Array.from(merged);
        });
    }

    const validateClientSide = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'اسم الدور مطلوب';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const addRole = async () => {
        if (!validateClientSide()) return;

        setSubmitLoading(true);
        try {
            const res = await apiFetch('roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, permissions: selectedPermissions }),
            });
            const json = await res.json();

            if (res.status === 422) {
                setErrors(json.errors || {});
                return;
            }
            if (!res.ok || !json.status) {
                alert(json.message || 'حدث خطأ أثناء الإضافة');
                return;
            }

            fetchRoles()
            resetForm();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    }

    const updateRole = async () => {
        if (editId === ADMIN_ROLE_ID) return; // safety guard

        if (!validateClientSide()) return;

        setSubmitLoading(true);
        try {
            const res = await apiFetch(`roles/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, permissions: selectedPermissions }),
            });
            const json = await res.json();

            if (res.status === 422) {
                setErrors(json.errors || {});
                return;
            }
            if (!res.ok || !json.status) {
                alert(json.message || 'حدث خطأ أثناء التعديل');
                return;
            }

            fetchRoles()
            resetForm();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    }

    const deleteRole = async (role) => {
        if (role.id === ADMIN_ROLE_ID) return; // safety guard

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
            const res = await apiFetch(`roles/${role.id}`, { method: 'DELETE' });
            const json = await res.json();

            if (!res.ok || !json.status) {
                alert(json.message || 'حدث خطأ أثناء الحذف');
                return;
            }

            fetchRoles()
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
                <div className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addModal" onClick={openAddModal}>
                    اضافه دور جديد
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
                                        <th>اسم الدور</th>
                                        <th>عدد الصلاحيات</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center text-muted py-3">لا يوجد أدوار</td>
                                        </tr>
                                    ) : (
                                        roles.map((role, index) => {
                                            const isAdmin = role.id === ADMIN_ROLE_ID;
                                            return (
                                                <tr key={role.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {role.name}

                                                    </td>
                                                    <td>{role.permissions?.length || 0}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-secondary me-1" data-bs-toggle="modal" data-bs-target="#showModal" onClick={() => openShowModal(role)}>
                                                            <FaEye />
                                                        </button>
                                                        {!isAdmin && (
                                                            <>
                                                                <button className="btn btn-sm btn-outline-primary me-1" data-bs-toggle="modal" data-bs-target="#editModal" onClick={() => openEditModal(role)}>
                                                                    <FiEdit2 />
                                                                </button>
                                                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteRole(role)}>
                                                                    <FiTrash2 />
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== LIGHT ADD MODAL ===== */}
            <div className="modal fade" id="addModal" tabIndex={-1}>
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content role-modal-light">

                        {/* HEADER */}
                        <div className="role-header-light">
                            <div>
                                <h3>إضافة دور جديد</h3>
                                <p>إنشاء دور جديد وتحديد الصلاحيات</p>
                            </div>

                            <button
                                className="close-btn-light"
                                data-bs-dismiss="modal"
                            >
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="role-body-light">

                            {/* LEFT */}
                            <div className="form-panel-light">

                                <div className="input-box-light">
                                    <label>اسم الدور</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: Manager"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    {fieldError('name')}
                                </div>

                                <div className="stats-box-light">
                                    <span>الصلاحيات المختارة</span>
                                    <strong>{selectedPermissions.length}</strong>
                                </div>

                            </div>

                            {/* RIGHT */}
                            <div className="permissions-panel-light">

                                <div className="permissions-head-light">
                                    <h4>الصلاحيات</h4>
                                    <p>اختر الصلاحيات المناسبة لهذا الدور</p>
                                </div>

                                <div className="permissions-scroll-light">
                                    <PermissionsGrid
                                        permissions={permissions}
                                        selected={selectedPermissions}
                                        onToggle={togglePermission}
                                        onToggleSection={toggleSection}
                                        idPrefix="add"
                                    />
                                </div>

                                {fieldError('permissions')}

                            </div>

                        </div>

                        {/* FOOTER */}
                        <div className="role-footer-light">

                            <button
                                className="btn-cancel-light"
                                data-bs-dismiss="modal"
                            >
                                إلغاء
                            </button>

                            <button
                                className="btn btn-primary"
                                disabled={submitLoading}
                                onClick={addRole}
                                data-bs-dismiss="modal"
                            >
                                {submitLoading ? "جاري الإضافة..." : "إضافة الدور"}
                            </button>

                        </div>

                    </div>
                </div>
            </div>

            {/* ===== LIGHT ROLE MODAL ===== */}
            <div className="modal fade" id="editModal" tabIndex={-1}>
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content role-modal-light">

                        {/* HEADER */}
                        <div className="role-header-light">
                            <div>
                                <h3>تعديل الدور</h3>
                                <p>تعديل الاسم والصلاحيات بسهولة</p>
                            </div>

                            <button
                                className="close-btn-light"
                                data-bs-dismiss="modal"
                            >
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="role-body-light">

                            {/* LEFT */}
                            <div className="form-panel-light">
                                <div className="input-box-light">
                                    <label>اسم الدور</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: Admin"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    {fieldError('name')}
                                </div>

                                <div className="stats-box-light">
                                    <span>الصلاحيات المختارة</span>
                                    <strong>{selectedPermissions.length}</strong>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="permissions-panel-light">

                                <div className="permissions-head-light">
                                    <h4>الصلاحيات</h4>
                                    <p>اختر الصلاحيات المناسبة للدور</p>
                                </div>

                                <div className="permissions-scroll-light">
                                    <PermissionsGrid
                                        permissions={permissions}
                                        selected={selectedPermissions}
                                        onToggle={togglePermission}
                                        onToggleSection={toggleSection}
                                        idPrefix="edit"
                                    />
                                </div>

                                {fieldError('permissions')}
                            </div>

                        </div>

                        {/* FOOTER */}
                        <div className="role-footer-light">

                            <button
                                className="btn-cancel-light"
                                data-bs-dismiss="modal"
                            >
                                إلغاء
                            </button>

                            <button
                                className="btn btn-primary"
                                disabled={submitLoading}
                                data-bs-dismiss="modal"
                                onClick={updateRole}
                            >
                                {submitLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
                            </button>

                        </div>

                    </div>
                </div>
            </div>

  {/* ===== LIGHT SHOW MODAL ===== */}
<div className="modal fade" id="showModal" tabIndex={-1}>
    <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content role-modal-light">

            {/* HEADER */}
            <div className="role-header-light">
                <div>
                    <h3>تفاصيل الدور</h3>
                    <p>عرض بيانات الدور والصلاحيات</p>
                </div>

                <button
                    className="close-btn-light"
                    data-bs-dismiss="modal"
                >
                    ✕
                </button>
            </div>

            {/* BODY */}
            <div className="role-body-light">

                {showRole && (
                    <>
                        {/* LEFT INFO */}
                        <div className="form-panel-light">

                            <div className="stats-box-light" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                                <span style={{ fontSize: "12px", color: "#777" }}>
                                    اسم الدور
                                </span>
                                <strong style={{ fontSize: "18px" }}>
                                    {showRole.name}
                                </strong>
                            </div>

                            <div className="stats-box-light">
                                <span>عدد الصلاحيات</span>
                                <strong>
                                    {showRole.permissions?.length || 0}
                                </strong>
                            </div>

                        </div>

                        {/* RIGHT PERMISSIONS */}
                        <div className="permissions-panel-light">

                            <div className="permissions-head-light">
                                <h4>الصلاحيات</h4>
                                <p>جميع الصلاحيات المرتبطة بهذا الدور</p>
                            </div>

                            <div className="permissions-scroll-light">

                                {showRole.permissions?.length > 0 ? (
                                    Object.entries(
                                        groupPermissionsBySection(showRole.permissions)
                                    ).map(([section, perms]) => (
                                        <div key={section} className="permission-group">

                                            <div className="group-title">
                                                {section}
                                            </div>

                                            <div className="badge-wrap">
                                                {perms.map((p) => (
                                                    <span
                                                        key={p.id}
                                                        className="perm-badge"
                                                    >
                                                        {p.display_name || p.name}
                                                    </span>
                                                ))}
                                            </div>

                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        لا يوجد صلاحيات محددة
                                    </div>
                                )}

                            </div>

                        </div>
                    </>
                )}

            </div>

            {/* FOOTER */}
            <div className="role-footer-light">
                <button
                    className="btn-cancel-light"
                    data-bs-dismiss="modal"
                >
                    إغلاق
                </button>
            </div>

        </div>
    </div>
</div>
        </>
    );
}
export default Roles