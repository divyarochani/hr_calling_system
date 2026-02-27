import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
