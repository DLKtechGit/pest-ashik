import { Grid } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import AdminAuthRegister from 'views/pages/authentication/auth-forms/AdminAuthRegister';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';

// ===============================|| AUTH3 - REGISTER ||=============================== //

const AdminRegister = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("login") === 'true'; 
    if (!isLoggedIn) {
      navigate("/"); 
      return; 
    }
  }, []);

  return (
    <MainCard title="Create Child Admin">
      <Grid container justifyContent="center" alignItems="center">
        <AdminAuthRegister />
      </Grid>
    </MainCard>
  );
};

export default AdminRegister;
