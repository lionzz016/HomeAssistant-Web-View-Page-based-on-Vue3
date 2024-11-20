import axios from "axios";
import router from "@/router/index.js";


const request = axios.create({
    baseURL: "http://localhost:8089",
    timeout: 30000
})

const requestData = axios.create({
    headers: {
        "Content-Type": "application/json;charset=UTF-8",
    },
    responseType: "json",
    timeout: 1000
})

// requestData.interceptors.request.use(config => {
//     return config
// })



export default requestData

