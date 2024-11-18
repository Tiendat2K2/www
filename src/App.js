import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './pages/Login/Login';
import RegisterForm from './pages/Register/Register';
import Admin from './pages/Admin/Admin';
import Teacher from './pages/Teacher/Teacher';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider, AuthContext } from './context/AuthContext'; 
import './App.css';
function App() {
  const { isLoggedIn, isAdmin } = useContext(AuthContext);
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="/" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
            </>
          ) : (
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
    </AuthProvider>
  );
}

export default App;
