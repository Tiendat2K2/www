import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreAddOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const CustomSider = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState('1');

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
    const routes = {
      '1': '/admin',
      '2': '/admin/baiviet',
      '3': '/admin/tenchuyennganh',
      '4': '/admin/nguoidung',
      '5': '/admin/taikhoan',
      '6': -1,
    };
    navigate(routes[e.key]);
  };

  const menuItemStyle = (key) => ({
    backgroundColor: selectedKey === key ? 'white' : '#F0DCC2',
  });

  return (
    <Sider width="200" style={{ backgroundColor: '#F0DCC2' }}>
      <Menu mode="inline" selectedKeys={[selectedKey]} onClick={handleMenuClick}>
        <Menu.Item key="1" style={menuItemStyle('1')} icon={<DashboardOutlined />}>
          Dashboard
        </Menu.Item>
        <Menu.Item key="2" style={menuItemStyle('2')} icon={<FileTextOutlined />}>
          Bài viết giáo viên
        </Menu.Item>
        <Menu.Item key="3" style={menuItemStyle('3')} icon={<AppstoreAddOutlined />}>
          Tên chuyên ngành
        </Menu.Item>
        <Menu.Item key="4" style={menuItemStyle('4')} icon={<UserOutlined />}>
          Tài khoản người dùng
        </Menu.Item>
        <Menu.Item key="5" style={menuItemStyle('5')} icon={<UserOutlined />}>
          Thông tin giáo viên
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default CustomSider;
