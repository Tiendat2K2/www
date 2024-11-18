import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Modal, Select ,message} from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined, 
  FileOutlined, 
  FilePdfOutlined, 
  FileWordOutlined, 
  SearchOutlined ,
  DeleteOutlined
} from '@ant-design/icons';
import '../../../assets/css/Login.css';
import { API_URL } from '../../../utils/api';
import {jwtDecode} from 'jwt-decode'; 
import axiosInstance from '../../../utils/axiosInstance';
import { refreshToken } from '../../../server/server';
const AdminBaiViet = () => {
  // Initialize states
  const [data, setData] = useState([]);
  const [chuyenNganhData, setChuyenNganhData] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState(null);
  const [filePreviewModal, setFilePreviewModal] = useState({ visible: false, fileUrl: '', fileName: '' });
  const [searchText, setSearchText] = useState('');
  const [selectedChuyenNganh, setSelectedChuyenNganh] = useState('all');
  const [loading, setLoading] = useState(false);
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchChuyenNganhData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get(`${API_URL}/auth/getDulieu`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data.dulieu);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch chuyên ngành data
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
  // Handle file download
  const handleDownload = async (id, fileName) => {
    try {
        const access_token = localStorage.getItem('access_token');
        if (!access_token) {
            message.error('Không tìm thấy access token');
            return;
        }

        const response = await axiosInstance.get(`${API_URL}/auth/downloadFile?ID=${id}`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
            responseType: 'blob', // Ensures that the response is a binary file
        });

        // Create a Blob from the file response
        const blob = new Blob([response.data], { type: response.headers['content-type'] });

        // Create an anchor element to download the file
        const link = document.createElement('a');
        const fileURL = window.URL.createObjectURL(blob);

        // Set the download attribute with the desired file name
        link.href = fileURL;
        link.download = fileName || 'downloaded-file'; // Fallback to 'downloaded-file' if no file name is provided
        link.click(); // Programmatically trigger the download

        // Clean up the object URL
        window.URL.revokeObjectURL(fileURL);

    } catch (error) {
        console.error('Download error:', error);
        message.error('Không thể tải xuống file');
    }
};

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
            },
            responseType: 'blob', // Ensures that the response is a binary file
        });

        // Handle different file types
        const fileType = response.headers['content-type']; // Determine file type from response headers

        if (!fileType || !fileType.startsWith('application/pdf')) {
            message.error('Không phải file PDF!');
            return;
        }

        const blob = new Blob([response.data], { type: fileType });
        const fileUrl = window.URL.createObjectURL(blob);
        window.open(fileUrl, '_blank'); // Open the file in a new tab

    } catch (error) {
        console.error('Preview error:', error);
        message.error('Không thể xem file');
    }
};

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // Handle chuyên ngành change
  const handleChuyenNganhChange = (value) => {
    setSelectedChuyenNganh(value);
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
  const showDeleteConfirm = (id) => {
    setDeletingRecordId(id);
    setIsDeleteModalVisible(true);
  };
  // Filter data based on search and chuyên ngành
  const filteredData = Array.isArray(data) ? data.filter(item => {
    if (!item || !item.Tieude) return false;
    const matchesSearch = item.Tieude.toLowerCase().includes(searchText.toLowerCase());
    const matchesChuyenNganh = selectedChuyenNganh === 'all' || item.ChuyenNganhID === selectedChuyenNganh;
    return matchesSearch && matchesChuyenNganh;
  }) : [];
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axiosInstance.delete(`${API_URL}/auth/deleteDulieu`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ID: deletingRecordId }  // Pass the ID as a query parameter
      });
      setData(data.filter(item => item.ID !== deletingRecordId));  // Remove the deleted record from the table
      setIsDeleteModalVisible(false);  // Close the delete confirmation modal
      message.success('Xóa thành công!');  // Display success message
    } catch (error) {
      console.error("Error deleting record:", error);
      message.error('Xóa thất bại!');  // Display error message
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
      key: 'files',
      render: (files, record) => files ? (
        <span>
          {getFileIcon(files)}
          <Button type="link" onClick={() => handleView(record.ID)}>
            <EyeOutlined /> Xem
          </Button>
          <Button type="link" onClick={() => handleDownload(record.ID, files.split('/').pop())}>
            <DownloadOutlined /> Tải xuống
          </Button>
        </span>
      ) : 'N/A',
    },
    {
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
          title="Xác nhận xóa"
          visible={isDeleteModalVisible}
          onOk={handleDelete}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa bài viết này không?</p>
        </Modal>
  
        <Modal
          title="Chi tiết File"
          visible={filePreviewModal.visible}
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
      </div>
    </div>
  );
  
};
export default AdminBaiViet;
