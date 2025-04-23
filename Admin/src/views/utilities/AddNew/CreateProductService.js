import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import ApiService from '../../../Services/AllServices';
import ApiServiceProductCategory from '../../../Services/Categoryservices';
import Select from 'react-select';
import Loader from 'ui-component/Loader/Loader';

const CreateProductService = () => {
  const [productNames, setProductNames] = useState([]);
  const [productImage, setProductImage] = useState(null);
  const [error, setError] = useState('');
  const [subCategories, setSubCategories] = useState([]);
  const [mainCategory, setMainCategory] = useState('Product'); // Default value set to "Product"
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    handleGetProductCategory();
  }, []);

  const handleProductImageChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  const handleGetProductCategory = async () => {
    setLoader(true);
    try {
      const res = await ApiServiceProductCategory.getProductCategory();
      const results = res.data.Results;

      // Only fetch subcategories since main category is fixed
      const sub = results.filter((data) => data.categoryType === 'sub');
      setSubCategories(sub);
    } catch (error) {
      console.error('Error fetching product categories:', error);
    } finally {
      setLoader(false);
    }
  };

  const handleSubCategoryChange = (selectedOptions) => {
    const names = selectedOptions.map((option) => option.label);
    setProductNames(names);
  };

  const handleClick = async () => {
    setLoader(true);
    try {
      if (!productNames.length) {
        setError('Product Names are required');
        toast.error('Product Names are required');
        return;
      }

      const formData = new FormData();
      formData.append('productName', productNames.join(','));
      formData.append('mainCategory', mainCategory);
      if (productImage) {
        formData.append('productImage', productImage);
      }

      const response = await ApiService.createProductService(formData);

      if (response && response.status === 200) {
        toast.success(response.data.message || 'Product Service Created Successfully');
        setProductNames([]);
        setProductImage(null);
      } else if (response.status === 404) {
        toast.error('Product service already exists.');
      } else if (response.status === 400) {
        toast.error('Please select product service.');
      } else {
        toast.error('Product Service Creation Failed');
      }
    } catch (error) {
      setError('Product Service Creation Failed');
      toast.error('Product Service Creation Failed');
      console.error('Error creating product service:', error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {loader && <Loader show={loader} />}
      <div className="Signin">
        <div className="d-flex flex-row">
          <div className="col-6 p-2">
            <label htmlFor="mainCategory" className="mt-3">
              Main Category
            </label>
            <input
              type="text"
              id="mainCategory"
              value={mainCategory}
              readOnly
              className="form-control mt-3"
            />
            {error && <div className="text-danger mt-2">{error}</div>}
          </div>
          <div className="col-6 p-2">
            <label htmlFor="subCategory" className="mt-3">
              Sub Category
            </label>
            <Select
              className="mt-3"
              options={subCategories.map((category) => ({
                value: category._id,
                label: category.category,
              }))}
              onChange={handleSubCategoryChange}
              isMulti
            />
            {error && <div className="text-danger mt-2">{error}</div>}
          </div>
        </div>
        {/* <div className="col-6 p-2">
          <label htmlFor="productImage" className="mt-3">
            Product Image
          </label>
          <input
            type="file"
            id="productImage"
            onChange={handleProductImageChange}
            className="form-control mt-3"
          />
          {error && <div className="text-danger mt-2">{error}</div>}
        </div> */}
        <div className="col-4 mt-4">
          <button type="button" onClick={handleClick} className="btn tech-btn">
            Create
          </button>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default CreateProductService;