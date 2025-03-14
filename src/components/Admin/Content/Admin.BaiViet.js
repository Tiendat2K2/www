import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Modal, Select, message } from 'antd';
import { EyeOutlined, DownloadOutlined, FileOutlined, SearchOutlined,FilePdfOutlined,FileWordOutlined,DeleteOutlined } from '@ant-design/icons';
import { API_URL } from '../../../utils/api';
import {refreshToken}from '../../../server/server';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../../utils/axiosInstance';
const { Option } = Select; 
const TeacherDanhSachBaiViet = () => {
  // Initialize states
  const [data, setData] = useState([]);
  const [chuyenNganhData, setChuyenNganhData] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedChuyenNganh, setSelectedChuyenNganh] = useState('all');
  const [loading, setLoading] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState(null);
  
  // Initialize file preview modal state
  const [filePreviewModal, setFilePreviewModal] = useState({ visible: false, fileUrl: '', fileName: '' });

  const handleChuyenNganhChange = async (value) => {
    setSelectedChuyenNganh(value);
    await fetchData(value); // Gọi fetchData với ChuyenNganhID đã chọn
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchChuyenNganhData();
  }, []);

  const fetchData = async (chuyenNganhID = 'all') => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`${API_URL}/auth/getDulieu`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ChuyenNganhID: chuyenNganhID } // Thêm tham số ChuyenNganhID
      });
      setData(response.data.dulieu);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch chuyên ngành data
  const fetchChuyenNganhData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`${API_URL}/auth/getChuyenNganh`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChuyenNganhData(response.data); // Dữ liệu chuyên ngành
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle file download
  

  // Handle file preview
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

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Get file icon based on extension
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: 'red' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ color: 'blue' }} />;
      default:
        return <FileOutlined />;
    }
  };

  // Filter data based on search and chuyên ngành
  const filteredData = Array.isArray(data) ? data.filter(item => {
    if (!item || !item.Tieude) return false;
    const matchesSearch = item.Tieude.toLowerCase().includes(searchText.toLowerCase());
    const matchesChuyenNganh = selectedChuyenNganh === 'all' || item.ChuyenNganhID === selectedChuyenNganh;
    return matchesSearch && matchesChuyenNganh;
  }) : [];

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
  const showDeleteConfirm = (id) => {
    setDeletingRecordId(id);
    setIsDeleteModalVisible(true);
  };
  
  const handleDelete = async () => {
    setLoading(true); // Bắt đầu trạng thái loading
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.delete(`${API_URL}/auth/deleteDulieu`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ID: deletingRecordId },
      });
  
      if (response.status === 200) {
        // Xóa dữ liệu khỏi danh sách hiển thị
        setData((prevData) => prevData.filter((item) => item.ID !== deletingRecordId));
        message.success('Xóa thành công!');
      } else {
        message.error(response.data?.message || 'Xóa thất bại!');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      message.error('Đã xảy ra lỗi khi xóa!');
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
      setIsDeleteModalVisible(false); // Đóng modal
      setDeletingRecordId(null); // Reset ID
    }
  };
  // Table columns
  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'Tieude',
      key: 'tieuDe',
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
    },{
      title: 'Nhóm tác giả',
      dataIndex: 'NhomTacGia',
      key: 'nhomTacGia',
    },
    {
      title: 'Tạp chí xuất bản',
      dataIndex: 'Tapchixuatban',
      key: 'tapChiXuatBan',
    },
    {
      title: 'Thông tin mã tạp chí',
      dataIndex: 'Thongtintamtapchi',
      key: 'thongTinMaTapChi',
    },
    {
      title: 'Năm học',
      dataIndex: 'Namhoc',
      key: 'namHoc',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'Ghichu',
      key: 'ghiChu',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button onClick={() => showDeleteConfirm(record.ID)} icon={<DeleteOutlined />} style={{ marginLeft: '8px' }}>
            Xóa
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h3 style={{ marginLeft: '20px', marginTop: '20px' }}>Danh sách Bài Viết</h3>
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          marginBottom: '20px', 
          justifyContent: 'space-between',
          alignItems: 'center' 
        }}>
          <Input
            placeholder="Tìm kiếm theo tiêu đề..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: '300px' }}
          />
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={handleChuyenNganhChange}
          >
            <Option value="all">Tất cả</Option>
            {chuyenNganhData.map(chuyenNganh => (
              <Option key={chuyenNganh.ChuyenNganhID} value={chuyenNganh.ChuyenNganhID}>
                {chuyenNganh.TenChuyenNganh} {/* Hiển thị tên chuyên ngành */}
              </Option>
            ))}
          </Select>
        </div>
        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          rowKey="ID"
          pagination={{
            pageSize: 5,
          }}
          bordered
          style={{ backgroundColor: '#F0F0F0' }}
          className="custom-table"
        />
        <Modal
          title="Chi tiết File"
          open={filePreviewModal.visible}
          onCancel={() => setFilePreviewModal({ ...filePreviewModal, visible: false })}
          footer={[<Button key="back" onClick={() => setFilePreviewModal({ ...filePreviewModal, visible: false })}>Đóng</Button>]}
          width={800}
        >
          <iframe
            src={filePreviewModal.fileUrl}
            width="100%"
            height="500px"
            title="File Preview"
            style={{ border: 'none' }}
          />
        </Modal>
        <Modal
      title="Xác nhận xóa"
      visible={isDeleteModalVisible}
      onOk={handleDelete}
      onCancel={() => setIsDeleteModalVisible(false)}
      okText="Xóa"
      cancelText="Hủy"
    >
      <p>Bạn có chắc chắn muốn xóa bản ghi này không?</p>
    </Modal>
      </div>
    </div>
  );
};

export default TeacherDanhSachBaiViet;
