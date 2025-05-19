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

// Trust first proxy (if behind one)
app.set('trust proxy', 1);

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Enable CORS if needed
app.use(cors());

// Helmet for security, custom CSP
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
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

// Rate limiter for contact form submissions
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many submissions from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Route: serve contact form
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'contact.html'));
});

// Route: handle contact form submissions
app.post('/contact', contactFormLimiter, async (req, res) => {
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
    phone, // honeypot field
  } = req.body;

  // Honeypot check
  if (phone) {
    console.log('Bot detected via honeypot.');
    return res.status(400).send('Bot detected. Submission rejected.');
  }

  // Validate required fields
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

  // Format options for better readability
  const optionsMap = {
    // Project Size options
    projectSize: {
      'landing': 'Landing Page (1 page)',
      'small': 'Small (2-3 pages)',
      'medium': 'Medium (4-6 pages)',
      'large': 'Large (7+ pages)',
      'custom': 'Custom (Special Requirements)'
    },
    // Business Type options
    businessType: {
      'restaurant': 'Restaurant/Cafe',
      'beauty': 'Beauty/Barber Shop',
      'store': 'Instagram/Online Store',
      'local': 'Local Service Business',
      'fitness': 'Gym/Fitness',
      'other': 'Other Small Business'
    },
    // Service Type options
    serviceType: {
      'new-website': 'New Website',
      'redesign': 'Website Redesign',
      'fixes': 'Website Fixes/Updates',
      'features': 'Add New Features',
      'other': 'Other (Please Specify in Message)'
    },
    // Timeline options
    timeline: {
      'asap': 'ASAP (1-2 weeks)',
      'normal': 'Normal (2-4 weeks)',
      'flexible': 'Flexible (4+ weeks)'
    },
    // Budget Range options
    budget: {
      '200-500': '£200 - £500',
      '500-1000': '£500 - £1,000',
      '1000-2000': '£1,000 - £2,000',
      'discuss': 'Let\'s Discuss'
    }
  };
  
  // Format all form fields
  const formattedValues = {
    projectSize: optionsMap.projectSize[projectSize.toLowerCase()] || projectSize,
    businessType: optionsMap.businessType[businessType.toLowerCase()] || businessType,
    serviceType: optionsMap.serviceType[serviceType.toLowerCase()] || serviceType,
    timeline: optionsMap.timeline[timeline.toLowerCase()] || timeline,
    budget: optionsMap.budget[budget.toLowerCase()] || budget
  };

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).send('Invalid email address');
  }

  // Sanitize each feature (already human-readable labels)
  const sanitizedFeatures = features.map(f => validator.escape(f.trim()));
  // Join for plain-text
  const featuresString = sanitizedFeatures.join('\n');

  // Prepare mail options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New Website Project Inquiry - ${formattedValues.businessType}`,    text: `
New Project Inquiry
Name: ${name}
Email: ${email}
Type of Business: ${formattedValues.businessType}
Service Needed: ${formattedValues.serviceType}
Project Size: ${formattedValues.projectSize}
Timeline: ${formattedValues.timeline}
Budget Range: ${formattedValues.budget}

Key Features Needed:
${featuresString}

Additional Requirements:
${requirements}
    `,
    html: `
      <h2>New Project Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Type of Business:</strong> ${formattedValues.businessType}</p>
      <p><strong>Service Needed:</strong> ${formattedValues.serviceType}</p>
      <p><strong>Project Size:</strong> ${formattedValues.projectSize}</p>
      <p><strong>Timeline:</strong> ${formattedValues.timeline}</p>
      <p><strong>Budget Range:</strong> ${formattedValues.budget}</p>
      <h3>Key Features Needed:</h3>
      <ul>
        ${sanitizedFeatures.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <h3>Additional Requirements:</h3>
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

// Fallback to index.html for any other routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
