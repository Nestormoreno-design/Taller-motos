import axios from "axios";
//import API from "../api/axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

export const getVehiculoById = async (id) => {
  return await axios.get(`${API_URL}/vehiculos/${id}`);
};
export const getVehiculos = () => API.get("/api/vehiculo");
export const createVehiculo = (data) => API.post("/api/vehiculo", data);
export const updateVehiculo = (id, data) => API.put(`/api/vehiculo/${id}`, data);
export const deleteVehiculo = (id) => API.delete(`/api/vehiculo/${id}`);
