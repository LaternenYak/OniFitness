
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from "./components/Dashboard";
import Home from './components/Home';



export default function App() {
  const [session, setSession] = useState (null);

  // Beim Start prüfen ob User eingeloggt ist
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  
  //Hört auf Login/Logout Events
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => {
    listener?.subscription.unsubscribe();
  };
}, []);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}



