import React, { useState, useEffect } from 'react';
import { Table, Input, message, Modal, Form, Button } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import '../../../assets/css/Login.css';
import { API_URL } from '../../../utils/api';
import axiosInstance from '../../../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode';
import { refreshToken } from '../../../server/server';
const AdminNguoidung = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
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

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
    },
    {
      title: 'Username',
      dataIndex: 'Username',
      key: 'Username',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'Std',
      key: 'Std',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            icon={<EditOutlined />} 
            type="primary"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => handleDeleteConfirmation(record)}
          >
            Xóa
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => handleResetPassword(record.UserID)}
          >
            Reset password
          </Button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const access_token = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`${API_URL}/auth/getTeachers`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setData(response.data.data.map((item, index) => ({ ...item, stt: index + 1 })));
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi lấy dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      Email: record.Email,
      Username: record.Username,
      Std: record.Std,
    });
    setIsModalVisible(true);
  };

  const handleDeleteConfirmation = (user) => {
    setDeletingUser(user);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (deletingUser) {
      const access_token = localStorage.getItem('access_token');
      try {
        await axiosInstance.delete(`${API_URL}/auth/deleteTeacher`, {
          headers: { Authorization: `Bearer ${access_token}` },
          params: { UserID: deletingUser.UserID },
        });
        setData(data.filter(item => item.UserID !== deletingUser.UserID));
        message.success('Xóa người dùng thành công!');
      } catch (error) {
        message.error(error.response?.data?.message || 'Xóa người dùng thất bại!');
      } finally {
        setIsDeleteModalVisible(false);
      }
    }
  };

  const handleResetPassword = async (UserID) => {
    try {
      const access_token = localStorage.getItem('access_token');
      await axiosInstance.post(
        `${API_URL}/auth/resetTeacherPassword`,
        {},
        {
          headers: { Authorization: `Bearer ${access_token}` },
          params: { UserID },
        }
      );
      message.success('Mật khẩu đã được đặt lại thành công!');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại!');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        const access_token = localStorage.getItem('access_token');
        await axiosInstance.put(`${API_URL}/auth/updateTeacher`, values, {
          headers: { Authorization: `Bearer ${access_token}` },
          params: { UserID: editingItem.UserID },
        });
        setData(data.map(item => (item.UserID === editingItem.UserID ? { ...item, ...values } : item)));
        message.success('Cập nhật thông tin thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Vui lòng kiểm tra lại thông tin!');
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Tài Khoản Người dùng</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Input
          placeholder="Tìm kiếm theo tên..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          style={{ width: '300px', marginBottom: '20px' }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data.filter(item => 
          item.Username.toLowerCase().includes(searchText.toLowerCase()) || 
          item.Email.toLowerCase().includes(searchText.toLowerCase())
        )}
        pagination={{ pageSize: 5 }}
        loading={loading}
        bordered
        style={{ backgroundColor: '#F0F0F0', marginTop: '20px' }}
        className="custom-table"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xóa người dùng"
        visible={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa người dùng này không?</p>
      </Modal>

      {/* Edit/Update User Modal */}
      <Modal
        title={editingItem ? "Sửa Thông Tin Người Dùng" : "Thêm Người Dùng Mới"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="Email"
            label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Username"
            label="Username"
            rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="Std"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>
          {!editingItem && (
            <Form.Item
              name="Password"
              label="Password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AdminNguoidung;
