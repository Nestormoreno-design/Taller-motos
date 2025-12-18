import React, { useState } from "react";

export default function ManoForm({ orden, afterSave, onClose }) {
  const [form, setForm] = useState({
    descripcion: "",
    costo: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.descripcion || !form.costo) return alert("Por favor complete los campos");

    // Enviamos los datos al padre para que los añada al resumen visual
    afterSave({
      descripcion: form.descripcion,
      costo: parseFloat(form.costo) || 0,
      id_ordenes: orden?.id_orden || orden?.id_ordenes
    });
    
    setForm({ descripcion: "", costo: "" }); // Limpiar formulario
  };

  return (
    <div className="card p-3 mb-3 border-primary bg-light shadow-sm">
      <h6 className="fw-bold text-primary">Añadir Servicio</h6>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input
            className="form-control form-control-sm"
            name="descripcion"
            placeholder="Descripción (ej: Cambio de aceite)"
            value={form.descripcion}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-2">
          <input
            className="form-control form-control-sm"
            type="number"
            step="0.01"
            name="costo"
            placeholder="Costo $"
            value={form.costo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm w-100" type="submit">
            Agregar al Resumen
          </button>
          <button className="btn btn-secondary btn-sm" type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}