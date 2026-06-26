import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

export const apiHR = axios.create({
  baseURL: API_CONFIG.BASE,
  withCredentials: true,
  timeout: 300000,
});

apiHR.defaults.headers.common["Accept"] = "*/*";
apiHR.defaults.headers.common["X-API-KEY"] = API_CONFIG.HR.KEY;
