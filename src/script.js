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

  // Testimonial card hover effect with better mobile handling
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  
  // Store original styles for each card
  testimonialCards.forEach(card => {
    const originalTransform = window.getComputedStyle(card).transform;
    
    // Only add event listeners - they will be controlled by CSS media queries
    card.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        card.style.transform = 'translateY(-8px)';
        card.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.3)';
        card.style.backgroundColor = '#222';
      }
    });
    
    card.addEventListener('mouseleave', () => {
      if (window.innerWidth > 768) {
        card.style.transform = originalTransform;
        card.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
        card.style.backgroundColor = '#1a1a1a';
      }
    });
  });

  // Contact form submission handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitButton = this.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      try {
        const formData = new FormData(this);
        const response = await fetch('/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Object.fromEntries(formData)),
        });

        const result = await response.json();
        
        if (result.success) {
          alert(result.message);
          this.reset();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        alert(error.message || 'Failed to send message. Please try again later.');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
      }
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

  // Mobile testimonials swipe and pagination
  const testimonialsGrid = document.querySelector('.testimonials-grid');
  const dots = document.querySelectorAll('.testimonials-dots .dot');
  let touchStartX = 0;
  let currentSlide = 0;

  if (testimonialsGrid && window.innerWidth <= 768) {
    // Touch start
    testimonialsGrid.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });

    // Touch end
    testimonialsGrid.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0 && currentSlide < dots.length - 1) {
          // Swipe left
          currentSlide++;
        } else if (diff < 0 && currentSlide > 0) {
          // Swipe right
          currentSlide--;
        }
        updateTestimonialSlide();
      }
    });

    // Update active slide
    function updateTestimonialSlide() {
      testimonialsGrid.scroll({
        left: currentSlide * testimonialsGrid.offsetWidth,
        behavior: 'smooth'
      });
      
      // Update dots
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
    }

    // Click on dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentSlide = index;
        updateTestimonialSlide();
      });
    });
  }
});
