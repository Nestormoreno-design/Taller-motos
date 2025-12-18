import API from "../api/axios"; 

// Se agrega el parámetro 'search' a la URL
export const getFacturas = (page = 1, perPage = 10, search = "") => 
    API.get(`/api/factura?page=${page}&per_page=${perPage}&search=${search}`);

export const createFactura = (data) => API.post("/api/factura", data);

export const updateFactura = (id, data) => API.put(`/api/factura/${id}`, data);

export const deleteFactura = (id) => API.delete(`/api/factura/${id}`);

export const notificarFactura = (id) => API.post(`/api/factura/${id}/notificar`);

export const descargarFacturaURL = (id) => `${API.defaults.baseURL}/api/factura/descargar/${id}`;