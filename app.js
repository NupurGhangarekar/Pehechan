// Initialize pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// State
const state = { name: '', role: '', project: '', answer: '', resumeText: '', resumeAnalysis: null };

// All detectable skills
const allSkills = [
  'python','java','javascript','c++','c#','sql','react','angular','vue','node','express',
  'html','css','typescript','mongodb','postgresql','mysql','docker','kubernetes','aws','azure',
  'gcp','git','linux','django','flask','spring','tensorflow','pytorch','pandas','numpy',
  'excel','tableau','power bi','figma','photoshop','autocad','matlab','solidworks','ansys',
  'r','scala','go','rust','swift','kotlin','php','ruby','hadoop','spark','kafka',
  'redis','graphql','rest api','firebase','heroku','jenkins','ci/cd','agile','scrum',
  'machine learning','deep learning','nlp','computer vision','data science','blockchain'
];

const roleKeywords = {
  IT: ['javascript','python','react','node','sql','api','database','cloud','aws','docker','git','agile','html','css','java','linux','testing','devops','backend','frontend','algorithm','data structure','rest','mongodb','typescript','machine learning','deep learning'],
  BFSI: ['finance','banking','risk','compliance','accounting','audit','investment','portfolio','insurance','regulatory','analytics','excel','trading','credit','valuation','mutual fund','stock','financial modeling'],
  Marketing: ['seo','campaign','brand','social media','content','analytics','strategy','engagement','growth','digital','conversion','funnel','roi','copywriting','advertising','influencer','email marketing'],
  'Core Engineering': ['design','cad','manufacturing','mechanical','circuit','simulation','testing','quality','autocad','matlab','thermal','structural','production','materials','process','solidworks','ansys']
};

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
const sectionHeadings = ['project','experience','education','skill','certification','achievement','objective','summary','internship','training','extracurricular','hobby','interest','award','work history','professional summary'];

// ===== SCREEN NAV =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  void el.offsetWidth;
  el.classList.add('active');
  window.scrollTo(0, 0);
}
function goToForm() { showScreen('formScreen'); }
function goBack(screenId) { showScreen(screenId); }

// ===== DRAG & DROP =====
(function initDragDrop() {
  document.addEventListener('DOMContentLoaded', function() {
    const zone = document.getElementById('uploadZone');
    if (!zone) return;
    zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', function() { zone.classList.remove('dragover'); });
    zone.addEventListener('drop', function(e) {
      e.preventDefault(); zone.classList.remove('dragover');
      var files = e.dataTransfer.files;
      if (files.length > 0) processFile(files[0]);
    });
  });
})();

// ===== FILE HANDLING =====
function handleFileSelect(e) {
  var file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  var errEl = document.getElementById('uploadError');
  var fnEl = document.getElementById('uploadFilename');
  var zone = document.getElementById('uploadZone');
  errEl.style.display = 'none';
  fnEl.style.display = 'none';

  if (file.type !== 'application/pdf') {
    errEl.textContent = 'Please upload a PDF file only.';
    errEl.style.display = 'block';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    errEl.textContent = 'File too large. Please upload a PDF under 10MB.';
    errEl.style.display = 'block';
    return;
  }

  zone.classList.add('has-file');
  document.getElementById('uploadTitle').textContent = 'Resume uploaded';
  fnEl.textContent = file.name;
  fnEl.style.display = 'block';
  document.getElementById('uploadHint').style.display = 'none';

  extractPDFText(file);
}

// ===== PDF TEXT EXTRACTION =====
async function extractPDFText(file) {
  var loader = document.getElementById('parseLoader');
  var loaderText = document.getElementById('parseLoaderText');
  loader.classList.add('active');

  var parseMessages = ['Reading your resume…', 'Extracting key signals…', 'Analyzing your profile…'];
  var mi = 0;
  var msgInterval = setInterval(function() {
    mi = (mi + 1) % parseMessages.length;
    loaderText.textContent = parseMessages[mi];
  }, 800);

  try {
    var arrayBuffer = await file.arrayBuffer();
    var pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    var allText = '';

    for (var i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i);
      var content = await page.getTextContent();
      var pageText = content.items.map(function(item) { return item.str; }).join(' ');
      allText += pageText + '\n';
    }

    clearInterval(msgInterval);
    state.resumeText = allText;

    if (allText.trim().length < 20) {
      throw new Error('Too little text extracted');
    }

    var analysis = analyzeResumeText(allText);
    state.resumeAnalysis = analysis;
    displayAnalysis(analysis);
    autoFillForm(allText, analysis);
    loader.classList.remove('active');

  } catch (err) {
    clearInterval(msgInterval);
    loader.classList.remove('active');
    var errEl = document.getElementById('uploadError');
    errEl.textContent = 'Could not fully read resume. Please fill details manually.';
    errEl.style.display = 'block';
  }
}

