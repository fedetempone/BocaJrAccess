import React, { useState } from 'react';
import { 
  Download, ShieldCheck, Trash, Eye, EyeSlash, 
  PencilSimple, Check, X, Car, SignOut, FileXls, Broom 
} from "@phosphor-icons/react";
import { useAdmin } from '../context/AdminContext';
import * as XLSX from 'xlsx';
import '../styles/masterPanel.css';

const MasterPanel = () => {
  // Extraemos las funciones del context (asegurándote de que limpiarAsistenciaHoy exista allí)
  const { 
    asistencia, 
    user, 
    logout, 
    deleteRegistroAsistencia, 
    updateRegistroAsistencia,
    limpiarAsistenciaHoy // <--- Esta es la función nueva que debe estar en el Context
  } = useAdmin();

  const [isReviewMode, setIsReviewMode] = useState(false);
  
  // Estados para la edición in-situ
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', patente: '', voucher: '' });

  if (!user || user.role !== 'MASTER') return null;

  // FUNCIÓN PARA EXPORTAR A EXCEL
  const handleFinalExport = () => {
    if (asistencia.length === 0) return alert("No hay datos para exportar.");
    const dataSheet = asistencia.map(reg => ({
      "FECHA": new Date(reg.fechaHora).toLocaleDateString(),
      "HORA": new Date(reg.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      "PATENTE": reg.patente,
      "NOMBRE": reg.nombre,
      "VOUCHER": reg.voucher.toUpperCase(),
      "OPERARIO": reg.atendidoBy || "N/A"
    }));
    const ws = XLSX.utils.json_to_sheet(dataSheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ingresos");
    XLSX.writeFile(wb, `Cierre_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // FUNCIÓN PARA LIMPIAR LA LISTA DEL DÍA (Solo la de asistencia)
  const handleClearAttendance = async () => {
    const confirm1 = window.confirm("⚠️ ¿BORRAR TODO EL DÍA? Esto vaciará la lista de ingresos y el Excel, pero NO afectará la base de datos de empleados.");
    if (confirm1) {
      const confirm2 = window.confirm("¿Seguro? Asegurate de haber exportado el Excel antes.");
      if (confirm2) {
        try {
          await limpiarAsistenciaHoy();
          alert("✨ Lista de hoy vaciada correctamente.");
        } catch (error) {
          console.error("Error al limpiar:", error);
          alert("No se pudo limpiar la lista.");
        }
      }
    }
  };

  const startEditing = (reg) => {
    setEditingId(reg.id);
    setEditForm({ 
      nombre: reg.nombre, 
      patente: reg.patente, 
      voucher: reg.voucher 
    });
  };

  const saveEdit = async (id) => {
    try {
      await updateRegistroAsistencia(id, {
        nombre: editForm.nombre.toUpperCase(),
        patente: editForm.patente.toUpperCase(),
        voucher: editForm.voucher
      });
      setEditingId(null);
    } catch (error) {
      alert("Error al actualizar el registro.");
    }
  };

  return (
    <div className="masterPanel-Main-Wrapper">
      {/* BARRA DE CONTROL PRINCIPAL */}
      <div className="glass-card masterPanel-Control-Bar">
        <div className="masterPanel-Status-Info">
          <ShieldCheck size={32} color="var(--amarillo-boca)" weight="fill" />
          <div>
            <h3 className="masterPanel-Text-Title">MODO ADMINISTRADOR</h3>
            <p className="masterPanel-Text-Stats"><strong>{asistencia.length}</strong> Vehículos Activos</p>
          </div>
        </div>

        <div className="masterPanel-Primary-Actions">
          <button className="btn-secondary" onClick={() => setIsReviewMode(!isReviewMode)}>
            {isReviewMode ? <><EyeSlash size={20}/> CERRAR</> : <><Eye size={20}/> GESTIONAR</>}
          </button>
          
          <button className="btn-primary" onClick={handleFinalExport}>
            <FileXls size={20} weight="bold" /> EXPORTAR
          </button>

          {/* BOTÓN NUEVO: LIMPIAR DÍA */}
          <button className="btn-clean-day" onClick={handleClearAttendance} title="Reiniciar lista diaria">
            <Broom size={20} weight="bold" /> LIMPIAR HOY
          </button>
        </div>
      </div>

      {/* MODAL DE GESTIÓN (RESEÑA) */}
      {isReviewMode && (
        <div className="masterPanel-Full-List-Overlay animateIn">
          <button onClick={logout} className="logout-button-top">
            <SignOut size={20} weight="bold" /> <span>SALIR</span>
          </button>

          <div className="masterPanel-Full-List-Container">
            <div className="masterPanel-List-Header">
              <div className="masterPanel-List-Title">
                <Car size={28} weight="fill" />
                <span>EDICIÓN DE INGRESOS DEL DÍA</span>
              </div>
              <button className="masterPanel-Btn-Close" onClick={() => setIsReviewMode(false)}><X size={24} /></button>
            </div>

            <div className="masterPanel-Scroll-Area">
              {asistencia.map((v) => (
                <div key={v.id} className={`masterPanel-Item-Card ${editingId === v.id ? 'editing-active' : ''}`}>
                  {editingId === v.id ? (
                    /* MODO EDICIÓN */
                    <div className="masterPanel-Edit-Grid">
                      <input 
                        className="boca-input" 
                        value={editForm.patente} 
                        onChange={e => setEditForm({...editForm, patente: e.target.value.toUpperCase()})}
                      />
                      <input 
                        className="boca-input" 
                        value={editForm.nombre} 
                        onChange={e => setEditForm({...editForm, nombre: e.target.value.toUpperCase()})}
                      />
                      <select 
                        className="boca-input"
                        value={editForm.voucher}
                        onChange={e => setEditForm({...editForm, voucher: e.target.value})}
                      >
                        <option value="con">CON VOUCHER</option>
                        <option value="sin">SIN VOUCHER</option>
                        <option value="revisar">REVISAR</option>
                      </select>
                      <div className="masterPanel-Edit-Actions">
                        <button className="confirm-btn" onClick={() => saveEdit(v.id)}><Check size={22}/></button>
                        <button className="cancel-btn" onClick={() => setEditingId(null)}><X size={22}/></button>
                      </div>
                    </div>
                  ) : (
                    /* MODO VISTA */
                    <div className="masterPanel-View-Grid">
                      <div className="masterPanel-Item-MainData">
                        <span className="masterPanel-Item-Plate">{v.patente}</span>
                        <div className="masterPanel-Item-Details">
                          <span className="masterPanel-Item-Name">{v.nombre}</span>
                          <span className={`mini-tag voucher-${v.voucher}`}>{v.voucher.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="masterPanel-Item-Actions">
                        <button className="masterPanel-Action-Btn edit" onClick={() => startEditing(v)}>
                          <PencilSimple size={24} />
                        </button>
                        <button className="masterPanel-Action-Btn delete" onClick={() => window.confirm("¿Borrar?") && deleteRegistroAsistencia(v.id)}>
                          <Trash size={24} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterPanel;