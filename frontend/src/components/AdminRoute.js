import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store';

/**
 * @description Protects routes, ensuring only 'admin' users can access children.
 */
const AdminRoute = ({ children }) => {
  const { state } = useStore();
  const { userInfo } = state;
  
  return userInfo && userInfo.role === 'admin' 
    ? children 
    : <Navigate to="/login" replace />; // Use replace for clean navigation history
};

export default AdminRoute;