// ===== RESUME ANALYSIS =====
function analyzeResumeText(text) {
  var lower = text.toLowerCase();

  // Detect projects
  var projectKeywords = ['project', 'developed', 'built', 'created', 'designed', 'implemented', 'deployed', 'launched'];
  var projectCount = 0;
  projectKeywords.forEach(function(kw) {
    var matches = lower.match(new RegExp('\\b' + kw + '\\b', 'gi'));
    if (matches) projectCount += matches.length;
  });
  projectCount = Math.min(Math.round(projectCount / 2), 8);

  // Detect skills
  var detectedSkills = [];
  allSkills.forEach(function(skill) {
    if (lower.includes(skill.toLowerCase())) {
      detectedSkills.push(skill);
    }
  });

  // Measurable impact
  var hasNumbers = /\d+%|\d+\s*(users|customers|clients|downloads|revenue|sales|improvement|increase|decrease|reduction)/i.test(text);
  var hasMetrics = /\d+/.test(text);

  // Detect sections
  var foundSections = [];
  sectionHeadings.forEach(function(h) {
    if (lower.includes(h)) foundSections.push(h);
  });

  // Suggest role
  var roleCounts = {};
  Object.keys(roleKeywords).forEach(function(role) {
    var count = 0;
    roleKeywords[role].forEach(function(kw) {
      if (lower.includes(kw)) count++;
    });
    roleCounts[role] = count;
  });
  var suggestedRole = Object.keys(roleCounts).reduce(function(a, b) { return roleCounts[a] > roleCounts[b] ? a : b; });

  // Extract project descriptions
  var projText = '';
  var projMatch = text.match(/project[s]?[\s\S]{0,800}/i);
  if (projMatch) projText = projMatch[0].substring(0, 400);

  return {
    projectCount: projectCount,
    skills: detectedSkills,
    hasImpact: hasNumbers,
    hasMetrics: hasMetrics,
    sections: foundSections,
    suggestedRole: suggestedRole,
    projectText: projText
  };
}

// ===== DISPLAY ANALYSIS =====
function displayAnalysis(a) {
  var card = document.getElementById('resumeAnalysis');
  card.classList.add('visible');

  document.getElementById('anaProjects').textContent = a.projectCount > 0 ? a.projectCount + ' found' : 'None detected';
  document.getElementById('anaProjects').className = 'analysis-value ' + (a.projectCount > 0 ? 'good' : 'bad');

  document.getElementById('anaImpact').textContent = a.hasImpact ? 'Yes — metrics found' : 'No — add numbers & %';
  document.getElementById('anaImpact').className = 'analysis-value ' + (a.hasImpact ? 'good' : 'bad');

  var secCount = a.sections.length;
  document.getElementById('anaSections').textContent = secCount + ' of 6 key sections';
  document.getElementById('anaSections').className = 'analysis-value ' + (secCount >= 4 ? 'good' : secCount >= 2 ? 'warn' : 'bad');

  var skillsEl = document.getElementById('anaSkills');
  skillsEl.innerHTML = '';
  if (a.skills.length === 0) {
    skillsEl.innerHTML = '<span class="analysis-value bad" style="font-size:12px">None detected — add relevant skills</span>';
  } else {
    a.skills.slice(0, 12).forEach(function(s) {
      var tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = s;
      skillsEl.appendChild(tag);
    });
  }
}

// ===== AUTO-FILL =====
function autoFillForm(text, analysis) {
  // Auto-fill project
  if (analysis.projectText.length > 30) {
    var clean = analysis.projectText.replace(/project[s]?\s*/i, '').trim();
    var sentences = clean.split(/[.!\n]/).filter(function(s) { return s.trim().length > 10; });
    var filled = sentences.slice(0, 3).join('. ').trim();
    if (filled.length > 20) {
      document.getElementById('userProject').value = filled;
      document.getElementById('projBadge').style.display = 'inline-flex';
    }
  }

  // Suggest role
  if (analysis.suggestedRole) {
    document.getElementById('userRole').value = analysis.suggestedRole;
    document.getElementById('roleBadge').style.display = 'inline-flex';
  }
}

