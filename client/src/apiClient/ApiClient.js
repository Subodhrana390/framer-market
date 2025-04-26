import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://4ff3-112-196-126-3.ngrok-free.app/api/v1",
});

export default apiClient;
