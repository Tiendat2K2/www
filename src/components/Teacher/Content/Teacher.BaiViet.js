import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Modal, Form, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, FilePdfOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { API_URL } from '../../../utils/api';
import { jwtDecode } from 'jwt-decode'; 
import axiosInstance from '../../../utils/axiosInstance';
import { refreshToken } from '../../../server/server';

const TeacherBaiViet = () => {
  const [data, setData] = useState([]);
  const [chuyenNganhData, setChuyenNganhData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecordId, setDeletingRecordId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchData();
    fetchChuyenNganhData();
  }, []);

  const fetchData = async () => {
    try {
      const access_token = localStorage.getItem('access_token');
      const decodedToken = jwtDecode(access_token);
      const UserID = decodedToken.id;
      const response = await axiosInstance.get(`${API_URL}/auth/getDulieuByUserID?UserID=${UserID}`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      setData(response.data.dulieu);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchChuyenNganhData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`${API_URL}/auth/getChuyenNganh`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChuyenNganhData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axiosInstance.delete(`${API_URL}/auth/deleteDulieu`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ID: deletingRecordId }
      });
      setData(data.filter(item => item.ID !== deletingRecordId));
      setIsDeleteModalVisible(false);
      message.success('Xóa thành công!');
    } catch (error) {
      console.error("Error deleting record:", error);
      message.error('Xóa thất bại!');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedFile(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const access_token = localStorage.getItem('access_token');

      if (!access_token) {
        message.error('Không tìm thấy access token');
        return;
      }

      const decodedToken = jwtDecode(access_token);
      const userID = decodedToken.id;

      if (!userID) {
        message.error('Không tìm thấy User ID trong token');
        return;
      }

      const { ChuyenNganhID, ...otherValues } = values;

      if (!ChuyenNganhID) {
        message.error('Vui lòng chọn chuyên ngành!');
        return;
      }

      const formData = new FormData();
      formData.append('UserID', userID);
      formData.append('ChuyenNganhID', ChuyenNganhID);

      Object.keys(otherValues).forEach(key => {
        if (key !== 'Files') {
          formData.append(key, otherValues[key]);
        }
      });

      if (selectedFile) {
        formData.append('Files', selectedFile);
      } else if (!editingRecord) {
        message.error('Vui lòng chọn file PDF!');
        return;
      }

      let response;
      if (editingRecord) {
        response = await axiosInstance.put(`${API_URL}/auth/updateDulieu?ID=${editingRecord.ID}`, formData, {
          headers: { 
            'Authorization': `Bearer ${access_token}`, 
            'Content-Type': 'multipart/form-data' 
          }
        });
        message.success('Cập nhật thành công!');
      } else {
        response = await axiosInstance.post(`${API_URL}/auth/addDulieu`, formData, {
          headers: { 
            'Authorization': `Bearer ${access_token}`, 
            'Content-Type': 'multipart/form-data' 
          }
        });
        message.success('Thêm mới thành công!');
      }

      if (response.status === 200 || response.status === 201) {
        setIsModalVisible(false);
        setSelectedFile(null);
        form.resetFields();
        fetchData();
      }
    } catch (error) {
      console.error('Lỗi khi gửi form:', error);
      message.error('Có lỗi xảy ra khi xử lý yêu cầu!');
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
  

  const handleView = async (id) => {
    try {
      const access_token = localStorage.getItem('access_token');
      if (!access_token) {
        message.error('Không tìm thấy access token');
        return;
      }

      const response = await axiosInstance.get(`${API_URL}/auth/viewFile?ID=${id}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      });

      if (response.data.status !== 1) {
        message.error('Không thể lấy link xem file');
        return;
      }

      const viewUrl = response.data.data.viewUrl;
      if (!viewUrl) {
        message.error('Không thể lấy link xem file');
        return;
      }

      window.open(viewUrl, '_blank');
    } catch (error) {
      console.error('Preview error:', error);
      message.error('Không thể xem file');
    }
  };

  const showDeleteConfirm = (id) => {
    setDeletingRecordId(id);
    setIsDeleteModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setSelectedFile(null);
    setIsModalVisible(true);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = data.filter(item =>
    item.Tieude.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEdit = (record) => {
    setEditingRecord(record);
    setSelectedFile(null);
    setIsModalVisible(true);
    form.setFieldsValue({
      Tieude: record.Tieude,
      NhomTacGia: record.NhomTacGia,
      Tapchixuatban: record.Tapchixuatban,
      Thongtintamtapchi: record.Thongtintamtapchi,
      Namhoc: record.Namhoc,
      Ghichu: record.Ghichu,
      ChuyenNganhID: record.ChuyenNganhID,
    });
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'Tieude',
      key: 'Tieude',
    },
    {
      title: 'File',
      dataIndex: 'Files',
      key: 'Files',
      render: (files, record) => (
        <span>
          <FilePdfOutlined style={{ color: 'red' }} />
          <Button type="link" onClick={() => handleView(record.ID)}>
            <EyeOutlined /> Xem
          </Button>
          
        </span>
      ),
    },
    {
      title: 'Nhóm tác giả',
      dataIndex: 'NhomTacGia',
      key: 'Nhomtacgia',
    },
    {
      title: 'Tạp chí xuất bản',
      dataIndex: 'Tapchixuatban',
      key: 'Tapchiuatban',
    },
    {
      title: 'Thông tin mã tạp chí',
      dataIndex: 'Thongtintamtapchi',
      key: 'Thongtinmatpchi',
    },
    {
      title: 'Năm học',
      dataIndex: 'Namhoc',
      key: 'Namhoc',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'Ghichu',
      key: 'Ghichu',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button onClick={() => handleEdit(record)} icon={<EditOutlined />}>
            Sửa
          </Button>
          <Button 
            onClick={() => showDeleteConfirm(record.ID)} 
            icon={<DeleteOutlined />} 
            style={{ marginLeft: '8px' }}
          >
            Xóa
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h3 style={{ marginLeft: '20px', marginTop: '20px' }}>Bài Viết Giáo Viên</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Input
          placeholder="Tìm kiếm theo tên..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          style={{ width: '300px', marginBottom: '20px' }}
        />
        <Button type="primary" onClick={handleAdd} icon={<PlusOutlined />}>
          Thêm Bài Viết
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="ID"
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
        title={editingRecord ? 'Chỉnh sửa Bài Viết' : 'Thêm Bài Viết'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="Tieude" 
            label="Tiêu đề" 
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="Files"
            label="File PDF"
            rules={[{ 
              required: editingRecord ? false : true, 
              message: 'Vui lòng chọn file PDF!' 
            }]}
          >
            <div>
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      message.error('Sai định dạng file! Chỉ chấp nhận file PDF.');
                      e.target.value = '';
                      setSelectedFile(null);
                    } else {
                      setSelectedFile(file);
                    }
                  } else {
                    setSelectedFile(null);
                  }
                }}
                key={Date.now()}
              />
              {selectedFile && (
                <div style={{ marginTop: '8px', color: '#52c41a' }}>
                  File đã chọn: {selectedFile.name}
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item 
            name="NhomTacGia" 
            label="Nhóm tác giả" 
            rules={[{ required: true, message: 'Vui lòng nhập nhóm tác giả!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="Tapchixuatban" 
            label="Tạp chí xuất bản" 
            rules={[{ required: true, message: 'Vui lòng nhập tên tạp chí xuất bản!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="Thongtintamtapchi" 
            label="Thông tin mã tạp chí" 
            rules={[{ required: true, message: 'Vui lòng nhập thông tin mã tạp chí!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="Namhoc" 
            label="Chọn Năm"
            rules={[{ required: true, message: 'Vui lòng chọn năm học!' }]}
          >
            <Select placeholder="Chọn năm học">
              {Array.from({ length: 2025 - 2009 + 1 }, (_, i) => (
                <Select.Option key={2009 + i} value={2009 + i}>
                  {2009 + i}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="Ghichu" label="Ghi chú">
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="ChuyenNganhID"
            label="Chọn Chuyên ngành"
            rules={[{ required: true, message: 'Vui lòng chọn chuyên ngành!' }]}
          >
            <Select>
              {chuyenNganhData && chuyenNganhData.length > 0 ? (
                chuyenNganhData.map((item) => (
                  <Select.Option key={item.ChuyenNganhID} value={item.ChuyenNganhID}>
                    {item.TenChuyenNganh}
                  </Select.Option>
                ))
              ) : (
                <Select.Option value="" disabled>Không có chuyên ngành</Select.Option>
              )}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xóa Bài Viết"
        visible={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      >
        <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
      </Modal>
    </div>
  );
};

export default TeacherBaiViet;
