// import { Link } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';

// material-ui
// import { useTheme } from '@mui/material/styles';
import { Divider, Grid, } from '@mui/material';

// project imports
import AuthWrapper1 from '../AuthWrapper1';
import AuthCardWrapper from '../AuthCardWrapper';

import AuthRegister from '../auth-forms/AuthRegister';
// import AuthFooter from 'ui-component/cards/AuthFooter';

// assets

// ===============================|| AUTH3 - REGISTER ||=============================== //

const Register = () => {
  // const theme = useTheme();


  return (

    <MainCard title="Create Customers Login">
      <AuthWrapper1>
        <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
          <Grid item xs={12}>
            <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
              <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                <AuthCardWrapper>
                  <Grid container spacing={2} alignItems="center" justifyContent="center">


                    <Grid item xs={12}>
                      <AuthRegister />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Grid item container direction="column" alignItems="center" xs={12}>
                        {/* <Typography component={Link} to="/login" variant="subtitle1" sx={{ textDecoration: 'none' }}>
                      
                      </Typography> */}
                      </Grid>
                    </Grid>
                  </Grid>
                </AuthCardWrapper>
              </Grid>
            </Grid>
          </Grid>
          {/* <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
          <AuthFooter />
        </Grid> */}
        </Grid>
      </AuthWrapper1>
    </MainCard>
  );
};

export default Register;
