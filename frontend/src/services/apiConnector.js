import axios from "axios"
import { APP_URL } from "@/utils/appUrl";

export const axiosInstance = axios.create({
    baseURL: APP_URL,
});

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method: method,
        url: url,
        data: bodyData || null,
        headers: headers || null,
        params: params || null,
    });
}