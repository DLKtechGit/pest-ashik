import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../../Services/Categoryservices'; // Adjust the import path as needed
import Select from 'react-select';
import Loader from 'ui-component/Loader/Loader';

const CreateProductCategory = () => {
  const [productCategory, setProductCategory] = useState('');
  const [categoryType, setCategoryType] = useState({ value: 'sub', label: 'Sub Category' });
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);

  const handleProductCategoryChange = (e) => {
    setProductCategory(e.target.value);
  };

  const handleCategoryTypeChange = (selectedOption) => {
    setCategoryType(selectedOption);
  };

  const handleClick = async () => {
    setLoader(true);
    try {
      if (!productCategory.trim()) {
        setError('Product Category Name is required');
        toast.error('Product Category Name is required');
        return;
      }

      const response = await ApiService.createProductCategory({
        category: productCategory,
        categoryType: categoryType.value,
      });

      if (response && response.status === 200) {
        toast.success('Product Category Created Successfully');
        setProductCategory('');
        setCategoryType({ value: 'sub', label: 'Sub Category' });
        window.location.reload();
      } else {
        toast.error(response.data.message || 'Product Category Creation Failed');
      }
    } catch (error) {
      setError('Product Category Creation Failed');
      toast.error('Product Category Creation Failed');
      console.error('Error creating product category:', error);
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
            <label htmlFor="category" className="mt-3">
              Sub Category
            </label>
            <input
              name="productCategory"
              type="text"
              value={productCategory}
              onChange={handleProductCategoryChange}
              className="form-control mt-3"
              placeholder="Enter a Sub Category"
            />
            {error && <div className="text-danger mt-2">{error}</div>}
          </div>
        </div>
        <div className="col-4 mt-4">
          <button type="button" onClick={handleClick} className="btn tech-btn">
            Create
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateProductCategory;