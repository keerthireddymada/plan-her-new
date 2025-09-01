import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const MainAppLayout = () => {
  return (
    <>
      <Outlet />
      <Navigation />
    </>
  );
};

export default MainAppLayout;