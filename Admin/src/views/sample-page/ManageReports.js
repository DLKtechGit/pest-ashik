import React, { useState, useEffect } from 'react';
import Buttons from 'ui-component/Button/Button';
import MainCard from 'ui-component/cards/MainCard';
import { Table, Form } from 'antd';
import Search from 'ui-component/SearchFilter/Search';
import Apiservice from '../../Services/TechniciansService';
import moment from 'moment';
import { Button } from '@mui/material';
import { DatePicker } from 'rsuite';
import 'rsuite/DatePicker/styles/index.css';
import Loader from 'ui-component/Loader/Loader';
import { useNavigate } from "react-router-dom";

const ManageReports = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loader, setLoader] = useState(false);
  const [completedDetails, setCompletedDetails] = useState([]);
  const [startTime, setStartTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("login") === 'true';
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    getAllTasks();
  }, []);

  const getAllTasks = async () => {
    setLoader(true);
    try {
      const AllTask = await Apiservice.technicianTask();
      const Tasks = AllTask.data.Results;
      const mergedTasks = Tasks.reduce((acc, curr) => {
        acc.push(...curr.technicians[0]?.tasks);
        return acc;
      }, []);
      const completedTasks = mergedTasks.filter((task) => task.status === 'completed');
      const sortedTasks = completedTasks.reverse();
      setData(sortedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
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

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'sNo',
      width: '5%',
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
      width: '10%'
    },
    {
      title: 'Technician Name',
      dataIndex: 'assignedTo',
      width: '10%',
      render: (_, record) => record.technicianDetails && `${record.technicianDetails.firstName} ${record.technicianDetails.lastName}`
    },
    {
      title: 'Details',
      dataIndex: 'assignedTo',
      width: '12%',
      render: (_, record) => {
        const startDate = record.technicianStartDate;
        const startTime = record.technicianStartTime;
        const endTime = record.endTime;
        const startTimes = record.technicianStartTime;
        setStartTime(startTimes);
        const endTimes = record.completedDetails.endTime;
        setCompletedDetails(endTimes);

        const calculateDuration = (start, end) => {
          const startTime = moment(start, 'HH:mm:ss');
          const endTime = moment(end, 'HH:mm:ss');
          const duration = moment.duration(endTime.diff(startTime));
          const hours = Math.floor(duration.asHours());
          const minutes = Math.floor(duration.asMinutes()) % 60;
          const seconds = Math.floor(duration.asSeconds()) % 60;
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };

        const durationforwork = calculateDuration(startTime, endTimes);

        const alldatas = record?.QrCodeCategory?.length > 0
          ? record.QrCodeCategory?.map((e) => e.subCategoryStatus).flat()
          : record.noqrcodeService?.map((e) => e.subCategoryStatus).flat();

        const alldata = [];
        alldata.push(alldatas);
        const mapeddata = alldata[0].map((data) => { return data.pauseDetails });
        const pauseDetailsa = mapeddata.flat();

        const timeStringToSeconds = (timeSting) => {
          const [hours, minutes, seconds] = timeSting.split(':').map(Number);
          return hours * 3600 + minutes * 60 + seconds;
        };

        const secondsToTimeString = (totalSeconds) => {
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          return `${hours} Hrs ${minutes} minutes ${seconds} Sec`;
        };

        const totalPauseTimeInSeconds = pauseDetailsa?.reduce((totalSeconds, detail) => {
          return totalSeconds + timeStringToSeconds(detail?.pauseTiming);
        }, 0);

        const totalPauseTime = secondsToTimeString(totalPauseTimeInSeconds);

        const formatDuration = (totalSeconds) => {
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };

        const formattedDuration = formatDuration(totalPauseTimeInSeconds);

        const calculateExactWorkingHours = (totalDuration, pauseDuration) => {
          const total = moment.duration(totalDuration);
          const pause = moment.duration(pauseDuration);
          const exactWorkingDuration = total.subtract(pause);
          const hours = String(Math.floor(exactWorkingDuration.asHours())).padStart(2, '0');
          const minutes = String(exactWorkingDuration.minutes()).padStart(2, '0');
          const seconds = String(exactWorkingDuration.seconds()).padStart(2, '0');
          return `${hours} Hrs ${minutes} Mins ${seconds} Sec`;
        };

        const exactWorkingHours = calculateExactWorkingHours(durationforwork, formattedDuration);

        return (
          <>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontWeight: '600' }}>Assigned Date :</span> {moment(record.startDate).format('DD-MM-YYYY')}
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontWeight: '600' }}>Completed Date :</span> {startDate}
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontWeight: '600' }}>Start Time :</span> {startTime}
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontWeight: '600' }}>End Time :</span> {record.completedDetails.endTime}
            </div>
            <div style={{ textAlign: 'left', marginTop: '10px' }}>
              <span style={{ fontWeight: '600' }}>Total Working hrs </span>
              <div>{exactWorkingHours}</div>
            </div>
            <div>
              {pauseDetailsa &&
                pauseDetailsa.map((data, index) => (
                  <div key={index} style={{ textAlign: 'left', marginTop: '10px' }}>
                    <span style={{ fontWeight: '600' }}>{index + 1}.</span> {data.pauseReason} - {data.pauseTiming}
                  </div>
                ))}
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontWeight: '600' }}>Total break hrs </span>
                <div>{totalPauseTime}</div>
              </div>
            </div>
          </>
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const clearFilter = () => {
    setSelectedDate(null);
  };

  const filteredData = selectedDate ? data.filter((task) => moment(task.startDate).isSame(selectedDate, 'day')) : data;

  const handleInputChange = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    if (searchTerm === '') {
      getAllTasks();
    } else {
      const filteredItems = data.filter((userdata) => userdata.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
      setData(filteredItems);
    }
  };

  return (
    <>
      {loader && <Loader show={loader} />}
      <MainCard title="Reports">
        <div className="d-flex justify-content-end" style={{ position: 'relative', bottom: '10px' }}>
          <DatePicker style={{ width: '150px', height: '30px' }} placeholder="Search date" onChange={handleDateChange} format="dd-MM-yyyy" />
          <Search
            onChange={handleInputChange}
            placeholder="Search Customer"
            value={searchTerm}
            style={{ width: '150px', height: '35px', marginLeft: '20px' }}
          />
        </div>
        <Form form={form} component={false}>
          <Table bordered dataSource={filteredData} columns={columns} pagination={{}} />
        </Form>
      </MainCard>
    </>
  );
};

export default ManageReports;