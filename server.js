const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Set SendGrid API Key
sgMail.setApiKey('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');

// Endpoint to handle form submission
app.post('/send-email', (req, res) => {
    const { name, email, message } = req.body;

    const msg = {
        to: 'pandeyhari41@gmail.com', // Your email
        from: email, // Sender's email
        subject: 'New Message from Contact Form',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    sgMail.send(msg)
        .then(() => {
            res.status(200).json({ success: true, message: 'Email sent successfully!' });
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).json({ success: false, message: 'Failed to send email.' });
        });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});