import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:4000/api", // ✅ backend port aur /api prefix
  timeout: 30000, // 30 seconds timeout for file uploads
});

// 🔑 Token automatically attach karna
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - browser will set it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ Plants API Functions
export const plantsAPI = {
  // Upload image to Cloudinary (single image)
  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return instance.post('/plants/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Save plant with image upload (FormData)
  savePlantWithImage: (formData) => {
    return instance.post('/plants/save', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Save plant without image (regular JSON)
  savePlant: (plantData) => instance.post('/plants/save', plantData),
  
  // Get user's saved plants
  getSavedPlants: (userId) => instance.get(`/plants/saved/${userId}`),
  
  // Get plant details by ID
  getPlantById: (plantId) => instance.get(`/plants/${plantId}`),
  
  // Update plant information
  updatePlant: (plantId, updateData) => instance.put(`/plants/${plantId}`, updateData),
  
  // Delete plant
  deletePlant: (plantId, userId) => instance.delete(`/plants/${plantId}`, { data: { userId } }),
  
  // Get plant statistics
  getPlantStats: (userId) => instance.get(`/plants/stats/${userId}`)
};

// ✅ Dashboard API Functions
export const dashboardAPI = {
  getDashboardData: (userId) => instance.get(`/plantcare/dashboard/${userId}`),
  
  // Add more dashboard functions as needed
  updateWatering: (userId, data) => instance.patch(`/plantcare/watering/${userId}`, data),
  updatePruning: (userId, data) => instance.patch(`/plantcare/pruning/${userId}`, data),
  updateFertilizing: (userId, data) => instance.patch(`/plantcare/fertilizing/${userId}`, data)
};

// ✅ Plant Identification API
export const plantIdentificationAPI = {
  identifyPlant: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return instance.post('/plantcare/identify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  identifyFlower: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return instance.post('/plantcare/identify-flower', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// ✅ Helper function to convert data URL to File
export const dataURLtoFile = (dataurl, filename) => {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error('Error converting data URL to File:', error);
    return null;
  }
};

// ✅ Helper function to get user ID from localStorage
export const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.id || user?._id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// ✅ Test API connection
export const testAPI = async () => {
  try {
    const response = await instance.get('/health');
    return response.data;
  } catch (error) {
    console.error('API test failed:', error);
    return null;
  }
};

// ✅ Export default instance
export default instance;