document.addEventListener('DOMContentLoaded', function() {
    const passField = document.getElementById("pass");
    // More specific selector to ensure we get the correct eye icon for the main login form
    const passEyeSpan = document.querySelector('.block-customer-login .pass-eye');

    if (passField && passEyeSpan) {
        passEyeSpan.addEventListener('click', function() {
            if (passField.type === "password") {
                passField.type = "text";
            } else {
                passField.type = "password";
            }
        });
    }

    // Optional: Add form validation feedback if you want basic client-side checks
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            const emailField = document.getElementById('email');
            const passwordField = document.getElementById('pass');
            let isValid = true;
            
            // Get the messages container - updated selector to match HTML structure
            let messagesContainer = document.querySelector('.page.messages [data-placeholder="messages"]');
            
            // Clear previous messages
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }

            // Email validation
            if (!emailField.value.trim()) {
                displayMessage('Email is required.', 'error', messagesContainer);
                emailField.classList.add('validation-failed');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
                displayMessage('Please enter a valid email address.', 'error', messagesContainer);
                emailField.classList.add('validation-failed');
                isValid = false;
            } else {
                emailField.classList.remove('validation-failed');
            }

            // Password validation
            if (!passwordField.value.trim()) {
                displayMessage('Password is required.', 'error', messagesContainer);
                passwordField.classList.add('validation-failed');
                isValid = false;
            } else {
                passwordField.classList.remove('validation-failed');
            }

            if (!isValid) {
                event.preventDefault(); // Prevent form submission if validation fails
            }
        });
    }

    function displayMessage(message, type, container) {
        if (container) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message-${type} ${type}`;
            const innerDiv = document.createElement('div');
            innerDiv.textContent = message;
            messageDiv.appendChild(innerDiv);
            container.appendChild(messageDiv);
        } else {
            console.error('Messages container not found');
        }
    }
});