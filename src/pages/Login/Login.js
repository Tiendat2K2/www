import React, { useState } from 'react';
import { Button, Input, Form, Typography, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/css/Login.css';
import studentsImage from '../../assets/img/bia.png';
import logo from '../../assets/img/logo.png';
import ForgotPasswordModal from '../../Modal/ForgotPassword/ForgotPassword';
import axios from 'axios';
import API_URL from '../../server/server';
import { jwtDecode } from 'jwt-decode';

const { Title } = Typography;

const Login = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        Username: values.username,
        Password: values.password,
      });
      const { status, message: serverMessage, access_token, refresh_token, isAdmin } = response.data;
      if (status === 1) {
        message.success(serverMessage);
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('isAdmin', isAdmin);
        // Decode the access token to get the UserID
        const decodedToken = jwtDecode(access_token);
        const UserID = decodedToken.id;

        // Optionally: Use the userID to fetch additional user info (e.g., via an API call)
        const userResponse = await axios.get(`${API_URL}/auth/getUserById?UserID=${UserID}`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          }
        });
        if (userResponse.data.status === 1) {
          console.log('User data fetched:', userResponse.data.data);
        } else {
          console.error('Failed to fetch user data');
        }

        // Redirect based on the user's role
        if (isAdmin) {
          navigate('/admin'); // Admin dashboard
        } else {
          navigate('/teacher'); // Teacher dashboard
        }
      } else {
        message.error('Đăng nhập thất bại!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng nhập.');
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPassword = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSendEmail = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center login-container vh-100">
      <div className="row login-box shadow p-4 rounded">
        <div className="col-md-6 d-flex justify-content-center align-items-center">
          <img src={studentsImage} alt="University students" className="img-fluid rounded" />
        </div>
        <div className="col-md-6 login-form bg-light p-4 rounded">
          <div className="text-center mb-4">
            <img src={logo} alt="University logo" className="mb-3" style={{ maxWidth: '120px' }} />
            <Title level={3}>Đăng Nhập</Title>
          </div>
          <Form name="login" layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Tên đăng nhập"
                size="large"
                style={{ color: '#000000' }} 
                aria-label="Tên đăng nhập"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                placeholder="Mật khẩu"
                size="large"
                aria-label="Mật khẩu"
              />
            </Form.Item>
            <Form.Item>
              <div className="d-flex justify-content-between">
                <Link to="/register">Đăng ký</Link>
                <Link onClick={handleForgotPassword} style={{ cursor: 'pointer' }}>Quên mật khẩu</Link>
              </div>
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="btn-block btn-lg" 
                style={{ width: '100%', backgroundColor: '#d1a7a7', borderColor: '#d1a7a7' }}
                loading={loading}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
          <ForgotPasswordModal
            visible={isModalVisible}
            onClose={handleCancel}
            onSendEmail={handleSendEmail}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
