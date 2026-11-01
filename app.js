/**
 * ============================================================================
 * AMITY UNIVERSITY AI-GRIEVANCE MANAGEMENT SYSTEM
 * Pure Modular ES6+ Client-Side Application Engine
 * Persistence: localStorage + sessionStorage + Real-Time Cross-Tab Sync
 * ============================================================================
 */

const STORAGE_KEYS = {
  GRIEVANCES: 'amity_grievances_v1',
  ACCOUNTS: 'amity_bound_accounts_v1',
  SESSION: 'amity_active_session_v1',
  LAST_RESOLVED_BANNER: 'amity_last_resolved_banner_v1'
};

// Bilingual Suggested Keyword Chips Dictionary
const CATEGORY_KEYWORDS = {
  'Fire & Safety': [
    'आग (Aag / Fire)',
    'धुआं (Smoke)',
    'सिलेंडर ब्लास्ट (Cylinder Blast)',
    'Spark',
    'Short Circuit',
    'Gas Leakage'
  ],
  'Fight & Security': [
    'चाकू (Chaku / Knife)',
    'मारपीट (Marpit / Assault)',
    'खून (Blood)',
    'धमकी (Threat)',
    'हथियार (Weapon)'
  ],
  'Electricity': [
    'करंट (Current Shock)',
    'खुला तार (Open Live Wire)',
    'Sparking',
    'MCB Blast',
    'High Voltage'
  ],
  'Water Supply': [
    'पाइप फटा (Burst Pipe)',
    'पानी नहीं आ रहा (No Water)',
    'Water Leakage',
    'Dirty Water'
  ],
  'Exam & Academics': [
    'Admit Card Issue',
    'Attendance Shortage',
    'Results Query',
    'Examination Hall Disturbance',
    'Backlog Query'
  ],
  'Mess & Canteen': [
    'कीड़ा (Insect / Keeda)',
    'खराब खाना (Spoiled Food)',
    'बासी (Stale)',
    'Foul Smell'
  ],
  'Ragging & Bullying': [
    'रैगिंग (Ragging)',
    'Hostel Bullying',
    'मानसिक प्रताड़ना (Harassment)',
    'Forced Task'
  ],
  'Hostel Facility': [
    'Broken Door Lock',
    'Washroom Hygiene',
    'Wi-Fi Outage in Wing',
    'Mattress / Furniture Issue'
  ],
  'Library & IT': [
    'Lab System Failure',
    'Campus Wi-Fi Down',
    'Book Issuing Error',
    'Projector Not Working'
  ],
  'Other': [
    'Medical First Aid Needed',
    'Lost ID Card / Document',
    'Transport Bus Delay',
    'General Campus Query'
  ]
};

// Exact Campus Location Zones
const CAMPUS_ZONES = [
  'boys hostel',
  'girls hostel',
  'College building',
  'auditorium',
  'atrium',
  'Gym',
  'Library',
  'Seminar',
  'ground',
  'tennis court',
  'badmintons court',
  'gate no. 1',
  'gate no. 2',
  'medical room'
];

// Exact Academic Courses
const ACADEMIC_COURSES = [
  'BCA',
  'BBA',
  'Biotech',
  'BA LLB',
  'LLB',
  'B.Tech',
  'MCA',
  'BJMC',
  'MBA',
  'MA',
  'BA',
  'Master of Biotech'
];

// Admin Filter Tabs Definition
const ADMIN_FILTER_TABS = [
  { id: 'ALL_ACTIVE', label: 'All Active (Ranked)' },
  { id: 'SOS_ONLY', label: '🚨 SOS Only' },
  { id: 'Fire & Safety', label: 'Fire & Safety' },
  { id: 'Fight & Security', label: 'Fight & Security' },
  { id: 'Electricity', label: 'Electricity' },
  { id: 'Water Supply', label: 'Water Supply' },
  { id: 'Exam & Academics', label: 'Exam & Academics' },
  { id: 'Mess & Canteen', label: 'Mess & Canteen' },
  { id: 'Hostel Facility', label: 'Hostel Facility' },
  { id: 'Library & IT', label: 'Library & IT' },
  { id: 'Ragging & Bullying', label: 'Ragging & Bullying' },
  { id: 'Other', label: 'Other (Pure NLP)' },
  { id: 'RESOLVED_ARCHIVE', label: '✅ Resolved Archive' }
];

// Application Runtime State
const appState = {
  currentScreen: 'landing', // 'landing' | 'auth' | 'student' | 'admin'
  authMode: 'student',      // 'student' | 'admin'
  session: null,            // { role: 'student'|'admin', enrollmentId?, name?, username? }
  adminFilter: 'ALL_ACTIVE',
  adminSearchQuery: '',
  stopwatchIntervalId: null,
  syncChannel: null
};

/* ==========================================================================
   1. AI URGENCY CLASSIFIER (NLP HEURISTIC ENGINE)
   ========================================================================== */
