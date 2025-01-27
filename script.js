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

// SendGrid Integration
document.getElementById('message-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
    };

    // Send email using SendGrid API
    sendEmail(formData);
});

// Function to send email via SendGrid
function sendEmail(formData) {
    const apiKey = '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'; // Your SendGrid API Key
    const url = 'https://api.sendgrid.com/v3/mail/send';

    const emailData = {
        personalizations: [
            {
                to: [{ email: 'pandeyhari41@gmail.com' }], // Your email address
                subject: 'New Message from Contact Form',
            },
        ],
        from: { email: formData.email, name: formData.name }, // Sender email and name
        content: [
            {
                type: 'text/plain',
                value: `Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`,
            },
        ],
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
    })
        .then((response) => {
            if (response.ok) {
                document.getElementById('form-status').textContent = "Message sent successfully!";
                document.getElementById('message-form').reset(); // Clear the form
            } else {
                throw new Error('Failed to send email');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            document.getElementById('form-status').textContent = "Failed to send message. Please try again.";
        });
}
