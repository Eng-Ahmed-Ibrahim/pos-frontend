import { useState, useEffect, useRef } from 'react';
import { MdNotificationsNone, MdFullscreen, MdFullscreenExit, MdAdd } from "react-icons/md";
import { AiOutlineFileAdd, AiOutlineBarcode } from "react-icons/ai";
import { CiLogout } from "react-icons/ci"; // أيقونة تسجيل الخروج اللي بتستخدمها

function Navbar() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false); // الحالة الخاصة بقائمة المستخدم

  const userMenuRef = useRef(null); // مرجع للتحكم بالقائمة عند الضغط خارجها

  const name = localStorage.getItem("name") || "مسؤول النظام";
  const role = localStorage.getItem("role") || "المدير العام";

  // دالة تسجيل الخروج الخاصة بك
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // إغلاق القائمة عند الضغط في أي مكان خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // وظيفة الـ Full Screen
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

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <div className="topbar d-flex align-items-center justify-content-between" 
           style={{ 
             padding: '12px 24px', 
             background: '#ffffff', 
             borderBottom: '1px solid #eef2f5',
             boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
             position: 'relative'
           }}>
        
        {/* الجزء الأيمن */}
        <div className="topbar-right d-flex align-items-center" style={{ gap: '15px' }}>
          <div>
            <div className="page-title" style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50' }}>
              مرحباً بك، {name.split(' ')[0]} 👋
            </div>
          </div>

        </div>

        {/* الجزء الأيسر */}
        <div className="topbar-actions d-flex align-items-center" style={{ gap: '18px' }}>
          
          {/* زر الإضافة السريعة */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="btn"
              style={{
                background: '#8B5E3C',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: '600'
              }}
            >
              <MdAdd style={{ fontSize: '18px' }} /> إجراء سريع
            </button>

            {showQuickMenu && (
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '0',
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                width: '180px',
                zIndex: '999',
                overflow: 'hidden'
              }}>
                <a href="/invoices/create" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#333', textDecoration: 'none', fontSize: '13px' }}>
                  <AiOutlineFileAdd style={{ color: '#8B5E3C' }} /> فاتورة جديدة
                </a>
                <a href="/products" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: '#333', textDecoration: 'none', fontSize: '13px', borderTop: '1px solid #f5f5f5' }}>
                  <AiOutlineBarcode style={{ color: '#8B5E3C' }} /> إضافة منتج
                </a>
              </div>
            )}
          </div>

          <div style={{ width: '1px', height: '24px', background: '#e0e0e0' }}></div>

          {/* زر ملء الشاشة */}
          <button 
            onClick={toggleFullscreen}
            style={{ background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer', color: '#5a6c7d', display: 'flex', alignItems: 'center' }}
            title={isFullscreen ? "الخروج من ملء الشاشة" : "عرض بملء الشاشة"}
          >
            {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
          </button>

          {/* أيقونة الإشعارات */}
          <div className="notification-icon" style={{ position: 'relative', fontSize: '24px', cursor: 'pointer', color: '#5a6c7d', display: 'flex', alignItems: 'center' }}>
            <MdNotificationsNone />
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              background: '#e74c3c',
              borderRadius: '50%'
            }}></span>
          </div>

          <div style={{ width: '1px', height: '24px', background: '#e0e0e0' }}></div>

          {/* كارت المستخدم مع الـ Dropdown (مُغلف بالـ Ref) */}
          <div className="user-profile-container" ref={userMenuRef} style={{ position: 'relative' }}>
            <div className="user-profile-nav" 
                 onClick={() => setShowUserMenu(!showUserMenu)} // يفتح ويقفل عند الضغط
                 style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
              <div className="avatar" style={{
                width: '36px',
                height: '36px',
                background: '#f4f6f8',
                color: '#8B5E3C',
                border: '1px solid #e1e8ed',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '13px'
              }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50', lineHeight: '1.2' }}>{name}</span>
                <span style={{ fontSize: '11px', color: '#bdc3c7' }}>{role}</span>
              </div>
            </div>

            {/* الـ Dropdown Menu الخاصة بالمستخدم */}
            {showUserMenu && (
              <div className="user-dropdown-menu" style={{
                position: 'absolute',
                top: '48px',
                left: '-70%', // يفتح باتجاه اليمين بما أنه في أقصى اليسار
                background: '#ffffff',
                border: '1px solid #eef2f5',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                minWidth: '160px',
                zIndex: '1000',
                overflow: 'hidden'
              }}>
                {/* يمكنك إضافة روابط إضافية هنا مستقبلاً مثل "الملف الشخصي" أو "الإعدادات" */}
                <button 
                  onClick={logout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    color: '#e74c3c', // لون أحمر يعبر عن الخروج
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'right',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#fdf2f2'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <CiLogout style={{ fontSize: '18px', color: '#e74c3c' }} />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes blinker {
          50% { opacity: 0.4; }
        }
        .blink {
          animation: blinker 1.5s linear infinite;
        }
      `}</style>
    </>
  );
}

export default Navbar;