// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Endpoints
const API = {
    // Authentication
    ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
    STUDENT_LOGIN: `${API_BASE_URL}/auth/student/login`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    
    // Admin
    DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats`,
    STUDENTS: `${API_BASE_URL}/admin/students`,
    IMPORT_STUDENTS: `${API_BASE_URL}/admin/students/import`,
    
    // Halls
    HALLS: `${API_BASE_URL}/halls`,
    
    // Exams
    EXAMS: `${API_BASE_URL}/exams`,
    ELIGIBLE_STUDENTS: (examId) => `${API_BASE_URL}/exams/${examId}/eligible-students`,
    
    // Allocations
    ALLOCATIONS: `${API_BASE_URL}/allocations`,
    ALLOCATE_SEATS: `${API_BASE_URL}/allocations/allocate`,
    EXAM_ALLOCATIONS: (examId) => `${API_BASE_URL}/allocations/exam/${examId}`,
    SEATING_PLAN: (examId, hallId) => `${API_BASE_URL}/allocations/seating-plan/${examId}/${hallId}`,
    
    // Student
    STUDENT_PROFILE: `${API_BASE_URL}/student/profile`,
    STUDENT_EXAMS: `${API_BASE_URL}/student/exams`,
    STUDENT_ALLOCATION: (examId) => `${API_BASE_URL}/student/allocation/${examId}`,
    STUDENT_ALLOCATIONS: `${API_BASE_URL}/student/allocations`,
};

// Helper Functions
const getAuthToken = () => {
    return localStorage.getItem('token');
};

const setAuthToken = (token) => {
    localStorage.setItem('token', token);
};

const removeAuthToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

const setUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

// API Request Helper
const apiRequest = async (url, options = {}) => {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        const data = await response.json();
        
        // Handle authentication errors
        if (response.status === 401) {
            console.error('Authentication error:', data.error);
            
            // Auto logout on token errors
            if (data.code === 'TOKEN_EXPIRED' || data.code === 'INVALID_TOKEN' || data.code === 'NO_TOKEN') {
                showAlert('Session expired. Please login again.', 'error');
                setTimeout(() => {
                    removeAuthToken();
                    const currentUser = getUser();
                    const loginPage = currentUser?.role === 'admin' ? '/admin/login.html' : '/student/login.html';
                    window.location.href = loginPage;
                }, 2000);
            }
            
            throw new Error(data.error || 'Authentication failed');
        }
        
        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Show Alert Message
const showAlert = (message, type = 'success') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    const container = document.querySelector('.login-form') || document.querySelector('.main-content');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
};

// Format Date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Format Time
const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

// Check Authentication
const checkAuth = (requiredRole) => {
    const token = getAuthToken();
    const user = getUser();
    
    if (!token || !user) {
        window.location.href = requiredRole === 'admin' ? '/admin/login.html' : '/student/login.html';
        return false;
    }
    
    if (requiredRole && user.role !== requiredRole) {
        window.location.href = '/index.html';
        return false;
    }
    
    return true;
};

// Logout
const logout = () => {
    removeAuthToken();
    window.location.href = '/index.html';
};
