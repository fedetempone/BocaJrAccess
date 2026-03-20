import React, { useState } from 'react';
import { UserPlus, X, FloppyDisk } from "@phosphor-icons/react";
import { useAdmin } from '../context/AdminContext';
import '../styles/addMemberModal.css';

const AddMemberModal = ({ initialPlate, onClose }) => {
  const { addVehiculo } = useAdmin();
  
  // estados para el nuevo registro
  const [newPlate, setNewPlate] = useState(initialPlate || "");
  const [newName, setNewName] = useState("");

  const handleCreateMember = (e) => {
    e.preventDefault();
    
    if (!newPlate || !newName) {
      return alert("completame todo, no me dejes campos vacios.");
    }

    // mandamos el nuevo socio a la "db" del context
    addVehiculo({
      patente: newPlate.toUpperCase(),
      nombre: newName.toUpperCase()
    });

    alert("socio registrado y listo para el ingreso.");
    onClose(); // cerramos el modal
  };

  return (
    <div className="modalOverlay">
      <div className="glass-card modalContentContainer animateIn">
        <div className="modalHeader">
          <div className="modalTitle">
            <UserPlus size={24} color="var(--amarillo-boca)" weight="fill" />
            <h3>NUEVO REGISTRO</h3>
          </div>
          <button className="closeModalBtn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreateMember} className="addMemberForm">
          <div className="inputGroupField">
            <label>PATENTE DEL VEHÍCULO</label>
            <input 
              type="text" 
              className="boca-input" 
              value={newPlate}
              onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
              placeholder="EJ: AF123JK"
            />
          </div>

          <div className="inputGroupField">
            <label>NOMBRE COMPLETO DEL SOCIO</label>
            <input 
              type="text" 
              className="boca-input" 
              value={newName}
              onChange={(e) => setNewName(e.target.value.toUpperCase())}
              placeholder="NOMBRE Y APELLIDO"
              autoFocus
            />
          </div>

          <button type="submit" className="btn-primary saveMemberBtn">
            <FloppyDisk size={20} weight="bold" /> GUARDAR SOCIO
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;