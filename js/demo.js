/* Saudi Trend Demo — Motion Engine */
gsap.registerPlugin(ScrollTrigger);
if (typeof ScrollToPlugin !== 'undefined') {
  gsap.registerPlugin(ScrollToPlugin);
}

// ===== PRELOADER =====
const preloader = document.getElementById('preloader');
const progressBar = document.getElementById('preloader-progress');
let loadProgress = 0;

const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 15 + 5;
  if (loadProgress >= 100) {
    loadProgress = 100;
    clearInterval(loadInterval);
    progressBar.style.width = '100%';
    setTimeout(() => {
      preloader.classList.add('done');
      initAnimations();
    }, 400);
  } else {
    progressBar.style.width = loadProgress + '%';
  }
}, 100);

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

if (window.matchMedia('(min-width: 769px)').matches) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  const hoverTargets = 'a, button, .magnetic, .service-slide, .bento__item, .vision-card, input, textarea';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
      follower.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
      follower.classList.remove('hovering');
    });
  });
}

// ===== MAGNETIC ELEMENTS =====
document.querySelectorAll('.magnetic').forEach(el => {
  const strength = parseFloat(el.dataset.strength) || 0.3;

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: 'power2.out'
    });
  });

  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  });
});

// ===== PARTICLES =====
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const count = Math.min(80, Math.floor(window.innerWidth / 20));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 200, 83, ${p.opacity})`;
    ctx.fill();

    particles.slice(i + 1).forEach(p2 => {
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(0, 200, 83, ${0.08 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  });

  requestAnimationFrame(drawParticles);
}

resizeCanvas();
createParticles();
drawParticles();
window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });

// ===== NAVIGATION =====
const nav = document.getElementById('nav');
const navBurger = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

navBurger.addEventListener('click', () => {
  navBurger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.classList.toggle('menu-open');
});

document.querySelectorAll('.mobile-link, .nav__link, .nav__cta').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        gsap.to(window, { scrollTo: { y: target, offsetY: 80 }, duration: 1.2, ease: 'power3.inOut' });
      }
      navBurger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
  });
});

// ===== MAIN ANIMATIONS =====
function initAnimations() {
  // Hero reveals
  gsap.utils.toArray('.reveal-up').forEach(el => {
    const delay = parseFloat(el.dataset.delay) || 0;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      delay: delay,
      ease: 'power4.out'
    });
  });

  // Hero title word stagger
  gsap.from('.hero__word', {
    y: 120,
    rotateX: -40,
    opacity: 0,
    duration: 1.4,
    stagger: 0.08,
    ease: 'power4.out',
    delay: 0.3
  });

  // Float cards parallax
  document.querySelectorAll('.float-card').forEach(card => {
    const speed = parseFloat(card.dataset.speed) || 0.03;
    gsap.to(card, {
      y: -80 * speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  // Scroll reveal for all sections
  gsap.utils.toArray('.vision .reveal-up, .showcase .reveal-up, .process .reveal-up, .contact .reveal-up').forEach(el => {
    const delay = parseFloat(el.dataset.delay) || 0;
    gsap.fromTo(el,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Vision cards tilt on hover
  document.querySelectorAll('.vision-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: x * 8,
        rotateX: -y * 8,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 800
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    });
  });

  // Stats counter
  document.querySelectorAll('.stat-item__num').forEach(num => {
    const target = parseInt(num.dataset.count, 10);
    ScrollTrigger.create({
      trigger: num,
      start: 'top 80%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            num.textContent = Math.floor(this.targets()[0].val);
          }
        });
      },
      once: true
    });
  });

  // Services horizontal scroll progress
  const servicesTrack = document.getElementById('services-track');
  const servicesProgress = document.getElementById('services-progress');

  if (servicesTrack && servicesProgress) {
    servicesTrack.addEventListener('scroll', () => {
      const scrollLeft = servicesTrack.scrollLeft;
      const maxScroll = servicesTrack.scrollWidth - servicesTrack.clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      servicesProgress.style.width = progress + '%';
    });
  }

  // Service slides entrance
  gsap.from('.service-slide', {
    x: 100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.services',
      start: 'top 70%'
    }
  });

  // Bento grid items
  document.querySelectorAll('.bento__item').forEach(item => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 85%',
      onEnter: () => item.classList.add('visible'),
      once: true
    });

    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(item.querySelector('.bento__inner'), {
        rotateY: x * 5,
        rotateX: -y * 5,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 600
      });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item.querySelector('.bento__inner'), {
        rotateY: 0, rotateX: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)'
      });
    });
  });

  // Process timeline line
  ScrollTrigger.create({
    trigger: '.process__timeline',
    start: 'top 70%',
    onEnter: () => document.getElementById('process-line').classList.add('animated'),
    once: true
  });

  // Process steps stagger
  gsap.from('.process__step', {
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.process__timeline',
      start: 'top 75%'
    }
  });

  // Contact form fields
  gsap.from('.contact__form', {
    x: 60,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.contact',
      start: 'top 70%'
    }
  });

  // Parallax orbs
  gsap.utils.toArray('.orb').forEach((orb, i) => {
    gsap.to(orb, {
      y: (i + 1) * -60,
      ease: 'none',
      scrollTrigger: {
        trigger: orb.closest('section') || document.body,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  // Marquee speed on scroll
  gsap.to('.marquee__track', {
    xPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '.marquee-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    }
  });
}

// ===== FORM =====
document.getElementById('demo-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const text = btn.querySelector('.btn__text');

  gsap.to(btn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
  text.textContent = 'جاري الإرسال...';

  setTimeout(() => {
    text.textContent = 'تم الإرسال ✓';
    gsap.fromTo(btn, { boxShadow: '0 0 0px rgba(0,200,83,0)' }, {
      boxShadow: '0 0 60px rgba(0,200,83,0.5)',
      duration: 0.6
    });
    setTimeout(() => {
      e.target.reset();
      text.textContent = 'أرسل طلبك';
      gsap.to(btn, { boxShadow: '0 0 40px rgba(0,200,83,0.4)', duration: 0.4 });
    }, 2500);
  }, 1500);
});

// Smooth scroll for hero buttons
document.querySelectorAll('.btn--ghost, .btn--glow').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const href = btn.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        gsap.to(window, { scrollTo: { y: target, offsetY: 80 }, duration: 1.2, ease: 'power3.inOut' });
      }
    }
  });
});

if (typeof ScrollToPlugin !== 'undefined') {
  gsap.registerPlugin(ScrollToPlugin);
}
