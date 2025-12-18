import axios from "axios";
//import API from "../api/axios";



const API = axios.create({ baseURL: "http://localhost:5000" });

export const getOrdenes = () => API.get("/api/orden");
export const createOrden = (data) => API.post("/api/orden", data);
export const updateOrden = (id, data) => API.put(`/api/orden/${id}`, data);
export const deleteOrden = (id) => API.delete(`/api/orden/${id}`);
