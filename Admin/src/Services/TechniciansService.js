import http from "./Https";
const createTechnicianUrl = "technician/createTechnician";
const technicianListUrl = "technician/getTechnician";
const technicianTaskUrl = "task/getTasks"
const createTechnicianTaskUrl = "task/createTask"
const DeleteTechinicianUrl = 'technician/delete/'
const deletedTechnicianUrl = "technician/all/deletedTechnician"
const RestoreTechnicianUrl = "technician/delete/technician/"
const technicianCountUrl = "company/totalTechnician"
const StartTaskCountUrl = "task/start/taskcount"
const AssignTaskCountUrl = "task/assigned/taskcount"
const OngoingTaskCountUrl = "task/ongoing/taskcount"
const CompletedTaskCountUrl = "task/completed/taskcount"
const RegisterTechnicianUrl = "otherauth/technicianRegister"
const EditTechnicianUrl = "technician/editTechnician/"
const GetReportsURL = 'task/completedTaskDetails/';
const DeleteTasurl = 'task/delete/task'
const DeleteTaskon = 'task/deleteTasks/'
const sendAdminCommandURL = "task/send-command"
const getDeletedTasksUrl = "task/getDeletedTasks"

const createTechnician = (data) => {
    // console.log("data------->",data);
    return http.Post(createTechnicianUrl, data);
}
const EditTechnician = (data) => {
    // console.log("data----------->",data);
    const EditTechnicianData = `${EditTechnicianUrl}${data.id}`
    return http.Post(EditTechnicianData, data)
}
const technicianList = (data) => {
    // console.log('technician list',data)
    return http.Get(technicianListUrl, data)
}


const DeleteTechinician = (data) => {
    let deleteTechnicisnUrl = `${DeleteTechinicianUrl}${data}`
    return http.Post(deleteTechnicisnUrl)
}

const DeletedTechnician = (data) => {
    return http.Get(deletedTechnicianUrl, data)
}

const getDeletedTasks = (data) => {
    return http.Get(getDeletedTasksUrl,data)
}

const RestoreTechnician = (data) => {
    const restoreTechnician = `${RestoreTechnicianUrl}${data}`
    return http.Post(restoreTechnician)
}

const TechnicianCount = (data) => {
    return http.Get(technicianCountUrl, data)
}

// =========================== Tasks ===========================

const technicianTask = (data) => {

    return http.Get(technicianTaskUrl, data)
}

const createTechnicianTask = (data) => {
    return http.Post(createTechnicianTaskUrl, data)
}

const StartTaskCount = (data) => {
    return http.Get(StartTaskCountUrl, data)
}

const AssignedTaskCount = (data) => {
    return http.Get(AssignTaskCountUrl, data)
}


const OngoingTaskCount = (data) => {
    return http.Get(OngoingTaskCountUrl, data)

}

const CompletedTaskCount = (data) => {
    return http.Get(CompletedTaskCountUrl, data)
}

const RegisterTechnicican = (data) => {
    // const Register = `${RegisterTechnicianUrl}${data}`
    return http.Post(RegisterTechnicianUrl, data)
}

const GetReports = (data) => {     
    return http.Get(GetReportsURL,data); 
}
const deleteTask = (data)=>{
    return http.Post(DeleteTasurl,data)
}

const deleteonTask = (data)=>{
    const deleteon = `${DeleteTaskon}${data}`
    return http.Post(deleteon,data)
}

const sendAdminCommand = (data)=>{
    return http.Post(sendAdminCommandURL,data)
}


export default {
    createTechnician: createTechnician,
    technicianList: technicianList,
    technicianTask: technicianTask,
    createTechnicianTask: createTechnicianTask,
    DeleteTechinician: DeleteTechinician,
    DeletedTechnician: DeletedTechnician,
    RestoreTechnician: RestoreTechnician,
    TechnicianCount: TechnicianCount,
    StartTaskCount: StartTaskCount,
    AssignedTaskCount:AssignedTaskCount,
    OngoingTaskCount: OngoingTaskCount,
    CompletedTaskCount: CompletedTaskCount,
    RegisterTechnicican: RegisterTechnicican,
    EditTechnician:EditTechnician,
    GetReports:GetReports,
    deleteTask:deleteTask,
    deleteonTask:deleteonTask,
    sendAdminCommand:sendAdminCommand,
    getDeletedTasks:getDeletedTasks

};