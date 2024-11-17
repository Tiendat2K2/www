import React, { useState, useEffect } from 'react';
import { Table, Input, Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import '../../../assets/css/Login.css';
import API_URL from '../../../server/server';
import axios from 'axios';
const AdminThongTinGiaoVien = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/auth/getAllUsers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'Img',
      key: 'Img',
      render: (imageUrl) => {
        if (!imageUrl) return null;
        return (
          <Image
            src={imageUrl}
            alt="Teacher"
            style={{ width: 50, height: 50, objectFit: 'cover' }}
            fallback="data:image/png;base64,...fallback_image_base64_string..."
          />
        );
      },
    },
    {
      title: 'Mã giáo viên',
      dataIndex: 'MGV',
      key: 'MGV',
    },
    {
      title: 'Họ Tên',
      dataIndex: 'Hoten',
      key: 'Hoten',
    },
    {
      title: 'Ngày Sinh',
      dataIndex: 'Ngaysinh',
      key: 'Ngaysinh',
      render: (text) => (text ? new Date(text).toLocaleDateString('vi-VN') : 'N/A'),
    },
    {
      title: 'Nơi Sinh',
      dataIndex: 'Noisinh',
      key: 'Noisinh',
    },
    {
      title: 'Chuyên Ngành',
      dataIndex: 'Chuyenganh',
      key: 'Chuyenganh',
    },
    {
      title: 'Số Năm',
      dataIndex: 'Sonam',
      key: 'Sonam',
    },
    {
      title: 'Giới Tính',
      dataIndex: 'Gioitinh',
      key: 'Gioitinh',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'Std',
      key: 'Std',
    },
    {
      title: 'Tên Đơn Vị',
      dataIndex: 'Tendonvi',
      key: 'Tendonvi',
    },
    {
      title: 'Ngành',
      dataIndex: 'Nganh',
      key: 'Nganh',
    },
  ];

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  const filteredData = data.filter(item =>
    item.Hoten && item.Hoten.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2>Thông tin giáo viên</h2>
      <Input
        placeholder="Tìm kiếm theo tên..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={handleSearch}
        style={{ width: '300px', marginBottom: '20px' }}
      />
      <Table
      loading={loading}
  columns={columns}
  dataSource={filteredData}
 rowKey="MGV"
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
      
    </div>
  );
};
export default AdminThongTinGiaoVien;
