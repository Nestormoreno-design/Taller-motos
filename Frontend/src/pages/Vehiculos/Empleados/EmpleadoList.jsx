import React, { useEffect, useState } from "react";
import { getEmpleados, deleteEmpleado } from "../../services/empleadoService";
import EmpleadoForm from "./EmpleadoForm";

export default function EmpleadoList() {
  const [empleados, setEmpleados] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchEmpleados = async () => {
    const res = await getEmpleados();
    setEmpleados(res.data);
  };

  useEffect(() => { fetchEmpleados(); }, []);

  const handleDelete = async (id) => {
    if(window.confirm("¿Eliminar empleado?")) {
      await deleteEmpleado(id);
      fetchEmpleados();
    }
  };

  return (
    <div className="container mt-4">
      <h2>Empleados</h2>
      <button className="btn btn-primary mb-2" onClick={() => { setEditing(null); setShowForm(true); }}>Agregar Empleado</button>
      {showForm && <EmpleadoForm editing={editing} onClose={() => { setShowForm(false); fetchEmpleados(); }} />}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nombre</th><th>Rol</th><th>Usuario</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map(e => (
            <tr key={e.id_empleado}>
              <td>{e.nombre}</td>
              <td>{e.rol}</td>
              <td>{e.usuario}</td>
              <td>
                <button className="btn btn-warning btn-sm me-1" onClick={() => { setEditing(e); setShowForm(true); }}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id_empleado)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
