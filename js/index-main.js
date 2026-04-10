// 🔥 FETCH HERO BACKGROUND FROM ADMIN PANEL 🔥
db.ref('settings/theme/heroBg').on('value', (snapshot) => {
  if(snapshot.exists() && snapshot.val() !== "") {
    const bgValue = snapshot.val();
    const heroElement = document.querySelector('.hero'); 
    
    if(heroElement) {
      if(bgValue.startsWith('http')) {
        heroElement.style.backgroundImage = `url('${bgValue}')`;
        heroElement.style.backgroundSize = "cover";
        heroElement.style.backgroundPosition = "center";
      } else {
        heroElement.style.background = bgValue;
      }
    }
  }
});


// 🔥 GSAP SCROLL ANIMATION FUNCTION 🔥
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  const slider = document.querySelector('.slider');
  if(slider) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if(node.nodeType === 1 && node.classList.contains('card')) {
            gsap.to(node, {
              scrollTrigger: {
                trigger: node,
                start: "top 85%", 
                end: "bottom bottom",
                toggleActions: "play none none reverse", 
              },
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.6,
              ease: "back.out(1.7)" 
            });
          }
        });
      });
    });
    observer.observe(slider, { childList: true });
  }
}

// 🔥 PARTICLES LOGIC 🔥
class Particle {
  constructor(x, y, size, color, dispersion, returnSpd) {
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y + (Math.random() - 0.5) * 10;
    this.originX = x;
    this.originY = y;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
    this.size = size;
    this.color = color;
    this.dispersion = dispersion;
    this.returnSpd = returnSpd;
  }

  update(mouseX, mouseY) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const interactionRadius = 40; 

    if (distance < interactionRadius && mouseX !== -1000 && mouseY !== -1000) {
      const forceDirectionX = dx / distance;
      const forceDirectionY = dy / distance;
      const force = (interactionRadius - distance) / interactionRadius;

      const repulsionX = forceDirectionX * force * this.dispersion;
      const repulsionY = forceDirectionY * force * this.dispersion;

      this.vx -= repulsionX;
      this.vy -= repulsionY;
    }

    this.vx += (this.originX - this.x) * this.returnSpd;
    this.vy += (this.originY - this.y) * this.returnSpd;
    this.vx *= 0.85;
    this.vy *= 0.85;

    const distToOrigin = Math.sqrt(Math.pow(this.x - this.originX, 2) + Math.pow(this.y - this.originY, 2));

    if (distToOrigin < 1 && Math.random() > 0.95) {
      this.vx += (Math.random() - 0.5) * 0.2;
      this.vy += (Math.random() - 0.5) * 0.2;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticleLogo() {
  const container = document.getElementById('particle-logo');
  if (!container) return;

  container.innerHTML = '<canvas id="logoCanvas"></canvas>';
  const canvas = document.getElementById('logoCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const width = 170; 
  const height = 40;
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  ctx.font = "800 24px 'Syne', sans-serif";
  ctx.textBaseline = "middle";
  
  const text1 = "Nexa";
  const text2 = "Store";
  const w1 = ctx.measureText(text1).width;

  ctx.fillStyle = "#ffffff";
  ctx.fillText(text1, 0, height / 2);
  ctx.fillStyle = "#e63f6f"; 
  ctx.fillText(text2, w1, height / 2);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, width, height);

  let particles = [];
  const particleSize = 1;
  const step = Math.max(1, Math.floor(2 * dpr)); 

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const index = (y * canvas.width + x) * 4;
      const alpha = imageData.data[index + 3];
      
      if (alpha > 128) {
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const color = `rgba(${r},${g},${b},1)`;
        
        particles.push(new Particle(x/dpr, y/dpr, particleSize, color, 12, 0.08));
      }
    }
  }

  let mouseX = -1000;
  let mouseY = -1000;

  const updateMousePosition = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = clientX - rect.left;
    mouseY = clientY - rect.top;
  };

  canvas.addEventListener('mousemove', (e) => updateMousePosition(e.clientX, e.clientY));
  canvas.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });
  
  canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    updateMousePosition(touch.clientX, touch.clientY);
  });
  canvas.addEventListener('touchend', () => { mouseX = -1000; mouseY = -1000; });

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update(mouseX, mouseY);
      p.draw(ctx);
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// 🔥 BLUR ANIMATIONS 🔥
function applyBlurAnimation(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const html = el.innerHTML;
  const lines = html.split(/<br\s*\/?>/i);
  el.innerHTML = "";

  let wordIndex = 0;
  
  lines.forEach((line, lineIndex) => {
    const words = line.split(/\s+/).filter(w => w.length > 0);
    words.forEach((word) => {
      const span = document.createElement("span");
      span.className = "blur-word";
      span.innerHTML = word;

      const duration = 1.0 + Math.cos(wordIndex * 0.3) * 0.2;
      const delay = (wordIndex * 0.03) + Math.pow(wordIndex / 20, 0.8) * 0.2;

      span.style.transitionDuration = `${duration}s`;
      span.style.transitionDelay = `${delay}s`;

      el.appendChild(span);
      el.appendChild(document.createTextNode(" "));
      wordIndex++;
    });
    
    if (lineIndex < lines.length - 1) {
      el.appendChild(document.createElement("br"));
    }
  });

  setTimeout(() => {
    const spans = el.querySelectorAll(".blur-word");
    spans.forEach(span => span.classList.add("animate"));
  }, 50);
}

function animateAllBlocks() {
  const elementsToAnimate = [
    document.getElementById('particle-logo'),
    document.getElementById('navCartBtn'),
    document.querySelector('.hero-eyebrow'),
    document.querySelector('.btn-primary'),
    document.querySelector('.btn-secondary'),
    document.querySelector('.row-title')
  ];

  elementsToAnimate.forEach((el, index) => {
    if (!el) return;
    el.classList.add('blur-el');
    el.style.transitionDelay = `${index * 0.05}s`; 
  });

  setTimeout(() => {
    document.querySelectorAll('.blur-el').forEach(el => el.classList.add('animate'));
  }, 50);
}

document.fonts.ready.then(() => {
  setTimeout(initParticleLogo, 50); 
  applyBlurAnimation('animated-title');
  applyBlurAnimation('animated-desc');
  animateAllBlocks();
  initScrollAnimations();
});
