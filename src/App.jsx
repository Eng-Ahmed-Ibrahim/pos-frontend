import { Routes, Route } from 'react-router-dom';

import Layout from './Components/Layout/Layout';
import Dashboard from './Pages/Dashboard';
import Products from './Pages/Products/Products';
import Category from './Pages/Category/Category';
import SubCategory from './Pages/Subcategory/SubCategory';
import Suppliers from './Pages/Suppliers/Suppliers';
import CreateInvoice from './Pages/Purchases/Create';
import Purchases from './Pages/Purchases/Purchases';
import EditPurchases from './Pages/Purchases/Edit';
import PointOfSale from './Pages/PointOfSale/Pointofsale';
import SaleInvoicePrint from './Pages/PointOfSale/SaleInvoicePrint';
import Login from './Pages/Login/Login';
import ProtectedRoute from './Components/ProtectedRoute';
import PublicRoute from './Components/PublicRoute';
import Returned from './Pages/PointOfSale/Returned';
import Users from './Pages/Users/Users';
import { AuthProvider } from './context/AuthContext';
import Roles from './Pages/Users/Roles';
import Reports from './Pages/Reports/Reports';
import Settings from './Pages/Settings/Settings';
import WarehouseInventory from './Pages/Reports/WarehouseInventory';
import CashierReports from './Pages/Reports/CashierReports';
import PurchaseReturned from './Pages/Purchases/Returned';
import Units from './Pages/Units/Units';
import WastePage from './Pages/Wastes/Wastepage';
import FinancialReport from './Pages/Reports/Financialreport';
import PriceCheck from './Pages/PriceCheck';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* public route */}
        {/* protected routes */}

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Category />} />
            <Route path="/sub-categories" element={<SubCategory />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/invoices" element={<Purchases />} />
            <Route path="/invoice/return" element={<PurchaseReturned  />} />
            <Route path="/invoices/create" element={<CreateInvoice />} />
            <Route path="/invoices/edit/:id" element={<EditPurchases />} />
            <Route path="/point-of-sales" element={<PointOfSale />} />
            <Route path="/returns" element={<Returned />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/units" element={<Units />} />
            <Route path="/waste" element={<WastePage />} />
            <Route path="/financial" element={<FinancialReport />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/warehouse-inventory" element={<WarehouseInventory />} />
            <Route path="/cashier-reports" element={<CashierReports />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="/sales/:id/print" element={<SaleInvoicePrint />} />
          </Route>
            <Route path="/price-check" element={<PriceCheck />} />

        </Route>
      </Routes>
    </AuthProvider>

  );
}

export default App;