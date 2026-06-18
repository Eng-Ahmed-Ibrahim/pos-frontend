export const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const API_BASE = import.meta.env.VITE_API_URL
    const res = await fetch(`${API_BASE}/${url}`, {
        ...options,
        headers: {
            Accept: "application/json",
            // "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
            ...options.headers,
        },
    });

    if (res.status === 401) {
        localStorage.clear(); // يمسح كل الكاش
        window.location.href = "/login"; // يرجع لصفحة الدخول
        return;
    }

    return res;
};