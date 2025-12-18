import React, { useEffect, useState } from "react";
import { getManos, deleteMano } from "../../services/manoService";
import ManoForm from "./ManoForm";
import { getOrdenes } from "../../services/ordenService";

export default function ManoList() {
  const [manos, setManos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchManos = async () => {
    try {
      const res = await getManos();
      setManos(res.data);
    } catch (error) {
      console.error("Error cargando mano de obra:", error);
    }
  };

  const fetchOrdenes = async () => {
    try {
      const res = await getOrdenes();
      setOrdenes(res.data);
    } catch (error) {
      console.error("Error cargando órdenes:", error);
    }
  };

  useEffect(() => {
    fetchManos();
    fetchOrdenes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro de mano de obra?")) {
      await deleteMano(id);
      fetchManos();
    }
  };

  return (
    <div className="container mt-4">
      {/* CABECERA */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-uppercase fw-bold m-0" style={{ letterSpacing: '1px' }}>
          Registro de Mano de Obra
        </h2>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <i className="bi bi-wrench-adjustable"></i> AGREGAR SERVICIO
        </button>
      </div>

      {showForm && (
        <ManoForm
          editing={editing}
          ordenes={ordenes}
          onClose={() => {
            setShowForm(false);
            fetchManos();
          }}
        />
      )}

      {/* TABLA INDUSTRIAL */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-dark text-uppercase" style={{ fontSize: '0.75rem' }}>
            <tr>
              <th className="px-3" style={{ width: '80px' }}>ID</th>
              <th>Descripción del Servicio</th>
              <th>Costo de Labor</th>
              <th>Orden Asociada</th>
              <th className="text-center" style={{ width: '150px' }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {manos.length > 0 ? (
              manos.map((m) => (
                <tr key={m.id_mano}>
                  <td className="px-3 fw-bold text-muted small">#{m.id_mano}</td>
                  <td className="fw-semibold">
                    <i className="bi bi-gear-fill me-2 text-secondary"></i>
                    {m.descripcion}
                  </td>
                  <td className="fw-bold text-dark">
                    ${Number(m.costo).toLocaleString('es-CO')}
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      <i className="bi bi-clipboard-check me-1"></i>
                      ORDEN #
                      {ordenes.find((o) => o.id_ordenes === m.id_ordenes)?.id_ordenes || m.id_ordenes}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-3">
                      {/* ICONO EDITAR */}
                      <button
                        className="btn-icon text-secondary"
                        title="Editar Servicio"
                        onClick={() => {
                          setEditing(m);
                          setShowForm(true);
                        }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>

                      {/* ICONO ELIMINAR */}
                      <button
                        className="btn-icon text-danger"
                        title="Eliminar Servicio"
                        onClick={() => handleDelete(m.id_mano)}
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
                  No se han registrado servicios de mano de obra.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}