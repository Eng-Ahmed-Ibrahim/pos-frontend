import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="main flex-grow-1">
        <Navbar onToggleSidebar={toggleSidebar} />
        
        <div className="content p-2 p-md-3">
          <Outlet />
        </div>
      </div>

      {/* Responsive Styles Injection */}
      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
        }

        .main {
          display: flex;
          flex-direction: column;
          min-width: 0;
          width: 100%;
        }

        /* Topbar Styles */
        .topbar {
          padding: 10px 16px;
          background: #ffffff;
          border-bottom: 1px solid #eef2f5;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          position: sticky;
          top: 0;
          z-index: 99;
        }

        .sidebar-toggle-btn, .sidebar-close-btn {
          background: none;
          border: none;
          color: #2c3e50;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .action-btn {
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .icon-btn {
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          color: #5a6c7d;
          display: flex;
          align-items: center;
          position: relative;
          padding: 4px;
        }

        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 8px;
          height: 8px;
          background-color: #e74c3c;
          border-radius: 50%;
        }

        .user-dropdown-menu {
          position: absolute;
          top: 48px;
          right: 0;
          background: #ffffff;
          border: 1px solid #eef2f5;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          min-width: 160px;
          z-index: 1000;
          overflow: hidden;
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          color: #e74c3c;
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: right;
        }

        .logout-btn:hover {
          background: #fdf2f2;
        }

        .quick-dropdown-menu {
          position: absolute;
          top: 40px;
          left: 0;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          width: 170px;
          z-index: 999;
          overflow: hidden;
        }

        .quick-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          color: #333;
          text-decoration: none;
          font-size: 13px;
        }

        .quick-item:hover {
          background: #f8f9fa;
        }

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: #2c3e50;
          line-height: 1.2;
        }

        .user-role {
          font-size: 11px;
          color: #bdc3c7;
        }

        /* Responsive Sidebar Drawer Styles */
        @media (max-width: 991.98px) {
          .sidebar {
            position: fixed;
            top: 0;
            right: -280px;
            width: 260px;
            height: 100vh;
            z-index: 1050;
            transition: right 0.3s ease-in-out;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
            background: #fff;
            display: flex;
            flex-direction: column;
          }

          .sidebar.mobile-open {
            right: 0;
          }

          .sidebar-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.4);
            z-index: 1040;
          }

          .sidebar-scroll-content {
            flex: 1;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default Layout;