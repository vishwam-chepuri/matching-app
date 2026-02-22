import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';

function App() {
  const { isLoggedIn, isAdmin } = useAuth();
  const [showAdmin, setShowAdmin] = useState(false);

  if (!isLoggedIn) return <AuthPage />;
  if (showAdmin && isAdmin) return <AdminPage onBack={() => setShowAdmin(false)} />;
  return <Home onAdminClick={isAdmin ? () => setShowAdmin(true) : null} />;
}

export default App;
