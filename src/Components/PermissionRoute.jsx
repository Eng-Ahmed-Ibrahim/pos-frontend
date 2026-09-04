import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";


const PermissionRoute = ({ permission }) => {

    const { permissions } = useAuth();

    if (!permissions) {
        return <Navigate to="/login" replace />;
    }

    console.log("permission " ,permission);
    
    const hasPermission = permissions?.includes(permission);
    console.log("hasPermission = " ,hasPermission);
    
    if (!hasPermission) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
};

export default PermissionRoute;