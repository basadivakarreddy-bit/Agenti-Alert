const canvas = document.createElement('canvas');
canvas.classList.add('canvas-container');
document.querySelector('.hero-right').appendChild(canvas);
const ctx = canvas.getContext('2d');

let width, height;
let mouseX = -1000;
let mouseY = -1000;
function resize() {
  width = canvas.width = document.querySelector('.hero-right').offsetWidth;
  height = canvas.height = document.querySelector('.hero-right').offsetHeight;
}
window.addEventListener('resize', resize);
resize();

const particles = [];
const numParticles = 250; // Vastly increased count for high density

// Hyper-vibrant neon palette
const bgColors = [
  '0, 255, 255',    // Neon Cyan
  '255, 0, 255',    // Neon Magenta
  '128, 0, 255',    // Neon Purple
  '0, 128, 255',    // Vibrant Blue
  '255, 0, 128',    // Hot Pink
  '255, 255, 255'   // Bright Spark
];

for (let i = 0; i < numParticles; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.5,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3,
    opacity: Math.random() * 0.6 + 0.4, // Increased base opacity (Brighter)
    color: bgColors[Math.floor(Math.random() * bgColors.length)]
  });
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  
  particles.forEach(p => {
    // Mouse interaction parameters
    const dxMouse = p.x - mouseX;
    const dyMouse = p.y - mouseY;
    const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
    
    if (distMouse < 120) {
      // Repel particles slightly based on distance to cursor
      const force = (120 - distMouse) / 120;
      p.x += (dxMouse / distMouse) * force * 2;
      p.y += (dyMouse / distMouse) * force * 2;
      
      // Optionally draw line connecting particle to cursor
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${p.color}, ${force * 0.5})`;
      ctx.lineWidth = 0.8;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
    }
    
    p.x += p.speedX;
    p.y += p.speedY;
    
    // Bounds wrapping
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
    
    const renderColor = window.isLightMode ? '40, 90, 180' : p.color;
    
    ctx.fillStyle = `rgba(${renderColor}, ${p.opacity})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add small subtle glow to particles (slightly larger blur for brightness)
    ctx.shadowBlur = window.isLightMode ? 2 : 8;
    ctx.shadowColor = `rgba(${renderColor}, 0.8)`;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  
  // Draw connection lines if close
  ctx.lineWidth = 0.8; // Thicker lines
  for (let i = 0; i < numParticles; i++) {
    for (let j = i + 1; j < numParticles; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 60) {
        // Line opacity scales with distance (higher base for brightness)
        const lineOpac = (1 - dist / 60) * 0.35;
        const renderColor = window.isLightMode ? '40, 90, 180' : particles[i].color;
        // Use color of the first particle for the line
        ctx.strokeStyle = `rgba(${renderColor}, ${lineOpac})`;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  
  window.requestAnimationFrame(draw);
}
draw();

// 3D Hover Tilt and Proximity Glow Effect for Nodes
const heroRightContainer = document.querySelector('.hero-right');
const glassGroups = document.querySelectorAll('.glass-group');

// Distinct colors for each bubble element
const groupColors = [
  '43, 255, 255',   // Cyan
  '255, 100, 255',  // Magenta
  '180, 210, 255',  // Light Blue
  '100, 150, 255',  // Mid Blue
  '100, 255, 150',  // Mint Green
  '255, 200, 100'   // Warm Orange/Yellow
];

heroRightContainer.addEventListener('mousemove', (e) => {
  const rect = heroRightContainer.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  glassGroups.forEach((group, index) => {
    const groupRect = group.getBoundingClientRect();
    // Center of the group relative to the container
    const groupX = groupRect.left - rect.left + groupRect.width / 2;
    const groupY = groupRect.top - rect.top + groupRect.height / 2;
    
    const dX = mouseX - groupX;
    const dY = mouseY - groupY;
    const distance = Math.sqrt(dX * dX + dY * dY);

    const pill = group.querySelector('.glass-pill');
    const circle = group.querySelector('.glass-circle');
    
    const glowColor = groupColors[index % groupColors.length]; // Color for this specific element

    if (distance < 200) {
      // Calculate tilt based on cursor position relative to the element center
      const tiltX = (dY / 200) * -20; // up to 20 deg
      const tiltY = (dX / 200) * 20;
      
      // Calculate glow intensity
      const intensity = 1 - Math.min(distance / 200, 1);
      
      
      const interactionGlow = window.isLightMode ? '0, 50, 200' : glowColor;
      
      pill.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
      pill.style.transform = `perspective(1000px) scale(1.05) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      pill.style.boxShadow = window.isLightMode ?
       `inset 0 3px 8px rgba(255,255,255,1), 
        inset 0 -2px 5px rgba(0,0,0,0.05),      
        0 12px 40px rgba(0, 0, 0, 0.15),
        0 0 ${20 * intensity}px rgba(${interactionGlow}, ${0.4 * intensity})`
       :
       `inset 0 3px 8px rgba(255,255,255,0.3), 
        inset 0 -2px 5px rgba(0,0,0,0.2),      
        0 12px 40px rgba(0, 0, 0, 0.5),
        0 0 ${40 * intensity}px rgba(${glowColor}, ${0.7 * intensity})`; // dynamic soft outer glow with distinct color
        
      circle.style.transition = 'transform 0.1s ease-out';
      circle.style.transform = `perspective(1000px) rotateX(${tiltX * 0.5}deg) rotateY(${tiltY * 0.5}deg) scale(1.02)`;
    } else {
      // Smoothly revert back when out of range
      pill.style.transition = 'transform 0.5s ease-in-out, box-shadow 0.5s ease-in-out';
      pill.style.transform = ``;
      pill.style.boxShadow = ``;
      
      circle.style.transition = 'transform 0.5s ease-in-out';
      circle.style.transform = ``;
    }
  });
});

heroRightContainer.addEventListener('mouseleave', () => {
  mouseX = -1000;
  mouseY = -1000;
  glassGroups.forEach(group => {
    const pill = group.querySelector('.glass-pill');
    const circle = group.querySelector('.glass-circle');
    
    pill.style.transition = 'transform 0.5s ease-in-out, box-shadow 0.5s ease-in-out';
    pill.style.transform = ``;
    pill.style.boxShadow = ``;
    
    circle.style.transition = 'transform 0.5s ease-in-out';
    circle.style.transform = ``;
  });
});

// Light Mode / High Contrast Toggle Setup
const themeToggleBtn = document.getElementById('theme-toggle');
window.isLightMode = false;

themeToggleBtn.addEventListener('click', () => {
  window.isLightMode = !window.isLightMode;
  document.body.classList.toggle('light-mode', window.isLightMode);
  
  if (window.isLightMode) {
    themeToggleBtn.textContent = '🌙';
  } else {
    themeToggleBtn.textContent = '☀️';
  }
});

// Formally intercept all major landing page CTA logic towards Auth Gateway
const authRouteBtns = document.querySelectorAll('.btn-login, .btn-primary, .btn-white');
authRouteBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = 'auth.html';
  });
});

// AI Summary Tooltips Logic
const tooltip = document.createElement('div');
tooltip.className = 'ai-tooltip';
document.body.appendChild(tooltip);

glassGroups.forEach(group => {
  group.addEventListener('mouseenter', () => {
    // Extract summary from data attribute
    const summary = group.getAttribute('data-summary');
    if (summary) {
      // Get category name
      const categoryName = group.querySelector('.glass-pill').textContent.trim();
      tooltip.innerHTML = `<strong>${categoryName} AI Summary</strong>${summary}`;
      tooltip.classList.add('visible');
    }
  });
  
  group.addEventListener('mousemove', (e) => {
    // Offset the tooltip slightly from the cursor
    // Ensure it doesn't run off the right edge of the screen
    let xOffset = 20;
    let yOffset = 20;
    
    if (e.pageX + 320 > window.innerWidth) {
      xOffset = -320; 
    }
    
    tooltip.style.left = (e.pageX + xOffset) + 'px';
    tooltip.style.top = (e.pageY + yOffset) + 'px';
  });
  
  group.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });
});

// Perfect Smooth Scrolling Interceptor
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Prevent default anchor click behavior which updates the URL hash
            e.preventDefault();
            
            // Calculate exact position accounting for any potential fixed headers
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});
