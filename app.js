// State
const state = { name: '', role: '', project: '', answer: '' };

// Role keywords map
const roleKeywords = {
  IT: ['javascript','python','react','node','sql','api','database','cloud','aws','docker','git','agile','html','css','java','linux','testing','devops','backend','frontend','algorithm','data structure','rest','mongodb','typescript'],
  BFSI: ['finance','banking','risk','compliance','accounting','audit','investment','portfolio','insurance','regulatory','analytics','excel','trading','credit','valuation','mutual fund','stock','financial modeling'],
  Marketing: ['seo','campaign','brand','social media','content','analytics','strategy','engagement','growth','digital','conversion','funnel','roi','copywriting','advertising','influencer','email marketing'],
  'Core Engineering': ['design','cad','manufacturing','mechanical','circuit','simulation','testing','quality','autocad','matlab','thermal','structural','production','materials','process','solidworks','ansys']
};

// Role-specific feedback
const roleTips = {
  IT: {
    cv: 'Highlight specific tech stacks (React, Node, AWS) and quantify project impact with metrics like response time or user count.',
    interview: 'Practice DSA problem-solving explanations and system design walkthroughs for technical rounds.',
    general: 'Focus on building 2-3 strong GitHub projects with clean documentation.'
  },
  BFSI: {
    cv: 'Emphasize analytical skills, financial modeling experience, and any certifications (CFA, NISM).',
    interview: 'Prepare for case-based questions — practice structuring answers around financial scenarios.',
    general: 'Strong communication and presentation skills are critical for BFSI roles.'
  },
  Marketing: {
    cv: 'Showcase campaigns you\'ve run with real metrics — impressions, engagement rates, conversion numbers.',
    interview: 'Use storytelling in your answers. Demonstrate creative thinking and data-driven decision making.',
    general: 'Build a portfolio of campaigns, content samples, or social media case studies.'
  },
  'Core Engineering': {
    cv: 'Include technical tools (AutoCAD, MATLAB, SolidWorks) and describe design or manufacturing outcomes.',
    interview: 'Prepare to explain engineering problem-solving with clear cause-effect reasoning.',
    general: 'Hands-on project experience with measurable results will set you apart.'
  }
};

const actionWords = ['built','developed','created','designed','implemented','led','managed','optimized','improved','launched','deployed','architected','engineered','automated','integrated','reduced','increased','achieved','delivered','scaled'];
const structuredWords = ['because','solution','result','therefore','approach','strategy','firstly','secondly','consequently','analyzed','resolved','outcome','situation','task','action'];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  void el.offsetWidth;
  el.classList.add('active');
  window.scrollTo(0, 0);
}

function goToForm() { showScreen('formScreen'); }
function goBack(screenId) { showScreen(screenId); }

function analyze() {
  state.name = document.getElementById('userName').value.trim();
  state.role = document.getElementById('userRole').value;
  state.project = document.getElementById('userProject').value.trim();
  state.answer = document.getElementById('userAnswer').value.trim();

  if (!state.name || !state.role || !state.project || !state.answer) {
    alert('Please fill in all fields'); return;
  }
  showScreen('processingScreen');
  startProcessing();
}

function startProcessing() {
  const steps = document.querySelectorAll('.processing-step');
  const textEl = document.getElementById('processingText');
  const msgs = [
    'Scanning CV for role-specific signals…',
    'Evaluating interview response quality…',
    'Analyzing communication patterns…',
    'Computing Placement Score…'
  ];
  let i = 0;
  textEl.textContent = msgs[0];
  steps[0].classList.add('active');

  const interval = setInterval(() => {
    // Mark previous as done
    steps[i].classList.remove('active');
    steps[i].classList.add('done');
    steps[i].querySelector('.step-icon').textContent = '✓';
    i++;
    if (i < msgs.length) {
      textEl.style.opacity = '0';
      setTimeout(() => {
        textEl.textContent = msgs[i];
        textEl.style.opacity = '1';
        steps[i].classList.add('active');
      }, 200);
    } else {
      clearInterval(interval);
      setTimeout(() => calculateAndShow(), 400);
    }
  }, 900);
}

