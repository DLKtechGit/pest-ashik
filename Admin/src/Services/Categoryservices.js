import http from "./Https";
const createCateogryUrl = "category/createServiceCategory";
const getCategoryUrl = "category/getCategory";
const deleteCategoryUrl = "category/deleteCategory/";
const createProductCategoryUrl = "category/createProductCategory";
const getProductCategoryUrl = "category/getProductCategory"

const createCateogry = (data) => {
    // console.log("dataserv------->",data);
    return http.Post(createCateogryUrl, data);
}

const createProductCategory = (data) => {
    return http.Post(createProductCategoryUrl,data)
}

const GetCateogry = (data) =>{
    return http.Get(getCategoryUrl,data)
}

const getProductCategory = (data) => {
    return http.Get(getProductCategoryUrl,data)
}

const DeleteCategory = (data)=>{
    // console.log("data-------============>",data);
    const deleteCategoryUrlData = `${deleteCategoryUrl}${data}`
   return http.Post(deleteCategoryUrlData,data)
}

export default {
    createCateogry: createCateogry,   
    GetCateogry:GetCateogry,
    DeleteCategory:DeleteCategory,
    createProductCategory:createProductCategory,
    getProductCategory:getProductCategory
};