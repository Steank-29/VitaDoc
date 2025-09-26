import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', '/dashboard');
    }

    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        toast.error('Please sign in to access the dashboard');
        navigate('/');
        return;
      }

      try {
        const res = await fetch('https://vitadoc.onrender.com/auth/verify', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          const userRes = await fetch('https://vitadoc.onrender.com/auth/user', {
            headers: { 'Authorization': `Bearer ${storedToken}` },
          });
          const userData = await userRes.json();
          if (userRes.ok) {
            setUser(userData);
          } else {
            throw new Error('Failed to fetch user data');
          }
        } else {
          throw new Error('Invalid token');
        }
      } catch (err) {
        toast.error('Session expired or invalid. Please sign in again.');
        localStorage.removeItem('token');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [location, navigate]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Welcome to VitaDoc Dashboard</h2>
      <div className="card p-4 mx-auto" style={{ maxWidth: '600px' }}>
        <h4>User Information</h4>
        <p><strong>First Name:</strong> {user.firstName}</p>
        <p><strong>Last Name:</strong> {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Gender:</strong> {user.gender}</p>
        <p><strong>Date of Birth:</strong> {new Date(user.dateOfBirth).toLocaleDateString()}</p>
        <p><strong>Medical Specialty:</strong> {user.medicalSpecialty}</p>
        {user.picture && (
          <p>
            <strong>Profile Picture:</strong>
            <img src={`https://vitadoc.onrender.com${user.picture}`} alt="Profile" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
          </p>
        )}
        <p><strong>Location:</strong> {user.location}</p>
        <p><strong>Phone Number:</strong> {user.phoneNumber}</p>
        {user.secondPhoneNumber && <p><strong>Second Phone Number:</strong> {user.secondPhoneNumber}</p>}
        <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.removeItem('token');
            toast.success('Logged out successfully');
            navigate('/');
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;