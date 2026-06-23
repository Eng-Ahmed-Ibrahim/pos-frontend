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
    MdSecurity,
    MdOutlineInventory
} from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { PiKeyReturnLight } from "react-icons/pi";
import { useAuth } from "../../context/AuthContext";

import { CiLogout } from "react-icons/ci";


const VITE_SERVER_BASE = import.meta.env.VITE_SERVER_BASE
const system_logo = `${VITE_SERVER_BASE}/uploads/settings/system_logo.png`
const API_BASE = import.meta.env.VITE_API_URL;

function Sidebar() {
    const [count, setCount] = useState(0)
    const { can ,systemSetting} = useAuth();
    
    const logout = () => {
        localStorage.clear()
        window.location.href = "/login";
    }
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    return (
        <>
            <aside className="sidebar">
                <div className="logo">
                    <div className="logo-mark d-flex align-items-center justify-center"><span> <img className='dar-logo' src={system_logo} alt="" /></span></div>
                    <div className="logo-sub text-center"> {systemSetting('system_name')}</div>
                </div>

                {can('dashboard.view') && (

                    <div className="nav-section">
                        <div className="nav-label">الرئيسية</div>


                        <NavLink to="/" className={({ isActive }) =>
                            isActive ? "nav-item active" : "nav-item"} >
                            <span className="icon"><MdDashboard /></span>

                            لوحة التحكم
                        </NavLink>
                    </div>
                )}

                {(
                    can('point_of_sale.view') ||
                    can('point_of_sale.return') ||
                    can('invoices.view') ||
                    can('suppliers.view') ||
                    can('reports.view')
                ) && (
                        <div className="nav-section">
                            <div className="nav-label">المبيعات</div>

                            {can('point_of_sale.view') && (
                                <NavLink to="/point-of-sales" className="nav-item">
                                    <span className="icon"><MdShoppingCart /></span>
                                    نقطة البيع
                                </NavLink>
                            )}

                            {can('point_of_sale.return') && (
                                <NavLink to="/returns" className="nav-item">
                                    <span className="icon"><MdReceipt /></span>
                                    مرتجعات المبيعات
                                </NavLink>
                            )}

                            {can('invoices.view') && (
                                <NavLink to="/invoices" className="nav-item">
                                    <span className="icon"><MdReceipt /></span>
                                    الفواتير
                                </NavLink>
                            )}

                            {can('suppliers.view') && (
                                <NavLink to="/suppliers" className="nav-item">
                                    <span className="icon"><MdLocalShipping /></span>
                                    الموردين
                                </NavLink>
                            )}

                            {can('reports.view') && (
                                <NavLink to="/reports" className="nav-item">
                                    <span className="icon"><TbReportAnalytics /></span>
                                    التقارير
                                </NavLink>
                            )}
                            {can('reports.view') && (
                                <NavLink to="/reports" className="nav-item">
                                    <span className="icon"><MdOutlineInventory /></span>
                                    جرد المخزن
                                </NavLink>
                            )}
                        </div>
                    )}
                {(
                    can('products.view') ||
                    can('categories.view') ||
                    can('sub_categories.view')
                ) && (
                        <div className="nav-section">
                            <div className="nav-label">المنتجات</div>

                            {can('products.view') && (
                                <NavLink
                                    to="/products"
                                    className={({ isActive }) =>
                                        isActive ? "nav-item active" : "nav-item"
                                    }
                                >
                                    <span className="icon"><MdInventory /></span>
                                    المنتجات
                                </NavLink>
                            )}

                            {can('categories.view') && (
                                <NavLink
                                    to="/categories"
                                    className={({ isActive }) =>
                                        isActive ? "nav-item active" : "nav-item"
                                    }
                                >
                                    <span className="icon"><MdCategory /></span>
                                    الفئات
                                </NavLink>
                            )}

                            {can('sub_categories.view') && (
                                <NavLink
                                    to="/sub-categories"
                                    className={({ isActive }) =>
                                        isActive ? "nav-item active" : "nav-item"
                                    }
                                >
                                    <span className="icon"><MdLayers /></span>
                                    الفئات الفرعية
                                </NavLink>
                            )}
                        </div>
                    )}
                {(can('users.view') || can('roles.view')) && (
                    <div className="nav-section">
                        <div className="nav-label">إدارة المستخدمين</div>

                        {can('users.view') && (
                            <NavLink to="/users" className="nav-item">
                                <span className="icon"><MdPeople /></span>
                                المستخدمين
                            </NavLink>
                        )}

                        {can('roles.view') && (
                            <NavLink to="/roles" className="nav-item">
                                <span className="icon"><MdSecurity /></span>
                                الأدوار والصلاحيات
                            </NavLink>
                        )}
                    </div>
                )}
                {can('settings.view') && (
                    <div className="nav-section">
                        <div className="nav-label">الاعدادات</div>
                        {can('settings.view') && (
                            <NavLink to="/settings" className="nav-item">
                                <span className="icon"><MdPeople /></span>
                                الاعدادات
                            </NavLink>
                        )}
                    </div>
                )}

                <div className="sidebar-footer">
                    <div className="user-card" style={{ justifyContent: 'space-between' }}>
                        <div className="user-card">

                            <div className="avatar">
                                {`${name?.charAt(0) ?? ''}${role?.charAt(0) ?? ''}`.toUpperCase()}
                            </div>
                            <div className="user-info">
                                <div className="name">{name}</div>
                                <div className="role">{role}</div>
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
