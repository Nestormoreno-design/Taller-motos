// components/Pagination.jsx
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      <span className="text-muted small uppercase">
        Página {currentPage} de {totalPages}
      </span>
      <div className="btn-group">
        <button 
          className="btn btn-secondary btn-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </button>
        
        <button 
          className="btn btn-primary btn-sm"
          style={{ cursor: 'default' }}
        >
          {currentPage}
        </button>

        <button 
          className="btn btn-secondary btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}