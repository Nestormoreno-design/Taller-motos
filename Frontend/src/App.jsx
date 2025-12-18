import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./services/authService";

// Componentes de Layout
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

// Páginas
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProveedorList from "./pages/Proveedores/ProveedorList";
import InventarioList from "./pages/Inventario/InventarioList";
import ClienteList from "./pages/Clientes/ClienteList";
import VehiculoList from "./pages/Vehiculos/VehiculoList";
import EmpleadoList from "./pages/Empleados/EmpleadoList";
import OrdenList from "./pages/Ordenes/OrdenList";
import ManoList from "./pages/Mano/ManoList";
import FacturaList from "./pages/Facturas/FacturaList";

function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function verify() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsLoggedIn(true);
          setCurrentUser(user);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        
        {/* SIDEBAR: IMPORTANTE pasarle las funciones de estado */}
        {isLoggedIn && (
          <Sidebar 
            setIsLoggedIn={setIsLoggedIn} 
            setCurrentUser={setCurrentUser} 
          />
        )}

        {/* CONTENEDOR DERECHO */}
        <div 
          className="d-flex flex-column flex-grow-1" 
          style={{ 
            marginLeft: isLoggedIn ? "260px" : "0", 
            transition: "margin 0.3s ease",
            backgroundColor: "#f8f9fa" 
          }}
        >
          {/* Aquí podrías poner el Navbar si lo necesitas, pasando también setIsLoggedIn */}
          {/* {isLoggedIn && <Navbar setIsLoggedIn={setIsLoggedIn} />} */}

          {/* ÁREA DE CONTENIDO PRINCIPAL */}
          <main className={`flex-grow-1 ${isLoggedIn ? "p-4" : ""}`}>
            <Routes>
              {/* Login: Al loguear, Login.jsx también debe recibir setCurrentUser si lo manejas ahí */}
              <Route
                path="/login"
                element={
                  isLoggedIn ? 
                  <Navigate to="/" /> : 
                  <Login setIsLoggedIn={setIsLoggedIn} setCurrentUser={setCurrentUser} />
                }
              />

              {/* Rutas Privadas */}
              <Route
                path="/"
                element={isLoggedIn ? <Dashboard currentUser={currentUser} /> : <Navigate to="/login" />}
              />
              <Route path="/proveedores" element={isLoggedIn ? <ProveedorList /> : <Navigate to="/login" />} />
              <Route path="/inventario" element={isLoggedIn ? <InventarioList /> : <Navigate to="/login" />} />
              <Route path="/clientes" element={isLoggedIn ? <ClienteList /> : <Navigate to="/login" />} />
              <Route path="/vehiculos" element={isLoggedIn ? <VehiculoList /> : <Navigate to="/login" />} />
              <Route path="/empleados" element={isLoggedIn ? <EmpleadoList /> : <Navigate to="/login" />} />
              <Route path="/ordenes" element={isLoggedIn ? <OrdenList /> : <Navigate to="/login" />} />
              <Route path="/mano" element={isLoggedIn ? <ManoList /> : <Navigate to="/login" />} />
              <Route path="/facturas" element={isLoggedIn ? <FacturaList /> : <Navigate to="/login" />} />

              <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
            </Routes>
          </main>

          {isLoggedIn && <Footer />}
        </div>
      </div>
    </Router>
  );
}

export default App;