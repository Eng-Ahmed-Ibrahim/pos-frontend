import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <>
      
      <Sidebar />

      <div className="main flex-grow-1">
        <Navbar />
        
        <div className="content p-3">
          <Outlet />
        </div>
      </div>

    </>
  );
}

export default Layout;