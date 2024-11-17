import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { useLocation} from 'react-router-dom';
import CustomHeader from '../../components/Admin/Header/Admin.Header';
import CustomFooter from '../../components/Admin/Footer/Admin.Footer';
import CustomSider from '../../components/Admin/Sider/Admin.Sider';
import AdminContent from '../../components/Admin/Content/Admin.Content';
import AdminBaiViet from '../../components/Admin/Content/Admin.BaiViet';
import AdminTenChuyenNganh from '../../components/Admin/Content/Admin.TenChuyenNganh';
import AdminNguoiDung from '../../components/Admin/Content/Admin.Nguoidung';
import AdminThongTinGiaoVien from '../../components/Admin/Content/Admin.ThongTinGiaoVien';
const Admin = () => {
  const location = useLocation();
  useEffect(() => {
  }, []);
  const currentPage = location.pathname;
  return (
    <Layout style={{ height: '100vh' }}>
      <CustomHeader />
      <Layout>
        <CustomSider />
        <Layout.Content style={{ padding: '20px', backgroundColor: '#fff' }}>
          {currentPage === '/admin/baiviet' && <AdminBaiViet />}
          {currentPage === '/admin/tenchuyennganh' && <AdminTenChuyenNganh />}
          {currentPage === '/admin/nguoidung' && <AdminNguoiDung />}
          {currentPage === '/admin/thongtingiaovien' && <AdminThongTinGiaoVien />}
          {currentPage === '/admin/taikhoan' && <AdminThongTinGiaoVien />}
          {currentPage !== '/admin/baiviet' &&
            currentPage !== '/admin/tenchuyennganh' &&
            currentPage !== '/admin/nguoidung' &&
            currentPage !== '/admin/thongtingiaovien' &&
            currentPage !== '/admin/taikhoan' && <AdminContent />}
        </Layout.Content>
      </Layout>
      <CustomFooter />
    </Layout>
  );
};
export default Admin;