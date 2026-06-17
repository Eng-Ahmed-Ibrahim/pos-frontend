import { Routes, Route } from 'react-router-dom';

import Layout from './Components/Layout/Layout';
import Dashboard from './Pages/Dashboard';
import Products from './Pages/Products';
import Category from './Pages/Category';
import SubCategory from './Pages/SubCategory';
import Suppliers from './Pages/Suppliers';
import CreateInvoice from './Pages/Invoices/CreateInvoice';
import Invoices from './Pages/Invoices/Invoices';
import EditInvoice from './Pages/Invoices/EditInvoice';
import PointOfSale from './Pages/PointOfSale/Pointofsale';
import SaleInvoicePrint from './Pages/PointOfSale/SaleInvoicePrint';
import Login from './Pages/Login/Login';
import ProtectedRoute from './Components/ProtectedRoute';
import PublicRoute from './Components/PublicRoute';

function App() {
  return (
    <Routes>

      {/* public route */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>
      {/* protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/sub-categories" element={<SubCategory />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/invoices/edit/:id" element={<EditInvoice />} />
          <Route path="/point-of-sales" element={<PointOfSale />} />
        </Route>

        <Route path="/sales/:id/print" element={<SaleInvoicePrint />} />
      </Route>

    </Routes>
  );
}

export default App;