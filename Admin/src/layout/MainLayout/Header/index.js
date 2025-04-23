import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Box, ButtonBase, Autocomplete, TextField } from '@mui/material';

// project imports
import LogoSection from '../LogoSection';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';

// assets
import { IconMenu2 } from '@tabler/icons';
import ApiCustomers from '../../../Services/CustomerServices';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (searchValue.length > 2) { // Only search when user has typed at least 3 characters
        setLoading(true);
        try {
          const response = await ApiCustomers.getCompany();
          if (response.data && response.data.Results) {
            const filteredCustomers = response.data.Results.filter(customer =>
              customer.name.toLowerCase().includes(searchValue.toLowerCase())
            );
            setCustomers(filteredCustomers);
          }
        } catch (error) {
          console.error('Error fetching customers:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setCustomers([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCustomers();
    }, 300); // Add debounce to avoid too many API calls

    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  const handleCustomerSelect = (event, value) => {
    if (value && value._id) {
      navigate(`/sample-page/customerdetails/${value._id}`);
      setSearchValue('');
      setCustomers([]);
    }
  };

  return (
    <>
      {/* logo & toggler button */}
      <Box
        sx={{
          zIndex: '1',
          width: 228,
          display: 'flex',
          [theme.breakpoints.down('md')]: {
            width: 'auto'
          }
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Avatar
            className='menuButton'
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              }
            }}
            onClick={handleLeftDrawerToggle}
            color="inherit"
          >
            <IconMenu2 stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>
      </Box>

      {/* header search */}
      <Box sx={{ flexGrow: 1, maxWidth: 500, mx: 2 }}>
        <Autocomplete
          freeSolo
          options={customers}
          getOptionLabel={(option) => option.name || ''}
          loading={loading}
          onChange={handleCustomerSelect}
          onInputChange={(event, newInputValue) => {
            setSearchValue(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search customers..."
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                ...params.InputProps,
                type: 'search',
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option._id}>
              {option.name}
            </li>
          )}
        />
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* notification & profile */}
      {/* <NotificationSection /> */}
      <ProfileSection />
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;