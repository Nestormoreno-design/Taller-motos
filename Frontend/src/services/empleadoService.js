// src/services/empleadoService.js
import API from "../api/axios"; // ✅ esta instancia ya tiene withCredentials: true



export const getEmpleados = () => API.get("/api/empleado");       // lista todos
export const getEmpleado = (id) => API.get(`/api/empleado/${id}`);
export const createEmpleado = (data) => API.post("/api/empleado", data);
export const updateEmpleado = (id, data) => API.put(`/api/empleado/${id}`, data);
export const deleteEmpleado = (id) => API.delete(`/api/empleado/${id}`);
