import React, { useState, useEffect } from "react";
import { createCliente, updateCliente } from "../../services/clienteService";

export default function ClienteForm({ editing, onClose }) {
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "", direccion: "" });

  useEffect(() => {
    if(editing) setForm(editing);
  }, [editing]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if(editing) await updateCliente(editing.id_cliente, form);
    else await createCliente(form);
    onClose();
  };

  return (
    <div className="card p-3 mb-3">
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input className="form-control mb-2" name="telefono" placeholder="Teléfono ej:(+573216549870)" value={form.telefono} onChange={handleChange} />
        <input className="form-control mb-2" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input className="form-control mb-2" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} />
        <button className="btn btn-success me-2" type="submit">{editing ? "Actualizar" : "Crear"}</button>
        <button className="btn btn-secondary" type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
}
