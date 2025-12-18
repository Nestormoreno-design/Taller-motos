import React, { useEffect, useState } from "react";
import { getProveedores, deleteProveedor } from "../../services/proveedorService";
import ProveedorForm from "./ProveedorForm";

export default function ProveedorList() {
  const [proveedores, setProveedores] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Estados para paginación y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      // Llamada al servicio con búsqueda global
      const res = await getProveedores(page, 10, searchTerm);
      setProveedores(res.data.data);
      setTotalPages(res.data.total_pages);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  };

  // Recargar cuando cambie la página o el término de búsqueda
  useEffect(() => {
    fetchData();
  }, [page, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reiniciar a la primera página al buscar
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este proveedor? Esto podría afectar registros de inventario.")) {
      await deleteProveedor(id);
      fetchData();
    }
  };

  return (
    <div className="container mt-4">
      {/* CABECERA */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-uppercase fw-bold m-0" style={{ letterSpacing: '1px' }}>
          Directorio de Proveedores
        </h2>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2" 
          onClick={() => { setEditing(null); setShowForm(true); }}
        >
          <i className="bi bi-truck"></i> REGISTRAR PROVEEDOR
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="mb-3">
        <div className="input-group shadow-sm" style={{ maxWidth: '450px' }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {showForm && (
        <ProveedorForm 
          onClose={() => { setShowForm(false); fetchData(); }} 
          editing={editing} 
        />
      )}

      {/* TABLA INDUSTRIAL */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-dark text-uppercase" style={{ fontSize: '0.75rem' }}>
            <tr>
              <th className="px-3" style={{ width: '80px' }}>ID</th>
              <th>Razón Social / Nombre</th>
              <th>Contacto Directo</th>
              <th>Email Corporativo</th>
              <th>Ubicación</th>
              <th className="text-center" style={{ width: '150px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.length > 0 ? (
              proveedores.map(p => (
                <tr key={p.id_proveedores}>
                  <td className="px-3 fw-bold text-muted small">#{p.id_proveedores}</td>
                  <td className="fw-semibold text-uppercase">{p.nombre}</td>
                  <td>{p.telefono}</td>
                  <td className="small text-lowercase text-primary">{p.email}</td>
                  <td className="small text-muted">{p.direccion}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-3">
                      <button className="btn-icon text-secondary" onClick={() => { setEditing(p); setShowForm(true); }}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn-icon text-danger" onClick={() => handleDelete(p.id_proveedores)}>
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted small text-uppercase">
                  {searchTerm ? `Sin resultados para "${searchTerm}"` : "No hay proveedores registrados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

      {/* Paginación */}
        {totalPages > 1 && (
          <div className="card-footer bg-white border-top py-3">
            <nav>
              <ul className="pagination pagination-sm justify-content-center mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}