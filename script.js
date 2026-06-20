/* ===========================
   Smart Utility Hub - script.js
   Developer: Yuvaraja H M
=========================== */

// ===========================
// NAVBAR MOBILE TOGGLE
// ===========================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});

// Close nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// ===========================
// TABS
// ===========================
const tabBtns = document.querySelectorAll('.tab-btn');
const calcPanels = document.querySelectorAll('.calc-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    calcPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// ===========================
// HELPERS
// ===========================
function formatINR(num) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

function showError(inputId, msgId, msg) {
  const input = document.getElementById(inputId);
  const msgEl = document.getElementById(msgId);
  if (input) input.classList.add('error-input');
  if (msgEl) { msgEl.textContent = '⚠ ' + msg; msgEl.classList.add('show'); }
  return false;
}

function clearError(inputId, msgId) {
  const input = document.getElementById(inputId);
  const msgEl = document.getElementById(msgId);
  if (input) input.classList.remove('error-input');
  if (msgEl) msgEl.classList.remove('show');
}

function clearAllErrors(ids) {
  ids.forEach(([inputId, msgId]) => clearError(inputId, msgId));
}

// ===========================
// COPY TO CLIPBOARD
// ===========================
function copyResult(resultId, btnEl) {
  const box = document.getElementById(resultId);
  if (!box) return;
  const text = box.innerText.replace(/\n+/g, '\n').trim();
  navigator.clipboard.writeText(text).then(() => {
    const orig = btnEl.innerHTML;
    btnEl.innerHTML = '✅ Copied!';
    btnEl.style.background = 'var(--success)';
    btnEl.style.color = '#fff';
    setTimeout(() => {
      btnEl.innerHTML = orig;
      btnEl.style.background = '';
      btnEl.style.color = '';
    }, 2000);
  }).catch(() => {
    btnEl.innerHTML = '❌ Failed';
    setTimeout(() => { btnEl.innerHTML = '📋 Copy'; }, 2000);
  });
}

// ===========================
// GST CALCULATOR
// ===========================
function calculateGST(mode) {
  clearAllErrors([
    ['gstAmount', 'gstAmountErr'],
    ['gstRate', 'gstRateErr']
  ]);

  const amtVal = document.getElementById('gstAmount').value.trim();
  const rate = parseFloat(document.getElementById('gstRate').value);
  let valid = true;

  if (!amtVal || isNaN(parseFloat(amtVal)) || parseFloat(amtVal) <= 0) {
    showError('gstAmount', 'gstAmountErr', 'Please enter a valid positive amount.');
    valid = false;
  }

  if (!valid) return;

  const amount = parseFloat(amtVal);
  let originalAmt, gstAmt, finalAmt;

  if (mode === 'add') {
    originalAmt = amount;
    gstAmt = (amount * rate) / 100;
    finalAmt = amount + gstAmt;
  } else {
    // Remove GST (amount entered is inclusive of GST)
    originalAmt = amount / (1 + rate / 100);
    gstAmt = amount - originalAmt;
    finalAmt = amount;
  }

  document.getElementById('gstOriginal').textContent = '₹ ' + formatINR(originalAmt);
  document.getElementById('gstPercent').textContent = rate + '%';
  document.getElementById('gstAmt').textContent = '₹ ' + formatINR(gstAmt);
  document.getElementById('gstFinal').textContent = '₹ ' + formatINR(finalAmt);
  document.getElementById('gstModeLabel').textContent = mode === 'add' ? '➕ GST Added' : '➖ GST Removed';

  const box = document.getElementById('gstResult');
  box.classList.add('show');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetGST() {
  document.getElementById('gstAmount').value = '';
  document.getElementById('gstRate').value = '18';
  document.getElementById('gstResult').classList.remove('show');
  clearAllErrors([['gstAmount', 'gstAmountErr']]);
}

// ===========================
// EMI CALCULATOR
// ===========================
function calculateEMI() {
  clearAllErrors([
    ['loanAmount', 'loanAmountErr'],
    ['interestRate', 'interestRateErr'],
    ['tenure', 'tenureErr']
  ]);

  const P = parseFloat(document.getElementById('loanAmount').value);
  const annualRate = parseFloat(document.getElementById('interestRate').value);
  const tenureVal = parseFloat(document.getElementById('tenure').value);
  const tenureType = document.getElementById('tenureType').value;
  let valid = true;

  if (!P || isNaN(P) || P <= 0) {
    showError('loanAmount', 'loanAmountErr', 'Enter a valid loan amount (> 0).');
    valid = false;
  }

  if (!annualRate || isNaN(annualRate) || annualRate <= 0 || annualRate > 100) {
    showError('interestRate', 'interestRateErr', 'Enter a valid interest rate (0.1 – 100).');
    valid = false;
  }

  if (!tenureVal || isNaN(tenureVal) || tenureVal <= 0) {
    showError('tenure', 'tenureErr', 'Enter a valid tenure (> 0).');
    valid = false;
  }

  if (!valid) return;

  const N = tenureType === 'years' ? tenureVal * 12 : tenureVal;
  const R = annualRate / 12 / 100;

  let emi;
  if (R === 0) {
    emi = P / N;
  } else {
    const pow = Math.pow(1 + R, N);
    emi = (P * R * pow) / (pow - 1);
  }

  const totalPayment = emi * N;
  const totalInterest = totalPayment - P;
  const principalPct = ((P / totalPayment) * 100).toFixed(1);
  const interestPct = ((totalInterest / totalPayment) * 100).toFixed(1);

  document.getElementById('emiMonthly').textContent = '₹ ' + formatINR(emi);
  document.getElementById('emiTotalInterest').textContent = '₹ ' + formatINR(totalInterest);
  document.getElementById('emiTotalPayment').textContent = '₹ ' + formatINR(totalPayment);
  document.getElementById('emiPrincipal').textContent = '₹ ' + formatINR(P);

  // Chart bars
  document.getElementById('principalBar').style.width = principalPct + '%';
  document.getElementById('interestBar').style.width = interestPct + '%';
  document.getElementById('principalPct').textContent = principalPct + '%';
  document.getElementById('interestPct').textContent = interestPct + '%';

  const box = document.getElementById('emiResult');
  box.classList.add('show');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetEMI() {
  ['loanAmount', 'interestRate', 'tenure'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('tenureType').value = 'months';
  document.getElementById('emiResult').classList.remove('show');
  clearAllErrors([
    ['loanAmount', 'loanAmountErr'],
    ['interestRate', 'interestRateErr'],
    ['tenure', 'tenureErr']
  ]);
}

// ===========================
// AGE CALCULATOR
// ===========================
function calculateAge() {
  clearAllErrors([['dob', 'dobErr']]);

  const dobVal = document.getElementById('dob').value;

  if (!dobVal) {
    showError('dob', 'dobErr', 'Please select your date of birth.');
    return;
  }

  const dob = new Date(dobVal);
  const today = new Date();

  if (dob > today) {
    showError('dob', 'dobErr', 'Date of birth cannot be in the future.');
    return;
  }

  // Calculate precise age
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Total days lived
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.floor((today - dob) / msPerDay);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;

  // Next birthday
  const nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBday <= today) nextBday.setFullYear(today.getFullYear() + 1);
  const daysToNextBday = Math.ceil((nextBday - today) / msPerDay);

  // Day of week born
  const days_of_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bornOnDay = days_of_week[dob.getDay()];

  document.getElementById('ageYears').textContent = years;
  document.getElementById('ageMonths').textContent = months;
  document.getElementById('ageDays').textContent = days;
  document.getElementById('ageTotalDays').textContent = totalDays.toLocaleString('en-IN');
  document.getElementById('ageTotalWeeks').textContent = totalWeeks.toLocaleString('en-IN');
  document.getElementById('ageTotalMonths').textContent = totalMonths.toLocaleString('en-IN');
  document.getElementById('ageBornOn').textContent = bornOnDay;
  document.getElementById('ageNextBday').textContent = daysToNextBday === 365 ? '🎂 Today is your Birthday!' : daysToNextBday + ' days';

  const box = document.getElementById('ageResult');
  box.classList.add('show');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetAge() {
  document.getElementById('dob').value = '';
  document.getElementById('ageResult').classList.remove('show');
  clearAllErrors([['dob', 'dobErr']]);
}

// ===========================
// SET MAX DATE FOR DOB
// ===========================
window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dob').setAttribute('max', today);

  // Animate hero stats
  animateCounters();
});

function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.count);
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      counter.textContent = Math.floor(current) + (counter.dataset.suffix || '');
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// ===========================
// SMOOTH SCROLL
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===========================
// KEYBOARD ENTER SUPPORT
// ===========================
document.getElementById('gstAmount').addEventListener('keydown', e => {
  if (e.key === 'Enter') calculateGST('add');
});

document.getElementById('loanAmount').addEventListener('keydown', e => {
  if (e.key === 'Enter') calculateEMI();
});

document.getElementById('interestRate').addEventListener('keydown', e => {
  if (e.key === 'Enter') calculateEMI();
});

document.getElementById('tenure').addEventListener('keydown', e => {
  if (e.key === 'Enter') calculateEMI();
});
