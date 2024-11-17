import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const footerStyle = {
  with: '100%',
  height: 10,
  textAlign: 'center',
  color: '#fff',
  backgroundColor: 'rgb(240, 220, 194)',
};

const CustomFooter = () => (
  <Footer style={footerStyle}>Footer</Footer>
);

export default CustomFooter;
