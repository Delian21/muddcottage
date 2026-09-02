/**
 * Blog Post Loader
 * Reads blog/posts.json and renders blog cards dynamically.
 * To add a new post: add an entry to blog/posts.json and create the HTML file in blog/.
 */

(function() {
  'use strict';

  var blogGrid = document.getElementById('blogGrid');
  if (!blogGrid) return;

  // Format date nicely
  function formatDate(dateStr) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
    var parts = dateStr.split('-');
    var year = parts[0];
    var month = months[parseInt(parts[1], 10) - 1];
    var day = parseInt(parts[2], 10);
    return month + ' ' + day + ', ' + year;
  }

  // Render a single blog card
  function renderCard(post) {
    return '<a href="blog/' + post.slug + '.html" class="blog-card fade-up">' +
      '<div class="blog-card-image">' +
        '<img src="' + post.image + '" alt="' + post.title + '">' +
        '<span class="blog-card-tag">' + post.category + '</span>' +
      '</div>' +
      '<div class="blog-card-content">' +
        '<div class="blog-card-date"><i data-lucide="calendar" style="width:14px;height:14px;"></i> ' + formatDate(post.date) + '</div>' +
        '<h3>' + post.title + '</h3>' +
        '<p>' + post.description + '</p>' +
        '<span class="blog-card-read">Read Article <i data-lucide="arrow-right" style="width:16px;height:16px;"></i></span>' +
      '</div>' +
    '</a>';
  }

  // Load and render posts
  function loadPosts() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'blog/posts.json', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var posts = JSON.parse(xhr.responseText);
            // Sort by date, newest first
            posts.sort(function(a, b) {
              return new Date(b.date) - new Date(a.date);
            });

            var html = '';
            posts.forEach(function(post) {
              html += renderCard(post);
            });

            blogGrid.innerHTML = html;

            // Re-initialize Lucide icons for new elements
            if (typeof lucide !== 'undefined') {
              lucide.createIcons();
            }

            // Re-observe for scroll animations
            blogGrid.querySelectorAll('.fade-up').forEach(function(el) {
              el.style.opacity = '0';
              el.style.transform = 'translateY(30px)';
              var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                  if (entry.isIntersecting) {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                  }
                });
              }, { threshold: 0.1 });
              observer.observe(el);
            });

          } catch (e) {
            blogGrid.innerHTML = '<p style="color: var(--text-light); text-align: center; grid-column: 1/-1;">No posts yet.</p>';
          }
        } else {
          showFallback();
        }
      }
    };
    xhr.onerror = function() {
      showFallback();
    };
    xhr.send();
  }

  function showFallback() {
    blogGrid.innerHTML =
      '<a href="blog/why-herbs-still-work.html" class="blog-card fade-up">' +
        '<div class="blog-card-image"><img src="images/herbs1.jpg" alt="Herbal medicine"><span class="blog-card-tag">Herbal Medicine</span></div>' +
        '<div class="blog-card-content"><div class="blog-card-date">August 15, 2026</div><h3>Why Herbs Still Work in a World of Pharmaceuticals</h3><p>For centuries, communities relied on plants for healing. Modern science is now catching up.</p><span class="blog-card-read">Read Article &rarr;</span></div>' +
      '</a>' +
      '<a href="blog/common-herbs-every-home.html" class="blog-card fade-up">' +
        '<div class="blog-card-image"><img src="images/herbs2.jpg" alt="Common herbs"><span class="blog-card-tag">Wellness</span></div>' +
        '<div class="blog-card-content"><div class="blog-card-date">August 28, 2026</div><h3>5 Common Herbs Every Nigerian Home Should Have</h3><p>From bitter leaf to moringa, these everyday plants pack surprising healing power.</p><span class="blog-card-read">Read Article &rarr;</span></div>' +
      '</a>' +
      '<a href="blog/sleep-naturally.html" class="blog-card fade-up">' +
        '<div class="blog-card-image"><img src="images/herbs3.jpg" alt="Sleep remedies"><span class="blog-card-tag">Remedies</span></div>' +
        '<div class="blog-card-content"><div class="blog-card-date">September 1, 2026</div><h3>Sleep Naturally: Herbs That Actually Help You Rest</h3><p>Insomnia does not always need pills. Certain herbal blends calm the nervous system.</p><span class="blog-card-read">Read Article &rarr;</span></div>' +
      '</a>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  loadPosts();

})();
