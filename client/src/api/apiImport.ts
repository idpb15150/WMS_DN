import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

export const apiImport = axios.create({
  baseURL: API_CONFIG.BASE,
  withCredentials: true,
  timeout: 300000,
});

apiImport.defaults.headers.common["Accept"] = "*/*";
apiImport.defaults.headers.common["X-API-KEY"] = API_CONFIG.IMPORT.KEY;
