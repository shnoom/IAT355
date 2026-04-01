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