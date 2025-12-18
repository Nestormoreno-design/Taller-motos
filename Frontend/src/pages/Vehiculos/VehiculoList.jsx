import React, { useEffect, useState } from "react";
import { getVehiculos, deleteVehiculo } from "../../services/vehiculoService";
import VehiculoForm from "./VehiculoForm";
import { getClientes } from "../../services/clienteService";
import Swal from 'sweetalert2';

export default function VehiculoList() {
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ESTADOS PARA PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Cantidad de vehículos por página

  const fetchData = async () => {
    try {
      const resVehiculos = await getVehiculos();
      const resClientes = await getClientes();
      setVehiculos(resVehiculos.data || []);
      setClientes(resClientes.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reiniciar a la página 1 cuando se busca algo
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar vehículo?',
      text: "Se borrará permanentemente",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      await deleteVehiculo(id);
      fetchData();
    }
  };

  // --- 1. FILTRADO GLOBAL (Busca en todo el array) ---
  const vehiculosFiltradosGlobal = vehiculos.filter((v) => {
    const placa = v.placa ? v.placa.toLowerCase() : "";
    const cliente = clientes.find((c) => c.id_cliente === v.id_cliente);
    const nombrePropietario = cliente ? cliente.nombre.toLowerCase() : "";
    const busqueda = searchTerm.toLowerCase();

    return placa.includes(busqueda) || nombrePropietario.includes(busqueda);
  });

  // --- 2. LÓGICA DE RECORTE PARA LA PÁGINA ACTUAL ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehiculos = vehiculosFiltradosGlobal.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vehiculosFiltradosGlobal.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-uppercase fw-bold m-0" style={{ letterSpacing: '1px' }}>
          Inventario de Vehículos
        </h2>
        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          onClick={() => { setEditing(null); setShowForm(true); }}
        >
          <i className="bi bi-car-front-fill"></i> REGISTRAR VEHÍCULO
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="mb-4">
        <div className="input-group shadow-sm" style={{ maxWidth: '500px' }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Buscar por placa o propietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <VehiculoForm 
          editing={editing} 
          clientes={clientes}
          onClose={() => { setShowForm(false); fetchData(); }} 
        />
      )}

      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark text-uppercase small">
              <tr>
                <th className="px-3">Placa</th>
                <th>Marca/Modelo</th>
                <th>Año</th>
                <th>Kilometraje</th>
                <th>Propietario</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentVehiculos.length > 0 ? (
                currentVehiculos.map((v) => (
                  <tr key={v.id_vehiculo}>
                    <td className="px-3 fw-bold">{v.placa?.toUpperCase()}</td>
                    <td className="text-uppercase">{v.marca} {v.modelo}</td>
                    <td>{v.anio}</td>
                    <td>{v.kilometraje ? `${Number(v.kilometraje).toLocaleString()} KM` : "0 KM"}</td>
                    <td className="small">
                      {clientes.find((c) => c.id_cliente === v.id_cliente)?.nombre || "N/A"}
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button className="btn btn-sm btn-light text-secondary" onClick={() => { setEditing(v); setShowForm(true); }}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(v.id_vehiculo)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted">No se encontraron vehículos.</td></tr>
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