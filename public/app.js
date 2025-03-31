document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS for animations
  if (typeof AOS !== 'undefined') {
    AOS.init({ 
      duration: 1000, 
      once: true,
      offset: 120,
      easing: 'ease-out-quad'
    });
  }

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
