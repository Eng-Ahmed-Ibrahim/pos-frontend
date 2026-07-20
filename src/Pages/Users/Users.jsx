import { useState, useEffect } from 'react'
import { apiFetch } from "@/Components/apiFetch";
import { ThreeDot } from "react-loading-indicators";
import Swal from "sweetalert2";
import { FaEye } from "react-icons/fa";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

function Users() {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    // form fields
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(''); // single role per user

    // show modal
    const [showUser, setShowUser] = useState(null);

    const [errors, setErrors] = useState({});

    const resetForm = () => {
        setEditId(null);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('');
        setErrors({});
    }

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('users');
            const json = await res.json();
            if (json.status) {
                setUsers(json.data.users);
                setRoles(json.data.roles);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const openAddModal = () => {
        resetForm();

    }

    const openEditModal = (user) => {
        resetForm();
        setEditId(user.id);
        setName(user.name);
        setEmail(user.email);
        setRole(user.roles?.[0]?.name || '');

    };

    const openShowModal = (user) => {
        setShowUser(user);

    }

    const validateClientSide = (isEdit) => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'الاسم مطلوب';
        if (!email.trim()) newErrors.email = 'البريد الالكتروني مطلوب';
        if (!role) newErrors.role = 'الصلاحية مطلوبة';

        if (!isEdit && !password) newErrors.password = 'كلمة المرور مطلوبة';
        if (password && password.length < 6) newErrors.password = 'كلمة المرور يجب ألا تقل عن 6 أحرف';
        if (password && password !== confirmPassword) newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const addUser = async () => {
        if (!validateClientSide(false)) return;

        setSubmitLoading(true);
        try {
            const res = await apiFetch('users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
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

            fetchUsers()
            resetForm();

        } catch (err) {
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    }

    const updateUser = async () => {
        if (!validateClientSide(true)) return;

        setSubmitLoading(true);
        try {
            const body = { name, email, role };
            if (password) body.password = password;

            const res = await apiFetch(`users/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
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

            fetchUsers()
            resetForm();

        } catch (err) {
            console.error(err);
        } finally {
            setSubmitLoading(false);
        }
    }

    const deleteUser = async (id) => {
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
            const res = await apiFetch(`users/${id}`, { method: 'DELETE' });
            const json = await res.json();

            if (!res.ok || !json.status) {
                alert(json.message || 'حدث خطأ أثناء الحذف');
                return;
            }

            fetchUsers()
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
                    اضافه مستخدم جديد
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
                                        <th>الاسم</th>
                                        <th>البريد الالكتروني</th>
                                        <th>الصلاحية</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted py-3">لا يوجد مستخدمين</td>
                                        </tr>
                                    ) : (
                                        users.map((user, index) => (
                                            <tr key={user.id}>
                                                <td>{index + 1}</td>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    {user.roles?.[0] && (
                                                        <span className="badge bg-primary">{user.roles[0].name}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-secondary me-1" data-bs-toggle="modal" data-bs-target="#showModal" onClick={() => openShowModal(user)}>
                                                        <FaEye />
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-primary me-1" data-bs-toggle="modal" data-bs-target="#editModal" onClick={() => openEditModal(user)}>
                                                        <FiEdit2 />
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(user.id)}>
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
            <div className="modal fade" id="addModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">اضافة مستخدم جديد</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col">
                                    <input type="text" className="form-control" placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
                                    {fieldError('name')}
                                </div>
                                <div className="col">
                                    <input type="email" placeholder='البريد الالكتروني' autoComplete="new-email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    {fieldError('email')}
                                </div>
                            </div>
                            <div className="row g-3 mt-2">
                                <div className="col-12">
                                    <input type="password" className="form-control" autoComplete="new-password" placeholder="كلمه المرور" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    {fieldError('password')}
                                </div>
                                <div className="col-12">
                                    <input type="password" className="form-control" placeholder='تاكيد كلمه المرور' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                    {fieldError('confirmPassword')}
                                </div>
                                <div className="col-12">
                                    <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="">اختر الصلاحية</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                    {fieldError('role')}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
                            <button type="button" className="btn btn-primary" disabled={submitLoading} data-bs-dismiss="modal" onClick={addUser}>
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
                            <h1 className="modal-title fs-5">تعديل مستخدم</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col">
                                    <input type="text" className="form-control" placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
                                    {fieldError('name')}
                                </div>
                                <div className="col">
                                    <input type="email" placeholder='البريد الالكتروني' autoComplete="new-email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    {fieldError('email')}
                                </div>
                            </div>
                            <div className="row g-3 mt-2">
                                <div className="col-12">
                                    <input type="password" className="form-control" autoComplete="new-password" placeholder="كلمه المرور (اتركها فارغة لعدم التغيير)" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    {fieldError('password')}
                                </div>
                                <div className="col-12">
                                    <input type="password" className="form-control" placeholder='تاكيد كلمه المرور' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                    {fieldError('confirmPassword')}
                                </div>
                                <div className="col-12">
                                    <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="">اختر الصلاحية</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                    {fieldError('role')}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">الغاء</button>
                            <button type="button" className="btn btn-primary" disabled={submitLoading} data-bs-dismiss="modal" onClick={updateUser}>
                                {submitLoading ? (<><span className="spinner-border spinner-border-sm me-2" />جاري الحفظ...</>) : "حفظ التعديلات"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== SHOW MODAL ===== */}
            <div className="modal fade" id="showModal" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">بيانات المستخدم</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            {showUser && (
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span className="fw-bold">الاسم</span>
                                        <span>{showUser.name}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span className="fw-bold">البريد الالكتروني</span>
                                        <span>{showUser.email}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span className="fw-bold">الصلاحية</span>
                                        <span>
                                            {showUser.roles?.[0] && (
                                                <span className="badge bg-primary">{showUser.roles[0].name}</span>
                                            )}
                                        </span>
                                    </li>
                                </ul>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Users