export function evaluateGrievanceUrgency(category, descriptionText) {
  const text = String(descriptionText || '').toLowerCase();
  const cat = String(category || '').trim();

  // Immediate SOS Keywords (10/10, Target SLA: "0-15 mins")
  const sosKeywords = [
    'chaku', 'चाकू', 'knife',
    'cylinder', 'सिलेंडर', 'blast', 'ब्लास्ट',
    'aag', 'आग', 'fire',
    'live wire', 'खुला तार',
    'current shock', 'करंट',
    'blood', 'खून',
    'unconscious', 'बेहोश',
    'gas leakage', 'short circuit', 'धुआं', 'smoke'
  ];

  // High Severity Keywords (8-9/10, Target SLA: "1-2 hrs")
  const highKeywords = [
    'fight', 'jhagda', 'झगड़ा',
    'marpit', 'मारपीट', 'maar', 'assault',
    'ragging', 'रैगिंग', 'bullying',
    'threat', 'धमकी',
    'spark', 'sparking',
    'weapon', 'हथियार',
    'मानसिक प्रताड़ना', 'harassment', 'forced task',
    'mcb blast', 'high voltage'
  ];

  // Medium Urgency Keywords (5-6/10, Target SLA: "3-6 hrs")
  const mediumKeywords = [
    'leakage', 'burst pipe', 'पाइप फटा',
    'keeda', 'कीड़ा', 'insect',
    'spoiled food', 'खराब खाना', 'बासी', 'stale', 'foul smell',
    'no water', 'पानी नहीं आ रहा', 'dirty water',
    'exam issue', 'admit card', 'attendance shortage',
    'examination hall disturbance', 'results query', 'backlog'
  ];

  const matchedTags = [];

  // Rule 1: Fire & Safety automatically locks to 10/10 SOS
  if (cat === 'Fire & Safety') {
    matchedTags.push('Fire & Safety Lock');
  }

  for (const kw of sosKeywords) {
    if (text.includes(kw.toLowerCase())) {
      matchedTags.push(kw);
    }
  }

  if (cat === 'Fire & Safety' || matchedTags.length > 0) {
    return {
      score: 10,
      tier: 'CRITICAL SOS',
      sla: '0-15 mins',
      matchedKeywords: matchedTags.slice(0, 4)
    };
  }

  // Rule 2: Check High Severity (Score 8-9/10, Target SLA: "1-2 hrs")
  const highMatches = [];
  for (const kw of highKeywords) {
    if (text.includes(kw.toLowerCase())) {
      highMatches.push(kw);
    }
  }

  if (highMatches.length > 0 || cat === 'Fight & Security' || cat === 'Ragging & Bullying') {
    const score = (highMatches.length >= 2 || cat === 'Fight & Security' || cat === 'Ragging & Bullying') ? 9 : 8;
    return {
      score,
      tier: 'HIGH',
      sla: '1-2 hrs',
      matchedKeywords: highMatches.length > 0 ? highMatches.slice(0, 4) : [cat]
    };
  }

  // Rule 3: Check Medium Urgency (Score 5-6/10, Target SLA: "3-6 hrs")
  const mediumMatches = [];
  for (const kw of mediumKeywords) {
    if (text.includes(kw.toLowerCase())) {
      mediumMatches.push(kw);
    }
  }

  if (
    mediumMatches.length > 0 ||
    cat === 'Electricity' ||
    cat === 'Water Supply' ||
    cat === 'Mess & Canteen' ||
    cat === 'Exam & Academics'
  ) {
    const score = mediumMatches.length >= 2 ? 6 : 5;
    return {
      score,
      tier: 'MEDIUM',
      sla: '3-6 hrs',
      matchedKeywords: mediumMatches.length > 0 ? mediumMatches.slice(0, 4) : [cat]
    };
  }

  // Rule 4: Standard / Low Urgency (Score 2-4/10, Target SLA: "12-24 hrs")
  const defaultScore = text.length > 80 ? 4 : 3;
  return {
    score: defaultScore,
    tier: 'STANDARD',
    sla: '12-24 hrs',
    matchedKeywords: ['Routine NLP Triage']
  };
}

/* ==========================================================================
   2. STORAGE & PERSISTENCE LAYER
   ========================================================================== */
function getGrievances() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GRIEVANCES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGrievances(list) {
  localStorage.setItem(STORAGE_KEYS.GRIEVANCES, JSON.stringify(list));
  notifyCrossTabSync('GRIEVANCES_UPDATED');
}

function getBoundAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveBoundAccounts(accountsObj) {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accountsObj));
}

function getActiveSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setActiveSession(sessionObj) {
  if (!sessionObj) {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    appState.session = null;
  } else {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionObj));
    appState.session = sessionObj;
  }
}

function getLastResolvedBannerMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_RESOLVED_BANNER);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLastResolvedBannerForStudent(enrollmentId, grievanceObj) {
  const map = getLastResolvedBannerMap();
  map[enrollmentId] = {
    id: grievanceObj.id,
    category: grievanceObj.category,
    sla: grievanceObj.sla,
    lodgedAt: grievanceObj.lodgedAt,
    resolvedAt: grievanceObj.resolvedAt,
    durationText: formatResolutionDuration(grievanceObj.lodgedAt, grievanceObj.resolvedAt)
  };
  localStorage.setItem(STORAGE_KEYS.LAST_RESOLVED_BANNER, JSON.stringify(map));
}

/* ==========================================================================
   3. TIME FORMATTING & STOPWATCH ENGINE
   ========================================================================== */
