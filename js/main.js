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

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("active");
      menuToggle.classList.toggle("active", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  // Cursor (simple, efficient)
  const cursor = document.querySelector(".custom-cursor");
  const follower = document.querySelector(".cursor-follower");

  if (cursor && follower && matchMedia("(hover:hover)").matches) {
    let mx = 0, my = 0, cx = 0, cy = 0, fx = 0, fy = 0;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const loop = () => {
      cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35;
      fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12;
      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      follower.style.transform = `translate(${fx}px,${fy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    const hoverTargets = document.querySelectorAll("a, button, .project-card, .skill-item, .testimonial-card, input, textarea");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => { cursor.classList.add("hover"); follower.classList.add("hover"); });
      el.addEventListener("mouseleave", () => { cursor.classList.remove("hover"); follower.classList.remove("hover"); });
    });

    document.addEventListener("visibilitychange", () => {
      const hide = document.visibilityState !== "visible";
      cursor.classList.toggle("hide", hide);
      follower.classList.toggle("hide", hide);
    });
  }

  // Netlify contact form submit (AJAX + still stored by Netlify)
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      // Let it submit normally if fetch isn't available
      if (!window.fetch) return;

      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

      const showMsg = (text, type) => {
        const old = form.querySelector(".form-message");
        if (old) old.remove();
        const div = document.createElement("div");
        div.className = `form-message ${type}`;
        div.textContent = text;
        form.prepend(div);
      };

      try {
        const data = new FormData(form);
        // POST to "/" works for Netlify Forms
        const res = await fetch("/", { method: "POST", body: data });
        if (!res.ok) throw new Error("Network error");

        showMsg("Message sent. It is saved in the site’s Netlify Forms dashboard after deployment.", "success");
        form.reset();
      } catch {
        showMsg("Failed to send. Please try again or email directly.", "error");
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = original; }
      }
    });
  }
});
