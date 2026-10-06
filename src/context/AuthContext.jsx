import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { isJwtExpired } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem('token');
      if (savedToken && !isJwtExpired(savedToken)) {
        return savedToken;
      }
    } catch (e) {}
    return null;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedToken && savedUser && !isJwtExpired(savedToken)) {
        return JSON.parse(savedUser);
      }
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken) {
      if (isJwtExpired(savedToken)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        return;
      }

      // Sync latest customer profile details (including saved coords) from backend
      api.get('/api/customer/profile')
        .then((res) => {
          if (res.data?.data) {
            const profile = res.data.data;
            setUser((prev) => {
              const updated = { ...prev, ...profile };
              try {
                localStorage.setItem('user', JSON.stringify(updated));
                if (profile.latitude && profile.longitude) {
                  localStorage.setItem('user_coords', JSON.stringify({
                    latitude: profile.latitude,
                    longitude: profile.longitude,
                  }));
                }
              } catch (e) {}
              return updated;
            });
          }
        })
        .catch((err) => {
          // If 401 or network error, keep current local user state
          console.warn('Could not sync user profile from server:', err);
        });
    }
  }, [token]);

  const sendOtp = async (mobileNumber) => {
    try {
      const response = await api.post('/api/auth/send-otp', { mobileNumber });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const verifyOtp = async (mobileNumber, otp) => {
    try {
      const response = await api.post('/api/auth/verify-otp', { mobileNumber, otp });
      const authData = response.data.data; // AuthResponse DTO fields: token, userId, role, name, mobileNumber

      if (authData.role !== 'CUSTOMER') {
        throw new Error('This mobile number is registered as a Salon Owner. Please log into the Admin Panel (port 5174) or use a customer mobile number.');
      }

      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      
      setToken(authData.token);
      setUser(authData);
      return authData;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfileInContext = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        sendOtp,
        verifyOtp,
        logout,
        updateProfileInContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
