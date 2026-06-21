(() => {
  "use strict";

  const doc = document;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = doc.querySelector("[data-site-header]");
  const nav = doc.querySelector("[data-nav]");
  const navToggle = doc.querySelector("[data-nav-toggle]");
  const navLinks = Array.from(doc.querySelectorAll(".nav-link"));

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const closeNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  };

  const openNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation");
  };

  const toggleNav = () => {
    if (!nav || !navToggle) return;
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeNav() : openNav();
  };

  if (navToggle) {
    navToggle.addEventListener("click", toggleNav);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeNav();
    });
  });

  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  doc.addEventListener("click", (event) => {
    if (!nav || !navToggle) return;

    const target = event.target;
    const clickInsideNav = nav.contains(target);
    const clickOnToggle = navToggle.contains(target);

    if (!clickInsideNav && !clickOnToggle) {
      closeNav();
    }
  });

  const updateActiveNavLink = () => {
    const sections = navLinks
      .map((link) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return null;

        const target = href === "#top" ? doc.getElementById("top") : doc.querySelector(href);
        return target ? { link, target } : null;
      })
      .filter(Boolean);

    let activeLink = navLinks[0];

    sections.forEach(({ link, target }) => {
      const rect = target.getBoundingClientRect();

      if (rect.top <= 120) {
        activeLink = link;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const setupFaq = () => {
    const faqItems = Array.from(doc.querySelectorAll(".faq-item"));

    faqItems.forEach((item) => {
      const button = item.querySelector(".faq-question");
      if (!button) return;

      button.addEventListener("click", () => {
        const isOpen = button.getAttribute("aria-expanded") === "true";

        faqItems.forEach((otherItem) => {
          const otherButton = otherItem.querySelector(".faq-question");
          if (!otherButton) return;

          otherItem.classList.remove("is-open");
          otherButton.setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  };

  const setupReveal = () => {
    const revealItems = Array.from(doc.querySelectorAll(".reveal"));

    if (!revealItems.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, revealObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  };

  const setupSmoothAnchors = () => {
    const anchorLinks = Array.from(doc.querySelectorAll('a[href^="#"]'));

    anchorLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        const target = href === "#top" ? doc.getElementById("top") : doc.querySelector(href);
        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });

        if (history.pushState) {
          history.pushState(null, "", href);
        }
      });
    });
  };

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;

    window.requestAnimationFrame(() => {
      setHeaderState();
      updateActiveNavLink();
      ticking = false;
    });

    ticking = true;
  };

  setupFaq();
  setupReveal();
  setupSmoothAnchors();
  setHeaderState();
  updateActiveNavLink();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", closeNav);
})();
