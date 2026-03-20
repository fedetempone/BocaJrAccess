import { Star, SignOut, UserCircle } from "@phosphor-icons/react";
import { useAdmin } from '../context/AdminContext';
import '../styles/header.css';

const Header = () => {
  const { user, logout } = useAdmin();

  return (
    <header className="header-boca">
      {/* Estrellas Amarillas Clásicas */}
      <div className="star-divider">
        <Star size={18} weight="fill" />
        <Star size={22} weight="fill" />
        <Star size={26} weight="fill" />
        <Star size={22} weight="fill" />
        <Star size={18} weight="fill" />
      </div>

      <h1 className="header-title">
        BOCA <span className="text-yellow">JR</span> ACCESS
      </h1>

      <div className="sub-header">
        <span className="sub-text">GESTIÓN DE ACCESOS</span>
        <div className="linea-decorativa"></div>
      </div>

      {/* Barra de usuario: Forzada a la esquina superior derecha */}
      {user && (
        <div className="user-session-bar animateIn">
          <div className="user-info">
            <UserCircle size={20} weight="duotone" />
            <span className="user-name">{user.name}</span>
          </div>
          <button onClick={logout} className="logout-button">
            <SignOut size={16} weight="bold" />
            <span>SALIR</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;