export function formatStopwatchHMS(elapsedMs) {
  const safeMs = Math.max(0, Number(elapsedMs) || 0);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function formatResolutionDuration(lodgedAt, resolvedAt) {
  const elapsedMs = Math.max(1000, (Number(resolvedAt) || Date.now()) - (Number(lodgedAt) || Date.now()));
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins} mins ${secs} secs`;
}

function formatReadableTimestamp(ts) {
  try {
    const d = new Date(Number(ts));
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return 'Just now';
  }
}

function startGlobalStopwatchTicker() {
  if (appState.stopwatchIntervalId) {
    clearInterval(appState.stopwatchIntervalId);
  }
  appState.stopwatchIntervalId = setInterval(() => {
    tickAllLiveClocks();
  }, 250);
}

function tickAllLiveClocks() {
  const now = Date.now();
  const clockNodes = document.querySelectorAll('[data-live-lodged-at]');
  clockNodes.forEach((node) => {
    const lodgedAt = Number(node.getAttribute('data-live-lodged-at'));
    if (lodgedAt > 0) {
      node.textContent = formatStopwatchHMS(now - lodgedAt);
    }
  });
}

/* ==========================================================================
   4. VALIDATION ENGINE (ENROLLMENT ID & DOB REGEX)
   ========================================================================== */
export function validateStudentEnrollmentId(enrollmentId) {
  return /^A\d{12}$/.test(String(enrollmentId || '').trim());
}

export function validateStudentPasswordDOB(dobPassword) {
  return /^\d{2}-\d{2}-\d{4}$/.test(String(dobPassword || '').trim());
}

/* ==========================================================================
   5. NAVIGATION & SCREEN ROUTING
   ========================================================================== */
function switchScreen(screenName) {
  appState.currentScreen = screenName;
  const screens = {
    landing: document.getElementById('screen-landing'),
    auth: document.getElementById('screen-auth'),
    student: document.getElementById('screen-student'),
    admin: document.getElementById('screen-admin')
  };

  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    if (key === screenName) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  if (screenName === 'student') {
    renderStudentPortal();
  } else if (screenName === 'admin') {
    renderAdminPortal();
  }
}

function openAuthScreen(roleMode) {
  appState.authMode = roleMode; // 'student' | 'admin'
  const indicatorEl = document.getElementById('auth-role-indicator');
  const titleEl = document.getElementById('auth-title');
  const subtitleEl = document.getElementById('auth-subtitle');
  const studentFields = document.getElementById('auth-student-fields');
  const adminFields = document.getElementById('auth-admin-fields');
  const submitBtn = document.getElementById('auth-submit-btn');
  const infoBox = document.getElementById('auth-info-box');
  const errorBox = document.getElementById('auth-error-box');

  if (errorBox) {
    errorBox.classList.remove('visible');
    errorBox.textContent = '';
  }

  if (roleMode === 'student') {
    indicatorEl.textContent = 'STUDENT PORTAL ACCESS';
    indicatorEl.className = 'auth-role-indicator';
    titleEl.textContent = 'Student Identity Verification';
    subtitleEl.textContent = 'Sign in with your 13-character Amity Enrollment ID and Date of Birth.';
    studentFields.style.display = 'flex';
    adminFields.style.display = 'none';
    submitBtn.textContent = 'Access Student Grievance Desk →';
    submitBtn.className = 'btn-primary';
    infoBox.innerHTML = '<strong>Dynamic Account Binding:</strong> Your Enrollment ID (<code class="mono-num">^A\\d{12}$</code>) binds permanently to your Password/DOB (<code class="mono-num">DD-MM-YYYY</code>) upon first login.';
  } else {
    indicatorEl.textContent = 'PROCTOR & WARDEN DESK';
    indicatorEl.className = 'auth-role-indicator auth-role-indicator--admin';
    titleEl.textContent = 'Admin & Authority Command Login';
    subtitleEl.textContent = 'Authorized personnel access for AI priority triage and emergency dispatch.';
    studentFields.style.display = 'none';
    adminFields.style.display = 'flex';
    submitBtn.textContent = 'Launch Command Center →';
    submitBtn.className = 'btn-primary btn-primary--admin';
    infoBox.innerHTML = '<strong>Authority Credentials:</strong> Use verified Proctor/Warden username and security key, or use the demo autofill control below.';
  }

  switchScreen('auth');
}

function showAuthError(message) {
  const errorBox = document.getElementById('auth-error-box');
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.classList.add('visible');
}

function clearAuthError() {
  const errorBox = document.getElementById('auth-error-box');
  if (!errorBox) return;
  errorBox.textContent = '';
  errorBox.classList.remove('visible');
}

function handleAutofillCredentials() {
  clearAuthError();
  if (appState.authMode === 'student') {
    const enrollInput = document.getElementById('student-login-id');
    const dobInput = document.getElementById('student-login-dob');
    const nameInput = document.getElementById('student-login-name');

    const demoId = 'A368302748394';
    const accounts = getBoundAccounts();
    // If already bound to a password in localStorage, respect or default to 06-04-1800
    enrollInput.value = demoId;
    dobInput.value = '06-04-1800';
    if (nameInput && !nameInput.value.trim()) {
      nameInput.value = accounts[demoId]?.name || 'Aarav Sharma';
    }
    showToast('⚡ Demo Student credentials populated', 'cyan');
  } else {
    const userInput = document.getElementById('admin-login-user');
    const passInput = document.getElementById('admin-login-pass');
    userInput.value = 'adminAUJ';
    passInput.value = 'Amity@123';
    showToast('⚡ Demo Admin credentials populated', 'cyan');
  }
}

function handleAuthSubmit(event) {
  event.preventDefault();
  clearAuthError();

  if (appState.authMode === 'student') {
    const enrollmentId = document.getElementById('student-login-id').value.trim();
    const dobPassword = document.getElementById('student-login-dob').value.trim();
    const enteredName = document.getElementById('student-login-name').value.trim();

    if (!validateStudentEnrollmentId(enrollmentId)) {
      showAuthError('❌ Invalid Enrollment ID! Must start with capital "A" followed by exactly 12 digits (e.g., A368302748394).');
      return;
    }

    if (!validateStudentPasswordDOB(dobPassword)) {
      showAuthError('❌ Invalid Password / DOB format! Use strict DD-MM-YYYY format (e.g., 06-04-1800).');
      return;
    }

    // Check Persistent Account Binding in localStorage
    const boundAccounts = getBoundAccounts();
    const existingAccount = boundAccounts[enrollmentId];

    if (existingAccount) {
      if (existingAccount.password !== dobPassword) {
        showAuthError('❌ Incorrect Password / DOB for this Enrollment ID!');
        return;
      }
      // Valid existing account login
      const resolvedName = enteredName || existingAccount.name || `Student ${enrollmentId.slice(-4)}`;
      existingAccount.name = resolvedName;
      saveBoundAccounts(boundAccounts);

      setActiveSession({
        role: 'student',
        enrollmentId,
        name: resolvedName
      });
      showToast(`Welcome back, ${resolvedName}`, 'emerald');
      switchScreen('student');
    } else {
      // First-time login: Bind Enrollment ID + Password in localStorage
      const resolvedName = enteredName || 'Aarav Sharma';
      boundAccounts[enrollmentId] = {
        password: dobPassword,
        name: resolvedName,
        boundAt: Date.now()
      };
      saveBoundAccounts(boundAccounts);

      setActiveSession({
        role: 'student',
        enrollmentId,
        name: resolvedName
      });
      showToast(`Account bound & verified for ${enrollmentId}`, 'emerald');
      switchScreen('student');
    }
  } else {
    // Admin Login Validation
    const username = document.getElementById('admin-login-user').value.trim();
    const password = document.getElementById('admin-login-pass').value;

    if (username === 'adminAUJ' && password === 'Amity@123') {
      setActiveSession({
        role: 'admin',
        username: 'adminAUJ',
        name: 'Chief Warden & Proctor Desk'
      });
      showToast('🛡️ Authority Command Center Unlocked', 'emerald');
      switchScreen('admin');
    } else {
      showAuthError('❌ Invalid Admin Credentials! Authorized Username and Password required.');
    }
  }
}

function handleLogout() {
  setActiveSession(null);
  showToast('Logged out safely', 'cyan');
  switchScreen('landing');
}

/* ==========================================================================
   6. SCREEN 3: STUDENT PORTAL LOGIC & DYNAMIC FORM ROUTING
   ========================================================================== */
function populateStaticDropdowns() {
  // Course Selection Dropdown
  const courseSelect = document.getElementById('grievance-course');
  if (courseSelect) {
    courseSelect.innerHTML = ACADEMIC_COURSES.map(
      (course) => `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`
    ).join('');
  }

  // Campus Location Zones Dropdown
  const zoneSelect = document.getElementById('grievance-campus-zone');
  if (zoneSelect) {
    zoneSelect.innerHTML = CAMPUS_ZONES.map(
      (zone) => `<option value="${escapeHtml(zone)}">${escapeHtml(zone)}</option>`
    ).join('');
  }
}

function handleHostelResidencyChange() {
  const hostelSelect = document.getElementById('grievance-hostel-residing');
  const hostelFieldsBlock = document.getElementById('dynamic-hostel-fields');
  if (!hostelSelect || !hostelFieldsBlock) return;

  if (hostelSelect.value === 'Yes') {
    hostelFieldsBlock.classList.add('visible');
  } else {
    hostelFieldsBlock.classList.remove('visible');
  }
}

function handleCategoryChange() {
  const categorySelect = document.getElementById('grievance-category');
  if (!categorySelect) return;
  const selectedCategory = categorySelect.value;

  const academicBlock = document.getElementById('dynamic-academic-fields');
  const canteenBlock = document.getElementById('dynamic-canteen-fields');
  const otherNlpBlock = document.getElementById('dynamic-other-nlp-fields');
  const standardLocationBlock = document.getElementById('dynamic-standard-location-fields');

  academicBlock.classList.remove('visible');
  canteenBlock.classList.remove('visible');
  otherNlpBlock.classList.remove('visible');
  standardLocationBlock.classList.remove('visible');

  if (selectedCategory === 'Exam & Academics') {
    academicBlock.classList.add('visible');
  } else if (selectedCategory === 'Mess & Canteen') {
    canteenBlock.classList.add('visible');
  } else if (selectedCategory === 'Other') {
    otherNlpBlock.classList.add('visible');
  } else {
    standardLocationBlock.classList.add('visible');
  }

  renderSuggestedKeywordChips(selectedCategory);
  updateStudentSlaPreview();
}

function renderSuggestedKeywordChips(category) {
  const container = document.getElementById('keyword-chips-container');
  if (!container) return;

  const chips = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS['Other'] || [];
  container.innerHTML = chips
    .map(
      (chipText) =>
        `<button type="button" class="keyword-chip-btn" data-chip="${escapeHtml(chipText)}">+ ${escapeHtml(chipText)}</button>`
    )
    .join('');

  container.querySelectorAll('.keyword-chip-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const term = btn.getAttribute('data-chip');
      const textarea = document.getElementById('grievance-description');
      if (!textarea || !term) return;

      const currentVal = textarea.value.trim();
      textarea.value = currentVal ? `${currentVal}, ${term}` : term;
      textarea.focus();
      updateStudentSlaPreview();
    });
  });
}

function updateStudentSlaPreview() {
  const category = document.getElementById('grievance-category')?.value || 'Fire & Safety';
  const description = document.getElementById('grievance-description')?.value || '';
  const slaPreviewEl = document.getElementById('student-sla-estimate-preview');
  if (!slaPreviewEl) return;

  const evaluation = evaluateGrievanceUrgency(category, description);
  slaPreviewEl.textContent = `Expected SLA: ${evaluation.sla}`;
}

function buildLocationSummaryFromForm(category) {
  if (category === 'Exam & Academics') {
    const course = document.getElementById('grievance-course')?.value || 'B.Tech';
    const classSection = document.getElementById('grievance-class-section')?.value.trim() || 'Semester 1 / Section A';
    return {
      courseInfo: `${course} · ${classSection}`,
      locationSummary: `Academic Block (${course} - ${classSection})`
    };
  }

  if (category === 'Mess & Canteen') {
    const outlet = document.getElementById('grievance-canteen-outlet')?.value || 'Wonders Food';
    const lockedFloor = 'Ground Floor Food Court (No additional location needed)';
    return {
      courseInfo: null,
      locationSummary: `${outlet} · ${lockedFloor}`
    };
  }

  if (category === 'Other') {
    return {
      courseInfo: null,
      locationSummary: 'Pure NLP Textual Context Mode (Campus-Wide)'
    };
  }

  const zone = document.getElementById('grievance-campus-zone')?.value || 'College building';
  const floor = document.getElementById('grievance-floor')?.value || 'Ground Floor';
  const spot = document.getElementById('grievance-spot-specifics')?.value.trim();
  return {
    courseInfo: null,
    locationSummary: spot ? `${zone} · ${floor} · Near ${spot}` : `${zone} · ${floor}`
  };
}

function handleGrievanceFormSubmit(event) {
  event.preventDefault();
  if (!appState.session || appState.session.role !== 'student') return;

  const studentNameInput = document.getElementById('grievance-student-name');
  const studentName = studentNameInput?.value.trim() || appState.session.name || 'Amity Student';
  const enrollmentId = appState.session.enrollmentId;

  // Persist updated student name in session & bound account
  appState.session.name = studentName;
  setActiveSession(appState.session);
  const accounts = getBoundAccounts();
  if (accounts[enrollmentId]) {
    accounts[enrollmentId].name = studentName;
    saveBoundAccounts(accounts);
  }

  const residingHostel = document.getElementById('grievance-hostel-residing')?.value || 'No';
  let hostelDetails = null;
  if (residingHostel === 'Yes') {
    const wing = document.getElementById('grievance-hostel-wing')?.value || 'Boys Hostel';
    const roomNo = document.getElementById('grievance-hostel-room')?.value.trim() || 'Room Unspecified';
    hostelDetails = `${wing} · Room ${roomNo}`;
  }

  const category = document.getElementById('grievance-category')?.value || 'Fire & Safety';
  const description = document.getElementById('grievance-description')?.value.trim() || '';

  if (!description) {
    showToast('Please enter a description of the incident or click a keyword tag.', 'crimson');
    document.getElementById('grievance-description')?.focus();
    return;
  }

  if (category === 'Exam & Academics') {
    const classSec = document.getElementById('grievance-class-section')?.value.trim();
    if (!classSec) {
      showToast('Please specify your Class / Section / Semester.', 'crimson');
      document.getElementById('grievance-class-section')?.focus();
      return;
    }
  }

  const { courseInfo, locationSummary } = buildLocationSummaryFromForm(category);
  const aiResult = evaluateGrievanceUrgency(category, description);
  const now = Date.now();

  const newGrievance = {
    id: `GRV-${now.toString().slice(-6)}-${Math.floor(100 + Math.random() * 899)}`,
    enrollmentId,
    studentName,
    residingHostel,
    hostelDetails,
    category,
    courseInfo,
    locationSummary,
    description,
    priorityScore: aiResult.score,
    priorityTier: aiResult.tier,
    sla: aiResult.sla,
    matchedKeywords: aiResult.matchedKeywords,
    status: 'PENDING',
    lodgedAt: now,
    resolvedAt: null
  };

  const allGrievances = getGrievances();
  allGrievances.unshift(newGrievance);
  saveGrievances(allGrievances);

  // Reset description field while keeping student identity intact
  document.getElementById('grievance-description').value = '';
  const spotInput = document.getElementById('grievance-spot-specifics');
  if (spotInput) spotInput.value = '';

  updateStudentSlaPreview();
  renderStudentPortal();
  showToast(`Grievance lodged! Target SLA: ${newGrievance.sla}`, 'emerald');
}

function renderStudentPortal() {
  if (!appState.session || appState.session.role !== 'student') return;

  const { enrollmentId, name } = appState.session;

  // Header Identity
  const headerNameEl = document.getElementById('student-header-name');
  const headerIdEl = document.getElementById('student-header-id');
  if (headerNameEl) headerNameEl.textContent = name;
  if (headerIdEl) headerIdEl.textContent = enrollmentId;

  // Form Identity Fields
  const nameInput = document.getElementById('grievance-student-name');
  const idInput = document.getElementById('grievance-enrollment-id');
  if (nameInput && document.activeElement !== nameInput) {
    nameInput.value = name;
  }
  if (idInput) {
    idInput.value = enrollmentId;
  }

  // Filter complaints strictly belonging to this logged-in student
  const studentComplaints = getGrievances().filter(
    (item) => item.enrollmentId === enrollmentId
  );

  renderStudentPipelineBanner(enrollmentId, studentComplaints);
  renderStudentDossierList(studentComplaints);
  tickAllLiveClocks();
}

function renderStudentPipelineBanner(enrollmentId, studentComplaints) {
  const bannerEl = document.getElementById('student-pipeline-banner');
  const statusLabelEl = document.getElementById('pipeline-status-label');
  const metaEl = document.getElementById('pipeline-meta-info');
  const clockValueEl = document.getElementById('pipeline-clock-value');
  const clockCaptionEl = document.getElementById('pipeline-clock-caption');

  if (!bannerEl || !statusLabelEl || !metaEl || !clockValueEl || !clockCaptionEl) return;

  // Find active pending complaint (most recent pending)
  const activePending = studentComplaints.find((c) => c.status === 'PENDING');

  if (activePending) {
    bannerEl.classList.add('visible');
    bannerEl.classList.remove('resolved-state');
    statusLabelEl.textContent = 'ACTIVE IN-RESOLUTION PIPELINE (PENDING ⏳)';
    metaEl.innerHTML = `
      <span><strong>Category:</strong> ${escapeHtml(activePending.category)}</span>
      <span class="meta-sep">·</span>
      <span><strong>Expected SLA:</strong> ${escapeHtml(activePending.sla)}</span>
      <span class="meta-sep">·</span>
      <span><strong>Location:</strong> ${escapeHtml(activePending.locationSummary)}</span>
    `;
    clockValueEl.setAttribute('data-live-lodged-at', String(activePending.lodgedAt));
    clockValueEl.textContent = formatStopwatchHMS(Date.now() - activePending.lodgedAt);
    clockCaptionEl.textContent = 'Live Resolution Stopwatch (HH:MM:SS)';
    return;
  }

  // If no pending complaint, check if there is a resolved complaint to display in RESOLVED state
  const latestResolved = studentComplaints.find((c) => c.status === 'RESOLVED');
  const lastBannerMap = getLastResolvedBannerMap();
  const savedResolved = lastBannerMap[enrollmentId];

  const resolvedTarget = latestResolved || savedResolved;
  if (resolvedTarget && resolvedTarget.resolvedAt) {
    const durationStr = formatResolutionDuration(resolvedTarget.lodgedAt, resolvedTarget.resolvedAt);
    bannerEl.classList.add('visible', 'resolved-state');
    statusLabelEl.textContent = 'RESOLVED ✅';
    metaEl.innerHTML = `
      <span><strong>Category:</strong> ${escapeHtml(resolvedTarget.category)}</span>
      <span class="meta-sep">·</span>
      <span><strong>Expected SLA:</strong> ${escapeHtml(resolvedTarget.sla)}</span>
      <span class="meta-sep">·</span>
      <span><strong>Outcome:</strong> Solved in ${escapeHtml(durationStr)}</span>
    `;
    clockValueEl.removeAttribute('data-live-lodged-at');
    clockValueEl.textContent = `Solved in ${durationStr}`;
    clockCaptionEl.textContent = 'Total Resolution Time Recorded';
  } else {
    bannerEl.classList.remove('visible', 'resolved-state');
    clockValueEl.removeAttribute('data-live-lodged-at');
  }
}

function renderStudentDossierList(studentComplaints) {
  const listContainer = document.getElementById('student-dossier-list');
  const countEl = document.getElementById('student-dossier-count');
  if (!listContainer) return;

  if (countEl) {
    countEl.textContent = `${studentComplaints.length} ${studentComplaints.length === 1 ? 'Record' : 'Records'}`;
  }

  if (studentComplaints.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state-box">
        <strong>No Grievances Lodged Yet</strong>
        <span>Submit a campus complaint on the left to start your live SLA resolution timer.</span>
      </div>
    `;
    return;
  }

  // CRITICAL SECURITY RULE: Internal numeric 1-10 severity score is NEVER rendered in Student View
  listContainer.innerHTML = studentComplaints
    .map((item) => {
      const isPending = item.status === 'PENDING';
      const durationStr = !isPending
        ? formatResolutionDuration(item.lodgedAt, item.resolvedAt)
        : '';

      return `
        <article class="dossier-card ${isPending ? 'dossier-card--pending' : 'dossier-card--resolved'}">
          <div class="dossier-card__top">
            <div>
              <h4 class="dossier-card__category">${escapeHtml(item.category)}</h4>
              <div class="dossier-card__meta-line">
                <span class="mono-num">${escapeHtml(item.id)}</span>
                <span>·</span>
                <span>${escapeHtml(formatReadableTimestamp(item.lodgedAt))}</span>
              </div>
            </div>
            <span class="dossier-card__status-text ${isPending ? 'dossier-card__status-text--pending' : 'dossier-card__status-text--resolved'}">
              ${isPending ? 'Active ⏳' : 'Resolved ✅'}
            </span>
          </div>

          <div class="dossier-card__meta-line">
            <span><strong>Location:</strong> ${escapeHtml(item.locationSummary)}</span>
            ${item.courseInfo ? `<span>·</span><span><strong>Course:</strong> ${escapeHtml(item.courseInfo)}</span>` : ''}
            ${item.hostelDetails ? `<span>·</span><span><strong>Hostel:</strong> ${escapeHtml(item.hostelDetails)}</span>` : ''}
          </div>

          <p class="dossier-card__desc">${escapeHtml(item.description)}</p>

          <div class="dossier-card__timer-bar">
            <span>Expected SLA: <strong class="mono-num">${escapeHtml(item.sla)}</strong></span>
            ${
              isPending
                ? `<span>Elapsed: <strong class="dossier-live-clock" data-live-lodged-at="${item.lodgedAt}">${formatStopwatchHMS(Date.now() - item.lodgedAt)}</strong></span>`
                : `<span class="dossier-resolved-duration">Resolved in ${escapeHtml(durationStr)} · Solved in ${escapeHtml(durationStr)}</span>`
            }
          </div>
        </article>
      `;
    })
    .join('');
}

