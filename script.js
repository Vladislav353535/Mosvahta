/* ============================================
   МОСВАХТА — Production JavaScript
   ============================================ */

// ============ CONFIG ============
// Hardcoded defaults — localStorage override only if explicitly saved via settings
const BOT_TOKEN = '8738430859:AAHy_4TpSbM5QfI6chYEIz5ejpBfErIOWQY';
const CHAT_ID = '-5484300584';
const TG_LINK = 'https://t.me/+37Evvk9Vvw03NWQy';

// Clear stale localStorage from old config
if (localStorage.getItem('tg_bot_token') && localStorage.getItem('tg_bot_token') !== BOT_TOKEN) {
  localStorage.removeItem('tg_bot_token');
  localStorage.removeItem('tg_chat_id');
  localStorage.removeItem('tg_link');
}

const CONFIG = {
  botToken: localStorage.getItem('tg_bot_token') || BOT_TOKEN,
  chatId: localStorage.getItem('tg_chat_id') || CHAT_ID,
  tgLink: localStorage.getItem('tg_link') || TG_LINK,
};

const JOBS = [
  { name: 'Упаковщик / Упаковщица', rate: 3500 },
  { name: 'Грузчик', rate: 3500 },
  { name: 'Сборщик заказов', rate: 3900 },
  { name: 'Комплектовщик', rate: 3500 },
  { name: 'Разнорабочий', rate: 3500 },
  { name: 'Кладовщик', rate: 4200 },
  { name: 'Водитель погрузчика', rate: 4500 },
];

const SHIFTS_OPTIONS = [15, 30, 45, 60];

// ============ STATE ============
let currentShifts = 15;
let currentRate = 3500;
let formStep = 1;
const totalFormSteps = 4;

// ============ DOM READY ============
document.addEventListener('DOMContentLoaded', () => {
  initCalculator();
  initShiftsGrid();
  initRadioOptions();
  initPhoneMask();
  initScrollEffects();
  initMobileMenu();
  initRippleEffect();
  updateEarningsTable();
  
  // v2.0 features
  initParticles();
  initTiltCards();
  initCursorGlow();
  initLiveWorkersCounter();
});


// ============ CALCULATOR ============
function initCalculator() {
  const select = document.getElementById('calcJob');
  if (!select) return;

  select.addEventListener('change', () => {
    currentRate = parseInt(select.value);
    updateCalculator();
    updateShiftLabels();
    updateEarningsTable();
  });

  updateCalculator();
  updateShiftLabels();
}

function initShiftsGrid() {
  const grid = document.getElementById('shiftsGrid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.shift-btn');
    if (!btn) return;

    grid.querySelectorAll('.shift-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentShifts = parseInt(btn.dataset.shifts);
    updateCalculator();
  });
}

function updateCalculator() {
  const total = currentRate * currentShifts;

  const totalEl = document.getElementById('calcTotal');
  const rateEl = document.getElementById('calcRate');
  const shiftsTextEl = document.getElementById('calcShiftsText');

  if (totalEl) animateNumber(totalEl, total);
  if (rateEl) rateEl.textContent = formatNumber(currentRate);
  if (shiftsTextEl) shiftsTextEl.textContent = `${currentShifts} смен`;
}

function updateShiftLabels() {
  SHIFTS_OPTIONS.forEach(shifts => {
    const el = document.getElementById(`shiftLabel${shifts}`);
    if (el) el.textContent = `от ${formatNumber(currentRate * shifts)} ₽`;
  });
}

function updateEarningsTable() {
  const cells = document.querySelectorAll('#earningsTable .earnings-cell');
  cells.forEach((cell, i) => {
    if (SHIFTS_OPTIONS[i]) {
      const amount = currentRate * SHIFTS_OPTIONS[i];
      const amountEl = cell.querySelector('.amount');
      if (amountEl) amountEl.textContent = `${formatNumber(amount)} ₽`;
    }
  });
}


// ============ NUMBER FORMATTING & ANIMATION ============
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function animateNumber(el, target) {
  const start = parseInt(el.textContent.replace(/\s/g, '')) || 0;
  const diff = target - start;
  const duration = 500;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + diff * ease);
    el.textContent = formatNumber(current);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


// ============ RADIO OPTIONS ============
function initRadioOptions() {
  document.querySelectorAll('.radio-group').forEach(group => {
    group.addEventListener('click', (e) => {
      const option = e.target.closest('.radio-option');
      if (!option) return;

      group.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      option.querySelector('input').checked = true;
    });
  });
}


