export const API_URL = "http://localhost:5000";

export const userToken = () => {
    const userData = localStorage.getItem("token");
    if (!userData) return null; // Agar data nahi hai toh null return karo
    
    try {
        return JSON.parse(userData); // Safe parse
    } catch (error) {
        console.error("Invalid JSON in localStorage:", error);
        return null;
    }
};
