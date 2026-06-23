import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/Components/apiFetch";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [systemSettings, setSystemSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  const can = (permission) => {
    return permissions.includes(permission);
  };

const systemSetting = (key) => {
  return systemSettings?.[key] || "";
};
  const setAuthData = (data) => {
    setUser(data.user);
    setPermissions(data.permissions || []);
    setRoles(data.roles || []);
    setSystemSettings(data.settings)
    localStorage.setItem("name", data.user.name);
    localStorage.setItem("role", data.roles);

  }; 

  const fetchUser = async () => {
    try {
      const res = await apiFetch("user");
      const json = await res.json();

      
      setAuthData(json);
    } catch (err) {
      setUser(null);
      setPermissions([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    setRoles([]);
    localStorage.removeItem("token");
  };


  // 👇 أهم سطر هنا
  useEffect(() => {
          fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        can,
        systemSetting,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);