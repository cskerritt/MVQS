const els = {
  appShell: document.querySelector('.app-shell'),
  wizardPanel: document.querySelector('#wizardPanel'),
  wizardRail: document.querySelector('#wizardRail'),
  wizardCurrentStep: document.querySelector('#wizardCurrentStep'),
  wizardBlockingNotice: document.querySelector('#wizardBlockingNotice'),
  wizardPrevBtn: document.querySelector('#wizardPrevBtn'),
  wizardNextBtn: document.querySelector('#wizardNextBtn'),
  toggleAdvancedModeBtn: document.querySelector('#toggleAdvancedModeBtn'),
  wizardCreateCaseBtn: document.querySelector('#wizardCreateCaseBtn'),
  wizardRefreshCasesBtn: document.querySelector('#wizardRefreshCasesBtn'),
  wizardCaseList: document.querySelector('#wizardCaseList'),
  wizardReadinessSummary: document.querySelector('#wizardReadinessSummary'),
  wizardReadinessMeta: document.querySelector('#wizardReadinessMeta'),
  wizardRecheckBtn: document.querySelector('#wizardRecheckBtn'),
  welcomeView: document.querySelector('#welcomeView'),
  intakeView: document.querySelector('#intakeView'),
  workHistoryView: document.querySelector('#workHistoryView'),
  profilesView: document.querySelector('#profilesView'),
  analysisView: document.querySelector('#analysisView'),
  reportView: document.querySelector('#reportView'),
  wizardFirstNameInput: document.querySelector('#wizardFirstNameInput'),
  wizardLastNameInput: document.querySelector('#wizardLastNameInput'),
  wizardAddress1Input: document.querySelector('#wizardAddress1Input'),
  wizardCityInput: document.querySelector('#wizardCityInput'),
  wizardPostalInput: document.querySelector('#wizardPostalInput'),
  wizardCountryInput: document.querySelector('#wizardCountryInput'),
  wizardDemoStateSelect: document.querySelector('#wizardDemoStateSelect'),
  wizardDemoCountySelect: document.querySelector('#wizardDemoCountySelect'),
  wizardCaseRefInput: document.querySelector('#wizardCaseRefInput'),
  wizardCaseNameInput: document.querySelector('#wizardCaseNameInput'),
  wizardReasonInput: document.querySelector('#wizardReasonInput'),
  wizardSaveIntakeBtn: document.querySelector('#wizardSaveIntakeBtn'),
  wizardIntakeMeta: document.querySelector('#wizardIntakeMeta'),
  wizardWorkHistorySearchInput: document.querySelector('#wizardWorkHistorySearchInput'),
  wizardWorkHistorySearchBtn: document.querySelector('#wizardWorkHistorySearchBtn'),
  wizardWorkHistorySearchResults: document.querySelector('#wizardWorkHistorySearchResults'),
  wizardWorkHistoryList: document.querySelector('#wizardWorkHistoryList'),
  wizardWorkHistoryMeta: document.querySelector('#wizardWorkHistoryMeta'),
  wizardProfileModeSelect: document.querySelector('#wizardProfileModeSelect'),
  wizardResidualCapSelect: document.querySelector('#wizardResidualCapSelect'),
  wizardTraitGroupFilterSelect: document.querySelector('#wizardTraitGroupFilterSelect'),
  wizardAdjustmentWorkflow: document.querySelector('#wizardAdjustmentWorkflow'),
  wizardFocusProfile2Btn: document.querySelector('#wizardFocusProfile2Btn'),
  wizardFocusProfile4Btn: document.querySelector('#wizardFocusProfile4Btn'),
  wizardAdjustTargetSelect: document.querySelector('#wizardAdjustTargetSelect'),
  wizardAdjustBySelect: document.querySelector('#wizardAdjustBySelect'),
  wizardAdjustGroupSelect: document.querySelector('#wizardAdjustGroupSelect'),
  wizardApplyAdjustmentBtn: document.querySelector('#wizardApplyAdjustmentBtn'),
  wizardLowerProfile2Btn: document.querySelector('#wizardLowerProfile2Btn'),
  wizardLowerProfile4Btn: document.querySelector('#wizardLowerProfile4Btn'),
  wizardCopyProfile3To4Btn: document.querySelector('#wizardCopyProfile3To4Btn'),
  wizardResetToDerivedBtn: document.querySelector('#wizardResetToDerivedBtn'),
  wizardProfileMethodMeta: document.querySelector('#wizardProfileMethodMeta'),
  wizardProfileFocusMeta: document.querySelector('#wizardProfileFocusMeta'),
  wizardProfilesGrid: document.querySelector('#wizardProfilesGrid'),
  wizardSaveProfilesBtn: document.querySelector('#wizardSaveProfilesBtn'),
  wizardProfilesMeta: document.querySelector('#wizardProfilesMeta'),
  wizardRunAnalysisBtn: document.querySelector('#wizardRunAnalysisBtn'),
  wizardAnalysisMeta: document.querySelector('#wizardAnalysisMeta'),
  wizardAnalysisSummary: document.querySelector('#wizardAnalysisSummary'),
  wizardAnalysisResults: document.querySelector('#wizardAnalysisResults'),
  wizardGenerateReportBtn: document.querySelector('#wizardGenerateReportBtn'),
  wizardSaveReportBtn: document.querySelector('#wizardSaveReportBtn'),
  wizardExportJsonBtn: document.querySelector('#wizardExportJsonBtn'),
  wizardExportMdBtn: document.querySelector('#wizardExportMdBtn'),
  wizardExportHtmlBtn: document.querySelector('#wizardExportHtmlBtn'),
  wizardExportPdfBtn: document.querySelector('#wizardExportPdfBtn'),
  wizardExportPacketBtn: document.querySelector('#wizardExportPacketBtn'),
  wizardGenerateAiNarrativeBtn: document.querySelector('#wizardGenerateAiNarrativeBtn'),
  wizardReportMeta: document.querySelector('#wizardReportMeta'),
  wizardReportPreview: document.querySelector('#wizardReportPreview'),
  wizardAiNarrative: document.querySelector('#wizardAiNarrative'),
  workflowPanel: document.querySelector('#workflowPanel'),
  readinessStrip: document.querySelector('#readinessStrip'),
  readinessBadge: document.querySelector('#readinessBadge'),
  readinessMeta: document.querySelector('#readinessMeta'),
  readinessSnapshot: document.querySelector('#readinessSnapshot'),
  readinessRemediation: document.querySelector('#readinessRemediation'),
  recheckReadinessBtn: document.querySelector('#recheckReadinessBtn'),
  workflowCurrentStep: document.querySelector('#workflowCurrentStep'),
  workflowStepsList: document.querySelector('#workflowStepsList'),
  controlsPanel: document.querySelector('#controlsPanel'),
  resultsPanel: document.querySelector('#resultsPanel'),
  detailPanel: document.querySelector('#detailPanel'),
  clientUsersBlock: document.querySelector('#clientUsersBlock'),
  psychometricBlock: document.querySelector('#psychometricBlock'),
  savedReportsBlock: document.querySelector('#savedReportsBlock'),
  searchInput: document.querySelector('#searchInput'),
  stateSelect: document.querySelector('#stateSelect'),
  countySelect: document.querySelector('#countySelect'),
  searchBtn: document.querySelector('#searchBtn'),
  matchBtn: document.querySelector('#matchBtn'),
  tsaBtn: document.querySelector('#tsaBtn'),
  tsaSourceInput: document.querySelector('#tsaSourceInput'),
  resetProfileBtn: document.querySelector('#resetProfileBtn'),
  toggleProfileBtn: document.querySelector('#toggleProfileBtn'),
  generateReportBtn: document.querySelector('#generateReportBtn'),
  downloadJsonBtn: document.querySelector('#downloadJsonBtn'),
  downloadMarkdownBtn: document.querySelector('#downloadMarkdownBtn'),
  profilePanel: document.querySelector('#profilePanel'),
  traitsGrid: document.querySelector('#traitsGrid'),
  resultsMeta: document.querySelector('#resultsMeta'),
  resultsList: document.querySelector('#resultsList'),
  detailMeta: document.querySelector('#detailMeta'),
  jobDetail: document.querySelector('#jobDetail'),
  reportMeta: document.querySelector('#reportMeta'),
  manualTsaBasisMeta: document.querySelector('#manualTsaBasisMeta'),
  reportBody: document.querySelector('#reportBody'),
  userSelect: document.querySelector('#userSelect'),
  userFirstNameInput: document.querySelector('#userFirstNameInput'),
  userLastNameInput: document.querySelector('#userLastNameInput'),
  userCaseRefInput: document.querySelector('#userCaseRefInput'),
  userEmailInput: document.querySelector('#userEmailInput'),
  userAddress1Input: document.querySelector('#userAddress1Input'),
  userAddress2Input: document.querySelector('#userAddress2Input'),
  userCityInput: document.querySelector('#userCityInput'),
  userPostalInput: document.querySelector('#userPostalInput'),
  userDemoStateSelect: document.querySelector('#userDemoStateSelect'),
  userDemoCountySelect: document.querySelector('#userDemoCountySelect'),
  userNotesInput: document.querySelector('#userNotesInput'),
  createUserBtn: document.querySelector('#createUserBtn'),
  updateUserBtn: document.querySelector('#updateUserBtn'),
  deleteUserBtn: document.querySelector('#deleteUserBtn'),
  userMeta: document.querySelector('#userMeta'),
  psychTestSelect: document.querySelector('#psychTestSelect'),
  psychRawInput: document.querySelector('#psychRawInput'),
  psychScaledInput: document.querySelector('#psychScaledInput'),
  psychPercentileInput: document.querySelector('#psychPercentileInput'),
  psychMeasuredAtInput: document.querySelector('#psychMeasuredAtInput'),
  psychInterpretationInput: document.querySelector('#psychInterpretationInput'),
  addPsychResultBtn: document.querySelector('#addPsychResultBtn'),
  refreshPsychBtn: document.querySelector('#refreshPsychBtn'),
  psychMeta: document.querySelector('#psychMeta'),
  psychResultsList: document.querySelector('#psychResultsList'),
  reportSaveLabelInput: document.querySelector('#reportSaveLabelInput'),
  saveReportForUserBtn: document.querySelector('#saveReportForUserBtn'),
  exportCaseBundleBtn: document.querySelector('#exportCaseBundleBtn'),
  refreshSavedReportsBtn: document.querySelector('#refreshSavedReportsBtn'),
  savedReportsMeta: document.querySelector('#savedReportsMeta'),
  savedReportsList: document.querySelector('#savedReportsList'),
  loadMoreBtn: document.querySelector('#loadMoreBtn'),
  resultTemplate: document.querySelector('#resultTemplate')
};

const state = {
  mode: 'search',
  traits: [],
  profile: [],
  defaultProfile: [],
  tsaSourceDots: [],
  tsaBandCounts: null,
  tsaAnalysisBasis: null,
  users: [],
  cases: [],
  selectedCaseId: null,
  wizardStep: 'welcome',
  wizardProfiles: null,
  wizardProfilesBaseline: null,
  wizardProfileMode: 'strict_derived',
  wizardResidualCap: true,
  wizardTraitGroupFilter: 'all',
  wizardAdjustmentFocus: 'profile2',
  wizardWorkHistory: [],
  wizardAnalysis: null,
  wizardReportPayload: null,
  wizardReportHtml: null,
  wizardLastSavedReportId: null,
  advancedMode: false,
  selectedUserId: null,
  availableStates: [],
  demographicCounties: [],
  psychometricCatalog: [],
  psychometricResults: [],
  savedReports: [],
  results: [],
  resultsTotal: 0,
  selectedDot: null,
  selectedResultButton: null,
  report: null,
  reportHtml: null,
  aiStatus: null,
  wizardAiNarrative: null,
  readiness: null,
  workflowSteps: [],
  hasExecutedRegionRun: false,
  lastDetailLoadedDot: null,
  lastCasePacketSavedReportId: null
};

const UI_STATE_STORAGE_KEY = 'mvqs-modern-ui-v2';
const RESULTS_PAGE_SIZE = 100;
const DEFAULT_TSA_GUIDE_TEXT =
  'Transferable skills uses MVQS-style TS/TSP bands and current SQLite fields (trait vector, DOT/O*NET prefix, VQ, SVP, and region counts). Enter one or more source DOTs.';
const WORKFLOW_STATUS_LABELS = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
  blocked: 'Blocked'
};
const WORKFLOW_STEP_DEFS = [
  {
    id: 'verify_data_load',
    title: 'Verify Data Load',
    targetId: 'workflowPanel',
    help: 'Check readiness. If blocked, run the listed remediation commands.'
  },
  {
    id: 'set_search_region',
    title: 'Set Search Region',
    targetId: 'controlsPanel',
    help: 'Choose state/county in top filters, then click Run Match.'
  },
  {
    id: 'create_or_select_client',
    title: 'Create or Select Client',
    targetId: 'clientUsersBlock',
    help: 'Create client in Case Dashboard > Client Users.'
  },
  {
    id: 'enter_demographics',
    title: 'Enter Demographics',
    targetId: 'clientUsersBlock',
    help: 'Complete client name/address fields and choose demographic state/county as required.'
  },
  {
    id: 'add_psychometrics',
    title: 'Add Psychometric Results (Recommended)',
    targetId: 'psychometricBlock',
    help: 'Add psychometric result in Case Dashboard > Psychometric Testing.'
  },
  {
    id: 'run_match_or_tsa',
    title: 'Run Match or Transferable Skills',
    targetId: 'controlsPanel',
    help: 'Run Match or Transferable Skills to produce ranked results.'
  },
  {
    id: 'select_target_job',
    title: 'Select Target Job',
    targetId: 'resultsPanel',
    help: 'Select a result row in Results panel.'
  },
  {
    id: 'generate_report',
    title: 'Generate Report',
    targetId: 'reportPanel',
    help: 'Generate report after selecting a target job.'
  },
  {
    id: 'save_export_case_packet',
    title: 'Save and Export Case Packet',
    targetId: 'savedReportsBlock',
    help: 'Save report in Saved Reports, then click Case Packet.'
  }
];

const WIZARD_STEPS = [
  { id: 'welcome', title: 'Welcome Cases', viewId: 'welcomeView' },
  { id: 'intake', title: 'Intake', viewId: 'intakeView' },
  { id: 'work-history', title: 'Work History DOTs', viewId: 'workHistoryView' },
  { id: 'profiles', title: 'Profiles', viewId: 'profilesView' },
  { id: 'analysis', title: 'Analysis', viewId: 'analysisView' },
  { id: 'report', title: 'Report / Export', viewId: 'reportView' }
];

const requestTracker = {
  results: { id: 0, controller: null },
  detail: { id: 0, controller: null },
  report: { id: 0, controller: null },
  counties: { id: 0, controller: null }
};

function beginTrackedRequest(type) {
  const tracker = requestTracker[type];
  tracker.id += 1;
  if (tracker.controller) {
    tracker.controller.abort();
  }
  tracker.controller = new AbortController();
  return { id: tracker.id, signal: tracker.controller.signal };
}

function isLatestRequest(type, requestId) {
  return requestTracker[type].id === requestId;
}

function finishTrackedRequest(type, requestId) {
  if (isLatestRequest(type, requestId)) {
    requestTracker[type].controller = null;
  }
}

function cancelTrackedRequest(type) {
  const tracker = requestTracker[type];
  if (tracker.controller) {
    tracker.controller.abort();
    tracker.controller = null;
  }
}

function isAbortError(error) {
  return error && typeof error === 'object' && error.name === 'AbortError';
}

function ensureButtonDefaultLabel(button) {
  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent;
  }
  return button.dataset.defaultLabel;
}

function setRunButtonsBusy(isBusy, activeMode = null) {
  const searchLabel = ensureButtonDefaultLabel(els.searchBtn);
  const matchLabel = ensureButtonDefaultLabel(els.matchBtn);
  const tsaLabel = ensureButtonDefaultLabel(els.tsaBtn);

  if (isBusy) {
    els.searchBtn.disabled = true;
    els.matchBtn.disabled = true;
    els.tsaBtn.disabled = true;
    els.searchBtn.textContent = activeMode === 'search' ? 'Searching...' : searchLabel;
    els.matchBtn.textContent = activeMode === 'match' ? 'Matching...' : matchLabel;
    els.tsaBtn.textContent = activeMode === 'tsa' ? 'Analyzing...' : tsaLabel;
    els.resultsList.setAttribute('aria-busy', 'true');
    return;
  }

  els.searchBtn.disabled = false;
  els.matchBtn.disabled = false;
  els.tsaBtn.disabled = false;
  els.searchBtn.textContent = searchLabel;
  els.matchBtn.textContent = matchLabel;
  els.tsaBtn.textContent = tsaLabel;
  els.resultsList.setAttribute('aria-busy', 'false');
}

function setRunButtonsDisabled(isDisabled) {
  els.searchBtn.disabled = isDisabled;
  els.matchBtn.disabled = isDisabled;
  els.tsaBtn.disabled = isDisabled;
}

function setGenerateReportBusy(isBusy) {
  const defaultLabel = ensureButtonDefaultLabel(els.generateReportBtn);
  els.generateReportBtn.disabled = isBusy;
  els.generateReportBtn.textContent = isBusy ? 'Generating...' : defaultLabel;
  els.reportBody.setAttribute('aria-busy', isBusy ? 'true' : 'false');
}

function setLoadMoreBusy(isBusy) {
  const defaultLabel = ensureButtonDefaultLabel(els.loadMoreBtn);
  if (isBusy) {
    els.loadMoreBtn.hidden = false;
    els.loadMoreBtn.disabled = true;
    els.loadMoreBtn.textContent = 'Loading...';
    return;
  }
  els.loadMoreBtn.textContent = defaultLabel;
}

function hideLoadMore() {
  setLoadMoreBusy(false);
  els.loadMoreBtn.hidden = true;
  els.loadMoreBtn.disabled = true;
}

function updateLoadMoreVisibility() {
  const hasMore = state.results.length < state.resultsTotal;
  els.loadMoreBtn.hidden = !hasMore;
  els.loadMoreBtn.disabled = !hasMore;
}

function appendUniqueResults(existingRows, incomingRows) {
  const seenDots = new Set(existingRows.map((row) => row.dot_code));
  const appendedRows = [];

  incomingRows.forEach((row) => {
    if (!row || !row.dot_code || seenDots.has(row.dot_code)) {
      return;
    }
    seenDots.add(row.dot_code);
    appendedRows.push(row);
  });

  return {
    rows: existingRows.concat(appendedRows),
    appendedCount: appendedRows.length
  };
}

function normalizeProfileValues(rawProfile) {
  if (!Array.isArray(rawProfile) || rawProfile.length !== state.traits.length) {
    return null;
  }

  return rawProfile.map((value, index) => {
    const trait = state.traits[index];
    const parsed = Number.parseInt(String(value), 10);
    const fallback = state.defaultProfile[index] ?? trait.min;
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.min(trait.max, Math.max(trait.min, parsed));
  });
}