/* ==========================================================================
   7. SCREEN 4: ADMIN & WARDEN COMMAND CENTER
   ========================================================================== */
function handleResolveGrievance(grievanceId) {
  const all = getGrievances();
  const idx = all.findIndex((g) => g.id === grievanceId);
  if (idx === -1) return;

  const now = Date.now();
  all[idx].status = 'RESOLVED';
  all[idx].resolvedAt = now;

  // Save resolved banner snapshot for the student
  saveLastResolvedBannerForStudent(all[idx].enrollmentId, all[idx]);
  saveGrievances(all);

  const durationText = formatResolutionDuration(all[idx].lodgedAt, now);
  showToast(`✅ Incident ${grievanceId} Resolved in ${durationText}`, 'emerald');
  renderAdminPortal();
}

function getTabFilteredGrievances(allGrievances, tabId, searchQuery) {
  const q = String(searchQuery || '').trim().toLowerCase();

  let list = allGrievances.filter((item) => {
    if (tabId === 'RESOLVED_ARCHIVE') {
      return item.status === 'RESOLVED';
    }
    // All other tabs show active PENDING cases
    if (item.status !== 'PENDING') return false;

    if (tabId === 'ALL_ACTIVE') return true;
    if (tabId === 'SOS_ONLY') return Number(item.priorityScore) === 10;
    return item.category === tabId;
  });

  if (q) {
    list = list.filter((item) => {
      const haystack = [
        item.id,
        item.studentName,
        item.enrollmentId,
        item.category,
        item.locationSummary,
        item.courseInfo,
        item.hostelDetails,
        item.description
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  // Strictly sort by Priority Score descending (10 to 1), then newest first
  list.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return b.lodgedAt - a.lodgedAt;
  });

  return list;
}

function computeTabCount(allGrievances, tabId) {
  if (tabId === 'RESOLVED_ARCHIVE') {
    return allGrievances.filter((g) => g.status === 'RESOLVED').length;
  }
  const active = allGrievances.filter((g) => g.status === 'PENDING');
  if (tabId === 'ALL_ACTIVE') return active.length;
  if (tabId === 'SOS_ONLY') return active.filter((g) => Number(g.priorityScore) === 10).length;
  return active.filter((g) => g.category === tabId).length;
}

function renderAdminPortal() {
  if (!appState.session || appState.session.role !== 'admin') return;

  const allGrievances = getGrievances();
  const activePending = allGrievances.filter((g) => g.status === 'PENDING');
  const sosActive = activePending.filter((g) => Number(g.priorityScore) === 10);
  const highActive = activePending.filter((g) => Number(g.priorityScore) >= 7 && Number(g.priorityScore) <= 9);
  const resolvedList = allGrievances.filter((g) => g.status === 'RESOLVED');

  // 1. Update Analytics Counter Bar
  setText('stat-total-count', allGrievances.length);
  setText('stat-sos-count', sosActive.length);
  setText('stat-high-count', highActive.length);
  setText('stat-pending-count', activePending.length);
  setText('stat-resolved-count', resolvedList.length);

  // 2. Render Prominent Pulsing Red SOS Alert Banner if ANY active complaint has Score == 10/10
  const sosBanner = document.getElementById('admin-sos-banner');
  const sosGrid = document.getElementById('admin-sos-dispatch-grid');
  const sosCountHeading = document.getElementById('admin-sos-banner-count');

  if (sosBanner && sosGrid) {
    if (sosActive.length > 0) {
      sosBanner.classList.add('visible');
      if (sosCountHeading) {
        sosCountHeading.textContent = `🚨 ${sosActive.length} ACTIVE CRITICAL SOS ${sosActive.length === 1 ? 'EMERGENCY' : 'EMERGENCIES'} (10/10 SCORE — IMMEDIATE DISPATCH REQUIRED)`;
      }
      sosGrid.innerHTML = sosActive
        .map(
          (sos) => `
          <div class="sos-dispatch-card">
            <div class="sos-dispatch-card__top">
              <span class="sos-dispatch-card__score">[10/10 CRITICAL SOS] · ${escapeHtml(sos.category)}</span>
              <span class="mono-num" style="font-size: 0.78rem; color: #34d399;" data-live-lodged-at="${sos.lodgedAt}">
                ${formatStopwatchHMS(Date.now() - sos.lodgedAt)}
              </span>
            </div>
            <div style="font-size: 0.9rem; font-weight: 700; color: #ffffff;">
              📍 ${escapeHtml(sos.locationSummary)}
              ${sos.hostelDetails ? ` (${escapeHtml(sos.hostelDetails)})` : ''}
            </div>
            <div style="font-size: 0.82rem; color: #fecaca;">
              ${escapeHtml(sos.studentName)} · <span class="mono-num">${escapeHtml(sos.enrollmentId)}</span>
            </div>
            <div style="font-size: 0.84rem; color: #f8fafc;">
              "${escapeHtml(sos.description)}"
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
              <button type="button" class="btn-resolve" data-resolve-id="${escapeHtml(sos.id)}">
                Mark as Resolved ✓
              </button>
            </div>
          </div>
        `
        )
        .join('');
    } else {
      sosBanner.classList.remove('visible');
      sosGrid.innerHTML = '';
    }
  }

  // 3. Render Category Filter Tabs with Dynamic Counts
  const tabsContainer = document.getElementById('admin-filter-tabs');
  if (tabsContainer) {
    tabsContainer.innerHTML = ADMIN_FILTER_TABS.map((tab) => {
      const count = computeTabCount(allGrievances, tab.id);
      const isActive = appState.adminFilter === tab.id;
      const sosClass = tab.id === 'SOS_ONLY' ? 'filter-tab-btn--sos' : '';
      return `
        <button
          type="button"
          class="filter-tab-btn ${sosClass} ${isActive ? 'active' : ''}"
          data-tab-id="${escapeHtml(tab.id)}"
        >
          <span>${escapeHtml(tab.label)}</span>
          <span class="filter-tab-count">(${count})</span>
        </button>
      `;
    }).join('');

    tabsContainer.querySelectorAll('.filter-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        appState.adminFilter = btn.getAttribute('data-tab-id') || 'ALL_ACTIVE';
        renderAdminPortal();
      });
    });
  }

  // 4. Render Ranked Complaint Cards Feed
  const filteredCases = getTabFilteredGrievances(
    allGrievances,
    appState.adminFilter,
    appState.adminSearchQuery
  );

  const feedContainer = document.getElementById('admin-complaints-feed');
  if (!feedContainer) return;

  if (filteredCases.length === 0) {
    feedContainer.innerHTML = `
      <div class="glass-card empty-state-box">
        <strong>No Incidents Matching Current Filter</strong>
        <span>All priority grievances in this view have been cleared, or you can load sample campus incidents using the "Seed Demo Incidents" button above.</span>
      </div>
    `;
  } else {
    feedContainer.innerHTML = filteredCases
      .map((item) => renderAdminIncidentCardHTML(item))
      .join('');
  }

  // Bind all "Mark as Resolved" buttons across SOS Banner & Feed
  document.querySelectorAll('[data-resolve-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-resolve-id');
      if (id) handleResolveGrievance(id);
    });
  });

  tickAllLiveClocks();
}

