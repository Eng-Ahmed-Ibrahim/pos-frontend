import { useState, useEffect, useRef } from 'react';
import { 
  MdNotificationsNone, 
  MdFullscreen, 
  MdFullscreenExit, 
  MdAdd, 
  MdMenu,
  MdSettings,
  MdLockOutline,
  MdLogout,
  MdKeyboardArrowDown
} from "react-icons/md";
import './styles.css';
import { AiOutlineFileAdd, AiOutlineBarcode } from "react-icons/ai";
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

function Navbar({ onToggleSidebar }) {
  const { can } = useAuth();
  const navigate = useNavigate();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef(null);
  const quickMenuRef = useRef(null);

  const name = localStorage.getItem("name") || "مسؤول النظام";
  const role = localStorage.getItem("role") || "المدير العام";

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target)) {
        setShowQuickMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`خطأ أثناء تفعيل ملء الشاشة: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="topbar d-flex align-items-center justify-content-between">
      {/* الجزء الأيمن (زر القائمة للموبايل و البروفايل) */}
      <div className="topbar-right d-flex align-items-center gap-2 gap-md-3">
        <button 
          className="sidebar-toggle-btn d-lg-none" 
          onClick={onToggleSidebar}
          aria-label="القائمة"
        >
          <MdMenu size={24} />
        </button>

        {/* البروفايل والقائمة المنسدلة */}
        <div className="user-profile-container" ref={userMenuRef} style={{ position: 'relative' }}>
          <div 
            className={`user-profile-nav d-flex align-items-center gap-2 ${showUserMenu ? 'active' : ''}`}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="avatar-wrapper">
              <div className="avatar">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="status-indicator"></span>
            </div>

            <div className="user-info-text d-none d-sm-flex flex-column text-start">
              <span className="user-name">{name}</span>
              <span className="user-role">{role}</span>
            </div>

            <MdKeyboardArrowDown className={`profile-arrow d-none d-sm-block ${showUserMenu ? 'open' : ''}`} />
          </div>

          {/* القائمة المنسدلة والأنيقة للبروفايل */}
          {showUserMenu && (
            <div className="user-dropdown-card">
              {/* هيدر القائمة للتأكيد على الموبايل والديسكتوب */}
              <div className="dropdown-user-header">
                <div className="avatar lg">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <div className="name">{name}</div>
                  <div className="role">{role}</div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              {/* أزرار التنقل */}
              <div className="dropdown-menu-list">
                <button 
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }} 
                  className="dropdown-item-btn"
                >
                  <MdSettings className="item-icon" />
                  <span>الإعدادات العامة</span>
                </button>

                <button 
                  onClick={() => { navigate('/change-password'); setShowUserMenu(false); }} 
                  className="dropdown-item-btn"
                >
                  <MdLockOutline className="item-icon" />
                  <span>تغيير كلمة المرور</span>
                </button>
              </div>

              <div className="dropdown-divider"></div>

              {/* زر تسجيل الخروج */}
              <div className="dropdown-menu-list">
                <button onClick={logout} className="dropdown-item-btn logout-btn">
                  <MdLogout className="item-icon logout-icon" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* الجزء الأيسر (الإجراءات السريعة والإشعارات) */}
      <div className="topbar-actions d-flex align-items-center gap-2 gap-md-3">
        {/* إجراء سريع */}
        <div style={{ position: 'relative' }} ref={quickMenuRef}>
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="btn btn-primary action-btn"
          >
            <MdAdd style={{ fontSize: '18px' }} /> 
            <span className="d-none d-sm-inline">إجراء سريع</span>
          </button>

          {showQuickMenu && (
            <div className="quick-dropdown-menu">
              <NavLink to="/invoices/create" onClick={() => setShowQuickMenu(false)} className="quick-item">
                <AiOutlineFileAdd style={{ color: '#8B5E3C' }} /> فاتورة جديدة
              </NavLink>
              <NavLink to="/products" onClick={() => setShowQuickMenu(false)} className="quick-item border-top">
                <AiOutlineBarcode style={{ color: '#8B5E3C' }} /> إضافة منتج
              </NavLink>
            </div>
          )}
        </div>

        {/* نقطة البيع */}
        {can('point_of_sale.view') && (
          <NavLink to="/point-of-sales" className="btn btn-primary action-btn">
            نقطة البيع
          </NavLink>
        )}

        {/* ملء الشاشة */}
        <button
          onClick={toggleFullscreen}
          className="icon-btn d-none d-sm-flex"
          title={isFullscreen ? "الخروج من ملء الشاشة" : "عرض بملء الشاشة"}
        >
          {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
        </button>

        {/* الإشعارات */}
        <div className="notification-icon icon-btn">
          <MdNotificationsNone />
          <span className="notification-badge"></span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;