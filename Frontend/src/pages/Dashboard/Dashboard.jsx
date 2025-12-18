import React, { useEffect, useState } from "react";
import { getFacturas } from "../../services/facturaService";
import { getOrdenes } from "../../services/ordenService";
import { getVehiculos } from "../../services/vehiculoService";

// IMPORTACIONES PARA GRÁFICAS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registro de componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVentas: 0,
    ordenesActivas: 0,
    totalVehiculos: 0,
    facturasCount: 0
  });

  const [chartData, setChartData] = useState({
    ventas: { labels: [], datasets: [] },
    estados: { labels: [], datasets: [] }
  });

  const fetchStats = async () => {
    try {
      const resF = await getFacturas();
      const resO = await getOrdenes();
      const resV = await getVehiculos();

      const facturasArray = resF.data.data || resF.data || [];
      const ordenesArray = resO.data || [];
      const vehiculosArray = resV.data || [];

      const totalSuma = facturasArray.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

      const labelsVentas = facturasArray.slice(-5).map(f => `Fac #${f.id_factura}`);
      const dataVentas = facturasArray.slice(-5).map(f => f.total);

      const estadosCount = {
        Pendiente: ordenesArray.filter(o => o.estado.toLowerCase() === 'pendiente').length,
        Proceso: ordenesArray.filter(o => ['proceso', 'reparacion', 'diagnostico'].includes(o.estado.toLowerCase())).length,
        Finalizado: ordenesArray.filter(o => o.estado.toLowerCase() === 'finalizado').length,
      };

      setStats({
        totalVentas: totalSuma,
        ordenesActivas: ordenesArray.filter(o => o.estado.toLowerCase() !== 'finalizado').length,
        totalVehiculos: vehiculosArray.length,
        facturasCount: facturasArray.length
      });

      setChartData({
        ventas: {
          labels: labelsVentas,
          datasets: [{
            label: 'Monto ($)',
            data: dataVentas,
            backgroundColor: 'rgba(13, 110, 253, 0.8)',
            borderColor: '#0d6efd',
            borderWidth: 1,
          }]
        },
        estados: {
          labels: ['Pendiente', 'En Proceso', 'Finalizado'],
          datasets: [{
            data: [estadosCount.Pendiente, estadosCount.Proceso, estadosCount.Finalizado],
            backgroundColor: ['#6c757d', '#ffc107', '#198754'],
            hoverOffset: 4
          }]
        }
      });

    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="container mt-4 mb-5">
      <h2 className="text-uppercase fw-bold mb-4" style={{ letterSpacing: '1px', color: '#2d3436' }}>
        <i className="bi bi-speedometer2 me-2 text-primary"></i>Panel de Control
      </h2>

      {/* TARJETAS SUPERIORES */}
      <div className="row g-4 mb-5">
        {/* Tarjeta 1: Ingresos (FONDO OSCURO) */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm bg-dark text-white p-3 h-100" style={{ borderLeft: '5px solid #198754' }}>
            <small className="text-uppercase fw-bold text-white-50">Ingresos Totales</small>
            <h3 className="fw-bold text-success mt-1 mb-0">${stats.totalVentas.toLocaleString()}</h3>
          </div>
        </div>

        {/* Tarjeta 2: Órdenes Activas */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #ffc107' }}>
            <small className="text-uppercase text-muted fw-bold">Órdenes Activas</small>
            <h3 className="fw-bold text-warning mt-1 mb-0">{stats.ordenesActivas}</h3>
          </div>
        </div>

        {/* Tarjeta 3: Vehículos */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #0d6efd' }}>
            <small className="text-uppercase text-muted fw-bold">Vehículos</small>
            <h3 className="fw-bold text-primary mt-1 mb-0">{stats.totalVehiculos}</h3>
          </div>
        </div>

        {/* Tarjeta 4: Ventas */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 h-100" style={{ borderLeft: '5px solid #0dcafy' }}>
            <small className="text-uppercase text-muted fw-bold">Ventas Realizadas</small>
            <h3 className="fw-bold text-info mt-1 mb-0">{stats.facturasCount}</h3>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICAS */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5 className="fw-bold text-uppercase small mb-4 text-secondary">Tendencia de Últimas Ventas</h5>
            <div style={{ height: '300px' }}>
              <Bar 
                data={chartData.ventas} 
                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5 className="fw-bold text-uppercase small mb-4 text-secondary">Estado del Taller</h5>
            <div style={{ height: '300px' }} className="d-flex align-items-center">
              <Doughnut 
                data={chartData.estados} 
                options={{ maintainAspectRatio: false }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}