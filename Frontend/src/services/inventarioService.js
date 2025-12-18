import API from "../api/axios"; 

// Obtener productos con soporte para paginación y búsqueda en todas las páginas
export const getInventario = (page = 1, perPage = 10, search = "") => 
    API.get(`/api/inventario?page=${page}&per_page=${perPage}&search=${search}`);

// Crear un nuevo producto
export const createItem = (data) => 
    API.post("/api/inventario", data);

// Actualizar un producto existente
export const updateItem = (id, data) => 
    API.put(`/api/inventario/${id}`, data);

// Eliminar un producto
export const deleteInventario = (id) => 
    API.delete(`/api/inventario/${id}`);