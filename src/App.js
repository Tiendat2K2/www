import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './pages/Login/Login';
import RegisterForm from './pages/Register/Register';
import Admin from './pages/Admin/Admin';
import Teacher from './pages/Teacher/Teacher';
import ProtectedRoute from './ProtectedRoute';
import './App.css';

function App() {
  const isLoggedIn = !!localStorage.getItem('access_token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // true for Admin, false for Teacher

  return (
    <Router>
      <Routes>
        {/* Redirect logged-in users away from Login and Register */}
        {isLoggedIn ? (
          <>
            <Route
              path="/"
              element={<Navigate to={isAdmin ? '/admin' : '/teacher'} replace />}
            />
            <Route
              path="/register"
              element={<Navigate to={isAdmin ? '/admin' : '/teacher'} replace />}
            />
          </>
        ) : (
          <>
            <Route path="/" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
          </>
        )}

        {/* Protected routes for Admin */}
        <Route
          path="/admin"
          element={<ProtectedRoute element={Admin} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/baiviet"
          element={<ProtectedRoute element={Admin} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/tenchuyennganh"
          element={<ProtectedRoute element={Admin} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/taikhoan"
          element={<ProtectedRoute element={Admin} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/nguoidung"
          element={<ProtectedRoute element={Admin} allowedRoles={['admin']} />}
        />

        {/* Protected routes for Teacher */}
        <Route
          path="/teacher"
          element={<ProtectedRoute element={Teacher} allowedRoles={['teacher']} />}
        />
        <Route
          path="/teacher/baiviet"
          element={<ProtectedRoute element={Teacher} allowedRoles={['teacher']} />}
        />
        <Route
          path="/teacher/danhsachbaiviet"
          element={<ProtectedRoute element={Teacher} allowedRoles={['teacher']} />}
        />
      </Routes>
    </Router>
  );
}
export default App;
