document.addEventListener('DOMContentLoaded', function() {
    const authService = new AuthService();
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // If user is already authenticated, redirect to dashboard
    if (authService.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Clear any previous error messages
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';

            // Attempt login
            await authService.login(username, password);
            
            // If successful, redirect to dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            // Display error message
            errorMessage.textContent = 'Invalid username or password';
            errorMessage.style.display = 'block';
        }
    });
}); 