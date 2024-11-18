import React from 'react';
import { Button, Input, Form, Typography, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/css/Login.css';
import studentsImage from '../../assets/img/bia.png';
import logo from '../../assets/img/logo.png';
import { API_URL } from '../../utils/api';
const { Title } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const onFinish = async (values) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        Email: values.email,
        Username: values.username,
        Password: values.password,
      });
      if (response.data.status === 1) {
        message.success(response.data.message);
        navigate('/'); 
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký.');
    }
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
            <Title level={3}>Đăng Ký</Title>
          </div>

          <Form name="register" layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
                { pattern: /^[a-zA-Z0-9._%+-]+@gmail\.com$/, message: 'Vui lòng nhập email có đuôi @gmail.com' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
            </Form.Item>

            <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
              <Input.Password
                prefix={<LockOutlined />}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                placeholder="Mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không trùng khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                placeholder="Xác nhận mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="btn-block btn-lg"
                style={{ width: '100%', backgroundColor: '#d1a7a7', borderColor: '#d1a7a7' }}
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center">
            <Button type="link" onClick={() => navigate('/')} style={{ color: '#d1a7a7' }}>
              Quay về đăng nhập
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
