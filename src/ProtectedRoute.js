import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Element, allowedRoles }) => {
  const accessToken = localStorage.getItem('access_token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // isAdmin will be 'true' for Admin, 'false' for Teacher

  // Check if the user is authenticated
  if (!accessToken) {
    return <Navigate to="/" />; // Redirect to login if no token is found
  }

  // Check if user's role is allowed
  const userRole = isAdmin ? 'admin' : 'teacher';
  if (!allowedRoles.includes(userRole)) {
    // Redirect based on the user's role if access is denied
    return <Navigate to={isAdmin ? "/admin" : "/teacher"} />;
  }

  return <Element />; // Render the protected component if the role matches
};

export default ProtectedRoute;
