import { useState } from 'react'
import './styles.css'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { apiFetch } from "@/Components/apiFetch";

const API_BASE = import.meta.env.VITE_API_URL;

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false)

    const { setAuthData } = useAuth();
    
    const navigate = useNavigate();
    const submit = async () => {
        setSubmitLoading(true)
        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);
            const response = await apiFetch(`login`, {
                method: "POST",
                body: formData
            })
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("name", data.user.name);

                setAuthData({
                    user: data.user,
                    roles: data.roles,
                    permissions: data.permissions,
                });
                Swal.fire({ toast: true, position: "top-start", icon: "success", title: "تم تسجيل الدخول بنجاح", showConfirmButton: false, timer: 2000 });
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
            console.log("Error ", error);
        } finally {
            setSubmitLoading(false);
            window.location.href = "/login"; // يرجع لصفحة الدخول
        }
    }
    return (
        <>
            <div className="login d-flex align-items-center w-100 justify-center">

                <div className="login-box" id="loginBox" dir="rtl">
                    <div className="bubble">تسجيل الدخول</div>

                    <div className="bear-container">
                        <img src="/logo.PNG" alt="" />
                    </div>

                    <div className="input-group">
                        <label>البريد الالكتروني</label>
                        <input onChange={(e) => setEmail(e.target.value)} type="email" id="email" placeholder="البريد الالكتروني" />
                    </div>
                    <div className="input-group">
                        <label>كلمة المرور</label>
                        <input onChange={(e) => setPassword(e.target.value)} type="password" id="password" placeholder="كلمة المرور" />
                    </div>
                    <button disabled={submitLoading} onClick={submit} type="button">
                        {submitLoading ? "جارى الدخول..." : "تسجيل"}
                    </button>
                </div>
            </div>

        </>
    )
}

export default Login