function readPersistedUiState() {
  try {
    const raw = window.localStorage.getItem(UI_STATE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistUiState() {
  try {
    const payload = {
      q: els.searchInput.value.trim().slice(0, 200),
      stateId: els.stateSelect.value || null,
      countyId: els.countySelect.value || null,
      mode: state.mode,
      profile: [...state.profile],
      tsaSourceDot: els.tsaSourceInput.value.trim(),
      userId: state.selectedUserId
    };
    window.localStorage.setItem(UI_STATE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures to keep the app functional.
  }
}

async function api(url, options = {}) {
  const { headers, body, ...rest } = options;
  const requestHeaders = new Headers(headers || {});
  if (body !== undefined && body !== null && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...rest,
    body,
    headers: requestHeaders
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error || payload.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

function setResultsMeta(text) {
  els.resultsMeta.textContent = text;
}

function setDetailMeta(text) {
  els.detailMeta.textContent = text;
}

function setReportMeta(text) {
  els.reportMeta.textContent = text;
}

function setUserMeta(text) {
  if (els.userMeta) {
    els.userMeta.textContent = text;
  }
}

function setPsychMeta(text) {
  if (els.psychMeta) {
    els.psychMeta.textContent = text;
  }
}

function setSavedReportsMeta(text) {
  if (els.savedReportsMeta) {
    els.savedReportsMeta.textContent = text;
  }
}

function setWizardMeta(element, text) {
  if (element) {
    element.textContent = text;
  }
}

function selectedCase() {
  if (state.selectedCaseId === null) {
    return null;
  }
  return state.cases.find((row) => row.user_id === state.selectedCaseId) || null;
}

function setAdvancedMode(enabled) {
  state.advancedMode = !!enabled;
  if (!els.appShell) {
    return;
  }
  els.appShell.classList.toggle('wizard-default', !state.advancedMode);
  els.appShell.classList.toggle('advanced-mode', state.advancedMode);
  if (els.toggleAdvancedModeBtn) {
    els.toggleAdvancedModeBtn.textContent = state.advancedMode ? 'Close Advanced Mode' : 'Open Advanced Mode';
  }
}

function getWizardStepIndex(stepId) {
  const index = WIZARD_STEPS.findIndex((row) => row.id === stepId);
  return index < 0 ? 0 : index;
}

function getWizardStepStatuses() {
  const caseRow = selectedCase();
  const hasCase = !!caseRow;
  const intakeReady = !!(
    caseRow &&
    caseRow.first_name &&
    caseRow.last_name &&
    caseRow.address_line1 &&
    caseRow.city &&
    caseRow.postal_code &&
    caseRow.demographic_state_id !== null &&
    caseRow.reason_for_referral
  );
  const workHistoryReady = Array.isArray(state.wizardWorkHistory) && state.wizardWorkHistory.length > 0;
  const profilesReady = !!state.wizardProfiles;
  const analysisReady = Array.isArray(state.wizardAnalysis?.results) && state.wizardAnalysis.results.length > 0;
  const reportReady = !!state.wizardReportHtml;
  const blockedByReadiness = !readinessIsPass();
  return {
    welcome: hasCase ? 'done' : 'in_progress',
    intake: !hasCase ? 'not_started' : intakeReady ? 'done' : 'in_progress',
    'work-history': !hasCase ? 'not_started' : workHistoryReady ? 'done' : 'in_progress',
    profiles: !workHistoryReady ? 'blocked' : profilesReady ? 'done' : 'in_progress',
    analysis: !profilesReady ? 'blocked' : analysisReady ? 'done' : 'in_progress',
    report: !analysisReady ? 'blocked' : reportReady ? 'done' : 'in_progress',
    globalBlocked: blockedByReadiness
  };
}

function renderWizardRail() {
  if (!els.wizardRail || !els.wizardCurrentStep) {
    return;
  }
  const statuses = getWizardStepStatuses();
  const current = WIZARD_STEPS[getWizardStepIndex(state.wizardStep)] || WIZARD_STEPS[0];
  els.wizardCurrentStep.textContent = `Current step: ${current.title}`;
  els.wizardRail.innerHTML = '';
  WIZARD_STEPS.forEach((step) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wizard-rail-btn';
    const status = statuses[step.id] || 'not_started';
    button.classList.add(status);
    if (step.id === state.wizardStep) {
      button.classList.add('active');
    }
    button.textContent = `${step.title} (${status.replace('_', ' ')})`;
    button.addEventListener('click', () => {
      goToWizardStep(step.id);
    });
    els.wizardRail.appendChild(button);
  });
  const blockedMessage = statuses.globalBlocked ? `Blocked: ${getPrimaryReadinessFailureMessage()}` : '';
  if (els.wizardBlockingNotice) {
    els.wizardBlockingNotice.textContent = blockedMessage;
  }
}

function goToWizardStep(stepId) {
  const target = WIZARD_STEPS.find((row) => row.id === stepId) || WIZARD_STEPS[0];
  state.wizardStep = target.id;
  WIZARD_STEPS.forEach((step) => {
    const view = document.getElementById(step.viewId);
    if (!view) {
      return;
    }
    view.classList.toggle('active', step.id === target.id);
  });
  const index = getWizardStepIndex(target.id);
  if (els.wizardPrevBtn) {
    els.wizardPrevBtn.disabled = index <= 0;
  }
  if (els.wizardNextBtn) {
    els.wizardNextBtn.disabled = index >= WIZARD_STEPS.length - 1;
  }
  window.location.hash = `#${target.id}`;
  renderWizardRail();
}

function moveWizardStep(delta) {
  const currentIndex = getWizardStepIndex(state.wizardStep);
  const nextIndex = Math.max(0, Math.min(WIZARD_STEPS.length - 1, currentIndex + delta));
  goToWizardStep(WIZARD_STEPS[nextIndex].id);
}

function renderWizardReadinessSummary() {
  if (!els.wizardReadinessSummary || !els.wizardReadinessMeta) {
    return;
  }
  if (state.readiness === null) {
    els.wizardReadinessSummary.textContent = 'Checking readiness...';
    els.wizardReadinessMeta.textContent = '';
    return;
  }
  const pass = readinessIsPass();
  els.wizardReadinessSummary.textContent = pass
    ? 'Readiness: PASS. Data sources and app DB are available.'
    : `Readiness: BLOCKED. ${getPrimaryReadinessFailureMessage()}`;
  els.wizardReadinessMeta.textContent = getReadinessSnapshotText();
}

async function loadCases(preferredCaseId = null) {
  if (!state.readiness?.core?.appDbReady) {
    state.cases = [];
    renderWizardCaseList();
    return;
  }
  const data = await api('/api/cases');
  state.cases = data.cases || [];
  if (preferredCaseId !== null && state.cases.some((row) => row.user_id === preferredCaseId)) {
    state.selectedCaseId = preferredCaseId;
  } else if (state.selectedCaseId !== null && !state.cases.some((row) => row.user_id === state.selectedCaseId)) {
    state.selectedCaseId = null;
  }
  if (state.selectedCaseId !== null) {
    state.selectedUserId = state.selectedCaseId;
  }
  renderWizardCaseList();
}

async function loadWizardCaseDetail(caseId) {
  const data = await api(`/api/cases/${caseId}`);
  const caseRow = data.case;
  const index = state.cases.findIndex((row) => row.user_id === caseId);
  if (index >= 0) {
    state.cases[index] = caseRow;
  } else {
    state.cases.push(caseRow);
  }
  state.selectedCaseId = caseId;
  state.selectedUserId = caseId;
  state.wizardAiNarrative = null;
  renderWizardAiNarrative();
  populateWizardIntake(caseRow);
  await Promise.all([loadWizardWorkHistory(), loadWizardProfiles(), loadSavedReports()]);
  renderWizardCaseList();
  renderWizardRail();
}

function renderWizardCaseList() {
  if (!els.wizardCaseList) {
    return;
  }
  if (!state.cases.length) {
    ensureDashboardListEmpty(els.wizardCaseList, 'No cases yet. Create a new evaluee to begin.');
    renderWizardRail();
    return;
  }
  els.wizardCaseList.innerHTML = '';
  state.cases.forEach((row) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'dashboard-item';
    const head = document.createElement('div');
    head.className = 'dashboard-item-head';
    const title = document.createElement('strong');
    title.textContent = `${row.last_name}, ${row.first_name}`;
    const meta = document.createElement('span');
    meta.className = 'dashboard-item-meta';
    const workDots = Number(row.work_history_dot_count || 0).toLocaleString();
    meta.textContent = `${row.case_reference || 'No case ref'} | DOTs ${workDots}`;
    head.append(title, meta);
    const actionRow = document.createElement('div');
    actionRow.className = 'dashboard-item-actions';
    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'dashboard-mini-btn';
    openBtn.textContent = row.user_id === state.selectedCaseId ? 'Selected' : 'Open';
    openBtn.disabled = row.user_id === state.selectedCaseId;
    openBtn.addEventListener('click', async () => {
      await loadWizardCaseDetail(row.user_id);
      setWizardMeta(els.wizardIntakeMeta, `Loaded case #${row.user_id}.`);
    });
    actionRow.appendChild(openBtn);
    wrapper.append(head, actionRow);
    els.wizardCaseList.appendChild(wrapper);
  });
  renderWizardRail();
}

function populateWizardIntake(caseRow) {
  const row = caseRow || selectedCase();
  if (!row) {
    if (els.wizardFirstNameInput) els.wizardFirstNameInput.value = '';
    if (els.wizardLastNameInput) els.wizardLastNameInput.value = '';
    if (els.wizardAddress1Input) els.wizardAddress1Input.value = '';
    if (els.wizardCityInput) els.wizardCityInput.value = '';
    if (els.wizardPostalInput) els.wizardPostalInput.value = '';
    if (els.wizardCountryInput) els.wizardCountryInput.value = 'USA';
    if (els.wizardCaseRefInput) els.wizardCaseRefInput.value = '';
    if (els.wizardCaseNameInput) els.wizardCaseNameInput.value = '';
    if (els.wizardReasonInput) els.wizardReasonInput.value = '';
    if (els.wizardDemoStateSelect) els.wizardDemoStateSelect.value = '';
    if (els.wizardDemoCountySelect) {
      els.wizardDemoCountySelect.innerHTML = '<option value=\"\">Select county/bank</option>';
      els.wizardDemoCountySelect.disabled = true;
    }
    return;
  }

  els.wizardFirstNameInput.value = row.first_name || '';
  els.wizardLastNameInput.value = row.last_name || '';
  els.wizardAddress1Input.value = row.address_line1 || '';
  els.wizardCityInput.value = row.city || '';
  els.wizardPostalInput.value = row.postal_code || '';
  els.wizardCountryInput.value = row.country_name || 'USA';
  els.wizardCaseRefInput.value = row.case_reference || '';
  els.wizardCaseNameInput.value = row.case_name || '';
  els.wizardReasonInput.value = row.reason_for_referral || '';

  if (row.demographic_state_id && [...els.wizardDemoStateSelect.options].some((opt) => opt.value === String(row.demographic_state_id))) {
    els.wizardDemoStateSelect.value = String(row.demographic_state_id);
    loadWizardDemographicCountiesForState(String(row.demographic_state_id), row.demographic_county_id);
  } else {
    els.wizardDemoStateSelect.value = '';
    els.wizardDemoCountySelect.innerHTML = '<option value=\"\">Select county/bank</option>';
    els.wizardDemoCountySelect.disabled = true;
  }
}

function renderWizardDemographicStates() {
  if (!els.wizardDemoStateSelect) {
    return;
  }
  const prior = els.wizardDemoStateSelect.value;
  els.wizardDemoStateSelect.innerHTML = '<option value=\"\">Select state/province</option>';
  state.availableStates.forEach((row) => {
    const option = document.createElement('option');
    option.value = String(row.state_id);
    option.textContent = `${row.state_abbrev} - ${row.state_name}`;
    els.wizardDemoStateSelect.appendChild(option);
  });
  if (prior && [...els.wizardDemoStateSelect.options].some((option) => option.value === prior)) {
    els.wizardDemoStateSelect.value = prior;
  }
}

async function loadWizardDemographicCountiesForState(stateId, preferredCountyId = null) {
  if (!els.wizardDemoCountySelect) {
    return;
  }
  els.wizardDemoCountySelect.innerHTML = '<option value=\"\">Select county/bank</option>';
  els.wizardDemoCountySelect.disabled = true;
  if (!stateId) {
    return;
  }
  try {
    const data = await api(`/api/counties?stateId=${stateId}`);
    (data.counties || []).forEach((county) => {
      const option = document.createElement('option');
      option.value = String(county.county_id);
      option.textContent = county.county_name;
      els.wizardDemoCountySelect.appendChild(option);
    });
    els.wizardDemoCountySelect.disabled = false;
    if (
      preferredCountyId !== null &&
      preferredCountyId !== undefined &&
      [...els.wizardDemoCountySelect.options].some((opt) => opt.value === String(preferredCountyId))
    ) {
      els.wizardDemoCountySelect.value = String(preferredCountyId);
    }
  } catch {
    els.wizardDemoCountySelect.innerHTML = '<option value=\"\">Unable to load counties</option>';
    els.wizardDemoCountySelect.disabled = true;
  }
}

async function createWizardCase() {
  if (!state.readiness?.core?.appDbReady) {
    setWizardMeta(els.wizardIntakeMeta, 'Blocked: app database is not ready.');
    return;
  }
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
  const data = await api('/api/cases', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'New',
      lastName: `Case${stamp}`,
      countryName: 'USA',
      laborMarketAreaLabel: 'Labor Market Area',
      active: 1
    })
  });
  const caseId = data.case?.user_id || null;
  await loadCases(caseId);
  await loadWizardCaseDetail(caseId);
  setWizardMeta(els.wizardIntakeMeta, `Created case #${caseId}. Complete intake fields and save.`);
  goToWizardStep('intake');
}

function ensureWizardCaseSelected() {
  if (!state.selectedCaseId) {
    throw new Error('Select a case first from Welcome Cases.');
  }
}

async function saveWizardIntake() {
  ensureWizardCaseSelected();
  const payload = {
    firstName: els.wizardFirstNameInput.value.trim(),
    lastName: els.wizardLastNameInput.value.trim(),
    addressLine1: els.wizardAddress1Input.value.trim() || null,
    city: els.wizardCityInput.value.trim() || null,
    postalCode: els.wizardPostalInput.value.trim() || null,
    countryName: els.wizardCountryInput.value.trim() || 'USA',
    demographicStateId: els.wizardDemoStateSelect.value ? Number.parseInt(els.wizardDemoStateSelect.value, 10) : null,
    demographicCountyId: els.wizardDemoCountySelect.value ? Number.parseInt(els.wizardDemoCountySelect.value, 10) : null,
    caseReference: els.wizardCaseRefInput.value.trim() || null,
    caseName: els.wizardCaseNameInput.value.trim() || null,
    reasonForReferral: els.wizardReasonInput.value.trim() || null
  };
  const data = await api(`/api/cases/${state.selectedCaseId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  const caseRow = data.case;
  const index = state.cases.findIndex((row) => row.user_id === caseRow.user_id);
  if (index >= 0) {
    state.cases[index] = caseRow;
  }
  setWizardMeta(els.wizardIntakeMeta, 'Intake saved.');
  renderWizardCaseList();
  renderWizardRail();
}

async function loadWizardWorkHistory() {
  if (!state.selectedCaseId) {
    state.wizardWorkHistory = [];
    renderWizardWorkHistoryList();
    return;
  }
  const data = await api(`/api/cases/${state.selectedCaseId}/work-history-dots`);
  state.wizardWorkHistory = data.rows || [];
  renderWizardWorkHistoryList();
}

function renderWizardWorkHistoryList() {
  if (!els.wizardWorkHistoryList) {
    return;
  }
  if (!state.selectedCaseId) {
    ensureDashboardListEmpty(els.wizardWorkHistoryList, 'Select a case first.');
    renderWizardRail();
    return;
  }
  if (!state.wizardWorkHistory.length) {
    ensureDashboardListEmpty(els.wizardWorkHistoryList, 'No DOTs selected yet.');
    renderWizardRail();
    return;
  }
  els.wizardWorkHistoryList.innerHTML = '';
  state.wizardWorkHistory.forEach((row, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'dashboard-item';
    wrapper.innerHTML = `<div class=\"dashboard-item-head\"><strong>${escapeHtml(row.dot_code)} - ${escapeHtml(
      row.title || row.title_snapshot || 'Untitled'
    )}</strong><span class=\"dashboard-item-meta\">#${index + 1}</span></div>`;
    const actions = document.createElement('div');
    actions.className = 'wizard-mini-actions';
    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'wizard-mini-btn';
    upBtn.textContent = 'Up';
    upBtn.disabled = index === 0;
    upBtn.addEventListener('click', async () => {
      const dots = state.wizardWorkHistory.map((item) => item.dot_code);
      [dots[index - 1], dots[index]] = [dots[index], dots[index - 1]];
      await replaceWizardWorkHistoryDots(dots);
    });
    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'wizard-mini-btn';
    downBtn.textContent = 'Down';
    downBtn.disabled = index === state.wizardWorkHistory.length - 1;
    downBtn.addEventListener('click', async () => {
      const dots = state.wizardWorkHistory.map((item) => item.dot_code);
      [dots[index + 1], dots[index]] = [dots[index], dots[index + 1]];
      await replaceWizardWorkHistoryDots(dots);
    });
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'wizard-mini-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', async () => {
      await api(`/api/cases/${state.selectedCaseId}/work-history-dots/${row.dot_code}`, { method: 'DELETE' });
      await loadWizardWorkHistory();
      await loadCases(state.selectedCaseId);
      setWizardMeta(els.wizardWorkHistoryMeta, `Removed DOT ${row.dot_code}.`);
    });
    actions.append(upBtn, downBtn, removeBtn);
    wrapper.appendChild(actions);
    els.wizardWorkHistoryList.appendChild(wrapper);
  });
  renderWizardRail();
}

async function replaceWizardWorkHistoryDots(dotCodes) {
  await api(`/api/cases/${state.selectedCaseId}/work-history-dots`, {
    method: 'PUT',
    body: JSON.stringify({
      sourceDots: dotCodes.map((dotCode) => ({ dotCode }))
    })
  });
  await loadWizardWorkHistory();
  await loadCases(state.selectedCaseId);
  setWizardMeta(els.wizardWorkHistoryMeta, 'Work history order updated.');
}

async function addWizardWorkHistoryDot(dotCode) {
  ensureWizardCaseSelected();
  await api(`/api/cases/${state.selectedCaseId}/work-history-dots`, {
    method: 'POST',
    body: JSON.stringify({ dotCode })
  });
  await loadWizardWorkHistory();
  await loadCases(state.selectedCaseId);
  setWizardMeta(els.wizardWorkHistoryMeta, `Added DOT ${dotCode}.`);
}

async function searchWizardWorkHistoryDots() {
  ensureWizardCaseSelected();
  const q = els.wizardWorkHistorySearchInput.value.trim();
  const query = new URLSearchParams();
  query.set('limit', '40');
  if (q) {
    query.set('q', q);
  }
  const data = await api(`/api/jobs/search?${query.toString()}`);
  const jobs = data.jobs || [];
  if (!jobs.length) {
    ensureDashboardListEmpty(els.wizardWorkHistorySearchResults, 'No DOTs found for this search.');
    return;
  }
  els.wizardWorkHistorySearchResults.innerHTML = '';
  jobs.forEach((job) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'dashboard-item';
    wrapper.innerHTML = `<div class=\"dashboard-item-head\"><strong>${escapeHtml(job.dot_code)} - ${escapeHtml(job.title)}</strong><span class=\"dashboard-item-meta\">VQ ${fmtDecimal(job.vq)} | SVP ${fmtNumber(job.svp)}</span></div>`;
    const actions = document.createElement('div');
    actions.className = 'dashboard-item-actions';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'dashboard-mini-btn';
    addBtn.textContent = 'Add DOT';
    addBtn.addEventListener('click', async () => {
      try {
        await addWizardWorkHistoryDot(job.dot_code);
      } catch (error) {
        setWizardMeta(els.wizardWorkHistoryMeta, error.message);
      }
    });
    actions.appendChild(addBtn);
    wrapper.appendChild(actions);
    els.wizardWorkHistorySearchResults.appendChild(wrapper);
  });
}

function getTraitIndicesByGroup(group) {
  return state.traits
    .map((_, index) => index)
    .filter((index) => group === 'all' || getTraitGroupKey(index) === group);
}

function getTraitGroupKey(index) {
  if (index <= 2) {
    return 'ged';
  }
  if (index <= 10) {
    return 'apt';
  }
  if (index <= 16) {
    return 'pd';
  }
  return 'ec';
}

function getTraitGroupLabel(group) {
  if (group === 'ged') {
    return 'GED';
  }
  if (group === 'apt') {
    return 'Aptitudes';
  }
  if (group === 'pd') {
    return 'Physical';
  }
  if (group === 'ec') {
    return 'Environmental';
  }
  return 'All';
}

function getProfileDisplayLabel(profileKey) {
  if (profileKey === 'profile1') {
    return 'Profile 1 (Work History Baseline)';
  }
  if (profileKey === 'profile2') {
    return 'Profile 2 (Evaluative)';
  }
  if (profileKey === 'profile3') {
    return 'Profile 3 (Pre-Injury Composite)';
  }
  if (profileKey === 'profile4') {
    return 'Profile 4 (Post-Injury Residual)';
  }
  return profileKey;
}

function cloneWizardProfileVectors(profiles) {
  if (!profiles) {
    return null;
  }
  return {
    profile1: Array.isArray(profiles.profile1) ? [...profiles.profile1] : [],
    profile2: Array.isArray(profiles.profile2) ? [...profiles.profile2] : [],
    profile3: Array.isArray(profiles.profile3) ? [...profiles.profile3] : [],
    profile4: Array.isArray(profiles.profile4) ? [...profiles.profile4] : []
  };
}

function getWizardAdjustmentChangeCount(profiles, baseline) {
  if (!profiles || !baseline) {
    return 0;
  }
  let changed = 0;
  const keys = ['profile1', 'profile2', 'profile3', 'profile4'];
  state.traits.forEach((_, index) => {
    const hasChanged = keys.some((key) => Number(profiles[key]?.[index]) !== Number(baseline[key]?.[index]));
    if (hasChanged) {
      changed += 1;
    }
  });
  return changed;
}

function setWizardAdjustmentFocus(profileKey, { render = true } = {}) {
  const allowed = ['profile1', 'profile2', 'profile3', 'profile4'];
  let next = allowed.includes(profileKey) ? profileKey : 'profile2';
  const strictMode = state.wizardProfileMode !== 'clinical_override';
  if (strictMode && (next === 'profile1' || next === 'profile3')) {
    next = 'profile2';
  }
  state.wizardAdjustmentFocus = next;
  if (els.wizardAdjustTargetSelect) {
    els.wizardAdjustTargetSelect.value = next;
  }
  if (render && state.wizardProfiles) {
    renderWizardProfiles();
  }
}

function renderWizardAdjustmentWorkflow(profiles) {
  if (!els.wizardAdjustmentWorkflow) {
    return;
  }
  if (!state.selectedCaseId || !profiles) {
    els.wizardAdjustmentWorkflow.innerHTML = '<div class="empty">Load case work history to initialize the 4-profile workflow.</div>';
    return;
  }
  const changedTraits = getWizardAdjustmentChangeCount(profiles, state.wizardProfilesBaseline);
  const hasAnalysis = Array.isArray(state.wizardAnalysis?.results) && state.wizardAnalysis.results.length > 0;
  const hasReport = !!state.wizardReportHtml || !!state.report;
  const hasAdjustments = changedTraits > 0;
  const steps = [
    {
      id: 'client_profiles',
      title: '1. Client Worker Trait Profiles',
      status: 'done',
      detail: 'Review derived baseline profile values.',
      action: 'focus_p2',
      actionLabel: 'Focus P2'
    },
    {
      id: 'graph_profiles',
      title: '2. Graph Profiles',
      status: 'done',
      detail: 'Compare all 4 profiles across trait rows.',
      action: 'focus_p4',
      actionLabel: 'Focus P4'
    },
    {
      id: 'disability_adjustments',
      title: '3. Disability Adjustments',
      status: hasAdjustments ? 'done' : 'in-progress',
      detail: hasAdjustments
        ? `${changedTraits} trait row(s) adjusted from baseline.`
        : 'Apply clinical adjustments to Profile 2 and/or Profile 4.',
      action: 'focus_p4',
      actionLabel: 'Adjust'
    },
    {
      id: 'transferable_skills',
      title: '4. Transferable Skills',
      status: hasAnalysis ? 'done' : hasAdjustments ? 'in-progress' : 'pending',
      detail: hasAnalysis ? 'Analysis is available.' : 'Run TSA after profile adjustments.',
      action: 'goto_analysis',
      actionLabel: 'Go to Analysis'
    },
    {
      id: 'complete_report',
      title: '5. Complete Report',
      status: hasReport ? 'done' : hasAnalysis ? 'in-progress' : 'pending',
      detail: hasReport ? 'Report preview generated.' : 'Generate and save the report.',
      action: 'goto_report',
      actionLabel: 'Go to Report'
    }
  ];

  const statusLabel = {
    done: 'Done',
    'in-progress': 'In progress',
    pending: 'Pending'
  };
  els.wizardAdjustmentWorkflow.innerHTML = steps
    .map(
      (step) => `
      <div class="wizard-adjust-card ${step.status}">
        <h4>${escapeHtml(step.title)}</h4>
        <div class="wizard-adjust-status">${escapeHtml(statusLabel[step.status] || 'Pending')}</div>
        <div class="dashboard-meta">${escapeHtml(step.detail)}</div>
        <button type="button" class="wizard-adjust-btn" data-adjust-action="${escapeHtml(step.action)}">${escapeHtml(step.actionLabel)}</button>
      </div>
    `
    )
    .join('');

  els.wizardAdjustmentWorkflow.querySelectorAll('button[data-adjust-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.adjustAction || '';
      if (action === 'focus_p2') {
        setWizardAdjustmentFocus('profile2');
        return;
      }
      if (action === 'focus_p4') {
        setWizardAdjustmentFocus('profile4');
        return;
      }
      if (action === 'goto_analysis') {
        goWizardStep('analysis');
        return;
      }
      if (action === 'goto_report') {
        goWizardStep('report');
      }
    });
  });
}

function clampProfileTrait(index, value) {
  const trait = state.traits[index];
  if (!trait) {
    return Number(value) || 0;
  }
  return Math.min(trait.max, Math.max(trait.min, Number(value)));
}

function applyWizardProfileRules(profiles) {
  if (!profiles) {
    return;
  }
  const strictMode = state.wizardProfileMode !== 'clinical_override';
  if (strictMode) {
    const derivedP1 = Array.isArray(profiles.derived?.profile1) ? profiles.derived.profile1 : profiles.profile1;
    profiles.profile1 = derivedP1.map((value, index) => clampProfileTrait(index, value));
    profiles.profile3 = profiles.profile1.map((value, index) =>
      clampProfileTrait(index, Math.max(Number(value), Number(profiles.profile2[index])))
    );
  } else {
    profiles.profile1 = profiles.profile1.map((value, index) => clampProfileTrait(index, value));
    profiles.profile3 = profiles.profile3.map((value, index) => clampProfileTrait(index, value));
  }
  profiles.profile2 = profiles.profile2.map((value, index) => clampProfileTrait(index, value));
  profiles.profile4 = profiles.profile4.map((value, index) => clampProfileTrait(index, value));

  if (state.wizardResidualCap) {
    profiles.profile4 = profiles.profile4.map((value, index) =>
      Math.min(Number(value), Number(profiles.profile3[index]))
    );
  }
}

function renderWizardMethodologyHelp(profiles) {
  if (!els.wizardProfileMethodMeta) {
    return;
  }
  if (!profiles) {
    els.wizardProfileMethodMeta.textContent = '';
    if (els.wizardProfileFocusMeta) {
      els.wizardProfileFocusMeta.textContent = '';
    }
    renderWizardAdjustmentWorkflow(null);
    return;
  }
  const modeLabel =
    state.wizardProfileMode === 'clinical_override'
      ? 'Clinical Override: all 4 profiles are editable.'
      : 'Strict Derived: Profile 1 = work-history baseline, Profile 3 = max(Profile1, Profile2).';
  const residualLabel = state.wizardResidualCap
    ? 'Residual guardrail ON: Profile 4 cannot exceed Profile 3.'
    : 'Residual guardrail OFF: Profile 4 may exceed Profile 3 by clinical judgment.';
  const changedTraits = getWizardAdjustmentChangeCount(profiles, state.wizardProfilesBaseline);
  els.wizardProfileMethodMeta.textContent = `${modeLabel} ${residualLabel} Adjusted trait rows: ${changedTraits}.`;
  if (els.wizardProfileFocusMeta) {
    const focusLabel = getProfileDisplayLabel(state.wizardAdjustmentFocus);
    const focusHelp =
      state.wizardAdjustmentFocus === 'profile2'
        ? 'Use this for clinical capability judgment before pre-profile recompute.'
        : state.wizardAdjustmentFocus === 'profile4'
          ? 'Use this for residual/post-injury restrictions used in TSA.'
          : 'This profile is usually derived automatically.';
    els.wizardProfileFocusMeta.textContent = `Current focus: ${focusLabel}. ${focusHelp}`;
  }
  renderWizardAdjustmentWorkflow(profiles);
}

