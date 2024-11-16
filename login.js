
// login.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Perform login logic here
        console.log('Logging in with', email, password);
        
        // Example: Redirect to dashboard
        window.location.href = 'dashboard.html';
    });
});
