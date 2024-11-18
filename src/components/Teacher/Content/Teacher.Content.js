import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Spin, Image } from 'antd';
import defaultAvatar from '../../../assets/img/logo.png';
import { API_URL } from '../../../utils/api';
import { jwtDecode } from 'jwt-decode'; // Move this import to the top
import axiosInstance from '../../../utils/axiosInstance';
import { refreshToken } from '../../../server/server'
const { Content } = Layout;
const contentStyle = {
  padding: '20px',
  backgroundColor: '#f7f9fc',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};

const imageStyle = {
  width: '128px',
  height: '128px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: '20px',
  border: '2px solid #ddd',
};

const infoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '40px',
  marginBottom: '20px',
};

const textBlockWrapperStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '20px',
  width: '100%',
};

const textBlockStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  padding: '15px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#fff',
  boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
};

const textStyle = {
  margin: '10px 0',
  fontSize: '16px',
  color: '#555',
};

const CustomContent = () => {
  const defaultUserData = {
    MGV: 'null',
    Hoten: 'null',
    Gioitinh: 'null',
    Ngaysinh: null,
    Noisinh: 'null',
    Std: 'null',
    Sonam: 'null',
    Nganh: 'null',
    Chuyenganh: 'null',
    Tendonvi: 'null',
    Img: null
  };
  
  const [userData, setUserData] = useState(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const formatDate = useCallback((date) => {
    if (!date) return 'Chưa cập nhật';
    try {
      return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Chưa cập nhật';
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const access_token = localStorage.getItem('access_token');
      if (!access_token) {
        setError('No access token available');
        return;
      }
      const decodedToken = jwtDecode(access_token);
      const userID = decodedToken.id;
      
      const response = await axiosInstance.get(`${API_URL}/auth/getUserById?UserID=${userID}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      });

      if (response.data.status === 1) {
        // Set user data only if it's different from the current data
        setUserData((prevData) => {
          return JSON.stringify(prevData) !== JSON.stringify(response.data.data) 
            ? response.data.data 
            : prevData;
        });
      } else {
        setError('Không thể lấy thông tin người dùng');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchUserData();
  
    // Set up a timer to refresh the token before it expires
    const timer = setInterval(async () => {
      const access_token = localStorage.getItem('access_token');
      if (access_token) {
        const decodedToken = jwtDecode(access_token);
        const exp = decodedToken.exp * 1000; // Convert to milliseconds
        const now = Date.now();
  
        // Check if the token is about to expire in the next 30 seconds
        if (exp - now < 30000) {
          try {
            const newTokenData = await refreshToken(localStorage.getItem('refresh_token'));
            localStorage.setItem('access_token', newTokenData.access_token);
          } catch (refreshError) {
            console.error('Token refresh error:', refreshError);
            window.location.reload(); // Reset lại trang nếu không thể làm mới token
          }
        }
      }
    }, 10000); // Check every 10 seconds
  
    return () => clearInterval(timer); // Cleanup the timer on unmount
  }, [fetchUserData]);
  useEffect(() => {
    // Only fetch data if no user data exists or it's not the default user data
    if (JSON.stringify(userData) === JSON.stringify(defaultUserData)) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userData, fetchUserData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#ff4d4f' }}>
        {error}
      </div>
    );
  }

  return (
    <Content style={contentStyle}>
      <div style={infoContainerStyle}>
        <Image
          alt={`Ảnh đại diện của ${userData.Hoten}`}
          src={userData.Img || defaultAvatar}
          style={imageStyle}
          fallback={defaultAvatar}
        />
      </div>
      <div style={textBlockWrapperStyle}>
        <div style={textBlockStyle}>
          <p style={textStyle}><strong>Mã giáo viên:</strong> {userData.MGV}</p>
          <p style={textStyle}><strong>Họ tên:</strong> {userData.Hoten}</p>
          <p style={textStyle}><strong>Giới tính:</strong> {userData.Gioitinh}</p>
          <p style={textStyle}><strong>Ngày sinh:</strong> {formatDate(userData.Ngaysinh)}</p>
          <p style={textStyle}><strong>Nơi sinh:</strong> {userData.Noisinh}</p>
        </div>
        <div style={textBlockStyle}>
          <p style={textStyle}><strong>Số điện thoại:</strong> {userData.Std}</p>
          <p style={textStyle}><strong>Số năm công tác:</strong> {userData.Sonam}</p>
          <p style={textStyle}><strong>Ngành:</strong> {userData.Nganh}</p>
          <p style={textStyle}><strong>Chuyên ngành:</strong> {userData.Chuyenganh}</p>
          <p style={textStyle}><strong>Tên đơn vị:</strong> {userData.Tendonvi}</p>
        </div>
      </div>
    </Content>
  );
};

export default CustomContent;
