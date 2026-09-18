document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js");
  const siteHeader = document.querySelector(".site-header");
  const navigationToggle = document.getElementById("navigation-toggle");
  const primaryNavigation = document.getElementById("primary-navigation");
  const navigationLinks = document.querySelectorAll('#primary-navigation a[href^="#"]');
  const pageSections = document.querySelectorAll("main section[id]");
  const backToTopButton = document.getElementById("back-to-top");
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const currentYear = document.getElementById("current-year");

  if (currentYear) currentYear.textContent = new Date().getFullYear();

  const mobileNavigationQuery = window.matchMedia("(max-width: 768px)");
  const getNavigationFocusableElements = () =>
    primaryNavigation?.querySelectorAll("a[href], button:not([disabled])") || [];

  const syncNavigationAccessibility = (isOpen = false) => {
    if (!primaryNavigation) return;
    primaryNavigation.setAttribute(
      "aria-hidden",
      String(mobileNavigationQuery.matches && !isOpen),
    );
  };

  const closeMobileNavigation = ({ restoreFocus = false } = {}) => {
    if (!navigationToggle || !primaryNavigation) return;
    primaryNavigation.classList.remove("is-open");
    navigationToggle.classList.remove("is-active");
    document.body.classList.remove("menu-open");
    navigationToggle.setAttribute("aria-expanded", "false");
    navigationToggle.setAttribute("aria-label", "Open navigation menu");
    syncNavigationAccessibility(false);
    if (restoreFocus) navigationToggle.focus();
  };

  const openMobileNavigation = () => {
    if (!navigationToggle || !primaryNavigation) return;
    primaryNavigation.classList.add("is-open");
    navigationToggle.classList.add("is-active");
    document.body.classList.add("menu-open");
    navigationToggle.setAttribute("aria-expanded", "true");
    navigationToggle.setAttribute("aria-label", "Close navigation menu");
    syncNavigationAccessibility(true);
    requestAnimationFrame(() => getNavigationFocusableElements()[0]?.focus());
  };

  const toggleMobileNavigation = () => {
    if (primaryNavigation?.classList.contains("is-open")) {
      closeMobileNavigation({ restoreFocus: true });
    } else {
      openMobileNavigation();
    }
  };

  syncNavigationAccessibility(false);
  navigationToggle?.addEventListener("click", toggleMobileNavigation);
  navigationLinks.forEach((link) =>
    link.addEventListener("click", () => closeMobileNavigation()),
  );

  document.addEventListener("click", (event) => {
    if (primaryNavigation?.classList.contains("is-open") && !siteHeader?.contains(event.target)) {
      closeMobileNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!primaryNavigation?.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMobileNavigation({ restoreFocus: true });
      return;
    }

    if (event.key === "Tab") {
      const focusableElements = [...getNavigationFocusableElements()];
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (!mobileNavigationQuery.matches) closeMobileNavigation();
    syncNavigationAccessibility(primaryNavigation?.classList.contains("is-open"));
  }, { passive: true });
  const updateActiveNavigation = (sectionId) => {
    navigationLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  if (pageSections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) updateActiveNavigation(entry.target.id);
      });
    }, { threshold: 0.15, rootMargin: "-20% 0px -60% 0px" });
    pageSections.forEach((section) => sectionObserver.observe(section));
  }

  const updateHeaderOnScroll = () => {
    siteHeader?.classList.toggle("is-scrolled", window.scrollY > 30);
    backToTopButton?.classList.toggle("is-visible", window.scrollY > 500);
  };
  window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();

  const revealElements = document.querySelectorAll(".section-heading, .information-card, .skill-card, .project-card, .journey-step, .contact-information, .contact-form-wrapper, .contact-visual");
  if (revealElements.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  if (contactForm) {
    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const messageInput = document.getElementById("contact-message");
    const submitButton = contactForm.querySelector("button[type=\"submit\"]");
    const fields = [nameInput, emailInput, messageInput].filter(Boolean);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    fields.forEach((input) => {
      const errorElement = document.getElementById(`${input.id}-error`);
      if (errorElement) input.setAttribute("aria-describedby", errorElement.id);
      input.dataset.touched = "false";

      input.addEventListener("blur", () => {
        input.dataset.touched = "true";
        validateField(input);
      });

      input.addEventListener("input", () => {
        if (input.dataset.touched === "true") validateField(input);
        if (formStatus) {
          formStatus.textContent = "";
          formStatus.className = "form-status";
        }
      });
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      fields.forEach((input) => { input.dataset.touched = "true"; });

      const isValid = fields.every((input) => validateField(input));
      if (!isValid) {
        const firstInvalidField = fields.find((input) => input.getAttribute("aria-invalid") === "true");
        firstInvalidField?.focus();
        showFormStatus("Please correct the highlighted fields and try again.", "error");
        return;
      }

      const recipient = "syedfurqanullahh@gmail.com";
      const subject = `Portfolio contact from ${nameInput.value.trim()}`;
      const body = [
        `Name: ${nameInput.value.trim()}`,
        `Email: ${emailInput.value.trim()}`,
        "",
        "Message:",
        messageInput.value.trim(),
      ].join("\n");
      const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      showFormStatus("Opening your email app…", "success");
      submitButton?.blur();
      window.location.href = mailtoUrl;
    });

    function validateField(input) {
      const value = input.value.trim();
      let errorMessage = "";

      if (input === nameInput && value.length < 2) {
        errorMessage = "Please enter at least 2 characters.";
      } else if (input === emailInput && !emailPattern.test(value)) {
        errorMessage = "Please enter a valid email address.";
      } else if (input === messageInput && value.length < 10) {
        errorMessage = "Please enter at least 10 characters.";
      } else if (input === messageInput && value.length > 1200) {
        errorMessage = "Please keep your message under 1200 characters.";
      }

      setFieldState(input, errorMessage);
      return !errorMessage;
    }

    function setFieldState(input, errorMessage) {
      const field = input.closest(".form-field");
      const errorElement = document.getElementById(`${input.id}-error`);
      const hasError = Boolean(errorMessage);

      field?.classList.toggle("has-error", hasError);
      field?.classList.toggle("has-success", !hasError && input.value.trim().length > 0);
      input.setAttribute("aria-invalid", String(hasError));
      if (errorElement) errorElement.textContent = errorMessage;
    }
  }

  function showFormStatus(message, statusType) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status form-status--${statusType}`;
  }
  backToTopButton?.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});