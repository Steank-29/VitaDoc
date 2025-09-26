// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from './components/Dashboard';
import ForgetPassword from "./pages/ForgetPassword";
import Navbar from "./containers/Navbar";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/" element={<AuthPage />} />

        {/* Example Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
         <Route path="/navbar" element={<Navbar />} />
      </Routes>
    </Router>
  );
}

export default App;
