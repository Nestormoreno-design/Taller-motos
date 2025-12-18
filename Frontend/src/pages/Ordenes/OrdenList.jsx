import React, { useEffect, useState } from "react";
import { getOrdenes, deleteOrden, updateOrden } from "../../services/ordenService";
import OrdenForm from "./OrdenForm";
import { getVehiculos } from "../../services/vehiculoService";
import { getEmpleados } from "../../services/empleadoService";
import FacturaCompletaForm from "../Facturas/FacturaCompletaForm";
import Swal from 'sweetalert2';

export default function OrdenList() {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showFactura, setShowFactura] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ESTADOS DE PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

  const fetchOrdenes = async () => setOrdenes((await getOrdenes()).data);
  const fetchVehiculos = async () => setVehiculos((await getVehiculos()).data);
  const fetchEmpleados = async () => setEmpleados((await getEmpleados()).data);

  useEffect(() => {
    fetchOrdenes();
    fetchVehiculos();
    fetchEmpleados();
  }, []);

  // MUY IMPORTANTE: Cuando el usuario escribe, regresamos a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCambioEstado = async (orden, nuevoEstado) => {
    Swal.fire({
      title: 'Actualizando...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const response = await updateOrden(orden.id_ordenes, { ...orden, estado: nuevoEstado });
      Swal.fire({
        title: 'Éxito',
        text: response.data.message || "Estado actualizado",
        icon: 'success',
        confirmButtonColor: '#2d3436'
      });
      fetchOrdenes();
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'No se pudo actualizar.', icon: 'error' });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar orden?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });
    if (result.isConfirmed) {
      await deleteOrden(id);
      fetchOrdenes();
    }
  };

  // --- LÓGICA DE BÚSQUEDA GLOBAL ---
  // Primero filtramos TODO el array de ordenes según el término de búsqueda
  const ordenesFiltradasGlobal = ordenes.filter(o => {
    const placa = vehiculos.find(v => v.id_vehiculo === o.id_vehiculo)?.placa || "";
    // Buscamos por placa o por ID de orden
    return (
      placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id_ordenes.toString().includes(searchTerm)
    );
  }).sort((a, b) => b.id_ordenes - a.id_ordenes);

  // --- LÓGICA DE PAGINACIÓN SOBRE RESULTADOS FILTRADOS ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Solo cortamos los 10 que corresponden a la página actual de los resultados ya filtrados
  const currentOrdenes = ordenesFiltradasGlobal.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ordenesFiltradasGlobal.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-uppercase fw-bold m-0" style={{ letterSpacing: '1px', color: '#2d3436' }}>
          Órdenes de Trabajo
        </h2>
        <button className="btn btn-primary shadow-sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <i className="bi bi-plus-lg me-2"></i>NUEVA ORDEN
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <div className="input-group shadow-sm" style={{ maxWidth: '500px' }}>
          <span className="input-group-text bg-white border-end-0 text-muted">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Buscar por placa o N° de orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearchTerm("")}>
              <i className="bi bi-x-circle"></i>
            </button>
          )}
        </div>
        <div className="form-text text-muted ps-1">
          Buscando en {ordenesFiltradasGlobal.length} registros totales.
        </div>
      </div>

      {showForm && (
        <OrdenForm editing={editing} vehiculos={vehiculos} empleados={empleados} 
          onClose={() => { setShowForm(false); fetchOrdenes(); }} 
        />
      )}

      {showFactura && ordenSeleccionada && (
        <FacturaCompletaForm orden={ordenSeleccionada}
          onClose={() => { setShowFactura(false); setOrdenSeleccionada(null); fetchOrdenes(); }}
        />
      )}

      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark text-uppercase small">
              <tr>
                <th className="px-3">ID</th>
                <th style={{ width: '180px' }}>Estado</th>
                <th>Fecha</th>
                <th>Vehículo</th>
                <th>Empleado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentOrdenes.length > 0 ? (
                currentOrdenes.map(o => (
                  <tr key={o.id_ordenes}>
                    <td className="px-3 fw-bold text-muted">#{o.id_ordenes}</td>
                    <td>
                      <select 
                        className={`form-select form-select-sm fw-bold ${o.estado === 'finalizado' ? 'text-success border-success' : 'text-primary'}`}
                        value={o.estado}
                        onChange={(e) => handleCambioEstado(o, e.target.value)}
                      >
                        <option value="pendiente">PENDIENTE</option>
                        <option value="diagnostico">DIAGNÓSTICO</option>
                        <option value="reparacion">REPARACIÓN</option>
                        <option value="finalizado">FINALIZADO</option>
                      </select>
                    </td>
                    <td className="small">{o.fecha_ingreso}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {vehiculos.find(v => v.id_vehiculo === o.id_vehiculo)?.placa || "N/A"}
                      </span>
                    </td>
                    <td>{empleados.find(e => e.id_empleado === o.id_empleado)?.nombre || "N/A"}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button className="btn btn-sm btn-light text-primary" onClick={() => { setOrdenSeleccionada(o); setShowFactura(true); }}>
                          <i className="bi bi-cash-stack"></i>
                        </button>
                        <button className="btn btn-sm btn-light text-secondary" onClick={() => { setEditing(o); setShowForm(true); }}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(o.id_ordenes)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No se encontraron órdenes que coincidan con "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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