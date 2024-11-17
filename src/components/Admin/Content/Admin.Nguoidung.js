import React, { useState, useEffect } from 'react';
import { Table, Input, message, Modal, Form, Button } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import '../../../assets/css/Login.css';
import API_URL from '../../../server/server';

const AdminNguoidung = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
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
      const response = await fetch(`${API_URL}/auth/getTeachers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (response.ok) {
        setData(result.data.map((item, index) => ({ ...item, stt: index + 1 })));
      } else {
        message.error(result.message || 'Lỗi khi lấy dữ liệu!');
      }
    } catch (error) {
      message.error('Failed to fetch data!');
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
    setIsDeleteModalVisible(true);  // Open the delete confirmation modal
  };
  const handleDelete = async () => {
    if (deletingUser) {
      const access_token = localStorage.getItem('access_token');
      try {
        // Use query parameter for UserID in the URL
        const response = await fetch(`${API_URL}/auth/deleteTeacher?UserID=${deletingUser.UserID}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          // Filter out the deleted user from the data
          setData(data.filter(item => item.UserID !== deletingUser.UserID));
          message.success('Xóa người dùng thành công!');
        } else {
          const errorData = await response.json();
          message.error(`Xóa người dùng thất bại! Lý do: ${errorData.message || 'Không có thông tin lỗi'}`);
        }
      } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        message.error('Lỗi khi xóa người dùng!');
      } finally {
        setIsDeleteModalVisible(false);  // Close the modal after deletion
      }
    }
  };
  const handleResetPassword = async (UserID) => {
    try {
        const access_token = localStorage.getItem('access_token');
        if (!access_token) {
            message.error('Bạn cần đăng nhập để thực hiện thao tác này!');
            return;
        }

        const response = await fetch(`${API_URL}/auth/resetTeacherPassword?UserID=${UserID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();

        if (response.ok) {
            message.success(result.message || 'Mật khẩu đã được đặt lại thành công!');
        } else {
            message.error(result.message || 'Đặt lại mật khẩu thất bại!');
        }
    } catch (error) {
        console.error('Lỗi khi đặt lại mật khẩu:', error);
        message.error('Lỗi khi đặt lại mật khẩu!');
    }
};

const handleModalOk = async () => {
  try {
    const values = await form.validateFields();
    
    // Only proceed if there's an editing item
    if (editingItem) {
      const access_token = localStorage.getItem('access_token');

      // Assuming API expects UserID as a query parameter in the URL
      const response = await fetch(`${API_URL}/auth/updateTeacher?UserID=${editingItem.UserID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // Update the data with the new values
        setData(data.map(item => item.UserID === editingItem.UserID ? { ...item, ...values } : item));
        message.success('Cập nhật thông tin thành công!');
      } else {
        const errorData = await response.json();
        message.error(`Cập nhật thông tin thất bại! Lý do: ${errorData.message}`);
      }
    }

    // Reset the modal state
    setIsModalVisible(false);
    form.resetFields();
  } catch (error) {
    console.error('Lỗi trong quá trình xử lý modal:', error);
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
