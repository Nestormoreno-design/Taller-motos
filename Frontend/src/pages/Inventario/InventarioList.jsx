import React, { useEffect, useState } from "react";
import { getInventario, deleteInventario } from "../../services/inventarioService";
import InventarioForm from "./InventarioForm";

export default function InventarioList() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // Paginación y Búsqueda
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      const res = await getInventario(page, 10, search);
      // Extraemos .data.data porque el backend envía un objeto de paginación
      setItems(res.data.data || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
      setItems([]); // Evita que la app truene si falla la red
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este artículo del inventario?")) {
      await deleteInventario(id);
      fetchData();
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-uppercase">Control de Inventario</h2>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          <i className="bi bi-plus-circle me-2"></i> NUEVO ARTÍCULO
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control w-25 shadow-sm"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {showForm && (
        <InventarioForm 
          onClose={() => { setShowForm(false); fetchData(); }} 
          editing={editing} 
        />
      )}

      <div className="card shadow-sm border-0">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th className="px-3">CÓDIGO</th>
              <th>DESCRIPCIÓN</th>
              <th>PROVEEDOR</th>
              <th>STOCK</th>
              <th>PRECIO VENTA</th>
              <th className="text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id_inventario}>
                  <td className="px-3 fw-bold text-muted small">{item.codigo}</td>
                  <td className="fw-semibold">{item.nombre}</td>
                  {/* AQUÍ YA NO USAMOS .find(), USAMOS EL JOIN DEL BACKEND */}
                  <td className="text-secondary small">
                    {item.nombre_proveedor || "Sin asignar"}
                  </td>
                  <td>
                    <span className={`badge ${item.stock <= 5 ? 'bg-danger' : 'bg-success'}`}>
                      {item.stock} unidades
                    </span>
                  </td>
                  <td className="fw-bold text-primary">
                    ${parseFloat(item.precio_venta).toLocaleString()}
                  </td>
                  <td className="text-center">
                    <button className="btn btn-sm text-secondary me-2" onClick={() => { setEditing(item); setShowForm(true); }}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="btn btn-sm text-danger" onClick={() => handleDelete(item.id_inventario)}>
                      <i className="bi bi-trash3-fill"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center py-4 text-muted">No hay resultados</td></tr>
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
       