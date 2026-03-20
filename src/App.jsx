// Importamos el Proveedor del Contexto para manejar el "motor" de la app
import { AdminProvider } from './context/AdminContext';

// Importamos los componentes modulares (Portero, Header, Buscador y Master)
import LoginGate from './components/LoginGate';
import Header from './components/Header';
import SearchVehicle from './components/SearchVehicle';
import MasterPanel from './components/MasterPanel';

// Estilos globales (variables de color y fuentes)
import './App.css';

function App() {
  return (
    /* Envolvemos toda la app con el AdminProvider. 
      Esto permite que 'db', 'user' y las funciones de login/update
      estén disponibles en todos los componentes.
    */
    <AdminProvider>
      <div className="app-container">
        
        {/* El Header siempre se ve (estrellas y logo) */}
        <Header />

        {/* El LoginGate envuelve el contenido sensible.
          Si no hay usuario logueado, muestra el formulario de Login.
          Si hay usuario, muestra lo que está acá adentro (children).
        */}
        <LoginGate>
          <main>
            {/* Buscador de patentes y registro de ingresos */}
            <SearchVehicle />
          </main>

          <footer>
            {/* El MasterPanel ya tiene su propia lógica interna para 
               mostrarse solo si el usuario logueado tiene el rol 'MASTER'.
            */}
            <MasterPanel />
          </footer>
        </LoginGate>

      </div>
    </AdminProvider>
  );
}

export default App;