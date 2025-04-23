import React, { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import { Button } from '@mui/material';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import Loader from 'ui-component/Loader/Loader';
import ApiCustomers from '../../Services/CustomerServices';
import Apiservice from '../../Services/TechniciansService';
import { toast, ToastContainer } from 'react-toastify';
import { DatePicker } from 'rsuite';
import 'rsuite/DatePicker/styles/index.css';

const CustomerDetails = () => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [serviceData, setServiceData] = useState([]);
  const [filteredServiceData, setFilteredServiceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loader, setLoader] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("login") === 'true';
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    fetchCustomerDetails();
    fetchServiceReports();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = serviceData.filter(item => 
        moment(item.startDate).isSame(selectedDate, 'day')
      );
      setFilteredServiceData(filtered);
    } else {
      setFilteredServiceData(serviceData);
    }
  }, [selectedDate, serviceData]);

  const fetchCustomerDetails = async () => {
    setLoader(true);
    try {
      const response = await ApiCustomers.getCompany(id);
      if (response.status === 200) {
        setCustomerDetails(response.data.Result);
      } else {
        toast.error('Failed to fetch customer details');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.error('Error fetching customer details');
    } finally {
      setLoader(false);
    }
  };

  const openPdf = (pdfData) => {
    // Assuming pdfData is a Base64 string
    const byteCharacters = atob(pdfData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);

    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>PDF Viewer</title>
        </head>
        <body style="margin: 0;">
          <iframe src="${pdfUrl}" style="width:100%; height:100%;" frameborder="0"></iframe>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  const fetchServiceReports = async () => {
    setLoader(true);
    try {
      const response = await Apiservice.technicianTask();
      const tasks = response.data.Results;

      // Flatten tasks structure and filter by customer
      const flattenedTasks = tasks
        .flatMap(task =>
          task.technicians.flatMap(tech =>
            tech.tasks.map(t => ({
              ...t,
              key: t._id,
              premisesId: t.premisesId || task.premisesId || task.customerDetails?.premisesId || '',
              contractId: t.contractId || task.contractId || task.customerDetails?.contractId || '',
              companyName: t.companyName || task.customerDetails?.name || '',
              technicianDetails: {
                ...(t.technicianDetails || {}),
                ...(tech.technicianDetails || {})
              }
            }))
          )
        )
        .filter(task => task.status === 'completed')
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

      // Fetch customer details to match premisesId, contractId, or companyName
      const customerResponse = await ApiCustomers.getCompany(id);
      const customer = customerResponse.data.Result;

      const filteredTasks = flattenedTasks.filter(task =>
        task.premisesId === customer.premisesId ||
        task.contractId === customer.contractId ||
        task.companyName === customer.name
      );

      setServiceData(filteredTasks);
      setFilteredServiceData(filteredTasks);
    } catch (error) {
      console.error('Error fetching service reports:', error);
      toast.error('Error fetching service reports');
    } finally {
      setLoader(false);
    }
  };

  const formatServiceDetails = (services) => {
    if (!services || !services.length) return 'None';
    return services
      .map((service, i) => {
        const subCategories = service.subCategory?.join(', ') || 'None';
        return `${service.category}: ${subCategories}`;
      })
      .join('; ');
  };

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'sNo',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Service Name',
      dataIndex: 'QrCodeCategory',
      width: 200,
      render: (services, record) => {
        const allServices = [
          ...(services || []),
          ...(record.noqrcodeService || [])
        ];
        return formatServiceDetails(allServices);
      }
    },
    {
      title: 'Customer Name',
      dataIndex: 'companyName',
      width: 150,
      render: (name) => name || 'Unknown'
    },
    {
      title: 'Technician Name',
      dataIndex: 'technicianDetails',
      width: 150,
      render: (details) =>
        details?.firstName || details?.lastName
          ? `${details.firstName} ${details.lastName}`
          : 'Unassigned'
    },
    {
      title: 'Details',
      width: 250,
      render: (_, record) => {
        const startTime = record.technicianStartTime;
        const endTime = record.completedDetails?.endTime;
        const duration = calculateDuration(startTime, endTime);
        return (
          <div>
            <div><strong>Date:</strong> {moment(record.startDate).format('DD/MM/YYYY')}</div>
            <div><strong>Time:</strong> {startTime || '--:--'} to {endTime || '--:--'}</div>
            <div><strong>Duration:</strong> {duration}</div>
          </div>
        );
      }
    },
    {
      title: 'Action',
      width: '10%',
      dataIndex: 'action',
      fixed: 'right',
      render: (_, record) => {
        return (
          <div className="d-flex gap-3 justify-content-center">
            <span>
              <Button type="primary" onClick={() => openPdf(record.pdf)} className="tech-btn">
                View PDF
              </Button>
            </span>
          </div>
        );
      }
    }
  ];

  const calculateDuration = (start, end) => {
    if (!start || !end) return '00:00:00';
    const startTime = moment(start, 'HH:mm:ss');
    const endTime = moment(end, 'HH:mm:ss');
    const duration = moment.duration(endTime.diff(startTime));
    return [
      Math.floor(duration.asHours()).toString().padStart(2, '0'),
      duration.minutes().toString().padStart(2, '0'),
      duration.seconds().toString().padStart(2, '0')
    ].join(':');
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleClearDate = () => {
    setSelectedDate(null);
  };

  return (
    <>
      {loader && <Loader show={loader} />}
      <MainCard title="Customer Details">
        <div className="d-flex justify-content-end" style={{ position: 'relative', bottom: '10px' }}>
          <DatePicker 
            style={{ width: '150px', height: '30px' }} 
            placeholder="Search date" 
            onChange={handleDateChange} 
            format="dd-MM-yyyy" 
            value={selectedDate}
          />
          {selectedDate && (
            <Button 
              style={{ marginLeft: '10px', height: '30px' }} 
              onClick={handleClearDate}
            >
              Clear
            </Button>
          )}
        </div>
        {customerDetails && (
          <div style={{ marginBottom: '24px' }}>
            <div className="row">
              <div className="col-md-6">
                <p><strong>Name:</strong> {customerDetails.name}</p>
                <p><strong>Email:</strong> {customerDetails.email}</p>
                <p><strong>Phone:</strong> {customerDetails.phoneNumber || 'Null'}</p>
                <p><strong>Contract ID:</strong> {customerDetails.contractId || 'Null'}</p>
                <p><strong>Premises ID:</strong> {customerDetails.premisesId || 'Null'}</p>
                <p><strong>State:</strong> {customerDetails.state || 'Null'}</p>
                <p><strong>City:</strong> {customerDetails.city || 'Null'}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Service Frequency:</strong> {customerDetails.serviceFrequency || 'Null'}</p>
                <p><strong>Payment Type:</strong> {customerDetails.paymentType || 'Null'}</p>
                <p><strong>Payment Amount:</strong>
                  {customerDetails.paymentType === 'Yearly'
                    ? (customerDetails.yearlyPaymentAmount ? `$${customerDetails.yearlyPaymentAmount}` : 'Null')
                    : (customerDetails.monthlyPaymentAmount ? `$${customerDetails.monthlyPaymentAmount}` : 'Null')}
                </p>
                <p><strong>Address:</strong> {customerDetails.address || 'Null'}</p>
                <p><strong>Country:</strong> {customerDetails.country || 'Null'}</p>
                <p><strong>Created Date:</strong> {customerDetails.created_date ? moment(customerDetails.created_date).format('DD-MM-YYYY') : 'Null'}</p>
              </div>
            </div>
          </div>
        )}

        <h3>Service Reports</h3>
        <Table
          columns={columns}
          dataSource={filteredServiceData}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10 }}
          rowKey="_id"
          locale={{
            emptyText: 'No service reports found for this customer'
          }}
        />
      </MainCard>
      <ToastContainer />
    </>
  );
};

export default CustomerDetails;