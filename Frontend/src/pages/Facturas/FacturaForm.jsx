import React from "react";

export default function FacturaForm({ 
  nombreCliente, 
  idCliente, 
  idEmpleado, 
  idVehiculo, 
  totalPadre, 
  manosTemporales = [], 
  productosTemporales = [], 
  customSubmit,
  onClose 
}) {

  // Construimos el envío solo cuando el usuario hace clic
  const manejarEnvio = () => {
    if (totalPadre <= 0) return alert("El total debe ser mayor a 0");

    const payload = {
      fecha: new Date().toISOString().split("T")[0],
      id_cliente: idCliente,
      id_empleado: idEmpleado,
      id_vehiculo: idVehiculo,
      total: totalPadre,
      nombre_cliente: nombreCliente,
      estado: "finalizado",
      detalles: [
        ...manosTemporales.map(m => ({
          id_mano: m.id_mano,
          id_inventario: null,
          subtotal: parseFloat(m.costo)
        })),
        
        ...productosTemporales.map(p => ({
          id_mano: null,
          id_inventario: p.id_inventario,
          subtotal: parseFloat(p.sub)
        }))
      ]
    };

    customSubmit(payload);
  };

  return (
    <div className="p-3 border rounded shadow-sm bg-light">
      <h6 className="text-muted small fw-bold mb-3 text-uppercase">Resumen de Facturación</h6>
      
      <div className="mb-3">
        <label className="small text-muted d-block">CLIENTE</label>
        <span className="fw-bold">{nombreCliente}</span>
      </div>

      <div className="bg-dark text-white p-3 rounded-3 mb-4 text-center">
        <div className="small opacity-75">TOTAL A COBRAR</div>
        <div className="display-6 fw-bold">${parseFloat(totalPadre).toLocaleString()}</div>
      </div>

      <div className="d-flex gap-2">
        <button type="button" className="btn btn-outline-secondary w-50" onClick={onClose}>
          CANCELAR
        </button>
        <button 
          className="btn btn-success btn-lg flex-grow-1 fw-bold shadow"
          onClick={manejarEnvio}
        >
          <i className="bi bi-cash-stack me-2"></i>
          COBRAR
        </button>
        
      </div>
    </div>
  );
}