async function loadWizardProfiles(options = {}) {
  if (!state.selectedCaseId || !readinessIsPass()) {
    state.wizardProfiles = null;
    state.wizardProfilesBaseline = null;
    renderWizardProfiles();
    return;
  }
  const query = new URLSearchParams();
  if (Object.hasOwn(options, 'clinicalOverrideMode') && options.clinicalOverrideMode !== null) {
    query.set('clinicalOverrideMode', options.clinicalOverrideMode ? '1' : '0');
  }
  if (Object.hasOwn(options, 'enforceResidualCap') && options.enforceResidualCap !== null) {
    query.set('enforceResidualCap', options.enforceResidualCap ? '1' : '0');
  }
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const data = await api(`/api/cases/${state.selectedCaseId}/profiles${suffix}`);
  state.wizardProfiles = data.profiles || null;
  state.wizardProfileMode = state.wizardProfiles?.methodology?.mode || 'strict_derived';
  state.wizardResidualCap = state.wizardProfiles?.methodology?.enforce_residual_cap !== false;
  if (!state.wizardAdjustmentFocus) {
    state.wizardAdjustmentFocus = 'profile2';
  }
  applyWizardProfileRules(state.wizardProfiles);
  state.wizardProfilesBaseline = cloneWizardProfileVectors(state.wizardProfiles);
  renderWizardProfiles();
}

function renderWizardProfiles() {
  if (!els.wizardProfilesGrid) {
    return;
  }
  if (!state.selectedCaseId) {
    ensureDashboardListEmpty(els.wizardProfilesGrid, 'Select a case first.');
    renderWizardRail();
    return;
  }
  const profiles = state.wizardProfiles;
  if (!profiles) {
    ensureDashboardListEmpty(els.wizardProfilesGrid, 'Load work history DOTs first to derive profiles.');
    renderWizardMethodologyHelp(null);
    renderWizardRail();
    return;
  }

  applyWizardProfileRules(profiles);
  const strictMode = state.wizardProfileMode !== 'clinical_override';
  if (strictMode && (state.wizardAdjustmentFocus === 'profile1' || state.wizardAdjustmentFocus === 'profile3')) {
    state.wizardAdjustmentFocus = 'profile2';
  }
  if (els.wizardAdjustTargetSelect) {
    [...els.wizardAdjustTargetSelect.options].forEach((option) => {
      if (option.value === 'profile1' || option.value === 'profile3') {
        option.disabled = strictMode;
      }
    });
  }
  if (els.wizardProfileModeSelect) {
    els.wizardProfileModeSelect.value = state.wizardProfileMode;
  }
  if (els.wizardResidualCapSelect) {
    els.wizardResidualCapSelect.value = state.wizardResidualCap ? '1' : '0';
  }
  if (els.wizardTraitGroupFilterSelect) {
    els.wizardTraitGroupFilterSelect.value = state.wizardTraitGroupFilter || 'all';
  }
  setWizardAdjustmentFocus(state.wizardAdjustmentFocus || 'profile2', { render: false });
  renderWizardMethodologyHelp(profiles);
  const focusProfile = state.wizardAdjustmentFocus || 'profile2';
  const filterGroup = state.wizardTraitGroupFilter || 'all';
  const traitIndices = getTraitIndicesByGroup(filterGroup);
  const rows = traitIndices
    .map((index) => {
      const trait = state.traits[index];
      const optionList = [];
      for (let value = trait.min; value <= trait.max; value += 1) {
        optionList.push(`<option value=\"${value}\">${value}</option>`);
      }
      const p1Class = focusProfile === 'profile1' ? 'focus-col' : '';
      const p2Class = focusProfile === 'profile2' ? 'focus-col' : '';
      const p3Class = focusProfile === 'profile3' ? 'focus-col' : '';
      const p4Class = focusProfile === 'profile4' ? 'focus-col' : '';
      return `
        <tr>
          <td>${escapeHtml(trait.code)}</td>
          <td class="trait-group">${escapeHtml(getTraitGroupLabel(getTraitGroupKey(index)))}</td>
          <td>${escapeHtml(trait.label)}</td>
          <td class="${p1Class}"><select data-wizard-profile="profile1" data-trait-index="${index}" ${strictMode ? 'disabled' : ''}>${optionList.join('')}</select></td>
          <td class="${p2Class}"><select data-wizard-profile="profile2" data-trait-index="${index}">${optionList.join('')}</select></td>
          <td class="${p3Class}"><select data-wizard-profile="profile3" data-trait-index="${index}" ${strictMode ? 'disabled' : ''}>${optionList.join('')}</select></td>
          <td class="${p4Class}"><select data-wizard-profile="profile4" data-trait-index="${index}">${optionList.join('')}</select></td>
        </tr>
      `;
    })
    .join('');

  els.wizardProfilesGrid.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Trait</th>
          <th>Group</th>
          <th>Label</th>
          <th class="${focusProfile === 'profile1' ? 'focus-col' : ''}">Profile 1<span class="profile-head">Work History Baseline (derived)</span></th>
          <th class="${focusProfile === 'profile2' ? 'focus-col' : ''}">Profile 2<span class="profile-head">Evaluative Clinical Input</span></th>
          <th class="${focusProfile === 'profile3' ? 'focus-col' : ''}">Profile 3<span class="profile-head">Pre-Injury Composite (derived)</span></th>
          <th class="${focusProfile === 'profile4' ? 'focus-col' : ''}">Profile 4<span class="profile-head">Post-Injury Residual (editable)</span></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="dashboard-meta wizard-profile-hint">Showing ${fmtNumber(traitIndices.length)} of ${fmtNumber(
      state.traits.length
    )} traits (${escapeHtml(getTraitGroupLabel(filterGroup))} view).</p>
    <p class=\"dashboard-meta\">Legacy VQ: P1 ${fmtDecimal(profiles.vq_estimates?.profile1_vq_est)} | P2 ${fmtDecimal(
      profiles.vq_estimates?.profile2_vq_est
    )} | P3 ${fmtDecimal(profiles.vq_estimates?.profile3_vq_est)} | P4 ${fmtDecimal(
      profiles.vq_estimates?.profile4_vq_est
    )} (legacy formula)</p>
  `;

  els.wizardProfilesGrid.querySelectorAll('select[data-wizard-profile=\"profile1\"]').forEach((select) => {
    const index = Number.parseInt(select.dataset.traitIndex, 10);
    select.value = String(profiles.profile1[index]);
    select.addEventListener('change', () => {
      profiles.profile1[index] = Number.parseInt(select.value, 10);
      applyWizardProfileRules(profiles);
      renderWizardProfiles();
    });
  });
  els.wizardProfilesGrid.querySelectorAll('select[data-wizard-profile=\"profile2\"]').forEach((select) => {
    const index = Number.parseInt(select.dataset.traitIndex, 10);
    select.value = String(profiles.profile2[index]);
    select.addEventListener('change', () => {
      profiles.profile2[index] = Number.parseInt(select.value, 10);
      applyWizardProfileRules(profiles);
      renderWizardProfiles();
    });
  });
  els.wizardProfilesGrid.querySelectorAll('select[data-wizard-profile=\"profile3\"]').forEach((select) => {
    const index = Number.parseInt(select.dataset.traitIndex, 10);
    select.value = String(profiles.profile3[index]);
    select.addEventListener('change', () => {
      profiles.profile3[index] = Number.parseInt(select.value, 10);
      applyWizardProfileRules(profiles);
      renderWizardProfiles();
    });
  });
  els.wizardProfilesGrid.querySelectorAll('select[data-wizard-profile=\"profile4\"]').forEach((select) => {
    const index = Number.parseInt(select.dataset.traitIndex, 10);
    select.value = String(profiles.profile4[index]);
    select.addEventListener('change', () => {
      profiles.profile4[index] = Number.parseInt(select.value, 10);
      applyWizardProfileRules(profiles);
      renderWizardProfiles();
    });
  });
  renderWizardRail();
}

async function saveWizardProfiles() {
  ensureWizardCaseSelected();
  if (!state.wizardProfiles) {
    throw new Error('Profiles are not loaded yet.');
  }
  const payload = {
    profile1: state.wizardProfiles.profile1,
    profile2: state.wizardProfiles.profile2,
    profile3: state.wizardProfiles.profile3,
    profile4: state.wizardProfiles.profile4,
    clinicalOverrideMode: state.wizardProfileMode === 'clinical_override',
    enforceResidualCap: state.wizardResidualCap
  };
  const data = await api(`/api/cases/${state.selectedCaseId}/profiles`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  state.wizardProfiles = data.profiles || null;
  state.wizardProfileMode = state.wizardProfiles?.methodology?.mode || state.wizardProfileMode;
  state.wizardResidualCap = state.wizardProfiles?.methodology?.enforce_residual_cap !== false;
  state.wizardProfilesBaseline = cloneWizardProfileVectors(state.wizardProfiles);
  renderWizardProfiles();
  setWizardMeta(els.wizardProfilesMeta, 'Profiles saved.');
}

function applyWizardLoweringAdjustment(forcedTarget = null) {
  if (!state.wizardProfiles) {
    throw new Error('Profiles are not loaded yet.');
  }
  const target = forcedTarget || els.wizardAdjustTargetSelect?.value || state.wizardAdjustmentFocus || 'profile4';
  if (state.wizardProfileMode !== 'clinical_override' && (target === 'profile1' || target === 'profile3')) {
    throw new Error('Switch methodology mode to Clinical Override to adjust Profile 1 or Profile 3.');
  }
  setWizardAdjustmentFocus(target, { render: false });
  const decrement = Number.parseInt(els.wizardAdjustBySelect?.value || '1', 10);
  const group = els.wizardAdjustGroupSelect?.value || 'all';
  const indices = getTraitIndicesByGroup(group);
  if (!Array.isArray(state.wizardProfiles[target])) {
    throw new Error('Invalid profile target selected.');
  }
  indices.forEach((index) => {
    const currentValue = Number(state.wizardProfiles[target][index]);
    const lowered = currentValue - decrement;
    state.wizardProfiles[target][index] = clampProfileTrait(index, lowered);
  });
  applyWizardProfileRules(state.wizardProfiles);
  renderWizardProfiles();
  const groupLabel = group === 'all' ? 'all traits' : getTraitGroupLabel(group);
  setWizardMeta(
    els.wizardProfilesMeta,
    `Lowered ${getProfileDisplayLabel(target)} by ${decrement} level(s) across ${groupLabel}.`
  );
}

function copyWizardProfile3To4() {
  if (!state.wizardProfiles) {
    throw new Error('Profiles are not loaded yet.');
  }
  state.wizardProfiles.profile4 = state.wizardProfiles.profile3.map((value, index) =>
    clampProfileTrait(index, Number(value))
  );
  setWizardAdjustmentFocus('profile4', { render: false });
  applyWizardProfileRules(state.wizardProfiles);
  renderWizardProfiles();
  setWizardMeta(els.wizardProfilesMeta, 'Copied Profile 3 values to Profile 4 residual profile.');
}

async function resetWizardProfilesToDerived() {
  ensureWizardCaseSelected();
  state.wizardProfileMode = 'strict_derived';
  state.wizardResidualCap = true;
  state.wizardTraitGroupFilter = 'all';
  state.wizardAdjustmentFocus = 'profile2';
  await loadWizardProfiles({
    clinicalOverrideMode: false,
    enforceResidualCap: true
  });
  setWizardMeta(els.wizardProfilesMeta, 'Reset to strict-derived methodology and refreshed profiles.');
}

function renderWizardAnalysis() {
  if (!els.wizardAnalysisResults || !els.wizardAnalysisSummary) {
    return;
  }
  if (!state.wizardAnalysis) {
    ensureDashboardListEmpty(els.wizardAnalysisResults, 'Run analysis to view results.');
    els.wizardAnalysisSummary.innerHTML = '<div class=\"empty\">No analysis run yet.</div>';
    renderWizardRail();
    return;
  }
  const summary = state.wizardAnalysis.report4_summary || {};
  const pre = summary.pre || {};
  const post = summary.post || {};
  const preDiag = pre.diagnostics || {};
  const postDiag = post.diagnostics || {};
  els.wizardAnalysisSummary.innerHTML = `
    <div class=\"detail-card\">
      <h3>Report 4 Summary</h3>
      <p><strong>Pre jobs:</strong> ${fmtNumber(pre.total_jobs)} | <strong>Post jobs:</strong> ${fmtNumber(post.total_jobs)}</p>
      <p><strong>Residual availability:</strong> ${fmtNumber(summary.residual_percent)}%</p>
      <p><strong>Average TS pre/post:</strong> ${fmtDecimal(pre.avg_tsp_percent)}% / ${fmtDecimal(post.avg_tsp_percent)}%</p>
      <p><strong>Candidates evaluated (pre/post):</strong> ${fmtNumber(preDiag.candidate_count)} / ${fmtNumber(
    postDiag.candidate_count
  )}</p>
      <p><strong>Physical gate exclusions (pre/post):</strong> ${fmtNumber(
    preDiag.physical_gate_excluded_count
  )} / ${fmtNumber(postDiag.physical_gate_excluded_count)}</p>
      <p><strong>Methodology mode:</strong> ${escapeHtml(state.wizardProfileMode === 'clinical_override' ? 'Clinical Override' : 'Strict Derived')}</p>
    </div>
  `;
  const rows = state.wizardAnalysis.results || [];
  if (!rows.length) {
    ensureDashboardListEmpty(els.wizardAnalysisResults, 'Analysis ran but returned no result rows.');
  } else {
    els.wizardAnalysisResults.innerHTML = '';
    rows.slice(0, 25).forEach((row, index) => {
      const item = document.createElement('div');
      item.className = 'dashboard-item';
      const targetP = formatPhysicalDemandLevel(
        row.physical_demand_target_level ?? row.strength_target_level ?? parseStrengthLevelFromTraitVector(row.trait_vector)
      );
      const profileP = formatPhysicalDemandLevel(row.physical_demand_profile_level ?? row.strength_profile_level);
      const physicalGate = Number(row.physical_demand_gate_failed) === 1 ? 'Fail' : 'Pass';
      item.innerHTML = `<div class=\"dashboard-item-head\"><strong>#${index + 1} ${escapeHtml(row.dot_code)} - ${escapeHtml(
        row.title || 'Untitled'
      )}</strong><span class=\"dashboard-item-meta\">TS ${fmtDecimal(row.tsp_percent)}% | VA ${fmtDecimal(
        row.va_adjustment_percent
      )}% | Level ${fmtNumber(row.tsp_level)} | P ${escapeHtml(targetP)} | Profile P ${escapeHtml(
        profileP
      )} | Physical Gate ${escapeHtml(physicalGate)}</span></div>`;
      els.wizardAnalysisResults.appendChild(item);
    });
  }
  renderWizardRail();
}

async function runWizardAnalysis() {
  ensureWizardCaseSelected();
  const data = await api(`/api/cases/${state.selectedCaseId}/analysis/transferable`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  state.wizardAnalysis = data;
  setWizardMeta(
    els.wizardAnalysisMeta,
    `Analysis complete. ${Number(data.total || 0).toLocaleString()} rows available.`
  );
  renderWizardAnalysis();
}

function getWizardReportPayload() {
  ensureWizardCaseSelected();
  const caseRow = selectedCase();
  if (!caseRow) {
    throw new Error('Case not loaded.');
  }
  const sourceDots = state.wizardWorkHistory.map((row) => row.dot_code);
  if (!sourceDots.length) {
    throw new Error('Add work-history DOTs before generating report.');
  }
  const profile4 = state.wizardProfiles?.profile4;
  if (!Array.isArray(profile4) || profile4.length !== state.traits.length) {
    throw new Error('Load and save profiles before generating report.');
  }
  return {
    userId: state.selectedCaseId,
    q: '',
    stateId: caseRow.demographic_state_id ?? null,
    countyId: caseRow.demographic_county_id ?? null,
    profile: profile4,
    sourceDots,
    selectedDot: state.wizardAnalysis?.results?.[0]?.dot_code || sourceDots[0],
    limit: 86,
    taskLimit: 30
  };
}

function renderCanonicalHtml(element, html) {
  if (!element) {
    return;
  }
  if (!html) {
    element.innerHTML = '<div class=\"empty\">No report preview available.</div>';
    return;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headStyles = [...doc.head.querySelectorAll('style, link[rel="stylesheet"]')]
    .map((node) => node.outerHTML)
    .join('');
  element.innerHTML = `<div class=\"canonical-report\">${headStyles}${doc.body.innerHTML}</div>`;
}

function renderWizardAiNarrative() {
  if (!els.wizardAiNarrative) {
    return;
  }
  if (!state.wizardAiNarrative) {
    const statusLine =
      state.aiStatus && state.aiStatus.enabled === false
        ? escapeHtml(state.aiStatus.message || 'AI narrative is not configured.')
        : 'Generate AI Narrative after saving a report.';
    els.wizardAiNarrative.innerHTML = `<div class=\"empty\">${statusLine}</div>`;
    return;
  }
  els.wizardAiNarrative.innerHTML = `
    <div class=\"detail-card\">
      <h3>AI Narrative Draft</h3>
      <pre class=\"ai-narrative-pre\">${escapeHtml(state.wizardAiNarrative)}</pre>
    </div>
  `;
}

async function generateWizardReport() {
  const payload = getWizardReportPayload();
  const data = await api('/api/reports/transferable-skills', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  state.wizardReportPayload = payload;
  state.report = data.report;
  state.reportHtml = data.render_html || null;
  state.wizardReportHtml = data.render_html || null;
  state.wizardAiNarrative = null;
  renderCanonicalHtml(els.wizardReportPreview, state.wizardReportHtml);
  renderWizardAiNarrative();
  setWizardMeta(els.wizardReportMeta, `Report generated. HTML hash ${String(data.render_html_hash_sha256 || '').slice(0, 12)}...`);
  renderWizardRail();
}

async function saveWizardReport() {
  const payload = state.wizardReportPayload || getWizardReportPayload();
  const data = await api('/api/reports/transferable-skills/save', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      label: `Case ${state.selectedCaseId} TSA`
    })
  });
  state.wizardLastSavedReportId = data.saved_report?.saved_report_id || null;
  state.lastCasePacketSavedReportId = state.wizardLastSavedReportId;
  if (state.selectedCaseId) {
    await loadSavedReports();
  }
  setWizardMeta(els.wizardReportMeta, `Saved report #${state.wizardLastSavedReportId}.`);
  renderWizardRail();
}

async function ensureWizardSavedReportId() {
  if (state.wizardLastSavedReportId) {
    return state.wizardLastSavedReportId;
  }
  if (Array.isArray(state.savedReports) && state.savedReports.length) {
    state.wizardLastSavedReportId = state.savedReports[0].saved_report_id;
    return state.wizardLastSavedReportId;
  }
  if (state.report) {
    await saveWizardReport();
    if (state.wizardLastSavedReportId) {
      return state.wizardLastSavedReportId;
    }
  }
  throw new Error('Generate and save a report first.');
}

async function exportWizardJson() {
  const savedReportId = await ensureWizardSavedReportId();
  await fetchAndDownloadFile(
    `/api/reports/saved/${savedReportId}/export/json`,
    `mvqs-report-${savedReportId}.json`
  );
  setWizardMeta(els.wizardReportMeta, `JSON downloaded for report #${savedReportId}.`);
}

async function exportWizardMarkdown() {
  const savedReportId = await ensureWizardSavedReportId();
  await fetchAndDownloadFile(
    `/api/reports/saved/${savedReportId}/export/markdown`,
    `mvqs-report-${savedReportId}.md`
  );
  setWizardMeta(els.wizardReportMeta, `Markdown downloaded for report #${savedReportId}.`);
}

async function exportWizardHtml() {
  const savedReportId = await ensureWizardSavedReportId();
  await fetchAndDownloadFile(
    `/api/reports/saved/${savedReportId}/export/html`,
    `mvqs-report-${savedReportId}.html`
  );
  setWizardMeta(els.wizardReportMeta, `HTML downloaded for report #${savedReportId}.`);
}

async function exportWizardCasePacket() {
  const savedReportId = await ensureWizardSavedReportId();
  await fetchAndDownloadFile(
    `/api/reports/saved/${savedReportId}/export/case-packet`,
    `mvqs-case-packet-${savedReportId}.zip`
  );
  setWizardMeta(els.wizardReportMeta, `Case packet downloaded for report #${savedReportId}.`);
  renderWizardRail();
}

async function exportWizardPdf() {
  const savedReportId = await ensureWizardSavedReportId();
  await fetchAndDownloadFile(
    `/api/reports/saved/${savedReportId}/export/pdf`,
    `mvqs-report-${savedReportId}.pdf`
  );
  setWizardMeta(els.wizardReportMeta, `PDF downloaded for report #${savedReportId}.`);
}

async function generateWizardAiNarrative() {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    throw new Error(`Blocked: ${blockedMessage}`);
  }
  if (state.aiStatus && state.aiStatus.enabled === false) {
    throw new Error(state.aiStatus.message || 'AI narrative is not configured.');
  }
  const savedReportId = await ensureWizardSavedReportId();
  const data = await api('/api/ai/reports/narrative', {
    method: 'POST',
    body: JSON.stringify({
      savedReportId,
      maxMatches: 25
    })
  });
  state.wizardAiNarrative = String(data.narrative_markdown || '').trim() || null;
  renderWizardAiNarrative();
  setWizardMeta(
    els.wizardReportMeta,
    state.wizardAiNarrative
      ? `AI narrative generated for report #${savedReportId} using ${data.model || 'configured model'}.`
      : 'AI narrative returned no content.'
  );
}

function readinessIsPass() {
  return state.readiness?.overall_status === 'pass';
}

function getPrimaryReadinessFailureMessage() {
  const checks = Array.isArray(state.readiness?.checks) ? state.readiness.checks : [];
  const failed = checks.find((row) => row?.severity === 'blocker' && row?.status === 'fail');
  if (failed?.message) {
    return failed.message;
  }
  return state.readiness ? 'Data readiness checks failed.' : 'Checking data readiness.';
}

function getReadinessRemediationCommands() {
  const commands = Array.isArray(state.readiness?.remediation) ? state.readiness.remediation : [];
  return commands.filter((row) => typeof row === 'string' && row.trim());
}

function getReadinessSnapshotText() {
  const metadata = state.readiness?.core?.metadata || {};
  const builtAt = metadata.built_at_utc ? new Date(metadata.built_at_utc).toLocaleString() : 'n/a';
  const sourceMode = metadata.source_mode || 'n/a';
  const sourcePath = metadata.source_main_path || 'n/a';
  const counts = state.readiness?.core?.counts || {};
  const jobs = Number.isFinite(Number(counts.jobs)) ? Number(counts.jobs).toLocaleString() : 'n/a';
  const tasks = Number.isFinite(Number(counts.job_tasks)) ? Number(counts.job_tasks).toLocaleString() : 'n/a';
  const states = Number.isFinite(Number(counts.states)) ? Number(counts.states).toLocaleString() : 'n/a';
  const counties = Number.isFinite(Number(counts.counties)) ? Number(counts.counties).toLocaleString() : 'n/a';
  return `Built: ${builtAt} | Source: ${sourceMode} | Path: ${sourcePath} | Jobs: ${jobs} | Tasks: ${tasks} | States: ${states} | Counties: ${counties}`;
}

function setElementBlocked(element, blocked, reason = '') {
  if (!element) {
    return;
  }
  element.disabled = blocked;
  if (blocked && reason) {
    element.title = reason;
  } else {
    element.removeAttribute('title');
  }
}

function buildBlockingState() {
  const readinessKnown = state.readiness !== null;
  const readinessPass = readinessIsPass();
  const mainBlocked = !readinessKnown || !readinessPass;
  const appDbBlocked = !state.readiness?.core?.appDbReady;
  const reason = !readinessKnown
    ? 'Checking data readiness.'
    : readinessPass
      ? ''
      : getPrimaryReadinessFailureMessage();
  return { mainBlocked, appDbBlocked, reason };
}

function getBlockingMessage(scope = 'main') {
  const blocking = buildBlockingState();
  if (scope === 'appDb') {
    return blocking.appDbBlocked ? blocking.reason : null;
  }
  return blocking.mainBlocked ? blocking.reason : null;
}

