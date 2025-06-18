document.addEventListener("DOMContentLoaded", function() {
    const accountButton = document.querySelector(".account-button");
    if (accountButton) {
        accountButton.addEventListener("click", function() {
            window.location.href = "checkoutform.html";
        });
    }
});