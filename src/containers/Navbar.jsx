import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import enFlag from '../assets/flag-en.png'; // Adjust path based on your folder structure
import frFlag from '../assets/flag-fr.png'; // Adjust path based on your folder structure

const languages = [
  { code: 'en', label: 'English', flag: enFlag },
  { code: 'fr', label: 'French', flag: frFlag },
  // Add more languages as needed, e.g., { code: 'ar', label: 'Arabic', flag: arFlag }
];

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const changeLanguage = (code) => {
    setCurrentLanguage(code);
    setIsDropdownOpen(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <nav 
      className="navbar navbar-expand-lg navbar-light bg-light fixed-top" 
      style={{ 
        fontFamily: "'Montserrat', sans-serif",
        padding: '0.5rem 1rem',
        boxShadow: '0 2px/4px rgba(0,0,0,0.1)'
      }}
    >
      <div className="container-fluid">
        {/* Brand */}
        <a className="navbar-brand" href="#" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          VITADOC
        </a>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navbarContent">
          {/* Search Bar */}
          <div className="mx-3 my-2" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                aria-label="Search"
              />
              <span className="input-group-text">
                <FontAwesomeIcon icon={faSearch} />
              </span>
            </div>
          </div>

          {/* Right side items */}
          <div className="d-flex align-items-center ms-auto">
            {/* Language Dropdown */}
            <div className="position-relative me-3">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
                aria-label={languages.find(lang => lang.code === currentLanguage)?.label}
              >
                <img
                  src={languages.find(lang => lang.code === currentLanguage)?.flag}
                  alt={languages.find(lang => lang.code === currentLanguage)?.label}
                  style={{ width: '24px', height: '24px' }}
                />
              </button>
              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '30px',
                    left: currentLanguage === 'ar' ? 'auto' : 0,
                    right: currentLanguage === 'ar' ? 0 : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    zIndex: 1000,
                  }}
                >
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                      }}
                      aria-label={lang.label}
                    >
                      <img
                        src={lang.flag}
                        alt={lang.label}
                        style={{ width: '24px', height: '24px' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Dropdown */}
            <div className="position-relative me-3">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
                aria-label="Notifications"
              >
                <FontAwesomeIcon icon={faBell} size="lg" />
              </button>
              {isNotificationOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '30px',
                    right: 0,
                    width: '200px',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    zIndex: 1000,
                  }}
                >
                  <div>No new notifications</div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                marginRight: '1rem',
              }}
              aria-label="Toggle theme"
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} size="lg" />
            </button>

            {/* User Profile */}
            <div className="d-flex align-items-center">
              <img
                src="https://via.placeholder.com/40"
                alt="User profile"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  marginRight: '0.5rem',
                }}
              />
              <div className="d-flex flex-column">
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>John Doe</span>
                <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;