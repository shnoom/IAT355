/* Zoom text on scroll */
const zoomTexts = document.querySelectorAll(".zoom-text");
window.addEventListener("scroll", () => {
  const windowHeight = window.innerHeight;
  const viewportCenter = windowHeight / 2;
  zoomTexts.forEach(text => {
    const rect = text.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;

    let distance = Math.abs(viewportCenter - elementCenter);
    let progress = 1 - distance / (windowHeight / 2);
    progress = Math.max(0, Math.min(progress, 1));

    const scale = 0.8 + progress * 0.3;
    const opacity = 0.3 + progress * 0.7;

    text.style.transform = `scale(${scale})`;
    text.style.opacity = opacity;
  });
});
/* Scroll Effects */
const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle("active", entry.isIntersecting);
  });
}, { threshold: 0.3 });

revealElements.forEach(el => observer.observe(el));

/* Menu */
function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("active");
  }

/* Active Menu */
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");

  const sectionOffsets = {
    "#intro": 0,
    "#impact": 400,
    "#human_cost": 500,
    "#environmental_cost": 500,
    "#social_impact": 500
  };

  const sections = Object.keys(sectionOffsets)
    .map((id) => document.querySelector(id))
    .filter(Boolean);

  function setActiveLink() {
    const scrollPosition = window.scrollY + window.innerHeight * 0.35;

    let currentSection = null;

    sections.forEach((section) => {
      const id = `#${section.id}`;
      const extraOffset = sectionOffsets[id] || 0;
      const sectionTop = section.offsetTop + extraOffset;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        currentSection = id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === currentSection) {
        link.classList.add("active");
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      const section = document.querySelector(href);

      if (!section) return;

      e.preventDefault();

      const baseTop = section.getBoundingClientRect().top + window.scrollY;
      const extraOffset = sectionOffsets[href] || 0;
      const navOffset = 90;

      window.scrollTo({
        top: baseTop + extraOffset - navOffset,
        behavior: "smooth"
      });

      history.replaceState(null, "", href);

      navLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  window.addEventListener("scroll", setActiveLink);
  window.addEventListener("load", setActiveLink);
  setActiveLink();
});

