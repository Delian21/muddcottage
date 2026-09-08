/**
 * Blog Post Loader
 * Reads blog/posts.json and renders blog cards dynamically.
 * Supports keyword search, category filter chips, and date sorting
 * (newest/oldest first) via the blog toolbar.
 */

(function() {
  'use strict';

  var blogGrid = document.getElementById('blogGrid');
  if (!blogGrid) return;

  var allPosts = [];        // every loaded post
  var state = { query: '', category: 'all', sort: 'latest' };

  var searchInput = document.getElementById('blogSearch');
  var sortGroup = document.getElementById('blogSort');
  var resultsInfo = document.getElementById('blogResults');
  var chipsGroup = document.getElementById('blogChips');
  var chipsBuilt = false;

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

  // Highlight scroll-in animations for freshly rendered cards
  function observeCards() {
    // Re-initialize Lucide icons for new elements
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
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
  }

  // Shared chip behaviour: the static "All posts" chip lives in the HTML,
  // dynamic category chips are appended by buildChips().
  function activateChip(button) {
    state.category = button.getAttribute('data-category');
    chipsGroup.querySelectorAll('button').forEach(function(b) {
      var active = b === button;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    renderPosts();
  }

  var allChip = chipsGroup ? chipsGroup.querySelector('button[data-category="all"]') : null;
  if (allChip) {
    allChip.addEventListener('click', function() { activateChip(allChip); });
  }

  // Build one chip per category found in the loaded posts
  function buildChips() {
    if (!chipsGroup || chipsBuilt) return;
    var categories = [];
    allPosts.forEach(function(post) {
      var cat = String(post.category || '').trim();
      if (cat && categories.indexOf(cat) === -1) categories.push(cat);
    });
    categories.sort(function(a, b) { return a.localeCompare(b); });

    categories.forEach(function(cat) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.setAttribute('data-category', cat);
      chip.setAttribute('aria-pressed', 'false');
      chip.textContent = cat;
      chip.addEventListener('click', function() { activateChip(chip); });
      chipsGroup.appendChild(chip);
    });
    chipsBuilt = true;
  }

  // Filter + sort posts by current state, then render
  function renderPosts() {
    var q = state.query.trim().toLowerCase();
    var posts = allPosts.filter(function(post) {
      if (state.category !== 'all' && String(post.category || '').trim() !== state.category) {
        return false;
      }
      if (!q) return true;
      return ['title', 'description', 'category'].some(function(key) {
        return String(post[key] || '').toLowerCase().indexOf(q) !== -1;
      });
    });

    // Date sort: newest first by default; ties broken alphabetically so the
    // order is stable across renders.
    posts.sort(function(a, b) {
      var diff = new Date(b.date) - new Date(a.date);
      if (diff !== 0) return state.sort === 'latest' ? diff : -diff;
      return String(a.title).localeCompare(String(b.title));
    });

    if (resultsInfo) {
      var filtered = q || state.category !== 'all';
      resultsInfo.textContent = filtered
        ? posts.length + ' post' + (posts.length === 1 ? '' : 's') + (q ? ' matching "' + state.query.trim() + '"' : '') + (state.category !== 'all' ? ' in ' + state.category : '')
        : allPosts.length + ' post' + (allPosts.length === 1 ? '' : 's');
    }

    if (posts.length === 0) {
      blogGrid.innerHTML = '<p class="blog-empty">No posts found' +
        (q ? ' for <em>"' +
          q.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
          '"</em>' : '') +
        '. Try another keyword or category.</p>';
      return;
    }

    var html = '';
    posts.forEach(function(post) {
      html += renderCard(post);
    });

    blogGrid.innerHTML = html;
    observeCards();
  }

  // Load and render posts
  function loadPosts() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'blog/posts.json', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            allPosts = JSON.parse(xhr.responseText);
            buildChips();
            renderPosts();
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
    allPosts = [
      { slug: 'why-herbs-still-work', image: 'images/herbs1.jpg', category: 'Herbal Medicine', date: '2026-08-15', title: 'Why Herbs Still Work in a World of Pharmaceuticals', description: 'For centuries, communities relied on plants for healing. Modern science is now catching up.' },
      { slug: 'common-herbs-every-home', image: 'images/herbs2.jpg', category: 'Wellness', date: '2026-08-28', title: '5 Common Herbs Every Nigerian Home Should Have', description: 'From bitter leaf to moringa, these everyday plants pack surprising healing power.' },
      { slug: 'sleep-naturally', image: 'images/herbs3.jpg', category: 'Remedies', date: '2026-09-01', title: 'Sleep Naturally: Herbs That Actually Help You Rest', description: 'Insomnia does not always need pills. Certain herbal blends calm the nervous system.' }
    ];
    buildChips();
    renderPosts();
  }

  // Wire up the search box and the date-sort toggle
  if (searchInput) {
    var debounce;
    searchInput.addEventListener('input', function() {
      clearTimeout(debounce);
      debounce = setTimeout(function() {
        state.query = searchInput.value;
        renderPosts();
      }, 150);
    });
  }

  if (sortGroup) {
    // Sliding active pill: a thumb element glides behind whichever
    // sort button is active instead of the background hard-swapping.
    var thumb = document.createElement('span');
    thumb.className = 'blog-sort-thumb';
    sortGroup.appendChild(thumb);

    function moveThumb() {
      var active = sortGroup.querySelector('button.active');
      if (!active) return;
      thumb.style.width = active.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    }
    moveThumb();

    // Button widths change once the webfont finishes loading, and on resize.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(moveThumb);
    }
    window.addEventListener('resize', moveThumb);

    sortGroup.querySelectorAll('button').forEach(function(button) {
      button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
      button.addEventListener('click', function() {
        state.sort = button.getAttribute('data-sort');
        sortGroup.querySelectorAll('button').forEach(function(b) {
          var active = b === button;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        moveThumb();
        renderPosts();
      });
    });
  }

  loadPosts();

})();