function getPriorityBadgeMeta(score) {
  const num = Number(score) || 3;
  if (num === 10) {
    return {
      label: `[10/10 CRITICAL SOS]`,
      ratingClass: 'incident-priority-rating--sos',
      cardClass: 'incident-card--sos'
    };
  }
  if (num >= 7) {
    return {
      label: `[${num}/10 HIGH]`,
      ratingClass: 'incident-priority-rating--high',
      cardClass: 'incident-card--high'
    };
  }
  if (num >= 5) {
    return {
      label: `[${num}/10 MEDIUM]`,
      ratingClass: 'incident-priority-rating--medium',
      cardClass: ''
    };
  }
  return {
    label: `[${num}/10 STANDARD]`,
    ratingClass: 'incident-priority-rating--low',
    cardClass: ''
  };
}

function renderAdminIncidentCardHTML(item) {
  const isPending = item.status === 'PENDING';
  const badge = getPriorityBadgeMeta(item.priorityScore);
  const durationStr = !isPending
    ? formatResolutionDuration(item.lodgedAt, item.resolvedAt)
    : '';

  return `
    <article class="glass-card incident-card ${isPending ? badge.cardClass : 'incident-card--resolved'}">
      <div class="incident-card__header">
        <div class="incident-card__title-group">
          <span class="incident-priority-rating ${badge.ratingClass}">
            ${escapeHtml(badge.label)}
          </span>
          <h3 class="incident-card__category-heading">
            ${escapeHtml(item.category)}
          </h3>
        </div>

        <div class="incident-card__sla-group">
          <span style="font-size: 0.82rem; color: var(--text-secondary);">
            Target SLA: <strong class="mono-num" style="color: var(--text-primary);">${escapeHtml(item.sla)}</strong>
          </span>
          <span style="font-size: 0.78rem; color: var(--text-muted);">
            Lodged: ${escapeHtml(formatReadableTimestamp(item.lodgedAt))}
          </span>
        </div>
      </div>

      <div class="incident-card__metadata-row">
        <span><strong>Student:</strong> ${escapeHtml(item.studentName)}</span>
        <span class="meta-sep">·</span>
        <span><strong>Enrollment ID:</strong> <span class="mono-num" style="color: var(--cyan);">${escapeHtml(item.enrollmentId)}</span></span>
        <span class="meta-sep">·</span>
        <span><strong>Location:</strong> ${escapeHtml(item.locationSummary)}</span>
        ${
          item.courseInfo
            ? `<span class="meta-sep">·</span><span><strong>Course/Class:</strong> ${escapeHtml(item.courseInfo)}</span>`
            : ''
        }
        ${
          item.hostelDetails
            ? `<span class="meta-sep">·</span><span><strong>Hostel Residency:</strong> ${escapeHtml(item.hostelDetails)}</span>`
            : ''
        }
      </div>

      <p class="incident-card__description">${escapeHtml(item.description)}</p>

      <div class="incident-card__footer">
        <div style="font-size: 0.83rem; color: var(--text-secondary);">
          ${
            isPending
              ? `Active Elapsed Timer: <strong class="dossier-live-clock" data-live-lodged-at="${item.lodgedAt}">${formatStopwatchHMS(Date.now() - item.lodgedAt)}</strong>`
              : `<strong class="dossier-resolved-duration">✅ Resolved in ${escapeHtml(durationStr)} (Solved in ${escapeHtml(durationStr)})</strong>`
          }
        </div>

        ${
          isPending
            ? `<button type="button" class="btn-resolve" data-resolve-id="${escapeHtml(item.id)}">
                 Mark as Resolved
               </button>`
            : `<span class="mono-num" style="font-size: 0.8rem; color: var(--emerald);">ARCHIVED · ${escapeHtml(item.id)}</span>`
        }
      </div>
    </article>
  `;
}