function calcCV(text, role) {
  let score = 20;
  if (text.length > 50) score += 20;
  const lower = text.toLowerCase();
  if (actionWords.some(w => lower.includes(w))) score += 20;
  if (/\d+/.test(text)) score += 20;
  const kw = roleKeywords[role] || [];
  if (kw.some(w => lower.includes(w))) score += 20;
  return Math.min(score, 100);
}

function calcInterview(text) {
  let score;
  if (text.length < 50) score = 30;
  else if (text.length <= 150) score = 60;
  else score = 80;
  const lower = text.toLowerCase();
  if (structuredWords.some(w => lower.includes(w))) score += 10;
  return Math.min(score, 100);
}

function calcComm(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgLen = sentences.length > 0 ? text.length / sentences.length : text.length;
  let score = 55;
  if (sentences.length >= 3) score += 10;
  if (avgLen > 20 && avgLen < 120) score += 10;
  if (text.length > 100) score += 5;
  const words = text.split(/\s+/).length;
  const unique = new Set(text.toLowerCase().split(/\s+/)).size;
  if (words > 0 && unique / words > 0.6) score += 5;
  return Math.max(40, Math.min(score, 85));
}

function getScoreColor(score) {
  if (score < 50) return 'low';
  if (score <= 70) return 'mid';
  return 'high';
}

function getRingClass(score) {
  if (score < 50) return 'ring-low';
  if (score <= 65) return 'ring-mid';
  if (score <= 80) return 'ring-good';
  return 'ring-great';
}

function getScoreClass(score) {
  if (score < 50) return 'score-low';
  if (score <= 65) return 'score-mid';
  if (score <= 80) return 'score-good';
  return 'score-great';
}

function getValClass(score) {
  if (score < 50) return 'val-low';
  if (score <= 65) return 'val-mid';
  return 'val-high';
}

function getBarClass(score) {
  if (score < 50) return 'fill-low';
  if (score <= 65) return 'fill-mid';
  return 'fill-high';
}

function getEmotionalMsg(score) {
  if (score < 50) return {
    text: 'Students with this score often struggle in placements. You are currently below average compared to similar candidates.',
    cls: 'msg-low'
  };
  if (score < 60) return {
    text: 'You are below the placement-ready benchmark. Focused preparation can close this gap.',
    cls: 'msg-low'
  };
  if (score <= 75) return {
    text: 'You\'re close to being placement ready, but key gaps remain. A structured plan can make the difference.',
    cls: 'msg-mid'
  };
  return {
    text: 'You\'re ahead of most candidates in your category. Fine-tuning will make you stand out further.',
    cls: 'msg-high'
  };
}

function getStrengthAndGap(cv, iv, comm) {
  const scores = { 'Projects / CV': cv, 'Interview Skills': iv, 'Communication': comm };
  let maxKey = '', minKey = '', maxVal = -1, minVal = 999;
  for (const [k, v] of Object.entries(scores)) {
    if (v > maxVal) { maxVal = v; maxKey = k; }
    if (v < minVal) { minVal = v; minKey = k; }
  }
  return { strength: maxKey, gap: minKey };
}

