import React, { useEffect, useState } from "react";
import { getClientes, deleteCliente } from "../../services/clienteService";
import ClienteForm from "./ClienteForm";

export default function ClienteList() {
  const [clientes, setClientes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Estado para el buscador
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClientes = async () => setClientes((await getClientes()).data);

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este cliente? Se borrarán sus registros asociados.")) {
      await deleteCliente(id);
      fetchClientes();
    }
  };

  // Lógica de filtrado por NOMBRE o TELÉFONO (número)
  const clientesFiltrados = clientes.filter(c => {
    const nombre = c.nombre ? c.nombre.toLowerCase() : "";
    const telefono = c.telefono ? c.telefono.toString() : "";
    const busqueda = searchTerm.toLowerCase();
    
    return nombre.includes(busqueda) || telefono.includes(busqueda);
  });

  return (
    <div className="container mt-4">
      {/* CABECERA */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-uppercase fw-bold m-0" style={{ letterSpacing: '1px' }}>
          Gestión de Clientes
        </h2>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => { setEditing(null); setShowForm(true); }}
        >
          <i className="bi bi-person-plus-fill"></i> NUEVO CLIENTE
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="mb-3">
        <div className="input-group shadow-sm">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Buscar por nombre o número de teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="btn btn-outline-secondary border-start-0" 
              onClick={() => setSearchTerm("")}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="form-text ms-1 text-primary fw-bold">
            Resultados encontrados: {clientesFiltrados.length}
          </div>
        )}
      </div>

      {showForm && (
        <ClienteForm 
          editing={editing} 
          onClose={() => { setShowForm(false); fetchClientes(); }} 
        />
      )}

      {/* TABLA DE DATOS */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-dark text-uppercase" style={{ fontSize: '0.75rem' }}>
            <tr>
              <th className="px-3">ID</th>
              <th>Nombre Completo</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map(c => (
                <tr key={c.id_cliente}>
                  <td className="px-3 fw-bold text-muted">#{c.id_cliente}</td>
                  <td className="fw-semibold text-dark">{c.nombre}</td>
                  <td>
                    <i className="bi bi-telephone text-muted me-2"></i>{c.telefono}
                  </td>
                  <td className="small">{c.email}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-3">
                      <button
                        className="btn-icon text-secondary"
                        title="Editar"
                        onClick={() => { setEditing(c); setShowForm(true); }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn-icon text-danger"
                        title="Eliminar"
                        onClick={() => handleDelete(c.id_cliente)}
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted small text-uppercase">
                  {searchTerm ? `No se hallaron clientes para: "${searchTerm}"` : "Cargando clientes..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}