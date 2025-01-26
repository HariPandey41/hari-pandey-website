// Function to show the selected section and hide others
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
}

// Show the About section by default when the page loads
document.addEventListener('DOMContentLoaded', () => {
    showSection('about');
});

// EmailJS Integration
(function () {
    emailjs.init("YOUR_EMAILJS_USER_ID"); // Replace with your EmailJS user ID
})();

document.getElementById('message-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
    };

    // Send email using EmailJS
    emailjs.send("service_n0u4x8b", "template_hbi5ioe", formData)
        .then(() => {
            document.getElementById('form-status').textContent = "Message sent successfully!";
            document.getElementById('message-form').reset(); // Clear the form
        })
        .catch(() => {
            document.getElementById('form-status').textContent = "Failed to send message. Please try again.";
        });
});
