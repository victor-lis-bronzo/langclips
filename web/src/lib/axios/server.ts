import axios from "axios";

export const apiServer = axios.create({
  baseURL:
    process.env.API_URL ||
    process.env.VITE_API_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000",
});
