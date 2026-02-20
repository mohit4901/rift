import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  // ✅ CORRECT BACKEND ROUTE
  const res = await api.post("/api/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export default api;
