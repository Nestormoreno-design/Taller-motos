import React, { useState, useEffect } from "react";
// 1. IMPORTAR REACT-SELECT
import Select from 'react-select'; 
import { createOrden, updateOrden } from "../../services/ordenService";

export default function OrdenForm({ editing, vehiculos, empleados, onClose }) {
  const [form, setForm] = useState({ 
    estado: "pendiente", 
    fecha_ingreso: "", 
    fecha_salida: "", 
    diagnostico: "", 
    id_vehiculo: "", 
    id_empleado: "" 
  });

  useEffect(() => {
    if (editing) setForm(editing);
  }, [editing]);

  // Se mantiene la función handleChange original para todos los inputs nativos y el estado
  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    // Si el cambio es el 'estado' y estamos editando, guardamos inmediatamente
    if (name === "estado" && editing) {
      try {
        await updateOrden(editing.id_ordenes, updatedForm);
      } catch (error) {
        console.error("Error al actualizar estado:", error);
      }
    }
  };
  
  // 2. FUNCIÓN DE MANEJO DE CAMBIO ADAPTADA para el selector de VEHÍCULO (react-select)
  const handleVehiculoChange = (selectedOption) => {
    // Simular el objeto e.target para usar el handleChange original
    handleChange({ 
        target: { 
            name: 'id_vehiculo', 
            value: selectedOption ? selectedOption.value : '' 
        } 
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (editing) await updateOrden(editing.id_ordenes, form);
    else await createOrden(form);
    onClose();
  };

  // 3. TRANSFORMACIÓN DE DATOS SOLO PARA VEHÍCULOS
  const opcionesVehiculos = vehiculos.map(v => ({
    value: v.id_vehiculo,
    // Mostrar placa, modelo y nombre del cliente para facilitar la búsqueda
    label: `${v.placa} - ${v.modelo} (${v.cliente_nombre || 'N/D'})`, 
  }));

  // 4. Determinar el valor seleccionado del Vehículo (para Edición)
  const valorVehiculoSeleccionado = opcionesVehiculos.find(option => option.value === form.id_vehiculo) || null;

  return (
    <div className="card p-3 mb-3 shadow-sm border-primary">
      <h5 className="fw-bold mb-3 text-primary">{editing ? "Editar Orden" : "Nueva Orden"}</h5>
      <form onSubmit={handleSubmit}>
        <label className="small fw-bold">Estado de la Orden:</label>
        <select 
          className="form-control mb-2 fw-bold text-uppercase" 
          name="estado" 
          value={form.estado} 
          onChange={handleChange} 
          required
        >
          <option value="pendiente">Pendiente</option>
          <option value="diagnostico">Diagnóstico</option>
          <option value="reparacion">Reparación</option>
          <option value="finalizado">Finalizado</option>
        </select>

        <div className="row">
          <div className="col-6">
            <label className="small">Fecha Ingreso</label>
            <input className="form-control mb-2" type="date" name="fecha_ingreso" value={form.fecha_ingreso} onChange={handleChange} required />
          </div>
          <div className="col-6">
            <label className="small">Fecha Salida</label>
            <input className="form-control mb-2" type="date" name="fecha_salida" value={form.fecha_salida} onChange={handleChange} />
          </div>
        </div>

        <input className="form-control mb-2" name="diagnostico" placeholder="Diagnóstico" value={form.diagnostico} onChange={handleChange} />

        {/* 5. SELECTOR DE VEHÍCULO (Reemplazado por Select Searchable) */}
        <div className="mb-2">
            <Select
                options={opcionesVehiculos}
                value={valorVehiculoSeleccionado}
                onChange={handleVehiculoChange}
                placeholder="Buscar o Seleccionar Vehículo (Placa / Modelo)"
                isClearable={true}
                isSearchable={true}
            />
             <input type="hidden" name="id_vehiculo" value={form.id_vehiculo || ''} required />
        </div>
        
        {/* 6. SELECTOR DE EMPLEADO (Mantenido como <select> nativo) */}
        <select className="form-control mb-2" name="id_empleado" value={form.id_empleado} onChange={handleChange} required>
          <option value="">Seleccionar Empleado</option>
          {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombre}</option>)}
        </select>

        <div className="d-flex gap-2 mt-2">
          <button className="btn btn-success flex-grow-1" type="submit">{editing ? "Actualizar Todo" : "Crear Orden"}</button>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}