import React, { useState, useEffect, useRef } from 'react';
import { Table, Form, Tag } from 'antd';
import MainCard from 'ui-component/cards/MainCard';
import Buttons from 'ui-component/Button/Button';
import Search from 'ui-component/SearchFilter/Search';
import ApiCustomers from '../../Services/CustomerServices';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Modal from 'react-bootstrap/Modal';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  useMediaQuery
} from '@mui/material';
import * as Yup from 'yup';
import { Formik } from 'formik';
import AnimateButton from 'ui-component/extended/AnimateButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast, ToastContainer } from 'react-toastify';
import Loader from 'ui-component/Loader/Loader';
import { useNavigate } from "react-router-dom";

const CustomerListTable = () => {
  const [Show, setShow] = useState(false);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef(null);
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const [showPassword, setShowPassword] = useState(false);
  const [namefetch, setNamefetch] = useState('');
  const [emailfetch, setEmailfetch] = useState('');
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("login") === 'true';
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    getCustomersList();
  }, []);

  const handleInputChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    if (searchTerm === '') {
      getCustomersList();
    } else {
      const filteredItems = data.filter((userdata) =>
        (userdata.name && userdata.name.toLowerCase().includes(searchTerm)) ||
        (userdata.email && userdata.email.toLowerCase().includes(searchTerm)) ||
        (userdata.phoneNumber && userdata.phoneNumber.toLowerCase().includes(searchTerm)) ||
        (userdata.contractId && userdata.contractId.toLowerCase().includes(searchTerm)) ||
        (userdata.premisesId && userdata.premisesId.toLowerCase().includes(searchTerm)) ||
        (userdata.serviceFrequency && userdata.serviceFrequency.toLowerCase().includes(searchTerm)) ||
        (userdata.status && userdata.status.toLowerCase().includes(searchTerm)) ||
        (userdata.expiryDate && moment(userdata.expiryDate).format('DD/MM/YYYY').includes(searchTerm))
      );
      setData(filteredItems);
    }
  };

  const getCustomersList = async () => {
    setLoader(true);
    try {
      const getCustomers = await ApiCustomers.getCompany();
      const customerData = getCustomers.data.Results;
      
      // Update status based on expiry date if needed and format expiry date
      const updatedData = customerData.map(customer => {
        let status = customer.status;
        if (!status || customer.expiryDate) {
          const currentDate = new Date();
          const expiryDate = new Date(customer.expiryDate);
          status = expiryDate <= currentDate ? 'Inactive' : 'Active';
        }
        
        return {
          ...customer,
          status: status || 'Unknown',
          formattedExpiryDate: customer.expiryDate ? moment(customer.expiryDate).format('DD/MM/YYYY') : 'Not set'
        };
      });

      const sortedData = updatedData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setData(sortedData);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoader(false);
    }
  };

  const handleShow = async (_id, email, name) => {
    setNamefetch(name);
    setEmailfetch(email);
    setShow(true);
  };

  const handleViewDetails = (id) => {
    navigate(`/sample-page/customerdetails/${id}`);
  };

  const onSubmit = async (_id, { setErrors, setStatus, setSubmitting, resetForm }) => {
    setLoader(true);
    try {
      const response = await ApiCustomers?.RegisterCustomer(_id);
      if (response && response.status === 200) {
        resetForm();
        setStatus({ success: true });
        setSubmitting(false);
        toast.success(response?.data?.message);
        setShow(false);
      } else {
        const errorMessage = response?.data?.message;
        setStatus({ success: false });
        setErrors({ submit: errorMessage });
        setSubmitting(false);
        toast.error(errorMessage);
        setShow(false);
      }
    } catch (err) {
      console.error(err);
      setStatus({ success: false });
      setErrors({ submit: err });
      setSubmitting(false);
      toast.error(err);
    }
    setLoader(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'sNo',
      width: '5%',
      render: (_, record, index) => index + 1
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '12%',
      fixed: 'left'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '15%'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '8%',
      render: (status, record) => {
        // If status is not set, calculate it based on expiry date
        let currentStatus = status;
        if ((!status || status === 'Unknown') && record.expiryDate) {
          const currentDate = new Date();
          const expiryDate = new Date(record.expiryDate);
          currentStatus = expiryDate <= currentDate ? 'Inactive' : 'Active';
        }
        
        const color = currentStatus === 'Active' ? 'green' : 'red';
        return (
          <Tag color={color} key={currentStatus}>
            {currentStatus?.toUpperCase() || 'Unknown'}
          </Tag>
        );
      }
    },
    {
      title: ' ON Expiry',
      dataIndex: 'expiryDate',
      width: '10%',
      render: (date, record) => (
        <span>
          {record.formattedExpiryDate}
        </span>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      width: '10%',
      render: (phone) => phone || 'Null'
    },
    {
      title: 'Contract ID',
      dataIndex: 'contractId',
      width: '10%',
      render: (contractId) => contractId || 'Null'
    },
    {
      title: 'Premises ID',
      dataIndex: 'premisesId',
      width: '10%',
      render: (premisesId) => premisesId || 'Null'
    },
    {
      title: 'Service Frequency',
      dataIndex: 'serviceFrequency',
      width: '10%',
      render: (frequency) => frequency || 'Null'
    },
    {
      title: 'Payment Type',
      dataIndex: 'paymentType',
      width: '10%',
      render: (type) => type || 'Null'
    },
   
   
    {
      title: 'Action',
      width: '10%',
      dataIndex: 'action',
      fixed: 'right',
      render: (_, record) => (
        <div className="d-flex gap-3 justify-content-center">
          <Button
            type="primary"
            onClick={() => handleShow(record._id, record.email, record.name)}
            className="tech-btn"
            // disabled={record.status === 'Inactive'}
          >
            Create Login
          </Button>
          <Button
            type="primary"
            onClick={() => handleViewDetails(record._id)}
            className="tech-btn"
          >
            View Details
          </Button>
        </div>
      )
    }
  ];

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const formattedData = data.map((item, index) => ({
      'S.No': index + 1,
      Name: item.name,
      Email: item.email,
      Phone: item.phoneNumber || 'Null',
      'Contract ID': item.contractId || 'Null',
      'Premises ID': item.premisesId || 'Null',
      'Service Frequency': item.serviceFrequency || 'Null',
      'Payment Type': item.paymentType || 'Null',
      'Expiry Date': item.formattedExpiryDate,
      'Status': item.status || (item.expiryDate ? 
        (new Date(item.expiryDate) < new Date() ? 'Inactive' : 'Active') : 'Unknown'),
      'Payment Amount': item.paymentType === 'Yearly'
        ? (item.yearlyPaymentAmount || 'Null')
        : (item.monthlyPaymentAmount || 'Null')
    }));

    const content = {
      startY: 10,
      head: [['S.No', 'Name', 'Email', 'Phone', 'Contract ID', 'Premises ID', 'Service Frequency', 'Payment Type', 'Expiry Date', 'Status', 'Payment Amount']],
      body: []
    };

    formattedData.forEach((item) => {
      content.body.push(Object.values(item));
    });

    pdf.autoTable({
      ...content,
      styles: { overflow: 'linebreak' },
      columnStyles: {
        0: { columnWidth: 10 },
        1: { columnWidth: 25 },
        2: { columnWidth: 35 },
        3: { columnWidth: 20 },
        4: { columnWidth: 20 },
        5: { columnWidth: 20 },
        6: { columnWidth: 25 },
        7: { columnWidth: 20 },
        8: { columnWidth: 20 },
        9: { columnWidth: 15 },
        10: { columnWidth: 20 }
      }
    });

    pdf.save('CustomerData.pdf');
  };

  return (
    <>
      {loader && <Loader show={loader} />}
      <MainCard title="Customers List">
        <div className="d-flex justify-content-end" style={{ position: 'relative', bottom: '10px' }}>
          <Buttons onClick={downloadPDF}>Download</Buttons>
          <Search
            onChange={handleInputChange}
            placeholder="Search customers..."
            value={searchTerm}
            style={{ width: '250px', marginLeft: '20px' }}
          />
        </div>
        <Form form={form} component={false}>
          <div ref={tableRef}>
            <Table
              bordered
              dataSource={data}
              columns={columns}
              rowClassName="editable-row"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1800 }}
            />
          </div>
        </Form>

        {/* Create Login Modal */}
        <Modal className="modal d-flex align-items-center" show={Show} onHide={handleClose}>
          <Modal.Header className="modalhead" closeButton>
            <Modal.Title>Create Login</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modalbody">
            <div>
              <Formik
                initialValues={{
                  name: namefetch,
                  email: emailfetch,
                  password: '',
                  submit: null
                }}
                validationSchema={Yup.object().shape({
                  email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
                  password: Yup.string().max(255).required('Password is required')
                })}
                onSubmit={onSubmit}
              >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                  <form noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={matchDownSM ? 0 : 2}>
                      <Grid item xs={12} sm={12}>
                        <TextField
                          fullWidth
                          disabled
                          label="Name"
                          margin="normal"
                          name="fname"
                          type="text"
                          value={namefetch}
                          sx={{ ...theme.typography.customInput }}
                        />
                      </Grid>
                    </Grid>
                    <FormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ ...theme.typography.customInput }}>
                      <InputLabel htmlFor="outlined-adornment-email-register">Email Address / Username</InputLabel>
                      <OutlinedInput
                        disabled
                        id="outlined-adornment-email-register"
                        type="email"
                        value={values.email}
                        name="email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        inputProps={{}}
                      />
                      {touched.email && errors.email && (
                        <FormHelperText error id="standard-weight-helper-text--register">
                          {errors.email}
                        </FormHelperText>
                      )}
                    </FormControl>

                    <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ ...theme.typography.customInput }}>
                      <InputLabel htmlFor="outlined-adornment-password-register">Password</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password-register"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        name="password"
                        label="Password"
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              size="large"
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                        inputProps={{}}
                      />
                    </FormControl>

                    <Box sx={{ mt: 3, mb: 3 }}>
                      <AnimateButton>
                        <Button
                          className="tech-btn"
                          disableElevation
                          disabled={isSubmitting}
                          fullWidth
                          size="large"
                          type="submit"
                          variant="contained"
                          color="secondary"
                        >
                          Create login
                        </Button>
                      </AnimateButton>
                    </Box>
                  </form>
                )}
              </Formik>
            </div>
          </Modal.Body>
        </Modal>

        <ToastContainer />
      </MainCard>
    </>
  );
};

export default CustomerListTable;