class SmoothScroll {
  constructor() {
    this.bind();
  }

  bind() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        const nav = document.getElementById("navbar");
        const offset = nav ? nav.offsetHeight + 6 : 0;

        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => new SmoothScroll());
