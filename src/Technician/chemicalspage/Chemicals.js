import React, { useState, useEffect } from "react";
import Menus from "../../Screens/Customer/Home/Menus/Menus";
import { useNavigate, useLocation } from "react-router-dom";
import ApiChemicalService from "../../Services/ChemicalServices";
import { toast, ToastContainer } from "react-toastify";
import { CiCircleMinus } from "react-icons/ci";
import Loader from "../../Reusable/Loader";

const Chemicals = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    technicianStartTime,
    technicianStartDate,
    pauseReason,
    productsServiceNames = [],
  } = location.state || {};

  const [data, setData] = useState([]);
  const [selectedChemical, setSelectedChemical] = useState("Select Chemicals");
  const [selectedLocation, setSelectedLocation] = useState("Select Location");
  const [selectedLevel, setSelectedLevel] = useState("Select Level");
  const [inputFields, setInputFields] = useState([]);
  const [observation, setObservation] = useState("");
  const [remarkForChemicals, setRemarkForChemicals] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [technicianComment, setTechnicianComment] = useState("");
  const [remarkForProducts, setRemarkForProducts] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isNoneSelected, setIsNoneSelected] = useState(false);
  const [loader, setLoader] = useState(false);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([]);
  const [customService, setCustomService] = useState("");
  const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);
  const [selectedTreatmentTypes, setSelectedTreatmentTypes] = useState([]);
  
  const serviceTypes = [
    "Crawling Insects",
    "Flying Insects",
    "Beetles",
    "Termiseal Pre Construction",
    "SubTerranean Termites",
    "Termiseal Post Construction",
    "German Cockroach",
    "American Cockroach",
    "Brown Branded Cockroach",
    "Oriental Cockroach",
    "House Mouse",
    "Roof Rat",
    "Norway Rat",
    "Bandicoot",
    "Bedbug",
    "Carpenter Ant",
    "Pharaoh Ant",
    "Ghost Ant",
    "Crazy Ant",
    "Little Black Ant",
    "Spider",
    "House Fly",
    "Flesh Fly",
    "Blow Fly",
    "Fruit Fly",
    "Phorid Fly",
    "Drain Fly",
    "Aedes Mosquito",
    "Culex",
    "Anopheles",
    "Microorganisms",
    "Feral Cats",
    "Pigeons",
    "Sparrows",
    "Crows",
    "Stored Products Insects",
    "Thrips",
    "Aphids",
    "Leaf Hopper",
    "Mites",
    "Other (Specify)"
  ];
  
  const treatmentTypes = [
    "Gel Baiting",
    "Residual Spray",
    "IMT (Insect Monitoring Trap)",
    "Insecticidal Dusting",
    "Vacuuming",
    "Aerosol Treatment",
    "Foaming Treatment",
    "Rodenticide",
    "Glue Traps",
    "Snap Traps",
    "Repellent Spray",
    "Rodent Bait Station",
    "Rodent Glue Station",
    "Liquid Termiticide",
    "Wood Treatment",
    "Termite Baiting Systems",
    "Trenching and Drilling",
    "Foaming Treatment",
    "Chemical Treatment",
    "Insecticidal Dusting",
    "Vacuuming",
    "Steaming",
    "Ant Baits",
    "Residual Spray",
    "Insecticidal dusting",
    "Residual Spray",
    "Aerosol Spray",
    "Cobweb removal",
    "Insecticidal Dusting",
    "Vacuuming",
    "Glue Trap",
    "Residual Spray",
    "Aerosol Spray",
    "Fly Bait",
    "Larvicides",
    "Fly Traps",
    "ULV treatment",
    "Foaming Treatment",
    "Residual Spray",
    "Fogging treatment",
    "Repellents",
    "Mosquito Traps",
    "Insect Growth Regulator",
    "Surface Spray",
    "Air disinfection",
    "Live Trapping and Relocation",
    "Repellents",
    "Bird Netting",
    "Bird Spike",
    "Gas Fumigation",
    "Insecticidal Spray",
    "Natural Repellents",
    "Vacuuming",


  ];
  
  const locationOptions = ["Outdoor", "Indoor"];
  const levelOptions = ["High", "Medium", "Low"];

  useEffect(() => {
    localStorage.setItem("location", window.location.pathname);
    localStorage.setItem("location_check", 2);
    getChemicals();
  }, []);

  const getChemicals = async () => {
    setLoader(true);
    try {
      const serviceData = await ApiChemicalService.GetChemicals();
      const services = serviceData?.data?.Results.map((service, index) => ({
        ...service,
        key: service._id,
        serviceId: (index + 1).toString().padStart(3, "0"),
      }));
      setData(services);
    } catch (error) {
      console.error("Error fetching Chemicals data:", error);
      toast.error("Failed to fetch Chemicals data");
    } finally {
      setLoader(false);
    }
  };

  const handleServiceTypeChange = (e) => {
    const value = e.target.value;
    if (value === "Other (Specify)") {
      setShowCustomServiceInput(true);
      if (!selectedServiceTypes.includes(value)) {
        setSelectedServiceTypes([...selectedServiceTypes, value]);
      }
    } else {
      if (!selectedServiceTypes.includes(value)) {
        setSelectedServiceTypes([...selectedServiceTypes, value]);
      }
    }
  };

  const handleCustomServiceChange = (e) => {
    setCustomService(e.target.value);
  };

  const removeServiceType = (typeToRemove) => {
    const updatedTypes = selectedServiceTypes.filter((type) => type !== typeToRemove);
    setSelectedServiceTypes(updatedTypes);
    if (typeToRemove === "Other (Specify)") {
      setShowCustomServiceInput(false);
      setCustomService("");
    }
  };

  const handleTreatmentTypeChange = (e) => {
    const value = e.target.value;
    if (!selectedTreatmentTypes.includes(value)) {
      setSelectedTreatmentTypes([...selectedTreatmentTypes, value]);
    }
  };

  const removeTreatmentType = (typeToRemove) => {
    const updatedTypes = selectedTreatmentTypes.filter((type) => type !== typeToRemove);
    setSelectedTreatmentTypes(updatedTypes);
  };

  const handleChemicalChange = (e) => {
    const selectedOption = e.target.value;
    setSelectedChemical(selectedOption);

    if (selectedOption === "None") {
      setIsNoneSelected(true);
      setInputFields([{ chemical: "None", location: selectedLocation, level: selectedLevel }]);
    } else {
      setIsNoneSelected(false);
      if (!inputFields.some((field) => field.chemical === selectedOption)) {
        const updatedFields = [
          ...inputFields,
          { chemical: selectedOption, location: selectedLocation, level: selectedLevel },
        ];
        setInputFields(updatedFields);
      }
    }
  };

  const handleLocationChange = (e) => {
    const selectedOption = e.target.value;
    setSelectedLocation(selectedOption);
    
    const updatedFields = inputFields.map((field) => {
      if (field.location === "Select Location" || field.chemical === "None") {
        return { ...field, location: selectedOption };
      }
      return field;
    });
    
    setInputFields(updatedFields);
  };

  const handleLevelChange = (e) => {
    const selectedOption = e.target.value;
    setSelectedLevel(selectedOption);
    
    const updatedFields = inputFields.map((field) => {
      if (field.level === "Select Level" || field.chemical === "None") {
        return { ...field, level: selectedOption };
      }
      return field;
    });
    
    setInputFields(updatedFields);
  };

  const handleObservationChange = (e) => {
    const inputValue = e.target.value;
    setObservation(inputValue.trim() === "" ? "-" : inputValue);
  };

  const handleRemarkForChemicalsChange = (e) => {
    const inputValue = e.target.value;
    setRemarkForChemicals(inputValue.trim() === "" ? "-" : inputValue);
  };

  const handleRecommendationChange = (e) => {
    const inputValue = e.target.value;
    setRecommendation(inputValue.trim() === "" ? "-" : inputValue);
  };

  const handleTechnicianCommentChange = (e) => {
    const inputValue = e.target.value;
    setTechnicianComment(inputValue.trim() === "" ? "-" : inputValue);
  };

  const handleRemarkForProductsChange = (e) => {
    const inputValue = e.target.value;
    setRemarkForProducts(inputValue.trim() === "" ? "-" : inputValue);
  };

  const handleSubmit = () => {
    if (selectedServiceTypes.length === 0) {
      toast.error("Please select at least one service type");
      return;
    }

    if (selectedServiceTypes.includes("Other (Specify)") && !customService.trim()) {
      toast.error("Please specify the service type");
      return;
    }

    const finalServiceTypes = selectedServiceTypes.map((type) =>
      type === "Other (Specify)" ? customService : type
    );

    setLoader(true);
    localStorage.removeItem("service1");
    localStorage.removeItem("service2");
    localStorage.removeItem("service3");
    localStorage.removeItem("rodent");
    navigate("/signature/page", {
      state: {
        inputFields,
        observation,
        remarkForChemicals,
        recommendation,
        technicianComment,
        remarkForProducts: productsServiceNames.length > 0 ? remarkForProducts : "-",
        serviceTypes: finalServiceTypes,
        treatmentTypes: selectedTreatmentTypes, // Pass treatment types
        selectedLocation,
        selectedLevel,
        pauseReason,
        technicianStartDate,
        technicianStartTime,
        productsServiceNames,
      },
    });
  };

  useEffect(() => {
    const isValid = 
      selectedServiceTypes.length > 0 &&
      !(selectedServiceTypes.includes("Other (Specify)") && !customService.trim()) &&
      inputFields.every(field => 
        field.chemical !== "None" || (
          field.location !== "Select Location" && 
          field.level !== "Select Level"
        )
      );
    
    setIsSubmitDisabled(!isValid);
  }, [inputFields, selectedServiceTypes, customService]);

  return (
    <div>
      {loader && <Loader show={loader} />}
      <Menus />
      <div className="m-2 mb-0 p-1" style={{ backgroundColor: "rgb(159 221 90 / 20%)", borderRadius: "0px" }}>
        <p className="fonts12 mt-2">
          If any chemicals were utilized during the task, please specify from the following list
        </p>
      </div>

      <div className="container">
        {/* Service Type Section */}
        <div className="col-12 mt-3">
          <h6 className="h6 col-12" style={{ fontSize: "13px", fontWeight: "500" }}>
            Type of Service
          </h6>
          <select
            className="form-select"
            aria-label="Default select example"
            value={selectedServiceTypes[0] || ""}
            onChange={handleServiceTypeChange}
            style={{ fontSize: "13px" }}
          >
            <option value="" disabled>Select Service Type</option>
            {serviceTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          {selectedServiceTypes.length > 0 && (
            <div className="mt-2">
              <h6 style={{ fontSize: "13px", fontWeight: "500" }}>Selected Services:</h6>
              <div className="d-flex flex-wrap gap-2">
                {selectedServiceTypes.map((type, index) => (
                  <div key={index} className="badge bg-primary d-flex align-items-center">
                    {type === "Other (Specify)" ? customService : type}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "10px" }}
                      onClick={() => removeServiceType(type)}
                      aria-label="Remove"
                    ></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showCustomServiceInput && (
          <div className="col-12 mt-3">
            <h6 className="h6 col-12" style={{ fontSize: "13px", fontWeight: "500" }}>
              Specify Service Type
            </h6>
            <input
              type="text"
              className="form-control"
              value={customService}
              onChange={handleCustomServiceChange}
              placeholder="Enter service type"
              style={{ fontSize: "13px" }}
            />
          </div>
        )}

        {/* Treatment Types Section */}
        <div className="col-12 mt-3">
          <h6 className="h6 col-12" style={{ fontSize: "13px", fontWeight: "500" }}>
            List of Treatment Types
          </h6>
          <select
            className="form-select"
            aria-label="Default select example"
            value=""
            onChange={handleTreatmentTypeChange}
            style={{ fontSize: "13px" }}
          >
            <option value="" disabled>Select Treatment Type</option>
            {treatmentTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          {selectedTreatmentTypes.length > 0 && (
            <div className="mt-2">
              <h6 style={{ fontSize: "13px", fontWeight: "500" }}>Selected Treatment Types:</h6>
              <div className="d-flex flex-wrap gap-2">
                {selectedTreatmentTypes.map((type, index) => (
                  <div key={index} className="badge bg-primary d-flex align-items-center">
                    {type}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "10px" }}
                      onClick={() => removeTreatmentType(type)}
                      aria-label="Remove"
                    ></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Level Selection */}
        <div className="col-12 mt-3">
          <h6 className="h6 col-12" style={{ fontSize: "13px", fontWeight: "500" }}>
            Select Level
          </h6>
          <select
            className="form-select"
            aria-label="Default select example"
            value={selectedLevel}
            onChange={handleLevelChange}
            style={{ fontSize: "13px" }}
          >
            <option disabled>Select Level</option>
            {levelOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Chemical Selection */}
        <div className="col-12 mt-3">
          <h6 className="h6 col-12" style={{ fontSize: "13px", fontWeight: "500" }}>
            Select Chemicals
          </h6>
          <select
            className="form-select"
            aria-label="Default select example"
            value={selectedChemical}
            onChange={handleChemicalChange}
            style={{ fontSize: "13px" }}
            disabled={isNoneSelected}
          >
            <option disabled>Select Chemicals</option>
            <option value="None"> None </option>
            {data &&
              data.map((item, index) => (
                <option key={index} value={item.chemicalsName}>
                  {item.chemicalsName}
                </option>
              ))}
          </select>
        </div>

        <div className="col-md-12">
                  <div className="d-flex justify-content-start mb-2">
                    <label style={{ fontSize: "13px", fontWeight: "500" }}>
                      Location:
                    </label>
                  </div>
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    style={{ fontSize: "13px" }}
                  >
                    <option disabled>Select Location</option>
                    {locationOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

        {/* Selected Chemicals List */}
        <div className="mt-3">
          {inputFields.map((input, index) => (
            <div key={index} className="col-12 d-flex mt-2 px-2">
              <div className="col-8 d-flex justify-content-start align-items-center">
                <label style={{ fontSize: "13px" }}>
                  {index + 1}. {input.chemical} 
                  {input.location !== "Select Location" && ` (Location: ${input.location})`}
                  {input.level !== "Select Level" && ` (Level: ${input.level})`}
                </label>
              </div>
              <div className="col-4 d-flex justify-content-end">
                <CiCircleMinus
                  onClick={() => {
                    const updatedFields = inputFields.filter((_, i) => i !== index);
                    setInputFields(updatedFields);
                    if (updatedFields.length === 0) {
                      setIsNoneSelected(false);
                      setSelectedChemical("Select Chemicals");
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Technician Observation/Recommendation Section */}
        <div className="col-12 mt-4">
          <h6 className="h6 col-12" style={{ fontSize: "15px", fontWeight: "600", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>
            Technician Observation / Recommendation
          </h6>
        </div>

        {/* Observation and Remark for Chemicals in same row */}
        <div className="col-12 mt-3">
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex justify-content-start mb-2">
                <label style={{ fontSize: "13px", fontWeight: "500" }}>
                  Observation:
                </label>
              </div>
              <textarea
                className="col-12 p-2"
                style={{
                  border: "none",
                  backgroundColor: "#ccdacf42",
                  fontSize: "12px",
                  height: "100px"
                }}
                value={observation}
                onChange={handleObservationChange}
                placeholder="Type observation here..."
              />
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-start mb-2">
                <label style={{ fontSize: "13px", fontWeight: "500" }}>
                  Remark for Chemicals:
                </label>
              </div>
              <textarea
                className="col-12 p-2"
                style={{
                  border: "none",
                  backgroundColor: "#ccdacf42",
                  fontSize: "12px",
                  height: "100px"
                }}
                value={remarkForChemicals}
                onChange={handleRemarkForChemicalsChange}
                placeholder="Type remark for chemicals here..."
              />
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="col-12 mt-3">
          <div className="d-flex justify-content-start mb-2">
            <label style={{ fontSize: "13px", fontWeight: "500" }}>
              Recommendation:
            </label>
          </div>
          <textarea
            className="col-12 p-2"
            style={{
              border: "none",
              backgroundColor: "#ccdacf42",
              fontSize: "12px",
              height: "100px"
            }}
            value={recommendation}
            onChange={handleRecommendationChange}
            placeholder="Type recommendation here..."
          />
        </div>

        {/* Technician Comment
        <div className="col-12 mt-3">
          <div className="d-flex justify-content-start mb-2">
            <label style={{ fontSize: "13px", fontWeight: "500" }}>
              Technician Comment:
            </label>
          </div>
          <textarea
            className="col-12 p-2"
            style={{
              border: "none",
              backgroundColor: "#ccdacf42",
              fontSize: "12px",
              height: "100px"
            }}
            value={technicianComment}
            onChange={handleTechnicianCommentChange}
            placeholder="Type comment here..."
          />
        </div> */}

        {/* Products Section - Only show if productsServiceNames has items */}
        {productsServiceNames.length > 0 && (
          <>
            <div className="col-12 mt-4">
              <h6 className="h6 col-12" style={{ fontSize: "15px", fontWeight: "600", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>
                Products
              </h6>
            </div>

            {/* Product Names and Location */}
            <div className="col-12 mt-3">
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex justify-content-start mb-2">
                    <label style={{ fontSize: "13px", fontWeight: "500" }}>
                      Product Names:
                    </label>
                  </div>
                  <div className="p-2" style={{
                    border: "none",
                    backgroundColor: "#ccdacf42",
                    fontSize: "12px",
                    minHeight: "50px"
                  }}>
                    {productsServiceNames.join(", ")}
                  </div>
                </div>
               
              </div>
            </div>

            {/* Remark for Products */}
            <div className="col-12 mt-3">
              <div className="d-flex justify-content-start mb-2">
                <label style={{ fontSize: "13px", fontWeight: "500" }}>
                  Remark for Products:
                </label>
              </div>
              <textarea
                className="col-12 p-2"
                style={{
                  border: "none",
                  backgroundColor: "#ccdacf42",
                  fontSize: "12px",
                  height: "100px"
                }}
                value={remarkForProducts}
                onChange={handleRemarkForProductsChange}
                placeholder="Type remark for products here..."
              />
            </div>
          </>
        )}
      </div>

      <div>
        <button
          type="submit"
          onClick={handleSubmit}
          className="btn btn-primary m-4"
          disabled={isSubmitDisabled}
        >
          Submit
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Chemicals;