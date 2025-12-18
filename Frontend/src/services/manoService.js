import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true
});

export const getManos = () => API.get("/api/mano");
export const getManoByOrden = (id_orden) => API.get(`/api/mano/orden/${id_orden}`);
export const createMano = (data) => API.post("/api/mano", data);
export const updateMano = (id, data) => API.put(`/api/mano/${id}`, data);
export const deleteMano = (id) => API.delete(`/api/mano/${id}`);
