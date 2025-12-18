import API from "../api/axios"; 

// Obtener proveedores con soporte para paginación y búsqueda global
// Se pasan page, perPage y search como parámetros de consulta (query params)
export const getProveedores = (page = 1, perPage = 10, search = "") => 
    API.get(`/api/proveedores?page=${page}&per_page=${perPage}&search=${search}`);

// Crear un nuevo proveedor
export const createProveedor = (data) => 
    API.post("/api/proveedores", data);

// Actualizar un proveedor existente
export const updateProveedor = (id, data) => 
    API.put(`/api/proveedores/${id}`, data);

// Eliminar un proveedor
export const deleteProveedor = (id) => 
    API.delete(`/api/proveedores/${id}`);