function applyGlobalBlocking() {
  const blocking = buildBlockingState();
  const aiReady = !!(state.aiStatus && state.aiStatus.enabled);
  const aiReason = blocking.mainBlocked
    ? blocking.reason
    : state.aiStatus?.message || 'AI narrative is not configured.';

  setElementBlocked(els.searchBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.matchBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.tsaBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.resetProfileBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.generateReportBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.downloadJsonBtn, blocking.mainBlocked || !state.report, blocking.reason);
  setElementBlocked(els.downloadMarkdownBtn, blocking.mainBlocked || !state.report, blocking.reason);
  setElementBlocked(els.loadMoreBtn, blocking.mainBlocked || els.loadMoreBtn.hidden, blocking.reason);
  setElementBlocked(els.saveReportForUserBtn, blocking.mainBlocked || els.saveReportForUserBtn.disabled, blocking.reason);
  setElementBlocked(
    els.exportCaseBundleBtn,
    blocking.mainBlocked || (els.exportCaseBundleBtn ? els.exportCaseBundleBtn.disabled : true),
    blocking.reason
  );
  setElementBlocked(els.wizardCreateCaseBtn, blocking.appDbBlocked, blocking.reason);
  setElementBlocked(els.wizardSaveIntakeBtn, blocking.appDbBlocked, blocking.reason);
  setElementBlocked(els.wizardWorkHistorySearchBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardSaveProfilesBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardProfileModeSelect, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardResidualCapSelect, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardTraitGroupFilterSelect, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardFocusProfile2Btn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardFocusProfile4Btn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardAdjustTargetSelect, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardAdjustBySelect, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardAdjustGroupSelect, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardApplyAdjustmentBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardLowerProfile2Btn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardLowerProfile4Btn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardCopyProfile3To4Btn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardResetToDerivedBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardRunAnalysisBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardGenerateReportBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardSaveReportBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardExportJsonBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardExportMdBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardExportHtmlBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardExportPdfBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardExportPacketBtn, blocking.mainBlocked, blocking.reason);
  setElementBlocked(els.wizardGenerateAiNarrativeBtn, blocking.mainBlocked || !aiReady, aiReason);

  const casePacketButtons = els.savedReportsList
    ? els.savedReportsList.querySelectorAll('button[data-action="case-packet"]')
    : [];
  casePacketButtons.forEach((button) => {
    setElementBlocked(button, blocking.mainBlocked, blocking.reason);
  });

  setElementBlocked(els.createUserBtn, blocking.appDbBlocked, blocking.reason);
  if (blocking.appDbBlocked) {
    setElementBlocked(els.updateUserBtn, true, blocking.reason);
    setElementBlocked(els.deleteUserBtn, true, blocking.reason);
    setElementBlocked(els.addPsychResultBtn, true, blocking.reason);
    setElementBlocked(els.refreshPsychBtn, true, blocking.reason);
    setElementBlocked(els.refreshSavedReportsBtn, true, blocking.reason);
  }

  if (blocking.mainBlocked) {
    const message = getPrimaryReadinessFailureMessage();
    setResultsMeta(`Blocked: ${message}`);
    setDetailMeta(`Blocked: ${message}`);
    setReportMeta(`Blocked: ${message}`);
    const remediation = getReadinessRemediationCommands()
      .map((command) => `<code>${escapeHtml(command)}</code>`)
      .join('');
    const notice = `
      <div class="empty">
        <strong>Data readiness is blocking search and report actions.</strong><br />
        ${escapeHtml(message)}<br /><br />
        ${remediation || ''}
      </div>
    `;
    els.resultsList.innerHTML = notice;
    els.jobDetail.innerHTML = notice;
    els.reportBody.innerHTML = notice;
    els.resultsList.dataset.blockedByReadiness = '1';
    els.jobDetail.dataset.blockedByReadiness = '1';
    els.reportBody.dataset.blockedByReadiness = '1';
  } else {
    if (els.resultsList.dataset.blockedByReadiness === '1') {
      els.resultsList.removeAttribute('data-blocked-by-readiness');
      if (!state.results.length) {
        els.resultsList.innerHTML = '<div class="empty">No results.</div>';
      }
    }
    if (els.jobDetail.dataset.blockedByReadiness === '1') {
      els.jobDetail.removeAttribute('data-blocked-by-readiness');
      if (!state.selectedDot) {
        els.jobDetail.innerHTML = '<div class="empty">Select a job to view details.</div>';
      }
    }
    if (els.reportBody.dataset.blockedByReadiness === '1') {
      els.reportBody.removeAttribute('data-blocked-by-readiness');
      if (!state.report) {
        setReportPlaceholder(
          'Run Match or Transferable Skills, select a job, then Generate Report (modern replacement for legacy JobsDOT.rtf output).'
        );
      }
    }
  }
}

function evaluateWorkflowSteps() {
  const steps = [];
  const blocking = buildBlockingState();
  const user = selectedUser();
  const hasUser = !!user;
  const demographicStateId = user?.demographic_state_id ?? null;
  const demographicCountyId = user?.demographic_county_id ?? null;
  const selectedDemographicCountyRequired =
    demographicStateId !== null && state.demographicCounties.length > 0;
  const demographicsDone = !!(
    user &&
    user.first_name &&
    user.last_name &&
    user.address_line1 &&
    user.city &&
    user.postal_code &&
    demographicStateId !== null &&
    (!selectedDemographicCountyRequired || demographicCountyId !== null)
  );
  const psychDone = hasUser && state.psychometricResults.length > 0;
  const runDone = (state.mode === 'match' || state.mode === 'tsa') && state.results.length > 0;
  const selectedJobDone = !!state.selectedDot && state.lastDetailLoadedDot === state.selectedDot;
  const reportDone = !!state.report;
  const savedReportExists = hasUser && state.savedReports.length > 0;
  const casePacketDone =
    savedReportExists &&
    state.lastCasePacketSavedReportId !== null &&
    state.savedReports.some((row) => row.saved_report_id === state.lastCasePacketSavedReportId);

  WORKFLOW_STEP_DEFS.forEach((def, index) => {
    let status = 'not_started';
    let detail = '';

    if (index > 0 && blocking.mainBlocked) {
      status = 'blocked';
      detail = getPrimaryReadinessFailureMessage();
    } else {
      switch (def.id) {
        case 'verify_data_load':
          status = readinessIsPass() ? 'done' : 'blocked';
          detail = readinessIsPass() ? 'Readiness checks passed.' : getPrimaryReadinessFailureMessage();
          break;
        case 'set_search_region':
          status = state.hasExecutedRegionRun ? 'done' : 'in_progress';
          detail = state.hasExecutedRegionRun
            ? 'Search region confirmed in at least one run.'
            : 'Set state/county filters and run Search or Match.';
          break;
        case 'create_or_select_client':
          status = hasUser ? 'done' : 'in_progress';
          detail = hasUser ? `Client selected: ${user.first_name} ${user.last_name}.` : 'Create or select an active client.';
          break;
        case 'enter_demographics':
          if (!hasUser) {
            status = 'not_started';
            detail = 'Select a client first.';
          } else {
            status = demographicsDone ? 'done' : 'in_progress';
            detail = demographicsDone
              ? 'Demographic and address fields completed.'
              : 'Complete name/address/city/postal and demographic region fields.';
          }
          break;
        case 'add_psychometrics':
          if (!hasUser) {
            status = 'not_started';
            detail = 'Select a client to add psychometric results.';
          } else {
            status = psychDone ? 'done' : 'in_progress';
            detail = psychDone
              ? `${state.psychometricResults.length.toLocaleString()} psychometric results recorded.`
              : 'Optional but recommended: add at least one psychometric result.';
          }
          break;
        case 'run_match_or_tsa':
          status = runDone ? 'done' : 'in_progress';
          detail = runDone
            ? `Results available (${state.results.length.toLocaleString()} loaded).`
            : 'Run Match or Transferable Skills to load ranked rows.';
          break;
        case 'select_target_job':
          status = selectedJobDone ? 'done' : 'in_progress';
          detail = selectedJobDone
            ? `Selected DOT ${state.selectedDot}.`
            : 'Select a job row to load detailed DOT information.';
          break;
        case 'generate_report':
          status = reportDone ? 'done' : 'in_progress';
          detail = reportDone ? 'Report generated and ready for save/export.' : 'Generate report from current selected job.';
          break;
        case 'save_export_case_packet':
          if (!savedReportExists) {
            status = 'not_started';
            detail = 'Save a report for the selected client first.';
          } else {
            status = casePacketDone ? 'done' : 'in_progress';
            detail = casePacketDone
              ? `Case packet exported for saved report #${state.lastCasePacketSavedReportId}.`
              : 'Saved report is present. Export Case Packet to complete the workflow.';
          }
          break;
        default:
          status = 'not_started';
          detail = '';
      }
    }

    steps.push({
      ...def,
      status,
      detail
    });
  });

  return steps;
}

function getCurrentWorkflowSummary(steps) {
  const blockedStep = steps.find((step) => step.status === 'blocked');
  if (blockedStep) {
    return `Current step: blocked at "${blockedStep.title}" - ${blockedStep.detail}`;
  }
  const nextStep = steps.find((step) => step.status !== 'done');
  if (nextStep) {
    return `Current step: ${nextStep.title}. ${nextStep.detail}`;
  }
  return 'Current step: workflow complete. You can continue iterating and export updated case packets.';
}

function jumpToStepTarget(targetId) {
  if (!targetId) {
    return;
  }
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderWorkflowPanel() {
  if (!els.workflowStepsList || !els.readinessBadge) {
    return;
  }

  const readinessKnown = state.readiness !== null;
  const readinessPass = readinessIsPass();
  const readinessMessage = readinessKnown
    ? readinessPass
      ? 'Data readiness checks passed.'
      : getPrimaryReadinessFailureMessage()
    : 'Validating dataset and app database...';
  els.readinessBadge.textContent = readinessKnown ? (readinessPass ? 'Pass' : 'Blocked') : 'Checking...';
  els.readinessBadge.className = `workflow-badge ${
    !readinessKnown
      ? 'workflow-badge-progress'
      : readinessPass
        ? 'workflow-badge-done'
        : 'workflow-badge-blocked'
  }`;
  els.readinessMeta.textContent = readinessMessage;
  els.readinessSnapshot.textContent = readinessKnown ? getReadinessSnapshotText() : '';
  els.readinessRemediation.innerHTML = '';
  if (!readinessPass) {
    getReadinessRemediationCommands().forEach((command) => {
      const code = document.createElement('code');
      code.textContent = command;
      els.readinessRemediation.appendChild(code);
    });
  }

  state.workflowSteps = evaluateWorkflowSteps();
  els.workflowCurrentStep.textContent = getCurrentWorkflowSummary(state.workflowSteps);
  els.workflowStepsList.innerHTML = '';
  state.workflowSteps.forEach((step) => {
    const card = document.createElement('article');
    card.className = 'workflow-step';
    card.dataset.status = step.status;

    const head = document.createElement('div');
    head.className = 'workflow-step-head';
    const title = document.createElement('strong');
    title.textContent = step.title;
    const badge = document.createElement('span');
    badge.className = `workflow-badge ${
      step.status === 'done'
        ? 'workflow-badge-done'
        : step.status === 'blocked'
          ? 'workflow-badge-blocked'
          : 'workflow-badge-progress'
    }`;
    badge.textContent = WORKFLOW_STATUS_LABELS[step.status] || WORKFLOW_STATUS_LABELS.not_started;
    head.append(title, badge);

    const detail = document.createElement('p');
    detail.className = 'workflow-step-body';
    detail.textContent = step.detail;

    const help = document.createElement('p');
    help.className = 'workflow-step-help';
    help.textContent = step.help;

    const actions = document.createElement('div');
    actions.className = 'workflow-step-actions';
    const jumpBtn = document.createElement('button');
    jumpBtn.type = 'button';
    jumpBtn.className = 'workflow-jump-btn';
    jumpBtn.textContent = 'Go to step';
    jumpBtn.addEventListener('click', () => {
      jumpToStepTarget(step.targetId);
    });
    actions.appendChild(jumpBtn);

    card.append(head, detail, help, actions);
    els.workflowStepsList.appendChild(card);
  });
}

async function loadReadiness() {
  try {
    const readiness = await api('/api/readiness');
    state.readiness = readiness;
  } catch (error) {
    state.readiness = {
      overall_status: 'fail',
      blocking: true,
      checked_at_utc: new Date().toISOString(),
      core: {
        dbReady: false,
        appDbReady: false,
        metadata: {},
        counts: {
          jobs: null,
          job_tasks: null,
          states: null,
          counties: null,
          state_job_counts: null,
          county_job_counts: null,
          psychometric_catalog: null
        }
      },
      checks: [
        {
          id: 'readiness.endpoint',
          status: 'fail',
          severity: 'blocker',
          message: error.message || 'Unable to read readiness endpoint'
        }
      ],
      remediation: [
        'npm run build:data -- --legacy-dir "<path to MVQS source>" --source dc',
        'npm run dev',
        'npm run smoke:api'
      ]
    };
  }
  setDashboardActionStates();
}

async function loadAiStatus() {
  try {
    const status = await api('/api/ai/status');
    state.aiStatus = status;
  } catch (error) {
    state.aiStatus = {
      enabled: false,
      model: null,
      message: error.message || 'Unable to load AI status.'
    };
  }
  renderWizardAiNarrative();
  setDashboardActionStates();
}

function parseOptionalNumericInput(value, fieldLabel) {
  const raw = String(value || '').trim();
  if (!raw) {
    return { value: null, error: null };
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return { value: null, error: `${fieldLabel} must be numeric` };
  }
  return { value: parsed, error: null };
}

function selectedUser() {
  if (state.selectedUserId === null) {
    return null;
  }
  return state.users.find((row) => row.user_id === state.selectedUserId) || null;
}

function ensureDashboardListEmpty(container, message) {
  if (!container) {
    return;
  }
  container.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
}

function setDashboardActionStates() {
  const hasUser = state.selectedUserId !== null;
  const hasResults = Array.isArray(state.results) && state.results.length > 0;
  const hasSavedReports = Array.isArray(state.savedReports) && state.savedReports.length > 0;
  const canSaveReport = hasUser && hasResults && (state.mode === 'match' || state.mode === 'tsa');

  if (els.createUserBtn) {
    els.createUserBtn.disabled = false;
  }
  if (els.updateUserBtn) {
    els.updateUserBtn.disabled = !hasUser;
  }
  if (els.deleteUserBtn) {
    els.deleteUserBtn.disabled = !hasUser;
  }
  if (els.addPsychResultBtn) {
    els.addPsychResultBtn.disabled = !hasUser;
  }
  if (els.refreshPsychBtn) {
    els.refreshPsychBtn.disabled = !hasUser;
  }
  if (els.saveReportForUserBtn) {
    els.saveReportForUserBtn.disabled = !canSaveReport;
  }
  if (els.exportCaseBundleBtn) {
    els.exportCaseBundleBtn.disabled = !hasUser || !hasSavedReports;
  }
  if (els.refreshSavedReportsBtn) {
    els.refreshSavedReportsBtn.disabled = !hasUser;
  }
  if (els.wizardGenerateAiNarrativeBtn) {
    els.wizardGenerateAiNarrativeBtn.disabled = !hasUser;
  }

  applyGlobalBlocking();
  renderWorkflowPanel();
  renderWizardReadinessSummary();
  renderWizardRail();
}

function triggerDownload(url) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = '';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function parseFilenameFromDisposition(dispositionValue, fallbackName) {
  const raw = String(dispositionValue || '');
  const utf8Match = raw.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match && utf8Match[1]) {
    return decodeURIComponent(utf8Match[1]);
  }
  const basicMatch = raw.match(/filename="?([^";]+)"?/i);
  if (basicMatch && basicMatch[1]) {
    return basicMatch[1];
  }
  return fallbackName;
}

async function fetchAndDownloadFile(url, fallbackName) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: '*/*' }
  });
  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status}`;
    try {
      const payload = await response.json();
      errorMessage = payload.error || payload.message || errorMessage;
    } catch {
      // Keep default message when body is not JSON.
    }
    throw new Error(errorMessage);
  }

  const blob = await response.blob();
  const filename = parseFilenameFromDisposition(response.headers.get('content-disposition'), fallbackName);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

function renderUserOptions() {
  if (!els.userSelect) {
    return;
  }

  const priorSelected = state.selectedUserId;
  els.userSelect.innerHTML = '<option value="">Select or create a user</option>';

  state.users.forEach((user) => {
    const option = document.createElement('option');
    option.value = String(user.user_id);
    const caseLabel = user.case_reference ? ` (${user.case_reference})` : '';
    option.textContent = `${user.last_name}, ${user.first_name}${caseLabel}`;
    els.userSelect.appendChild(option);
  });

  if (priorSelected !== null && state.users.some((row) => row.user_id === priorSelected)) {
    els.userSelect.value = String(priorSelected);
  } else {
    state.selectedUserId = null;
    els.userSelect.value = '';
  }

  setDashboardActionStates();
}

function fillUserForm(user) {
  els.userFirstNameInput.value = user?.first_name || '';
  els.userLastNameInput.value = user?.last_name || '';
  els.userCaseRefInput.value = user?.case_reference || '';
  els.userEmailInput.value = user?.email || '';
  els.userAddress1Input.value = user?.address_line1 || '';
  els.userAddress2Input.value = user?.address_line2 || '';
  els.userCityInput.value = user?.city || '';
  els.userPostalInput.value = user?.postal_code || '';
  els.userNotesInput.value = user?.notes || '';
}

async function syncUserDemographicSelectors(user) {
  const stateId = user?.demographic_state_id ?? null;
  const countyId = user?.demographic_county_id ?? null;

  if (stateId !== null && stateId !== undefined) {
    const value = String(stateId);
    if ([...els.userDemoStateSelect.options].some((option) => option.value === value)) {
      els.userDemoStateSelect.value = value;
    } else {
      els.userDemoStateSelect.value = '';
    }
    const loadResult = await loadDemographicCountiesForState(value, countyId);
    if (!loadResult.ok) {
      els.userDemoStateSelect.value = '';
      await loadDemographicCountiesForState(null, null);
      return `Demographic county list could not be loaded (${loadResult.error.message}).`;
    }
    if (loadResult.warning) {
      return loadResult.warning;
    }
    return null;
  }

  els.userDemoStateSelect.value = '';
  await loadDemographicCountiesForState(null, null);
  return null;
}

function renderDemographicStateOptions() {
  if (!els.userDemoStateSelect) {
    return;
  }
  const priorValue = els.userDemoStateSelect.value;
  els.userDemoStateSelect.innerHTML = '<option value="">Select state/province</option>';
  state.availableStates.forEach((row) => {
    const option = document.createElement('option');
    option.value = String(row.state_id);
    option.textContent = `${row.state_abbrev} - ${row.state_name}`;
    els.userDemoStateSelect.appendChild(option);
  });
  if (priorValue && [...els.userDemoStateSelect.options].some((option) => option.value === priorValue)) {
    els.userDemoStateSelect.value = priorValue;
  }
}

function renderRegionStateOptions() {
  if (!els.stateSelect) {
    return;
  }
  const priorValue = els.stateSelect.value;
  els.stateSelect.innerHTML = '<option value="">All</option>';
  state.availableStates.forEach((row) => {
    const option = document.createElement('option');
    option.value = String(row.state_id);
    option.textContent = `${row.state_abbrev} - ${row.state_name}`;
    els.stateSelect.appendChild(option);
  });
  if (priorValue && [...els.stateSelect.options].some((option) => option.value === priorValue)) {
    els.stateSelect.value = priorValue;
  }
}

async function loadDemographicCountiesForState(stateId, preferredCountyId = null) {
  els.userDemoCountySelect.innerHTML = '<option value="">Select county/bank</option>';
  els.userDemoCountySelect.disabled = true;
  state.demographicCounties = [];

  if (!stateId) {
    return { ok: true, warning: null, error: null };
  }

  try {
    const data = await api(`/api/counties?stateId=${stateId}`);
    const counties = data.counties || [];
    state.demographicCounties = counties;
    counties.forEach((county) => {
      const option = document.createElement('option');
      option.value = String(county.county_id);
      option.textContent = county.county_name;
      els.userDemoCountySelect.appendChild(option);
    });
    els.userDemoCountySelect.disabled = false;

    if (preferredCountyId !== null && preferredCountyId !== undefined) {
      const preferred = String(preferredCountyId);
      if ([...els.userDemoCountySelect.options].some((option) => option.value === preferred)) {
        els.userDemoCountySelect.value = preferred;
      } else {
        return {
          ok: true,
          warning: 'Saved demographic county is no longer available for selected state.',
          error: null
        };
      }
    }

    return { ok: true, warning: null, error: null };
  } catch (error) {
    state.demographicCounties = [];
    els.userDemoCountySelect.innerHTML = '<option value="">Unable to load counties</option>';
    els.userDemoCountySelect.disabled = true;
    return { ok: false, warning: null, error };
  }
}

function renderPsychometricCatalog() {
  if (!els.psychTestSelect) {
    return;
  }
  els.psychTestSelect.innerHTML = '<option value="">Select test</option>';
  state.psychometricCatalog.forEach((row) => {
    const option = document.createElement('option');
    option.value = row.test_code;
    const domain = row.domain ? ` (${row.domain})` : '';
    option.textContent = `${row.test_name}${domain}`;
    els.psychTestSelect.appendChild(option);
  });
}

function renderPsychometricResults() {
  if (!els.psychResultsList) {
    return;
  }

  if (!state.selectedUserId) {
    ensureDashboardListEmpty(els.psychResultsList, 'Select a user to view psychometric records.');
    return;
  }

  if (!state.psychometricResults.length) {
    ensureDashboardListEmpty(els.psychResultsList, 'No psychometric records yet.');
    return;
  }

  els.psychResultsList.innerHTML = '';
  state.psychometricResults.forEach((row) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'dashboard-item';

    const head = document.createElement('div');
    head.className = 'dashboard-item-head';
    const title = document.createElement('strong');
    title.textContent = row.test_name;
    const measured = document.createElement('span');
    measured.className = 'dashboard-item-meta';
    measured.textContent = row.measured_at_utc
      ? new Date(row.measured_at_utc).toLocaleString()
      : 'No date';
    head.append(title, measured);

    const scores = document.createElement('p');
    scores.className = 'dashboard-item-meta';
    scores.textContent =
      `Raw: ${row.raw_score ?? 'n/a'} | Scaled: ${row.scaled_score ?? 'n/a'} | Percentile: ${row.percentile ?? 'n/a'}`;

    const notes = document.createElement('p');
    notes.className = 'dashboard-item-meta';
    notes.textContent = row.interpretation || 'No interpretation notes.';

    const actions = document.createElement('div');
    actions.className = 'dashboard-item-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'dashboard-mini-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      await deletePsychometricResult(row.result_id);
    });
    actions.appendChild(deleteBtn);

    wrapper.append(head, scores, notes, actions);
    els.psychResultsList.appendChild(wrapper);
  });
}

function renderSavedReports() {
  if (!els.savedReportsList) {
    return;
  }

  if (!state.selectedUserId) {
    ensureDashboardListEmpty(els.savedReportsList, 'Select a user to view saved reports.');
    return;
  }

  if (!state.savedReports.length) {
    ensureDashboardListEmpty(els.savedReportsList, 'No saved reports yet.');
    return;
  }

  els.savedReportsList.innerHTML = '';
  state.savedReports.forEach((row) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'dashboard-item';

    const head = document.createElement('div');
    head.className = 'dashboard-item-head';
    const title = document.createElement('strong');
    title.textContent = row.label || `${row.report_type} #${row.saved_report_id}`;
    const created = document.createElement('span');
    created.className = 'dashboard-item-meta';
    created.textContent = row.created_at_utc
      ? new Date(row.created_at_utc).toLocaleString()
      : 'No date';
    head.append(title, created);

    const meta = document.createElement('p');
    meta.className = 'dashboard-item-meta';
    meta.textContent = `DOT ${row.selected_dot_code || 'n/a'} | Hash ${row.report_hash_sha256?.slice(0, 12) || 'n/a'}...`;

    const actions = document.createElement('div');
    actions.className = 'dashboard-item-actions';
    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'dashboard-mini-btn';
    openBtn.textContent = 'Open';
    openBtn.addEventListener('click', async () => {
      await openSavedReport(row.saved_report_id);
    });
    const jsonBtn = document.createElement('button');
    jsonBtn.type = 'button';
    jsonBtn.className = 'dashboard-mini-btn';
    jsonBtn.textContent = 'JSON';
    jsonBtn.addEventListener('click', () => {
      triggerDownload(`/api/reports/saved/${row.saved_report_id}/export/json`);
    });
    const mdBtn = document.createElement('button');
    mdBtn.type = 'button';
    mdBtn.className = 'dashboard-mini-btn';
    mdBtn.textContent = 'Markdown';
    mdBtn.addEventListener('click', () => {
      triggerDownload(`/api/reports/saved/${row.saved_report_id}/export/markdown`);
    });
    const htmlBtn = document.createElement('button');
    htmlBtn.type = 'button';
    htmlBtn.className = 'dashboard-mini-btn';
    htmlBtn.textContent = 'HTML';
    htmlBtn.addEventListener('click', () => {
      triggerDownload(`/api/reports/saved/${row.saved_report_id}/export/html`);
    });
    const pdfBtn = document.createElement('button');
    pdfBtn.type = 'button';
    pdfBtn.className = 'dashboard-mini-btn';
    pdfBtn.textContent = 'PDF';
    pdfBtn.addEventListener('click', () => {
      triggerDownload(`/api/reports/saved/${row.saved_report_id}/export/pdf`);
    });
    const packetBtn = document.createElement('button');
    packetBtn.type = 'button';
    packetBtn.className = 'dashboard-mini-btn';
    packetBtn.dataset.action = 'case-packet';
    packetBtn.textContent = 'Case Packet';
    packetBtn.addEventListener('click', async () => {
      await downloadCasePacket(row.saved_report_id);
    });
    const verifyBtn = document.createElement('button');
    verifyBtn.type = 'button';
    verifyBtn.className = 'dashboard-mini-btn';
    verifyBtn.textContent = 'Verify';
    verifyBtn.addEventListener('click', async () => {
      await validateSavedReportExport(row.saved_report_id);
    });
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'dashboard-mini-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      await deleteSavedReport(row.saved_report_id);
    });
    actions.append(openBtn, jsonBtn, mdBtn, htmlBtn, pdfBtn, packetBtn, verifyBtn, deleteBtn);

    wrapper.append(head, meta, actions);
    els.savedReportsList.appendChild(wrapper);
  });
}

