// register plugin 
gsap.registerPlugin(ScrollTrigger);

const keywords = { "20": "meow", "wash": "wash", "cost": "cost" };
const paragraphs = document.querySelectorAll('.anim-text p');


paragraphs.forEach(p => {
  const words = p.innerText.split(" ");
  p.innerHTML = ""; 
  words.forEach(word => {
    const wordDiv = document.createElement("div");
    wordDiv.classList.add("word");
    const span = document.createElement("span");
    span.innerText = word;
    const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    if (keywords[cleanWord]) {
      wordDiv.classList.add("keyword-wrapper");
      span.classList.add("keyword", keywords[cleanWord]);
    }
    wordDiv.appendChild(span);
    p.appendChild(wordDiv);
  });
});

const section = document.querySelector(".anim-text-container");
const allWords = section.querySelectorAll(".word");

// animation
ScrollTrigger.create({
  trigger: ".anim-text-container",
  start: "top top",
  end: "+=300%", 
  pin: true,
  scrub: 1,
  onUpdate: (self) => {
    const progress = self.progress;
    const totalWords = allWords.length;
    const staggerAmount = 0.15;

    allWords.forEach((word, index) => {
      const innerSpan = word.querySelector("span");
      
  
      const revealStart = index / totalWords* (1 - staggerAmount);
      const revealEnd = revealStart + staggerAmount;
      
      let wordProgress = (progress - revealStart) / (revealEnd - revealStart);
      wordProgress = Math.max(0, Math.min(1, wordProgress));

      word.style.opacity = wordProgress;
      if (wordProgress > 0.8) {
        // Fade text in
        innerSpan.style.opacity = 1;
        word.style.backgroundColor = "rgba(0,0,0,0)";
      } else {
  
        innerSpan.style.opacity = 0;

        word.style.backgroundColor = "rgba(0,0,0,0.1)"; 
      }
    });
  }
});
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

