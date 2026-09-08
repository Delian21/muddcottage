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

  // ===== Reduced Motion =====
  // Honour the OS "reduce motion" setting across every scripted animation:
  // typing effect, parallax, smooth anchor scrolling, counter bounce.
  var reduceMotion = false;
  try {
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion = motionQuery.matches;
    var onMotionChange = function(e) { reduceMotion = e.matches; };
    motionQuery.addEventListener ? motionQuery.addEventListener('change', onMotionChange)
                                 : motionQuery.addListener(onMotionChange);
  } catch (e) {}

  // ===== Theme Toggle (three-state: light / dark / system default) =====
  var themeToggle = document.getElementById('themeToggle');

  function applyTheme(mode) {
    var systemDark = false;
    try { systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) {}
    var dark = mode === 'dark' || (mode === 'system' && systemDark);
    document.documentElement.classList.toggle('theme-dark', dark);
    try { localStorage.setItem('mc-theme', mode); } catch (e) {}
  }

  // The button shows one icon per mode: sun = light, moon = dark,
  // monitor = system default (what the OS preference currently resolves to
  // is spelled out in the aria-label).
  function themeIconFor(mode) {
    if (mode === 'light') return 'sun';
    if (mode === 'dark') return 'moon';
    return 'monitor';
  }

  function renderThemeToggle(mode) {
    if (!themeToggle) return;
    themeToggle.classList.remove('show-sun', 'show-moon', 'show-monitor');
    themeToggle.classList.add('show-' + themeIconFor(mode));
    var label = mode === 'system' ? 'Theme: system default (currently '
      : 'Theme: ';
    themeToggle.setAttribute('aria-label',
      label + (document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light') +
      (mode === 'system' ? ')' : '') + '. Click to switch to ' +
      (mode === 'light' ? 'dark' : mode === 'dark' ? 'system default' : 'light'));
  }

  function getThemeMode() {
    var mode = 'system';
    try {
      var saved = localStorage.getItem('mc-theme');
      if (saved === 'light' || saved === 'dark') mode = saved;
    } catch (e) {}
    return mode;
  }

  if (themeToggle) {
    var themeMode = getThemeMode();

    // Replay the entrance animation on page show so the toggle slides in on
    // every navigation, not just the first load (browsers keep it alive).
    window.addEventListener('pageshow', function() {
      themeToggle.style.animation = 'none';
      // Force a reflow so restarting the animation actually takes effect.
      void themeToggle.offsetWidth;
      themeToggle.style.animation = '';
    });

    themeToggle.addEventListener('click', function() {
      themeMode = themeMode === 'light' ? 'dark'
        : themeMode === 'dark' ? 'system'
        : 'light';
      applyTheme(themeMode);
      renderThemeToggle(themeMode);
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    // Keep following the OS while in system mode (e.g. auto dark at sunset).
    try {
      var schemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      var onSchemeChange = function() {
        if (themeMode === 'system') {
          applyTheme('system');
          renderThemeToggle('system');
        }
      };
      schemeQuery.addEventListener ? schemeQuery.addEventListener('change', onSchemeChange)
                                   : schemeQuery.addListener(onSchemeChange);
    } catch (e) {}
  }

  renderThemeToggle(getThemeMode());

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
    if (reduceMotion) return; // Leave the full title in place, no typing
    
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
            if (!reduceMotion) {
              // Add a subtle bounce
              counter.style.transform = 'scale(1.1)';
              setTimeout(function() {
                counter.style.transform = 'scale(1)';
                counter.style.transition = 'transform 0.3s ease';
              }, 150);
            }
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
    if (reduceMotion) return; // No parallax when motion is reduced
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
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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

  // ===== Mobile Swipe Carousel Dots (focus + services grids) =====
  // On mobile these grids become horizontal snap carousels (see style.css).
  // Dots are injected on desktop too so adding/removing them on resize stays
  // simple; CSS keeps them hidden until the mobile layout kicks in.
  function initSwipeCarouselDots() {
    var mediaQuery = window.matchMedia('(max-width: 768px)');

    document.querySelectorAll('.focus-grid, .services-grid').forEach(function(track) {
      var cards = track.querySelectorAll('.focus-card, .service-card');
      if (!cards.length) return;

      var dotsWrap = document.createElement('div');
      dotsWrap.className = 'carousel-dots';
      dotsWrap.setAttribute('role', 'tablist');
      dotsWrap.setAttribute('aria-label', 'Carousel position');

      var dots = Array.prototype.map.call(cards, function(_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to card ' + (i + 1));
        dot.addEventListener('click', function() {
          track.scrollTo({ left: cards[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
        });
        dotsWrap.appendChild(dot);
        return dot;
      });

      track.parentNode.insertBefore(dotsWrap, track.nextSibling);

      function updateActiveDot() {
        var mid = track.scrollLeft + track.clientWidth / 2;
        var best = 0;
        var bestDist = Infinity;
        Array.prototype.forEach.call(cards, function(card, i) {
          var center = card.offsetLeft - track.offsetLeft + card.offsetWidth / 2;
          var dist = Math.abs(center - mid);
          if (dist < bestDist) { bestDist = dist; best = i; }
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle('active', i === best);
        });
      }

      track.addEventListener('scroll', updateActiveDot, { passive: true });
      updateActiveDot();

      // Recompute on resize so the active dot tracks the layout.
      var resizeHandler = function() { if (mediaQuery.matches) updateActiveDot(); };
      window.addEventListener('resize', resizeHandler);
    });
  }

  initSwipeCarouselDots();

})();
