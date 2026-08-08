import { useState } from 'react'
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdShoppingCart,
  MdReceipt,
  MdInventory,
  MdCategory,
  MdLayers,
  MdPeople,
  MdSecurity,
  MdKeyboardArrowDown,
  MdClose
} from "react-icons/md";
import { FaLeftLong } from "react-icons/fa6";
import { TbReportAnalytics } from "react-icons/tb";
import { useAuth } from "../../context/AuthContext";
import { CiLogout } from "react-icons/ci";

const VITE_SERVER_BASE = import.meta.env.VITE_SERVER_BASE;
const system_logo = `${VITE_SERVER_BASE}/uploads/settings/system_logo.png`;

function Sidebar({ isOpen, onClose }) {
  const { can, systemSetting } = useAuth();
  const [currentSubMenu, setDropMenu] = useState(null);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  return (
    <>
      {/* Backdrop for mobile screen overlay */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="logo d-flex align-items-center justify-content-center">
          <div className="d-flex align-items-center gap-2">
            <div className="logo-mark d-flex align-items-center justify-center">
              <span><img className='dar-logo' src={system_logo} alt="Logo" /></span>
            </div>
            <div className="logo-sub text-center">{systemSetting('system_name')}</div>
          </div>

        </div>

        <div className="sidebar-scroll-content">
          {can('dashboard.view') && (
            <div className="nav-section">
              <div className="nav-label">الرئيسية</div>
              <NavLink 
                to="/" 
                onClick={onClose}
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                <span className="icon"><MdDashboard /></span>
                لوحة التحكم
              </NavLink>
            </div>
          )}

          <div className="nav-section">
            {(can('point_of_sale.view') || can('point_of_sale.return')) && (
              <>
                <div className="nav-label">المبيعات</div>
                {can('point_of_sale.view') && (
                  <div className="nav-group">
                    <button
                      type="button"
                      className="nav-item nav-group-toggle"
                      onClick={() => setDropMenu(currentSubMenu === 'sales' ? null : 'sales')}
                    >
                      <span className="icon"><MdShoppingCart /></span>
                      المبيعات
                      <MdKeyboardArrowDown className={`arrow ${currentSubMenu === 'sales' ? 'open' : ''}`} />
                    </button>

                    <div className={`nav-subgroup ${currentSubMenu === 'sales' ? 'open' : ''}`}>
                      <div className="nav-subgroup-inner">
                        {can('point_of_sale.view') && (
                          <NavLink to="/point-of-sales" onClick={onClose} className="nav-item nav-sub-item">
                            <span className="icon"><FaLeftLong /></span>
                            نقطة البيع
                          </NavLink>
                        )}
                        {can('point_of_sale.return') && (
                          <NavLink to="/returns" onClick={onClose} className="nav-item nav-sub-item">
                            <span className="icon"><FaLeftLong /></span>
                            مرتجعات المبيعات
                          </NavLink>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {(can('invoices.view') || can('invoices.view_returend') || can('invoices.view_wasteed') || can('suppliers.view')) && (
              <div className="nav-group">
                <button
                  type="button"
                  className="nav-item nav-group-toggle"
                  onClick={() => setDropMenu(currentSubMenu === 'purchases' ? null : 'purchases')}
                >
                  <span className="icon"><MdReceipt /></span>
                  المشتريات
                  <MdKeyboardArrowDown className={`arrow ${currentSubMenu === 'purchases' ? 'open' : ''}`} />
                </button>

                <div className={`nav-subgroup ${currentSubMenu === 'purchases' ? 'open' : ''}`}>
                  <div className="nav-subgroup-inner">
                    {can('invoices.view') && (
                      <NavLink to="/invoices" onClick={onClose} className="nav-item nav-sub-item">
                        <span className="icon"><FaLeftLong /></span>
                        فواتير
                      </NavLink>
                    )}
                    {can('suppliers.view') && (
                      <NavLink to="/suppliers" onClick={onClose} className="nav-item nav-sub-item">
                        <span className="icon"><FaLeftLong /></span>
                        الموردين
                      </NavLink>
                    )}
                    {can('invoices.view_returend') && (
                      <NavLink to="/invoice/return" onClick={onClose} className="nav-item nav-sub-item">
                        <span className="icon"><FaLeftLong /></span>
                        مرتجعات
                      </NavLink>
                    )}
                    {can('invoices.view_wasteed') && (
                      <NavLink to="/waste" onClick={onClose} className="nav-item nav-sub-item">
                        <span className="icon"><FaLeftLong /></span>
                        الهالك
                      </NavLink>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(can('reports.view_sales_products') || can('reports.view_sales_cashier') || can('reports.view_warehouse_inventory') || can('reports.view_financial')) && (
              <div className="nav-group">
                <button
                  type="button"
                  className="nav-item nav-group-toggle"
                  onClick={() => setDropMenu(currentSubMenu === 'reports' ? null : 'reports')}
                >
                  <span className="icon"><TbReportAnalytics /></span>
                  التقارير
                  <MdKeyboardArrowDown className={`arrow ${currentSubMenu === 'reports' ? 'open' : ''}`} />
                </button>

                <div className={`nav-subgroup ${currentSubMenu === 'reports' ? 'open' : ''}`}>
                  <div className="nav-subgroup-inner">
                    {can('reports.view_sales_products') && (
                      <NavLink to="/reports" onClick={onClose} className="nav-item nav-sub-item">
                        <span className="icon"><FaLeftLong /></span>
                        تقرير مبيعات المنتجات
                      </NavLink>
                    )}
                    {can('reports.view_sales_cashier') && (
                      <NavLink to="/cashier-reports" onClick={onClose} className="nav-item nav-sub-item">
                        <span className="icon"><FaLeftLong /></span>
                        تقرير مبيعات الكاشير
                      </NavLink>
                    )}
                    {can('reports.view_warehouse_inventory') && (
                      <NavLink to="/warehouse-inventory" onClick={onClose} className="nav-item nav-sub-item">
                        <span className="icon"><FaLeftLong /></span>
                        جرد المخزن
                      </NavLink>
                    )}
                    {can('reports.view_financial') && (
                      <NavLink to="/financial" onClick={onClose} className="nav-item nav-sub-item">
                        <span className="icon"><FaLeftLong /></span>
                        الماليات
                      </NavLink>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {(can('products.view') || can('categories.view') || can('sub_categories.view')) && (
            <div className="nav-section">
              <div className="nav-label">المنتجات</div>
              {can('products.view') && (
                <NavLink to="/products" onClick={onClose} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                  <span className="icon"><MdInventory /></span>
                  المنتجات
                </NavLink>
              )}
              <NavLink to="/units" onClick={onClose} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="icon"><MdInventory /></span>
                الوحدات
              </NavLink>
              {can('categories.view') && (
                <NavLink to="/categories" onClick={onClose} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                  <span className="icon"><MdCategory /></span>
                  الفئات
                </NavLink>
              )}
              {can('sub_categories.view') && (
                <NavLink to="/sub-categories" onClick={onClose} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
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
                <NavLink to="/users" onClick={onClose} className="nav-item">
                  <span className="icon"><MdPeople /></span>
                  المستخدمين
                </NavLink>
              )}
              {can('roles.view') && (
                <NavLink to="/roles" onClick={onClose} className="nav-item">
                  <span className="icon"><MdSecurity /></span>
                  الأدوار والصلاحيات
                </NavLink>
              )}
            </div>
          )}
        </div>

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
            <CiLogout onClick={logout} style={{ fontSize: "24px", color: "#8B5E3C", cursor: "pointer" }} />
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;