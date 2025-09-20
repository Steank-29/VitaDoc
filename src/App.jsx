// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/" element={<AuthPage />} />

        {/* Example Dashboard */}
        <Route path="/dashboard" element={<h1>Doctor Dashboard (Coming Soon)</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
