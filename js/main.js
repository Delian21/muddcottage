/**
 * Mudd Cottage Herbhome - Enhanced JavaScript
 * Rich animations, typing effects, parallax, stagger reveals
 */

(function() {
  'use strict';

  // ===== Initialize Lucide Icons =====
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ===== Header Scroll Effect =====
  const header = document.getElementById('header');
  
  function handleScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ===== Mobile Navigation Toggle =====
  const mobileToggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('nav');
  
  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });
    
    nav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileToggle.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        mobileToggle.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ===== Scroll Animations (Intersection Observer) =====
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(function(el) {
    observer.observe(el);
  });

  // ===== Staggered Animation for Grid Items =====
  const staggerObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.fade-up');
        cards.forEach(function(card, index) {
          card.style.transitionDelay = (index * 0.12) + 's';
          card.classList.add('visible');
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.focus-grid, .services-grid').forEach(function(grid) {
    staggerObserver.observe(grid);
  });

  // ===== Typing Effect for Hero Title =====
  function initTypingEffect() {
    const accentEl = document.querySelector('.hero-content h1 .accent');
    if (!accentEl) return;
    
    const text = accentEl.textContent;
    accentEl.textContent = '';
    accentEl.style.borderRight = '2px solid var(--green-mid)';
    
    let charIndex = 0;
    
    function typeChar() {
      if (charIndex < text.length) {
        accentEl.textContent += text[charIndex];
        charIndex++;
        setTimeout(typeChar, 80 + Math.random() * 40);
      } else {
        // Remove cursor after typing
        setTimeout(function() {
          accentEl.style.borderRight = 'none';
        }, 1000);
      }
    }
    
    // Start after hero animation
    setTimeout(typeChar, 1200);
  }
  
  initTypingEffect();

  // ===== Counter Animation for Trust Bar =====
  function animateCounters() {
    const counters = document.querySelectorAll('.trust-item .number');
    
    counters.forEach(function(counter) {
      const text = counter.textContent;
      const match = text.match(/(\d+)/);
      if (!match) return;
      
      const target = parseInt(match[0]);
      const suffix = text.replace(match[0], '');
      let current = 0;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      const stepTime = duration / steps;
      
      const counterObserver = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
          function updateCounter() {
            current += increment;
            if (current >= target) {
              counter.textContent = target + suffix;
              // Add a subtle bounce
              counter.style.transform = 'scale(1.1)';
              setTimeout(function() {
                counter.style.transform = 'scale(1)';
                counter.style.transition = 'transform 0.3s ease';
              }, 150);
              return;
            }
            counter.textContent = Math.floor(current) + suffix;
            requestAnimationFrame(function() {
              setTimeout(updateCounter, stepTime);
            });
          }
          updateCounter();
          counterObserver.unobserve(counter);
        }
      }, { threshold: 0.5 });
      
      counterObserver.observe(counter);
    });
  }
  
  animateCounters();

  // ===== Parallax Effect =====
  let ticking = false;
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        const scrolled = window.scrollY;
        
        // Hero parallax
        const hero = document.querySelector('.hero');
        if (hero && scrolled < window.innerHeight) {
          const visual = hero.querySelector('.hero-visual');
          if (visual) {
            visual.style.transform = 'translateY(' + (scrolled * 0.12) + 'px)';
          }
        }
        
        // Floating cards parallax
        document.querySelectorAll('.float-card').forEach(function(card, i) {
          card.style.transform = 'translateY(' + ((scrolled * 0.05 * (i + 1)) - 10) + 'px)';
        });
        
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ===== Contact Form Handling =====
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const name = formData.get('name');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const subject = formData.get('subject');
      const message = formData.get('message');
      
      let whatsappMessage = 'Hello Mudd Cottage! 🌿\n\n';
      whatsappMessage += 'Name: ' + name + '\n';
      if (email) whatsappMessage += 'Email: ' + email + '\n';
      if (phone) whatsappMessage += 'Phone: ' + phone + '\n';
      if (subject) whatsappMessage += 'Topic: ' + subject + '\n';
      whatsappMessage += '\nMessage: ' + message;
      
      const encodedMessage = encodeURIComponent(whatsappMessage);
      window.open('https://wa.me/2348028027119?text=' + encodedMessage, '_blank');
      
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '✅ Opening WhatsApp...';
      submitBtn.style.background = 'linear-gradient(135deg, #5c6b58, #4a5c46)';
      submitBtn.disabled = true;
      
      setTimeout(function() {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        contactForm.reset();
      }, 3000);
    });
  }

  // ===== Smooth Scroll for Anchor Links =====
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== Image Reveal on Scroll =====
  var imageObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'scale(1)';
        imageObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.service-card img, .about-image img').forEach(function(img) {
    img.style.opacity = '0';
    img.style.transform = 'scale(1.05)';
    img.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    imageObserver.observe(img);
  });

  // ===== Magnetic Button Effect =====
  document.querySelectorAll('.btn').forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      var rect = this.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      this.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15 - 3) + 'px)';
    });
    
    btn.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // ===== Cursor Glow on Focus Cards =====
  document.querySelectorAll('.focus-card, .service-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = this.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      this.style.background = 'radial-gradient(circle 200px at ' + x + 'px ' + y + 'px, rgba(74, 124, 35, 0.04), transparent), rgba(255,255,255,0.75)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.background = '';
    });
  });

  // ===== Testimonial Carousel =====
  function initTestimonialCarousel() {
    var carousels = document.querySelectorAll('.testimonial-carousel');
    
    carousels.forEach(function(carousel) {
      var cards = carousel.querySelectorAll('.testimonial-card');
      var dots = carousel.querySelectorAll('.dot');
      var currentIndex = 0;
      var autoplayInterval;
      
      function goToSlide(index) {
        cards[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        currentIndex = index;
        cards[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
      }
      
      function nextSlide() {
        goToSlide((currentIndex + 1) % cards.length);
      }
      
      // Dot click navigation
      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          clearInterval(autoplayInterval);
          goToSlide(parseInt(this.dataset.index));
          startAutoplay();
        });
      });
      
      // Touch/swipe support
      var touchStartX = 0;
      var touchEndX = 0;
      
      carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(autoplayInterval);
      }, { passive: true });
      
      carousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            goToSlide((currentIndex + 1) % cards.length);
          } else {
            goToSlide((currentIndex - 1 + cards.length) % cards.length);
          }
        }
        startAutoplay();
      }, { passive: true });
      
      function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000);
      }
      
      startAutoplay();
    });
  }
  
  initTestimonialCarousel();

})();