function buildTspBandSummary(bandCounts) {
  if (!bandCounts || typeof bandCounts !== 'object') {
    return '';
  }

  const total = Number(bandCounts.total);
  if (!Number.isFinite(total) || total <= 0) {
    return '';
  }

  const level5 = Number(bandCounts.level_5 || 0);
  const level4 = Number(bandCounts.level_4 || 0);
  const level3 = Number(bandCounts.level_3 || 0);
  const level2 = Number(bandCounts.level_2 || 0);
  const level1 = Number(bandCounts.level_1 || 0);

  return `Band totals (all results): L5 ${level5.toLocaleString()}, L4 ${level4.toLocaleString()}, L3 ${level3.toLocaleString()}, L2 ${level2.toLocaleString()}, L1 ${level1.toLocaleString()}`;
}

function updateManualTsaBasis() {
  if (!els.manualTsaBasisMeta) {
    return;
  }

  if (state.mode !== 'tsa') {
    els.manualTsaBasisMeta.textContent = DEFAULT_TSA_GUIDE_TEXT;
    return;
  }

  const pieces = [];
  const sourceDots = resolveTsaSourceDots();
  const sourceLabel = sourceDots.length
    ? sourceDots.map((dot) => `DOT ${dot}`).join(', ')
    : 'awaiting source DOT';
  pieces.push(`TSA sources: ${sourceLabel}.`);

  const model = state.tsaAnalysisBasis?.model;
  if (model) {
    pieces.push(`Model: ${model}.`);
  }

  const notes = Array.isArray(state.tsaAnalysisBasis?.notes)
    ? state.tsaAnalysisBasis.notes.filter((row) => typeof row === 'string' && row.trim()).join(' ')
    : '';
  if (notes) {
    pieces.push(notes);
  }

  const bandSummary = buildTspBandSummary(state.tsaBandCounts);
  if (bandSummary) {
    pieces.push(`${bandSummary}.`);
  }

  els.manualTsaBasisMeta.textContent = pieces.join(' ').trim() || DEFAULT_TSA_GUIDE_TEXT;
}

function resetTransferableContext() {
  state.tsaBandCounts = null;
  state.tsaAnalysisBasis = null;
  updateManualTsaBasis();
}

async function loadUsers(preferredUserId = null) {
  const data = await api('/api/users');
  state.users = data.users || [];

  if (preferredUserId !== null && state.users.some((row) => row.user_id === preferredUserId)) {
    state.selectedUserId = preferredUserId;
  } else if (state.selectedUserId !== null && !state.users.some((row) => row.user_id === state.selectedUserId)) {
    state.selectedUserId = null;
  }

  renderUserOptions();
  const user = selectedUser();
  fillUserForm(user);
  const demographicWarning = await syncUserDemographicSelectors(user);
  const baseMeta = user
    ? `Selected ${user.first_name} ${user.last_name}. Psychometric records: ${user.psychometric_count || 0}. Saved reports: ${user.saved_report_count || 0}.`
    : 'No user selected.';
  setUserMeta(demographicWarning ? `${baseMeta} ${demographicWarning}` : baseMeta);
  setDashboardActionStates();
}

async function loadPsychometricCatalog() {
  const data = await api('/api/psychometrics/catalog');
  state.psychometricCatalog = data.tests || [];
  renderPsychometricCatalog();
}

async function loadPsychometricResults() {
  if (!state.selectedUserId) {
    state.psychometricResults = [];
    renderPsychometricResults();
    setDashboardActionStates();
    return;
  }

  const data = await api(`/api/users/${state.selectedUserId}/psychometrics`);
  state.psychometricResults = data.results || [];
  renderPsychometricResults();
  setDashboardActionStates();
}

async function loadSavedReports() {
  if (!state.selectedUserId) {
    state.savedReports = [];
    renderSavedReports();
    setDashboardActionStates();
    return;
  }

  const data = await api(`/api/reports/saved?userId=${state.selectedUserId}&limit=200&offset=0`);
  state.savedReports = data.reports || [];
  renderSavedReports();
  setSavedReportsMeta(
    `Loaded ${state.savedReports.length.toLocaleString()} saved reports for selected user.`
  );
  setDashboardActionStates();
}

async function refreshDashboardForSelectedUser() {
  renderPsychometricResults();
  renderSavedReports();
  await Promise.all([loadPsychometricResults(), loadSavedReports()]);
}

async function createUser() {
  const blockedMessage = getBlockingMessage('appDb');
  if (blockedMessage) {
    setUserMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  const firstName = els.userFirstNameInput.value.trim();
  const lastName = els.userLastNameInput.value.trim();
  const caseReference = els.userCaseRefInput.value.trim();
  const email = els.userEmailInput.value.trim();
  const addressLine1 = els.userAddress1Input.value.trim();
  const addressLine2 = els.userAddress2Input.value.trim();
  const city = els.userCityInput.value.trim();
  const postalCode = els.userPostalInput.value.trim();
  const notes = els.userNotesInput.value.trim();
  const demographicStateId = els.userDemoStateSelect.value
    ? Number.parseInt(els.userDemoStateSelect.value, 10)
    : null;
  const demographicCountyId = els.userDemoCountySelect.value
    ? Number.parseInt(els.userDemoCountySelect.value, 10)
    : null;

  if (!firstName || !lastName) {
    setUserMeta('First name and last name are required.');
    return;
  }

  const data = await api('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      firstName,
      lastName,
      caseReference: caseReference || null,
      email: email || null,
      addressLine1: addressLine1 || null,
      addressLine2: addressLine2 || null,
      city: city || null,
      postalCode: postalCode || null,
      demographicStateId,
      demographicCountyId,
      notes: notes || null
    })
  });

  const newUserId = data.user?.user_id || null;
  await loadUsers(newUserId);
  state.selectedUserId = newUserId;
  renderUserOptions();
  persistUiState();
  await refreshDashboardForSelectedUser();
  state.selectedCaseId = newUserId;
  await loadCases(newUserId);
  await loadWizardCaseDetail(newUserId);
  setUserMeta(`Created user ${data.user.first_name} ${data.user.last_name}.`);
}

async function updateUser() {
  const blockedMessage = getBlockingMessage('appDb');
  if (blockedMessage) {
    setUserMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  if (!state.selectedUserId) {
    setUserMeta('Select a user first.');
    return;
  }

  const firstName = els.userFirstNameInput.value.trim();
  const lastName = els.userLastNameInput.value.trim();
  const caseReference = els.userCaseRefInput.value.trim();
  const email = els.userEmailInput.value.trim();
  const addressLine1 = els.userAddress1Input.value.trim();
  const addressLine2 = els.userAddress2Input.value.trim();
  const city = els.userCityInput.value.trim();
  const postalCode = els.userPostalInput.value.trim();
  const notes = els.userNotesInput.value.trim();
  const demographicStateId = els.userDemoStateSelect.value
    ? Number.parseInt(els.userDemoStateSelect.value, 10)
    : null;
  const demographicCountyId = els.userDemoCountySelect.value
    ? Number.parseInt(els.userDemoCountySelect.value, 10)
    : null;

  if (!firstName || !lastName) {
    setUserMeta('First name and last name are required.');
    return;
  }

  const data = await api(`/api/users/${state.selectedUserId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      firstName,
      lastName,
      caseReference: caseReference || null,
      email: email || null,
      addressLine1: addressLine1 || null,
      addressLine2: addressLine2 || null,
      city: city || null,
      postalCode: postalCode || null,
      demographicStateId,
      demographicCountyId,
      notes: notes || null
    })
  });
  await loadUsers(state.selectedUserId);
  fillUserForm(data.user);
  state.selectedCaseId = state.selectedUserId;
  await loadCases(state.selectedCaseId);
  await loadWizardCaseDetail(state.selectedCaseId);
  persistUiState();
  setUserMeta(`Updated user ${data.user.first_name} ${data.user.last_name}.`);
}

async function deleteUser() {
  const blockedMessage = getBlockingMessage('appDb');
  if (blockedMessage) {
    setUserMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  if (!state.selectedUserId) {
    setUserMeta('Select a user first.');
    return;
  }

  const user = selectedUser();
  const label = user ? `${user.first_name} ${user.last_name}` : `#${state.selectedUserId}`;
  if (!window.confirm(`Delete user ${label} and all saved psychometric/report records?`)) {
    return;
  }

  await api(`/api/users/${state.selectedUserId}`, { method: 'DELETE' });
  state.selectedUserId = null;
  state.selectedCaseId = null;
  fillUserForm(null);
  persistUiState();
  await loadUsers();
  await refreshDashboardForSelectedUser();
  await loadCases();
  populateWizardIntake(null);
  await loadWizardWorkHistory();
  renderWizardProfiles();
  setDashboardActionStates();
  setUserMeta(`Deleted user ${label}.`);
}

async function addPsychometricResult() {
  const blockedMessage = getBlockingMessage('appDb');
  if (blockedMessage) {
    setPsychMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  if (!state.selectedUserId) {
    setPsychMeta('Select a user first.');
    return;
  }

  const selectedCode = els.psychTestSelect.value || null;
  const selectedCatalog = state.psychometricCatalog.find((row) => row.test_code === selectedCode) || null;
  const rawParsed = parseOptionalNumericInput(els.psychRawInput.value, 'Raw score');
  if (rawParsed.error) {
    setPsychMeta(rawParsed.error);
    return;
  }
  const scaledParsed = parseOptionalNumericInput(els.psychScaledInput.value, 'Scaled score');
  if (scaledParsed.error) {
    setPsychMeta(scaledParsed.error);
    return;
  }
  const percentileParsed = parseOptionalNumericInput(els.psychPercentileInput.value, 'Percentile');
  if (percentileParsed.error) {
    setPsychMeta(percentileParsed.error);
    return;
  }
  if (percentileParsed.value !== null && (percentileParsed.value < 0 || percentileParsed.value > 100)) {
    setPsychMeta('Percentile must be between 0 and 100.');
    return;
  }

  const measuredAt = els.psychMeasuredAtInput.value.trim();
  const interpretation = els.psychInterpretationInput.value.trim();
  const payload = {
    testCode: selectedCode || null,
    testName: selectedCatalog ? selectedCatalog.test_name : selectedCode ? null : 'Custom / Other Test',
    rawScore: rawParsed.value,
    scaledScore: scaledParsed.value,
    percentile: percentileParsed.value,
    measuredAtUtc: measuredAt || null,
    interpretation: interpretation || null
  };

  await api(`/api/users/${state.selectedUserId}/psychometrics`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  els.psychRawInput.value = '';
  els.psychScaledInput.value = '';
  els.psychPercentileInput.value = '';
  els.psychMeasuredAtInput.value = '';
  els.psychInterpretationInput.value = '';
  await loadPsychometricResults();
  await loadUsers(state.selectedUserId);
  setPsychMeta('Psychometric result added.');
}

async function deletePsychometricResult(resultId) {
  if (!state.selectedUserId) {
    return;
  }
  await api(`/api/users/${state.selectedUserId}/psychometrics/${resultId}`, { method: 'DELETE' });
  await loadPsychometricResults();
  await loadUsers(state.selectedUserId);
  setPsychMeta(`Deleted psychometric result #${resultId}.`);
}

async function saveCurrentReportForUser() {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    setSavedReportsMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  if (!state.selectedUserId) {
    setSavedReportsMeta('Select a user first.');
    return;
  }
  if (!state.results.length) {
    setSavedReportsMeta('Run Match or Transferable Skills and generate a report before saving.');
    return;
  }
  if (state.mode !== 'match' && state.mode !== 'tsa') {
    setSavedReportsMeta('Only Match or Transferable Skills runs can be saved as reports.');
    return;
  }

  const params = getFilterParams();
  const label = els.reportSaveLabelInput.value.trim() || null;
  let response = null;
  if (state.mode === 'match') {
    response = await api('/api/reports/match/save', {
      method: 'POST',
      body: JSON.stringify({
        userId: state.selectedUserId,
        label,
        q: params.q,
        stateId: params.stateId,
        countyId: params.countyId,
        profile: state.profile,
        selectedDot: state.selectedDot,
        limit: 40,
        taskLimit: 30
      })
    });
  } else {
    const sourceDots = resolveTsaSourceDots();
    if (!sourceDots.length) {
      setSavedReportsMeta('Enter at least one source DOT before saving a transferable-skills report.');
      return;
    }
    response = await api('/api/reports/transferable-skills/save', {
      method: 'POST',
      body: JSON.stringify({
        userId: state.selectedUserId,
        label,
        q: params.q,
        stateId: params.stateId,
        countyId: params.countyId,
        profile: state.profile,
        sourceDots,
        selectedDot: state.selectedDot,
        limit: 40,
        taskLimit: 30
      })
    });
  }

  const saved = response.saved_report;
  if (saved?.report) {
    state.report = saved.report;
    state.reportHtml = saved.report_html || null;
    renderReport(state.report, state.reportHtml);
    els.downloadJsonBtn.disabled = false;
    els.downloadMarkdownBtn.disabled = false;
    setReportMeta(`Loaded saved report #${saved.saved_report_id}.`);
  }
  state.wizardLastSavedReportId = saved?.saved_report_id || null;
  els.reportSaveLabelInput.value = '';
  await loadSavedReports();
  await loadUsers(state.selectedUserId);
  setSavedReportsMeta(
    `Saved report #${saved.saved_report_id} with hash ${response.report_markdown_hash_sha256?.slice(0, 12) || 'n/a'}...`
  );
  setDashboardActionStates();
}

async function openSavedReport(savedReportId) {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    setSavedReportsMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  const response = await api(`/api/reports/saved/${savedReportId}`);
  const saved = response.saved_report;
  if (!saved?.report) {
    setSavedReportsMeta(`Saved report #${savedReportId} has no report payload.`);
    return;
  }
  state.report = saved.report;
  state.reportHtml = saved.report_html || null;
  state.wizardLastSavedReportId = saved.saved_report_id || null;
  const savedProfile = normalizeProfileValues(state.report.profile?.values);
  if (Array.isArray(savedProfile) && savedProfile.length === state.defaultProfile.length) {
    state.profile = savedProfile;
    renderTraits();
  }
  if (state.report.report_type === 'mvqs_transferable_skills_report') {
    state.mode = 'tsa';
    const savedSourceDots = Array.isArray(state.report.filters?.requested_source_dots)
      ? state.report.filters.requested_source_dots
          .map((dot) => normalizeDotInput(dot))
          .filter(Boolean)
      : [];
    state.tsaSourceDots = [...new Set(savedSourceDots)];
    if (state.tsaSourceDots.length) {
      els.tsaSourceInput.value = formatSourceDotList(state.tsaSourceDots);
    }
    state.tsaBandCounts = state.report.tsp_band_counts || null;
    state.tsaAnalysisBasis = state.report.analysis_basis || null;
  } else {
    state.mode = 'match';
    state.tsaSourceDots = [];
    resetTransferableContext();
  }
  if (!state.tsaSourceDots.length) {
    els.tsaSourceInput.value = '';
  }
  updateManualTsaBasis();
  renderReport(state.report, state.reportHtml);
  els.downloadJsonBtn.disabled = false;
  els.downloadMarkdownBtn.disabled = false;
  setReportMeta(`Loaded saved report #${savedReportId}.`);
  setSavedReportsMeta(`Opened saved report #${savedReportId}.`);
  setDashboardActionStates();
}

async function validateSavedReportExport(savedReportId) {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    setSavedReportsMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  const validation = await api(`/api/reports/saved/${savedReportId}/export/validate`);
  const ok =
    validation.markdown_hash_matches &&
    validation.html_hash_matches &&
    validation.pdf_export_uses_same_html_source;
  setSavedReportsMeta(
    ok
      ? `Report #${savedReportId} export parity verified. HTML hash ${String(validation.computed_html_hash_sha256 || '').slice(0, 12)}...`
      : `Report #${savedReportId} export parity check failed.`
  );
}

async function downloadCasePacket(savedReportId) {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    setSavedReportsMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  await fetchAndDownloadFile(
    `/api/reports/saved/${savedReportId}/export/case-packet`,
    `mvqs-case-packet-${savedReportId}.zip`
  );
  state.lastCasePacketSavedReportId = savedReportId;
  setSavedReportsMeta(`Downloaded case packet for saved report #${savedReportId}.`);
  setDashboardActionStates();
}

async function exportCaseReportBundle() {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    setSavedReportsMeta(`Blocked: ${blockedMessage}`);
    return;
  }
  if (!state.selectedUserId) {
    setSavedReportsMeta('Select a user first.');
    return;
  }
  if (!Array.isArray(state.savedReports) || !state.savedReports.length) {
    setSavedReportsMeta('No saved reports are available for this case.');
    return;
  }

  await fetchAndDownloadFile(
    `/api/cases/${state.selectedUserId}/export/report-bundle`,
    `mvqs-case-report-bundle-${state.selectedUserId}.zip`
  );
  setSavedReportsMeta(`Downloaded full case bundle for user #${state.selectedUserId}.`);
}

async function deleteSavedReport(savedReportId) {
  await api(`/api/reports/saved/${savedReportId}`, { method: 'DELETE' });
  if (state.lastCasePacketSavedReportId === savedReportId) {
    state.lastCasePacketSavedReportId = null;
  }
  await loadSavedReports();
  await loadUsers(state.selectedUserId);
  setSavedReportsMeta(`Deleted saved report #${savedReportId}.`);
  setDashboardActionStates();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fmtNumber(value) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  return Number(value).toLocaleString();
}

function fmtDecimal(value, digits = 1) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 'n/a';
  }
  return numeric.toFixed(digits);
}

function getFilterParams() {
  const q = els.searchInput.value.trim().slice(0, 200);
  const stateId = els.stateSelect.value ? Number.parseInt(els.stateSelect.value, 10) : null;
  const countyId = els.countySelect.value ? Number.parseInt(els.countySelect.value, 10) : null;
  return { q, stateId, countyId };
}

function normalizeDotInput(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  return digits.padStart(9, '0').slice(0, 9);
}

function parseSourceDotListInput(value, maxCodes = 25) {
  const tokens = String(value || '')
    .split(/[\s,;]+/)
    .map((token) => normalizeDotInput(token))
    .filter(Boolean);
  if (!tokens.length) {
    return [];
  }
  return [...new Set(tokens)].slice(0, maxCodes);
}

function formatSourceDotList(sourceDots) {
  if (!Array.isArray(sourceDots) || !sourceDots.length) {
    return '';
  }
  return sourceDots.join(', ');
}

function resolveTsaSourceDots() {
  const explicit = parseSourceDotListInput(els.tsaSourceInput.value);
  if (explicit.length) {
    return explicit;
  }
  if (Array.isArray(state.tsaSourceDots) && state.tsaSourceDots.length) {
    return [...state.tsaSourceDots];
  }
  const selected = normalizeDotInput(state.selectedDot);
  return selected ? [selected] : [];
}

function getSelectedRegionLabel(report) {
  const region = report?.filters?.region || {};
  const stateLabel = region.state
    ? `${region.state.state_abbrev} - ${region.state.state_name}`
    : 'All states/provinces';
  if (!region.county) {
    return stateLabel;
  }
  return `${stateLabel} / ${region.county.county_name}`;
}

function describeSelectedSource(report) {
  const summary = report?.summary || {};
  const selectedDot = summary.selected_dot_code || report?.selected_job?.dot_code || null;
  if (!selectedDot) {
    return 'No selected job';
  }

  const requestedDot = summary.selected_requested_dot_code || null;
  if (!requestedDot) {
    return 'Top ranked result';
  }

  if (requestedDot !== selectedDot) {
    return `Fallback to ranked result (${selectedDot})`;
  }

  return summary.selected_included_in_results ? 'Requested DOT in ranked rows' : 'Requested DOT outside ranked rows';
}

function setReportPlaceholder(message) {
  els.reportBody.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
}

function invalidateReport(message) {
  cancelTrackedRequest('report');
  state.report = null;
  state.reportHtml = null;
  els.downloadJsonBtn.disabled = true;
  els.downloadMarkdownBtn.disabled = true;
  setReportMeta(message);
  setReportPlaceholder(message);
  setDashboardActionStates();
}

function renderTraits() {
  els.traitsGrid.innerHTML = '';

  state.traits.forEach((trait, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'trait-control';

    const label = document.createElement('label');
    label.textContent = `${trait.code}  ${trait.label}`;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = String(trait.min);
    slider.max = String(trait.max);
    slider.step = '1';
    slider.value = String(state.profile[index]);

    const meta = document.createElement('div');
    meta.className = 'trait-meta';

    const rangeText = document.createElement('span');
    rangeText.textContent = `Range ${trait.min}-${trait.max}`;

    const valueText = document.createElement('strong');
    valueText.textContent = String(state.profile[index]);

    meta.append(rangeText, valueText);

    slider.addEventListener('input', () => {
      state.profile[index] = Number.parseInt(slider.value, 10);
      valueText.textContent = slider.value;
      persistUiState();
      if (state.report) {
        invalidateReport('Profile changed. Generate a new report.');
      }
    });

    wrapper.append(label, slider, meta);
    els.traitsGrid.appendChild(wrapper);
  });
}

function clearResults() {
  cancelTrackedRequest('detail');
  state.results = [];
  state.resultsTotal = 0;
  state.selectedDot = null;
  state.lastDetailLoadedDot = null;
  state.selectedResultButton = null;
  setDetailMeta('Select a job to view details.');
  els.resultsList.innerHTML = '<div class="empty">No results.</div>';
  els.jobDetail.innerHTML = '<div class="empty">Select a job to view details.</div>';
  hideLoadMore();
  setDashboardActionStates();
}

function makePill(text, classes = '') {
  const span = document.createElement('span');
  span.className = `pill ${classes}`.trim();
  span.textContent = text;
  return span;
}

function renderResults() {
  if (!state.results.length) {
    clearResults();
    return;
  }

  els.resultsList.innerHTML = '';
  const priorSelectedDot = state.selectedDot;
  state.selectedResultButton = null;
  let firstDot = null;
  let firstButton = null;

  state.results.forEach((item) => {
    const fragment = els.resultTemplate.content.cloneNode(true);
    const button = fragment.querySelector('.result-item');
    const titleEl = fragment.querySelector('.result-title');
    const dotEl = fragment.querySelector('.result-dot');
    const metrics = fragment.querySelector('.result-metrics');

    titleEl.textContent = item.title;
    dotEl.textContent = `DOT ${item.dot_code}`;

    if (item.job_count !== null && item.job_count !== undefined) {
      metrics.appendChild(makePill(`${Number(item.job_count).toLocaleString()} jobs`, 'accent'));
    }
    if (item.vq !== null && item.vq !== undefined) {
      metrics.appendChild(makePill(`VQ ${fmtDecimal(item.vq)}`));
    }
    if (item.svp !== null && item.svp !== undefined) {
      metrics.appendChild(makePill(`SVP ${fmtNumber(item.svp)}`));
    }
    if (item.population !== null && item.population !== undefined) {
      metrics.appendChild(makePill(`Population ${fmtNumber(item.population)}`));
    }
    if (item.match_score !== null && item.match_score !== undefined) {
      metrics.appendChild(makePill(`${fmtDecimal(item.match_score)}% match`, 'good'));
    }
    if (item.tsp_percent !== null && item.tsp_percent !== undefined) {
      metrics.appendChild(makePill(`TS ${fmtDecimal(item.tsp_percent)}%`, 'good'));
    }
    if (item.va_adjustment_percent !== null && item.va_adjustment_percent !== undefined) {
      metrics.appendChild(makePill(`VA Adj ${fmtDecimal(item.va_adjustment_percent)}%`));
    }
    if (item.tsp_level !== null && item.tsp_level !== undefined) {
      const levelLabel = item.tsp_label ? `: ${item.tsp_label}` : '';
      metrics.appendChild(makePill(`Level ${fmtNumber(item.tsp_level)}${levelLabel}`));
    }
    if (item.transfer_direction) {
      metrics.appendChild(makePill(`Direction ${item.transfer_direction}`));
    }

    button.addEventListener('click', async () => {
      if (state.selectedResultButton) {
        state.selectedResultButton.classList.remove('active');
      }
      const priorDot = state.selectedDot;
      state.selectedResultButton = button;
      button.classList.add('active');
      state.selectedDot = item.dot_code;
      await loadJobDetail(item.dot_code);
      if (state.report && priorDot !== state.selectedDot) {
        invalidateReport('Selected job changed. Generate a new report.');
      }
    });

    if (!firstDot) {
      firstDot = item.dot_code;
      firstButton = button;
    }

    if (priorSelectedDot && priorSelectedDot === item.dot_code) {
      state.selectedDot = item.dot_code;
      state.selectedResultButton = button;
      button.classList.add('active');
    }

    els.resultsList.appendChild(fragment);
  });

  if (!state.selectedResultButton && firstDot && firstButton) {
    state.selectedDot = firstDot;
    state.selectedResultButton = firstButton;
    firstButton.classList.add('active');
    loadJobDetail(firstDot);
  }

  setDashboardActionStates();
}

function renderTraitVector(traitVector) {
  const wrap = document.createElement('div');
  wrap.className = 'top-states';

  if (!traitVector || traitVector.length !== state.traits.length) {
    return wrap;
  }

  for (let i = 0; i < state.traits.length; i += 1) {
    const trait = state.traits[i];
    wrap.appendChild(makePill(`${trait.code}:${traitVector[i]}`));
  }

  return wrap;
}

function renderTopStatesCard(topStates) {
  const statesCard = document.createElement('section');
  statesCard.className = 'detail-card';
  const statesTitle = document.createElement('h3');
  statesTitle.textContent = 'Top State/Province Counts';
  statesCard.appendChild(statesTitle);

  if (topStates.length) {
    const chips = document.createElement('div');
    chips.className = 'top-states';
    topStates.forEach((row) => {
      chips.appendChild(makePill(`${row.state_abbrev}: ${Number(row.job_count).toLocaleString()}`, 'accent'));
    });
    statesCard.appendChild(chips);
  } else {
    statesCard.innerHTML += '<div class="empty">No state counts available.</div>';
  }

  return statesCard;
}

function renderTopCountiesCard(topCounties) {
  const countiesCard = document.createElement('section');
  countiesCard.className = 'detail-card';
  const countiesTitle = document.createElement('h3');
  countiesTitle.textContent = 'Top County Counts (Selected State)';
  countiesCard.appendChild(countiesTitle);

  if (topCounties.length) {
    const chips = document.createElement('div');
    chips.className = 'top-states';
    topCounties.forEach((row) => {
      chips.appendChild(makePill(`${row.county_name}: ${Number(row.job_count).toLocaleString()}`, 'accent'));
    });
    countiesCard.appendChild(chips);
  } else {
    countiesCard.innerHTML += '<div class="empty">No county counts available for current state.</div>';
  }

  return countiesCard;
}

async function loadJobDetail(dotCode) {
  if (!dotCode) {
    return;
  }

  const request = beginTrackedRequest('detail');

  try {
    setDetailMeta(`Loading DOT ${dotCode}...`);
    const params = getFilterParams();
    const query = new URLSearchParams();
    if (params.stateId !== null) {
      query.set('stateId', String(params.stateId));
    }
    if (params.countyId !== null) {
      query.set('countyId', String(params.countyId));
    }
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const data = await api(`/api/jobs/${dotCode}${suffix}`, { signal: request.signal });
    if (!isLatestRequest('detail', request.id)) {
      return;
    }
    const { job, tasks, topStates, topCounties = [] } = data;

    const detail = document.createElement('div');
    detail.className = 'detail';

    const summaryCard = document.createElement('section');
    summaryCard.className = 'detail-card';
    summaryCard.innerHTML = `
      <h3>${escapeHtml(job.title)}</h3>
      <p><strong>DOT:</strong> ${escapeHtml(job.dot_code)}</p>
      <p><strong>VQ:</strong> ${fmtDecimal(job.vq)} &nbsp; <strong>SVP:</strong> ${fmtNumber(job.svp)} &nbsp; <strong>Population:</strong> ${fmtNumber(job.population)}</p>
      <p><strong>Skill VQ:</strong> ${fmtDecimal(job.skill_vq, 2)} &nbsp; <strong>Skill Alt:</strong> ${fmtDecimal(job.skill_alt, 2)} &nbsp; <strong>Skill Bucket:</strong> ${fmtNumber(job.skill_bucket)}</p>
      <p><strong>ONET:</strong> ${escapeHtml(job.onet_ou_code || 'n/a')} &nbsp; <strong>Disability Code:</strong> ${escapeHtml(job.disability_code || 'n/a')}</p>
      <p>${escapeHtml(job.description || 'No description available.')}</p>
    `;

    const vectorCard = document.createElement('section');
    vectorCard.className = 'detail-card';
    const vectorTitle = document.createElement('h3');
    vectorTitle.textContent = 'Trait Requirement Vector';
    vectorCard.appendChild(vectorTitle);
    vectorCard.appendChild(renderTraitVector(job.trait_vector || ''));

    const tasksCard = document.createElement('section');
    tasksCard.className = 'detail-card';
    const tasksTitle = document.createElement('h3');
    tasksTitle.textContent = 'Task Statements';
    tasksCard.appendChild(tasksTitle);

    if (tasks.length) {
      const list = document.createElement('ol');
      list.className = 'tasks';
      tasks.slice(0, 12).forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.textContent = task.description;
        list.appendChild(li);
      });
      tasksCard.appendChild(list);
    } else {
      tasksCard.innerHTML += '<div class="empty">No task statements available.</div>';
    }

    detail.append(summaryCard, vectorCard, tasksCard, renderTopStatesCard(topStates));
    if (params.stateId !== null) {
      detail.appendChild(renderTopCountiesCard(topCounties));
    }

    els.jobDetail.innerHTML = '';
    els.jobDetail.appendChild(detail);
    state.lastDetailLoadedDot = job.dot_code;
    setDetailMeta(`Loaded DOT ${job.dot_code}`);
    setDashboardActionStates();
  } catch (error) {
    if (isAbortError(error) || !isLatestRequest('detail', request.id)) {
      return;
    }
    state.lastDetailLoadedDot = null;
    setDetailMeta(error.message);
    els.jobDetail.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
    setDashboardActionStates();
  } finally {
    finishTrackedRequest('detail', request.id);
  }
}

