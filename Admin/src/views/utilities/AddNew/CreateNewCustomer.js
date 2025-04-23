import React, { useState, useEffect } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ApiCustomer from '../../../Services/CustomerServices';
import { toast, ToastContainer } from 'react-toastify';
import Loader from 'ui-component/Loader/Loader';
import { useNavigate } from 'react-router';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateNewCustomer = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [loader, setLoader] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [expiryDate, setExpiryDate] = useState(null);
  const [status, setStatus] = useState('Active');
  const navigate = useNavigate();

  // Initialize counters from localStorage or default to 100
  const getInitialCounter = (key) => {
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored) : 100;
  };

  const [premisesCounter, setPremisesCounter] = useState(getInitialCounter('premisesCounter'));
  const [contractCounter, setContractCounter] = useState(getInitialCounter('contractCounter'));

  // Generate formatted IDs
  const generatePremisesId = () => `PPP${premisesCounter}`;
  const generateContractId = () => `PPC${contractCounter}`;

  // Update counters and save to localStorage
  const incrementCounters = () => {
    setPremisesCounter((prev) => {
      const newCounter = prev + 1;
      localStorage.setItem('premisesCounter', newCounter);
      return newCounter;
    });
    setContractCounter((prev) => {
      const newCounter = prev + 1;
      localStorage.setItem('contractCounter', newCounter);
      return newCounter;
    });
  };

  const initialValues = {
    name: '',
    email: '',
    address: '',
    country: '',
    state: '',
    city: '',
    phoneNumber: '',
    contractId: generateContractId(),
    premisesId: generatePremisesId(),
    serviceFrequency: '',
    paymentType: '',
    yearlyPaymentAmount: '',
    monthlyPaymentAmount: '',
    expiryDate: null,
    status: 'Active'
  };

  // Service frequency options
  const serviceFrequencyOptions = [
    { value: 'Monthly once', label: 'Monthly once' },
    { value: 'Monthly twice', label: 'Monthly twice' },
    { value: '6 months once', label: '6 months once' },
    { value: 'Yearly once', label: 'Yearly once' },
    { value: 'Yearly twice', label: 'Yearly twice' }
  ];

  // Payment type options
  const paymentTypeOptions = [
    { value: 'Yearly', label: 'Yearly Payment' },
    { value: 'Monthly', label: 'Monthly Payment' }
  ];

  const handleClick = async (values, actions) => {
    setLoader(true);
    console.log('Form Values:', values);
    await ApiCustomer.createCompany(values).then((res) => {
      if (res.status === 201) {
        toast.success('New Customer Created Successfully');
        incrementCounters(); // Increment counters on successful creation
        setTimeout(() => {
          navigate('/customer-list/table');
        }, 1000);
      } else if (res.status === 409) {
        toast.error('Email already exist');
      } else if (res.status === 400) {
        toast.error('Please fill all required field');
      }
    });
    setLoader(false);
  };

  const handlePaymentTypeChange = (selectedOption, setFieldValue) => {
    setPaymentType(selectedOption.value);
    setFieldValue('paymentType', selectedOption.value);
    // Reset amounts when changing payment type
    setFieldValue('yearlyPaymentAmount', '');
    setFieldValue('monthlyPaymentAmount', '');
  };

  const handleExpiryDateChange = (date, setFieldValue) => {
    setExpiryDate(date);
    setFieldValue('expiryDate', date);
    console.log(date)
    
    // Update status based on expiry date
    const currentDate = new Date();
    const newStatus = date && date <= currentDate ? 'Inactive' : 'Active';
    setStatus(newStatus);
    setFieldValue('status', newStatus);
  };

  // Update form IDs when counters change
  useEffect(() => {
    initialValues.contractId = generateContractId();
    initialValues.premisesId = generatePremisesId();
  }, [premisesCounter, contractCounter]);

  return (
    <>
      {loader && <Loader show={loader} />}
      <Formik
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          handleClick(values, actions);
        }}
        validate={(values) => {
          const errors = {};
          if (values.paymentType === 'Yearly' && !values.yearlyPaymentAmount) {
            errors.yearlyPaymentAmount = 'Yearly payment amount is required';
          }
          if (values.paymentType === 'Monthly' && !values.monthlyPaymentAmount) {
            errors.monthlyPaymentAmount = 'Monthly payment amount is required';
          }
          return errors;
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div className="d-flex flex-row">
              <div className="col-6 p-2">
                <label htmlFor="name" className="mt-3">
                  Customer Name
                </label>
                <Field name="name" type="text" className="newcompany form-control mt-3" placeholder="Enter Customer Name" />
                <ErrorMessage name="name" component="div" className="text-danger mt-2" />
              </div>
              <div className="col-6 p-2">
                <label htmlFor="address" className="mt-3">
                  Customer Address
                </label>
                <Field name="address" type="text" className="newcompany form-control mt-3" placeholder="Enter Customer Address" />
                <ErrorMessage name="address" component="div" className="text-danger mt-2" />
              </div>
            </div>

            <div className="d-flex flex-row">
              <div className="col-6 p-2">
                <label htmlFor="country" className="mt-3">
                  Country
                </label>
                <Select
                  className="mt-3"
                  options={Country.getAllCountries()}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.name}
                  value={Country.getAllCountries().find((country) => country.name === values.country)}
                  onChange={(selectedOption) => {
                    setFieldValue('country', selectedOption.name);
                    setSelectedCountry(selectedOption);
                  }}
                />
                <ErrorMessage name="country" component="div" className="text-danger mt-2" />
              </div>
              <div className="col-6 p-2">
                <label htmlFor="state" className="mt-3">
                  State
                </label>
                <Select
                  className="mt-3"
                  options={State?.getStatesOfCountry(selectedCountry?.isoCode)}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.name}
                  value={State.getStatesOfCountry(selectedCountry?.isoCode)?.find((state) => state.name === values.state)}
                  onChange={(selectedOption) => {
                    setFieldValue('state', selectedOption.name);
                    setSelectedState(selectedOption);
                  }}
                />
                <ErrorMessage name="state" component="div" className="text-danger mt-2" />
              </div>
            </div>

            <div className="d-flex flex-row">
              <div className="col-6 p-2">
                <label htmlFor="city" className="mt-3">
                  City
                </label>
                <Select
                  className="mt-3"
                  options={City.getCitiesOfState(selectedCountry?.isoCode, selectedState?.isoCode)}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.name}
                  value={City.getCitiesOfState(selectedCountry?.isoCode, selectedState?.isoCode)?.find((city) => city.name === values.city)}
                  onChange={(selectedOption) => setFieldValue('city', selectedOption.name)}
                />
                <ErrorMessage name="city" component="div" className="text-danger mt-2" />
              </div>
              <div className="col-6 p-2">
                <label htmlFor="phoneNumber" className="mt-3 mb-3">
                  Phone Number
                </label>
                <PhoneInput
                  prefix="+"
                  countryCodeEditable={false}
                  country={'bh'}
                  value={values.phoneNumber}
                  onChange={(phone) => {
                    if (!phone.startsWith('+')) {
                      phone = '+' + phone;
                    }
                    setFieldValue('phoneNumber', phone);
                  }}
                  placeholder="Enter a Phone Number"
                />
              </div>
            </div>

            <div className="d-flex flex-row">
              <div className="col-6 p-2">
                <label htmlFor="email" className="mt-3">
                  Email Address
                </label>
                <Field name="email" type="email" className="newcompany form-control mt-3" placeholder="Enter Email Address" />
                <ErrorMessage name="email" component="div" className="text-danger mt-2" />
              </div>
              <div className="col-6 p-2">
                <label htmlFor="contractId" className="mt-3">
                  Contract ID
                </label>
                <Field 
                  name="contractId" 
                  type="text" 
                  className="newcompany form-control mt-3" 
                  value={generateContractId()}
                  readOnly
                />
                <ErrorMessage name="contractId" component="div" className="text-danger mt-2" />
              </div>
            </div>

            <div className="d-flex flex-row">
              <div className="col-6 p-2">
                <label htmlFor="premisesId" className="mt-3">
                  Premises ID
                </label>
                <Field 
                  name="premisesId" 
                  type="text" 
                  className="newcompany form-control mt-3" 
                  value={generatePremisesId()}
                  readOnly
                />
                <ErrorMessage name="premisesId" component="div" className="text-danger mt-2" />
              </div>
              <div className="col-6 p-2">
                <label htmlFor="serviceFrequency" className="mt-3">
                  Service Frequency
                </label>
                <Select
                  className="mt-3"
                  options={serviceFrequencyOptions}
                  value={serviceFrequencyOptions.find(option => option.value === values.serviceFrequency)}
                  onChange={(selectedOption) => setFieldValue('serviceFrequency', selectedOption.value)}
                  placeholder="Select Service Frequency"
                />
                <ErrorMessage name="serviceFrequency" component="div" className="text-danger mt-2" />
              </div>
            </div>

            <div className="d-flex flex-row">
              <div className="col-6 p-2">
                <label htmlFor="paymentType" className="mt-3">
                  Payment Type
                </label>
                <Select
                  className="mt-3"
                  options={paymentTypeOptions}
                  value={paymentTypeOptions.find(option => option.value === values.paymentType)}
                  onChange={(selectedOption) => handlePaymentTypeChange(selectedOption, setFieldValue)}
                  placeholder="Select Payment Type"
                />
                <ErrorMessage name="paymentType" component="div" className="text-danger mt-2" />
              </div>
              <div className="col-6 p-2">
                {values.paymentType === 'Yearly' && (
                  <>
                    <label htmlFor="yearlyPaymentAmount" className="mt-3">
                      Yearly Payment Amount
                    </label>
                    <Field 
                      name="yearlyPaymentAmount" 
                      type="number" 
                      className="newcompany form-control mt-3" 
                      placeholder="Enter Yearly Amount" 
                    />
                    <ErrorMessage name="yearlyPaymentAmount" component="div" className="text-danger mt-2" />
                  </>
                )}
                {values.paymentType === 'Monthly' && (
                  <>
                    <label htmlFor="monthlyPaymentAmount" className="mt-3">
                      Monthly Payment Amount
                    </label>
                    <Field 
                      name="monthlyPaymentAmount" 
                      type="number" 
                      className="newcompany form-control mt-3" 
                      placeholder="Enter Monthly Amount" 
                    />
                    <ErrorMessage name="monthlyPaymentAmount" component="div" className="text-danger mt-2" />
                  </>
                )}
              </div>
            </div>

            <div className="d-flex flex-row">
              <div className="col-6 p-2">
                <label htmlFor="expiryDate" className="mt-3">
                  Expiry Date
                </label>
                <DatePicker
                  selected={expiryDate}
                  onChange={(date) => handleExpiryDateChange(date, setFieldValue)}
                  minDate={new Date()}
                  className="form-control mt-3"
                  placeholderText="Select expiry date"
                  dateFormat="dd/MM/yyyy"
                />
                <ErrorMessage name="expiryDate" component="div" className="text-danger mt-2" />
              </div>
              <div className="col-6 p-2">
                <label htmlFor="status" className="mt-3">
                  Status
                </label>
                <Field 
                  name="status" 
                  type="text" 
                  className="newcompany form-control mt-3" 
                  value={status}
                  readOnly
                />
              </div>
            </div>

            <div className="col-4 mt-4">
              <button type="submit" className="btn tech-btn">
                Create
              </button>
            </div>
          </Form>
        )}
      </Formik>
      <ToastContainer />
    </>
  );
};

export default CreateNewCustomer;