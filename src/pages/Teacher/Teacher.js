import React, { useEffect } from 'react';
import { Layout} from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomHeader from '../../components/Teacher/Header/Teacher.Header';
import CustomFooter from '../../components/Teacher/Footer/Teacher.Footer';
import CustomSider from '../../components/Teacher/Sider/Teacher.Sider';
import TeacherContent from '../../components/Teacher/Content/Teacher.Content';
import TeacherBaiViet from '../../components/Teacher/Content/Teacher.BaiViet';
import TeacherDanhSachBaiViet from '../../components/Teacher/Content/Teacher,DanhSachBaiViet'; // Correct import path
const Teacher = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Determine which page is currently active
  const isBaiVietPage = location.pathname === '/teacher/baiviet';
  const isDanhSachBaiVietPage = location.pathname === '/teacher/danhsachbaiviet'; // Check for DanhSachBaiViet page
  useEffect(() => {
  }, [navigate]);
  return (
    <Layout style={{ height: '100vh' }}>
      <CustomHeader />
      <Layout>
        <CustomSider />
        <Layout.Content style={{ padding: '20px', backgroundColor: '#fff' }}>
          {/* Conditional rendering based on the current path */}
          {isBaiVietPage ? (
            <TeacherBaiViet />
          ) : isDanhSachBaiVietPage ? (
            <TeacherDanhSachBaiViet />
          ) : (
            <TeacherContent />
          )}
        </Layout.Content>
      </Layout>
      <CustomFooter />
    </Layout>
  );
};
export default Teacher;
