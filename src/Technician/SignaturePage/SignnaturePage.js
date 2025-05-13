import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SignatureCanvas from "react-signature-canvas";
import Menus from "../../Screens/Customer/Home/Menus/Menus";
import { useLocation, useNavigate } from "react-router-dom";
import ApiService from "../../Services/TaskServices";
import { fetchTasks } from "../../Redux/Action/Action";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";
import Spinner from "react-bootstrap/Spinner";
import Loader from "../../Reusable/Loader";

const SignaturePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    inputFields,
    recommendation,
    observation,
    remarkForChemicals,
    technicianComment,
    remarkForProducts,
    serviceTypes,
    treatmentTypes, // Receive treatmentTypes
    selectedLocation,
    selectedLevel,
    pauseReason,
    technicianStartDate,
    technicianStartTime,
    productsServiceNames,
  } = location?.state || {};

  const techSigRef = useRef(null);
  const custSigRef = useRef(null);
  const dispatch = useDispatch();
  const [signature, setSignature] = useState(null);
  const [customerSignature, setCustomerSignature] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [techName, setTechName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [taskItemId, setTaskItemID] = useState("");
  const [taskId, setTaskID] = useState("");
  const [technicianSigned, setTechnicianSigned] = useState("Not Signed");
  const [customerSigned, setCustomerSigned] = useState("Not Signed");
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);

  const selectedTaskData = useSelector((state) => state?.task?.task?.selectedTask);
  const selectedTaskIDData = useSelector((state) => state?.task?.task?.selectedTaskId);
  const customerDetailsData = useSelector((state) => state?.task?.task?.customerDetails);

  useEffect(() => {
    const location = localStorage.getItem("location");
    if (location === "/tech/home") {
      navigate("/tech/home");
    }
    localStorage.setItem("location", "/chemical/list");
  }, []);

  useEffect(() => {
    const Technician = selectedTaskData?.technicianDetails;
    const TechnicianName = `${Technician.firstName} ${Technician.lastName}`;
    if (TechnicianName !== null) {
      setTechName(TechnicianName);
    }
  }, [selectedTaskData]);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    setTaskItemID(selectedTaskData?._id);
    setTaskID(selectedTaskIDData);
  }, [selectedTaskData, selectedTaskIDData]);

  const handleSignatureEnd = () => {
    setSignature(techSigRef.current.toDataURL());
    setTechnicianSigned("Signed");
  };

  const clearSignature = () => {
    techSigRef.current.clear();
    setSignature(null);
    setTechnicianSigned("Not Signed");
  };

  const handleCustomerSign = () => {
    setCustomerSignature(custSigRef.current.toDataURL());
    setCustomerSigned("Signed");
  };

  const clearCustomerSignature = () => {
    custSigRef.current.clear();
    setCustomerSignature(null);
    setCustomerSigned("Not Signed");
  };

  const handleToggleChange = () => {
    setShowSignaturePad(!showSignaturePad);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signature) {
      toast.error("Please provide the technician's signature before submitting.");
      return;
    } else if (!customerName) {
      toast.error("Please provide the Authorised Person Name before submitting.");
      return;
    } else if (showSignaturePad && !customerSignature) {
      toast.error("Please provide the customer's signature before submitting.");
      return;
    }

    setLoader(true);
    const currentTime = moment().format("HH:mm");
    const technicianEndTime = currentTime;

    let customerSignValue = customerSignature;
    if (!showSignaturePad) {
      customerSignValue = "N/A";
    }

    const completedDetails = {
      chemicalsName: inputFields.map((field) => field.chemical),
      locations: inputFields.map((field) => field.location || selectedLocation),
      levels: inputFields.map((field) => field.level || selectedLevel),
      recommendation: recommendation || "-",
      observation: observation || "-",
      remarkForChemicals: remarkForChemicals || "-",
      technicianComment: technicianComment || "-",
      remarkForProducts: remarkForProducts || "-",
      serviceTypes: serviceTypes || [],
      treatmentTypes: treatmentTypes || [], // Include treatmentTypes
      productsServiceNames: productsServiceNames || [],
      techSign: signature,
      customerAvailble: showSignaturePad,
      customerSign: customerSignValue,
      endTime: technicianEndTime,
      authorisedPerson: customerName,
    };

    try {
      const response = await ApiService.UpdateCompeletdStatus({
        taskId: taskId,
        taskItemId: taskItemId,
        status: "completed",
        completedDetails: completedDetails,
        email: customerDetailsData.email,
      });

      if (response && (response.status === 200 || response.status === 500)) {
        toast.success("Task Completed!");
        localStorage.removeItem("startTime");
        localStorage.removeItem("location_check");
        localStorage.removeItem("location");
        localStorage.removeItem("subid");
        localStorage.removeItem("subItem");
        localStorage.removeItem("isStopped");
        localStorage.removeItem("serviceName");
        localStorage.setItem("StartStatus", "true");

        setTimeout(() => {
          navigate("/tech/home");
        }, 1000);
        setIsLoading(false);
      }  else {
        console.error(
          `Error: Task not Completed!. Status code: ${response ? response.status : "unknown"}`
        );
      }
    } catch (error) {
      console.error("Unable to complete the task:", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="scrollable-container">
      {loader && <Loader show={loader} />}
      <Menus />
      <div>
        <div className="container">
          <div style={{ fontWeight: "bold" }}>
            <p>Service Acknowledgement</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 col-12 d-flex flex-column p-2">
              <label
                htmlFor="technicianName"
                className="d-flex justify-content-start form-label mt-2"
                style={{ fontSize: "13px", fontWeight: "600" }}
              >
                Technician Name :
              </label>
              <input
                type="text"
                className="col-12 form-control"
                placeholder="Enter Technician Name"
                id="technicianName"
                style={{ fontSize: "13px" }}
                value={techName}
                readOnly
              />
            </div>
            <div className="mb-3 col-12 d-flex flex-column p-2">
              <div className="d-flex flex-row mb-2">
                <label
                  className="col-8 d-flex justify-content-start form-label"
                  style={{ fontSize: "13px", fontWeight: "600" }}
                >
                  Technician Signature :
                </label>
                <div className="col-4 d-flex flex-row justify-content-end align-items-start">
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="btn btn-secondary p-1"
                    style={{ fontSize: "12px" }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <SignatureCanvas
                penColor="black"
                ref={techSigRef}
                onEnd={handleSignatureEnd}
                clearOnResize={false}
                canvasProps={{ className: "signature m-0 col-12" }}
              />
            </div>
            <hr />
            <div className="mb-3 col-12 d-flex flex-column p-2">
              <label
                htmlFor="authorisedPersonName"
                className="d-flex justify-content-start form-label"
                style={{ fontSize: "13px", fontWeight: "600" }}
              >
                Authorised Person Name:
              </label>
              <input
                type="text"
                className="col-12 form-control"
                placeholder="Enter Name"
                id="authorisedPersonName"
                style={{ fontSize: "13px" }}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-start p-2">
              <span style={{ fontSize: "13px", fontWeight: "600" }}>
                Customer available:
              </span>
              <input
                type="checkbox"
                id="toggle"
                onChange={handleToggleChange}
              />
              <label className="label" htmlFor="toggle"></label>
            </div>
            {showSignaturePad && (
              <div className="mb-3 col-12 d-flex flex-column p-2">
                <div className="d-flex flex-row mb-2">
                  <label
                    className="col-8 d-flex justify-content-start form-label"
                    style={{ fontSize: "13px", fontWeight: "600" }}
                  >
                    Customer Signature :
                  </label>
                  <div className="col-4 d-flex flex-row justify-content-end align-items-start">
                    <button
                      type="button"
                      onClick={clearCustomerSignature}
                      className="btn btn-secondary p-1"
                      style={{ fontSize: "12px" }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <SignatureCanvas
                  penColor="black"
                  ref={custSigRef}
                  onEnd={handleCustomerSign}
                  clearOnResize={false}
                  canvasProps={{ className: "signature m-0 col-12" }}
                />
              </div>
            )}
            {isLoading ? (
              <div className="d-flex justify-content-center align-items-center mb-4" style={{ height: "100px" }}>
                <Spinner animation="border" variant="success" />
              </div>
            ) : (
              <button type="submit" className="btn btn-primary m-4">
                Submit
              </button>
            )}
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignaturePage;