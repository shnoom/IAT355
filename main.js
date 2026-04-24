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
    const staggerAmount = 0.12;

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

  function activateLink(id) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      const section = document.querySelector(href);

      if (!section) return;

      e.preventDefault();

      const navOffset = 90;
      const y = section.getBoundingClientRect().top + window.scrollY - navOffset;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });

      history.replaceState(null, "", href);
    });
  });

  ScrollTrigger.create({
    trigger: "#intro",
    start: "top center",
    end: "+=300%",
    onEnter: () => activateLink("intro"),
    onEnterBack: () => activateLink("intro")
  });

  ScrollTrigger.create({
    trigger: "#impact",
    start: "top center",
    end: "bottom center",
    onEnter: () => activateLink("impact"),
    onEnterBack: () => activateLink("impact")
  });

  ScrollTrigger.create({
    trigger: "#human_cost",
    start: "top center",
    end: "bottom center",
    onEnter: () => activateLink("human_cost"),
    onEnterBack: () => activateLink("human_cost")
  });

  ScrollTrigger.create({
    trigger: "#environmental_cost",
    start: "top center",
    end: "bottom center",
    onEnter: () => activateLink("environmental_cost"),
    onEnterBack: () => activateLink("environmental_cost")
  });

  ScrollTrigger.create({
    trigger: "#social_impact",
    start: "top center",
    end: "bottom center",
    onEnter: () => activateLink("social_impact"),
    onEnterBack: () => activateLink("social_impact")
  });
});


document.addEventListener('DOMContentLoaded', () => {
    // Create cursor elements
    const dot = document.createElement('div');
    const outline = document.createElement('div');
    
    dot.className = 'cursor-dot';
    outline.className = 'cursor-outline';
    
    document.body.appendChild(dot);
    document.body.appendChild(outline);

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Immediate positioning for the dot
        dot.style.left = `${posX}px`;
        dot.style.top = `${posY}px`;

        outline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    //Expand cursor when hovering over interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .bar');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1)';
            outline.style.backgroundColor = 'transparent';
        });
    });
});