async function runSearch() {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    setResultsMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  state.mode = 'search';
  resetTransferableContext();
  setDashboardActionStates();
  const request = beginTrackedRequest('results');
  cancelTrackedRequest('detail');
  const params = getFilterParams();
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.stateId !== null) query.set('stateId', String(params.stateId));
  if (params.countyId !== null) query.set('countyId', String(params.countyId));
  query.set('limit', String(RESULTS_PAGE_SIZE));
  query.set('offset', '0');

  persistUiState();
  setRunButtonsBusy(true, 'search');
  hideLoadMore();
  setResultsMeta('Searching...');
  invalidateReport('Search results updated. Generate a new report.');

  try {
    const data = await api(`/api/jobs/search?${query.toString()}`, { signal: request.signal });
    if (!isLatestRequest('results', request.id)) {
      return;
    }
    state.results = data.jobs;
    state.resultsTotal = Number(data.total || 0);
    state.hasExecutedRegionRun = true;
    state.selectedDot = null;
    state.selectedResultButton = null;
    setResultsMeta(`Search returned ${state.resultsTotal.toLocaleString()} jobs (${state.results.length.toLocaleString()} shown).`);
    renderResults();
    updateLoadMoreVisibility();
  } catch (error) {
    if (isAbortError(error) || !isLatestRequest('results', request.id)) {
      return;
    }
    setResultsMeta(error.message);
    clearResults();
  } finally {
    if (isLatestRequest('results', request.id)) {
      setRunButtonsBusy(false);
    }
    finishTrackedRequest('results', request.id);
  }
}

async function runMatch() {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    setResultsMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  state.mode = 'match';
  resetTransferableContext();
  setDashboardActionStates();
  const request = beginTrackedRequest('results');
  cancelTrackedRequest('detail');
  const params = getFilterParams();

  persistUiState();
  setRunButtonsBusy(true, 'match');
  hideLoadMore();
  setResultsMeta('Computing match scores...');
  invalidateReport('Match results updated. Generate a new report.');

  try {
    const data = await api('/api/match', {
      method: 'POST',
      signal: request.signal,
      body: JSON.stringify({
        q: params.q,
        stateId: params.stateId,
        countyId: params.countyId,
        profile: state.profile,
        limit: RESULTS_PAGE_SIZE,
        offset: 0
      })
    });
    if (!isLatestRequest('results', request.id)) {
      return;
    }

    state.results = data.results;
    state.resultsTotal = Number(data.total || 0);
    state.hasExecutedRegionRun = true;
    state.selectedDot = null;
    state.selectedResultButton = null;
    setResultsMeta(
      `Match returned ${state.results.length.toLocaleString()} ranked jobs out of ${state.resultsTotal.toLocaleString()} total.`
    );
    renderResults();
    updateLoadMoreVisibility();
  } catch (error) {
    if (isAbortError(error) || !isLatestRequest('results', request.id)) {
      return;
    }
    setResultsMeta(error.message);
    clearResults();
  } finally {
    if (isLatestRequest('results', request.id)) {
      setRunButtonsBusy(false);
    }
    finishTrackedRequest('results', request.id);
  }
}

async function runTransferableSkills() {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    setResultsMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  const sourceDots = resolveTsaSourceDots();
  if (!sourceDots.length) {
    state.mode = 'tsa';
    state.tsaSourceDots = [];
    resetTransferableContext();
    setDashboardActionStates();
    setResultsMeta('Enter one or more source DOTs (comma-separated) or select a result, then run transferable skills.');
    clearResults();
    invalidateReport('Transferable skills analysis is active. Select a target job and generate report.');
    return;
  }

  state.mode = 'tsa';
  state.tsaSourceDots = sourceDots;
  els.tsaSourceInput.value = formatSourceDotList(sourceDots);
  setDashboardActionStates();

  const request = beginTrackedRequest('results');
  cancelTrackedRequest('detail');
  const params = getFilterParams();

  persistUiState();
  setRunButtonsBusy(true, 'tsa');
  hideLoadMore();
  setResultsMeta(`Running transferable skills analysis from ${sourceDots.length.toLocaleString()} source DOT(s)...`);
  invalidateReport('Transferable skills analysis updated. Generate a new report.');

  try {
    const data = await api('/api/transferable-skills/analyze', {
      method: 'POST',
      signal: request.signal,
      body: JSON.stringify({
        sourceDots,
        q: params.q,
        stateId: params.stateId,
        countyId: params.countyId,
        profile: state.profile,
        limit: RESULTS_PAGE_SIZE,
        offset: 0
      })
    });
    if (!isLatestRequest('results', request.id)) {
      return;
    }

    state.results = data.results || [];
    state.resultsTotal = Number(data.total || 0);
    state.tsaBandCounts = data.tsp_band_counts || null;
    state.tsaAnalysisBasis = data.analysis_basis || null;
    updateManualTsaBasis();
    state.hasExecutedRegionRun = true;
    state.selectedDot = null;
    state.selectedResultButton = null;

    const sourceJobs = Array.isArray(data.source_jobs) ? data.source_jobs : [];
    const sourceLabel = sourceJobs.length
      ? sourceJobs.map((row) => `${row.dot_code}${row.title ? ` (${row.title})` : ''}`).join(', ')
      : sourceDots.join(', ');
    const bandSummary = buildTspBandSummary(state.tsaBandCounts);
    setResultsMeta(
      `Transferable skills from ${sourceDots.length.toLocaleString()} source DOT(s) [${sourceLabel}]: ${state.results.length.toLocaleString()} shown of ${state.resultsTotal.toLocaleString()}.${bandSummary ? ` ${bandSummary}.` : ''}`
    );
    renderResults();
    updateLoadMoreVisibility();
  } catch (error) {
    if (isAbortError(error) || !isLatestRequest('results', request.id)) {
      return;
    }
    resetTransferableContext();
    setResultsMeta(error.message);
    clearResults();
  } finally {
    if (isLatestRequest('results', request.id)) {
      setRunButtonsBusy(false);
    }
    finishTrackedRequest('results', request.id);
  }
}

async function loadMoreResults() {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    setResultsMeta(`Blocked: ${blockedMessage}`);
    return;
  }

  if (!state.results.length || state.results.length >= state.resultsTotal) {
    return;
  }

  const request = beginTrackedRequest('results');
  cancelTrackedRequest('detail');
  const params = getFilterParams();
  const offset = state.results.length;

  setRunButtonsDisabled(true);
  setLoadMoreBusy(true);
  const modeLabel = state.mode === 'match' ? 'matches' : state.mode === 'tsa' ? 'transferable-skill matches' : 'jobs';
  setResultsMeta(`Loading more ${modeLabel}...`);

  try {
    let rows = [];
    let total = state.resultsTotal;
    let appendedCount = 0;

    if (state.mode === 'match') {
      const data = await api('/api/match', {
        method: 'POST',
        signal: request.signal,
        body: JSON.stringify({
          q: params.q,
          stateId: params.stateId,
          countyId: params.countyId,
          profile: state.profile,
          limit: RESULTS_PAGE_SIZE,
          offset
        })
      });
      if (!isLatestRequest('results', request.id)) {
        return;
      }
      rows = data.results || [];
      total = Number(data.total || 0);
    } else if (state.mode === 'tsa') {
      const sourceDots = resolveTsaSourceDots();
      if (!sourceDots.length) {
        throw new Error('At least one source DOT is required for transferable skills analysis');
      }

      const data = await api('/api/transferable-skills/analyze', {
        method: 'POST',
        signal: request.signal,
        body: JSON.stringify({
          sourceDots,
          q: params.q,
          stateId: params.stateId,
          countyId: params.countyId,
          profile: state.profile,
          limit: RESULTS_PAGE_SIZE,
          offset
        })
      });
      if (!isLatestRequest('results', request.id)) {
        return;
      }
      rows = data.results || [];
      total = Number(data.total || 0);
      state.tsaBandCounts = data.tsp_band_counts || null;
      state.tsaAnalysisBasis = data.analysis_basis || null;
      updateManualTsaBasis();
    } else {
      const query = new URLSearchParams();
      if (params.q) query.set('q', params.q);
      if (params.stateId !== null) query.set('stateId', String(params.stateId));
      if (params.countyId !== null) query.set('countyId', String(params.countyId));
      query.set('limit', String(RESULTS_PAGE_SIZE));
      query.set('offset', String(offset));

      const data = await api(`/api/jobs/search?${query.toString()}`, { signal: request.signal });
      if (!isLatestRequest('results', request.id)) {
        return;
      }
      rows = data.jobs || [];
      total = Number(data.total || 0);
    }

    state.resultsTotal = total;

    if (rows.length > 0) {
      const merged = appendUniqueResults(state.results, rows);
      appendedCount = merged.appendedCount;

      if (appendedCount > 0) {
        state.results = merged.rows;
        renderResults();
        updateLoadMoreVisibility();
        invalidateReport('Results updated. Generate a new report.');
      } else {
        state.resultsTotal = state.results.length;
      }
    } else {
      state.resultsTotal = Math.min(state.resultsTotal, state.results.length);
    }

    const endReached = state.results.length >= state.resultsTotal || rows.length === 0 || appendedCount === 0;
    if (state.mode === 'match') {
      setResultsMeta(
        `Match returned ${state.results.length.toLocaleString()} ranked jobs out of ${state.resultsTotal.toLocaleString()} total${endReached ? ' (end reached).' : '.'}`
      );
    } else if (state.mode === 'tsa') {
      const sourceDots = resolveTsaSourceDots();
      const bandSummary = buildTspBandSummary(state.tsaBandCounts);
      setResultsMeta(
        `Transferable skills from ${sourceDots.length.toLocaleString()} source DOT(s): ${state.results.length.toLocaleString()} shown of ${state.resultsTotal.toLocaleString()}${endReached ? ' (end reached).' : '.'}${bandSummary ? ` ${bandSummary}.` : ''}`
      );
    } else {
      setResultsMeta(
        `Search returned ${state.resultsTotal.toLocaleString()} jobs (${state.results.length.toLocaleString()} shown)${endReached ? ' (end reached).' : '.'}`
      );
    }
  } catch (error) {
    if (isAbortError(error) || !isLatestRequest('results', request.id)) {
      return;
    }
    setResultsMeta(error.message);
  } finally {
    if (isLatestRequest('results', request.id)) {
      setLoadMoreBusy(false);
      setRunButtonsDisabled(false);
      updateLoadMoreVisibility();
    }
    finishTrackedRequest('results', request.id);
  }
}

