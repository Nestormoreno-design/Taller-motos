import React, { useState, useEffect } from "react";
// 1. Importar REACT-SELECT
import Select from 'react-select'; 
import { createDetalle, updateDetalle } from "../../services/detalleService";

export default function DetalleForm({ editing, facturaId, vehiculos, inventario, mano, afterSave, onClose }) {
  const [form, setForm] = useState({
    id_vehiculo: vehiculos?.[0]?.id_vehiculo || "",
    id_inventario: "",
    id_mano: "",
    subtotal: 0, 
    id_factura: facturaId || ""
  });

  useEffect(() => {
    if (editing) setForm(editing);
  }, [editing]);

  // Función principal para manejar cambios en inputs nativos (vehículo, mano de obra, etc.)
  const handleChange = e => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };

    // Lógica para calcular el subtotal automáticamente (Ahora maneja tanto nativo como adaptado)
    if (name === "id_inventario" && value !== "") {
      const item = inventario.find(i => String(i.id_inventario) === String(value));
      if (item) newForm.subtotal = parseFloat(item.precio_venta);
      newForm.id_mano = ""; // Resetear mano de obra si elige producto
    } 
    
    if (name === "id_mano" && value !== "") {
      const item = mano.find(m => String(m.id_mano) === String(value));
      if (item) newForm.subtotal = parseFloat(item.costo);
      newForm.id_inventario = ""; // Resetear producto si elige mano de obra
    }

    setForm(newForm);
  };
  
  // 2. FUNCIÓN ADAPTADORA para el selector de INVENTARIO (react-select)
  const handleInventarioChange = (selectedOption) => {
    // Simulamos el evento para que la función handleChange original maneje la lógica de subtotal y exclusión
    handleChange({ 
        target: { 
            name: 'id_inventario', 
            value: selectedOption ? selectedOption.value : '' 
        } 
    });
  };


  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validación: Debe haber o producto o mano de obra, pero no vacío
    if (!form.id_inventario && !form.id_mano) {
      alert("Seleccione un producto o un servicio de mano de obra");
      return;
    }

    try {
      let res;
      // Limpiamos los strings vacíos a null para que la DB los acepte correctamente
      const payload = {
        ...form,
        id_inventario: form.id_inventario || null,
        id_mano: form.id_mano || null,
        subtotal: parseFloat(form.subtotal)
      };

      if (editing) {
        res = await updateDetalle(editing.id_detalle, payload);
        afterSave && afterSave({ ...payload, id_detalle: editing.id_detalle });
      } else {
        res = await createDetalle(payload);
        afterSave && afterSave({ ...payload, id_detalle: res.data.id_detalle });
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar detalle:", error);
      alert("Error al guardar: revise que el backend soporte los campos enviados.");
    }
  };
  
  // 3. TRANSFORMACIÓN DE DATOS SOLO PARA INVENTARIO
  const opcionesInventario = (inventario || []).map(i => ({
    value: i.id_inventario,
    // Mostrar nombre, precio de venta y stock para facilitar la búsqueda
    label: `${i.nombre} - $${parseFloat(i.precio_venta).toLocaleString()} (Stock: ${i.stock || 0})`, 
  }));
  
  // 4. Determinar el valor seleccionado del Inventario (para Edición)
  const valorInventarioSeleccionado = opcionesInventario.find(option => String(option.value) === String(form.id_inventario)) || null;

  // Variable para deshabilitar el Inventario si hay Mano de Obra (se mantiene la lógica)
  const isInventarioDisabled = !!form.id_mano;
  
  return (
    <div className="card p-3 mb-3 shadow-sm">
      <h6 className="fw-bold mb-3">{editing ? "Editar Item" : "Nuevo Item de Factura"}</h6>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="id_factura" value={form.id_factura} />

        {/* SELECTOR DE VEHÍCULO (Mantenido como <select> nativo) */}
        <label className="small fw-bold">Vehículo (Placa)</label>
        <select className="form-control mb-2" name="id_vehiculo" value={form.id_vehiculo} onChange={handleChange} required>
          <option value="">Seleccionar Vehículo</option>
          {vehiculos.map(v => <option key={v.id_vehiculo} value={v.id_vehiculo}>{v.placa}</option>)}
        </select>

        {/* 5. SELECTOR DE INVENTARIO (Reemplazado por Select Searchable) */}
        <label className="small fw-bold">Repuesto / Producto</label>
        <div className="mb-2">
            <Select
                options={opcionesInventario}
                value={valorInventarioSeleccionado}
                onChange={handleInventarioChange}
                placeholder="Buscar Producto (Nombre / Precio / Stock)"
                isClearable={true}
                isSearchable={true}
                isDisabled={isInventarioDisabled} // Mantiene la lógica de deshabilitar si hay Mano de Obra
            />
            <input type="hidden" name="id_inventario" value={form.id_inventario || ''} />
        </div>


        {/* SELECTOR DE MANO DE OBRA (Mantenido como <select> nativo) */}
        <label className="small fw-bold">Mano de Obra / Servicio</label>
        <select className="form-control mb-2" name="id_mano" value={form.id_mano} onChange={handleChange} disabled={!!form.id_inventario}>
          <option value="">Seleccionar Servicio (Opcional)</option>
          {mano.map(m => (
            <option key={m.id_mano} value={m.id_mano}>
              {m.descripcion} - ${parseFloat(m.costo).toLocaleString()}
            </option>
          ))}
        </select>

        <div className="alert alert-secondary py-2 mt-2">
          <strong>Subtotal a cobrar: </strong> ${parseFloat(form.subtotal).toLocaleString()}
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-secondary me-2" type="button" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" type="submit">{editing ? "Actualizar" : "Agregar a Factura"}</button>
        </div>
      </form>
    </div>
  );
}