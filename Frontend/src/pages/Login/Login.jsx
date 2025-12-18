import React, { useState } from "react";
import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function Login({ setIsLoggedIn, setCurrentUser }) {
  const [form, setForm] = useState({ usuario: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // Estado para el ojo
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Estado para feedback de carga
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // --- SIMULACRO PARA DEMO EN GITHUB PAGES ---
    // Esto permite que el reclutador entre usando estas credenciales
    setTimeout(() => {
      if (form.usuario === "admin" && form.password === "123456") {
        const fakeUser = {
          id: 1,
          usuario: "admin",
          nombre: "Nestor Moreno (Demo)"
        };
        
        setIsLoggedIn(true);
        if (setCurrentUser) setCurrentUser(fakeUser);
        navigate("/");
      } else {
        setError("Para la demo usa: admin / 123456");
        setLoading(false);
      }
    }, 1000); // Simulamos un segundo de carga para que se vea el spinner

    /* // Código original para producción con Flask:
    try {
      const response = await login(form);
      setIsLoggedIn(true);
      if (setCurrentUser) setCurrentUser(response.user);
      navigate("/");
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
      setLoading(false);
    } 
    */
  };

  return (
    <div 
      className="container-fluid d-flex justify-content-center align-items-center" 
      style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #212529 0%, #343a40 100%)" 
      }}
    >
      <div className="card p-4 shadow-lg border-0" style={{ width: "380px", borderRadius: "15px" }}>
        <div className="text-center mb-4">
          <div className="bg-dark d-inline-block p-3 rounded-circle mb-3 shadow">
            <i className="bi bi-person-lock fs-1 text-white"></i>
          </div>
          <h3 className="fw-bold">Bienvenido</h3>
          <p className="text-muted small">Ingrese sus credenciales para acceder</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Usuario */}
          <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase text-muted">Usuario</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-person text-muted"></i>
              </span>
              <input
                autoFocus
                className="form-control bg-light border-start-0 ps-0"
                name="usuario"
                placeholder="Nombre de usuario"
                value={form.usuario}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Campo Contraseña con Botón de Ver */}
          <div className="mb-4">
            <label className="form-label small fw-bold text-uppercase text-muted">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-key text-muted"></i>
              </span>
              <input
                className="form-control bg-light border-start-0 border-end-0 ps-0"
                type={showPassword ? "text" : "password"} // Cambia dinámicamente
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button 
                className="input-group-text bg-light border-start-0 text-muted"
                type="button"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
          </div>

          <button 
            className="btn btn-dark w-100 py-2 fw-bold shadow-sm" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-box-arrow-in-right me-2"></i>
            )}
            {loading ? "Verificando..." : "Entrar al Sistema"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted extra-small mb-0">© 2025 Mi Taller de Motos</p>
        </div>
      </div>
    </div>
  );

}
