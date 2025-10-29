import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store';

/**
 * @description Protects routes, ensuring only 'vendor' users can access children.
 */
const VendorRoute = ({ children }) => {
  const { state } = useStore();
  const { userInfo } = state;
  
  return userInfo && userInfo.role === 'vendor' 
    ? children 
    : <Navigate to="/login" replace />; // Use replace for clean navigation history
};

export default VendorRoute;