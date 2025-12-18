import axios from "axios";
import API from "../api/axios";

export const getDetalles = () => API.get("/api/detalle");
export const createDetalle = (data) => API.post("/api/detalle", data);
export const updateDetalle = (id, data) => API.put(`/api/detalle/${id}`, data);
export const deleteDetalle = (id) => API.delete(`/api/detalle/${id}`);
