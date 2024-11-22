import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Alert } from 'antd';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../../utils/axiosInstance';
import { API_URL } from '../../../utils/api';
import { refreshToken } from '../../../server/server';
const dashboardContainerStyle = {
  width: '100%',
  padding: '24px',
  backgroundColor: '#f9f9f9',
};
const dashboardTitleStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '30px',
  textAlign: 'center',
  color: '#333',
};
const dashboardCardStyle = {
  border: '1px solid #eaeaea',
  borderRadius: '10px',
  padding: '16px',
  textAlign: 'center',
  transition: 'transform 0.2s, box-shadow 0.2s',
  backgroundColor: 'rgb(240, 220, 194)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};
const cardTitleStyle = {
  fontSize: '20px',
  fontWeight: '700',
  marginBottom: '12px',
};
const cardValueStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#000',
};
const titleColors = {
  major: '#ff4d4f',
  articles: '#52c41a',
  teachers: '#1890ff',
};
const Content = () => {
  const [data, setData] = useState({
    major: 0,
    articles: 0,
    teachers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const access_token = localStorage.getItem('access_token');
      if (!access_token) throw new Error('Access token not found');

      const decodedToken = jwtDecode(access_token);
      const UserID = decodedToken?.id;
      if (!UserID) throw new Error('Invalid access token');

      const [userResponse, majorRes, articlesRes, teachersRes] = await Promise.all([
        axiosInstance.get(`${API_URL}/auth/getUserById?UserID=${UserID}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }),
        axiosInstance.get(`${API_URL}/auth/getChuyenNganhCount`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }),
        axiosInstance.get(`${API_URL}/auth/getDulieucount`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }),
        axiosInstance.get(`${API_URL}/auth/user-count`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }),
      ]);

      if (userResponse.data.status === 1) {
        setData({
          major: majorRes.data.chuyenNganhCount || 0,
          articles: articlesRes.data.count|| 0,
          teachers: teachersRes.data.userCount || 0,
        });
      } else {
        throw new Error('Cannot fetch user information');
      }
    } catch (err) {
      if (err.message === 'Access token not found' || err.response?.status === 401) {
        try {
          const newTokenData = await refreshToken(localStorage.getItem('refresh_token'));
          localStorage.setItem('access_token', newTokenData.access_token);
          fetchData(); // Retry fetching data
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          window.location.reload(); // Reset lại trang
        }
      } else {
        console.error('Fetch error:', err);
        setError(err.message || 'An error occurred while fetching data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

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
  }, []);

  if (error) {
    return <Alert message="Error fetching data" description={error} type="error" />;
  }

  return (
    <div style={dashboardContainerStyle}>
      <h2 style={dashboardTitleStyle}>Dashboard</h2>
      {loading ? (
        <Spin tip="Loading..." size="large" />
      ) : (
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={8}>
            <Card style={dashboardCardStyle} bodyStyle={{ padding: '10px' }} hoverable>
              <div style={{ ...cardTitleStyle, color: titleColors.major }}>Tên chuyên ngành</div>
              <p style={cardValueStyle}>{data.major}</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card style={dashboardCardStyle} bodyStyle={{ padding: '10px' }} hoverable>
              <div style={{ ...cardTitleStyle, color: titleColors.articles }}>Số bài viết</div>
              <p style={cardValueStyle}>{data.articles}</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card style={dashboardCardStyle} bodyStyle={{ padding: '10px' }} hoverable>
              <div style={{ ...cardTitleStyle, color: titleColors.teachers }}>Tài khoản giáo viên</div>
              <p style={cardValueStyle}>{data.teachers}</p>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Content;
