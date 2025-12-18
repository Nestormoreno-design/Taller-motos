import React, { useEffect, useState, useMemo, useCallback } from "react";
// Importa la función de eliminación (DEBES ASEGURARTE DE QUE ESTA FUNCIÓN EXISTA EN TU ARCHIVO DE SERVICIO)
import { getFacturas, descargarFacturaURL, createFactura, deleteFactura } from "../../services/facturaService"; 
import FacturaForm from "./FacturaForm";
import { getClientes } from "../../services/clienteService";
import { getEmpleados } from "../../services/empleadoService";
import Swal from 'sweetalert2';

export default function FacturaList() {
    // ... (El resto de tus estados y useMemo)

    const [facturas, setFacturas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Diccionario para búsqueda rápida de nombres de clientes
    const clientesMap = useMemo(() => {
        const map = {};
        clientes.forEach(c => { map[c.id_cliente] = c.nombre; });
        return map;
    }, [clientes]);

    // Función de carga de datos (Petición al servidor)
    const fetchFacturas = useCallback(async () => {
        setLoading(true);
        try {
            // El backend recibe la página actual y el término de búsqueda
            const res = await getFacturas(page, 10, searchTerm); 
            setFacturas(res.data.data || []); 
            setTotalPages(res.data.total_pages || 1);
        } catch (error) {
            console.error("Error cargando facturas", error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    // ... (Los useEffects para data inicial y debounce se mantienen igual)

    // Carga inicial de Clientes y Empleados
    useEffect(() => {
        const fetchDataInicial = async () => {
          try {
            const [resC, resE] = await Promise.all([getClientes(), getEmpleados()]);
            setClientes(resC.data || []);
            setEmpleados(resE.data || []);
          } catch (error) {
            console.error("Error en data inicial", error);
          }
        };
        fetchDataInicial();
      }, []);

    // Debounce para no saturar el servidor mientras el usuario escribe
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
          fetchFacturas();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchFacturas]);

    const handleFinalizeInvoice = async (payload) => {
        try {
            setLoading(true);
            await createFactura(payload);
            Swal.fire("Éxito", "Factura procesada con éxito", "success");
            setShowForm(false);
            fetchFacturas();
        } catch (error) {
            Swal.fire("Error", "No se pudo generar la factura", "error");
        } finally {
            setLoading(false);
        }
    };
    
    // Nueva función para manejar la eliminación de la factura
    const handleDeleteFactura = async (idFactura) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Vas a eliminar la factura #${idFactura}. ¡Esta acción es irreversible!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                // Llama a la función de servicio de eliminación
                await deleteFactura(idFactura); 
                Swal.fire(
                    'Eliminada!',
                    `La factura #${idFactura} ha sido eliminada.`,
                    'success'
                );
                // Refresca la lista de facturas
                fetchFacturas();
            } catch (error) {
                console.error("Error eliminando factura:", error);
                Swal.fire(
                    'Error',
                    `No se pudo eliminar la factura #${idFactura}.`,
                    'error'
                );
            } finally {
                setLoading(false);
            }
        }
    };

    // Función para cambiar de página
    const paginate = (numeroPagina) => {
        setPage(numeroPagina);
    };

    return (
        <div className="container mt-4 mb-5">
            {/* ... (Todo el código anterior del encabezado y buscador) */}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-uppercase fw-bold m-0" style={{ letterSpacing: '1px' }}>
                    Historial de Facturas
                </h2>
                <button className="btn btn-primary shadow-sm" onClick={() => setShowForm(true)}>
                    <i className="bi bi-plus-lg me-2"></i>NUEVA FACTURA
                </button>
            </div>

            {/* Buscador */}
            <div className="mb-4">
                <div className="input-group shadow-sm" style={{ maxWidth: '450px' }}>
                    <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Buscar por cliente o factura..."
                        value={searchTerm}
                        onChange={(e) => { 
                            setSearchTerm(e.target.value); 
                            setPage(1); // Resetear a página 1 al buscar
                        }}
                    />
                </div>
            </div>

            {showForm && (
                <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">GENERAR NUEVO COBRO</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
                            </div>
                            <div className="modal-body p-0">
                                <FacturaForm 
                                    idCliente={null} 
                                    idEmpleado={1}
                                    totalPadre={0}
                                    onClose={() => setShowForm(false)}
                                    customSubmit={handleFinalizeInvoice}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark text-uppercase small">
                            <tr>
                                <th className="ps-3">ID</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? "opacity-50" : ""}>
                            {facturas.length > 0 ? (
                                facturas.map(f => (
                                    <tr key={f.id_factura}>
                                        <td className="ps-3 fw-bold text-muted">#{f.id_factura}</td>
                                        <td>{new Date(f.fecha).toLocaleDateString()}</td>
                                        <td>{clientesMap[f.id_cliente] || "No identificado"}</td>
                                        <td className="fw-bold text-success">
                                            ${Number(f.total).toLocaleString('es-CO')}
                                        </td>
                                        <td className="text-center d-flex justify-content-center gap-2"> {/* Agregado d-flex y gap-2 para separar botones */}
                                            {/* Botón de Descargar PDF (existente) */}
                                            <button 
                                                className="btn btn-sm btn-outline-primary" 
                                                onClick={() => window.open(descargarFacturaURL(f.id_factura), "_blank")}
                                                title="Descargar PDF"
                                            >
                                                <i className="bi bi-file-earmark-pdf-fill"></i> PDF
                                            </button>
                                            
                                            {/* Botón de Eliminar (NUEVO) */}
                                            <button 
                                                className="btn btn-sm btn-outline-danger" 
                                                onClick={() => handleDeleteFactura(f.id_factura)}
                                                title="Eliminar Factura"
                                            >
                                                <i className="bi bi-trash-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        {loading ? "Cargando datos..." : "No se encontraron facturas."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINADOR CORREGIDO (se mantiene igual) */}
                {totalPages > 1 && (
                    <div className="card-footer bg-white border-top py-3">
                        <nav>
                            <ul className="pagination pagination-sm justify-content-center mb-0">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => paginate(page - 1)}>
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                </li>
                                
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(i + 1)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}

                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => paginate(page + 1)}>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
}