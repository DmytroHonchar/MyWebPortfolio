document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS for animations
  if (typeof AOS !== 'undefined') {
    AOS.init({ 
      duration: 800, 
      once: true,
      offset: 50,
      easing: 'ease-out-cubic',
      delay: 0
    });
  }

  // Step indicators animation on scroll
  const stepContainers = document.querySelectorAll('.step-container');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -20% 0px', // Adjust this to control when steps become active
    threshold: 0.2
  };

  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove active class from all steps
        stepContainers.forEach(step => step.classList.remove('active'));
        // Add active class to current step
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  // Observe each step container
  stepContainers.forEach(step => stepObserver.observe(step));

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  // Portfolio hover effect
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  portfolioItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateY(-10px)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateY(0)';
    });
  });

  // Testimonial card hover effect with AOS compatibility
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  testimonialCards.forEach(card => {
    // Store original transform for reset
    const originalTransform = window.getComputedStyle(card).transform;
    
    card.addEventListener('mouseenter', () => {
      // Apply hover effect regardless of AOS state
      card.style.transform = 'translateY(-8px)';
      card.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.3)';
      card.style.backgroundColor = '#222';
    });
    
    card.addEventListener('mouseleave', () => {
      // Reset to original state
      card.style.transform = originalTransform;
      card.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
      card.style.backgroundColor = '#1a1a1a';
    });
  });

  // Contact form submission handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Your form submission logic here
      console.log('Form submitted!');
      this.reset();
    });
  }



  // Email and Phone Protection
  // Handle email protection
  const emailLinks = document.querySelectorAll('.email-protect');
  emailLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const email = this.getAttribute('data-email');
      this.textContent = email;
      this.href = `mailto:${email}`;
    });
  });

  // Handle phone protection
  const phoneLinks = document.querySelectorAll('.phone-protect');
  phoneLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const phone = this.getAttribute('data-phone');
      this.textContent = phone;
      this.href = `tel:${phone}`;
    });
  });

  // Bot Protection
  // Set data-text attribute for no-bot elements
  document.querySelectorAll('.no-bot').forEach(function(element) {
    element.setAttribute('data-text', element.textContent);
  });

  // Bot Protection - Obfuscate email and phone after page loads
  setTimeout(function() {
    // Find all email and phone links
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    // Obfuscate email addresses
    emailLinks.forEach(function(link) {
      const email = link.getAttribute('href').replace('mailto:', '');
      const parts = email.split('@');
      if (parts.length === 2) {
        const username = parts[0];
        const domain = parts[1];
        
        // Create a slightly obfuscated version for bots
        const obfuscatedUsername = username.split('').reverse().join('');
        const obfuscatedDomain = domain.split('').reverse().join('');
        
        // Add data attributes with obfuscated values
        link.setAttribute('data-username', obfuscatedUsername);
        link.setAttribute('data-domain', obfuscatedDomain);
      }
    });
    
    // Obfuscate phone numbers
    phoneLinks.forEach(function(link) {
      const phone = link.getAttribute('href').replace('tel:', '');
      
      // Create a slightly obfuscated version for bots
      const obfuscatedPhone = phone.split('').reverse().join('');
      
      // Add data attribute with obfuscated value
      link.setAttribute('data-phone', obfuscatedPhone);
    });
  }, 1000);
});
