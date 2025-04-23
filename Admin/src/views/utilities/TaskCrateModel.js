import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router';
import Modal from 'react-bootstrap/Modal';
import { DatePicker } from 'antd';
import ApiAllServices from '../../Services/AllServices';
import ApiAllCompanies from '../../Services/CustomerServices';
import ApiTechnician from '../../Services/TechniciansService';
import ApiCategoryServices from '../../Services/Categoryservices';
import ApiQrcode from '../../Services/Qrcode';

import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';
import { CiCircleMinus } from 'react-icons/ci';
import Select from 'react-select';
import Button from 'react-bootstrap/Button';
import Loader from 'ui-component/Loader/Loader';

const TaskCreateModel = () => {
  const { technicianId } = useParams();
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [status, setStatus] = useState('');
  const [Allcompany, setAllCompany] = useState([]);
  const [companyName, setCompany] = useState('');
  const [Allservices, setAllServices] = useState([]);
  const [serviceName, setServices] = useState('');
  const [description, setDescriprtion] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignedTo, setAssignedTO] = useState('');
  const [startDate, setStartDate] = useState('');
  const [customerId, setCustomerId] = useState();
  const [customerQrcode, setCustomerQrcodes] = useState([]);
  const [available, setAvailable] = useState('N/A');
  const [inputFields, setInputFields] = useState([]);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [service, setService] = useState();
  const [qrTitle, setqrTitle] = useState();
  const [titles, setTitles] = useState();
  const [numQRCodes, setNumofQr] = useState();
  const [selectedOptions, setSelectedOptions] = useState();
  const [selectedCompanyData, setSelectedCompanyData] = useState();
  const [qrDetails, setQrDetails] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('');
  const [category, setCategory] = useState('');
  const [qrServiceName, setQRServiceName] = useState('');
  const [categoryName, setCategoryName] = useState();
  const [subCategory, setSubCategory] = useState('');
  const [selectedQrDetails, setSelectedQrDetails] = useState([]);
  const [filtered, setFilterdata] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subCategoriesStatus, setSubCategoryStatus] = useState('');
  const [rodentSubCatStatus, setRodentSubCatStatus] = useState('');
  const [allQravailable, setAllQravailable] = useState('');
  const [loader, setLoader] = useState(false);
  const [productServices, setProductServices] = useState([]); // State for product services

  useEffect(() => {
    if (customerQrcode.length == 1) {
      customerQrcode.map((e) => {
        const qr = e.serviceName;
        setAllQravailable(qr);
      });
    }
    else if(customerQrcode.length == 0){
      setAllQravailable('');
    }
    console.log('allQravailable',allQravailable);
  }, [customerQrcode]);

  useEffect(() => {
    getCategoryData();
    fetchProductServices(); // Fetch product services when component mounts
  }, []);

  useEffect(() => {
    let Status = 'start';
    setStatus(Status);
    setAssignedTO(technicianId);
  }, [technicianId]);

  useEffect(() => {
    if (location.state && location.state.data) {
      setSelectedTechnician(location.state.data);
      setIsModalOpen(true);
    } else {
      fetchTechDetails();
    }
    getAllData();
  }, [location.state, technicianId]);

  useEffect(() => {
    if (customerId) {
      getqrcode();
    }
  }, [customerId]);

  useEffect(() => {
    getQravailable();
  }, [customerQrcode]);

  useEffect(() => {
    if (isModalOpen) {
      setServices('');
    }
  }, [isModalOpen]);

  // Function to fetch product services
  const fetchProductServices = async () => {
    setLoader(true);
    try {
      const response = await ApiAllServices.getProductServices();
      const services = response.data.Results;
      
      // Extract product names from the services
      const productNames = services.flatMap(service => 
        service.productName.map(name => ({
          value: name,
          label: name
        }))
      );
      
      setProductServices(productNames);
    } catch (error) {
      console.error('Error fetching product services:', error);
      toast.error('Failed to fetch product services');
    } finally {
      setLoader(false);
    }
  };

  const fetchTechDetails = async () => {
    setLoader(true);
    try {
      const response = await ApiTechnician.technicianList(technicianId);
      setSelectedTechnician(response.data);
    } catch (error) {
      console.error('Error fetching technician details:', error);
    } finally {
      setLoader(false);
    }
  };

  const getOptions = () => {
    const baseOptions = [
      { value: 'General Pest Control', label: 'General Pest Control' },
      { value: 'Products', label: 'Products' }
    ];

    if (customerQrcode.length === 2) {
      return [
        ...baseOptions,
        { value: 'Rodent Pro', label: 'Rodent Pro' }
      ];
    } else if (allQravailable === 'General Pest Control') {
      return [
        { value: 'General Pest Control', label: 'General Pest Control' },
        { value: 'Products', label: 'Products' }
      ];
    } else if (allQravailable === 'Rodent Pro') {
      return [
        { value: 'Rodent Pro', label: 'Rodent Pro' },
        { value: 'General Pest Control', label: 'General Pest Control' },
        { value: 'Products', label: 'Products' }
      ];
    } else if (customerQrcode.length === 0) {
      return [
        { value: 'General Pest Control', label: 'General Pest Control' },
        { value: 'Products', label: 'Products' }
      ];
    } else {
      return baseOptions;
    }
  };

  const getqrcode = async () => {
    setLoader(true);
    try {
      const res = await ApiQrcode.GetQrcodes();
      console.log('qr',res);
      const qrcode = res.data.data;
      const customerQrcode = qrcode.filter((qr) => qr.customerId === customerId);
      setCustomerQrcodes(customerQrcode);

      const qrServiceNames = customerQrcode.map((data) => data.serviceName);
      setQRServiceName(qrServiceNames);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setLoader(false);
    }
  };

  const getAllData = async () => {
    await getAllCompanies();
    await getAllServices();
  };

  const getAllCompanies = async () => {
    setLoader(true);
    try {
      const response = await ApiAllCompanies.getCompanys();
      // The backend now only returns active companies, so no need for additional filtering
      const registeredCompanies = response.data.Results;
      setAllCompany(registeredCompanies);
      
      // Additional check if needed
      const activeCompanies = registeredCompanies.filter(company => 
        company.status === 'Active' && !company.deleted
      );
      setAllCompany(activeCompanies);
      
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch active companies');
    } finally {
      setLoader(false);
    }
  };


  const getCategoryData = async () => {
    setLoader(true);

    try {
      const serviceData = await ApiCategoryServices.GetCateogry();
      const mainCategories = serviceData?.data?.Results.filter((service) => service.categoryType === 'main');

      const services = mainCategories.map((service, index) => ({
        ...service,
        key: service._id
      }));
      setCategory(services);
    } catch (error) {
      console.error('Error fetching service data:', error);
      toast.error('Failed to fetch service data');
    } finally {
      setLoader(false);
    }
  };

  const getAllServices = async () => {
    setLoader(true);

    try {
      const response = await ApiAllServices.ListServices();
      setAllServices(response.data.Results);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoader(false);
    }
  };

  const handleOk = () => {
    CreateTechnicianTask();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    navigate('/tech/create/task');
  };

  const handlecompanyChange = (selectedOption) => {
    if (selectedOption) {
      setCompany(selectedOption.value);
      setCustomerId(selectedOption._id);
      getQravailable();
    }
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  
    if (selectedOption) {
      setCategoryName(selectedOption.label);
    }
  
    const selectedCat = selectedOption.map((data) => data.label);
    setSelectedCategory(selectedCat);
  
    // Reset subcategory if "General Pest Control" is removed
    if (!selectedCat.includes("General Pest Control")) {
      setSubCategory(''); // Reset subcategory
      setInputFields([])
    }
    
    const isSelectedCategoryInQrServiceName = selectedCat.some((category) => qrServiceName.includes(category));
    if (isSelectedCategoryInQrServiceName) {
      const selectedCategoriesDetails = selectedOption.filter((option) => selectedCat.includes(option.label));
  
      const filteredQrDetails = qrDetails.filter((qr) => selectedCat.includes(qr.serviceName));
  
      const selectedQrDetails = filteredQrDetails.filter((qr) => selectedCat.includes(qr.serviceName));
      setSelectedQrDetails(selectedQrDetails);
    }
  };

  const handleSubCategoryChange = (selectedOption, categoryLabel) => {
    if (selectedOption) {
      if (categoryLabel === 'Products') {
        // For Products category, use the fetched product services
        const selectedSubCategory = selectedOption.value;
        if (!inputFields.some((field) => field.serviceName === selectedSubCategory)) {
          setInputFields([...inputFields, { serviceName: selectedSubCategory }]);
        }
        setSubCategory(selectedOption.value);
      } else {
        // For other categories (General Pest Control)
        const selectedSubCategory = selectedOption.value;
        if (!inputFields.some((field) => field.serviceName === selectedSubCategory)) {
          setInputFields([...inputFields, { serviceName: selectedSubCategory }]);
        }
        setSubCategory(selectedOption.value);
      }
    }
  };

  const onChange = (datestring) => {
    setStartDate(datestring);
  };

  const CreateTechnicianTask = async () => {
    setLoader(true);
    try {
      if (!companyName || !startDate || !description || !technicianId || selectedCategory.length === 0) {
        toast.error('All fields are required');
        setSelectedOption('');
        setSubCategory('');
        setInputFields([])
        setIsModalOpen(true);
        return;
      }
      else if((selectedCategory.includes('General Pest Control') && !subCategory) || 
              (selectedCategory.includes('Products') && !subCategory)) {
        toast.error('All fields are required');
        setIsModalOpen(true);
        return;
      }
      
      const serviceNames = inputFields.map((field) => field.serviceName);
      let subCategoryStatus = [];
      let categories = {
        category: 'General Pest Control'
      };
      
      const arrayMap = serviceNames.map((data) => {
        let obj = {
          subCategory: data,
          status: false,
          skip: false
        };
        subCategoryStatus.push(obj);
      });
      
      let categorySubcategoriesArray = [];
      let productSubcategoriesArray = [];

      // Handle General Pest Control category
      if (selectedCategory.includes('General Pest Control')) {
        const categorySubcategories = {
          category: 'General Pest Control',
          subCategory: inputFields.map((field) => field.serviceName),
          subCategoryStatus: subCategoryStatus
        };
        categorySubcategoriesArray.push(categorySubcategories);
      }

      // Handle Products category
      if (selectedCategory.includes('Products')) {
        const productSubcategories = {
          category: 'Products',
          subCategory: inputFields.filter(field => 
            productServices.some(prod => prod.value === field.serviceName)
          ).map(field => field.serviceName),
          subCategoryStatus: subCategoryStatus.filter(status => 
            productServices.some(prod => prod.value === status.subCategory)
          )
        };
        productSubcategoriesArray.push(productSubcategories);
      }

      let rodentArr = [];
      if (selectedCategory.includes('Rodent Pro')) {
        let rodentobj = {
          subCategory: 'Rodent Pro',
          status: false,
          skip: false
        };
        rodentArr.push(rodentobj);
        setRodentSubCatStatus(rodentArr);
      }

      const selectedOptions = selectedOption.map((service) => service.label);
      const categorySubcategoryArray = qrServiceName && qrServiceName.map((category, index) => {
        if (selectedOptions.includes(category) && category !== 'Rodent Pro' && category !== 'Products') {
          return {
            category: category,
            subCategory: inputFields.map((field) => field.serviceName),
            subCategoryStatus: subCategoryStatus
          };
        } else if (selectedOptions.includes(category) && category === 'Rodent Pro') {
          return {
            category: category,
            subCategory: 'Rodent Pro',
            subCategoryStatus: rodentArr
          };
        } else if (selectedOptions.includes(category) && category === 'Products') {
          return {
            category: category,
            subCategory: inputFields.filter(field => 
              productServices.some(prod => prod.value === field.serviceName)
            ).map(field => field.serviceName),
            subCategoryStatus: subCategoryStatus.filter(status => 
              productServices.some(prod => prod.value === status.subCategory)
            )
          };
        }
      });
      
      const filtered = categorySubcategoryArray.filter((item) => item != null);
      const filteredData = filtered && filtered.map((data) => data.category);
      setFilterdata(filteredData);

      if(customerQrcode && customerQrcode.length > 0) {
        if(customerQrcode.length == 1) {
          const cate_name = customerQrcode.map((data) => data.serviceName);
        } else {
          categorySubcategoriesArray = [];
        }
      }

      const taskDetails = {
        serviceName: serviceNames,
        noqrcodeService: [...categorySubcategoriesArray, ...productSubcategoriesArray],       
        QrCodeCategory: filtered,
        mainCategory: selectedOption.label,
        qrDetails: selectedQrDetails,
        companyName,
        startDate,
        description,
        status,
        customerId,
        available,
        titles,
        qrTitle,
        numQRCodes
      };
      
      const obj = {
        customerId,
        technicianId,
        taskDetails
      };
      
      await ApiTechnician.createTechnicianTask(obj);
      toast.success('Task Created Successfully');
      navigate('/tech/assigned/task');
    } catch (error) {
      console.error('Error creating task:', error.message);
      toast.error('Failed to create task. Please try again later.');
    } finally {
      setLoader(false);
    }
  };

  const getQravailable = () => {
    const qrDetail = customerQrcode.map((data) => {
      return {
        serviceName: data.serviceName,
        titles: data.titles,
        qrTitle: data.qrTitle
      };
    });
    setQrDetails(qrDetail);
    setqrTitle(qrDetail.qrTitle);
    setTitles(qrDetail.titles);
    setNumofQr(qrDetail.numQRCodes);
    const hasAvailableQrCodes = customerQrcode.some((qr) => qr.available === 'YES');
    setAvailable(hasAvailableQrCodes ? 'Yes' : 'N/A');
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      cursor: 'pointer',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      cursor: 'pointer',
    }),
    option: (provided, state) => ({
      ...provided,
      cursor: 'pointer',
      backgroundColor: state.isSelected ? '#f2f2f2' : 'transparent',
      '&:hover': {
        backgroundColor: '#e6e6e6',
      },
      color: state.isSelected ? 'blue' : 'black',
      fontWeight: state.isSelected ? 'bold' : 'normal',
      padding: 10,
    }),
  };

  return (
    <div>
      {loader && <Loader show={loader} />}
      <Modal show={isModalOpen} onHide={handleOk} size="lg" style={{ fontFamily: 'Poppins', fontSize: '14px' }}>
        <Modal.Header closeButton onHide={handleCancel}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: '600' }}>Create Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            {selectedTechnician && (
              <div className="mt-4">
                <div className="d-flex gap-4">
                  <div className="col-3">
                    <div style={{ fontWeight: '500' }}>Technician Name</div>
                  </div>
                  <h6>:</h6>
                  <p>
                    {selectedTechnician.firstName} {selectedTechnician.lastName}
                  </p>
                </div>
                <div className="d-flex gap-4">
                  <div className="col-3">
                    <div style={{ fontWeight: '500' }}>Technician Email</div>
                  </div>
                  <h6>:</h6>
                  <p>{selectedTechnician.email}</p>
                </div>
                <div className="d-flex gap-4">
                  <div className="col-3">
                    <div style={{ fontWeight: '500' }}>Technician Phone</div>
                  </div>
                  <h6>:</h6>
                  <p>{selectedTechnician.phoneNumber}</p>
                </div>
              </div>
            )}
            <div className=" col-12 d-flex gap-4 mt-3">
              <div className="col-3 d-flex align-items-center">
                <div style={{ fontWeight: '500' }}>Customer Name</div>
              </div>
              <h6 className="d-flex align-items-center">:</h6>

              <div className="col-4">
                <Select
                  options={Allcompany.map((company) => ({ value: company.name, label: company.name, _id: company._id }))}
                  onChange={handlecompanyChange}
                  value={selectedCompanyData}
                  isSearchable={true}
                />
              </div>

              <div className="col-12 d-flex align-items-center">
                <button style={{ fontSize: '13px' }} id="cbt" onClick={() => navigate('/add/details')} className="btn btn-primary">
                  Add New Customer
                </button>
              </div>
            </div>

            <div className="col-12 d-flex gap-4 mt-4">
              <div className="col-3">
                <div style={{ fontWeight: '500' }}>QR Code Available?</div>
              </div>
              <h6>:</h6>
              {available}
            </div>

            <div className="col-12 d-flex gap-4 mt-4">
              <div className="col-3">
                <div style={{ fontWeight: '500' }}>No.of QR Codes</div>
              </div>
              <h6>:</h6>
              <div className="d-flex flex-column">
                {customerQrcode && customerQrcode.length > 0 ? (
                  customerQrcode.map((qr, index) => (
                    <div className="d-flex flex-column">
                      <p key={index}>
                        {qr.serviceName} - {qr.titles.length}{' '}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>N/A</p>
                )}
              </div>
            </div>
            <div className="col-12 d-flex gap-4 mt-4">
              <div className="col-3 d-flex align-items-center">
                <div style={{ fontWeight: '500' }}>Select Category</div>
              </div>
              <h6 className="d-flex align-items-center">:</h6>
              <div className="col-4">
                <Select isMulti options={getOptions()} onChange={handleCategoryChange} value={selectedOption} isSearchable={true} />
              </div>
            </div>
            
            {selectedOption && selectedOption.map((data) => (
              <div key={data.label} className="col-12 d-flex gap-4 mt-4">
                <div className="col-3 d-flex align-items-center">
                  <div style={{ fontWeight: '500' }}>
                    {data.label === 'Products' ? 'Select Product' : 
                     data.label === 'General Pest Control' ? 'Select Services' : ''}
                  </div>
                </div>
                <h6 className="d-flex align-items-center">:</h6>
                <div className="col-4">
                  {data.label === 'Rodent Pro' ? (
                    <p>Rodent Pro</p>
                  ) : data.label === 'Products' ? (
                    <Select
                      options={productServices}
                      onChange={(selectedOption) => handleSubCategoryChange(selectedOption, data.label)}
                      isSearchable={true}
                      placeholder="Select Product"
                      styles={customStyles}
                    />
                  ) : data.label === 'General Pest Control' ? (
                    <Select
                      options={Allservices.filter((service) => service.mainCategory === data.label)
                        .map((service) => service?.serviceName.map((subCategory) => ({ value: subCategory, label: subCategory })))
                        .flat()
                      }
                      onChange={(selectedOption) => handleSubCategoryChange(selectedOption, data.label)}
                      isSearchable={true}
                      placeholder="Select Services"
                      styles={customStyles}
                    />
                  ) : null}
                </div>
                <div className="col-4 d-flex align-items-center">
                  {data.label === 'Products' && (
                    <button 
                      id="cbt" 
                      style={{ 
                        fontSize: '13px',
                        width: '200px',
                        minWidth: '200px'
                      }} 
                      onClick={() => navigate('/add/details')} 
                      className="btn btn-primary"
                    >
                      Add New Product 
                    </button>
                  )}
                  {data.label === 'General Pest Control' && (
                    <button 
                      id="cbt" 
                      style={{ 
                        fontSize: '13px',
                        width: '200px',
                        minWidth: '200px'
                      }} 
                      onClick={() => navigate('/add/details')} 
                      className="btn btn-primary"
                    >
                      Add New Service
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Display selected subcategories only once */}
            {inputFields.length > 0 && (
              <div className="col-12 d-flex gap-4 mt-2">
                <div className="col-3">
                  <h6 className="h6">Selected Services:</h6>
                </div>
                <div className="col-9">
                  <div className="mt-2">
                    {inputFields?.map((input, index) => (
                      <div key={index} className="col-6 d-flex mt-2 px-2">
                        <div className="col-8 d-flex justify-content-start align-items-center">
                          <label style={{ fontSize: '13px' }}>
                            {index + 1}. {input.serviceName}
                          </label>
                        </div>
                        <div className="col-4 d-flex justify-content-end">
                          <CiCircleMinus
                            onClick={() => {
                              const updatedFields = [...inputFields];
                              updatedFields.splice(index, 1);
                              setInputFields(updatedFields);
                              if (updatedFields.length === 0) {
                                setSubCategory('');
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex gap-4 mt-4">
              <div className="col-3">
                <div style={{ fontWeight: '500' }}>Start Date</div>
              </div>
              <h6>:</h6>
              <DatePicker
                format={{
                  format: 'DD-MM-YYYY',
                  type: 'mask'
                }}
                disabledDate={disabledDate}
                onChange={onChange}
                value={startDate}
              />
            </div>
            <div className="mt-3 mb-3">
              <div className="col-3">
                <div style={{ fontWeight: '500' }}>Description</div>
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescriprtion(e.target.value);
                }}
                className="form-control mt-2"
                id="exampleFormControlTextarea1"
                rows="5"
              ></textarea>
            </div>
          </>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel} style={{ fontSize: '13px' }}>
            Close
          </Button>
          <Button variant="primary" onClick={handleOk} style={{ fontSize: '13px' }}>
            Create Task
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default TaskCreateModel;