function getFeedback(cv, iv, comm, role) {
  const fb = [];
  const tips = roleTips[role] || roleTips['IT'];

  // CV feedback
  if (cv < 60) {
    fb.push({ icon: '📄', text: 'Your CV lacks measurable impact — add numbers like % improvement, users served, or revenue generated. ' + tips.cv });
  } else if (cv < 80) {
    fb.push({ icon: '📄', text: 'Your CV shows promise. Strengthen it with more specific outcomes. ' + tips.cv });
  } else {
    fb.push({ icon: '✅', text: 'Strong CV with good use of action words and metrics. ' + tips.cv });
  }

  // Interview feedback
  if (iv < 60) {
    fb.push({ icon: '🎤', text: 'Structure your answers using the STAR method (Situation, Task, Action, Result). ' + tips.interview });
  } else if (iv < 80) {
    fb.push({ icon: '🎤', text: 'Good structure in your responses. Add more depth with specific examples. ' + tips.interview });
  } else {
    fb.push({ icon: '✅', text: 'Well-structured interview answer with clear reasoning. Keep practicing for consistency.' });
  }

  // Communication feedback
  if (comm < 55) {
    fb.push({ icon: '💬', text: 'Your responses need clearer communication and more concise phrasing. Use shorter, varied sentences.' });
  } else if (comm < 70) {
    fb.push({ icon: '💬', text: 'Decent communication. Focus on sentence clarity and vocabulary variety to improve further.' });
  } else {
    fb.push({ icon: '✅', text: 'Good communication clarity. Minor improvements in conciseness will help.' });
  }

  // Role-specific general tip
  fb.push({ icon: '🎯', text: tips.general });

  return fb;
}

function calculateAndShow() {
  const cv = calcCV(state.project, state.role);
  const iv = calcInterview(state.answer);
  const comm = calcComm(state.project + ' ' + state.answer);
  const final = Math.round(0.4 * cv + 0.3 * iv + 0.3 * comm);

  // Reset processing steps for re-analysis
  document.querySelectorAll('.processing-step').forEach(s => {
    s.classList.remove('done', 'active');
    s.querySelector('.step-icon').textContent = '';
  });

  showScreen('scoreScreen');

  // Greeting
  document.getElementById('scoreGreeting').textContent = state.name + ', here\'s your score';

  // Animate score counter
  const valEl = document.getElementById('scoreValue');
  valEl.className = 'score-value ' + getScoreClass(final);
  let current = 0;
  const step = Math.max(1, Math.floor(final / 50));
  const counter = setInterval(() => {
    current += step;
    if (current >= final) { current = final; clearInterval(counter); }
    valEl.innerHTML = current + '<span>/100</span>';
  }, 25);

  // Animate ring
  const ring = document.querySelector('.progress-ring');
  ring.className = 'progress-ring ' + getRingClass(final);
  setTimeout(() => {
    ring.style.strokeDashoffset = 440 - (440 * final / 100);
  }, 100);

  // Score bars
  const setBar = (barId, valId, score) => {
    document.getElementById(valId).textContent = score + '/100';
    document.getElementById(valId).className = 'score-item-value ' + getValClass(score);
    const bar = document.getElementById(barId);
    bar.className = 'progress-bar-fill ' + getBarClass(score);
    setTimeout(() => { bar.style.width = score + '%'; }, 300);
  };
  setBar('cvBar', 'cvVal', cv);
  setBar('ivBar', 'ivVal', iv);
  setBar('commBar', 'commVal', comm);

  // Emotional message
  const emo = getEmotionalMsg(final);
  const emoEl = document.getElementById('emotionalMsg');
  emoEl.textContent = emo.text;
  emoEl.className = 'emotional-msg ' + emo.cls;

  // Strength / Gap pills
  const sg = getStrengthAndGap(cv, iv, comm);
  document.getElementById('strengthVal').textContent = sg.strength;
  document.getElementById('gapVal').textContent = sg.gap;

  // Feedback
  const fb = getFeedback(cv, iv, comm, state.role);
  const container = document.getElementById('feedbackList');
  container.innerHTML = '';
  fb.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'feedback-item';
    div.style.animationDelay = (i * 0.1) + 's';
    div.innerHTML = '<span class="feedback-icon">' + f.icon + '</span><span>' + f.text + '</span>';
    container.appendChild(div);
  });

  // Role-specific paywall text
  document.getElementById('paywallRole').textContent = state.role + ' preparation roadmap';
}

function goToPaywall() { showScreen('paywallScreen'); }

function unlockPlan() {
  alert('This is a prototype. Payment integration coming soon!');
}
