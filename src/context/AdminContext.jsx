import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  getDocs,
  query, 
  orderBy 
} from "firebase/firestore";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [vehiculosMaestros, setVehiculosMaestros] = useState([]); 
  const [asistencia, setAsistencia] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // --- 1. ESCUCHA EN TIEMPO REAL ---
  useEffect(() => {
    // Base maestra de vehículos registrados
    const qMaestra = query(collection(db, "ingresos"), orderBy("nombre", "asc"));
    const unsubMaestra = onSnapshot(qMaestra, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehiculosMaestros(docs);
    });

    // Lista de ingresos/asistencia del día
    const qAsistencia = query(collection(db, "asistencia_evento"), orderBy("fechaHora", "desc"));
    const unsubAsistencia = onSnapshot(qAsistencia, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAsistencia(docs);
      setLoading(false);
    });

    return () => {
      unsubMaestra();
      unsubAsistencia();
    };
  }, []);

  // --- 2. LOGIN CORREGIDO (3 USUARIOS DESDE .ENV) ---
  const login = (username, password) => {
    const userClean = username.toLowerCase().trim();

    // Verificación Master: ftempone
    if (
      userClean === import.meta.env.VITE_MASTER_USER && 
      password === import.meta.env.VITE_MASTER_PASS
    ) {
      setUser({ name: "Federico Tempone", role: "MASTER", id: "ftempone" });
      return true;
    } 

    // Verificación Operario 1: ymoyano
    if (
      userClean === import.meta.env.VITE_OP1_USER && 
      password === import.meta.env.VITE_OP1_PASS
    ) {
      setUser({ name: "Y. Moyano", role: "OPERARIO", id: "ymoyano" });
      return true;
    }

    // Verificación Operario 2: jnardo
    if (
      userClean === import.meta.env.VITE_OP2_USER && 
      password === import.meta.env.VITE_OP2_PASS
    ) {
      setUser({ name: "J. Nardo", role: "OPERARIO", id: "jnardo" });
      return true;
    }

    return false;
  };

  // --- 3. MARCAR INGRESO ---
  const marcarIngreso = async (vehiculoOriginal, voucherType) => {
    try {
      const patenteLimpia = vehiculoOriginal.patente.toUpperCase().replace(/\s+/g, '');

      await addDoc(collection(db, "asistencia_evento"), {
        nombre: vehiculoOriginal.nombre.toUpperCase(),
        patente: patenteLimpia,
        descripcion: vehiculoOriginal.descripcion || "", 
        voucher: voucherType, // 'con', 'sin', o 'pendiente'
        fechaHora: new Date().toISOString(),
        atendidoBy: user?.name || "Operario Desconocido",
        operarioId: user?.id || "unknown",
        tipo: "SOCIO_LISTA"
      });
      return true;
    } catch (error) {
      console.error("Error al registrar ingreso:", error);
      throw error;
    }
  };

  // --- 4. REGISTRO MANUAL ---
  const registrarEntradaManual = async (nombre, patente, voucherType, guardarEnBaseMaestra) => {
    try {
      const nombreUpper = nombre.toUpperCase().trim();
      const patenteLimpia = patente.toUpperCase().replace(/\s+/g, '');

      if (guardarEnBaseMaestra) {
        await addDoc(collection(db, "ingresos"), {
          nombre: nombreUpper,
          patente: patenteLimpia,
          tipo: "SOCIO_NUEVO",
          fechaAlta: new Date().toISOString(),
          creadoBy: user?.name || "Sistema"
        });
      }

      await addDoc(collection(db, "asistencia_evento"), {
        nombre: nombreUpper,
        patente: patenteLimpia,
        voucher: voucherType,
        fechaHora: new Date().toISOString(),
        atendidoBy: user?.name || "Operario Desconocido",
        operarioId: user?.id || "unknown",
        tipo: guardarEnBaseMaestra ? "NUEVO_SOCIO_REGISTRADO" : "INVITADO_UNICA_VEZ"
      });

      return true;
    } catch (error) {
      console.error("Error en el registro manual:", error);
      return false;
    }
  };

  // --- 5. FUNCIONES MASTER (Protegidas por rol) ---
  const deleteRegistroAsistencia = async (id) => {
    if (user?.role !== 'MASTER') return false;
    try {
      await deleteDoc(doc(db, "asistencia_evento", id));
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateRegistroAsistencia = async (id, nuevosDatos) => {
    if (user?.role !== 'MASTER') return false;
    try {
      const docRef = doc(db, "asistencia_evento", id);
      const patenteLimpia = nuevosDatos.patente.toUpperCase().replace(/\s+/g, '');
      await updateDoc(docRef, {
        ...nuevosDatos,
        patente: patenteLimpia,
        ultimaEdicion: new Date().toISOString(),
        editadoBy: user?.name || "Admin"
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const limpiarAsistenciaHoy = async () => {
    if (user?.role !== 'MASTER') return false;
    try {
      const querySnapshot = await getDocs(collection(db, "asistencia_evento"));
      const promises = querySnapshot.docs.map(d => deleteDoc(doc(db, "asistencia_evento", d.id)));
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("Error al limpiar:", error);
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <AdminContext.Provider value={{ 
      db: vehiculosMaestros, 
      asistencia, 
      user, 
      loading,
      login,
      marcarIngreso, 
      registrarEntradaManual, 
      deleteRegistroAsistencia,
      updateRegistroAsistencia,
      limpiarAsistenciaHoy,
      logout
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);