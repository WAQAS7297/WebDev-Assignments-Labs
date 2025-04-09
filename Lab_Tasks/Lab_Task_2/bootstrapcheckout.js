document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('checkoutForm');
    const fields = {
        fullName: { element: document.getElementById('fullName'), error: document.getElementById('fullNameError') },
        email: { element: document.getElementById('email'), error: document.getElementById('emailError') },
        phone: { element: document.getElementById('phone'), error: document.getElementById('phoneError') },
        address: { element: document.getElementById('address'), error: document.getElementById('addressError') },
        creditCard: { element: document.getElementById('creditCard'), error: document.getElementById('creditCardError') },
        expiryDate: { element: document.getElementById('expiryDate'), error: document.getElementById('expiryDateError') },
        cvv: { element: document.getElementById('cvv'), error: document.getElementById('cvvError') }
    };

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        let isValid = true;

        Object.values(fields).forEach(field => {
            field.element.classList.remove('invalid-field');
            field.error.style.display = 'none';
        });

        if (!fields.fullName.element.checkValidity()) {
            fields.fullName.element.classList.add('invalid-field');
            fields.fullName.error.style.display = 'block';
            isValid = false;
        }

        if (!fields.email.element.checkValidity()) {
            fields.email.element.classList.add('invalid-field');
            fields.email.error.style.display = 'block';
            isValid = false;
        }

        if (!fields.phone.element.checkValidity()) {
            fields.phone.element.classList.add('invalid-field');
            fields.phone.error.style.display = 'block';
            isValid = false;
        }
        if (!fields.address.element.checkValidity()) {
            fields.address.element.classList.add('invalid-field');
            fields.address.error.style.display = 'block';
            isValid = false;
        }

        if (!fields.creditCard.element.checkValidity()) {
            fields.creditCard.element.classList.add('invalid-field');
            fields.creditCard.error.style.display = 'block';
            isValid = false;
        }

        const today = new Date().toISOString().split('T')[0];
        if (!fields.expiryDate.element.checkValidity() || fields.expiryDate.element.value < today) {
            fields.expiryDate.element.classList.add('invalid-field');
            fields.expiryDate.error.style.display = 'block';
            isValid = false;
        }

        if (!fields.cvv.element.checkValidity()) {
            fields.cvv.element.classList.add('invalid-field');
            fields.cvv.error.style.display = 'block';
            isValid = false;
        }
        if (isValid) {
            alert('Order placed successfully!');
            form.reset();
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("scroll", function () {
        let header = document.querySelector("header");
        header.classList.toggle("scrolled1", window.scrollY > 50);
    });
});