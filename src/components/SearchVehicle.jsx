import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlass, Check, Eraser, Warning,
  UserPlus, FloppyDisk, ClockAfternoon, X, ClockCounterClockwise
} from "@phosphor-icons/react";
import { useAdmin } from '../context/AdminContext';
import LiveAttendance from './LiveAttendance';
import '../styles/searchvehicle.css';

const SearchVehicle = () => {
  const { db, asistencia, marcarIngreso, registrarEntradaManual } = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCheckIn, setIsCheckIn] = useState(false);
  const [voucherType, setVoucherType] = useState("");
  const [alreadyIn, setAlreadyIn] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({ nombre: '', patente: '', voucher: 'con' });

  useEffect(() => {
    if (searchTerm.length > 2) {
      const normalize = (text) => text.toUpperCase().replace(/\s+/g, '');
      const termLimpio = normalize(searchTerm);

      const found = db.find(u =>
        normalize(u.patente).includes(termLimpio) ||
        normalize(u.nombre).includes(termLimpio)
      );

      if (found) {
        setSelectedItem(found);
        const ingresoPrevio = asistencia.find(a => normalize(a.patente) === normalize(found.patente));

        if (ingresoPrevio) {
          setAlreadyIn(true);
          setVoucherType(ingresoPrevio.voucher || "");
          setIsCheckIn(true);
        } else {
          setAlreadyIn(false);
          setVoucherType("");
          setIsCheckIn(false);
        }
      } else {
        setSelectedItem(null);
      }
    } else {
      setSelectedItem(null);
    }
  }, [searchTerm, db, asistencia]);

  const handleFullClear = () => {
    setSearchTerm("");
    setSelectedItem(null);
    setIsCheckIn(false);
    setVoucherType("");
    setAlreadyIn(false);
    setManualData({ nombre: '', patente: '', voucher: 'con' });
  };

  const handleSaveEntry = async () => {
    if (!selectedItem || !voucherType) return;
    try {
      await marcarIngreso(selectedItem, voucherType);
      handleFullClear();
    } catch (error) {
      alert("Error al registrar.");
    }
  };

  const handleOpenManual = () => {
    const term = searchTerm.toUpperCase().trim();
    const patenteRegex = /^[A-Z]{2,3}\s?\d{3}\s?([A-Z]{2})?$/;
    let nuevaPatente = "";
    let nuevoNombre = "";

    if (patenteRegex.test(term)) {
      nuevaPatente = term.replace(/\s+/g, '');
    } else {
      nuevoNombre = term;
    }

    setManualData({ ...manualData, patente: nuevaPatente, nombre: nuevoNombre, voucher: 'con' });
    setShowManualForm(true);
  };

  const handleManualDecision = async (guardarEnBaseMaestra) => {
    if (!manualData.nombre || !manualData.patente) return;
    const success = await registrarEntradaManual(
      manualData.nombre,
      manualData.patente,
      manualData.voucher,
      guardarEnBaseMaestra
    );
    if (success) {
      setShowManualForm(false);
      handleFullClear();
    }
  };

  return (
    <div className="searchVehicleSection">
      <div className="glass-card searchInputContainer">
        <input
          type="text"
          className="boca-input"
          placeholder="BUSCAR PATENTE O NOMBRE..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
        />
        <MagnifyingGlass size={22} className="searchIcon" />
      </div>

      {selectedItem ? (
        <div className={`glass-card resultCardContainer animateIn ${alreadyIn ? 'already-in' : ''}`}>
          <div className="resultHeader">
            <div className="infoWrapper">
              <h2 className="memberFullname">{selectedItem.nombre}</h2>
              {selectedItem.descripcion && (
                <span className="badge-cargo">{selectedItem.descripcion}</span>
              )}
            </div>
            <span className="plateTag">{selectedItem.patente}</span>
          </div>

          <div className="voucher-selection-group">
            <p className="section-label">TIPO DE INGRESO:</p>
            <div className="voucher-cards-grid">
              
              {/* CON VOUCHER */}
              <label className={`voucher-card ${voucherType === 'con' ? 'selected' : ''} ${alreadyIn ? 'disabled' : ''}`}>
                <input 
                  type="radio" 
                  name="voucher" 
                  checked={voucherType === 'con'}
                  disabled={alreadyIn}
                  onChange={() => { setVoucherType('con'); setIsCheckIn(true); }}
                />
                <div className="card-content">
                  <div className="custom-check"><Check weight="bold" /></div>
                  <div className="card-text">
                    <span className="main-text">CON VOUCHER</span>
                    <span className="sub-text">Ingresa con voucher</span>
                  </div>
                </div>
              </label>

              {/* SIN VOUCHER (COMÚN) */}
              <label className={`voucher-card ${voucherType === 'sin' ? 'selected' : ''} ${alreadyIn ? 'disabled' : ''}`}>
                <input 
                  type="radio" 
                  name="voucher" 
                  checked={voucherType === 'sin'}
                  disabled={alreadyIn}
                  onChange={() => { setVoucherType('sin'); setIsCheckIn(true); }}
                />
                <div className="card-content">
                  <div className="custom-check"><Check weight="bold" /></div>
                  <div className="card-text">
                    <span className="main-text">SIN VOUCHER</span>
                    <span className="sub-text">Ingresa sin voucher</span>
                  </div>
                </div>
              </label>

              {/* PENDIENTE / TRAE DESPUÉS (TU NUEVA OPCIÓN) */}
              <label className={`voucher-card pending-card ${voucherType === 'pendiente' ? 'selected' : ''} ${alreadyIn ? 'disabled' : ''}`}>
                <input 
                  type="radio" 
                  name="voucher" 
                  checked={voucherType === 'pendiente'}
                  disabled={alreadyIn}
                  onChange={() => { setVoucherType('pendiente'); setIsCheckIn(true); }}
                />
                <div className="card-content">
                  <div className="custom-check icon-orange"><ClockCounterClockwise weight="bold" /></div>
                  <div className="card-text">
                    <span className="main-text">PENDIENTE</span>
                    <span className="sub-text">Trae el voucher luego</span>
                  </div>
                </div>
              </label>

            </div>
          </div>

          <div className="actionButtonsContainer">
            <button className="btn-primary" onClick={handleSaveEntry} disabled={alreadyIn || !isCheckIn || !voucherType}>
              <Check size={20} weight="bold" /> {alreadyIn ? "YA INGRESÓ" : "CONFIRMAR INGRESO"}
            </button>
            <button className="btn-secondary" onClick={handleFullClear}><Eraser size={20} /></button>
          </div>
        </div>
      ) : (
        searchTerm.length > 3 && !showManualForm && (
          <div className="glass-card noResultCard animateIn">
            <Warning size={32} color="var(--amarillo-boca)" />
            <p>El vehículo <strong>{searchTerm}</strong> no está en la lista.</p>
            <button className="btn-primary" onClick={handleOpenManual}>
              <UserPlus size={18} weight="bold" /> NUEVO REGISTRO
            </button>
          </div>
        )
      )}

      {showManualForm && (
        <div className="manualForm-Overlay">
          {/* ... mismo modal manual ... */}
          <div className="manualForm-Card glass-card">
            <button className="close-btn" onClick={() => setShowManualForm(false)}><X size={24} /></button>
            <h3 className="modal-title">REGISTRO MANUAL</h3>
            <div className="manual-inputs">
              <input
                className="boca-input"
                placeholder="NOMBRE"
                value={manualData.nombre}
                onChange={(e) => setManualData({ ...manualData, nombre: e.target.value.toUpperCase() })}
              />
              <input
                className="boca-input"
                placeholder="PATENTE"
                value={manualData.patente}
                onChange={(e) => setManualData({ ...manualData, patente: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="decision-grid">
              <button className="btn-decision save-permanent" onClick={() => handleManualDecision(true)}>
                <FloppyDisk size={24} /> <strong>REGISTRAR EN LA BASE DE DATOS</strong>
              </button>
              <button className="btn-decision guest-only" onClick={() => handleManualDecision(false)}>
                <ClockAfternoon size={24} /> <strong>REGISTRAR SOLO POR HOY</strong>
              </button>
            </div>
          </div>
        </div>
      )}

      <LiveAttendance />
    </div>
  );
};

export default SearchVehicle;