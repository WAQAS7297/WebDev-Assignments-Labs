document.addEventListener('DOMContentLoaded', function () {
    // Password visibility toggle for individual eye icons
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const targetInputId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetInputId);
            if (passwordInput) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                } else {
                    passwordInput.type = 'password';
                }
            }
        });
    });

    // "Show Password" checkbox to toggle both password fields
    const showPasswordCheckbox = document.getElementById('show-password-checkbox');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('password-confirmation');

    if (showPasswordCheckbox && passwordField && confirmPasswordField) {
        showPasswordCheckbox.addEventListener('change', function () {
            const newType = this.checked ? 'text' : 'password';
            passwordField.type = newType;
            confirmPasswordField.type = newType;
        });
    }

    // Form validation
    const form = document.getElementById('form-validate');
    const messagesContainer = document.querySelector('.page.messages [data-placeholder="messages"]');

    function displayMessage(message, type) {
        if (messagesContainer) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message-${type} ${type}`;
            const innerDiv = document.createElement('div');
            innerDiv.textContent = message;
            messageDiv.appendChild(innerDiv);
            messagesContainer.appendChild(messageDiv);
        }
    }

    function clearMessages() {
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            clearMessages();

            let isValid = true;
            const fields = {
                firstname: document.getElementById('firstname'),
                lastname: document.getElementById('lastname'),
                email: document.getElementById('email_address'),
                password: passwordField,
                confirmPassword: confirmPasswordField
            };

            // Clear previous validation states
            Object.values(fields).forEach(field => {
                if (field) {
                    field.classList.remove('validation-failed');
                }
            });

            // Validate required fields
            Object.entries(fields).forEach(([key, field]) => {
                if (field && !field.value.trim()) {
                    field.classList.add('validation-failed');
                    displayMessage(`${key.charAt(0).toUpperCase() + key.slice(1)} is required.`, 'error');
                    isValid = false;
                }
            });

            // Email validation
            if (fields.email && fields.email.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(fields.email.value)) {
                    fields.email.classList.add('validation-failed');
                    displayMessage('Please enter a valid email address.', 'error');
                    isValid = false;
                }
            }

            // Password validation
            if (fields.password && fields.confirmPassword && 
                fields.password.value && fields.confirmPassword.value) {
                if (fields.password.value !== fields.confirmPassword.value) {
                    fields.confirmPassword.classList.add('validation-failed');
                    displayMessage('Passwords do not match.', 'error');
                    isValid = false;
                }
            }

            // Terms & Conditions validation
            const termsCheckbox = document.getElementById('terms_conditions');
            if (termsCheckbox && !termsCheckbox.checked) {
                displayMessage('Please accept the Terms & Conditions.', 'error');
                isValid = false;
            }

            // Marketing consent validation
            const marketingCheckbox = document.getElementById('marketing_consent');
            if (marketingCheckbox && !marketingCheckbox.checked) {
                displayMessage('Please give your consent for marketing purposes.', 'error');
                isValid = false;
            }

            // reCAPTCHA validation
            if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse().length === 0) {
                displayMessage('Please complete the reCAPTCHA verification.', 'error');
                isValid = false;
            }

            if (isValid) {
                // In a real application, you would submit the form here
                console.log('Form is valid, ready to submit');
                form.submit();
            }
        });

        // Real-time password match validation
        if (confirmPasswordField && passwordField) {
            const validatePasswordMatch = () => {
                if (confirmPasswordField.value && passwordField.value !== confirmPasswordField.value) {
                    confirmPasswordField.classList.add('validation-failed');
                } else {
                    confirmPasswordField.classList.remove('validation-failed');
                }
            };

            confirmPasswordField.addEventListener('input', validatePasswordMatch);
            passwordField.addEventListener('input', validatePasswordMatch);
        }
    }
});

/**
 * Note on reCAPTCHA:
 * The reCAPTCHA widget is rendered by the external Google script (`api.js`).
 * Ensure the `data-sitekey` attribute on the `<div class="g-recaptcha">` in `index.html`
 * is set to your actual reCAPTCHA v2 "I'm not a robot" Checkbox site key.
 * The JavaScript includes a basic check for `grecaptcha.getResponse().length === 0`.
 * For server-side validation (which is crucial for security), you would send
 * `g-recaptcha-response` (from the textarea automatically created by reCAPTCHA)
 * to your server and verify it using your secret key with Google's API.
 */