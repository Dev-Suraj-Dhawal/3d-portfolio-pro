document.addEventListener("DOMContentLoaded", () => {
  // Particles
  if (typeof ParticleSystem !== "undefined") new ParticleSystem("particle-canvas");

  // Nav
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 80);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const isMobile = () => matchMedia("(max-width:768px)").matches;

  // Ensure overlay + close button exist (no need to manually edit HTML)
  const ensureNavUI = () => {
    if (!navLinks) return { overlay: null, closeBtn: null };

    // Overlay
    let overlay = document.getElementById("navOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "navOverlay";
      overlay.className = "nav-overlay";
      document.body.appendChild(overlay);
    }

    // Drawer header + close button
    let closeBtn = document.getElementById("navClose");
    if (!closeBtn) {
      const head = document.createElement("div");
      head.className = "nav-panel-head";

      const title = document.createElement("span");
      title.className = "nav-panel-title";
      title.textContent = "Menu";

      closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.id = "navClose";
      closeBtn.className = "nav-close";
      closeBtn.setAttribute("aria-label", "Close menu");
      closeBtn.innerHTML = "&times;";

      head.appendChild(title);
      head.appendChild(closeBtn);
      navLinks.prepend(head);
    }

    return { overlay, closeBtn };
  };

  const { overlay: navOverlay, closeBtn: navClose } = ensureNavUI();

  const setOpenState = (open) => {
    if (!menuToggle || !navLinks) return;

    navLinks.classList.toggle("active", open);
    menuToggle.classList.toggle("active", open);

    // Keep aria-expanded synced with state for assistive tech [web:156]
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    if (navOverlay) navOverlay.classList.toggle("active", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  const isOpen = () => !!navLinks && navLinks.classList.contains("active");
  const openMenu = () => setOpenState(true);
  const closeMenu = () => setOpenState(false);
  const toggleMenu = () => setOpenState(!isOpen());

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      // Only act as drawer on mobile
      if (isMobile()) toggleMenu();
    });
  }

  // Close button inside drawer
  if (navClose) navClose.addEventListener("click", closeMenu);

  // Overlay click closes
  if (navOverlay) navOverlay.addEventListener("click", closeMenu);

  // Close when clicking a nav link (Home/About/Projects/Contact)
  if (navLinks) {
    navLinks.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      if (isMobile()) closeMenu();
    });
  }

  // Close on outside click (works even if overlay CSS is changed/removed)
  document.addEventListener("pointerdown", (e) => {
    if (!isMobile() || !isOpen()) return;
    const t = e.target;
    if (navLinks.contains(t) || (menuToggle && menuToggle.contains(t))) return;
    closeMenu();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMobile() && isOpen()) closeMenu();
  });

  // If user rotates/resizes to desktop, force-close the drawer
  window.addEventListener(
    "resize",
    () => {
      if (!isMobile() && isOpen()) closeMenu();
    },
    { passive: true }
  );

  // Cursor (simple, efficient)
  const cursor = document.querySelector(".custom-cursor");
  const follower = document.querySelector(".cursor-follower");

  if (cursor && follower && matchMedia("(hover:hover)").matches) {
    let mx = 0,
      my = 0,
      cx = 0,
      cy = 0,
      fx = 0,
      fy = 0;

    window.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true }
    );

    const loop = () => {
      cx += (mx - cx) * 0.35;
      cy += (my - cy) * 0.35;
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;

      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      follower.style.transform = `translate(${fx}px,${fy}px) translate(-50%,-50%)`;

      requestAnimationFrame(loop);
    };
    loop();

    const hoverTargets = document.querySelectorAll(
      "a, button, .project-card, .skill-item, .testimonial-card, input, textarea"
    );
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("hover");
        follower.classList.add("hover");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("hover");
        follower.classList.remove("hover");
      });
    });

    document.addEventListener("visibilitychange", () => {
      const hide = document.visibilityState !== "visible";
      cursor.classList.toggle("hide", hide);
      follower.classList.toggle("hide", hide);
    });
  }

  // Helper: Netlify requires URL-encoded body for AJAX submissions
  const encode = (form) => new URLSearchParams(new FormData(form)).toString();

  // Netlify contact form submit (AJAX + stored by Netlify)
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      if (!window.fetch) return; // fallback to normal submit
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      const showMsg = (text, type) => {
        const old = form.querySelector(".form-message");
        if (old) old.remove();
        const div = document.createElement("div");
        div.className = `form-message ${type}`;
        div.textContent = text;
        form.prepend(div);
      };

      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encode(form),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        showMsg("Message sent! Check Netlify → Forms for the submission.", "success");
        form.reset();
      } catch (err) {
        showMsg("Failed to send. Please try again or email directly.", "error");
        console.error(err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = original;
        }
      }
    });
  }
});
