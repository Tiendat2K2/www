import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Menu, Dropdown, Modal, Form, Input, Button, message } from 'antd';
import { UserOutlined, LogoutOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../../assets/img/logo.png';
import { API_URL } from '../../../utils/api';
import axiosInstance from '../../../utils/axiosInstance';

import {jwtDecode} from 'jwt-decode';
const { Header } = Layout;
const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  backgroundColor: '#F0DCC2',
};
const CustomHeader = () => {
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [ setUserInfo] = useState({});
  useEffect(() => {
    fetchUserInfo();
  }, []);
  const fetchUserInfo = async () => {
    try {
      const access_token = localStorage.getItem('access_token');
      if (!access_token) {
        console.error('No access token found');
        return;
      }
      const decodedToken = jwtDecode(access_token);
      const UserID = decodedToken.id;
      const response = await axiosInstance.get(`${API_URL}/auth/getUserById?UserID=${UserID}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      });
      if (response.data.status === 1) {
        setUserInfo(response.data.data);
      } else {
        console.error('Failed to fetch user info');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };
  const showChangePasswordModal = () => {
    setIsChangePasswordModalVisible(true);
  };
  const handleUpdatePassword = async () => {
    try {
      const values = await form.validateFields();
      const access_token = localStorage.getItem('access_token');
      const decodedToken = jwtDecode(access_token);
      const userId = decodedToken.id;
      const response = await axiosInstance.put(
        `${API_URL}/auth/updatePassword`,
        {
          UserID: userId,
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      if (response.status === 200) {
        message.success('Cập nhật mật khẩu thành công');
        setIsChangePasswordModalVisible(false);
        form.resetFields();
      } else {
        message.error('Failed to update password');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Validation failed or password update error!';
      message.error(errorMessage);
      console.error('Update password error:', error);
    }
  };
  const handleCancel = () => {
    setIsChangePasswordModalVisible(false);
    form.resetFields();
  };
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isAdmin');
    navigate('/');
    window.location.reload();
  };
  const menu = (
    <Menu>
      <Menu.Item key="2" icon={<LockOutlined />} onClick={showChangePasswordModal}>
        Đổi mật khẩu
      </Menu.Item>
      <Menu.Item key="3" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      <Header style={headerStyle}>
      <Link to="/admin"><img src={Logo} alt="Logo" style={{ height: '40px' }} /></Link>
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068', cursor: 'pointer' }} />
        </Dropdown>
      </Header>
      <Modal
        title="Đổi mật khẩu"
        visible={isChangePasswordModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="update" type="primary" onClick={handleUpdatePassword}>
            Cập nhật
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mật khẩu cũ"
            name="currentPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu mới và xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default CustomHeader;
