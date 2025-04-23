import React, { useState, useEffect } from 'react';
import Buttons from 'ui-component/Button/Button';
import MainCard from 'ui-component/cards/MainCard';
import { Table, Form, Button } from 'antd';
import Search from 'ui-component/SearchFilter/Search';
import Apiservice from '../../Services/TechniciansService';
import moment from 'moment';
import { DatePicker } from 'rsuite';
import 'rsuite/DatePicker/styles/index.css';
import Loader from 'ui-component/Loader/Loader';
import { useNavigate } from "react-router-dom";

const TechnicianCompletedTask = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [completedDetails, setCompletedDetails] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [durationMinutes, setDurationMinutes] = useState('');
  // const [searchTerm, setSearchTerm] = useState('');
  const [durationHours, setFinalDurationHours] = useState('');
  const [ChemicalName, setChemicalName] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [finalPausedDatas, setFinalPausedDatas] = useState([]);
  const [pauseReasonData, setPauseRasonDaata] = useState([]);
  const [pauseDetails, setpauseDetails] = useState([]);
  const [loader,setLoader] = useState(false)
  const navigate = useNavigate();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("login") === 'true'; 
    if (!isLoggedIn) {
      navigate("/"); 
      return; 
    }
    getAllTasks();
  }, []);

  // useEffect(() => {
  //   handlePauseReason();
  // }, [data]);

  useEffect(() => {
    if (completedDetails?.customerAvailble) {
      const finalendtime = completedDetails.endTime;
      setEndTime(finalendtime);
      getTimeDiff();
    }
  }, [completedDetails, endTime]);


  const getTimeDiff = () => {
    const [hours1, minutes1] = startTime.split(':').map(Number);
    const [hours2, minutes2] = endTime.split(':').map(Number);

    let diffHours = hours2 - hours1;
    let diffMinutes = minutes2 - minutes1;

    if (diffMinutes < 0) {
      diffHours--;
      diffMinutes += 60;
    }

    setFinalDurationHours(diffHours);
    setDurationMinutes(diffMinutes);

    return { hours: diffHours, minutes: diffMinutes };
  };

  const pauseresdatas = [];

  const mappedData = data.map((item) => {
    if (item.QrCodeCategory.length > 0) {
      return item.QrCodeCategory[0];
    } else {
      return item.noqrcodeService[0];
    }
  });
  


  const subCategoryStatus = mappedData.map((category) => {
    return category.subCategoryStatus;
  });

  const pauseDetailsa = subCategoryStatus.map((status) => {
    return status;
  });

  const lastPauseData = pauseDetailsa.map((e) => {
    return e.map((item) => {
      return item.pauseDetails;
    });
  });

  for (let index = 0; index < lastPauseData.length; index++) {
    const element = lastPauseData[index][0];
    pauseresdatas.push(element);
  }

  useEffect(() => {
    if (pauseresdatas.length > 0) {
      setFinalPausedDatas(pauseresdatas);
    }

  }, [data]);

  const newdata = finalPausedDatas.map((e) => e.map((item) => item.pauseReason));

  useEffect(() => {
    setPauseRasonDaata(newdata);
  }, [finalPausedDatas]);

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
  

      const reversedData = completedTasks.reverse()
      
      setData(reversedData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoader(false);
    }
  };
  



  const columns = [
    {
      title: 'S.No',
      dataIndex: 'sNo',
      width: '5%',
      render: (_, __, index) => (current - 1) * pageSize + index + 1
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
                    <div className="fonts13 textLeft" style={{ fontWeight: '700',textAlign: 'left' }}>
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

              {QrCodeCategory?.length !=2 && record.serviceName && QrCodeCategory[0]?.category !="General Pest Control" &&(
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
                <div  className="mb-2">
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
      width: '13%'
    },
    {
      title: ' Technician Name',
      children: [
        {
          title: 'Technician Name',
          dataIndex: 'assignedTo',
          width: '10%',
          render: (_, record) => record.technicianDetails && `${record.technicianDetails.firstName} ${record.technicianDetails.lastName}`
        },
        {
          title: 'Technician-2',
          dataIndex: 'otherTechnicianName',
          width: '10%',
          editable: true,
          render: (_, record) => {
            const otherTechnicianNames = record.otherTechnicianName ? record.otherTechnicianName.split(',') : [];
            return (
              <>
                {otherTechnicianNames.length > 0 ? (
                  otherTechnicianNames.map((name, index) => (
                    <div key={index}>
                      {index + 1}. {name}
                    </div>
                  ))
                ) : (
                  '-'
                )}
              </>
            );
          }
        }
      ]
    },
    {
      title: 'Details',
      dataIndex: 'assignedTo',
      width: '12%',
      render: (_, record) => {
        const completedDate = record.technicianStartDate;
        const startDate = moment(record.startDate).format('DD-MM-YYYY');
        const startTime = record.technicianStartTime;
        setStartTime(startTime);
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

        const durationforwork = calculateDuration(startTime , endTimes);

        const alldatas = record?.QrCodeCategory?.length > 0
        ? record.QrCodeCategory?.map((e) => e.subCategoryStatus).flat()
        : record.noqrcodeService?.map((e) => e.subCategoryStatus).flat() ;
      

        //const subCategoryStatus = mappedData.pauseDetails;
        const alldata = []
        alldata.push(alldatas)
            const mapeddata =  alldata[0].map((data) => {return data.pauseDetails});

          const pauseDetailsa = mapeddata.flat();




        const timeStringToSeconds = (timeSting) => {
          const [hours, minutes, seconds] = timeSting.split(':').map(Number);
          return hours * 3600 + minutes * 60 + seconds;
        };

        // Calculate total pause time in seconds
        const totalPauseTimeInSeconds = pauseDetailsa?.reduce((totalSeconds, detail) => {
          return totalSeconds + timeStringToSeconds(detail?.pauseTiming);
        }, 0);

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
        

        const exactWorkingHours = calculateExactWorkingHours (  durationforwork, formattedDuration);
        
        return (
          <>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontWeight: '600' }}>Assigned Date :</span> {startDate}
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontWeight: '600' }}>Completed Date :</span> {completedDate}
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontWeight: '600' }}>Start Time :</span> {startTime}
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontWeight: '600' }}>End Time:</span> {record.completedDetails.endTime}
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span style={{ fontWeight: '600' }}>Total Working hrs </span>
             
                <div>{exactWorkingHours}</div>
            
            </div>
          </>
        );
      }
    },
    {
      title: 'Pause Reason and Time',
      dataIndex: 'pauseReason',
      width: '12%',
      render: (_, record) => {

        // const alldatas = record?.QrCodeCategory?.map((e)=> e.subCategoryStatus).flat()
       
        const alldatas = record?.QrCodeCategory?.length > 0
        ? record.QrCodeCategory.map((e) => e.subCategoryStatus).flat()
        : record.noqrcodeService?.map((e) => e.subCategoryStatus).flat() || [];
      

       

        const alldata = []
        alldata.push(alldatas)
        
            const mapeddata =  alldata[0].map((data) => {return data?.pauseDetails});

          const subCategoryStatus = mapeddata?.flat();

        // const pauseDetailsa = subCategoryStatus.map((data)=> data.pauseReason);

        const timeStringToSeconds = (timeString) => {
          const [hours, minutes, seconds] = timeString.split(':').map(Number);
          return hours * 3600 + minutes * 60 + seconds;
        };

        const secondsToTimeString = (totalSeconds) => {
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          return `${hours} Hrs ${minutes} minutes ${seconds} Sec`;
        };

        const totalPauseTimeInSeconds = subCategoryStatus.reduce((totalSeconds, detail) => {
          return totalSeconds + timeStringToSeconds(detail.pauseTiming);
        }, 0);

        const totalPauseTime = secondsToTimeString(totalPauseTimeInSeconds);

        return (
          <div>
            {subCategoryStatus &&
              subCategoryStatus.map((data, index) => (
                <div key={index} style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: '600' }}>{index + 1}.</span>  {data.pauseReason} - {data.pauseTiming}
                </div>
              ))}
            <div style={{ textAlign: 'center ', marginTop: '10px' }}>
              <span style={{ fontWeight: '600' }}>Total break hrs </span>
              <div>{totalPauseTime}</div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Chemicals Used',
      dataIndex: 'chemicalsName',
      width: '12%',
      render: (_, record) => {
        const chemicals = record.completedDetails.chemicalsName;
        return (
          <>
            <div>{chemicals.join(', ')}</div>
          </>
        );
      }
    },
    {
      title: 'Recommendation',
      dataIndex: 'recommendation',
      width: '10%',
      render: (_, record) => {
        const recommendation = record.completedDetails.recommendation;
        return (
          <>
            <div>{recommendation}</div>
          </>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '10%',
      fixed: 'right',
      // render: (text) => (text === 'completed' ? 'Completed' : 'Ongoing')
      render: () => <Button style={{ cursor: 'no-drop', backgroundColor: 'green', color: 'white' }}>Completed</Button>
    }
  ];

  const handleDateChange = (date) => {
    setSelectedDate(moment(date).format("DD-MM-YYYY"));
  };

  const clearFilter = () => {
    setSelectedDate(null);
  };

  useEffect(()=>{
    if(selectedDate === 'Invalid date'){
clearFilter()
getAllTasks()
    }
  },[selectedDate])

  const filteredData = selectedDate ? data?.filter((task) => task?.technicianStartDate === selectedDate) : data;

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

    <>  {loader && (
      <Loader show={loader}/>
      
    )} 
    <MainCard title=" Completed Tasks ">
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
        <Table
          bordered
          dataSource={filteredData}
          columns={columns}
          pagination={{
            onChange: (page, pageSize) => {
              console.log(page,pageSize)
              setCurrent(page);
              setPageSize(pageSize);
            },
          }}
          scroll={{
            x: 2000
          }}
        />
      </Form>
    </MainCard>
    </>
  );
};

export default TechnicianCompletedTask;