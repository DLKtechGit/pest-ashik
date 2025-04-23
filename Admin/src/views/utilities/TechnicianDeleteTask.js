import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Form, Button, Table } from 'antd';
import Search from 'ui-component/SearchFilter/Search';
import Apiservice from '../../Services/TechniciansService';
import moment from 'moment';
import { DatePicker } from 'rsuite';
import 'rsuite/DatePicker/styles/index.css';
import Loader from 'ui-component/Loader/Loader';
import { useNavigate } from "react-router-dom";

const TechnicianDeleteTask = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("login") === 'true'; 
    if (!isLoggedIn) {
      navigate("/"); 
      return; 
    }
    getDeletedTasks();
  }, []);

  const getDeletedTasks = async () => {
    setLoader(true);
    try {
      const response = await Apiservice.getDeletedTasks();
      const deletedTasks = response.data.Results;
      const sortedTasks = deletedTasks.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
      setData(sortedTasks);
    } catch (error) {
      console.error('Error fetching deleted tasks:', error);
    } finally {
      setLoader(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const filteredData = selectedDate 
    ? data.filter((task) => moment(task.startDate).isSame(selectedDate, 'day')) 
    : data;

  const handleInputChange = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    if (searchTerm === '') {
      getDeletedTasks();
    } else {
      const filteredItems = data.filter((userdata) => 
        userdata.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setData(filteredItems);
    }
  };

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'sNo',
      width: '3%',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Service Name',
      dataIndex: 'QrCodeCategory',
      width: '8%',
      render: (QrCodeCategory, record) => (
        <>
          {QrCodeCategory && QrCodeCategory.length > 0 ? (
            <>
              {QrCodeCategory.map((serviceName, index) => (
                <div key={index} className="mb-2">
                  <div>
                    <div className="fonts13 textLeft" style={{ fontWeight: '700', textAlign: 'left' }}>
                      {serviceName.category} :
                    </div>
                    {serviceName.subCategory.map((subItem, subIndex) => (
                      <div key={subIndex} className="d-flex flex-row justify-content-between align-items-center">
                        <div className="d-flex align-items-center fonts13 textLeft">
                          {subIndex + 1}. {subItem}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ textAlign: 'left' }}>
                {record?.noqrcodeService?.map((serviceName, index) => (
                  <div key={index} className="mb-2">
                    <div>
                      <div className="fonts13 textLeft" style={{ fontWeight: '700' }}>
                        {serviceName.category} :
                      </div>
                    </div>
                  </div>
                ))}

                {QrCodeCategory?.length !== 2 && record.serviceName && QrCodeCategory[0]?.category !== "General Pest Control" && (
                  <div className="mb-2">
                    {record.serviceName.map((data, index) => (
                      <div key={index} className="d-flex flex-row justify-content-between align-items-center">
                        <div className="d-flex align-items-center fonts13 textLeft">
                          {index + 1}. {data}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'left' }}>
              {record?.noqrcodeService && (
                <>
                  <div className="mb-2">
                    <div>
                      <div className="fonts13 textLeft" style={{ fontWeight: '700' }}>
                        {record?.noqrcodeService[0]?.category} :
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    {record?.noqrcodeService[0]?.subCategory.map((data, index) => (
                      <div key={index} className="d-flex flex-row justify-content-between align-items-center">
                        <div className="d-flex align-items-center fonts13 textLeft">
                          {index + 1}. {data}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )
    },
    {
      title: 'Customer Name',
      dataIndex: 'companyName',
      width: '8%'
    },
    {
      title: 'Technician Name',
      children: [
        {
          title: 'Technician Name',
          dataIndex: 'technicianDetails',
          width: '8%',
          render: (technicianDetails) => technicianDetails && `${technicianDetails.firstName} ${technicianDetails.lastName}`
        },
        {
          title: 'Technician-2',
          dataIndex: 'otherTechnicianName',
          width: '8%',
          render: (otherTechnicianName) => otherTechnicianName ? otherTechnicianName : '-'
        }
      ]
    },
    {
      title: 'Details',
      dataIndex: 'details',
      width: '6%',
      render: (_, record) => (
        <>
          <div style={{ textAlign: "left" }}><span style={{ fontWeight: "600" }}>Assigned Date :</span> {moment(record.startDate).format('DD-MM-YYYY')}</div>
          <div style={{ textAlign: "left" }}><span style={{ fontWeight: "600" }}>Start Date :</span> {record.technicianStartDate}</div>
          <div style={{ textAlign: "left" }}><span style={{ fontWeight: "600" }}>Start Time :</span> {record.technicianStartTime}</div>
        </>
      )
    },
    {
      title: 'QR Code Available',
      dataIndex: 'available',
      width: '10%'
    },
    {
      title: 'Pause Reason',
      dataIndex: 'pauseReason',
      width: '12%'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '5%',
      fixed: 'right',
      render: () => <Button style={{ cursor: 'no-drop', backgroundColor: '#FF4D4F', color: 'white' }}>Deleted</Button>
    },
    {
      title: 'Deleted At',
      dataIndex: 'deletedAt',
      width: '8%',
      fixed: 'right',
      render: (deletedAt) => moment(deletedAt).format('DD-MM-YYYY HH:mm')
    }
  ];

  return (
    <>
      {loader && <Loader show={loader}/>}
      <MainCard title="Deleted Tasks">
        <div className="d-flex justify-content-end" style={{ position: 'relative', bottom: '10px' }}>
          <DatePicker 
            style={{ width: '150px', height: '30px' }} 
            placeholder="Search date" 
            onChange={handleDateChange} 
            format="dd-MM-yyyy" 
          />
          <Search
            onChange={handleInputChange}
            placeholder="Search Customer"
            value={searchTerm}
            style={{ width: '150px', height: '35px', marginLeft: '20px' }}
          />
        </div>
        <Form form={form} component={false}>
          <Table
            bordered
            dataSource={filteredData}
            columns={columns}
            pagination={{}}
            scroll={{
              x: 2000
            }}
          />
        </Form>
      </MainCard>
    </>
  );
};

export default TechnicianDeleteTask;