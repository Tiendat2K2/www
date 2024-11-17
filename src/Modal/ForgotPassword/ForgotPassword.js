import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import axios from 'axios';
import API_URL from '../../server/server';

const ForgotPasswordModal = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async (values) => {
    setLoading(true);
    try {
      // Gửi email đến API mà không cần header Authorization
      const response = await axios.post(
        `${API_URL}/auth/sendVerificationEmail`,
        { Email: values.Email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Hiển thị thông báo thành công nếu email được gửi thành công
      if (response.status === 200) {
        message.success(response.data.message || 'Gửi email thành công!');
        onClose(); // Đóng modal khi thành công
      } else {
        message.error('Không thể gửi email xác thực.');
      }
    } catch (error) {
      // Hiển thị thông báo lỗi nếu yêu cầu thất bại
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Quên Mật Khẩu"
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        name="forgot-password"
        layout="vertical"
        onFinish={handleSendEmail}
      >
        <Form.Item
          name="Email"
          rules={[{ required: true, type: 'email', message: 'Vui lòng nhập địa chỉ email hợp lệ!' }]}
        >
          <Input placeholder="Nhập email của bạn" />
        </Form.Item>
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            style={{ width: '100%' }} 
            loading={loading}
          >
            Gửi
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ForgotPasswordModal;
