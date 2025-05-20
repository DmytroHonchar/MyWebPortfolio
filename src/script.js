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

  testimonialCards.forEach(card => {
    const originalTransform = window.getComputedStyle(card).transform;
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

// --- Contact form submission handler (updated) ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  // Ensure there's a message box
  let msgBox = document.getElementById('formMessage');
  if (!msgBox) {
    msgBox = document.createElement('div');
    msgBox.id = 'formMessage';
    msgBox.className = 'form-message';
    contactForm.appendChild(msgBox);
  }

  // Submission handler (with improved error parsing + auto-hide)
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitButton = this.querySelector('button[type="submit"]');
    // Reset & hide message box
    msgBox.className = 'form-message';
    msgBox.textContent = '';

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      const formData = new FormData(this);
      const features = Array.from(
        this.querySelectorAll('input[name="features[]"]:checked')
      ).map(input =>
        input.closest('.feature-checkbox')
             .querySelector('.feature-label')
             .textContent.trim()
      );

      const data = Object.fromEntries(formData);
      data.features = features;

      const response = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      // If non-2xx, parse JSON error body if possible, otherwise text
      if (!response.ok) {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const errJson = await response.json();
          throw new Error(errJson.message || 'Failed to send message.');
        } else {
          const text = await response.text();
          throw new Error(text || 'Failed to send message.');
        }
      }

      // 2xx → parse JSON normally
      const result = await response.json();

      if (result.success) {
        msgBox.classList.add('form-message--success');
        msgBox.textContent = result.message;
        this.reset();
      } else {
        throw new Error(result.message || 'Something went wrong.');
      }

    } catch (err) {
      msgBox.classList.add('form-message--error');
      msgBox.textContent = err.message;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';

      // Auto-hide both success & error after 5s
      setTimeout(() => {
        msgBox.className = 'form-message';
        msgBox.textContent = '';
      }, 5000);
    }
  });
}


  // Email and Phone Protection
  const emailLinks = document.querySelectorAll('.email-protect');
  emailLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const email = this.getAttribute('data-email');
      this.textContent = email;
      this.href = `mailto:${email}`;
    });
  });

  const phoneLinks = document.querySelectorAll('.phone-protect');
  phoneLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const phone = this.getAttribute('data-phone');
      this.textContent = phone;
      this.href = `tel:${phone}`;
    });
  });

  // Bot Protection: data-text attr for no-bot elements
  document.querySelectorAll('.no-bot').forEach(function(element) {
    element.setAttribute('data-text', element.textContent);
  });

  // Bot Protection - Obfuscate email and phone after page loads
  setTimeout(function() {
    // Obfuscate email addresses
    document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
      const email = link.getAttribute('href').replace('mailto:', '');
      const parts = email.split('@');
      if (parts.length === 2) {
        const username = parts[0].split('').reverse().join('');
        const domain = parts[1].split('').reverse().join('');
        link.setAttribute('data-username', username);
        link.setAttribute('data-domain', domain);
      }
    });

    // Obfuscate phone numbers
    document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
      const phone = link.getAttribute('href').replace('tel:', '');
      const obfuscatedPhone = phone.split('').reverse().join('');
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

      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSlide < dots.length - 1) {
          currentSlide++;
        } else if (diff < 0 && currentSlide > 0) {
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
