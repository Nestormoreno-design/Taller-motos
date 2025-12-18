import React, { useState, useEffect } from "react";
import { createEmpleado, updateEmpleado } from "../../services/empleadoService";

export default function EmpleadoForm({ editing, onClose }) {
  const [form, setForm] = useState({ nombre: "", rol: "", usuario: "", password: "" });

  useEffect(() => {
    if(editing) setForm({ ...editing, password: "" }); // No mostrar la contraseña
  }, [editing]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const data = { ...form };
    if (!data.password) delete data.password; // no enviar password vacío
    if(editing) await updateEmpleado(editing.id_empleado, data);
    else await createEmpleado(data);
    onClose();
  };

  return (
    <div className="card p-3 mb-3">
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input className="form-control mb-2" name="rol" placeholder="Rol" value={form.rol} onChange={handleChange} required />
        <input className="form-control mb-2" name="usuario" placeholder="Usuario" value={form.usuario} onChange={handleChange} required />
        <input className="form-control mb-2" name="password" placeholder="Contraseña" type="password" value={form.password} onChange={handleChange} />
        <small className="text-muted mb-2 d-block">Dejar vacío si no quieres cambiar la contraseña al editar</small>
        <button className="btn btn-success me-2" type="submit">{editing ? "Actualizar" : "Crear"}</button>
        <button className="btn btn-secondary" type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
}
