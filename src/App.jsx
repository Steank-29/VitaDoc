// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from './components/Dashboard';
import ForgetPassword from "./pages/ForgetPassword";
import Navbar from "./containers/Navbar";
import Sidebar from "./containers/Sidebar";
import MainLayout from "./config/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (without layout) */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        
        {/* Component Test Routes (without layout) */}
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/sidebar" element={<Sidebar />} />

        {/* Protected Routes (with main layout) */}
        <Route path="/dashboard" element={
          <MainLayout>
            <p>hello</p>
          </MainLayout>
        } />

        {/* You can add more protected routes like this: */}
        {/* <Route path="/appointments" element={
          <MainLayout>
            <div>Appointments Page Content</div>
          </MainLayout>
        } /> */}

        {/* 404 Fallback */}
        <Route path="*" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>404 - Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;