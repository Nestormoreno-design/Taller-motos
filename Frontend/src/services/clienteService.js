import axios from "axios";
import API from "../api/axios";



export const getClientes = () => API.get("/api/cliente");
export const createCliente = (data) => API.post("/api/cliente", data);
export const updateCliente = (id, data) => API.put(`/api/cliente/${id}`, data);
export const deleteCliente = (id) => API.delete(`/api/cliente/${id}`);