// ===== MAIN ANALYZE =====
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
  var steps = document.querySelectorAll('.processing-step');
  var textEl = document.getElementById('processingText');
  var msgs = [
    'Scanning CV for role-specific signals…',
    'Evaluating interview response quality…',
    'Analyzing communication patterns…',
    'Computing Placement Score…'
  ];
  var i = 0;
  textEl.textContent = msgs[0];
  steps[0].classList.add('active');

  var interval = setInterval(function() {
    steps[i].classList.remove('active');
    steps[i].classList.add('done');
    steps[i].querySelector('.step-icon').textContent = '✓';
    i++;
    if (i < msgs.length) {
      textEl.style.opacity = '0';
      setTimeout(function() {
        textEl.textContent = msgs[i];
        textEl.style.opacity = '1';
        steps[i].classList.add('active');
      }, 200);
    } else {
      clearInterval(interval);
      setTimeout(function() { calculateAndShow(); }, 400);
    }
  }, 900);
}

// ===== SCORING =====
function calcCV(text, role) {
  var score = 20;
  if (text.length > 50) score += 20;
  var lower = text.toLowerCase();
  if (actionWords.some(function(w) { return lower.includes(w); })) score += 20;
  if (/\d+/.test(text)) score += 20;
  var kw = roleKeywords[role] || [];
  if (kw.some(function(w) { return lower.includes(w); })) score += 20;

  // Bonus from resume analysis
  if (state.resumeAnalysis) {
    var a = state.resumeAnalysis;
    if (a.projectCount >= 2) score += 5;
    if (a.hasImpact) score += 5;
    if (a.sections.length >= 4) score += 5;
    if (a.skills.length >= 5) score += 5;
  }
  return Math.min(score, 100);
}

function calcInterview(text) {
  var score;
  if (text.length < 50) score = 30;
  else if (text.length <= 150) score = 60;
  else score = 80;
  var lower = text.toLowerCase();
  if (structuredWords.some(function(w) { return lower.includes(w); })) score += 10;
  return Math.min(score, 100);
}

function calcComm(text) {
  var sentences = text.split(/[.!?]+/).filter(function(s) { return s.trim().length > 0; });
  var avgLen = sentences.length > 0 ? text.length / sentences.length : text.length;
  var score = 55;
  if (sentences.length >= 3) score += 10;
  if (avgLen > 20 && avgLen < 120) score += 10;
  if (text.length > 100) score += 5;
  var words = text.split(/\s+/).length;
  var unique = new Set(text.toLowerCase().split(/\s+/)).size;
  if (words > 0 && unique / words > 0.6) score += 5;
  return Math.max(40, Math.min(score, 85));
}

function getScoreClass(s) { return s < 50 ? 'score-low' : s <= 65 ? 'score-mid' : s <= 80 ? 'score-good' : 'score-great'; }
function getRingClass(s) { return s < 50 ? 'ring-low' : s <= 65 ? 'ring-mid' : s <= 80 ? 'ring-good' : 'ring-great'; }
function getValClass(s) { return s < 50 ? 'val-low' : s <= 65 ? 'val-mid' : 'val-high'; }
function getBarClass(s) { return s < 50 ? 'fill-low' : s <= 65 ? 'fill-mid' : 'fill-high'; }

function getEmotionalMsg(score) {
  if (score < 50) return { text: 'Students with this score often struggle in placements. You are currently below average compared to similar candidates.', cls: 'msg-low' };
  if (score < 60) return { text: 'You are below the placement-ready benchmark. Focused preparation can close this gap.', cls: 'msg-low' };
  if (score <= 75) return { text: 'You\'re close to being placement ready, but key gaps remain. A structured plan can make the difference.', cls: 'msg-mid' };
  return { text: 'You\'re ahead of most candidates in your category. Fine-tuning will make you stand out further.', cls: 'msg-high' };
}

function getStrengthAndGap(cv, iv, comm) {
  var scores = { 'Projects / CV': cv, 'Interview Skills': iv, 'Communication': comm };
  var maxKey = '', minKey = '', maxVal = -1, minVal = 999;
  for (var k in scores) {
    if (scores[k] > maxVal) { maxVal = scores[k]; maxKey = k; }
    if (scores[k] < minVal) { minVal = scores[k]; minKey = k; }
  }
  return { strength: maxKey, gap: minKey };
}

