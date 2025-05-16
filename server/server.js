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

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Enable CORS if needed
app.use(cors());

// Initialize Helmet but turn off its built-in CSP
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Now apply your custom CSP before serving any static assets
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://maps.googleapis.com',
        'https://cdnjs.cloudflare.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://maps.googleapis.com',
        'https://cdnjs.cloudflare.com',
      ],
      imgSrc: ["'self'", 'https://maps.gstatic.com', 'https://maps.googleapis.com'],
      frameSrc: [
        "'self'",
        'https://www.google.com',
        'https://maps.googleapis.com',
        'https://www.google.com/maps/embed/',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/src', express.static(path.join(__dirname, '..', 'src')));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rate limiter for contact form
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many submissions from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form page (no rate limit)
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'contact.html'));
});

// Handle form submission with rate limiting
app.post('/contact', contactFormLimiter, async (req, res) => {
  // Pull in features[], defaulting to an empty array if none sent
  let {
    name,
    email,
    businessType,
    serviceType,
    projectSize,
    timeline,
    budget,
    features = [],
    requirements,
    phone, // honeypot
  } = req.body;

  // Honeypot: reject bots
  if (phone) {
    console.log('Bot detected via honeypot.');
    return res.status(400).send('Bot detected. Submission rejected.');
  }

  // All required fields
  if (
    !name ||
    !email ||
    !businessType ||
    !serviceType ||
    !projectSize ||
    !timeline ||
    !budget ||
    !requirements
  ) {
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
  requirements = requirements.trim();

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).send('Invalid email address');
  }

  // Escape each feature and join into a comma-separated string
  const featuresString = features
    .map((f) => validator.escape(f))
    .join(', ');

  // Prepare mail
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New Website Project Inquiry - ${businessType}`,
    text: `
New project inquiry:

Name: ${name}
Email: ${email}
Business Type: ${businessType}
Service Needed: ${serviceType}
Project Size: ${projectSize}
Timeline: ${timeline}
Budget Range: ${budget}
Selected Features: ${featuresString}

Requirements:
${requirements}
    `,
    html: `
      <h2>New project inquiry:</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Business Type:</strong> ${businessType}</p>
      <p><strong>Service Needed:</strong> ${serviceType}</p>
      <p><strong>Project Size:</strong> ${projectSize}</p>
      <p><strong>Timeline:</strong> ${timeline}</p>
      <p><strong>Budget Range:</strong> ${budget}</p>
      <p><strong>Selected Features:</strong> ${featuresString || 'None'}</p>
      <h3>Requirements:</h3>
      <p>${requirements.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: 'Thank you for your inquiry! I will get back to you soon.',
    });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
});

// Fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
