const API_URL = 'http://localhost:5000/api';

// Toast Notification
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px) scale(0.9)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Authentication
function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Update UI based on auth state
function updateAuthUI() {
    const authNav = document.getElementById('auth-nav');
    if (!authNav) return;

    const user = getUser();
    if (user) {
        let dashboardLink = user.role === 'hr' ? 'hr-dashboard.html' : 'dashboard.html';
        authNav.innerHTML = `
            <a href="${dashboardLink}" class="btn btn-outline" style="margin-right: 10px;">Dashboard</a>
            <button onclick="logout()" class="btn btn-primary">Logout</button>
        `;
    } else {
        authNav.innerHTML = `
            <a href="login.html" class="nav-link">Log In</a>
            <a href="register.html" class="btn btn-primary">Sign Up</a>
        `;
    }
}

// Global API Fetch wrapper with Auth
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Remove Content-Type if uploading File (FormData handles it)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});
