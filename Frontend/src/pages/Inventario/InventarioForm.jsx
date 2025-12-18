import React, { useState, useEffect } from "react";
import { createItem, updateItem } from "../../services/inventarioService";
import { getProveedores } from "../../services/proveedorService";

export default function InventarioForm({ editing, onClose }) {
  const [form, setForm] = useState({ nombre: "", codigo: "", precio_compra: "", precio_venta: "", stock: "", id_proveedores: "" });
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    const fetchProveedores = async () => {
      const res = await getProveedores();
      setProveedores(res.data);
    };
    fetchProveedores();

    if(editing) setForm(editing);
  }, [editing]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if(editing) await updateItem(editing.id_inventario, form);
    else await createItem(form);
    onClose();
  };

  return (
    <div className="card p-3 mb-3">
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input className="form-control mb-2" name="codigo" placeholder="Código" value={form.codigo} onChange={handleChange} />
        <input className="form-control mb-2" name="precio_compra" placeholder="Precio Compra" type="number" value={form.precio_compra} onChange={handleChange} />
        <input className="form-control mb-2" name="precio_venta" placeholder="Precio Venta" type="number" value={form.precio_venta} onChange={handleChange} />
        <input className="form-control mb-2" name="stock" placeholder="Stock" type="number" value={form.stock} onChange={handleChange} />
        
        <select className="form-control mb-2" name="id_proveedores" value={form.id_proveedores} onChange={handleChange} required>
          <option value="">Seleccionar proveedor</option>
          {proveedores.map(p => (
            <option key={p.id_proveedores} value={p.id_proveedores}>{p.nombre}</option>
          ))}
        </select>

        <button className="btn btn-success me-2" type="submit">{editing ? "Actualizar" : "Crear"}</button>
        <button className="btn btn-secondary" type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
}
