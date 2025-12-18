import React, { useState, useEffect } from "react";
// 1. IMPORTAR REACT-SELECT
import Select from 'react-select'; 
import { createVehiculo, updateVehiculo } from "../../services/vehiculoService";

export default function VehiculoForm({ editing, clientes, onClose }) {
  const [form, setForm] = useState({ marca: "", modelo: "", anio: "", placa: "", kilometraje: "", id_cliente: "" });

  useEffect(() => {
    if(editing) setForm(editing);
  }, [editing]);

  // Se modifica handleChange para convertir 'placa' a mayúsculas
  const handleChange = e => {
    let { name, value } = e.target; // Usamos 'let' para poder modificar 'value'

    // LÓGICA DE CONVERSIÓN A MAYÚSCULAS para el campo 'placa'
    if (name === "placa") {
        value = value.toUpperCase();
    }
    
    setForm({ ...form, [name]: value });
  };

  // 2. FUNCIÓN DE MANEJO DE CAMBIO PARA REACT-SELECT
  const handleClienteChange = (selectedOption) => {
    // selectedOption es { value: id_cliente, label: nombre }
    
    // Llamamos a la función handleChange original, simulando el objeto e.target
    // Nota: Aquí se usa 'e.target' simulado, no hay placa que convertir.
    handleChange({ 
        target: { 
            name: 'id_cliente', 
            // Usamos el 'value' del objeto seleccionado (o cadena vacía si se limpia)
            value: selectedOption ? selectedOption.value : '' 
        } 
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if(editing) await updateVehiculo(editing.id_vehiculo, form);
    else await createVehiculo(form);
    onClose();
  };

  // 3. TRANSFORMAR LOS DATOS DE CLIENTES
  const opcionesClientes = clientes.map(c => ({
    value: c.id_cliente,
    label: c.nombre,
  }));

  // 4. Determinar la opción seleccionada actualmente (para el modo Edición)
  const valorSeleccionado = opcionesClientes.find(option => option.value === form.id_cliente) || null;

  return (
    <div className="card p-3 mb-3">
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="marca" placeholder="Marca" value={form.marca} onChange={handleChange} required />
        <input className="form-control mb-2" name="modelo" placeholder="Modelo" value={form.modelo} onChange={handleChange} required />
        <input className="form-control mb-2" name="anio" placeholder="Año" type="number" value={form.anio} onChange={handleChange} required />
        
        {/* Campo Placa: Ahora usa la función handleChange modificada */}
        <input 
            className="form-control mb-2" 
            name="placa" 
            placeholder="Placa" 
            value={form.placa} 
            onChange={handleChange} 
            required 
            // Opcional: Agregar style para que el usuario vea inmediatamente el cambio
            style={{ textTransform: 'uppercase' }} 
        />
        
        <input className="form-control mb-2" name="kilometraje" placeholder="Kilometraje" type="number" value={form.kilometraje} onChange={handleChange} required />

        {/* 5. SELECTOR DE CLIENTE (REACT-SELECT) */}
        <div className="mb-2">
            <Select
                options={opcionesClientes}
                value={valorSeleccionado}
                onChange={handleClienteChange}
                placeholder="Buscar o Seleccionar Cliente"
                isClearable={true} 
                isSearchable={true}
            />
            <input type="hidden" name="id_cliente" value={form.id_cliente || ''} required /> 
        </div>
        
        <button className="btn btn-success me-2" type="submit">{editing ? "Actualizar" : "Crear"}</button>
        <button className="btn btn-secondary" type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
}