function renderMatchReport(report) {
  const selected = report.selected_job;
  const summary = report.summary || {};
  const generatedAt = report.generated_at_utc
    ? new Date(report.generated_at_utc).toLocaleString()
    : 'n/a';
  const sourceMode = report.mvqs_coverage?.metadata?.source_mode || 'n/a';
  const sourcePath = report.mvqs_coverage?.metadata?.source_main_path || 'n/a';

  const snapshot = document.createElement('section');
  snapshot.className = 'detail-card';
  snapshot.innerHTML = `
    <h3>Snapshot</h3>
    <p><strong>Generated:</strong> ${escapeHtml(generatedAt)}</p>
    <p><strong>Source Mode:</strong> ${escapeHtml(sourceMode)} &nbsp; <strong>Pool Total:</strong> ${fmtNumber(report.match_pool_total)}</p>
    <p><strong>Region:</strong> ${escapeHtml(getSelectedRegionLabel(report))}</p>
    <p><strong>Query:</strong> ${escapeHtml(report.filters?.q || 'none')}</p>
    <p><strong>Selected Source:</strong> ${escapeHtml(describeSelectedSource(report))}</p>
    <p><strong>Average Match:</strong> ${fmtDecimal(summary.average_match_score)}% &nbsp; <strong>Rows in Report:</strong> ${fmtNumber(summary.result_count)}</p>
    <p><strong>Source Path:</strong> ${escapeHtml(sourcePath)}</p>
  `;

  const selectedCard = document.createElement('section');
  selectedCard.className = 'detail-card';
  if (!selected) {
    selectedCard.innerHTML = '<h3>Selected Job</h3><div class="empty">No selected job in report.</div>';
  } else {
    const gaps = selected.trait_gaps || [];
    const topGapRows = gaps
      .filter((row) => row.deficit > 0)
      .sort((a, b) => b.deficit - a.deficit)
      .slice(0, 8);
    const topGapText = topGapRows.length
      ? topGapRows
          .map((row) => `${escapeHtml(row.code)} (${escapeHtml(row.label)}): +${fmtNumber(row.deficit)}`)
          .join('<br />')
      : 'No deficits against selected profile.';

    selectedCard.innerHTML = `
      <h3>Selected Job</h3>
      <p><strong>${escapeHtml(selected.title)}</strong> (${escapeHtml(selected.dot_code)})</p>
      <p><strong>Match:</strong> ${fmtDecimal(selected.match_score)}% &nbsp; <strong>Deficit:</strong> ${fmtNumber(selected.deficit)} &nbsp; <strong>Jobs:</strong> ${fmtNumber(selected.job_count)}</p>
      <p><strong>VQ:</strong> ${fmtDecimal(selected.vq)} &nbsp; <strong>SVP:</strong> ${fmtNumber(selected.svp)} &nbsp; <strong>Population:</strong> ${fmtNumber(selected.population)}</p>
      <p><strong>Skill VQ:</strong> ${fmtDecimal(selected.skill_vq, 2)} &nbsp; <strong>Skill Alt:</strong> ${fmtDecimal(selected.skill_alt, 2)} &nbsp; <strong>Skill Bucket:</strong> ${fmtNumber(selected.skill_bucket)}</p>
      <p><strong>ONET:</strong> ${escapeHtml(selected.onet_ou_code || 'n/a')} &nbsp; <strong>Disability:</strong> ${escapeHtml(selected.disability_code || 'n/a')}</p>
      <p><strong>Primary Gaps:</strong><br />${topGapText}</p>
    `;

    const tasks = selected.tasks || [];
    if (tasks.length) {
      const taskList = document.createElement('ol');
      taskList.className = 'tasks';
      tasks.slice(0, 8).forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.textContent = task.description;
        taskList.appendChild(li);
      });
      selectedCard.appendChild(taskList);
    }

    if (selected.top_states?.length) {
      const chips = document.createElement('div');
      chips.className = 'top-states';
      selected.top_states.forEach((row) => {
        chips.appendChild(makePill(`${row.state_abbrev}: ${Number(row.job_count).toLocaleString()}`, 'accent'));
      });
      selectedCard.appendChild(chips);
    }

    if (selected.top_counties?.length) {
      const chips = document.createElement('div');
      chips.className = 'top-states';
      selected.top_counties.forEach((row) => {
        chips.appendChild(makePill(`${row.county_name}: ${Number(row.job_count).toLocaleString()}`, 'accent'));
      });
      selectedCard.appendChild(chips);
    }
  }

  const matchesCard = document.createElement('section');
  matchesCard.className = 'detail-card';
  const table = document.createElement('table');
  table.className = 'report-table';

  const header = document.createElement('tr');
  ['#', 'DOT', 'Title', 'Match', 'Deficit', 'Jobs', 'VQ', 'SVP'].forEach((label) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    header.appendChild(th);
  });
  table.appendChild(header);

  const previewRows = (report.matches || []).slice(0, 15);
  previewRows.forEach((row, index) => {
    const tr = document.createElement('tr');
    const cells = [
      String(index + 1),
      row.dot_code,
      row.title,
      `${fmtDecimal(row.match_score)}%`,
      fmtNumber(row.deficit),
      fmtNumber(row.job_count),
      fmtDecimal(row.vq),
      fmtNumber(row.svp)
    ];
    cells.forEach((text) => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  matchesCard.appendChild(document.createElement('h3')).textContent = 'Top Ranked Matches';
  if (previewRows.length) {
    matchesCard.appendChild(table);
  } else {
    matchesCard.innerHTML += '<div class="empty">No matches in report.</div>';
  }

  els.reportBody.innerHTML = '';
  els.reportBody.append(snapshot, selectedCard, matchesCard);
}

function renderTransferableReport(report) {
  const selected = report.selected_job;
  const summary = report.summary || {};
  const generatedAt = report.generated_at_utc
    ? new Date(report.generated_at_utc).toLocaleString()
    : 'n/a';
  const sourceMode = report.mvqs_coverage?.metadata?.source_mode || 'n/a';
  const sourcePath = report.mvqs_coverage?.metadata?.source_main_path || 'n/a';
  const sourceJobs = Array.isArray(report.source_jobs) ? report.source_jobs : [];
  const sourceJobLabel = sourceJobs.length
    ? sourceJobs.map((row) => `${row.dot_code}${row.title ? ` (${row.title})` : ''}`).join(', ')
    : 'n/a';
  const diagnostics = report.transferability_diagnostics || {};

  const snapshot = document.createElement('section');
  snapshot.className = 'detail-card';
  snapshot.innerHTML = `
    <h3>Snapshot</h3>
    <p><strong>Generated:</strong> ${escapeHtml(generatedAt)}</p>
    <p><strong>Source Mode:</strong> ${escapeHtml(sourceMode)} &nbsp; <strong>Pool Total:</strong> ${fmtNumber(report.match_pool_total)}</p>
    <p><strong>Region:</strong> ${escapeHtml(getSelectedRegionLabel(report))}</p>
    <p><strong>Query:</strong> ${escapeHtml(report.filters?.q || 'none')}</p>
    <p><strong>Source DOTs:</strong> ${escapeHtml(sourceJobLabel)}</p>
    <p><strong>Average TSP:</strong> ${fmtDecimal(summary.average_tsp_percent)}% &nbsp; <strong>Average VA Adj:</strong> ${fmtDecimal(summary.average_va_adjustment_percent)}%</p>
    <p><strong>Rows in Report:</strong> ${fmtNumber(summary.result_count)}</p>
    <p><strong>Candidates Evaluated:</strong> ${fmtNumber(diagnostics.candidate_count)} &nbsp; <strong>Physical Gate Exclusions:</strong> ${fmtNumber(
      diagnostics.physical_gate_excluded_count
    )}</p>
    <p><strong>Source Path:</strong> ${escapeHtml(sourcePath)}</p>
  `;

  const selectedCard = document.createElement('section');
  selectedCard.className = 'detail-card';
  if (!selected) {
    selectedCard.innerHTML = '<h3>Selected Target Job</h3><div class="empty">No selected job in report.</div>';
  } else {
    const signals = selected.signal_scores || {};
    const topStatesText = Array.isArray(selected.top_states) && selected.top_states.length
      ? selected.top_states.slice(0, 8).map((row) => `${row.state_abbrev}: ${fmtNumber(row.job_count)}`).join(', ')
      : 'No state counts available.';
    const topCountiesText = Array.isArray(selected.top_counties) && selected.top_counties.length
      ? selected.top_counties.slice(0, 8).map((row) => `${row.county_name}: ${fmtNumber(row.job_count)}`).join(', ')
      : 'No county counts available.';
    const physicalSource = formatPhysicalDemandLevel(
      selected.physical_demand_source_level ?? selected.strength_source_level
    );
    const physicalTarget = formatPhysicalDemandLevel(
      selected.physical_demand_target_level ?? selected.strength_target_level ?? parseStrengthLevelFromTraitVector(selected.trait_vector)
    );
    const physicalProfile = formatPhysicalDemandLevel(
      selected.physical_demand_profile_level ?? selected.strength_profile_level
    );
    const physicalProfileDeficits = fmtNumber(selected.physical_demand_profile_deficit_count);
    const physicalSourceDeficits = fmtNumber(selected.physical_demand_source_deficit_count);
    const physicalGate = Number(selected.physical_demand_gate_failed) === 1 ? 'Fail' : 'Pass';
    selectedCard.innerHTML = `
      <h3>Selected Target Job</h3>
      <p><strong>${escapeHtml(selected.title)}</strong> &nbsp; DOT ${escapeHtml(selected.dot_code)}</p>
      <p><strong>TSP:</strong> ${fmtDecimal(selected.tsp_percent)}% (Level ${fmtNumber(selected.tsp_level)} ${escapeHtml(selected.tsp_label || '')})</p>
      <p><strong>TSP (Unadjusted):</strong> ${fmtDecimal(selected.tsp_percent_unadjusted)}% &nbsp; <strong>VA Adjustment:</strong> ${fmtDecimal(selected.va_adjustment_percent)}%</p>
      <p><strong>Best Source:</strong> ${escapeHtml(selected.best_source_dot_code || 'n/a')} ${escapeHtml(selected.best_source_title ? `(${selected.best_source_title})` : '')}</p>
      <p><strong>Direction:</strong> ${escapeHtml(selected.transfer_direction || 'n/a')} &nbsp; <strong>Jobs:</strong> ${fmtNumber(selected.job_count)}</p>
      <p><strong>VQ/SVP:</strong> ${fmtDecimal(selected.vq)} / ${fmtNumber(selected.svp)}</p>
      <p><strong>Physical Demand (PD1):</strong> source ${escapeHtml(physicalSource)} -> target ${escapeHtml(
      physicalTarget
    )} | profile ${escapeHtml(physicalProfile)}</p>
      <p><strong>Physical-Demand Deficits (PD1-PD6):</strong> profile ${escapeHtml(
      physicalProfileDeficits
    )}, source ${escapeHtml(physicalSourceDeficits)} | <strong>Physical Gate:</strong> ${escapeHtml(physicalGate)}</p>
      <p><strong>Signal Scores:</strong> DOT ${fmtDecimal(signals.dot_prefix, 3)}, O*NET ${fmtDecimal(signals.onet_prefix, 3)}, VQ ${fmtDecimal(signals.vq_proximity, 3)}, SVP ${fmtDecimal(signals.svp_proximity, 3)}, Core ${fmtDecimal(signals.tier_core_score, 3)}, Progress ${fmtDecimal(signals.in_tier_progress, 3)}</p>
      <p><strong>Top States:</strong> ${escapeHtml(topStatesText)}</p>
      <p><strong>Top Counties:</strong> ${escapeHtml(topCountiesText)}</p>
    `;

    const tasks = selected.tasks || [];
    const tasksBlock = document.createElement('div');
    tasksBlock.className = 'detail-card';
    tasksBlock.innerHTML = '<h3>Task Statements</h3>';
    if (tasks.length) {
      const list = document.createElement('ol');
      list.className = 'tasks';
      tasks.slice(0, 12).forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.textContent = task.description;
        list.appendChild(li);
      });
      tasksBlock.appendChild(list);
    } else {
      tasksBlock.innerHTML += '<div class="empty">No tasks available.</div>';
    }
    selectedCard.appendChild(tasksBlock);
  }

  const matchesCard = document.createElement('section');
  matchesCard.className = 'detail-card';
  matchesCard.appendChild(document.createElement('h3')).textContent = 'Top Transferable-Skills Matches';
  const table = document.createElement('table');
  table.className = 'report-table';
  const header = document.createElement('tr');
  ['#', 'DOT', 'Title', 'TSP', 'VA Adj', 'Level', 'Best Source', 'Jobs', 'VQ', 'SVP'].forEach((label) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    header.appendChild(th);
  });
  table.appendChild(header);

  const previewRows = (report.matches || []).slice(0, 15);
  previewRows.forEach((row, index) => {
    const tr = document.createElement('tr');
    const cells = [
      String(index + 1),
      row.dot_code,
      row.title,
      `${fmtDecimal(row.tsp_percent)}%`,
      `${fmtDecimal(row.va_adjustment_percent)}%`,
      `${fmtNumber(row.tsp_level)} ${row.tsp_label || ''}`.trim(),
      row.best_source_dot_code || 'n/a',
      fmtNumber(row.job_count),
      fmtDecimal(row.vq),
      fmtNumber(row.svp)
    ];
    cells.forEach((text) => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  if (previewRows.length) {
    matchesCard.appendChild(table);
  } else {
    matchesCard.innerHTML += '<div class="empty">No transferable-skills matches in report.</div>';
  }

  els.reportBody.innerHTML = '';
  els.reportBody.append(snapshot, selectedCard, matchesCard);
}

function renderReport(report, renderHtml = null) {
  const htmlSource = renderHtml || state.reportHtml || null;
  if (htmlSource) {
    renderCanonicalHtml(els.reportBody, htmlSource);
    return;
  }
  if (report?.report_type === 'mvqs_transferable_skills_report') {
    renderTransferableReport(report);
    return;
  }
  renderMatchReport(report);
}

function sanitizeFileToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function getReportBaseName(report) {
  const timestamp = (report.generated_at_utc || new Date().toISOString()).replace(/[:.]/g, '-');
  const dot = sanitizeFileToken(report.selected_job?.dot_code || 'none');
  return `mvqs-report-${dot}-${timestamp}`;
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function asMarkdownCell(value) {
  return String(value ?? '').replaceAll('|', '\\|');
}

const STRENGTH_LEVEL_LABELS = {
  1: 'Sedentary',
  2: 'Light',
  3: 'Medium',
  4: 'Heavy',
  5: 'Very Heavy'
};
const STRENGTH_LEVEL_SHORT = {
  1: 'Sed',
  2: 'Lgt',
  3: 'Med',
  4: 'Hvy',
  5: 'VH'
};

function normalizeStrengthLevel(level) {
  const numeric = Number(level);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  const rounded = Math.round(numeric);
  return Object.hasOwn(STRENGTH_LEVEL_LABELS, rounded) ? rounded : null;
}

function parseStrengthLevelFromTraitVector(traitVector) {
  const text = String(traitVector || '').replaceAll(/[^0-9]/g, '');
  if (text.length < 12) {
    return null;
  }
  const numeric = Number.parseInt(text[11], 10);
  return Number.isFinite(numeric) ? normalizeStrengthLevel(numeric) : null;
}

function formatPhysicalDemandLevel(level) {
  const normalized = normalizeStrengthLevel(level);
  if (normalized === null) {
    return 'n/a';
  }
  return `${normalized}/${STRENGTH_LEVEL_SHORT[normalized] || '?'}`;
}

function deriveSkillLevelLabel(vq, svp) {
  const numericVq = Number(vq);
  const numericSvp = Number(svp);
  if (Number.isFinite(numericVq) && numericVq < 85) {
    return 'Unskilled';
  }
  if (Number.isFinite(numericSvp) && numericSvp <= 2) {
    return 'Unskilled';
  }
  if (Number.isFinite(numericSvp) && numericSvp <= 4) {
    return 'Semi-skilled';
  }
  if (Number.isFinite(numericSvp)) {
    return 'Skilled';
  }
  return 'n/a';
}

function formatProfileVector(profileValues) {
  if (!Array.isArray(profileValues) || !profileValues.length) {
    return 'n/a';
  }
  return profileValues.map((value) => fmtNumber(value)).join('');
}

function buildMatchReportMarkdown(report) {
  const selected = report.selected_job;
  const lines = [];

  lines.push('# MVQS Match Report');
  lines.push('');
  lines.push(`- Generated (UTC): ${report.generated_at_utc || 'n/a'}`);
  lines.push(`- Source mode: ${report.mvqs_coverage?.metadata?.source_mode || 'n/a'}`);
  lines.push(`- Region: ${getSelectedRegionLabel(report)}`);
  lines.push(`- Query: ${report.filters?.q || 'none'}`);
  lines.push(`- Selected source: ${describeSelectedSource(report)}`);
  lines.push(`- Match pool total: ${report.match_pool_total ?? 'n/a'}`);
  lines.push(`- Included matches: ${report.matches?.length ?? 0}`);
  lines.push('');

  lines.push('## Client Profile');
  lines.push('');
  const traits = report.profile?.traits || [];
  const values = report.profile?.values || [];
  traits.forEach((trait, index) => {
    lines.push(`- ${trait.code} (${trait.label}): ${values[index] ?? 'n/a'}`);
  });
  lines.push('');

  lines.push('## Selected Job');
  lines.push('');
  if (!selected) {
    lines.push('No selected job.');
    lines.push('');
  } else {
    lines.push(`- Title: ${selected.title}`);
    lines.push(`- DOT: ${selected.dot_code}`);
    lines.push(`- Match: ${fmtDecimal(selected.match_score)}%`);
    lines.push(`- Deficit: ${fmtNumber(selected.deficit)}`);
    lines.push(`- Jobs in region: ${fmtNumber(selected.job_count)}`);
    lines.push(`- VQ/SVP: ${fmtDecimal(selected.vq)} / ${fmtNumber(selected.svp)}`);
    lines.push(`- Population: ${fmtNumber(selected.population)}`);
    lines.push(`- Skill VQ/Alt/Bucket: ${fmtDecimal(selected.skill_vq, 2)} / ${fmtDecimal(selected.skill_alt, 2)} / ${fmtNumber(selected.skill_bucket)}`);
    lines.push(`- ONET: ${selected.onet_ou_code || 'n/a'}`);
    lines.push(`- Disability Code: ${selected.disability_code || 'n/a'}`);
    lines.push('');

    lines.push('### Trait Gaps');
    lines.push('');
    const traitGaps = selected.trait_gaps || [];
    if (!traitGaps.length) {
      lines.push('- No trait gap data.');
    } else {
      traitGaps
        .filter((row) => row.deficit > 0)
        .sort((a, b) => b.deficit - a.deficit)
        .forEach((row) => {
          lines.push(`- ${row.code} (${row.label}): profile ${row.profile_value}, requires ${row.required_value}, deficit ${row.deficit}`);
        });
      if (!traitGaps.some((row) => row.deficit > 0)) {
        lines.push('- No deficits.');
      }
    }
    lines.push('');

    lines.push('### Task Statements');
    lines.push('');
    const tasks = selected.tasks || [];
    if (!tasks.length) {
      lines.push('- No tasks available.');
    } else {
      tasks.slice(0, 20).forEach((task, index) => {
        lines.push(`${index + 1}. ${task.description}`);
      });
    }
    lines.push('');

    lines.push('### Top State Counts');
    lines.push('');
    const topStates = selected.top_states || [];
    if (!topStates.length) {
      lines.push('- No state counts available.');
    } else {
      topStates.forEach((row) => {
        lines.push(`- ${row.state_abbrev} (${row.state_name}): ${row.job_count}`);
      });
    }
    lines.push('');

    lines.push('### Top County Counts (Selected State)');
    lines.push('');
    const topCounties = selected.top_counties || [];
    if (!topCounties.length) {
      lines.push('- No county counts available.');
    } else {
      topCounties.forEach((row) => {
        lines.push(`- ${row.county_name}: ${row.job_count}`);
      });
    }
    lines.push('');
  }

  lines.push('## Ranked Matches');
  lines.push('');
  lines.push('| Rank | DOT | Title | Match % | Deficit | Jobs | VQ | SVP |');
  lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |');
  (report.matches || []).slice(0, 40).forEach((row, index) => {
    lines.push(
      `| ${index + 1} | ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title)} | ${fmtDecimal(row.match_score)} | ${fmtNumber(row.deficit)} | ${fmtNumber(row.job_count)} | ${fmtDecimal(row.vq)} | ${fmtNumber(row.svp)} |`
    );
  });

  return `${lines.join('\n')}\n`;
}

function buildTransferableReportMarkdown(report) {
  const selected = report.selected_job;
  const lines = [];
  const sourceJobs = Array.isArray(report.source_jobs) ? report.source_jobs : [];
  const sourceDotList = sourceJobs.map((row) => row.dot_code).filter(Boolean);
  const summary = report.summary || {};
  const bandCounts = report.tsp_band_counts || {};
  const profileValues = report.profile?.values || null;
  const basis = report.analysis_basis || {};
  const basisNotes = Array.isArray(basis.notes) ? basis.notes : [];
  const basisFactors = Array.isArray(basis.factors) ? basis.factors : [];
  const diagnostics = report.transferability_diagnostics || {};
  const levels =
    Array.isArray(report.tsp_levels) && report.tsp_levels.length
      ? report.tsp_levels
      : [
          { level: 5, min: 80, max: 97, label: 'High transferable skills' },
          { level: 4, min: 60, max: 79.9, label: 'Moderate transferable skills' },
          { level: 3, min: 40, max: 59.9, label: 'Low transferable skills' },
          { level: 2, min: 20, max: 39.9, label: 'Few transferable skills' },
          { level: 1, min: 0, max: 19.9, label: 'No significant transferable skills' }
        ];

  lines.push('# MVQS - Transferable Skills - Case Report');
  lines.push('');
  lines.push('## Report 1: Client Identification, Labor Market Area, and Referral');
  lines.push('');
  lines.push(`- Generated (UTC): ${report.generated_at_utc || 'n/a'}`);
  lines.push(`- Source mode: ${report.mvqs_coverage?.metadata?.source_mode || 'n/a'}`);
  lines.push(`- Source path: ${report.mvqs_coverage?.metadata?.source_main_path || 'n/a'}`);
  lines.push(`- Region: ${getSelectedRegionLabel(report)}`);
  lines.push(`- Query: ${report.filters?.q || 'none'}`);
  lines.push(`- Source DOTs: ${sourceDotList.length ? sourceDotList.join(', ') : 'n/a'}`);
  lines.push(`- Match pool total: ${report.match_pool_total ?? 'n/a'}`);
  lines.push(`- Included matches in report: ${report.matches?.length ?? 0}`);
  lines.push('');

  lines.push('## Report 3: Worker Trait Profiles');
  lines.push('');
  lines.push(`- Evaluative profile vector (24 traits): ${formatProfileVector(profileValues)}`);
  lines.push('- Trait order: R M L S P Q K F M E C | PD1..PD6 | EC1..EC7');
  lines.push('');
  lines.push('| Source DOT | Title | VQ | SVP | Trait Vector |');
  lines.push('| --- | --- | ---: | ---: | --- |');
  if (!sourceJobs.length) {
    lines.push('| n/a | n/a | n/a | n/a | n/a |');
  } else {
    sourceJobs.forEach((row) => {
      lines.push(
        `| ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title || 'Untitled')} | ${fmtDecimal(row.vq)} | ${fmtNumber(row.svp)} | ${asMarkdownCell(row.trait_vector || '')} |`
      );
    });
  }
  lines.push('');

  lines.push('## Report 4: Transferable Skills Availability and Utilization');
  lines.push('');
  lines.push(
    `- Average TSP: ${summary.average_tsp_percent === null || summary.average_tsp_percent === undefined ? 'n/a' : `${fmtDecimal(summary.average_tsp_percent)}%`}`
  );
  lines.push(
    `- Average VA adjustment: ${summary.average_va_adjustment_percent === null || summary.average_va_adjustment_percent === undefined ? 'n/a' : `${fmtDecimal(summary.average_va_adjustment_percent)}%`}`
  );
  lines.push(
    `- Diagnostics: candidates ${fmtNumber(diagnostics.candidate_count)}, physical gate exclusions ${fmtNumber(
      diagnostics.physical_gate_excluded_count
    )}`
  );
  lines.push(
    `- Band totals: L5 ${fmtNumber(bandCounts.level_5)} | L4 ${fmtNumber(bandCounts.level_4)} | L3 ${fmtNumber(bandCounts.level_3)} | L2 ${fmtNumber(bandCounts.level_2)} | L1 ${fmtNumber(bandCounts.level_1)}`
  );
  lines.push('');
  lines.push('| TS Level | Range | Count |');
  lines.push('| --- | --- | ---: |');
  levels.forEach((levelRow) => {
    lines.push(
      `| ${levelRow.level} (${levelRow.label}) | ${levelRow.min}-${Math.floor(levelRow.max)} | ${fmtNumber(
        bandCounts[`level_${levelRow.level}`] || 0
      )} |`
    );
  });
  lines.push('');

  lines.push('## Report 5: Work History Job Demands / Worker Trait Requirements');
  lines.push('');
  lines.push('| DOT | Job Title | VQ | SVP | P (PD1) | O*NET | Skill Level | Trait Vector |');
  lines.push('| --- | --- | ---: | ---: | --- | --- | --- | --- |');
  if (!sourceJobs.length) {
    lines.push('| n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |');
  } else {
    sourceJobs.forEach((row) => {
      lines.push(
        `| ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title || 'Untitled')} | ${fmtDecimal(row.vq)} | ${fmtNumber(row.svp)} | ${asMarkdownCell(
          formatPhysicalDemandLevel(parseStrengthLevelFromTraitVector(row.trait_vector))
        )} | ${asMarkdownCell(row.onet_ou_code || '')} | ${deriveSkillLevelLabel(row.vq, row.svp)} | ${asMarkdownCell(row.trait_vector || '')} |`
      );
    });
  }
  lines.push('');

  lines.push('## Report 8: Job Matches by Transferable Skills (TS) - Job Demands');
  lines.push('');
  lines.push('| Rank | DOT | Job Title | VQ | SVP | P (PD1) | TS % | VA Adj % | Level | Best Source DOT | VIPR | Skill Level |');
  lines.push('| --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- | --- | --- | --- |');
  (report.matches || []).slice(0, 86).forEach((row, index) => {
    lines.push(
      `| ${index + 1} | ${asMarkdownCell(row.dot_code)} | ${asMarkdownCell(row.title)} | ${fmtDecimal(row.vq)} | ${fmtNumber(row.svp)} | ${asMarkdownCell(
          formatPhysicalDemandLevel(
            row.physical_demand_target_level ?? row.strength_target_level ?? parseStrengthLevelFromTraitVector(row.trait_vector)
          )
        )} | ${fmtDecimal(row.tsp_percent)} | ${fmtDecimal(row.va_adjustment_percent)} | ${fmtNumber(row.tsp_level)} ${asMarkdownCell(
          row.tsp_label || ''
        )} | ${asMarkdownCell(row.best_source_dot_code || '')} | ${asMarkdownCell(row.vipr_type || 'n/a')} | ${deriveSkillLevelLabel(row.vq, row.svp)} |`
    );
  });
  lines.push('');

  lines.push('## Selected Target Job Detail');
  lines.push('');
  if (!selected) {
    lines.push('No selected job.');
  } else {
    const signals = selected.signal_scores || {};
    lines.push(`- Title: ${selected.title}`);
    lines.push(`- DOT: ${selected.dot_code}`);
    lines.push(`- TSP (adjusted): ${fmtDecimal(selected.tsp_percent)}%`);
    lines.push(`- TSP (unadjusted): ${fmtDecimal(selected.tsp_percent_unadjusted)}%`);
    lines.push(`- VA adjustment: ${fmtDecimal(selected.va_adjustment_percent)}%`);
    lines.push(`- TSP Level: ${fmtNumber(selected.tsp_level)} (${selected.tsp_label || 'n/a'})`);
    lines.push(
      `- Physical demand (PD1): source ${formatPhysicalDemandLevel(
        selected.physical_demand_source_level ?? selected.strength_source_level
      )} -> target ${formatPhysicalDemandLevel(
        selected.physical_demand_target_level ?? selected.strength_target_level ?? parseStrengthLevelFromTraitVector(selected.trait_vector)
      )} | profile ${formatPhysicalDemandLevel(selected.physical_demand_profile_level ?? selected.strength_profile_level)}`
    );
    lines.push(
      `- Physical-demand deficits (PD1-PD6): profile deficits ${fmtNumber(
        selected.physical_demand_profile_deficit_count
      )}, source deficits ${fmtNumber(selected.physical_demand_source_deficit_count)}, gate_failed=${
        Number(selected.physical_demand_gate_failed) === 1 ? 'yes' : 'no'
      }`
    );
    lines.push(`- Transfer Direction: ${selected.transfer_direction || 'n/a'}`);
    lines.push(`- Best Source DOT: ${selected.best_source_dot_code || 'n/a'}`);
    lines.push(`- Best Source Title: ${selected.best_source_title || 'n/a'}`);
    lines.push(`- Jobs in region: ${fmtNumber(selected.job_count)}`);
    lines.push(`- Tier rule: ${selected.mtsp_tier_rule || 'n/a'}`);
    lines.push(
      `- Signal scores: DOT ${fmtDecimal(signals.dot_prefix, 3)}, O*NET ${fmtDecimal(signals.onet_prefix, 3)}, VQ ${fmtDecimal(signals.vq_proximity, 3)}, SVP ${fmtDecimal(signals.svp_proximity, 3)}, Core ${fmtDecimal(signals.tier_core_score, 3)}, Progress ${fmtDecimal(signals.in_tier_progress, 3)}`
    );
    lines.push('');
    lines.push('### Task Statements');
    const tasks = selected.tasks || [];
    if (!tasks.length) {
      lines.push('- No tasks available.');
    } else {
      tasks.slice(0, 20).forEach((task, index) => {
        lines.push(`${index + 1}. ${task.description}`);
      });
    }
  }
  lines.push('');

  lines.push('## Methodology Notes');
  lines.push('');
  lines.push(`- Analysis model: ${basis.model || 'n/a'}`);
  basisFactors.forEach((factor) => lines.push(`- Factor: ${factor}`));
  basisNotes.forEach((note) => lines.push(`- Note: ${note}`));
  lines.push(`- Source selection rule: ${basis.source_selection || 'n/a'}`);

  return `${lines.join('\n')}\n`;
}

function buildReportMarkdown(report) {
  if (report?.report_type === 'mvqs_transferable_skills_report') {
    return buildTransferableReportMarkdown(report);
  }
  return buildMatchReportMarkdown(report);
}

async function generateReport() {
  const blockedMessage = getBlockingMessage('main');
  if (blockedMessage) {
    setReportMeta(`Blocked: ${blockedMessage}`);
    setReportPlaceholder(`Blocked: ${blockedMessage}`);
    return;
  }

  if (!state.results.length) {
    setReportMeta('No results available. Run Match or Transferable Skills first.');
    setReportPlaceholder('No results available. Run Match or Transferable Skills first.');
    return;
  }

  if (state.mode !== 'match' && state.mode !== 'tsa') {
    setReportMeta('Run Match or Transferable Skills before generating a report.');
    setReportPlaceholder('Run Match or Transferable Skills before generating a report.');
    return;
  }

  const request = beginTrackedRequest('report');

  try {
    setGenerateReportBusy(true);
    setReportMeta('Generating report...');
    const params = getFilterParams();
    let data = null;
    if (state.mode === 'match') {
      const payload = {
        q: params.q,
        stateId: params.stateId,
        countyId: params.countyId,
        profile: state.profile,
        selectedDot: state.selectedDot,
        limit: 40,
        taskLimit: 30
      };
      data = await api('/api/reports/match', {
        method: 'POST',
        signal: request.signal,
        body: JSON.stringify(payload)
      });
    } else {
      const sourceDots = resolveTsaSourceDots();
      if (!sourceDots.length) {
        throw new Error('At least one source DOT is required for transferable skills report generation');
      }
      const payload = {
        q: params.q,
        stateId: params.stateId,
        countyId: params.countyId,
        profile: state.profile,
        sourceDots,
        selectedDot: state.selectedDot,
        limit: 40,
        taskLimit: 30
      };
      data = await api('/api/reports/transferable-skills', {
        method: 'POST',
        signal: request.signal,
        body: JSON.stringify(payload)
      });
    }
    if (!isLatestRequest('report', request.id)) {
      return;
    }

    state.report = data.report;
    state.reportHtml = data.render_html || null;
    renderReport(state.report, state.reportHtml);
    els.downloadJsonBtn.disabled = false;
    els.downloadMarkdownBtn.disabled = false;
    setDashboardActionStates();

    const dotLabel = state.report.selected_job?.dot_code ? `DOT ${state.report.selected_job.dot_code}` : 'no selection';
    const modeLabel = state.report.report_type === 'mvqs_transferable_skills_report' ? 'transferable-skills report' : 'match report';
    const generatedLabel = state.report.generated_at_utc
      ? new Date(state.report.generated_at_utc).toLocaleTimeString()
      : 'now';
    setReportMeta(`${modeLabel} generated for ${dotLabel} at ${generatedLabel}.`);
  } catch (error) {
    if (isAbortError(error) || !isLatestRequest('report', request.id)) {
      return;
    }
    setReportMeta(error.message);
    setReportPlaceholder(error.message);
  } finally {
    if (isLatestRequest('report', request.id)) {
      setGenerateReportBusy(false);
    }
    finishTrackedRequest('report', request.id);
  }
}

function downloadReportJson() {
  if (!state.report) {
    return;
  }
  const base = getReportBaseName(state.report);
  const json = JSON.stringify(state.report, null, 2);
  downloadBlob(json, `${base}.json`, 'application/json');
}

function downloadReportMarkdown() {
  if (!state.report) {
    return;
  }
  const base = getReportBaseName(state.report);
  const markdown = buildReportMarkdown(state.report);
  downloadBlob(markdown, `${base}.md`, 'text/markdown;charset=utf-8');
}

async function loadCountiesForState(stateId) {
  const request = beginTrackedRequest('counties');
  els.countySelect.innerHTML = '<option value="">All in state</option>';
  els.countySelect.disabled = true;

  if (!stateId) {
    finishTrackedRequest('counties', request.id);
    return;
  }

  try {
    const data = await api(`/api/counties?stateId=${stateId}`, { signal: request.signal });
    if (!isLatestRequest('counties', request.id)) {
      return;
    }
    data.counties.forEach((county) => {
      const opt = document.createElement('option');
      opt.value = String(county.county_id);
      opt.textContent = county.county_name;
      els.countySelect.appendChild(opt);
    });
    els.countySelect.disabled = false;
  } catch (error) {
    if (isAbortError(error) || !isLatestRequest('counties', request.id)) {
      return;
    }
    els.countySelect.disabled = true;
  } finally {
    finishTrackedRequest('counties', request.id);
  }
}

async function applyPersistedUiState() {
  const persisted = readPersistedUiState();
  if (!persisted) {
    return null;
  }

  if (typeof persisted.q === 'string') {
    els.searchInput.value = persisted.q.slice(0, 200);
  }

  if (typeof persisted.tsaSourceDot === 'string') {
    const normalizedList = parseSourceDotListInput(persisted.tsaSourceDot);
    state.tsaSourceDots = normalizedList;
    els.tsaSourceInput.value = formatSourceDotList(normalizedList);
  }

  const restoredProfile = normalizeProfileValues(persisted.profile);
  if (restoredProfile) {
    state.profile = restoredProfile;
  }

  const restoredStateId = persisted.stateId ? String(persisted.stateId) : '';
  if (restoredStateId && [...els.stateSelect.options].some((option) => option.value === restoredStateId)) {
    els.stateSelect.value = restoredStateId;
    await loadCountiesForState(restoredStateId);

    const restoredCountyId = persisted.countyId ? String(persisted.countyId) : '';
    if (restoredCountyId && [...els.countySelect.options].some((option) => option.value === restoredCountyId)) {
      els.countySelect.value = restoredCountyId;
    }
  }

  if (persisted.mode === 'search' || persisted.mode === 'match' || persisted.mode === 'tsa') {
    if (persisted.userId !== null && persisted.userId !== undefined) {
      const parsedUser = Number.parseInt(String(persisted.userId), 10);
      if (Number.isFinite(parsedUser)) {
        state.selectedUserId = parsedUser;
      }
    }
    return persisted.mode;
  }

  if (persisted.userId !== null && persisted.userId !== undefined) {
    const parsedUser = Number.parseInt(String(persisted.userId), 10);
    if (Number.isFinite(parsedUser)) {
      state.selectedUserId = parsedUser;
    }
  }

  return null;
}

async function loadStatesIfReady() {
  if (!readinessIsPass()) {
    state.availableStates = [];
    renderRegionStateOptions();
    renderDemographicStateOptions();
    renderWizardDemographicStates();
    return;
  }

  const statesData = await api('/api/states');
  state.availableStates = statesData.states || [];
  renderRegionStateOptions();
  renderDemographicStateOptions();
  renderWizardDemographicStates();
}

async function init() {
  try {
    await loadReadiness();
    await loadAiStatus();
    const traitsData = await api('/api/traits');

    state.traits = traitsData.traits;
    state.defaultProfile = traitsData.defaultProfile;
    state.profile = [...traitsData.defaultProfile];

    await loadStatesIfReady();

    const restoredMode = await applyPersistedUiState();
    if (state.readiness?.core?.appDbReady) {
      await loadUsers(state.selectedUserId);
      await loadPsychometricCatalog();
      renderPsychometricResults();
      renderSavedReports();
      await refreshDashboardForSelectedUser();
      state.selectedCaseId = state.selectedUserId;
      await loadCases(state.selectedCaseId);
      if (state.selectedCaseId !== null) {
        await loadWizardCaseDetail(state.selectedCaseId);
      } else {
        populateWizardIntake(null);
        await loadWizardWorkHistory();
        await loadWizardProfiles();
      }
    } else {
      state.users = [];
      state.cases = [];
      state.selectedCaseId = null;
      state.psychometricCatalog = [];
      state.psychometricResults = [];
      state.savedReports = [];
      renderUserOptions();
      fillUserForm(null);
      renderPsychometricCatalog();
      renderPsychometricResults();
      renderSavedReports();
      renderWizardCaseList();
      populateWizardIntake(null);
      renderWizardWorkHistoryList();
      renderWizardProfiles();
      renderWizardAnalysis();
      const blockedReason = getPrimaryReadinessFailureMessage();
      setUserMeta(`Blocked: ${blockedReason}`);
      setPsychMeta(`Blocked: ${blockedReason}`);
      setSavedReportsMeta(`Blocked: ${blockedReason}`);
    }

    renderTraits();
    persistUiState();
    updateManualTsaBasis();
    setReportPlaceholder(
      'Run Match or Transferable Skills, select a job, then Generate Report (modern replacement for legacy JobsDOT.rtf output).'
    );
    updateLoadMoreVisibility();
    setDashboardActionStates();
    setAdvancedMode(false);
    renderWizardReadinessSummary();
    const hashStep = String(window.location.hash || '').replace(/^#/, '').trim();
    goToWizardStep(WIZARD_STEPS.some((row) => row.id === hashStep) ? hashStep : 'welcome');

    els.recheckReadinessBtn.addEventListener('click', async () => {
      els.recheckReadinessBtn.disabled = true;
      els.recheckReadinessBtn.textContent = 'Rechecking...';
      try {
        await loadReadiness();
        await loadAiStatus();
        await loadStatesIfReady();
        if (state.readiness?.core?.appDbReady) {
          await loadUsers(state.selectedUserId);
          await loadPsychometricCatalog();
          await refreshDashboardForSelectedUser();
        }
        setSavedReportsMeta(
          readinessIsPass() ? 'Readiness checks passed. Continue workflow.' : `Blocked: ${getPrimaryReadinessFailureMessage()}`
        );
      } catch (error) {
        setSavedReportsMeta(`Readiness recheck failed: ${error.message}`);
      } finally {
        els.recheckReadinessBtn.textContent = 'Recheck Data';
        els.recheckReadinessBtn.disabled = false;
        setDashboardActionStates();
      }
    });

    els.wizardPrevBtn.addEventListener('click', () => moveWizardStep(-1));
    els.wizardNextBtn.addEventListener('click', () => moveWizardStep(1));
    els.toggleAdvancedModeBtn.addEventListener('click', () => {
      setAdvancedMode(!state.advancedMode);
    });
    els.wizardRecheckBtn.addEventListener('click', async () => {
      try {
        await loadReadiness();
        await loadAiStatus();
        await loadStatesIfReady();
        if (state.readiness?.core?.appDbReady) {
          await loadCases(state.selectedCaseId);
          if (state.selectedCaseId !== null) {
            await loadWizardCaseDetail(state.selectedCaseId);
          }
        }
        renderWizardReadinessSummary();
      } catch (error) {
        setWizardMeta(els.wizardReadinessSummary, error.message);
      }
    });
    els.wizardCreateCaseBtn.addEventListener('click', async () => {
      try {
        await createWizardCase();
      } catch (error) {
        setWizardMeta(els.wizardIntakeMeta, error.message);
      }
    });
    els.wizardRefreshCasesBtn.addEventListener('click', async () => {
      try {
        await loadCases(state.selectedCaseId);
      } catch (error) {
        setWizardMeta(els.wizardIntakeMeta, error.message);
      }
    });
    els.wizardDemoStateSelect.addEventListener('change', async () => {
      await loadWizardDemographicCountiesForState(els.wizardDemoStateSelect.value || null, null);
    });
    els.wizardSaveIntakeBtn.addEventListener('click', async () => {
      try {
        await saveWizardIntake();
        await loadCases(state.selectedCaseId);
      } catch (error) {
        setWizardMeta(els.wizardIntakeMeta, error.message);
      }
    });
    els.wizardWorkHistorySearchBtn.addEventListener('click', async () => {
      try {
        await searchWizardWorkHistoryDots();
      } catch (error) {
        setWizardMeta(els.wizardWorkHistoryMeta, error.message);
      }
    });
    els.wizardWorkHistorySearchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        searchWizardWorkHistoryDots().catch((error) => {
          setWizardMeta(els.wizardWorkHistoryMeta, error.message);
        });
      }
    });
    els.wizardSaveProfilesBtn.addEventListener('click', async () => {
      try {
        await saveWizardProfiles();
      } catch (error) {
        setWizardMeta(els.wizardProfilesMeta, error.message);
      }
    });
    els.wizardProfileModeSelect.addEventListener('change', () => {
      state.wizardProfileMode = els.wizardProfileModeSelect.value || 'strict_derived';
      if (state.wizardProfiles) {
        setWizardAdjustmentFocus(state.wizardAdjustmentFocus || 'profile2', { render: false });
        applyWizardProfileRules(state.wizardProfiles);
        renderWizardProfiles();
      }
    });
    els.wizardResidualCapSelect.addEventListener('change', () => {
      state.wizardResidualCap = els.wizardResidualCapSelect.value !== '0';
      if (state.wizardProfiles) {
        applyWizardProfileRules(state.wizardProfiles);
        renderWizardProfiles();
      }
    });
    els.wizardTraitGroupFilterSelect.addEventListener('change', () => {
      state.wizardTraitGroupFilter = els.wizardTraitGroupFilterSelect.value || 'all';
      if (state.wizardProfiles) {
        renderWizardProfiles();
      }
    });
    els.wizardFocusProfile2Btn.addEventListener('click', () => {
      setWizardAdjustmentFocus('profile2');
      setWizardMeta(els.wizardProfilesMeta, 'Focus set to Profile 2 (Evaluative).');
    });
    els.wizardFocusProfile4Btn.addEventListener('click', () => {
      setWizardAdjustmentFocus('profile4');
      setWizardMeta(els.wizardProfilesMeta, 'Focus set to Profile 4 (Residual/Post).');
    });
    els.wizardAdjustTargetSelect.addEventListener('change', () => {
      setWizardAdjustmentFocus(els.wizardAdjustTargetSelect.value || 'profile2');
    });
    els.wizardApplyAdjustmentBtn.addEventListener('click', () => {
      try {
        applyWizardLoweringAdjustment();
      } catch (error) {
        setWizardMeta(els.wizardProfilesMeta, error.message);
      }
    });
    els.wizardLowerProfile2Btn.addEventListener('click', () => {
      try {
        applyWizardLoweringAdjustment('profile2');
      } catch (error) {
        setWizardMeta(els.wizardProfilesMeta, error.message);
      }
    });
    els.wizardLowerProfile4Btn.addEventListener('click', () => {
      try {
        applyWizardLoweringAdjustment('profile4');
      } catch (error) {
        setWizardMeta(els.wizardProfilesMeta, error.message);
      }
    });
    els.wizardCopyProfile3To4Btn.addEventListener('click', () => {
      try {
        copyWizardProfile3To4();
      } catch (error) {
        setWizardMeta(els.wizardProfilesMeta, error.message);
      }
    });
    els.wizardResetToDerivedBtn.addEventListener('click', async () => {
      try {
        await resetWizardProfilesToDerived();
      } catch (error) {
        setWizardMeta(els.wizardProfilesMeta, error.message);
      }
    });
    els.wizardRunAnalysisBtn.addEventListener('click', async () => {
      try {
        await runWizardAnalysis();
      } catch (error) {
        setWizardMeta(els.wizardAnalysisMeta, error.message);
      }
    });
    els.wizardGenerateReportBtn.addEventListener('click', async () => {
      try {
        await generateWizardReport();
      } catch (error) {
        setWizardMeta(els.wizardReportMeta, error.message);
      }
    });
    els.wizardSaveReportBtn.addEventListener('click', async () => {
      try {
        await saveWizardReport();
      } catch (error) {
        setWizardMeta(els.wizardReportMeta, error.message);
      }
    });
    els.wizardExportJsonBtn.addEventListener('click', async () => {
      try {
        await exportWizardJson();
      } catch (error) {
        setWizardMeta(els.wizardReportMeta, error.message);
      }
    });
    els.wizardExportMdBtn.addEventListener('click', async () => {
      try {
        await exportWizardMarkdown();
      } catch (error) {
        setWizardMeta(els.wizardReportMeta, error.message);
      }
    });
    els.wizardExportHtmlBtn.addEventListener('click', async () => {
      try {
        await exportWizardHtml();
      } catch (error) {
        setWizardMeta(els.wizardReportMeta, error.message);
      }
    });
    els.wizardExportPdfBtn.addEventListener('click', async () => {
      try {
        await exportWizardPdf();
      } catch (error) {
        setWizardMeta(els.wizardReportMeta, error.message);
      }
    });
    els.wizardExportPacketBtn.addEventListener('click', async () => {
      try {
        await exportWizardCasePacket();
      } catch (error) {
        setWizardMeta(els.wizardReportMeta, error.message);
      }
    });
    els.wizardGenerateAiNarrativeBtn.addEventListener('click', async () => {
      try {
        await generateWizardAiNarrative();
      } catch (error) {
        setWizardMeta(els.wizardReportMeta, error.message);
      }
    });
    window.addEventListener('hashchange', () => {
      const hashStep = String(window.location.hash || '').replace(/^#/, '').trim();
      if (WIZARD_STEPS.some((row) => row.id === hashStep)) {
        goToWizardStep(hashStep);
      }
    });

    els.searchBtn.addEventListener('click', runSearch);
    els.matchBtn.addEventListener('click', runMatch);
    els.tsaBtn.addEventListener('click', runTransferableSkills);
    els.loadMoreBtn.addEventListener('click', loadMoreResults);
    els.generateReportBtn.addEventListener('click', generateReport);
    els.downloadJsonBtn.addEventListener('click', downloadReportJson);
    els.downloadMarkdownBtn.addEventListener('click', downloadReportMarkdown);
    els.userSelect.addEventListener('change', async () => {
      const parsedUser = Number.parseInt(els.userSelect.value || '', 10);
      state.selectedUserId = Number.isFinite(parsedUser) ? parsedUser : null;
      state.selectedCaseId = state.selectedUserId;
      const user = selectedUser();
      fillUserForm(user);
      const demographicWarning = await syncUserDemographicSelectors(user);
      persistUiState();
      await refreshDashboardForSelectedUser();
      await loadCases(state.selectedCaseId);
      if (state.selectedCaseId !== null) {
        await loadWizardCaseDetail(state.selectedCaseId);
      } else {
        populateWizardIntake(null);
      }
      const baseMeta = user
        ? `Selected ${user.first_name} ${user.last_name}. Psychometric records: ${user.psychometric_count || 0}. Saved reports: ${user.saved_report_count || 0}.`
        : 'No user selected.';
      setUserMeta(demographicWarning ? `${baseMeta} ${demographicWarning}` : baseMeta);
      setDashboardActionStates();
    });
    els.userDemoStateSelect.addEventListener('change', async () => {
      const stateId = els.userDemoStateSelect.value || null;
      const loadResult = await loadDemographicCountiesForState(stateId, null);
      if (!loadResult.ok) {
        setUserMeta(`Demographic county list could not be loaded (${loadResult.error.message}).`);
      } else if (loadResult.warning) {
        setUserMeta(loadResult.warning);
      }
      persistUiState();
    });
    els.userDemoCountySelect.addEventListener('change', persistUiState);
    els.createUserBtn.addEventListener('click', async () => {
      try {
        await createUser();
      } catch (error) {
        setUserMeta(error.message);
      }
    });
    els.updateUserBtn.addEventListener('click', async () => {
      try {
        await updateUser();
      } catch (error) {
        setUserMeta(error.message);
      }
    });
    els.deleteUserBtn.addEventListener('click', async () => {
      try {
        await deleteUser();
      } catch (error) {
        setUserMeta(error.message);
      }
    });
    els.addPsychResultBtn.addEventListener('click', async () => {
      try {
        await addPsychometricResult();
      } catch (error) {
        setPsychMeta(error.message);
      }
    });
    els.refreshPsychBtn.addEventListener('click', async () => {
      try {
        await loadPsychometricResults();
        setPsychMeta('Psychometric records refreshed.');
      } catch (error) {
        setPsychMeta(error.message);
      }
    });
    els.saveReportForUserBtn.addEventListener('click', async () => {
      try {
        await saveCurrentReportForUser();
      } catch (error) {
        setSavedReportsMeta(error.message);
      }
    });
    if (els.exportCaseBundleBtn) {
      els.exportCaseBundleBtn.addEventListener('click', async () => {
        try {
          await exportCaseReportBundle();
        } catch (error) {
          setSavedReportsMeta(error.message);
        }
      });
    }
    els.refreshSavedReportsBtn.addEventListener('click', async () => {
      try {
        await loadSavedReports();
      } catch (error) {
        setSavedReportsMeta(error.message);
      }
    });

    els.searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (state.mode === 'match') {
          runMatch();
        } else if (state.mode === 'tsa') {
          runTransferableSkills();
        } else {
          runSearch();
        }
      }
    });
    els.searchInput.addEventListener('input', persistUiState);
    els.tsaSourceInput.addEventListener('input', () => {
      state.tsaSourceDots = parseSourceDotListInput(els.tsaSourceInput.value);
      persistUiState();
    });
    els.tsaSourceInput.addEventListener('blur', () => {
      const normalized = parseSourceDotListInput(els.tsaSourceInput.value);
      state.tsaSourceDots = normalized;
      els.tsaSourceInput.value = formatSourceDotList(normalized);
      persistUiState();
    });
    els.tsaSourceInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        runTransferableSkills();
      }
    });

    els.stateSelect.addEventListener('change', async () => {
      const stateId = els.stateSelect.value;
      await loadCountiesForState(stateId);
      persistUiState();
      if (state.mode === 'match') {
        await runMatch();
      } else if (state.mode === 'tsa') {
        await runTransferableSkills();
      } else {
        await runSearch();
      }
    });

    els.countySelect.addEventListener('change', async () => {
      persistUiState();
      if (state.mode === 'match') {
        await runMatch();
      } else if (state.mode === 'tsa') {
        await runTransferableSkills();
      } else {
        await runSearch();
      }
    });

    els.resetProfileBtn.addEventListener('click', () => {
      state.profile = [...state.defaultProfile];
      renderTraits();
      persistUiState();
      invalidateReport('Profile reset. Generate a new report.');
      if (state.mode === 'match') {
        runMatch();
      }
    });

    els.toggleProfileBtn.addEventListener('click', () => {
      els.profilePanel.classList.toggle('hidden');
      const hidden = els.profilePanel.classList.contains('hidden');
      els.toggleProfileBtn.textContent = hidden ? 'Show Profile' : 'Hide Profile';
    });

    if (!readinessIsPass()) {
      setResultsMeta(`Blocked: ${getPrimaryReadinessFailureMessage()}`);
      setDetailMeta(`Blocked: ${getPrimaryReadinessFailureMessage()}`);
      setReportMeta(`Blocked: ${getPrimaryReadinessFailureMessage()}`);
      clearResults();
      setDashboardActionStates();
      return;
    }

    if (restoredMode === 'match') {
      await runMatch();
    } else if (restoredMode === 'tsa') {
      await runTransferableSkills();
    } else {
      await runSearch();
    }
  } catch (error) {
    setResultsMeta(error.message);
    clearResults();
    setReportMeta(error.message);
    setReportPlaceholder(error.message);
    els.jobDetail.innerHTML = `
      <div class="empty">
        ${escapeHtml(error.message)}<br /><br />
        Run: <code>npm run build:data -- --legacy-dir "path/to/MVQS (1)"</code>
      </div>
    `;
  }
}

init();
