import React, { useState, useEffect } from "react";
import ManoForm from "../Mano/ManoForm";
import { getInventario } from "../../services/inventarioService";
import { createFactura } from "../../services/facturaService"; 
import Swal from 'sweetalert2';
import axios from 'axios'; // Importante para la llamada directa

export default function FacturaCompletaForm({ orden, onClose }) {
  // ... (Estados iniciales iguales) ...
  const [inventario, setInventario] = useState([]);
  const [manosTemporales, setManosTemporales] = useState([]);
  const [productosTemporales, setProductosTemporales] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showManoForm, setShowManoForm] = useState(false);
  const [productoSel, setProductoSel] = useState("");
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const resI = await getInventario(1, 200);
        setInventario(resI?.data?.data || []);
      } catch (error) {
        console.error("Error cargando inventario:", error);
      } finally {
        setLoading(false);
      }
    };
    if (orden) cargarInventario();
  }, [orden]);

  // ... (Funciones add y eliminar iguales) ...
  const addManoObra = (nuevaMano) => {
    const costoNum = parseFloat(nuevaMano.costo || 0);
    setManosTemporales([...manosTemporales, { ...nuevaMano, costo: costoNum }]);
    setTotal(prev => prev + costoNum);
    setShowManoForm(false);
  };

  const addProducto = () => {
    const item = inventario.find(i => i.id_inventario == productoSel);
    if (!item) return;
    const sub = parseFloat(item.precio_venta) * parseInt(cantidad);
    setProductosTemporales([...productosTemporales, { ...item, cant: cantidad, sub }]);
    setTotal(prev => prev + sub);
    setProductoSel(""); 
    setCantidad(1);
  };

  const eliminarMano = (index) => {
    const itemAEliminar = manosTemporales[index];
    setTotal(prev => prev - itemAEliminar.costo);
    setManosTemporales(manosTemporales.filter((_, i) => i !== index));
  };

  const eliminarProducto = (index) => {
    const itemAEliminar = productosTemporales[index];
    setTotal(prev => prev - itemAEliminar.sub);
    setProductosTemporales(productosTemporales.filter((_, i) => i !== index));
  };

  const finalizarCobro = async () => {
    if (total <= 0) {
      return Swal.fire("Atención", "Debe agregar al menos un servicio o repuesto.", "warning");
    }

    const payload = {
      id_cliente: orden.id_cliente, 
      id_empleado: orden.id_empleado || 1, 
      fecha: new Date().toISOString().split('T')[0],
      total: total,
      detalles: [
        ...manosTemporales.map(m => ({
          id_mano: m.id_mano || null, 
          id_inventario: null,
          id_vehiculo: orden.id_vehiculo, 
          subtotal: parseFloat(m.costo)
        })),
        ...productosTemporales.map(p => ({
          id_mano: null,
          id_inventario: p.id_inventario, 
          id_vehiculo: orden.id_vehiculo, 
          subtotal: parseFloat(p.sub)
        }))
      ]
    };

    try {
      Swal.fire({
        title: 'Procesando...',
        text: 'Guardando factura y generando archivo PDF',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // 1. Guardar en Base de Datos (Tu lógica original)
      const res = await createFactura(payload);
      const idFactura = res.data.id_factura;

      // 2. NUEVA ACCIÓN: Guardar el archivo PDF en la carpeta del servidor
      // Llamamos a la nueva ruta que no envía correos
      await axios.post(
        `http://localhost:5000/api/factura/${idFactura}/generar-archivo`, 
        {}, 
        { withCredentials: true }
      );
      
      Swal.fire("¡Éxito!", "La factura ha sido generada y el archivo guardado.", "success");
      if (onClose) onClose();
    } catch (e) {
      console.error("Error en finalizarCobro:", e);
      Swal.fire("Error", "No se pudo completar el proceso de facturación.", "error");
    }
  };

  if (loading) return <div className="p-4 text-center">Cargando datos...</div>;

  return (
    // ... (El JSX se mantiene exactamente igual a tu original) ...
    <div className="container-fluid p-0 border rounded shadow-sm bg-white overflow-hidden">
        <div className="row g-0">
          <div className="col-md-5 p-4 bg-light border-end">
            <label className="small fw-bold text-muted text-uppercase">Propietario</label>
            <div className="h4 fw-bold text-dark">{orden.nombre_cliente || "Desconocido"}</div>
            <div className="badge bg-primary fs-6 mb-4">Placa: {orden.placa}</div>
            <div className="card p-3 border-0 shadow-sm mb-3">
              <h6 className="fw-bold small mb-3 text-uppercase text-secondary">Servicios</h6>
              <button className={`btn btn-sm ${showManoForm ? 'btn-danger' : 'btn-outline-primary'} w-100 mb-3 fw-bold`} onClick={() => setShowManoForm(!showManoForm)}>
                {showManoForm ? "✕ Cancelar" : "+ Añadir Mano de Obra"}
              </button>
              {showManoForm && (
                <div className="mb-3 p-2 border rounded bg-white shadow-sm">
                  <ManoForm orden={orden} afterSave={addManoObra} onClose={() => setShowManoForm(false)} />
                </div>
              )}
              <hr />
              <h6 className="fw-bold small mb-2 text-uppercase text-secondary">Repuestos / Inventario</h6>
              <div className="input-group input-group-sm mb-2">
                <select className="form-select" value={productoSel} onChange={e => setProductoSel(e.target.value)}>
                  <option value="">Seleccionar ítem...</option>
                  {inventario.map(i => (
                    <option key={i.id_inventario} value={i.id_inventario}>{i.nombre} (${parseFloat(i.precio_venta).toLocaleString()})</option>
                  ))}
                </select>
                <input type="number" className="form-control" style={{maxWidth: '65px'}} value={cantidad} min="1" onChange={e => setCantidad(e.target.value)} />
                <button className="btn btn-dark" onClick={addProducto} disabled={!productoSel}>+</button>
              </div>
            </div>
          </div>
          <div className="col-md-7 d-flex flex-column bg-white">
            <div className="p-3 border-bottom bg-white fw-bold small text-muted text-uppercase">Detalle de la Factura</div>
            <div className="flex-grow-1 p-0 overflow-auto" style={{minHeight: '350px'}}>
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3 py-2">Concepto</th>
                    <th className="text-end pe-3">Subtotal</th>
                    <th style={{width: '40px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {manosTemporales.map((m, i) => (
                    <tr key={`m-${i}`}>
                      <td className="ps-3 py-2 small text-truncate" style={{maxWidth: '200px'}}>🔧 {m.descripcion}</td>
                      <td className="text-end pe-3 fw-bold">${m.costo.toLocaleString()}</td>
                      <td><button className="btn btn-sm text-danger" onClick={() => eliminarMano(i)}>✕</button></td>
                    </tr>
                  ))}
                  {productosTemporales.map((p, i) => (
                    <tr key={`p-${i}`}>
                      <td className="ps-3 py-2 small text-truncate" style={{maxWidth: '200px'}}>📦 {p.nombre} (x{p.cant})</td>
                      <td className="text-end pe-3 fw-bold">${p.sub.toLocaleString()}</td>
                      <td><button className="btn btn-sm text-danger" onClick={() => eliminarProducto(i)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-dark text-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="h6 opacity-75 mb-0">TOTAL A COBRAR:</span>
                <span className="h2 fw-bold text-success mb-0">${total.toLocaleString()}</span>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-light w-50" type="button" onClick={onClose}>Cancelar</button>
                <button className="btn btn-success btn-lg w-50 fw-bold shadow" onClick={finalizarCobro} disabled={total <= 0}>GENERAR FACTURA</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}