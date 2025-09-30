// src/index.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { I18nextProvider } from 'react-i18next';
import i18n from './config/i18n.js';

// ✅ import our global theme provider
import { CustomThemeProvider } from '../src/styles/ColorModeContext';

const loadBootstrapCSS = (language) => {
  // Remove any existing Bootstrap CSS to avoid duplicates
  const existingLink = document.getElementById('bootstrap-css');
  if (existingLink) {
    existingLink.remove();
  }

  // Create a new <link> element for the appropriate Bootstrap CSS
  const link = document.createElement('link');
  link.id = 'bootstrap-css';
  link.rel = 'stylesheet';
  link.href =
    language === 'ar'
      ? '/node_modules/bootstrap-rtl/dist/css/bootstrap-rtl.min.css'
      : '/node_modules/bootstrap/dist/css/bootstrap.min.css';
  document.head.appendChild(link);
};

// Load Bootstrap CSS based on initial language
loadBootstrapCSS(i18n.language);

// Listen for language changes and update CSS accordingly
i18n.on('languageChanged', (lng) => {
  loadBootstrapCSS(lng);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      {/* ✅ Wrap the whole app with CustomThemeProvider */}
      <CustomThemeProvider>
        <App />
      </CustomThemeProvider>
    </I18nextProvider>
  </StrictMode>
);
