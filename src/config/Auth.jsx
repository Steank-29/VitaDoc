const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  try {
    // Simple JWT structure check (has 3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const decoded = jwt_decode(token);
    return decoded.exp * 1000 > Date.now();
    
    return true;
  } catch (error) {
    return false;
  }
};

export const login = (token) => {
  if (!isValidToken(token)) {
    console.error('Invalid token format');
    return false;
  }
  
  try {
    localStorage.setItem('token', token);
    return true;
  } catch (error) {
    console.error('Failed to store token:', error);
    return false;
  }
};

export const logout = () => {
  try {
    localStorage.removeItem('token');
    
    // Redirect to login/home page
    const redirectUrl = window.location.origin + '/';
    window.location.href = redirectUrl;
  } catch (error) {
    console.error('Logout error:', error);
    // Fallback: still try to redirect
    window.location.href = window.location.origin + '/';
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  return isValidToken(token);
};

export const getAuthHeaders = () => {
  const token = getToken();
  if (token && isValidToken(token)) {
    return { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } else {
    logout();
    return {};
  }
};

// Additional utility functions
export const getStoredUserData = () => {
  try {
    const token = getToken();
    if (!token) return null;
    
    // If you want to extract user info from JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error parsing token payload:', error);
    return null;
  }
};

export const isTokenExpired = () => {
  try {
    const token = getToken();
    if (!token) return true;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};