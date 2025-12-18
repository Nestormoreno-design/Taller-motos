// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 🔑 MUY IMPORTANTE PARA LOGIN
});

export default API;
