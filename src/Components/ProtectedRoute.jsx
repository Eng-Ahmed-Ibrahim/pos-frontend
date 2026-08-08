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
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    gap: "16px",
                    backgroundColor: "#f8fafc",
                    width:"100%"
                }}
            >
                <div
                    style={{
                        width: "50px",
                        height: "50px",
                        border: "5px solid #e5e7eb",
                        borderTop: "5px solid #2563eb",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }}
                />

                <p
                    style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#374151",
                        margin: 0,
                    }}
                >
                    جاري التحميل...
                </p>

                <style>
                    {`
                    @keyframes spin {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}
                </style>
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