document.addEventListener('DOMContentLoaded', () => {
    // Delete confirmation for product forms
    const deleteForms = document.querySelectorAll('form.delete-form'); // Target forms with class 'delete-form'

    deleteForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            // 'this' refers to the form element
            const deleteButton = this.querySelector('.btn-delete-product');
            let productName = 'this product'; // Default value

            if (deleteButton && deleteButton.dataset.productName) {
                productName = deleteButton.dataset.productName;
            }

            // The product name from data-product-name is already HTML-decoded by the browser
            // when accessed via `dataset`. So, `My "Special" Product` becomes `My "Special" Product`.
            const confirmation = confirm(`Are you sure you want to delete: ${productName}?`);
            
            if (!confirmation) {
                event.preventDefault(); // Stop form submission if user clicks 'Cancel'
            }
            // If user clicks 'OK', the form will submit as usual.
        });
    });

    // You can add more client-side JavaScript interactions here, for example:
    // - Client-side form validation (though HTML5 'required' is already in use)
    // - AJAX submissions for a smoother UX
    // - Dynamic UI updates
});