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