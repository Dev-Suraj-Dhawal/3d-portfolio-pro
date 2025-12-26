gsap.registerPlugin(ScrollTrigger);

class ScrollAnimations {
  constructor() {
    this.mm = gsap.matchMedia();
    this.init();
  }

  init() {
    this.heroIntro();
    this.counters();

    // Prefer reduced motion
    this.mm.add("(prefers-reduced-motion: reduce)", () => {
      ScrollTrigger.getAll().forEach(t => t.disable(false));
    });

    // Desktop / Laptop: pinned horizontal
    this.mm.add("(min-width: 769px)", () => {
      this.aboutParallax();
      this.projectsHorizontal();
      this.fadeSections();
    });

    // Mobile: no pinning, just clean entrances
    this.mm.add("(max-width: 768px)", () => {
      this.fadeSections(true);
    });
  }

  heroIntro() {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(".hero-text", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" })
      .fromTo(".hero-label", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.5")
      .fromTo(".hero-line span", { yPercent: 120 }, { yPercent: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }, "-=0.5")
      .fromTo(".hero-description", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.35")
      .fromTo(".hero-cta", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.35");
  }

  aboutParallax() {
    gsap.utils.toArray("[data-depth]").forEach((el) => {
      const d = parseFloat(el.getAttribute("data-depth") || "0.3");
      gsap.to(el, {
        y: d * 90,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 }
      });
    });
  }

  projectsHorizontal() {
    const wrap = document.getElementById("projectsWrapper");
    if (!wrap) return;

    const getDist = () => wrap.scrollWidth - window.innerWidth + 64;

    gsap.to(wrap, {
      x: () => -getDist(),
      ease: "none",
      scrollTrigger: {
        trigger: ".projects-section",
        start: "top top",
        end: () => `+=${getDist()}`,
        scrub: 1,              // smoother catch-up [web:50]
        pin: true,
        anticipatePin: 1,       // helps avoid flashes on fast scroll [web:50]
        invalidateOnRefresh: true
      }
    });
  }

  fadeSections(isMobile = false) {
    const selectors = [".about-section", ".projects-section", ".testimonials-section", ".contact-section"];
    selectors.forEach((s) => {
      const section = document.querySelector(s);
      if (!section) return;

      gsap.from(section.querySelectorAll(".section-label, .section-title"), {
        y: 18,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: isMobile ? "top 88%" : "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    });

    gsap.from(".skill-item", {
      y: 14, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out",
      scrollTrigger: { trigger: ".skills-grid", start: "top 85%", toggleActions: "play none none reverse" }
    });

    gsap.from(".testimonial-card", {
      y: 14, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out",
      scrollTrigger: { trigger: ".testimonials-grid", start: "top 85%", toggleActions: "play none none reverse" }
    });
  }

  counters() {
    document.querySelectorAll(".stat-number").forEach((el) => {
      const target = parseInt(el.getAttribute("data-target") || "0", 10);
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.fromTo(el, { innerHTML: 0 }, {
            innerHTML: target,
            duration: 1.6,
            ease: "power2.out",
            snap: { innerHTML: 1 },
            onUpdate: () => (el.innerHTML = String(Math.ceil(Number(el.innerHTML))))
          });
        }
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => new ScrollAnimations());
