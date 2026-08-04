import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PRICE_CHECKER_PERMISSION = "price-checker.view";
const PRICE_CHECKER_ROUTE = "/price-check";

const ProtectedRoute = () => {
    const token = localStorage.getItem("token");
    const { user, permissions, loading, roles } = useAuth();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                <p>جاري التحميل...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }


    const isPriceCheckerOnly =
        permissions.length === 1 && permissions[0] === PRICE_CHECKER_PERMISSION;


    if (isPriceCheckerOnly && location.pathname !== PRICE_CHECKER_ROUTE) {
        return <Navigate to={PRICE_CHECKER_ROUTE} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;