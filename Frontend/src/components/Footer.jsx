import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer mt-auto py-3 bg-white border-top shadow-sm">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            &copy; {year} <strong>MotoGestion</strong> - Sistema de Administración de Taller.
          </span>
          <div>
            <span className="badge bg-light text-dark border me-2">Versión 1.0.0</span>
            <span className="text-muted small">
              <i className="bi bi-clock-history me-1"></i> Soporte: +57 318 856 2966
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}