/* ==========================================================================
   8. DEMO SEED GENERATOR & REAL-TIME CROSS-TAB STORAGE SYNC
   ========================================================================== */
function seedInitialDataIfEmpty() {
  const existing = getGrievances();
  if (existing.length > 0) return;

  const now = Date.now();
  const sampleIncidents = [
    {
      id: 'GRV-SOS101',
      enrollmentId: 'A368302748394',
      studentName: 'Aarav Sharma',
      residingHostel: 'Yes',
      hostelDetails: 'Boys Hostel · Room B-304',
      category: 'Fire & Safety',
      courseInfo: null,
      locationSummary: 'boys hostel · Floor 3 · Near Room B-304 Corridor',
      description: 'धुआं (Smoke) and Spark coming from main distribution box near corridor, possible Short Circuit!',
      priorityScore: 10,
      priorityTier: 'CRITICAL SOS',
      sla: '0-15 mins',
      matchedKeywords: ['Fire & Safety Lock', 'धुआं', 'spark', 'short circuit'],
      status: 'PENDING',
      lodgedAt: now - 195000, // 3 mins 15 secs ago
      resolvedAt: null
    },
    {
      id: 'GRV-HGH204',
      enrollmentId: 'A918273645012',
      studentName: 'Priya Verma',
      residingHostel: 'Yes',
      hostelDetails: 'Girls Hostel · Room G-210',
      category: 'Fight & Security',
      courseInfo: null,
      locationSummary: 'gate no. 2 · Ground Floor · Near Security Post',
      description: 'Severe मारपीट (Marpit / Assault) and धमकी (Threat) reported near Gate No. 2 parking zone.',
      priorityScore: 9,
      priorityTier: 'HIGH',
      sla: '1-2 hrs',
      matchedKeywords: ['मारपीट', 'धमकी'],
      status: 'PENDING',
      lodgedAt: now - 840000, // 14 mins ago
      resolvedAt: null
    },
    {
      id: 'GRV-MED309',
      enrollmentId: 'A554433221100',
      studentName: 'Rohan Nair',
      residingHostel: 'No',
      hostelDetails: null,
      category: 'Mess & Canteen',
      courseInfo: null,
      locationSummary: 'Wonders Food · Ground Floor Food Court (No additional location needed)',
      description: 'खराब खाना (Spoiled Food) and Foul Smell noticed in afternoon lunch tray at Wonders Food.',
      priorityScore: 6,
      priorityTier: 'MEDIUM',
      sla: '3-6 hrs',
      matchedKeywords: ['खराब खाना', 'foul smell'],
      status: 'PENDING',
      lodgedAt: now - 1620000, // 27 mins ago
      resolvedAt: null
    }
  ];

  localStorage.setItem(STORAGE_KEYS.GRIEVANCES, JSON.stringify(sampleIncidents));
}

