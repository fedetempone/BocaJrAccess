import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Key, User, ShieldCheck } from "@phosphor-icons/react";
import '../styles/logingate.css';

const LoginGate = ({ children }) => {
  const { user, login } = useAdmin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError(false);

    const userClean = username.toLowerCase().trim();
    
    // Ejecutamos el login
    const isOk = login(userClean, password);
    
    if (isOk) {
      // Si es true, no hacemos nada, el useEffect/render detectará al 'user' y pasará
      console.log("Acceso concedido");
    } else {
      // Si es false, mostramos el error
      setError(true);
      alert("❌ Credenciales incorrectas. Verificá Usuario y PIN.");
    }
  };

  if (user) return <>{children}</>;

  return (
    <div className="loginFullContainer">
      <div className="glass-card loginBox animateIn">
        <div className="loginHeader">
          <div className="iconCircle">
            <ShieldCheck size={48} color="var(--amarillo-boca)" weight="fill" />
          </div>
          <h2 className="titulo-pro">BOCA JR ACCESS</h2>
          <p>CONTROL DE INGRESO VEHICULAR</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="loginForm">
          <div className={`loginField ${error ? 'field-error' : ''}`}>
            <User size={20} className="loginIcon" />
            <input 
              type="text" 
              className="boca-input" 
              placeholder="USUARIO" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={`loginField ${error ? 'field-error' : ''}`}>
            <Key size={20} className="loginIcon" />
            <input 
              type="password" 
              className="boca-input" 
              placeholder="PIN DE ACCESO" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary loginSubmitBtn">
            INGRESAR AL SISTEMA
          </button>
        </form>

        <div className="loginFooter">
          <span>build by FedeTempone 🔥</span>
        </div>
      </div>
    </div>
  );
};

export default LoginGate;