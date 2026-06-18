import { useState } from 'react'
import { NavLink } from 'react-router-dom';
import {
    MdDashboard,
    MdShoppingCart,
    MdReceipt,
    MdLocalShipping,
    MdInventory,
    MdCategory,
    MdLayers,
    MdPeople,
    MdSecurity
} from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";

import logo from '/logo.PNG'
import { CiLogout } from "react-icons/ci";
const API_BASE = import.meta.env.VITE_API_URL;

function Sidebar() {
    const [count, setCount] = useState(0)
    const logout = () => {
        localStorage.clear()
        window.location.href = "/login";
    }
    return (
        <>
            <aside className="sidebar">
                <div className="logo">
                    <div className="logo-mark d-flex align-items-center justify-center"><span> <img className='dar-logo' src={logo} alt="" /></span></div>
                    <div className="logo-sub text-center"> هايبر دار ضباط المشاة </div>
                </div>

                <div className="nav-section">
                    <div className="nav-label">الرئيسية</div>

                    <NavLink to="/" className={({ isActive }) =>
                        isActive ? "nav-item active" : "nav-item"} >
                        <span className="icon"><MdDashboard /></span>

                        لوحة التحكم
                    </NavLink>
                </div>

                <div className="nav-section">
                    <div className="nav-label">المبيعات</div>

                    <NavLink to="/point-of-sales" className="nav-item" >
                        <span className="icon"><MdShoppingCart /></span>
                        نقطة البيع
                    </NavLink>

                    <NavLink to="/invoices" className="nav-item" >
                        <span className="icon"><MdReceipt /></span>
                        الفواتير
                    </NavLink>
                    <NavLink to="/suppliers" className="nav-item" >
                        <span className="icon"><MdLocalShipping /></span>
                        الموردين
                    </NavLink>

                    <div className="nav-item" >
                        <span className="icon"><TbReportAnalytics /></span>
                        التقارير
                    </div>
                </div>

                <div className="nav-section">
                    <div className="nav-label">المنتجات</div>
                    <NavLink
                        to="/products"
                        className={({ isActive }) =>
                            isActive ? "nav-item active" : "nav-item"
                        }
                    >
                        <span className="icon"><MdInventory /></span>
                        المنتجات
                    </NavLink>
                    <NavLink to="/categories" className="nav-item" >
                        <span className="icon"><MdCategory /></span>
                        الفئات
                    </NavLink>

                    <NavLink to='/sub-categories' className="nav-item">
                        <span className="icon"><MdLayers /></span>
                        الفئات الفرعية
                    </NavLink>
                </div>

                <div className="nav-section">
                    <div className="nav-label">إدارة المستخدمين</div>

                    <div className="nav-item" >
                        <span className="icon"><MdPeople /></span>
                        المستخدمين
                    </div>

                    <div className="nav-item" >
                        <span className="icon"><MdSecurity /></span>
                        الأدوار والصلاحيات
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="user-card" style={{ justifyContent: 'space-between' }}>
                        <div className="user-card">

                            <div className="avatar">AS</div>
                            <div className="user-info">
                                <div className="name">Admin</div>
                                <div className="role">Super Admin</div>
                            </div>
                        </div>

                        <CiLogout onClick={logout} style={{ fontSize: "30", color: "#8B5E3C" }} />

                    </div>
                </div>
            </aside>

        </>
    )
}

export default Sidebar
