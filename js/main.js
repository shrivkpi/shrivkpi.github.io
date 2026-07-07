(function () {
  var body = document.body;
  var menuToggle = document.querySelector('.menu-toggle');
  var sidebar = document.getElementById('site-sidebar');
  var overlay = document.querySelector('.mobile-overlay');
  var navLinks = document.querySelectorAll('.nav a[data-page]');

  function normalizeCurrentPage() {
    var path = window.location.pathname;
    var file = path.substring(path.lastIndexOf('/') + 1);
    return file || 'index.html';
  }

  function setActiveLink() {
    var currentPage = normalizeCurrentPage();

    navLinks.forEach(function (link) {
      var targetPage = link.getAttribute('data-page');
      var isActive = targetPage === currentPage;

      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function closeMenu() {
    body.classList.remove('nav-open');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    }
  }

  function toggleMenu() {
    var isOpen = body.classList.toggle('nav-open');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    }
  }

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 760) {
        closeMenu();
      }
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });

  function initCoursesInteractions() {
    var searchInput = document.getElementById('course-search');
    var noResults = document.getElementById('course-no-results');
    var semesterSections = document.querySelectorAll('[data-semester]');
    var courseCards = document.querySelectorAll('[data-course-card]');

    if (!semesterSections.length) {
      return;
    }

    semesterSections.forEach(function (semester) {
      var toggle = semester.querySelector('.semester-toggle');
      var panel = semester.querySelector('.semester-panel');

      if (!toggle || !panel) {
        return;
      }

      toggle.addEventListener('click', function () {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
    });

    if (!searchInput || !courseCards.length) {
      return;
    }

    function applySearchFilter() {
      var query = searchInput.value.trim().toLowerCase();
      var visibleCards = 0;

      courseCards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var match = query === '' || haystack.indexOf(query) !== -1;

        card.hidden = !match;
        if (match) {
          visibleCards += 1;
        }
      });

      semesterSections.forEach(function (semester) {
        var panel = semester.querySelector('.semester-panel');
        var toggle = semester.querySelector('.semester-toggle');
        var hasVisibleCard = !!semester.querySelector('[data-course-card]:not([hidden])');

        semester.hidden = !hasVisibleCard;

        if (query && hasVisibleCard && panel && toggle) {
          panel.hidden = false;
          toggle.setAttribute('aria-expanded', 'true');
        }
      });

      if (noResults) {
        noResults.hidden = visibleCards !== 0;
      }
    }

    searchInput.addEventListener('input', applySearchFilter);
  }

  function initThemeToggle() {
    var themeKey = 'preferred-theme';
    var sidebarInner = document.querySelector('.sidebar__inner');

    if (!sidebarInner) {
      return;
    }

    var savedTheme = localStorage.getItem(themeKey);
    var startingTheme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', startingTheme);

    var toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'theme-toggle';
    toggleButton.setAttribute('aria-live', 'polite');

    function syncButton(theme) {
      var isDark = theme === 'dark';
      toggleButton.innerHTML = isDark
        ? '<span class="theme-toggle__icon" aria-hidden="true">☾</span>'
        : '<span class="theme-toggle__icon" aria-hidden="true">☀</span>';
      toggleButton.setAttribute('aria-pressed', String(isDark));
      toggleButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      toggleButton.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    syncButton(startingTheme);

    toggleButton.addEventListener('click', function () {
      var currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.classList.add('theme-transition');
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem(themeKey, nextTheme);
      syncButton(nextTheme);

      window.setTimeout(function () {
        document.documentElement.classList.remove('theme-transition');
      }, 280);
    });

    var sidebarNote = sidebarInner.querySelector('.sidebar-note');
    if (sidebarNote) {
      sidebarNote.insertAdjacentElement('afterend', toggleButton);
    } else {
      sidebarInner.appendChild(toggleButton);
    }
  }

  setActiveLink();
  initCoursesInteractions();
  initThemeToggle();
})();
