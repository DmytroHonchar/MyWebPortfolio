document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS for animations
  if (typeof AOS !== 'undefined') {
    AOS.init({ 
      duration: 800, 
      once: true,
      offset: 100,
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

  // Mobile menu toggle (if needed)
  const mobileMenuToggle = () => {
    const nav = document.querySelector('.icon-navbar');
    if (window.innerWidth <= 768) {
      nav.classList.add('mobile-hidden');
      // Add mobile menu toggle logic if necessary
    }
  };
  window.addEventListener('resize', mobileMenuToggle);
  mobileMenuToggle();
});
