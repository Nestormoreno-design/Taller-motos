import React, { useEffect, useState } from "react";
import { getEmpleados, deleteEmpleado } from "../../services/empleadoService";
import EmpleadoForm from "./EmpleadoForm";
import Swal from 'sweetalert2';

export default function EmpleadoList() {
  const [empleados, setEmpleados] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ESTADOS PARA PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Registros por página

  const fetchEmpleados = async () => {
    try {
      const res = await getEmpleados();
      setEmpleados(res.data || []);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  useEffect(() => { fetchEmpleados(); }, []);

  // Reiniciar a la página 1 cuando se realiza una búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar empleado?',
      text: "Se perderá el acceso del usuario al sistema.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await deleteEmpleado(id);
      fetchEmpleados();
      Swal.fire('Eliminado', 'El empleado ha sido removido.', 'success');
    }
  };

  // --- 1. LÓGICA DE FILTRADO GLOBAL ---
  const empleadosFiltradosGlobal = empleados.filter(e => {
    const nombre = e.nombre ? e.nombre.toLowerCase() : "";
    const usuario = e.usuario ? e.usuario.toLowerCase() : "";
    const busqueda = searchTerm.toLowerCase();
    
    return nombre.includes(busqueda) || usuario.includes(busqueda);
  });

  // --- 2. LÓGICA DE PAGINACIÓN ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmpleados = empleadosFiltradosGlobal.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(empleadosFiltradosGlobal.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4 mb-5">
      {/* CABECERA */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-uppercase fw-bold m-0" style={{ letterSpacing: '1px', color: '#2d3436' }}>
          Gestión de Personal
        </h2>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" 
          onClick={() => { setEditing(null); setShowForm(true); }}
        >
          <i className="bi bi-person-badge-fill"></i> AGREGAR EMPLEADO
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="mb-4">
        <div className="input-group shadow-sm" style={{ maxWidth: '400px' }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Buscar por nombre o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <EmpleadoForm 
          editing={editing} 
          onClose={() => { setShowForm(false); fetchEmpleados(); }} 
        />
      )}

      {/* TABLA INDUSTRIAL */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark text-uppercase small" style={{ fontSize: '0.75rem' }}>
              <tr>
                <th className="px-3">ID</th>
                <th>Nombre Completo</th>
                <th>Cargo / Rol</th>
                <th>Usuario</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentEmpleados.length > 0 ? (
                currentEmpleados.map(e => (
                  <tr key={e.id_empleado}>
                    <td className="px-3 fw-bold text-muted small">#{e.id_empleado}</td>
                    <td className="fw-semibold">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                          <i className="bi bi-person text-secondary"></i>
                        </div>
                        {e.nombre}
                      </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${e.rol?.toLowerCase() === 'administrador' ? 'bg-dark' : 'bg-light text-dark border'}`} style={{ fontSize: '0.7rem' }}>
                        <i className={`bi ${e.rol?.toLowerCase() === 'administrador' ? 'bi-shield-check' : 'bi-tools'} me-1`}></i>
                        {e.rol?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <code className="bg-light px-2 py-1 rounded text-dark small">@{e.usuario}</code>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-3">
                        <button className="btn-icon text-secondary border-0 bg-transparent" onClick={() => { setEditing(e); setShowForm(true); }}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="btn-icon text-danger border-0 bg-transparent" onClick={() => handleDelete(e.id_empleado)}>
                          <i className="bi bi-trash3-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted small text-uppercase">
                    {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay registros."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- COMPONENTE DE PAGINACIÓN --- */}
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