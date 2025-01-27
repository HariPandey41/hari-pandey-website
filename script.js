document.getElementById('message-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
    };

    fetch('http://localhost:3000/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById('form-status').textContent = data.message;
            if (data.success) {
                document.getElementById('message-form').reset(); // Clear the form
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            document.getElementById('form-status').textContent = 'Failed to send message. Please try again.';
        });
});