function handleSeedDemoIncidentsClick() {
  const now = Date.now();
  const current = getGrievances();

  const demoBatch = [
    {
      id: `GRV-${now.toString().slice(-5)}A`,
      enrollmentId: 'A368302748394',
      studentName: 'Aarav Sharma',
      residingHostel: 'Yes',
      hostelDetails: 'Boys Hostel · Room B-304',
      category: 'Electricity',
      courseInfo: null,
      locationSummary: 'Library · Floor 2 · Near Reading Bay 4',
      description: 'खुला तार (Open Live Wire) and करंट (Current Shock) risk near laptop charging station.',
      priorityScore: 10,
      priorityTier: 'CRITICAL SOS',
      sla: '0-15 mins',
      matchedKeywords: ['खुला तार', 'करंट'],
      status: 'PENDING',
      lodgedAt: now - 75000,
      resolvedAt: null
    },
    {
      id: `GRV-${now.toString().slice(-5)}B`,
      enrollmentId: 'A368302748394',
      studentName: 'Aarav Sharma',
      residingHostel: 'No',
      hostelDetails: null,
      category: 'Exam & Academics',
      courseInfo: 'B.Tech · Semester 5 / Section A',
      locationSummary: 'Academic Block (B.Tech - Semester 5 / Section A)',
      description: 'Admit Card Issue and Attendance Shortage portal discrepancy before mid-semester examination.',
      priorityScore: 6,
      priorityTier: 'MEDIUM',
      sla: '3-6 hrs',
      matchedKeywords: ['admit card', 'attendance shortage'],
      status: 'PENDING',
      lodgedAt: now - 420000,
      resolvedAt: null
    }
  ];

  saveGrievances([...demoBatch, ...current]);
  renderAdminPortal();
  showToast('🧪 Added 2 live test grievances (including 10/10 SOS)', 'cyan');
}