function getFeedback(cv, iv, comm, role) {
  var fb = [];
  var tips = roleTips[role] || roleTips['IT'];

  if (cv < 60) fb.push({ icon: '📄', text: 'Your CV lacks measurable impact — add numbers like % improvement, users served, or revenue generated. ' + tips.cv });
  else if (cv < 80) fb.push({ icon: '📄', text: 'Your CV shows promise. Strengthen it with more specific outcomes. ' + tips.cv });
  else fb.push({ icon: '✅', text: 'Strong CV with good use of action words and metrics. ' + tips.cv });

  if (iv < 60) fb.push({ icon: '🎤', text: 'Structure your answers using the STAR method (Situation, Task, Action, Result). ' + tips.interview });
  else if (iv < 80) fb.push({ icon: '🎤', text: 'Good structure in your responses. Add more depth with specific examples. ' + tips.interview });
  else fb.push({ icon: '✅', text: 'Well-structured interview answer with clear reasoning. Keep practicing for consistency.' });

  if (comm < 55) fb.push({ icon: '💬', text: 'Your responses need clearer communication and more concise phrasing. Use shorter, varied sentences.' });
  else if (comm < 70) fb.push({ icon: '💬', text: 'Decent communication. Focus on sentence clarity and vocabulary variety to improve further.' });
  else fb.push({ icon: '✅', text: 'Good communication clarity. Minor improvements in conciseness will help.' });

  fb.push({ icon: '🎯', text: tips.general });
  return fb;
}

function calculateAndShow() {
  var cv = calcCV(state.project, state.role);
  var iv = calcInterview(state.answer);
  var comm = calcComm(state.project + ' ' + state.answer);
  var final_score = Math.round(0.4 * cv + 0.3 * iv + 0.3 * comm);

  // Reset processing steps
  document.querySelectorAll('.processing-step').forEach(function(s) {
    s.classList.remove('done', 'active');
    s.querySelector('.step-icon').textContent = '';
  });

  showScreen('scoreScreen');

  document.getElementById('scoreGreeting').textContent = state.name + ', here\'s your score';

  var valEl = document.getElementById('scoreValue');
  valEl.className = 'score-value ' + getScoreClass(final_score);
  var current = 0;
  var step = Math.max(1, Math.floor(final_score / 50));
  var counter = setInterval(function() {
    current += step;
    if (current >= final_score) { current = final_score; clearInterval(counter); }
    valEl.innerHTML = current + '<span>/100</span>';
  }, 25);

  var ring = document.querySelector('.progress-ring');
  ring.className = 'progress-ring ' + getRingClass(final_score);
  setTimeout(function() { ring.style.strokeDashoffset = 440 - (440 * final_score / 100); }, 100);

  var setBar = function(barId, valId, score) {
    document.getElementById(valId).textContent = score + '/100';
    document.getElementById(valId).className = 'score-item-value ' + getValClass(score);
    var bar = document.getElementById(barId);
    bar.className = 'progress-bar-fill ' + getBarClass(score);
    setTimeout(function() { bar.style.width = score + '%'; }, 300);
  };
  setBar('cvBar', 'cvVal', cv);
  setBar('ivBar', 'ivVal', iv);
  setBar('commBar', 'commVal', comm);

  var emo = getEmotionalMsg(final_score);
  var emoEl = document.getElementById('emotionalMsg');
  emoEl.textContent = emo.text;
  emoEl.className = 'emotional-msg ' + emo.cls;

  var sg = getStrengthAndGap(cv, iv, comm);
  document.getElementById('strengthVal').textContent = sg.strength;
  document.getElementById('gapVal').textContent = sg.gap;

  var fb = getFeedback(cv, iv, comm, state.role);
  var container = document.getElementById('feedbackList');
  container.innerHTML = '';
  fb.forEach(function(f) {
    var div = document.createElement('div');
    div.className = 'feedback-item';
    div.innerHTML = '<span class="feedback-icon">' + f.icon + '</span><span>' + f.text + '</span>';
    container.appendChild(div);
  });

  document.getElementById('paywallRole').textContent = state.role + ' preparation roadmap';
}

function goToPaywall() { showScreen('paywallScreen'); }
function unlockPlan() { alert('This is a prototype. Payment integration coming soon!'); }
