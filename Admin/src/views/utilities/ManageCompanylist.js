import React, { useState, useEffect, useRef } from 'react';
import { Table, Form, Tag, DatePicker } from 'antd';
import MainCard from 'ui-component/cards/MainCard';
import Buttons from 'ui-component/Button/Button';
import Search from 'ui-component/SearchFilter/Search';
import ApiAllCompanys from '../../Services/CustomerServices';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Modal from 'react-bootstrap/Modal';
import * as Yup from 'yup';
import { Formik, Field, ErrorMessage } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { IconTrash, IconEdit } from '@tabler/icons';
import Loader from 'ui-component/Loader/Loader';
import Mudule from 'ui-component/module/Mudule';
import { useNavigate } from "react-router-dom";

const CustomerListTable = () => {
  // State declarations
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState('');
  const [deletedCompany, setDeletedCompany] = useState('');
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [contractId, setContractId] = useState('');
  const [premisesId, setPremisesId] = useState('');
  const [serviceFrequency, setServiceFrequency] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [yearlyAmount, setYearlyAmount] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState(null);
  const [status, setStatus] = useState('Active');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  // Dropdown options
  const serviceFrequencyOptions = [
    { value: 'Monthly once', label: 'Monthly once' },
    { value: 'Monthly twice', label: 'Monthly twice' },
    { value: '6 months once', label: '6 months once' },
    { value: 'Yearly once', label: 'Yearly once' },
    { value: 'Yearly twice', label: 'Yearly twice' }
  ];

  const paymentTypeOptions = [
    { value: 'Yearly', label: 'Yearly Payment' },
    { value: 'Monthly', label: 'Monthly Payment' }
  ];

  // Load customers on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("login") === 'true'; 
    if (!isLoggedIn) {
      navigate("/"); 
      return; 
    }
    fetchCustomers();
  }, []);

  // Fetch customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await ApiAllCompanys.getCompany();
      const sortedData = response?.data?.Results?.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      ) || [];
      setCustomers(sortedData);
    } catch (error) {
      toast.error('Failed to load customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === '') {
      fetchCustomers();
    } else {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        (customer.contractId && customer.contractId.toLowerCase().includes(term)) ||
        (customer.premisesId && customer.premisesId.toLowerCase().includes(term)) ||
        (customer.expiryDate && moment(customer.expiryDate).format('DD/MM/YYYY').includes(term))
      );
      setCustomers(filtered);
    }
  };

  // Open edit modal with customer data
  const openEditModal = (customer) => {
    setCurrentCustomerId(customer._id);
    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phoneNumber);
    setAddress(customer.address);
    setCity(customer.city);
    setState(customer.state);
    setCountry(customer.country);
    setContractId(customer.contractId || '');
    setPremisesId(customer.premisesId || '');
    setServiceFrequency(customer.serviceFrequency || '');
    setPaymentType(customer.paymentType || '');
    setYearlyAmount(customer.yearlyPaymentAmount || '');
    setMonthlyAmount(customer.monthlyPaymentAmount || '');
    setExpiryDate(customer.expiryDate ? moment(customer.expiryDate) : null);
    setStatus(customer.status || 'Active');

    const countryObj = Country.getAllCountries().find(c => c.name === customer.country);
    const stateObj = countryObj ? 
      State.getStatesOfCountry(countryObj.isoCode).find(s => s.name === customer.state) : 
      null;

    setSelectedCountry(countryObj);
    setSelectedState(stateObj);
    setShowEditModal(true);
  };

  // Handle expiry date change
  const handleExpiryDateChange = (date, setFieldValue) => {
    setExpiryDate(date);
    setFieldValue('expiryDate', date);
    
    // Update status based on expiry date
    const currentDate = new Date();
    const newStatus = date && date < currentDate ? 'Inactive' : 'Active';
    setStatus(newStatus);
    setFieldValue('status', newStatus);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await ApiAllCompanys.EditCustomer({
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
        status: status,
        id: currentCustomerId
      });
      
      if (response.status === 200) {
        toast.success('Customer updated successfully');
        setShowEditModal(false);
        fetchCustomers();
      } else {
        toast.error(response.data?.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.message || 'Error updating customer');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await ApiAllCompanys.DeleteCustomer(currentCustomerId);
      if (response.status === 200) {
        toast.success('Customer deleted successfully');
        setShowDeleteModal(false);
        fetchCustomers();
      } else {
        toast.error(response.data?.message || 'Delete failed');
      }
    } catch (error) {
      toast.error(error.message || 'Error deleting customer');
    } finally {
      setLoading(false);
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    const pdf = new jsPDF();
    const headers = [
      '#', 
      'Name', 
      'Email', 
      'Phone', 
      'Contract ID', 
      'Premises ID',
      'Payment Type',
      'Amount',
      'Service Frequency',
      'Expiry Date',
      'Status'
    ];
    
    const data = customers.map((customer, index) => [
      index + 1,
      customer.name,
      customer.email,
      customer.phoneNumber || 'N/A',
      customer.contractId || 'N/A',
      customer.premisesId || 'N/A',
      customer.paymentType || 'N/A',
      customer.paymentType === 'Yearly' ? 
        (customer.yearlyPaymentAmount ? `$${customer.yearlyPaymentAmount}` : 'N/A') :
        (customer.monthlyPaymentAmount ? `$${customer.monthlyPaymentAmount}` : 'N/A'),
      customer.serviceFrequency || 'N/A',
      customer.expiryDate ? moment(customer.expiryDate).format('DD/MM/YYYY') : 'N/A',
      customer.status || 'Active'
    ]);

    pdf.autoTable({
      head: [headers],
      body: data,
      styles: { overflow: 'linebreak' },
      columnStyles: {
        0: { columnWidth: 8 },
        1: { columnWidth: 25 },
        2: { columnWidth: 35 },
        3: { columnWidth: 20 },
        4: { columnWidth: 20 },
        5: { columnWidth: 20 },
        6: { columnWidth: 20 },
        7: { columnWidth: 15 },
        8: { columnWidth: 25 },
        9: { columnWidth: 20 },
        10: { columnWidth: 15 }
      },
      margin: { top: 10 }
    });

    pdf.save('Customers_Export.pdf');
  };

  // Table columns
  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      width: '5%',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '12%'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '15%'
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      width: '10%',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Contract ID',
      dataIndex: 'contractId',
      width: '10%',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Premises ID',
      dataIndex: 'premisesId',
      width: '10%',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Payment',
      width: '12%',
      render: (_, record) => (
        <div>
          <div>{record.paymentType || 'N/A'}</div>
          <div>
            {record.paymentType === 'Yearly' ? 
              (record.yearlyPaymentAmount ? `$${record.yearlyPaymentAmount}` : 'N/A') :
              (record.monthlyPaymentAmount ? `$${record.monthlyPaymentAmount}` : 'N/A')}
          </div>
        </div>
      )
    },
    {
      title: 'Service Frequency',
      dataIndex: 'serviceFrequency',
      width: '10%',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Expiry Date',
      width: '10%',
      render: (_, record) => (
        <span>
          {record.expiryDate ? moment(record.expiryDate).format('DD/MM/YYYY') : 'N/A'}
        </span>
      )
    },
    {
      title: 'Status',
      width: '8%',
      render: (_, record) => {
        const color = record.status === 'Active' ? 'green' : 'red';
        return (
          <Tag color={color} key={record.status}>
            {record.status?.toUpperCase() || 'ACTIVE'}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      width: '10%',
      render: (_, record) => (
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => openEditModal(record)}
          >
            <IconEdit size={16} />
          </button>
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => {
              setCurrentCustomerId(record._id);
              setShowDeleteModal(true);
            }}
          >
            <IconTrash color='white' size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      {loading && <Loader show={loading} />}
      
      <MainCard title="Customer Management">
        <div className="d-flex justify-content-between mb-3">
          <Search
            placeholder="Search customers..."
            onChange={handleSearch}
            value={searchTerm}
            style={{ width: '300px' }}
          />
          <Buttons onClick={exportToPDF}>Export PDF</Buttons>
        </div>

        <Table
          columns={columns}
          dataSource={customers}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1500 }}
          loading={loading}
          bordered
        />

        {/* Edit Customer Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Customer</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formik
              initialValues={{
                name,
                email,
                phoneNumber: phone,
                address,
                country,
                state,
                city,
                contractId,
                premisesId,
                serviceFrequency,
                paymentType,
                yearlyPaymentAmount: yearlyAmount,
                monthlyPaymentAmount: monthlyAmount,
                expiryDate: expiryDate,
                status: status
              }}
              validationSchema={Yup.object().shape({
                name: Yup.string().required('Required'),
                email: Yup.string().email('Invalid email').required('Required'),
                phoneNumber: Yup.string().required('Required'),
                contractId: Yup.string().required('Required'),
                premisesId: Yup.string().required('Required'),
                paymentType: Yup.string().required('Required'),
                expiryDate: Yup.date().required('Expiry date is required'),
                yearlyPaymentAmount: Yup.number().when('paymentType', {
                  is: 'Yearly',
                  then: Yup.number().required('Required').positive('Must be positive')
                }),
                monthlyPaymentAmount: Yup.number().when('paymentType', {
                  is: 'Monthly',
                  then: Yup.number().required('Required').positive('Must be positive')
                })
              })}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue, handleSubmit, errors, touched }) => (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Name*</label>
                        <Field 
                          name="name" 
                          className={`form-control ${errors.name && touched.name ? 'is-invalid' : ''}`} 
                        />
                        <ErrorMessage name="name" component="div" className="invalid-feedback" />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Email*</label>
                        <Field 
                          name="email" 
                          type="email" 
                          className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`} 
                        />
                        <ErrorMessage name="email" component="div" className="invalid-feedback" />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Phone*</label>
                        <PhoneInput
                          country={'bh'}
                          value={values.phoneNumber}
                          onChange={(phone) => setFieldValue('phoneNumber', phone)}
                          inputClass={`form-control ${errors.phoneNumber && touched.phoneNumber ? 'is-invalid' : ''}`}
                        />
                        <ErrorMessage name="phoneNumber" component="div" className="invalid-feedback" />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Contract ID*</label>
                        <Field 
                          name="contractId" 
                          className={`form-control ${errors.contractId && touched.contractId ? 'is-invalid' : ''}`} 
                        />
                        <ErrorMessage name="contractId" component="div" className="invalid-feedback" />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Premises ID*</label>
                        <Field 
                          name="premisesId" 
                          className={`form-control ${errors.premisesId && touched.premisesId ? 'is-invalid' : ''}`} 
                        />
                        <ErrorMessage name="premisesId" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Payment Type*</label>
                        <Select
                          options={paymentTypeOptions}
                          value={paymentTypeOptions.find(opt => opt.value === values.paymentType)}
                          onChange={(opt) => {
                            setFieldValue('paymentType', opt.value);
                            setFieldValue('yearlyPaymentAmount', '');
                            setFieldValue('monthlyPaymentAmount', '');
                          }}
                          className={`${errors.paymentType && touched.paymentType ? 'is-invalid' : ''}`}
                          classNamePrefix="select"
                        />
                        <ErrorMessage name="paymentType" component="div" className="invalid-feedback" />
                      </div>

                      {values.paymentType === 'Yearly' && (
                        <div className="mb-3">
                          <label className="form-label">Yearly Amount ($)*</label>
                          <Field 
                            name="yearlyPaymentAmount" 
                            type="number" 
                            className={`form-control ${errors.yearlyPaymentAmount && touched.yearlyPaymentAmount ? 'is-invalid' : ''}`} 
                          />
                          <ErrorMessage name="yearlyPaymentAmount" component="div" className="invalid-feedback" />
                        </div>
                      )}

                      {values.paymentType === 'Monthly' && (
                        <div className="mb-3">
                          <label className="form-label">Monthly Amount ($)*</label>
                          <Field 
                            name="monthlyPaymentAmount" 
                            type="number" 
                            className={`form-control ${errors.monthlyPaymentAmount && touched.monthlyPaymentAmount ? 'is-invalid' : ''}`} 
                          />
                          <ErrorMessage name="monthlyPaymentAmount" component="div" className="invalid-feedback" />
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label">Expiry Date*</label>
                        <DatePicker
                          className={`form-control ${errors.expiryDate && touched.expiryDate ? 'is-invalid' : ''}`}
                          value={values.expiryDate}
                          onChange={(date) => handleExpiryDateChange(date, setFieldValue)}
                          format="DD/MM/YYYY"
                          style={{ width: '100%' }}
                        />
                        <ErrorMessage name="expiryDate" component="div" className="invalid-feedback" />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <div className="form-control">
                          <Tag color={status === 'Active' ? 'green' : 'red'}>
                            {status?.toUpperCase()}
                          </Tag>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Service Frequency</label>
                        <Select
                          options={serviceFrequencyOptions}
                          value={serviceFrequencyOptions.find(opt => opt.value === values.serviceFrequency)}
                          onChange={(opt) => setFieldValue('serviceFrequency', opt.value)}
                          classNamePrefix="select"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button 
                      type="button" 
                      className="btn btn-secondary me-2" 
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Mudule
          modalTitle="Confirm Delete"
          modalContent="Are you sure you want to delete this customer? This action cannot be undone."
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />

        <ToastContainer position="top-right" autoClose={5000} />
      </MainCard>
    </>
  );
};

export default CustomerListTable;