function setupCrossTabSync() {
  // 1. Native Storage Event Listener (triggers across browser tabs on localStorage mutation)
  window.addEventListener('storage', (event) => {
    if (
      event.key === STORAGE_KEYS.GRIEVANCES ||
      event.key === STORAGE_KEYS.LAST_RESOLVED_BANNER ||
      event.key === null
    ) {
      refreshActiveScreenFromStorage();
    }
  });

  // 2. BroadcastChannel for instantaneous multi-tab sync
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      appState.syncChannel = new BroadcastChannel('amity_grievance_realtime_sync');
      appState.syncChannel.onmessage = () => {
        refreshActiveScreenFromStorage();
      };
    } catch {
      // Fallback relies on standard storage event
    }
  }
}

function notifyCrossTabSync(type) {
  if (appState.syncChannel) {
    try {
      appState.syncChannel.postMessage({ type, timestamp: Date.now() });
    } catch {
      // Ignore broadcast errors
    }
  }
}

function refreshActiveScreenFromStorage() {
  if (appState.currentScreen === 'student') {
    renderStudentPortal();
    showToast('🔄 Live status synced from Authority Command Desk', 'emerald');
  } else if (appState.currentScreen === 'admin') {
    renderAdminPortal();
  }
}

/* ==========================================================================
   9. UTILITIES & TOAST NOTIFICATIONS
   ========================================================================== */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function showToast(message, variant = 'cyan') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item toast-item--${variant}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}

/* ==========================================================================
   10. APPLICATION BOOTSTRAP
   ========================================================================== */
function initApplication() {
  if (typeof document === 'undefined') return;

  seedInitialDataIfEmpty();
  populateStaticDropdowns();
  setupCrossTabSync();
  startGlobalStopwatchTicker();

  // Role Selection Cards on Screen 1
  document.getElementById('role-card-student')?.addEventListener('click', () => {
    openAuthScreen('student');
  });

  document.getElementById('role-card-admin')?.addEventListener('click', () => {
    openAuthScreen('admin');
  });

  // Screen 2 Auth Controls
  document.getElementById('auth-back-btn')?.addEventListener('click', () => {
    clearAuthError();
    switchScreen('landing');
  });

  document.getElementById('auth-autofill-btn')?.addEventListener('click', handleAutofillCredentials);
  document.getElementById('auth-form')?.addEventListener('submit', handleAuthSubmit);

  // Logout Buttons (Student & Admin Headers)
  document.getElementById('student-logout-btn')?.addEventListener('click', handleLogout);
  document.getElementById('admin-logout-btn')?.addEventListener('click', handleLogout);

  // Student Form Dynamic Controls
  document.getElementById('grievance-hostel-residing')?.addEventListener('change', handleHostelResidencyChange);
  document.getElementById('grievance-category')?.addEventListener('change', handleCategoryChange);
  document.getElementById('grievance-description')?.addEventListener('input', updateStudentSlaPreview);
  document.getElementById('student-grievance-form')?.addEventListener('submit', handleGrievanceFormSubmit);

  // Admin Search & Utility Buttons
  document.getElementById('admin-search-input')?.addEventListener('input', (e) => {
    appState.adminSearchQuery = e.target.value;
    renderAdminPortal();
  });

  document.getElementById('admin-seed-btn')?.addEventListener('click', handleSeedDemoIncidentsClick);

  // Initialize Default Category Form State
  handleHostelResidencyChange();
  handleCategoryChange();

  // Restore Active Session if present in sessionStorage
  const savedSession = getActiveSession();
  if (savedSession && savedSession.role === 'student') {
    appState.session = savedSession;
    switchScreen('student');
  } else if (savedSession && savedSession.role === 'admin') {
    appState.session = savedSession;
    switchScreen('admin');
  } else {
    switchScreen('landing');
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApplication);
  } else {
    initApplication();
  }
}
