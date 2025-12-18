import API from "../api/axios";

// Login con cookies
// Ahora devuelve { message, user: { id, usuario, nombre } }
export const login = async (data) => {
    const res = await API.post("/auth/login", data, { withCredentials: true });
    return res.data; 
};

// Logout
export const logout = () => API.post("/auth/logout", {}, { withCredentials: true });

// Obtener usuario actual
export const getCurrentUser = async () => {
  try {
    const res = await API.get("/auth/me", { withCredentials: true });
    // Res.data ahora contiene: { id, usuario, nombre }
    return res.data; 
  } catch (err) {
    return null;
  }
};

// Verificar si hay sesión
export const checkAuth = async () => {
  const user = await getCurrentUser();
  return !!user;
};