// ============ PHONE MASK ============
function initPhoneMask() {
  const phone = document.getElementById('userPhone');
  if (!phone) return;

  phone.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length === 0) {
      e.target.value = '';
      return;
    }
    if (val[0] === '8') val = '7' + val.slice(1);
    if (val[0] !== '7') val = '7' + val;

    let formatted = '+7';
    if (val.length > 1) formatted += ' (' + val.slice(1, 4);
    if (val.length > 4) formatted += ') ' + val.slice(4, 7);
    if (val.length > 7) formatted += '-' + val.slice(7, 9);
    if (val.length > 9) formatted += '-' + val.slice(9, 11);

    e.target.value = formatted;
  });

  phone.addEventListener('focus', () => {
    if (!phone.value) phone.value = '+7 (';
  });

  phone.addEventListener('blur', () => {
    if (phone.value === '+7 (' || phone.value === '+7') phone.value = '';
  });
}


// ============ FORM STEPS ============
function nextStep(current) {
  if (current >= totalFormSteps) return;

  // Hide current step
  document.getElementById(`formStep${current}`).classList.remove('active');
  // Show next step
  document.getElementById(`formStep${current + 1}`).classList.add('active');
  formStep = current + 1;

  // Update progress
  updateFormProgress();
}

function prevStep(current) {
  if (current <= 1) return;

  document.getElementById(`formStep${current}`).classList.remove('active');
  document.getElementById(`formStep${current - 1}`).classList.add('active');
  formStep = current - 1;

  updateFormProgress();
}

function updateFormProgress() {
  const steps = document.querySelectorAll('#formProgress .form-progress-step');
  steps.forEach((step, i) => {
    step.classList.remove('active', 'done');
    if (i < formStep - 1) step.classList.add('done');
    if (i === formStep - 1) step.classList.add('active');
  });
}


// ============ FORM SUBMISSION ============
async function submitForm() {
  const name = document.getElementById('userName').value.trim();
  const phone = document.getElementById('userPhone').value.trim();
  const city = document.getElementById('userCity').value.trim();

  // Validation
  if (!name) {
    shakeInput(document.getElementById('userName'));
    showToast('Укажите ваше имя', 'error');
    return;
  }
  if (!phone || phone.length < 16) {
    shakeInput(document.getElementById('userPhone'));
    showToast('Укажите корректный номер телефона', 'error');
    return;
  }

  // Collect survey data
  const vacancy = document.querySelector('input[name="vacancy"]:checked')?.value || 'Не указано';
  const experience = document.querySelector('input[name="experience"]:checked')?.value || 'Не указано';
  const startDate = document.querySelector('input[name="startDate"]:checked')?.value || 'Не указано';

  // Loading state
  const btn = document.getElementById('submitBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<div class="spinner"></div> Отправка...';
  btn.disabled = true;

  // Build message
  const message = buildTelegramMessage({ name, phone, city, vacancy, experience, startDate });

  let sent = false;

  // Try sending to Telegram
  if (CONFIG.botToken && CONFIG.chatId) {
    try {
      sent = await sendToTelegram(message);
    } catch (err) {
      console.error('Telegram send failed:', err);
    }
  }

  // Simulate delay if no Telegram
  if (!sent) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    console.log('📋 Form data (Telegram not configured):', { name, phone, city, vacancy, experience, startDate });
  }

  // Show success
  btn.innerHTML = originalText;
  btn.disabled = false;

  // Hide form, show success
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById('formProgress').style.display = 'none';
  document.getElementById('formSuccess').classList.add('visible');

  showToast(sent ? 'Заявка отправлена в Telegram!' : 'Заявка получена! Мы свяжемся с вами.', 'success');
}

