// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/" element={<AuthPage />} />

        {/* Example Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
