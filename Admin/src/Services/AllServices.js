import http from "./Https";
const createServicesUrl = "services/createService";
const ListofServicesUrl = "services/getServices"
const DeleteServicesUrl = "services/deleteservices/"
const submitUrl = "task/subtionmail"
const createProductServiceUrl = "services/createProductService";
const getProductServicesUrl = "services/getProductServices"


const createServices = (data) => {
    // console.log("dataserv------->",data);
    return http.Post(createServicesUrl, data);
}

const createProductService = (data) => {
    return http.Post(createProductServiceUrl,data)
}

const ListServices = (data) =>{
    return http.Get(ListofServicesUrl,data)
}

const getProductServices = (data) => {
    return http.Get(getProductServicesUrl,data)
}

const DeleteService = (data)=>{
    // console.log("data-------============>",data);
    const deleteServicesUrl = `${DeleteServicesUrl}${data}`
   return http.Post(deleteServicesUrl,data)
}

const Submitemail = (data)=>{
    return http.Post(submitUrl,data)
}


export default {
    createServices: createServices,
    ListServices:ListServices,
    DeleteService:DeleteService,
    Submitemail:Submitemail,
    createProductService:createProductService,
    getProductServices:getProductServices
};