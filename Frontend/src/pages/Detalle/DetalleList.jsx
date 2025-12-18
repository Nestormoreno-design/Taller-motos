import React, { useEffect, useState } from "react";
import { getDetalles, deleteDetalle } from "../../services/detalleService";
import DetalleForm from "./DetalleForm";
import { getVehiculos } from "../../services/vehiculoService";
import { getInventario } from "../../services/inventarioService";
import { getMano } from "../../services/manoService";

export default function DetalleList() {
  const [detalles, setDetalles] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [mano, setMano] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchDetalles = async () => setDetalles((await getDetalles()).data);
  const fetchVehiculos = async () => setVehiculos((await getVehiculos()).data);
  const fetchInventario = async () => setInventario((await getInventario()).data);
  const fetchMano = async () => setMano((await getMano()).data);

  useEffect(() => {
    fetchDetalles(); fetchVehiculos(); fetchInventario(); fetchMano();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm("¿Eliminar detalle?")) {
      await deleteDetalle(id);
      fetchDetalles();
    }
  };

  return (
    <div className="container mt-4">
      <h2>Detalle de Facturas</h2>
      <button className="btn btn-primary mb-2" onClick={() => { setEditing(null); setShowForm(true); }}>Agregar Detalle</button>
      {showForm && <DetalleForm 
        editing={editing} 
        vehiculos={vehiculos} 
        inventario={inventario} 
        mano={mano} 
        onClose={() => { setShowForm(false); fetchDetalles(); }} 
      />}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Vehículo</th><th>Producto</th><th>Mano de Obra</th><th>Subtotal</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map(d => (
            <tr key={d.id_detalle}>
              <td>{vehiculos.find(v => v.id_vehiculo === d.id_vehiculo)?.placa || d.id_vehiculo}</td>
              <td>{inventario.find(i => i.id === d.id_inventario)?.nombre || d.id_inventario}</td>
              <td>{mano.find(m => m.id_mano === d.id_mano)?.descripcion || d.id_mano}</td>
              <td>{d.subtotal}</td>
              <td>
                <button className="btn btn-warning btn-sm me-1" onClick={() => { setEditing(d); setShowForm(true); }}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id_detalle)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
