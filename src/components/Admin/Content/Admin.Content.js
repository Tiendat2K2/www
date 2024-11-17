import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Alert } from 'antd';
import { jwtDecode } from 'jwt-decode'; // Correct import
import axios from 'axios'; // Ensure axios is correctly imported
import API_URL from '../../../server/server'; // Correct API_URL import


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
  const [error, setError] = useState(null); // Initialize properly

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
        const access_token = localStorage.getItem('access_token');
        if (!access_token) throw new Error('Access token not found');

        const decodedToken = jwtDecode(access_token);
        const UserID = decodedToken?.id;
        if (!UserID) throw new Error('Invalid access token');

        // Fetch user data and counts
        const [userResponse, majorRes, articlesRes, teachersRes] = await Promise.all([
            axios.get(`${API_URL}/auth/getUserById?UserID=${UserID}`, {
                headers: {
                    Authorization: `Bearer ${access_token}`, // Đảm bảo header Authorization được thiết lập
                },
            }),
            axios.get(`${API_URL}/auth/getChuyenNganhCount`, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }),
            axios.get(`${API_URL}/auth/getDulieucount`, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }),
            axios.get(`${API_URL}/auth/user-count`, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }),
        ]);

        if (userResponse.data.status === 1) {
            setData({
                major: majorRes.data.chuyenNganhCount || 0,
                articles: articlesRes.data.dulieuCount || 0,
                teachers: teachersRes.data.userCount || 0,
            });
        } else {
            throw new Error('Cannot fetch user information');
        }
    } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'An error occurred while fetching data');
    } finally {
        setLoading(false);
    }
};
  useEffect(() => {
    fetchData();
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