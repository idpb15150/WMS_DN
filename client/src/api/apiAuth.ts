import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

export const apiAuth = axios.create({
  baseURL: API_CONFIG.BASE,
  withCredentials: true,
  timeout: 300000,
});

apiAuth.defaults.headers.common["Accept"] = "*/*";
apiAuth.defaults.headers.common["X-API-KEY"] = API_CONFIG.AUTH.KEY;
