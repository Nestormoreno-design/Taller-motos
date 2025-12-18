import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/authService";

export default function Sidebar({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      if (window.confirm("¿Deseas cerrar la sesión?")) {
        await logout();
        setIsLoggedIn(false);
        navigate("/login");
      }
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    }
  };

  const menuItems = [
    { path: "/", label: "Inicio", icon: "bi-house-door" },
    { path: "/clientes", label: "Clientes", icon: "bi-people" },
    { path: "/vehiculos", label: "Vehículos", icon: "bi-car-front" },
    { path: "/ordenes", label: "Órdenes de Trabajo", icon: "bi-wrench-adjustable" },    
    { path: "/inventario", label: "Inventario", icon: "bi-box-seam" },      
    { path: "/empleados", label: "Empleados", icon: "bi-person-badge" },
    { path: "/facturas", label: "Facturación", icon: "bi-file-earmark-text" },
    { path: "/proveedores", label: "Proveedores", icon: "bi-truck" },
    
    
  ];

  return (
    <div 
      className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark shadow" 
      style={{ 
        width: "260px", 
        height: "100vh", 
        position: "fixed", 
        top: 0, 
        left: 0,
        zIndex: 1050 
      }}
    >
      <Link to="/" className="d-block mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
    <div className="d-flex align-items-center">
        <i className="bi bi-gear-wide-connected fs-4 me-2 text-warning"></i>
        <span className="fs-4 fw-bold text-uppercase">Moto GP</span>
    </div>
    
    <span style={{fontSize: '0.9rem', marginLeft: '33px'}} className="d-block text-white fw-normal">Workshop</span>
</Link>
      <hr className="text-secondary" />
      
      <ul className="nav nav-pills flex-column mb-auto overflow-y-auto">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link text-white d-flex align-items-center my-1 ${
                location.pathname === item.path ? "active bg-primary shadow" : "opacity-75"
              }`}
            >
              {/* Esta es la parte clave: bi + nombre del icono */}
              <i className={`bi ${item.icon} me-3 fs-5`}></i>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <hr className="text-secondary" />

      <div className="d-grid mt-auto">
        <button 
          className="btn btn-outline-danger d-flex align-items-center justify-content-center py-2" 
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2 fs-5"></i>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}