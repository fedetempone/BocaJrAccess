import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Clock, Trash, Tag } from "@phosphor-icons/react"; // Agregué Tag por si querés un icono de área
import '../styles/liveAttendance.css';

const LiveAttendance = () => {
  const { asistencia, deleteRegistroAsistencia, user } = useAdmin();

  // Tomamos solo los últimos 10 ingresos para mantener la interfaz limpia
  const ultimosIngresos = [...asistencia].slice(0, 10);

  if (asistencia.length === 0) return null;

  return (
    <div className="liveAttendanceContainer animateIn">
      <div className="liveHeader">
        <div className="liveIndicator"></div>
        <h3>INGRESOS RECIENTES ({asistencia.length})</h3>
      </div>

      <div className="liveList">
        {ultimosIngresos.map((reg) => (
          <div key={reg.id} className="liveItemCard">
            <div className="liveItemMain">
              <span className="livePlate">{reg.patente}</span>
              <div className="liveTextGroup">
                <span className="liveName">{reg.nombre}</span>
                {/* AGREGAMOS LA DESCRIPCIÓN AQUÍ */}
                {reg.descripcion && (
                  <span className="liveDescription">{reg.descripcion}</span>
                )}
              </div>
            </div>
            
            <div className="liveItemMeta">
              <span className={`liveVoucher badge-${reg.voucher}`}>
                {reg.voucher.toUpperCase()}
              </span>
              <span className="liveTime">
                <Clock size={14} /> 
                {new Date(reg.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              {user?.role === 'MASTER' && (
                <button 
                  className="liveDeleteBtn" 
                  onClick={() => window.confirm(`¿Anular ingreso de ${reg.patente}?`) && deleteRegistroAsistencia(reg.id)}
                  title="Anular ingreso"
                >
                  <Trash size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {user?.role === 'OPERARIO' && (
        <div className="readOnlyNotice">
          <small>Modo lectura: Solo el administrador puede anular registros.</small>
        </div>
      )}
    </div>
  );
};

export default LiveAttendance;