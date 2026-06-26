import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

export const apiMenu = axios.create({
  baseURL: API_CONFIG.BASE,
  withCredentials: true,
  timeout: 300000,
});

apiMenu.defaults.headers.common["Accept"] = "*/*";
apiMenu.defaults.headers.common["X-API-KEY"] = API_CONFIG.MENU.KEY;
