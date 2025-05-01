// server/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const validator = require('validator');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// Middleware
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.json()); // For parsing application/json
app.use(cors());
app.use(helmet());

// Serve static files from public and src folders
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/src', express.static(path.join(__dirname, '..', 'src')));

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'https://www.google.com', 'https://maps.googleapis.com'],
            scriptSrc: ["'self'", 'https://maps.googleapis.com'],
            frameSrc: ["'self'", 'https://www.google.com', 'https://maps.googleapis.com', 'https://www.google.com/maps/embed/'],
            imgSrc: ["'self'", 'https://maps.gstatic.com', 'https://maps.googleapis.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://maps.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        },
    })
);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Rate limiting for contact form submissions only
const contactFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many submissions from this IP, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Serve the contact form page (GET request) without rate limiting
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'contact.html'));
});

// Handle contact form submissions (POST request) with rate limiting
app.post('/contact', contactFormLimiter, async (req, res) => {
    let { 
        name, 
        email, 
        businessType, 
        serviceType, 
        projectSize, 
        timeline, 
        budget, 
        features, 
        requirements,
        phone // honeypot field
    } = req.body;

    // Honeypot check
    if (phone) {
        console.log('Bot detected through honeypot field.');
        return res.status(400).send('Bot detected. Submission rejected.');
    }

    // Check required fields
    if (!name || !email || !businessType || !serviceType || !projectSize || !timeline || !budget || !requirements) {
        return res.status(400).send('All required fields must be filled');
    }

    // Sanitize inputs
    name = validator.escape(name.trim());
    email = validator.normalizeEmail(email.trim());
    businessType = validator.escape(businessType.trim());
    serviceType = validator.escape(serviceType.trim());
    projectSize = validator.escape(projectSize.trim());
    timeline = validator.escape(timeline.trim());
    budget = validator.escape(budget.trim());
    // Don't escape requirements to allow some formatting
    requirements = requirements.trim();
    
    // Convert features array to string if present
    const featuresString = Array.isArray(features) ? features.join(', ') : '';

    // Validate email
    if (!validator.isEmail(email)) {
        return res.status(400).send('Invalid email address');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `New Website Project Inquiry - ${businessType}`,
        text: `
New project inquiry from your portfolio website:

Name: ${name}
Email: ${email}
Business Type: ${businessType}
Service Needed: ${serviceType}
Project Size: ${projectSize}
Timeline: ${timeline}
Budget Range: ${budget}
Selected Features: ${featuresString}

Project Requirements:
${requirements}
        `,
        html: `
<h2>New project inquiry from your portfolio website:</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Business Type:</strong> ${businessType}</p>
<p><strong>Service Needed:</strong> ${serviceType}</p>
<p><strong>Project Size:</strong> ${projectSize}</p>
<p><strong>Timeline:</strong> ${timeline}</p>
<p><strong>Budget Range:</strong> ${budget}</p>
<p><strong>Selected Features:</strong> ${featuresString}</p>
<h3>Project Requirements:</h3>
<p>${requirements.replace(/\n/g, '<br>')}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ 
            success: true, 
            message: 'Thank you for your inquiry! I will get back to you soon.' 
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message. Please try again later or contact me directly via email.' 
        });
    }
});

// Serve other HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));