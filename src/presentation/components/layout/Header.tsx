export function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <i className="fas fa-bolt" />
          <span>OptimLIA</span>
        </div>
        <span className="tagline">Optimizador de Publicaciones MercadoLibre</span>
      </div>
      <div className="header-right">
        <button className="btn-icon" title="Historial">
          <i className="fas fa-clock-rotate-left" />
        </button>
        <button className="btn-icon" title="Configuracion">
          <i className="fas fa-gear" />
        </button>
      </div>
    </header>
  );
}
