loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const response = await authService.login(username, password);
        
        if (response.token) {
            // Check if there's a redirect destination
            const redirectTo = localStorage.getItem('redirectAfterLogin');
            localStorage.removeItem('redirectAfterLogin'); // Clear it
            
            // Redirect to the saved page or dashboard
            window.location.href = redirectTo || 'dashboard.html';
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please check your credentials.', 'error');
    }
}); 