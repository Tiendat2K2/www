import React, { useState, useEffect } from 'react';
import { Table, Input, message, Modal, Form, Button } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import '../../../assets/css/Login.css';
import { API_URL } from '../../../utils/api';
import {jwtDecode} from 'jwt-decode'; 
import { refreshToken } from '../../../server/server';
const AdminTenChuyenNganh = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);
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
      key: 'stt',
      render: (_, __, index) => index + 1, // Adding index as serial number
    },
    {
      title: 'Tên Chuyên Ngành',
      dataIndex: 'TenChuyenNganh',
      key: 'TenChuyenNganh',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
            ghost
          >
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.ChuyenNganhID)} // Using ChuyenNganhID for delete
            danger
            ghost
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const access_token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/auth/getChuyenNganh`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (response.ok && result) {
        setData(result); // Set data from server response
      } else {
        message.error('Không thể tải dữ liệu chuyên ngành');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false); // Set loading to false when the request finishes
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = data.filter((item) =>
    item.TenChuyenNganh.toLowerCase().includes(searchText.toLowerCase())
  );

  const showModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({ TenChuyenNganh: item.TenChuyenNganh });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleEdit = (item) => {
    showModal(item);
  };

  const handleModalOk = async () => {
    try {
        const access_token = localStorage.getItem('access_token');

        if (!access_token) {
            message.error('Vui lòng đăng nhập lại');
            return;
        }

        const decodedToken = jwtDecode(access_token);

        if (!decodedToken || !decodedToken.id) {
            message.error('Thông tin người dùng không hợp lệ');
            return;
        }

        const UserID = decodedToken.id;

        // Validate form
        const values = await form.validateFields();
        values.UserID = UserID;

        const apiEndpoint = editingItem
            ? `${API_URL}/auth/updateChuyenNganh?ChuyenNganhID=${editingItem.ChuyenNganhID}`
            : `${API_URL}/auth/addChuyenNganh`;

        const method = editingItem ? 'PUT' : 'POST';

        const response = await fetch(apiEndpoint, {
            method,
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });

        // Parse response
        const result = await response.json();

        if (response.status === 400) {
            // Hiển thị lỗi từ backend (Tên chuyên ngành đã tồn tại)
            message.error(result.message || 'Thao tác thất bại');
            return;
        }

        if (result.status === 1) {
            message.success(editingItem ? 'Cập nhật chuyên ngành thành công' : 'Thêm chuyên ngành thành công');
            fetchData();
        } else {
            message.error(result.message || 'Thao tác thất bại');
        }

        setIsModalVisible(false);
    } catch (error) {
        message.error(error.message || 'Vui lòng kiểm tra lại thông tin');
        console.error(error);
    }
};

const handleDelete = (ChuyenNganhID) => {
  // Hiển thị modal xác nhận
  Modal.confirm({
    title: 'Bạn có chắc chắn muốn xóa chuyên ngành này?',  // Tiêu đề modal
    content: 'Hành động này không thể hoàn tác.',  // Nội dung modal
    okText: 'Xóa',  // Text của nút xác nhận
    cancelText: 'Hủy',  // Text của nút hủy
    onOk: async () => {  // Nếu người dùng nhấn "Xóa"
      try {
        const access_token = localStorage.getItem('access_token');
        // API URL with query parameter
        const response = await fetch(`${API_URL}/auth/deleteChuyenNganh?ChuyenNganhID=${ChuyenNganhID}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (response.status === 500) {
          // Handle server error (500)
          message.error('Lỗi từ máy chủ, vui lòng thử lại sau!');
        } else if (result.status === 1) {  // Kiểm tra kết quả trả về từ API
          // Cập nhật lại dữ liệu sau khi xóa
          setData(data.filter(item => item.ChuyenNganhID !== ChuyenNganhID));
          message.success('Xóa chuyên ngành thành công!');  // Hiển thị thông báo thành công
        } else {
          message.error(result.message || 'Xóa chuyên ngành thất bại!');  // Hiển thị thông báo thất bại
        }
      } catch (error) {
        message.error('Có lỗi xảy ra khi xóa chuyên ngành!');  // Hiển thị thông báo lỗi khi có sự cố
        console.error(error);  // Log error for debugging
      }
    },
    onCancel: () => {
      message.info('Hành động xóa đã bị hủy!');  // Thông báo khi hủy xóa
    },
  });
};

  return (
    <div style={{ padding: '20px' }}>
      <h2>Quản lý Chuyên Ngành</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Input
          placeholder="Tìm kiếm theo tên..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          style={{ width: '300px', marginBottom: '20px' }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm Chuyên Ngành
        </Button>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={filteredData}
        rowKey="ChuyenNganhID" // Use ChuyenNganhID as the key
        pagination={{
          pageSize: 5,
        }}
        bordered
        style={{
          backgroundColor: '#F0F0F0',
          marginTop: '20px',
        }}
        className="custom-table"
      />

      <Modal
        title={editingItem ? "Cập nhật Chuyên Ngành" : "Thêm Chuyên Ngành"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="TenChuyenNganh"
            label="Tên Chuyên Ngành"
            rules={[{ required: true, message: 'Vui lòng nhập tên chuyên ngành' }]}
          >
            <Input placeholder="Nhập tên chuyên ngành" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTenChuyenNganh;