function buildTelegramMessage(data) {
  const now = new Date();
  const dateStr = now.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return `🔔 <b>НОВАЯ ЗАЯВКА С САЙТА</b>\n\n` +
    `👤 <b>Имя:</b> ${escapeHtml(data.name)}\n` +
    `📱 <b>Телефон:</b> ${escapeHtml(data.phone)}\n` +
    `🏙 <b>Город:</b> ${escapeHtml(data.city || 'Не указан')}\n\n` +
    `💼 <b>Вакансия:</b> ${escapeHtml(data.vacancy)}\n` +
    `📊 <b>Опыт:</b> ${escapeHtml(data.experience)}\n` +
    `📅 <b>Готовность:</b> ${escapeHtml(data.startDate)}\n\n` +
    `🕐 <i>${dateStr}</i>`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${CONFIG.botToken}/sendMessage`;

  console.log('📤 Sending to Telegram...', { chatId: CONFIG.chatId, tokenPrefix: CONFIG.botToken.slice(0, 10) + '...' });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CONFIG.chatId,
      text: message,
      parse_mode: 'HTML',
    })
  });

  const result = await response.json();
  console.log('📨 Telegram response:', result);

  if (!result.ok) {
    console.error('Telegram API error:', result);
    return false;
  }

  return true;
}


// ============ SETTINGS ============
function openSettings() {
  document.getElementById('settingsBotToken').value = CONFIG.botToken;
  document.getElementById('settingsChatId').value = CONFIG.chatId;
  document.getElementById('settingsTgLink').value = CONFIG.tgLink;
  document.getElementById('settingsOverlay').classList.add('visible');
}

function closeSettings() {
  document.getElementById('settingsOverlay').classList.remove('visible');
}

function saveSettings() {
  CONFIG.botToken = document.getElementById('settingsBotToken').value.trim();
  CONFIG.chatId = document.getElementById('settingsChatId').value.trim();
  CONFIG.tgLink = document.getElementById('settingsTgLink').value.trim();

  localStorage.setItem('tg_bot_token', CONFIG.botToken);
  localStorage.setItem('tg_chat_id', CONFIG.chatId);
  localStorage.setItem('tg_link', CONFIG.tgLink);

  closeSettings();
  showToast('Настройки Telegram сохранены!', 'success');
}


// ============ TOAST ============
let toastTimeout;

function showToast(text, type = 'success') {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  const toastIcon = document.getElementById('toastIcon');

  toastText.textContent = text;

  toastIcon.className = 'toast-icon ' + type;
  if (type === 'error') {
    toastIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  } else {
    toastIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  }

  toast.classList.add('visible');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(hideToast, 4000);
}

function hideToast() {
  document.getElementById('toast').classList.remove('visible');
}


// ============ SCROLL EFFECTS ============
function initScrollEffects() {
  const header = document.getElementById('header');
  const floatingCta = document.getElementById('floatingCta');

  // Intersection Observer for reveal animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Animate counters
        const counters = entry.target.querySelectorAll('.counter-animated[data-target]');
        counters.forEach(counter => animateCounter(counter));
        if (entry.target.classList.contains('counter-animated') && entry.target.dataset.target) {
          animateCounter(entry.target);
        }
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Header scroll
  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Floating CTA
    if (scrollY > 600) {
      floatingCta.classList.add('visible');
    } else {
      floatingCta.classList.remove('visible');
    }

    lastScrollY = scrollY;
  }, { passive: true });
}

function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = 'true';

  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * ease);
    el.textContent = formatNumber(current) + '+';
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


// ============ MOBILE MENU ============
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mobileNav');

  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  // Close on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
}


// ============ RIPPLE EFFECT ============
function initRippleEffect() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}


// ============ HELPERS ============
function shakeInput(input) {
  input.style.borderColor = '#ef4444';
  input.style.animation = 'shake 0.4s ease';
  input.focus();

  setTimeout(() => {
    input.style.borderColor = '';
    input.style.animation = '';
  }, 600);
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    50% { transform: translateX(8px); }
    75% { transform: translateX(-4px); }
  }
`;
document.head.appendChild(style);


// ============ SMOOTH SCROLL FOR ANCHOR LINKS ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// Close settings on overlay click
document.getElementById('settingsOverlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeSettings();
});

// Close settings on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSettings();
});

// ============ V2 ANIMATIONS ============

// 1. Particle Canvas Background
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.color = Math.random() > 0.5 ? '#f97316' : '#52525b';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x > width) this.x = 0;
      if (this.x < 0) this.x = width;
      if (this.y > height) this.y = 0;
      if (this.y < 0) this.y = height;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    const count = window.innerWidth < 768 ? 30 : 70;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animate);
  }

  init();
  animate();
}

// 2. Tilt effect for cards
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'none';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.transition = 'transform 0.5s ease';
    });
  });
}

// 3. Cursor Glow Follower
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.innerWidth < 768) return;
  
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// 4. Live Worker Counter
function initLiveWorkersCounter() {
  const el = document.getElementById('liveWorkers');
  if (!el) return;
  
  let current = 24387;
  
  setInterval(() => {
    // Random fluctuation between -2 and +3
    const change = Math.floor(Math.random() * 6) - 2;
    current += change;
    el.textContent = current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }, 4000);
}
