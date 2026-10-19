import {
  DocumentProcessError,
  extractDocumentFromBuffer,
  buildTranslatedDocument,
  buildOutputFileName
} from './src/document-processor.js';
import {
  TARGET_LANGUAGES,
  getTargetLanguageMeta,
  detectEnvironmentInfo,
  checkLanguagePairSupport,
  startTranslatorCreation,
  startReverseTranslatorCreation,
  translateSingleText,
  speakTextWithBrowserTTS
} from './src/translator-service.js?v=20261020-5';
import {
  getAllGlossaryEntries,
  loadCustomGlossary,
  saveCustomGlossary,
  findMatchingGlossaryTerms,
  isNonTranslatableText,
  evaluateLengthOverflowRisk,
  evaluateTranslationAccuracyIssues,
  evaluateTranslationTrafficLight
} from './src/school-glossary.js';
import {
  saveWorkSessionToBrowser,
  loadWorkSessionFromBrowser,
  clearWorkSessionFromBrowser,
  isAutoSaveEnabled,
  setAutoSaveEnabled,
  getLastStorageError
} from './src/storage-service.js';
import {
  fetchApprovedCases,
  submitLessonCase,
  fetchMyCases,
  resubmitLessonCase,
  removeMyLessonCase,
  reportLessonCase,
  getSavedMyCaseIds,
  getOrCreateAutoCasePasscode,
  verifyAdminPasswordOnServer,
  adminFetchAllCases,
  adminReviewCase,
  adminChangePassword,
  adminFetchCaseReports,
  adminResolveCaseReport
} from './src/case-sharing-service.js?v=20261020-7';
import {
  CLASSROOM_COMMUNICATION_CARDS,
  SCHOOL_NOTICE_TEMPLATES,
  buildExternalAiTranslationPrompt,
  encodeStudentViewPayload,
  decodeStudentViewPayload
} from './src/teacher-toolkit.js';

const PREF_LANG_STORAGE_KEY = 'multilingual_translator_pref_lang_v1';
const PREF_RECENT_LANGS_STORAGE_KEY = 'multilingual_translator_recent_langs_v2';
const PREF_OUTPUT_MODE_STORAGE_KEY = 'multilingual_translator_pref_output_mode_v1';

const state = {
  activeMainView: 'translator',
  currentStep: 1,
  maxUnlockedStep: 1,
  parsedDoc: null,
  selectedLangKey: 'vi',
  translatedLangKey: null,
  langSupportMap: new Map(),
  // id -> { draftText, draftBackTranslatedKo, finalText, backTranslatedKo, verified, autoFailed, errorMessage, keepOriginal }
  itemStates: new Map(),
  activeFilter: 'all',
  collapsedGroups: new Set(),
  warningListExpanded: false,
  autoSyncIdentical: true,
  outputMode: 'replace',
  isTranslating: false,
  cancelTranslationRequested: false,
  hasUnsavedWork: false,
  pendingRestorableSession: null,
  // Case sharing & Admin state
  publicCases: [],
  myCases: [],
  highlightedCaseId: null,
  adminAuthenticated: false,
  adminPasswordSession: '',
  adminCases: [],
  adminReports: [],
  adminActiveFilter: 'all'
};

let autoSaveTimer = null;

// DOM Elements
const els = {};

function cacheElements() {
  // Main Workspace Tabs & Browser Storage Controls (PRD 3.2, 5, 6)
  els.mainViewTabs = document.querySelectorAll('.main-view-tab');
  els.viewTranslator = document.getElementById('view-translator');
  els.viewCases = document.getElementById('view-cases');
  els.viewAdmin = document.getElementById('view-admin');
  els.viewToolkit = document.getElementById('view-toolkit');
  els.stepperBarNav = document.getElementById('stepper-bar-nav');
  els.casesCountPill = document.getElementById('cases-count-pill');
  els.btnShareSiteUrl = document.getElementById('btn-share-site-url');

  els.chkEnableAutosave = document.getElementById('chk-enable-autosave');
  els.labelAutosaveToggle = document.getElementById('label-autosave-toggle');
  els.btnClearBrowserStorage = document.getElementById('btn-clear-browser-storage');
  els.storageControlFeedback = document.getElementById('storage-control-feedback');
  els.step1StorageStatePill = document.getElementById('step1-storage-state-pill');

  els.stepperItems = document.querySelectorAll('.stepper-item');
  els.stepperBtns = document.querySelectorAll('.stepper-btn');
  els.stepPanels = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4'),
    5: document.getElementById('step-5')
  };

  // Manual Modal & Step 1 Collapsible Drawers
  els.btnOpenManual = document.getElementById('btn-open-manual');
  els.btnOpenManualInline = document.getElementById('btn-open-manual-inline');
  els.manualModal = document.getElementById('manual-modal');
  els.btnCloseManual = document.getElementById('btn-close-manual');
  els.btnCloseManualBottom = document.getElementById('btn-close-manual-bottom');
  els.manualTabs = document.querySelectorAll('.modal-tab');
  els.manualTabPanels = document.querySelectorAll('.manual-tab-panel');
  els.detailsLegacyConvert = document.getElementById('details-legacy-convert');
  els.dataPrivacyNoticeStep1 = document.getElementById('data-privacy-notice-step1');
  els.btnTogglePrivacyDetail = document.getElementById('btn-toggle-privacy-detail');
  els.btnToggleLegacyGuide = document.getElementById('btn-toggle-legacy-guide');

  // Step 1
  els.btnQuickstartUpload = document.getElementById('btn-quickstart-upload');
  els.btnQuickstartNotice = document.getElementById('btn-quickstart-notice');
  els.btnQuickstartCards = document.getElementById('btn-quickstart-cards');
  els.chkQuickTranslateMode = document.getElementById('chk-quick-translate-mode');
  els.selectQuickTargetLang = document.getElementById('select-quick-target-lang');
  els.step1RecentLangsBar = document.getElementById('step1-recent-langs-bar');
  els.btnOpenToolkitFromStep1 = document.getElementById('btn-open-toolkit-from-step1');
  els.sessionRestoreBanner = document.getElementById('session-restore-banner');
  els.sessionRestoreDesc = document.getElementById('session-restore-desc');
  els.btnRestoreSession = document.getElementById('btn-restore-session');
  els.btnDiscardSession = document.getElementById('btn-discard-session');
  els.dropZone = document.getElementById('drop-zone');
  els.fileInput = document.getElementById('file-input');
  els.btnSelectFile = document.getElementById('btn-select-file');
  els.btnLoadSamplePptx = document.getElementById('btn-load-sample-pptx');
  els.btnLoadSampleHwpx = document.getElementById('btn-load-sample-hwpx');
  els.uploadErrorBox = document.getElementById('upload-error-box');
  els.uploadErrorTitle = document.getElementById('upload-error-title');
  els.uploadErrorMessage = document.getElementById('upload-error-message');
  els.uploadErrorAction = document.getElementById('upload-error-action');

  // Step 2
  els.extractFileName = document.getElementById('extract-file-name');
  els.extractFileTypeBadge = document.getElementById('extract-file-type-badge');
  els.extractUnitLabel = document.getElementById('extract-unit-label');
  els.extractUnitCount = document.getElementById('extract-unit-count');
  els.extractItemCount = document.getElementById('extract-item-count');
  els.extractEmptyBox = document.getElementById('extract-empty-box');
  els.extractListContainer = document.getElementById('extract-list-container');
  els.btnBackToUpload = document.getElementById('btn-back-to-upload');
  els.btnBackToUploadBottom = document.getElementById('btn-back-to-upload-bottom');
  els.btnToStep3 = document.getElementById('btn-to-step3');
  els.btnToStep3Bottom = document.getElementById('btn-to-step3-bottom');

  // Step 3
  els.btnBackToStep2 = document.getElementById('btn-back-to-step2');
  els.step3RecentLangsBar = document.getElementById('step3-recent-langs-bar');
  els.languageOptionsGrid = document.getElementById('language-options-grid');
  els.extendedLanguageOptionsGrid = document.getElementById('extended-language-options-grid');
  els.translatorAvailabilityBadge = document.getElementById('translator-availability-badge');
  els.translatorAvailabilityReason = document.getElementById('translator-availability-reason');
  els.translatorAvailabilityHint = document.getElementById('translator-availability-hint');
  els.translationProgressPanel = document.getElementById('translation-progress-panel');
  els.translationProgressTitle = document.getElementById('translation-progress-title');
  els.translationProgressCounts = document.getElementById('translation-progress-counts');
  els.modelDownloadBarWrap = document.getElementById('model-download-bar-wrap');
  els.modelDownloadPercent = document.getElementById('model-download-percent');
  els.modelDownloadProgressbar = document.getElementById('model-download-progressbar');
  els.modelDownloadFill = document.getElementById('model-download-fill');
  els.itemTranslateCurrentLabel = document.getElementById('item-translate-current-label');
  els.itemTranslatePercent = document.getElementById('item-translate-percent');
  els.itemTranslateProgressbar = document.getElementById('item-translate-progressbar');
  els.itemTranslateFill = document.getElementById('item-translate-fill');
  els.btnCancelTranslation = document.getElementById('btn-cancel-translation');
  els.translationResultAlert = document.getElementById('translation-result-alert');
  els.btnStartAutoTranslate = document.getElementById('btn-start-auto-translate');
  els.autoTranslateHelper = document.getElementById('auto-translate-helper');
  els.btnSkipToManual = document.getElementById('btn-skip-to-manual');
  els.btnStep3CopyAiPrompt = document.getElementById('btn-step3-copy-ai-prompt');
  els.multiLangBatchDetails = document.getElementById('multi-lang-batch-details');
  els.multiLangCheckboxGrid = document.getElementById('multi-lang-checkbox-grid');
  els.btnMultiLangSelectCore = document.getElementById('btn-multi-lang-select-core');
  els.btnMultiLangClear = document.getElementById('btn-multi-lang-clear');
  els.btnRunMultiLangZip = document.getElementById('btn-run-multi-lang-zip');
  els.multiLangBatchStatus = document.getElementById('multi-lang-batch-status');

  // Step 4
  els.autosaveStatusBadge = document.getElementById('autosave-status-badge');
  els.btnBackToStep3 = document.getElementById('btn-back-to-step3');
  els.btnBackToStep3Bottom = document.getElementById('btn-back-to-step3-bottom');
  els.btnToStep5 = document.getElementById('btn-to-step5');
  els.btnToStep5Bottom = document.getElementById('btn-to-step5-bottom');
  els.selectStep4OutputMode = document.getElementById('select-step4-output-mode');
  els.btnStep4DirectDownload = document.getElementById('btn-step4-direct-download');
  els.btnStep4DirectDownloadBottom = document.getElementById('btn-step4-direct-download-bottom');
  els.btnStep4OpenQr = document.getElementById('btn-step4-open-qr');
  els.step4DirectDownloadFeedback = document.getElementById('step4-direct-download-feedback');
  els.btnToggleAdvancedReviewTools = document.getElementById('btn-toggle-advanced-review-tools');
  els.advancedReviewToolsWrap = document.getElementById('advanced-review-tools-wrap');
  els.reviewTargetLangLabel = document.getElementById('review-target-lang-label');
  els.reviewTotalCount = document.getElementById('review-total-count');
  els.reviewVerifiedCount = document.getElementById('review-verified-count');
  els.reviewUnverifiedCount = document.getElementById('review-unverified-count');
  els.reviewEmptyCount = document.getElementById('review-empty-count');
  els.reviewSignalChip = document.getElementById('review-signal-chip');
  els.reviewSignalCount = document.getElementById('review-signal-count');
  els.reviewOverflowChip = document.getElementById('review-overflow-chip');
  els.reviewOverflowCount = document.getElementById('review-overflow-count');
  els.reviewFailedChip = document.getElementById('review-failed-chip');
  els.reviewFailedCount = document.getElementById('review-failed-count');
  els.filterBtns = document.querySelectorAll('#step-4 .filter-btn');
  els.btnNextUnverified = document.getElementById('btn-next-unverified');
  els.btnFillEmptyWithSource = document.getElementById('btn-fill-empty-with-source');
  els.btnVerifyAllVisible = document.getElementById('btn-verify-all-visible');

  // Step 4 Power Tools (Back-translation, Glossary, Find/Replace, CSV/Paste, Collapse)
  els.btnRunAllBacktranslate = document.getElementById('btn-run-all-backtranslate');
  els.backtranslateStatusMsg = document.getElementById('backtranslate-status-msg');
  els.chkAutoSyncIdentical = document.getElementById('chk-auto-sync-identical');
  els.btnToggleGlossary = document.getElementById('btn-toggle-glossary');
  els.btnToggleFindReplace = document.getElementById('btn-toggle-find-replace');
  els.btnToggleCsvPanel = document.getElementById('btn-toggle-csv-panel');
  els.glossaryDrawer = document.getElementById('glossary-drawer');
  els.glossaryLangLabel = document.getElementById('glossary-lang-label');
  els.btnApplyGlossaryAll = document.getElementById('btn-apply-glossary-all');
  els.btnExportGlossaryJson = document.getElementById('btn-export-glossary-json');
  els.btnImportGlossaryJson = document.getElementById('btn-import-glossary-json');
  els.inputImportGlossaryFile = document.getElementById('input-import-glossary-file');
  els.inputCustomGlossaryKo = document.getElementById('input-custom-glossary-ko');
  els.inputCustomGlossaryTarget = document.getElementById('input-custom-glossary-target');
  els.btnAddCustomGlossary = document.getElementById('btn-add-custom-glossary');
  els.glossaryFeedbackMsg = document.getElementById('glossary-feedback-msg');
  els.glossaryTermsGrid = document.getElementById('glossary-terms-grid');

  els.findReplaceDrawer = document.getElementById('find-replace-drawer');
  els.inputFindText = document.getElementById('input-find-text');
  els.inputReplaceText = document.getElementById('input-replace-text');
  els.btnRunReplaceAll = document.getElementById('btn-run-replace-all');
  els.findReplaceFeedback = document.getElementById('find-replace-feedback');

  els.csvPasteDrawer = document.getElementById('csv-paste-drawer');
  els.btnExportCsv = document.getElementById('btn-export-csv');
  els.btnCopySourceLines = document.getElementById('btn-copy-source-lines');
  els.btnCopyAiPrompt = document.getElementById('btn-copy-ai-prompt');
  els.textareaBulkPaste = document.getElementById('textarea-bulk-paste');
  els.btnApplyBulkPaste = document.getElementById('btn-apply-bulk-paste');
  els.csvPasteFeedback = document.getElementById('csv-paste-feedback');

  els.currentPositionIndicator = document.getElementById('current-position-indicator');
  els.btnCollapseVerifiedGroups = document.getElementById('btn-collapse-verified-groups');
  els.reviewJumpNav = document.getElementById('review-jump-nav');

  // Step 4 Unified Warning Summary Panel (PRD 4.1)
  els.unifiedWarningSummaryPanel = document.getElementById('unified-warning-summary-panel');
  els.unifiedWarningTotalBadge = document.getElementById('unified-warning-total-badge');
  els.btnToggleWarningList = document.getElementById('btn-toggle-warning-list');
  els.unifiedWarningList = document.getElementById('unified-warning-list');

  els.reviewItemsContainer = document.getElementById('review-items-container');

  // Step 5
  els.btnBackToStep4 = document.getElementById('btn-back-to-step4');
  els.btnBackToStep4Bottom = document.getElementById('btn-back-to-step4-bottom');
  els.btnRestartNewFile = document.getElementById('btn-restart-new-file');
  els.finalOutputFilename = document.getElementById('final-output-filename');
  els.finalTargetLang = document.getElementById('final-target-lang');
  els.finalVerifiedSummary = document.getElementById('final-verified-summary');
  els.finalUnverifiedSummary = document.getElementById('final-unverified-summary');
  els.finalWarningSummary = document.getElementById('final-warning-summary');
  els.finalEmptySummary = document.getElementById('final-empty-summary');
  els.finalModifiedSummary = document.getElementById('final-modified-summary');
  els.downloadWarningsPanel = document.getElementById('download-warnings-panel');
  els.outputModeRadios = document.querySelectorAll('input[name="output-mode"]');
  els.chkAutoShrinkFont = document.getElementById('chk-auto-shrink-font');
  els.emptyHandlingBox = document.getElementById('empty-handling-box');
  els.downloadErrorBox = document.getElementById('download-error-box');
  els.downloadErrorTitle = document.getElementById('download-error-title');
  els.downloadErrorMessage = document.getElementById('download-error-message');
  els.downloadErrorAction = document.getElementById('download-error-action');
  els.btnDownloadFile = document.getElementById('btn-download-file');
  els.btnOpenStudentQrModal = document.getElementById('btn-open-student-qr-modal');
  els.btnPrintComparisonSheet = document.getElementById('btn-print-comparison-sheet');
  els.downloadSuccessMsg = document.getElementById('download-success-msg');
  els.btnStep5ClearStorage = document.getElementById('btn-step5-clear-storage');
  els.printableComparisonSheet = document.getElementById('printable-comparison-sheet');
  els.printSheetMeta = document.getElementById('print-sheet-meta');
  els.printSheetTbody = document.getElementById('print-sheet-tbody');
  els.btnTriggerWindowPrint = document.getElementById('btn-trigger-window-print');
  els.btnClosePrintSheet = document.getElementById('btn-close-print-sheet');

  // Student QR Reader Modal (Idea #9)
  els.studentQrModal = document.getElementById('student-qr-modal');
  els.btnCloseStudentQrModal = document.getElementById('btn-close-student-qr-modal');
  els.btnCloseStudentQrBottom = document.getElementById('btn-close-student-qr-bottom');
  els.studentQrShareSection = document.getElementById('student-qr-share-section');
  els.imgStudentShareQr = document.getElementById('img-student-share-qr');
  els.inputStudentShareUrl = document.getElementById('input-student-share-url');
  els.btnCopyStudentShareUrl = document.getElementById('btn-copy-student-share-url');
  els.btnSpeakAllStudentCards = document.getElementById('btn-speak-all-student-cards');
  els.studentShareFeedback = document.getElementById('student-share-feedback');
  els.studentReaderDocTitle = document.getElementById('student-reader-doc-title');
  els.studentReaderLangBadge = document.getElementById('student-reader-lang-badge');
  els.chkStudentReaderShowKo = document.getElementById('chk-student-reader-show-ko');
  els.studentReaderCardsList = document.getElementById('student-reader-cards-list');

  // Teacher Toolkit View (Ideas #4, #7, #8)
  els.btnToolkitSubtabNotice = document.getElementById('btn-toolkit-subtab-notice');
  els.btnToolkitSubtabCards = document.getElementById('btn-toolkit-subtab-cards');
  els.toolkitSubviewNotice = document.getElementById('toolkit-subview-notice');
  els.toolkitSubviewCards = document.getElementById('toolkit-subview-cards');
  els.toolkitRecentLangsBar = document.getElementById('toolkit-recent-langs-bar');
  els.selectToolkitTargetLang = document.getElementById('select-toolkit-target-lang');
  els.toolkitTemplateButtons = document.getElementById('toolkit-template-buttons');
  els.textareaToolkitSource = document.getElementById('textarea-toolkit-source');
  els.btnToolkitClear = document.getElementById('btn-toolkit-clear');
  els.btnToolkitTranslate = document.getElementById('btn-toolkit-translate');
  els.toolkitFeedbackMsg = document.getElementById('toolkit-feedback-msg');
  els.labelToolkitTargetLang = document.getElementById('label-toolkit-target-lang');
  els.textareaToolkitTarget = document.getElementById('textarea-toolkit-target');
  els.btnToolkitSpeak = document.getElementById('btn-toolkit-speak');
  els.btnToolkitCopyTarget = document.getElementById('btn-toolkit-copy-target');
  els.btnToolkitCopyBilingual = document.getElementById('btn-toolkit-copy-bilingual');
  els.toolkitBacktranslateBox = document.getElementById('toolkit-backtranslate-box');
  els.toolkitBacktranslateText = document.getElementById('toolkit-backtranslate-text');
  els.classroomCardsGrid = document.getElementById('classroom-cards-grid');

  // Lesson Utilization Cases View (PRD 5)
  els.btnOpenCaseForm = document.getElementById('btn-open-case-form');
  els.btnOpenMyCases = document.getElementById('btn-open-my-cases');
  els.casesServerStatusBanner = document.getElementById('cases-server-status-banner');
  els.caseWritePanel = document.getElementById('case-write-panel');
  els.caseFormTitle = document.getElementById('case-form-title');
  els.btnCloseCaseForm = document.getElementById('btn-close-case-form');
  els.btnCancelCaseForm = document.getElementById('btn-cancel-case-form');
  els.caseSubmitForm = document.getElementById('case-submit-form');
  els.caseEditId = document.getElementById('case-edit-id');
  els.caseInputTitle = document.getElementById('case-input-title');
  els.caseInputDate = document.getElementById('case-input-date');
  els.caseInputGrade = document.getElementById('case-input-grade');
  els.caseInputSubject = document.getElementById('case-input-subject');
  els.caseInputLang = document.getElementById('case-input-lang');
  els.caseInputFormat = document.getElementById('case-input-format');
  els.caseInputAuthor = document.getElementById('case-input-author');
  els.caseInputGoal = document.getElementById('case-input-goal');
  els.caseInputProcess = document.getElementById('case-input-process');
  els.caseInputReview = document.getElementById('case-input-review');
  els.caseInputResults = document.getElementById('case-input-results');
  els.caseInputMetrics = document.getElementById('case-input-metrics');
  els.caseInputImprovements = document.getElementById('case-input-improvements');
  els.caseInputPasscode = document.getElementById('case-input-passcode');
  els.chkCaseFactual = document.getElementById('chk-case-factual');
  els.chkCaseNopii = document.getElementById('chk-case-nopii');
  els.chkCaseRights = document.getElementById('chk-case-rights');
  els.caseSubmitFeedback = document.getElementById('case-submit-feedback');
  els.btnSubmitCase = document.getElementById('btn-submit-case');

  els.myCasesPanel = document.getElementById('my-cases-panel');
  els.btnCloseMyCases = document.getElementById('btn-close-my-cases');
  els.myCasesPasscodeInput = document.getElementById('my-cases-passcode-input');
  els.btnLookupMyCases = document.getElementById('btn-lookup-my-cases');
  els.myCasesList = document.getElementById('my-cases-list');

  els.filterCaseLang = document.getElementById('filter-case-lang');
  els.filterCaseGrade = document.getElementById('filter-case-grade');
  els.filterCaseFormat = document.getElementById('filter-case-format');
  els.filterCaseSubject = document.getElementById('filter-case-subject');
  els.btnResetCaseFilters = document.getElementById('btn-reset-case-filters');
  els.btnRefreshCases = document.getElementById('btn-refresh-cases');
  els.casesPublicList = document.getElementById('cases-public-list');

  // Admin View (PRD 6, 7)
  els.btnAdminLogout = document.getElementById('btn-admin-logout');
  els.adminAuthBox = document.getElementById('admin-auth-box');
  els.adminLoginForm = document.getElementById('admin-login-form');
  els.adminPasswordInput = document.getElementById('admin-password-input');
  els.btnAdminLogin = document.getElementById('btn-admin-login');
  els.adminAuthMsg = document.getElementById('admin-auth-msg');
  els.adminDashboardBox = document.getElementById('admin-dashboard-box');
  els.adminFilterBtns = document.querySelectorAll('[data-admin-filter]');
  els.adminCountAll = document.getElementById('admin-count-all');
  els.adminCountPending = document.getElementById('admin-count-pending');
  els.adminCountApproved = document.getElementById('admin-count-approved');
  els.adminCountRejected = document.getElementById('admin-count-rejected');
  els.adminCountHidden = document.getElementById('admin-count-hidden');
  els.adminCountReports = document.getElementById('admin-count-reports');
  els.btnAdminRefresh = document.getElementById('btn-admin-refresh');
  els.btnToggleAdminPwChange = document.getElementById('btn-toggle-admin-pw-change');
  els.adminPwChangePanel = document.getElementById('admin-pw-change-panel');
  els.inputAdminNewPw = document.getElementById('input-admin-new-pw');
  els.btnSaveAdminNewPw = document.getElementById('btn-save-admin-new-pw');
  els.adminPwChangeFeedback = document.getElementById('admin-pw-change-feedback');
  els.adminActionFeedback = document.getElementById('admin-action-feedback');
  els.adminCasesList = document.getElementById('admin-cases-list');
  els.adminReportsList = document.getElementById('admin-reports-list');
}

function init() {
  cacheElements();
  loadSavedTeacherPreferences();
  checkMobileBanner();
  syncStorageControlUI();
  bindEvents();
  renderLanguageCards();
  renderRecentLanguageBars();
  syncOutputModeControls();
  initToolkitView();
  refreshAllLanguageSupport();
  checkRestorableSession();
  handleInitialUrlRouting();
}

function getSavedRecentLanguages() {
  // 고정 순서: 1위 베트남어, 2·4위 중국어 간체, 3위 필리핀어, 5위 캄보디아어
  return ['vi', 'zh-Hans', 'tl', 'km'];
}

function loadSavedTeacherPreferences() {
  try {
    if (typeof localStorage === 'undefined') return;
    const savedLang = localStorage.getItem(PREF_LANG_STORAGE_KEY);
    if (savedLang && TARGET_LANGUAGES.some((l) => l.key === savedLang)) {
      state.selectedLangKey = savedLang;
    }
    const savedMode = localStorage.getItem(PREF_OUTPUT_MODE_STORAGE_KEY);
    if (
      savedMode === 'replace' ||
      savedMode === 'bilingual-ko-first' ||
      savedMode === 'bilingual-target-first'
    ) {
      state.outputMode = savedMode;
    }
  } catch {
    // ignore storage errors
  }
}

function rememberSelectedLanguage(langKey) {
  if (!langKey || !TARGET_LANGUAGES.some((l) => l.key === langKey)) return;
  state.selectedLangKey = langKey;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PREF_LANG_STORAGE_KEY, langKey);
    }
  } catch {
    // ignore
  }
  renderRecentLanguageBars();
}

function rememberOutputMode(mode) {
  if (!mode) return;
  state.outputMode = mode;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PREF_OUTPUT_MODE_STORAGE_KEY, mode);
    }
  } catch {
    // ignore
  }
  syncOutputModeControls();
}

function syncOutputModeControls() {
  if (els.selectStep4OutputMode) {
    els.selectStep4OutputMode.value = state.outputMode;
  }
  els.outputModeRadios?.forEach((radio) => {
    radio.checked = radio.value === state.outputMode;
  });
  document.querySelectorAll('.output-mode-card').forEach((card) => {
    const r = card.querySelector('input[type="radio"]');
    card.classList.toggle('selected', Boolean(r && r.checked));
  });
}

function applySelectedLanguageEverywhere(langKey) {
  if (!langKey || state.isTranslating) return;
  rememberSelectedLanguage(langKey);
  if (els.selectQuickTargetLang) {
    els.selectQuickTargetLang.value = langKey;
  }
  if (els.selectToolkitTargetLang) {
    els.selectToolkitTargetLang.value = langKey;
  }
  const langMeta = getTargetLanguageMeta(langKey);
  if (els.labelToolkitTargetLang) {
    els.labelToolkitTargetLang.textContent = `${langMeta.label} 번역 결과`;
  }
  renderClassroomCards();
  if (state.activeMainView === 'toolkit' && els.textareaToolkitSource?.value.trim()) {
    handleToolkitTranslate();
  }
  document.querySelectorAll('.lang-option-card').forEach((c) => {
    const isMatch = c.getAttribute('data-lang-key') === langKey;
    c.classList.toggle('selected', isMatch);
    const r = c.querySelector('input[type="radio"]');
    if (r) r.checked = isMatch;
  });
  updateSelectedLanguageStatusUI();
}

function renderRecentLanguageBars() {
  const recentKeys = getSavedRecentLanguages();

  // Step 1 Card ① & Toolkit top bar: Clean language pill buttons (고정 위치)
  const pillContainers = [els.step1RecentLangsBar, els.toolkitRecentLangsBar].filter(Boolean);
  for (const pillContainer of pillContainers) {
    pillContainer.innerHTML = '';
    for (const key of recentKeys) {
      const meta = getTargetLanguageMeta(key);
      const isSelected = state.selectedLangKey === key;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `step1-lang-pill${isSelected ? ' is-current' : ''}`;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      btn.textContent = meta.label;
      btn.addEventListener('click', () => {
        applySelectedLanguageEverywhere(key);
        scheduleAutoSave();
      });
      pillContainer.appendChild(btn);
    }
  }

  // Step 3 recent languages bar
  if (els.step3RecentLangsBar) {
    els.step3RecentLangsBar.innerHTML = '<span class="recent-langs-label">⭐ 우리 반·최근 사용 언어:</span>';
    for (const key of recentKeys) {
      const meta = getTargetLanguageMeta(key);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `recent-lang-chip${state.selectedLangKey === key ? ' is-current' : ''}`;
      btn.textContent = `${meta.label} (${meta.nativeLabel})`;
      btn.addEventListener('click', () => {
        applySelectedLanguageEverywhere(key);
        scheduleAutoSave();
      });
      els.step3RecentLangsBar.appendChild(btn);
    }
  }
}

function checkMobileBanner() {
  const env = detectEnvironmentInfo();
  const strip = document.querySelector('.notice-strip');
  const mobileBanner = document.getElementById('mobile-env-banner');
  if (env.isMobile && strip && mobileBanner) {
    strip.classList.add('mobile-highlight');
    mobileBanner.innerHTML =
      '<strong>📱 모바일 접속 안내:</strong> 모바일 브라우저에서는 내장 Translator API(자동 번역)가 작동하지 않을 수 있습니다. 자동 번역은 <strong>데스크톱 Chrome 브라우저</strong>를 권장하며, 모바일에서는 수동 번역문 입력 및 파일 변환을 사용할 수 있습니다.';
  }
}

/* ==================== MAIN WORKSPACE NAVIGATION & URL DEEP LINK ==================== */

function switchMainView(viewName) {
  state.activeMainView = viewName;
  els.mainViewTabs.forEach((tab) => {
    const isTarget = tab.getAttribute('data-view-target') === viewName;
    tab.classList.toggle('active', isTarget);
    tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  if (els.viewTranslator) {
    els.viewTranslator.classList.toggle('hidden', viewName !== 'translator');
  }
  if (els.stepperBarNav) {
    const hideStepper =
      viewName !== 'translator' || (state.currentStep === 1 && state.maxUnlockedStep === 1);
    els.stepperBarNav.classList.toggle('hidden', hideStepper);
  }
  if (els.viewToolkit) {
    els.viewToolkit.classList.toggle('hidden', viewName !== 'toolkit');
    els.viewToolkit.classList.toggle('active', viewName === 'toolkit');
  }
  if (els.viewCases) {
    els.viewCases.classList.toggle('hidden', viewName !== 'cases');
    els.viewCases.classList.toggle('active', viewName === 'cases');
  }
  if (els.viewAdmin) {
    els.viewAdmin.classList.toggle('hidden', viewName !== 'admin');
    els.viewAdmin.classList.toggle('active', viewName === 'admin');
  }

  if (viewName === 'toolkit') {
    renderClassroomCards();
  } else if (viewName === 'cases') {
    loadAndRenderPublicCases();
  } else if (viewName === 'admin' && state.adminAuthenticated) {
    loadAndRenderAdminDashboard();
  }
}

function handleInitialUrlRouting() {
  try {
    // Check Student QR Reader hash (#student-view=...)
    if (window.location.hash && window.location.hash.startsWith('#student-view=')) {
      const encoded = window.location.hash.slice('#student-view='.length);
      const payload = decodeStudentViewPayload(encoded);
      if (payload) {
        openStudentReaderFromPayload(payload, true);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const caseId = params.get('case');
    const viewParam = params.get('view');
    if (caseId) {
      state.highlightedCaseId = caseId;
      switchMainView('cases');
    } else if (viewParam === 'cases' || viewParam === 'admin' || viewParam === 'toolkit') {
      switchMainView(viewParam);
    } else {
      // Load approved case count quietly in background without blocking translator
      fetchApprovedCases().then((res) => {
        if (res && Array.isArray(res.items)) {
          state.publicCases = res.items;
          if (els.casesCountPill) {
            els.casesCountPill.textContent = `${res.items.length}건`;
          }
        }
      }).catch(() => {});
    }
  } catch {
    // ignore URL parsing issues
  }
}

/* ==================== FEATURE #4 & PRD 3.2: BROWSER AUTO-SAVE & STORAGE CONTROL ==================== */

function syncStorageControlUI() {
  const enabled = isAutoSaveEnabled();
  if (els.chkEnableAutosave) {
    els.chkEnableAutosave.checked = enabled;
  }
  if (els.labelAutosaveToggle) {
    els.labelAutosaveToggle.textContent = enabled
      ? '💾 브라우저 임시 저장 켜짐'
      : '⏸️ 브라우저 임시 저장 꺼짐';
  }
  if (els.step1StorageStatePill) {
    els.step1StorageStatePill.textContent = enabled
      ? '임시 저장: 켜짐 (IndexedDB)'
      : '임시 저장: 꺼짐 (저장 안 함)';
    els.step1StorageStatePill.classList.toggle('is-off', !enabled);
  }
  if (els.autosaveStatusBadge) {
    els.autosaveStatusBadge.textContent = enabled
      ? '💾 브라우저 자동 임시저장 켜짐'
      : '⏸️ 브라우저 임시저장 꺼짐 (수동 다운로드만 사용)';
  }
}

async function handleToggleAutoSave() {
  const enabled = Boolean(els.chkEnableAutosave?.checked);
  await setAutoSaveEnabled(enabled);
  syncStorageControlUI();

  if (!enabled) {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
    await clearWorkSessionFromBrowser();
    state.pendingRestorableSession = null;
    els.sessionRestoreBanner?.classList.add('hidden');
    showStorageControlFeedback('⏸️ 임시 저장을 껐으며 브라우저에 남아 있던 임시 데이터를 삭제했습니다.');
  } else {
    showStorageControlFeedback('💾 브라우저 임시 저장이 켜졌습니다.');
    if (state.parsedDoc && state.parsedDoc.originalBuffer) {
      scheduleAutoSave();
    }
  }
}

async function handleClearBrowserStorage(resetCurrentScreen = false) {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
  await clearWorkSessionFromBrowser();
  state.pendingRestorableSession = null;
  els.sessionRestoreBanner?.classList.add('hidden');

  if (resetCurrentScreen || state.currentStep > 1) {
    state.hasUnsavedWork = false;
    state.parsedDoc = null;
    state.translatedLangKey = null;
    state.itemStates.clear();
    state.collapsedGroups.clear();
    state.maxUnlockedStep = 1;
    if (state.activeMainView === 'translator') {
      goToStep(1);
    }
  }

  if (els.autosaveStatusBadge) {
    els.autosaveStatusBadge.textContent = '🗑️ 브라우저 임시저장 내역 삭제됨';
  }
  showStorageControlFeedback('✓ 이 브라우저의 작업 내용이 삭제되었습니다. 새로고침해도 복원되지 않습니다.');
}

function showStorageControlFeedback(msg) {
  if (!els.storageControlFeedback) return;
  els.storageControlFeedback.textContent = msg;
  setTimeout(() => {
    if (els.storageControlFeedback && els.storageControlFeedback.textContent === msg) {
      els.storageControlFeedback.textContent = '';
    }
  }, 4500);
}

async function checkRestorableSession() {
  if (!isAutoSaveEnabled()) return;
  const saved = await loadWorkSessionFromBrowser();
  if (!saved || !saved.originalBuffer || !saved.fileName || !Array.isArray(saved.itemStatesEntries)) {
    return;
  }
  state.pendingRestorableSession = saved;
  const langMeta = getTargetLanguageMeta(saved.selectedLangKey || 'en');
  const totalCount = saved.itemStatesEntries.length;
  const verifiedCount = saved.itemStatesEntries.filter(([, v]) => v && v.verified).length;
  const timeStr = saved.savedAt ? new Date(saved.savedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';

  if (els.sessionRestoreDesc && els.sessionRestoreBanner) {
    els.sessionRestoreDesc.textContent = `[${saved.fileName}] · ${langMeta.label} 번역 (${verifiedCount}/${totalCount}개 확인 완료${timeStr ? ` · ${timeStr} 저장` : ''}) 내역을 이어서 작업할 수 있습니다.`;
    els.sessionRestoreBanner.classList.remove('hidden');
  }
}

async function handleRestoreSession() {
  const saved = state.pendingRestorableSession;
  if (!saved) return;
  try {
    const parsed = await extractDocumentFromBuffer(saved.fileName, saved.originalBuffer);
    state.parsedDoc = parsed;
    state.selectedLangKey = saved.selectedLangKey || 'en';
    state.translatedLangKey = saved.translatedLangKey || saved.selectedLangKey || 'en';
    if (saved.outputMode) {
      state.outputMode = saved.outputMode;
      els.outputModeRadios?.forEach((radio) => {
        radio.checked = radio.value === state.outputMode;
      });
      document.querySelectorAll('.output-mode-card').forEach((card) => {
        const r = card.querySelector('input[type="radio"]');
        card.classList.toggle('selected', Boolean(r && r.checked));
      });
    }
    state.itemStates = new Map(saved.itemStatesEntries);
    state.collapsedGroups.clear();
    state.activeFilter = 'all';
    state.hasUnsavedWork = true;
    state.maxUnlockedStep = 5;
    state.pendingRestorableSession = null;
    els.sessionRestoreBanner?.classList.add('hidden');
    renderLanguageCards();
    refreshAllLanguageSupport();
    goToStep(4);
  } catch {
    await clearWorkSessionFromBrowser();
    els.sessionRestoreBanner?.classList.add('hidden');
  }
}

function scheduleAutoSave() {
  if (!state.parsedDoc || !state.parsedDoc.originalBuffer) return;
  if (!isAutoSaveEnabled()) {
    if (els.autosaveStatusBadge) {
      els.autosaveStatusBadge.textContent = '⏸️ 브라우저 임시저장 꺼짐 (수동 다운로드만 사용)';
    }
    return;
  }
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async () => {
    const savedAt = await saveWorkSessionToBrowser({
      fileName: state.parsedDoc.fileName,
      fileType: state.parsedDoc.fileType,
      originalBuffer: state.parsedDoc.originalBuffer,
      selectedLangKey: state.selectedLangKey,
      translatedLangKey: state.translatedLangKey,
      outputMode: state.outputMode,
      itemStatesEntries: Array.from(state.itemStates.entries())
    });
    if (savedAt && els.autosaveStatusBadge) {
      const t = new Date(savedAt).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      els.autosaveStatusBadge.textContent = `💾 브라우저 임시저장 완료 (${t})`;
    } else if (!savedAt) {
      const err = getLastStorageError();
      if (err && (err.code === 'QUOTA_EXCEEDED' || err.type === 'quota')) {
        if (els.autosaveStatusBadge) {
          els.autosaveStatusBadge.textContent = '⚠️ 저장 공간 부족 (임시저장 생략됨 · 작업 계속 가능)';
        }
        showStorageControlFeedback('⚠️ 브라우저 저장 공간이 부족하여 임시저장을 건너뛰었습니다. 번역·다운로드는 정상 진행됩니다.');
      } else if (err && els.autosaveStatusBadge) {
        els.autosaveStatusBadge.textContent = '⚠️ 브라우저 임시저장 제한 환경 (수동 다운로드만 사용)';
      }
    }
  }, 350);
}

/* ==================== MANUAL MODAL ==================== */

function openManualModal(tabId = 'tab-basic') {
  if (!els.manualModal) return;
  switchManualTab(tabId);
  els.manualModal.classList.remove('hidden');
  els.btnCloseManual?.focus();
}

function closeManualModal() {
  if (!els.manualModal) return;
  els.manualModal.classList.add('hidden');
}

function switchManualTab(targetTabId) {
  els.manualTabs.forEach((tab) => {
    const isMatch = tab.getAttribute('data-manual-tab') === targetTabId;
    tab.classList.toggle('active', isMatch);
    tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
  });
  els.manualTabPanels.forEach((panel) => {
    panel.classList.toggle('hidden', panel.id !== targetTabId);
    panel.classList.toggle('active', panel.id === targetTabId);
  });
}

function bindEvents() {
  // Unsaved work warning before refresh/close
  window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedWork) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Main Workspace View Tabs (PRD 5, 6)
  els.mainViewTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-view-target') || 'translator';
      switchMainView(targetView);
    });
  });

  // Browser Storage Control Bar (PRD 3.2)
  els.chkEnableAutosave?.addEventListener('change', handleToggleAutoSave);
  els.btnClearBrowserStorage?.addEventListener('click', () => {
    if (
      state.parsedDoc &&
      state.currentStep > 1 &&
      !window.confirm(
        '이 브라우저에 임시 저장된 작업 내용과 현재 화면의 문서를 모두 삭제하시겠습니까? (삭제 후 새로고침해도 복원되지 않습니다)'
      )
    ) {
      return;
    }
    handleClearBrowserStorage(true);
  });
  els.btnStep5ClearStorage?.addEventListener('click', () => {
    handleClearBrowserStorage(true);
  });

  // Session restore buttons (Feature #4)
  els.btnRestoreSession?.addEventListener('click', handleRestoreSession);
  els.btnDiscardSession?.addEventListener('click', async () => {
    await handleClearBrowserStorage(false);
  });

  // Manual Modal events
  els.btnOpenManual?.addEventListener('click', () => openManualModal('tab-basic'));
  els.btnOpenManualInline?.addEventListener('click', () => openManualModal('tab-basic'));
  els.btnCloseManual?.addEventListener('click', closeManualModal);
  els.btnCloseManualBottom?.addEventListener('click', closeManualModal);
  els.manualModal?.addEventListener('click', (e) => {
    if (e.target === els.manualModal) closeManualModal();
  });
  els.manualTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-manual-tab');
      if (target) switchManualTab(target);
    });
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && els.manualModal && !els.manualModal.classList.contains('hidden')) {
      closeManualModal();
    }
    if (e.key === 'Escape' && els.studentQrModal && !els.studentQrModal.classList.contains('hidden')) {
      closeStudentQrModal();
    }
  });

  window.addEventListener('hashchange', () => {
    if (window.location.hash && window.location.hash.startsWith('#student-view=')) {
      const encoded = window.location.hash.slice('#student-view='.length);
      const payload = decodeStudentViewPayload(encoded);
      if (payload) {
        openStudentReaderFromPayload(payload, true);
      }
    }
  });

  // Stepper navigation
  els.stepperBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.getAttribute('data-step-target'), 10);
      if (target <= state.maxUnlockedStep && !state.isTranslating) {
        if (state.activeMainView !== 'translator') {
          switchMainView('translator');
        }
        goToStep(target);
      }
    });
  });

  // Header: Peer Teacher Site Share (Idea #5)
  els.btnShareSiteUrl?.addEventListener('click', async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}`;
    const shareText = `[다국어 수업자료 변환기] 한국어 PPT·한글·워드·엑셀 수업자료를 다국어로 서식 유지 변환하는 선생님용 도구: ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(shareText);
      const prev = els.btnShareSiteUrl.textContent;
      els.btnShareSiteUrl.textContent = '✓ 공유 주소 복사됨!';
      setTimeout(() => {
        if (els.btnShareSiteUrl) els.btnShareSiteUrl.textContent = prev;
      }, 2200);
    } catch {
      window.prompt('동료 선생님께 전달할 주소를 복사하세요:', shareUrl);
    }
  });

  // Step 1 footer link toggles (시안 2)
  els.btnTogglePrivacyDetail?.addEventListener('click', () => {
    if (!els.dataPrivacyNoticeStep1) return;
    const isHidden = els.dataPrivacyNoticeStep1.classList.toggle('hidden');
    els.btnTogglePrivacyDetail.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
  });

  els.btnToggleLegacyGuide?.addEventListener('click', () => {
    if (!els.detailsLegacyConvert) return;
    const isHidden = els.detailsLegacyConvert.classList.toggle('hidden');
    if (!isHidden) {
      els.detailsLegacyConvert.open = true;
    }
    els.btnToggleLegacyGuide.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
  });

  // Step 1: 3-Second Quick Start Cards (Idea #1)
  els.btnQuickstartUpload?.addEventListener('click', () => {
    els.fileInput?.click();
  });

  els.btnQuickstartNotice?.addEventListener('click', () => {
    switchMainView('toolkit');
    setTimeout(() => {
      els.textareaToolkitSource?.focus();
      els.textareaToolkitSource?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  });

  els.btnQuickstartCards?.addEventListener('click', () => {
    switchMainView('toolkit');
    setTimeout(() => {
      const cardsHeading = document.getElementById('classroom-cards-heading');
      cardsHeading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  });

  // Idea #1: Quick Convert Mode & Toolkit shortcut in Step 1
  els.btnOpenToolkitFromStep1?.addEventListener('click', () => {
    switchMainView('toolkit');
  });

  els.selectQuickTargetLang?.addEventListener('change', () => {
    const val = els.selectQuickTargetLang.value;
    if (val && !state.isTranslating) {
      applySelectedLanguageEverywhere(val);
    }
  });

  // Step 1: Upload & Drag-Drop & Keyboard
  els.btnSelectFile.addEventListener('click', (e) => {
    e.stopPropagation();
    els.fileInput.click();
  });

  els.dropZone.addEventListener('click', (e) => {
    if (e.target.closest('button, a')) return;
    els.fileInput.click();
  });

  els.dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      els.fileInput.click();
    }
  });

  els.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    els.dropZone.classList.add('drag-over');
  });

  els.dropZone.addEventListener('dragleave', () => {
    els.dropZone.classList.remove('drag-over');
  });

  els.dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    els.dropZone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      await handleUploadedFile(file);
    }
  });

  els.fileInput.addEventListener('change', async () => {
    const file = els.fileInput.files?.[0];
    if (file) {
      await handleUploadedFile(file);
    }
    els.fileInput.value = '';
  });

  els.btnLoadSamplePptx.addEventListener('click', () =>
    loadSampleDocument('./samples/sample-science-lesson.pptx', '초6_과학_지구와_달의_운동.pptx')
  );
  els.btnLoadSampleHwpx.addEventListener('click', () =>
    loadSampleDocument('./samples/sample-science-activity.hwpx', '초6_과학_실험_활동지.hwpx')
  );

  // Step 2 buttons
  const backToStep1 = () => goToStep(1);
  const forwardToStep3 = () => {
    if (!state.parsedDoc || state.parsedDoc.items.length === 0) return;
    unlockAndGoToStep(3);
  };
  els.btnBackToUpload.addEventListener('click', backToStep1);
  els.btnBackToUploadBottom.addEventListener('click', backToStep1);
  els.btnToStep3.addEventListener('click', forwardToStep3);
  els.btnToStep3Bottom.addEventListener('click', forwardToStep3);

  // Step 3 buttons
  els.btnBackToStep2.addEventListener('click', () => {
    if (!state.isTranslating) goToStep(2);
  });

  els.btnStartAutoTranslate.addEventListener('click', handleStartAutoTranslate);
  els.btnSkipToManual.addEventListener('click', () => {
    if (state.isTranslating) return;
    if (state.translatedLangKey && state.translatedLangKey !== state.selectedLangKey) {
      resetItemStatesForLanguageChange();
    }
    state.translatedLangKey = state.selectedLangKey;
    scheduleAutoSave();
    unlockAndGoToStep(4);
  });
  els.btnStep3CopyAiPrompt?.addEventListener('click', () => {
    handleCopyAiPrompt(true);
  });
  els.btnCancelTranslation.addEventListener('click', () => {
    state.cancelTranslationRequested = true;
  });

  // Idea #3: Multi-language Batch ZIP buttons
  els.btnMultiLangSelectCore?.addEventListener('click', () => {
    const coreKeys = new Set(['en', 'zh-Hans', 'vi', 'ru', 'ja', 'uz', 'mn', 'tl', 'th', 'km']);
    els.multiLangCheckboxGrid?.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = coreKeys.has(cb.value);
    });
  });
  els.btnMultiLangClear?.addEventListener('click', () => {
    els.multiLangCheckboxGrid?.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
  });
  els.btnRunMultiLangZip?.addEventListener('click', handleRunMultiLangZip);

  // Step 4 buttons & Instant Download (Idea #2 & #4)
  const backToStep3 = () => goToStep(3);
  const forwardToStep5 = () => unlockAndGoToStep(5);
  els.btnBackToStep3.addEventListener('click', backToStep3);
  els.btnBackToStep3Bottom.addEventListener('click', backToStep3);
  els.btnToStep5.addEventListener('click', forwardToStep5);
  els.btnToStep5Bottom.addEventListener('click', forwardToStep5);

  els.selectStep4OutputMode?.addEventListener('change', () => {
    rememberOutputMode(els.selectStep4OutputMode.value);
    updateStep5FilenameDisplay();
    scheduleAutoSave();
  });

  els.btnStep4DirectDownload?.addEventListener('click', () => handleDownloadTranslatedFile(true));
  els.btnStep4DirectDownloadBottom?.addEventListener('click', () => handleDownloadTranslatedFile(true));
  els.btnStep4OpenQr?.addEventListener('click', handleOpenStudentQrModal);

  els.btnToggleAdvancedReviewTools?.addEventListener('click', () => {
    if (!els.advancedReviewToolsWrap) return;
    const isHidden = els.advancedReviewToolsWrap.classList.toggle('hidden');
    els.btnToggleAdvancedReviewTools.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
    els.btnToggleAdvancedReviewTools.textContent = isHidden
      ? '🛠️ 상세 편집 도구 열기 ▼'
      : '🛠️ 상세 편집 도구 접기 ▲';
  });

  els.filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeFilter = btn.getAttribute('data-filter') || 'all';
      els.filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
      applyReviewFilter();
    });
  });

  els.btnNextUnverified?.addEventListener('click', jumpToNextUnverified);

  els.btnToggleWarningList?.addEventListener('click', () => {
    state.warningListExpanded = !state.warningListExpanded;
    els.unifiedWarningList?.classList.toggle('hidden', !state.warningListExpanded);
    els.btnToggleWarningList.setAttribute('aria-expanded', state.warningListExpanded ? 'true' : 'false');
    els.btnToggleWarningList.textContent = state.warningListExpanded ? '경고 목록 접기 ▲' : '경고 목록 펼치기 ▼';
  });

  els.btnFillEmptyWithSource.addEventListener('click', () => {
    if (!state.parsedDoc) return;
    let changed = 0;
    for (const item of state.parsedDoc.items) {
      const st = state.itemStates.get(item.id);
      if (st && st.finalText.trim().length === 0) {
        st.finalText = item.sourceText;
        st.backTranslatedKo = '';
        changed++;
      }
    }
    if (changed > 0) {
      state.hasUnsavedWork = true;
      scheduleAutoSave();
      renderReviewStep();
    }
  });

  els.btnVerifyAllVisible.addEventListener('click', () => {
    if (!state.parsedDoc) return;
    const cards = els.reviewItemsContainer.querySelectorAll('.review-card:not(.hidden)');
    cards.forEach((card) => {
      const id = card.getAttribute('data-item-id');
      const st = state.itemStates.get(id);
      if (st && st.finalText.trim().length > 0) {
        st.verified = true;
      }
    });
    state.hasUnsavedWork = true;
    scheduleAutoSave();
    renderReviewStep();
  });

  // Step 4 Power Tools (Back-translation, Feature #2, #5, #7, #8)
  els.btnRunAllBacktranslate?.addEventListener('click', handleRunAllBacktranslate);
  els.chkAutoSyncIdentical?.addEventListener('change', () => {
    state.autoSyncIdentical = Boolean(els.chkAutoSyncIdentical.checked);
  });

  els.btnToggleGlossary?.addEventListener('click', () => {
    const isHidden = els.glossaryDrawer.classList.toggle('hidden');
    els.btnToggleGlossary.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
    if (!isHidden) {
      els.findReplaceDrawer?.classList.add('hidden');
      els.btnToggleFindReplace?.setAttribute('aria-expanded', 'false');
      els.csvPasteDrawer?.classList.add('hidden');
      els.btnToggleCsvPanel?.setAttribute('aria-expanded', 'false');
      renderGlossaryDrawer();
    }
  });

  els.btnToggleFindReplace?.addEventListener('click', () => {
    const isHidden = els.findReplaceDrawer.classList.toggle('hidden');
    els.btnToggleFindReplace.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
    if (!isHidden) {
      els.glossaryDrawer?.classList.add('hidden');
      els.btnToggleGlossary?.setAttribute('aria-expanded', 'false');
      els.csvPasteDrawer?.classList.add('hidden');
      els.btnToggleCsvPanel?.setAttribute('aria-expanded', 'false');
    }
  });

  els.btnToggleCsvPanel?.addEventListener('click', () => {
    const isHidden = els.csvPasteDrawer.classList.toggle('hidden');
    els.btnToggleCsvPanel.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
    if (!isHidden) {
      els.glossaryDrawer?.classList.add('hidden');
      els.btnToggleGlossary?.setAttribute('aria-expanded', 'false');
      els.findReplaceDrawer?.classList.add('hidden');
      els.btnToggleFindReplace?.setAttribute('aria-expanded', 'false');
    }
  });

  els.btnAddCustomGlossary?.addEventListener('click', handleAddCustomGlossary);
  els.btnApplyGlossaryAll?.addEventListener('click', handleApplyGlossaryAll);
  els.btnExportGlossaryJson?.addEventListener('click', handleExportGlossaryJson);
  els.btnImportGlossaryJson?.addEventListener('click', () => els.inputImportGlossaryFile?.click());
  els.inputImportGlossaryFile?.addEventListener('change', handleImportGlossaryFile);
  els.btnRunReplaceAll?.addEventListener('click', handleRunFindReplaceAll);
  els.btnExportCsv?.addEventListener('click', handleExportCsv);
  els.btnCopySourceLines?.addEventListener('click', handleCopySourceLines);
  els.btnCopyAiPrompt?.addEventListener('click', () => handleCopyAiPrompt(false));
  els.btnApplyBulkPaste?.addEventListener('click', handleApplyBulkPaste);
  els.btnCollapseVerifiedGroups?.addEventListener('click', handleToggleCollapseVerifiedGroups);

  // Step 5 buttons & output mode (Feature #3 & #10 & Idea #9)
  els.btnBackToStep4.addEventListener('click', () => goToStep(4));
  els.btnBackToStep4Bottom.addEventListener('click', () => goToStep(4));
  els.btnRestartNewFile.addEventListener('click', () => {
    if (
      state.hasUnsavedWork &&
      !window.confirm('새 파일을 불러오면 현재 편집 중인 번역 내용이 초기화됩니다. 계속하시겠습니까?')
    ) {
      return;
    }
    handleClearBrowserStorage(true);
  });

  els.outputModeRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        rememberOutputMode(radio.value);
        updateStep5FilenameDisplay();
        scheduleAutoSave();
      }
    });
  });

  els.btnDownloadFile.addEventListener('click', () => handleDownloadTranslatedFile(false));
  els.btnOpenStudentQrModal?.addEventListener('click', handleOpenStudentQrModal);
  els.btnCloseStudentQrModal?.addEventListener('click', closeStudentQrModal);
  els.btnCloseStudentQrBottom?.addEventListener('click', closeStudentQrModal);
  els.studentQrModal?.addEventListener('click', (e) => {
    if (e.target === els.studentQrModal) closeStudentQrModal();
  });
  els.btnCopyStudentShareUrl?.addEventListener('click', handleCopyStudentShareUrl);
  els.btnSpeakAllStudentCards?.addEventListener('click', handleSpeakAllStudentCards);
  els.chkStudentReaderShowKo?.addEventListener('change', () => {
    const showKo = Boolean(els.chkStudentReaderShowKo.checked);
    els.studentReaderCardsList?.querySelectorAll('.student-reader-ko-line').forEach((el) => {
      el.classList.toggle('hidden', !showKo);
    });
  });

  els.btnPrintComparisonSheet?.addEventListener('click', handleOpenComparisonSheet);
  els.btnTriggerWindowPrint?.addEventListener('click', () => window.print());
  els.btnClosePrintSheet?.addEventListener('click', () => {
    els.printableComparisonSheet?.classList.add('hidden');
  });

  // Lesson Utilization Cases Events (PRD 5)
  bindCaseSharingEvents();

  // Admin Center Events (PRD 6, 7)
  bindAdminEvents();
}

function resetItemStatesForLanguageChange() {
  if (!state.parsedDoc) return;
  for (const item of state.parsedDoc.items) {
    const prev = state.itemStates.get(item.id);
    const keepOrig = Boolean(prev?.keepOriginal) || isNonTranslatableText(item.sourceText);
    state.itemStates.set(item.id, {
      draftText: keepOrig ? item.sourceText : null,
      draftBackTranslatedKo: keepOrig ? item.sourceText : '',
      finalText: keepOrig ? item.sourceText : '',
      backTranslatedKo: keepOrig ? item.sourceText : '',
      verified: keepOrig,
      autoFailed: false,
      errorMessage: null,
      keepOriginal: keepOrig
    });
  }
}

function unlockAndGoToStep(stepNum) {
  if (stepNum > state.maxUnlockedStep) {
    state.maxUnlockedStep = stepNum;
  }
  goToStep(stepNum);
}

function goToStep(stepNum) {
  if (stepNum >= 4 && state.translatedLangKey && state.translatedLangKey !== state.selectedLangKey) {
    resetItemStatesForLanguageChange();
    state.translatedLangKey = state.selectedLangKey;
    scheduleAutoSave();
  }

  state.currentStep = stepNum;
  if (els.stepperBarNav) {
    const hideStepper =
      state.activeMainView !== 'translator' || (stepNum === 1 && state.maxUnlockedStep === 1);
    els.stepperBarNav.classList.toggle('hidden', hideStepper);
  }
  for (let s = 1; s <= 5; s++) {
    const panel = els.stepPanels[s];
    if (panel) {
      panel.classList.toggle('hidden', s !== stepNum);
      panel.classList.toggle('active', s === stepNum);
    }
  }

  els.stepperItems.forEach((li) => {
    const s = parseInt(li.getAttribute('data-step'), 10);
    const btn = li.querySelector('.stepper-btn');
    li.classList.toggle('active', s === stepNum);
    li.classList.toggle('completed', s < stepNum && s <= state.maxUnlockedStep);
    if (btn) {
      btn.disabled = s > state.maxUnlockedStep;
      if (s === stepNum) {
        btn.setAttribute('aria-current', 'step');
      } else {
        btn.removeAttribute('aria-current');
      }
    }
  });

  if (stepNum === 2) {
    renderExtractStep();
  } else if (stepNum === 3) {
    updateSelectedLanguageStatusUI();
  } else if (stepNum === 4) {
    renderGlossaryDrawer();
    renderReviewStep();
  } else if (stepNum === 5) {
    renderDownloadStep();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==================== STEP 1: FILE UPLOAD ==================== */

function hideUploadError() {
  els.uploadErrorBox.classList.add('hidden');
}

function showUploadError(title, message, actionHint, code = '') {
  els.uploadErrorTitle.textContent = title;
  els.uploadErrorMessage.textContent = message;
  els.uploadErrorAction.textContent = actionHint ? `해결 방법: ${actionHint}` : '';
  els.uploadErrorBox.classList.remove('hidden');

  if (code.includes('LEGACY_') || code.includes('OLE2_')) {
    if (els.detailsLegacyConvert) {
      els.detailsLegacyConvert.classList.remove('hidden');
      els.detailsLegacyConvert.open = true;
    }
  }
}

async function handleUploadedFile(file) {
  hideUploadError();
  try {
    const arrayBuffer = await file.arrayBuffer();
    await processLoadedBuffer(file.name, arrayBuffer);
  } catch (err) {
    if (err instanceof DocumentProcessError) {
      showUploadError(err.title, err.message, err.actionHint, err.code);
    } else {
      showUploadError(
        '파일을 읽는 중 오류가 발생했습니다',
        err?.message || '알 수 없는 파일 처리 오류입니다.',
        '정상적인 .pptx, .hwpx, .docx, .xlsx 파일인지 확인한 후 다시 시도해 주세요.'
      );
    }
  }
}

async function loadSampleDocument(url, displayFileName) {
  hideUploadError();
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`샘플 파일을 불러오지 못했습니다 (HTTP ${resp.status})`);
    }
    const arrayBuffer = await resp.arrayBuffer();
    await processLoadedBuffer(displayFileName, arrayBuffer);
  } catch (err) {
    if (err instanceof DocumentProcessError) {
      showUploadError(err.title, err.message, err.actionHint, err.code);
    } else {
      showUploadError(
        '샘플 파일 불러오기 실패',
        err?.message || '샘플 문서를 가져오지 못했습니다.',
        '페이지를 새로고침하거나 직접 .pptx·.hwpx·.docx·.xlsx 파일을 선택해 주세요.'
      );
    }
  }
}

async function processLoadedBuffer(fileName, arrayBuffer) {
  const parsed = await extractDocumentFromBuffer(fileName, arrayBuffer);
  state.parsedDoc = parsed;
  state.translatedLangKey = null;
  state.pendingRestorableSession = null;
  els.sessionRestoreBanner?.classList.add('hidden');
  state.itemStates.clear();
  state.collapsedGroups.clear();

  for (const item of parsed.items) {
    const autoSkip = isNonTranslatableText(item.sourceText);
    state.itemStates.set(item.id, {
      draftText: autoSkip ? item.sourceText : null,
      draftBackTranslatedKo: autoSkip ? item.sourceText : '',
      finalText: autoSkip ? item.sourceText : '',
      backTranslatedKo: autoSkip ? item.sourceText : '',
      verified: autoSkip,
      autoFailed: false,
      errorMessage: null,
      keepOriginal: autoSkip
    });
  }
  state.activeFilter = 'all';
  state.hasUnsavedWork = parsed.items.length > 0;
  state.maxUnlockedStep = parsed.items.length > 0 ? 3 : 2;
  els.translationResultAlert.classList.add('hidden');
  els.translationProgressPanel.classList.add('hidden');
  scheduleAutoSave();

  // Idea #1: ⚡ One-Click Quick Convert Mode (skip steps 2 & 3)
  if (els.chkQuickTranslateMode?.checked && parsed.items.length > 0) {
    const quickLang = els.selectQuickTargetLang?.value || state.selectedLangKey || 'en';
    state.selectedLangKey = quickLang;
    document.querySelectorAll('.lang-option-card').forEach((c) => {
      const isMatch = c.getAttribute('data-lang-key') === quickLang;
      c.classList.toggle('selected', isMatch);
      const r = c.querySelector('input[type="radio"]');
      if (r) r.checked = isMatch;
    });
    updateSelectedLanguageStatusUI();

    // Pre-apply school glossary matches so even manual fallback has instant school terms
    const entries = getAllGlossaryEntries();
    for (const item of parsed.items) {
      const st = state.itemStates.get(item.id);
      if (!st || st.keepOriginal) continue;
      const srcTrimmed = item.sourceText.trim();
      const srcCore = srcTrimmed.replace(/^[\d.\-•()\s]+|[:：.\s]+$/g, '').trim();
      for (const entry of entries) {
        const targetTerm = entry.translations?.[quickLang];
        if (!targetTerm) continue;
        if (srcTrimmed === entry.ko || srcCore === entry.ko) {
          st.finalText = targetTerm;
          break;
        }
      }
    }

    const supportInfo = state.langSupportMap.get(quickLang) || (await checkLanguagePairSupport(quickLang));
    state.langSupportMap.set(quickLang, supportInfo);
    if (supportInfo && supportInfo.supported) {
      unlockAndGoToStep(3);
      await handleStartAutoTranslate();
      return;
    } else {
      state.translatedLangKey = quickLang;
      scheduleAutoSave();
      unlockAndGoToStep(4);
      return;
    }
  }

  goToStep(2);
}

/* ==================== STEP 2: EXTRACT RESULTS ==================== */

function getFileTypeBadgeText(fileType) {
  if (fileType === 'pptx') return 'PPTX (PowerPoint)';
  if (fileType === 'docx') return 'DOCX (Word 문서)';
  if (fileType === 'xlsx') return 'XLSX (Excel 표 문서)';
  return 'HWPX (한글 표준 문서)';
}

function renderExtractStep() {
  const doc = state.parsedDoc;
  if (!doc) return;

  els.extractFileName.textContent = doc.fileName;
  els.extractFileTypeBadge.textContent = getFileTypeBadgeText(doc.fileType);
  if (doc.fileType === 'pptx') {
    els.extractUnitLabel.textContent = '전체 슬라이드 수';
    els.extractUnitCount.textContent = `${doc.unitCount ?? 0}장`;
  } else if (doc.fileType === 'xlsx') {
    els.extractUnitLabel.textContent = '전체 시트 수';
    els.extractUnitCount.textContent = `${doc.unitCount ?? 1}개 시트`;
  } else if (doc.fileType === 'docx') {
    els.extractUnitLabel.textContent = '문서 구성';
    els.extractUnitCount.textContent = 'Word 본문·표';
  } else {
    els.extractUnitLabel.textContent = '전체 섹션 수';
    els.extractUnitCount.textContent = `${doc.sectionCount || 1}개 섹션`;
  }
  els.extractItemCount.textContent = `${doc.items.length}개`;

  const hasItems = doc.items.length > 0;
  els.extractEmptyBox.classList.toggle('hidden', hasItems);
  els.btnToStep3.disabled = !hasItems;
  els.btnToStep3Bottom.disabled = !hasItems;

  els.extractListContainer.innerHTML = '';
  if (!hasItems) return;

  if (doc.fileType === 'pptx' || doc.fileType === 'xlsx') {
    const unitGroups = new Map();
    for (const item of doc.items) {
      if (!unitGroups.has(item.groupNumber)) {
        unitGroups.set(item.groupNumber, []);
      }
      unitGroups.get(item.groupNumber).push(item);
    }

    const unitPrefix = doc.fileType === 'pptx' ? '슬라이드' : '시트';
    for (const [unitNum, items] of unitGroups.entries()) {
      const card = document.createElement('div');
      card.className = 'extract-group-card';

      const header = document.createElement('div');
      header.className = 'extract-group-header';
      header.innerHTML = `<span>${unitPrefix} ${unitNum}</span><span>추출 문장 ${items.length}개</span>`;
      card.appendChild(header);

      const list = document.createElement('div');
      list.className = 'extract-group-items';
      for (const item of items) {
        const row = document.createElement('div');
        row.className = 'extract-item-row';

        const meta = document.createElement('div');
        meta.className = 'extract-item-meta';
        meta.innerHTML = `<span>항목 ${item.orderInGroup}</span><span class="badge badge-context">${escapeHtml(item.contextLabel)}</span>`;

        const textDiv = document.createElement('div');
        textDiv.className = 'extract-item-text';
        textDiv.textContent = item.sourceText;

        row.appendChild(meta);
        row.appendChild(textDiv);
        list.appendChild(row);
      }
      card.appendChild(list);
      els.extractListContainer.appendChild(card);
    }
  } else {
    const card = document.createElement('div');
    card.className = 'extract-group-card';

    const header = document.createElement('div');
    header.className = 'extract-group-header';
    header.innerHTML = `<span>문단 순서별 원문 목록</span><span>총 ${doc.items.length}개 문단</span>`;
    card.appendChild(header);

    const list = document.createElement('div');
    list.className = 'extract-group-items';
    for (const item of doc.items) {
      const row = document.createElement('div');
      row.className = 'extract-item-row';

      const meta = document.createElement('div');
      meta.className = 'extract-item-meta';
      meta.innerHTML = `<span>${escapeHtml(item.locationLabel)}</span><span class="badge badge-context">${escapeHtml(item.contextLabel)}</span>`;

      const textDiv = document.createElement('div');
      textDiv.className = 'extract-item-text';
      textDiv.textContent = item.sourceText;

      row.appendChild(meta);
      row.appendChild(textDiv);
      list.appendChild(row);
    }
    card.appendChild(list);
    els.extractListContainer.appendChild(card);
  }
}

/* ==================== STEP 3: LANGUAGE SELECTION & TRANSLATION ==================== */

function createLanguageCardElement(lang) {
  const label = document.createElement('label');
  label.className = `lang-option-card${lang.key === state.selectedLangKey ? ' selected' : ''}`;
  label.setAttribute('data-lang-key', lang.key);

  label.innerHTML = `
    <div class="lang-option-top">
      <div>
        <input type="radio" name="target-language" value="${lang.key}" ${lang.key === state.selectedLangKey ? 'checked' : ''} />
        <span class="lang-name-ko">${escapeHtml(lang.label)}</span>
      </div>
      <span class="badge badge-context" id="lang-card-badge-${lang.key}">확인 중</span>
    </div>
    <div class="lang-name-native" lang="${escapeHtml(lang.key)}" dir="${escapeHtml(lang.dir || 'ltr')}">${escapeHtml(lang.nativeLabel)} (${escapeHtml(lang.candidates[0])})</div>
  `;

  const radio = label.querySelector('input[type="radio"]');
  radio.addEventListener('change', () => {
    if (state.isTranslating) return;
    applySelectedLanguageEverywhere(lang.key);
    scheduleAutoSave();
  });

  return label;
}

function renderLanguageCards() {
  if (els.languageOptionsGrid) els.languageOptionsGrid.innerHTML = '';
  if (els.extendedLanguageOptionsGrid) els.extendedLanguageOptionsGrid.innerHTML = '';

  const selectedMeta = getTargetLanguageMeta(state.selectedLangKey);
  if (selectedMeta?.tier === 'extended' && els.extendedLanguagesDetails) {
    els.extendedLanguagesDetails.open = true;
  }

  for (const lang of TARGET_LANGUAGES) {
    const cardEl = createLanguageCardElement(lang);
    if (lang.tier === 'extended' && els.extendedLanguageOptionsGrid) {
      els.extendedLanguageOptionsGrid.appendChild(cardEl);
    } else if (els.languageOptionsGrid) {
      els.languageOptionsGrid.appendChild(cardEl);
    }
  }

  const langOptionsHtml = TARGET_LANGUAGES.map(
    (l) => `<option value="${escapeHtml(l.key)}">${escapeHtml(l.label)} (${escapeHtml(l.nativeLabel)})</option>`
  ).join('');

  if (els.selectQuickTargetLang) {
    els.selectQuickTargetLang.innerHTML = TARGET_LANGUAGES.map(
      (l) => `<option value="${escapeHtml(l.key)}">🌐 ${escapeHtml(l.label)} (${escapeHtml(l.nativeLabel)})</option>`
    ).join('');
    els.selectQuickTargetLang.value = state.selectedLangKey || 'vi';
  }

  if (els.selectToolkitTargetLang) {
    els.selectToolkitTargetLang.innerHTML = TARGET_LANGUAGES.map(
      (l) => `<option value="${escapeHtml(l.key)}">🌐 ${escapeHtml(l.label)} (${escapeHtml(l.nativeLabel)})</option>`
    ).join('');
    els.selectToolkitTargetLang.value = state.selectedLangKey || 'vi';
  }

  if (els.multiLangCheckboxGrid && els.multiLangCheckboxGrid.children.length === 0) {
    const defaultChecked = new Set(['vi', 'zh-Hans', 'en', 'ru']);
    els.multiLangCheckboxGrid.innerHTML = TARGET_LANGUAGES.map(
      (l) => `
        <label class="multi-lang-check-item">
          <input type="checkbox" value="${escapeHtml(l.key)}" ${defaultChecked.has(l.key) ? 'checked' : ''} />
          <span>${escapeHtml(l.label)} <small class="text-muted">(${escapeHtml(l.nativeLabel)})</small></span>
        </label>
      `
    ).join('');
  }

  if (els.caseInputLang) {
    const currentVal = els.caseInputLang.value;
    els.caseInputLang.innerHTML = '<option value="">선택해 주세요</option>' + langOptionsHtml;
    if (currentVal) els.caseInputLang.value = currentVal;
  }

  if (els.filterCaseLang) {
    const currentFilter = els.filterCaseLang.value || 'all';
    els.filterCaseLang.innerHTML = '<option value="all">🌐 전체 언어</option>' + langOptionsHtml;
    els.filterCaseLang.value = currentFilter;
  }
}

async function refreshAllLanguageSupport() {
  await Promise.all(
    TARGET_LANGUAGES.map(async (lang) => {
      const info = await checkLanguagePairSupport(lang.key);
      state.langSupportMap.set(lang.key, info);
      const cardBadge = document.getElementById(`lang-card-badge-${lang.key}`);
      if (cardBadge) {
        cardBadge.textContent = info.supported
          ? info.status === 'available'
            ? '자동 번역 가능'
            : '모델 다운로드 가능'
          : '용어집·수동 입력';
        cardBadge.className = `badge ${
          info.supported
            ? info.status === 'available'
              ? 'badge-available'
              : 'badge-downloadable'
            : 'badge-unavailable'
        }`;
      }
    })
  );
  updateSelectedLanguageStatusUI();
}

async function updateSelectedLanguageStatusUI() {
  const key = state.selectedLangKey;
  let info = state.langSupportMap.get(key);
  if (!info) {
    info = await checkLanguagePairSupport(key);
    state.langSupportMap.set(key, info);
  }

  els.translatorAvailabilityBadge.textContent = info.badgeText;
  els.translatorAvailabilityBadge.className = `badge ${
    info.supported
      ? info.status === 'available'
        ? 'badge-available'
        : 'badge-downloadable'
      : 'badge-unavailable'
  }`;

  els.translatorAvailabilityReason.textContent = info.reason;
  els.translatorAvailabilityHint.textContent = info.actionHint || '';

  els.btnStartAutoTranslate.disabled = !info.supported || state.isTranslating;
  const langMeta = getTargetLanguageMeta(key);
  if (info.supported) {
    els.btnStartAutoTranslate.textContent = `🤖 한국어 → ${langMeta.label} 자동 번역 초안 만들기`;
    els.autoTranslateHelper.textContent =
      info.status === 'available'
        ? '브라우저 내장 번역 모델이 준비되어 있어 즉시 번역 초안과 한국어 역번역 대조문을 함께 생성합니다.'
        : '최초 실행 시 브라우저가 언어 모델을 다운로드한 뒤 번역 초안과 한국어 역번역 대조문을 생성합니다.';
  } else {
    els.btnStartAutoTranslate.textContent = `자동 번역 사용 불가 (${langMeta.label})`;
    els.autoTranslateHelper.textContent =
      '현재 브라우저 또는 언어 조합은 자동 번역을 지원하지 않습니다. 오른쪽 [직접 번역문 입력하기] 버튼을 눌러 학교 용어집이나 엑셀 붙여넣기로 계속 작업하세요.';
  }
}

async function handleStartAutoTranslate() {
  if (!state.parsedDoc || state.isTranslating) return;

  const langKey = state.selectedLangKey;
  const langMeta = getTargetLanguageMeta(langKey);
  const supportInfo = state.langSupportMap.get(langKey) || {
    resolvedCode: langMeta.candidates[0]
  };
  const resolvedCode = supportInfo.resolvedCode || langMeta.candidates[0];

  // CRITICAL: Start Translator.create() synchronously inside click handler
  // before any await to preserve transient user activation in Chrome!
  const translatorPromise = startTranslatorCreation(resolvedCode, (ratio) => {
    const pct = Math.round(ratio * 100);
    els.modelDownloadBarWrap.classList.remove('hidden');
    els.modelDownloadPercent.textContent = `${pct}%`;
    els.modelDownloadFill.style.width = `${pct}%`;
    els.modelDownloadProgressbar.setAttribute('aria-valuenow', String(pct));
    els.translationProgressTitle.textContent = `브라우저 내장 ${langMeta.label} 번역 모델 다운로드 중...`;
  });

  // Also start reverse translator (target -> ko) synchronously so teachers can see Korean back-translation immediately
  const reverseTranslatorPromise = startReverseTranslatorCreation(resolvedCode).catch(() => null);

  state.isTranslating = true;
  state.cancelTranslationRequested = false;
  els.btnStartAutoTranslate.disabled = true;
  els.btnSkipToManual.disabled = true;
  els.translationResultAlert.classList.add('hidden');
  els.translationProgressPanel.classList.remove('hidden');

  const items = state.parsedDoc.items;
  const total = items.length;
  els.translationProgressTitle.textContent = `${langMeta.label} 번역 모델 준비 중...`;
  els.translationProgressCounts.textContent = `0 / ${total}`;
  els.itemTranslatePercent.textContent = '0%';
  els.itemTranslateFill.style.width = '0%';
  els.itemTranslateProgressbar.setAttribute('aria-valuenow', '0');

  let translator;
  let reverseTranslator = null;
  try {
    translator = await translatorPromise;
    reverseTranslator = await reverseTranslatorPromise;
  } catch (err) {
    state.isTranslating = false;
    els.btnStartAutoTranslate.disabled = false;
    els.btnSkipToManual.disabled = false;
    els.translationProgressPanel.classList.add('hidden');

    showTranslationAlert(
      'error',
      `자동 번역 모델을 준비하지 못했습니다 (${err?.name || '오류'})`,
      `원인: ${err?.message || '브라우저에서 번역 모델 생성을 거부했거나 네트워크·다운로드에 실패했습니다.'}`,
      '네트워크 연결을 확인한 뒤 [🔄 자동 번역 다시 시도]를 누르거나, [✍️ 직접 번역문 입력으로 이동]을 눌러 기존 작업 손실 없이 수동 번역·용어집·엑셀 붙여넣기로 계속 진행할 수 있습니다.',
      true
    );
    return;
  }

  if (state.translatedLangKey && state.translatedLangKey !== langKey) {
    resetItemStatesForLanguageChange();
  }
  state.translatedLangKey = langKey;

  let successCount = 0;
  let failCount = 0;
  const translationCache = new Map();
  const reverseCache = new Map();

  for (let idx = 0; idx < total; idx++) {
    if (state.cancelTranslationRequested) {
      break;
    }

    const item = items[idx];
    const itemState = state.itemStates.get(item.id);
    els.translationProgressTitle.textContent = `한국어 → ${langMeta.label} 번역 및 역번역 검증 중...`;
    els.itemTranslateCurrentLabel.textContent = `${item.locationLabel} (${item.contextLabel}) 번역 중`;
    els.translationProgressCounts.textContent = `${idx + 1} / ${total}`;

    // Feature #6: Keep original for non-translatable numbers/dates/symbols or user-locked items
    if (itemState.keepOriginal || isNonTranslatableText(item.sourceText)) {
      itemState.keepOriginal = true;
      itemState.draftText = item.sourceText;
      itemState.draftBackTranslatedKo = item.sourceText;
      itemState.finalText = item.sourceText;
      itemState.backTranslatedKo = item.sourceText;
      itemState.verified = true;
      itemState.autoFailed = false;
      itemState.errorMessage = null;
      successCount++;
    } else {
      try {
        const srcKey = item.sourceText.trim();
        let translated;
        if (translationCache.has(srcKey)) {
          translated = translationCache.get(srcKey);
        } else {
          translated = await translateSingleText(translator, item.sourceText);
          translationCache.set(srcKey, translated);
        }
        itemState.draftText = translated;
        itemState.finalText = translated;
        itemState.backTranslatedKo = '';

        if (reverseTranslator && translated.trim().length > 0) {
          if (reverseCache.has(translated)) {
            itemState.backTranslatedKo = reverseCache.get(translated);
          } else {
            try {
              const backKo = await translateSingleText(reverseTranslator, translated);
              reverseCache.set(translated, backKo);
              itemState.backTranslatedKo = backKo;
            } catch {
              itemState.backTranslatedKo = '';
            }
          }
        }
        itemState.draftBackTranslatedKo = itemState.backTranslatedKo;

        itemState.verified = false; // Never auto-mark translated sentences as verified
        itemState.autoFailed = false;
        itemState.errorMessage = null;
        successCount++;
      } catch (itemErr) {
        itemState.draftText = null;
        itemState.draftBackTranslatedKo = '';
        itemState.finalText = '';
        itemState.backTranslatedKo = '';
        itemState.autoFailed = true;
        itemState.errorMessage = itemErr?.message || '자동 번역 실패';
        failCount++;
      }
    }

    const pct = Math.round(((idx + 1) / total) * 100);
    els.itemTranslatePercent.textContent = `${pct}%`;
    els.itemTranslateFill.style.width = `${pct}%`;
    els.itemTranslateProgressbar.setAttribute('aria-valuenow', String(pct));

    await new Promise((r) => setTimeout(r, 0));
  }

  if (translator && typeof translator.destroy === 'function') {
    try {
      translator.destroy();
    } catch {
      // ignore
    }
  }
  if (reverseTranslator && typeof reverseTranslator.destroy === 'function') {
    try {
      reverseTranslator.destroy();
    } catch {
      // ignore
    }
  }

  state.isTranslating = false;
  state.hasUnsavedWork = true;
  els.btnStartAutoTranslate.disabled = false;
  els.btnSkipToManual.disabled = false;
  scheduleAutoSave();

  checkLanguagePairSupport(langKey).then((updated) => {
    state.langSupportMap.set(langKey, updated);
    updateSelectedLanguageStatusUI();
  });

  if (state.cancelTranslationRequested) {
    showTranslationAlert(
      'warning',
      '자동 번역이 중단되었습니다',
      `총 ${total}개 중 ${successCount}개 항목의 번역 초안이 생성되었습니다.`,
      '번역 검토 화면에서 나머지 빈 항목을 직접 입력하거나 수정할 수 있습니다.'
    );
  } else if (failCount > 0) {
    showTranslationAlert(
      'warning',
      `일부 항목(${failCount}개) 자동 번역 실패`,
      `총 ${total}개 중 ${successCount}개 성공, ${failCount}개 항목은 자동 번역에 실패했습니다.`,
      '다음 단계(번역 검토)에서 실패 표시된 항목의 번역문을 직접 입력해 주세요.',
      true
    );
  } else {
    showTranslationAlert(
      'success',
      `자동 번역 및 역번역 검증 완료 (${successCount}개 항목)`,
      `모든 항목의 ${langMeta.label} 번역 초안과 한국어 역번역 대조문이 준비되었습니다. 내용을 확인하고 수정해 주세요.`,
      '번역 검토 화면으로 이동합니다.'
    );
  }

  unlockAndGoToStep(4);
}

function showTranslationAlert(type, title, message, actionHint, showRetryActions = false) {
  els.translationResultAlert.className = `alert-box alert-${type}`;
  els.translationResultAlert.innerHTML = `
    <div class="alert-title">${escapeHtml(title)}</div>
    <p class="alert-message">${escapeHtml(message)}</p>
    ${actionHint ? `<p class="alert-action">${escapeHtml(actionHint)}</p>` : ''}
    ${
      showRetryActions
        ? `<div class="alert-inline-actions" style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary btn-sm" data-role="retry-auto-translate">🔄 자동 번역 다시 시도</button>
            <button type="button" class="btn btn-secondary btn-sm" data-role="fallback-manual-translate">✍️ 직접 번역문 입력으로 이동 →</button>
          </div>`
        : ''
    }
  `;
  const retryBtn = els.translationResultAlert.querySelector('[data-role="retry-auto-translate"]');
  if (retryBtn) {
    retryBtn.addEventListener('click', handleStartAutoTranslate);
  }
  const manualBtn = els.translationResultAlert.querySelector('[data-role="fallback-manual-translate"]');
  if (manualBtn) {
    manualBtn.addEventListener('click', () => els.btnSkipToManual?.click());
  }
  els.translationResultAlert.classList.remove('hidden');
}

/* ==================== STEP 4 POWER TOOLS: BACK-TRANSLATION, GLOSSARY, FIND/REPLACE, CSV/PASTE ==================== */

async function handleRunAllBacktranslate() {
  if (!state.parsedDoc || state.isTranslating) return;
  const langKey = state.selectedLangKey;
  const langMeta = getTargetLanguageMeta(langKey);
  const supportInfo = state.langSupportMap.get(langKey) || {
    resolvedCode: langMeta.candidates[0]
  };
  const resolvedCode = supportInfo.resolvedCode || langMeta.candidates[0];

  // Start reverse translator synchronously on user click
  const reversePromise = startReverseTranslatorCreation(resolvedCode);
  if (els.btnRunAllBacktranslate) els.btnRunAllBacktranslate.disabled = true;
  if (els.backtranslateStatusMsg) {
    els.backtranslateStatusMsg.textContent = `⏳ ${langMeta.label} → 한국어 역번역 모델 준비 중...`;
  }

  let reverseTranslator;
  try {
    reverseTranslator = await reversePromise;
  } catch {
    if (els.btnRunAllBacktranslate) els.btnRunAllBacktranslate.disabled = false;
    if (els.backtranslateStatusMsg) {
      els.backtranslateStatusMsg.textContent = `⚠️ 현재 브라우저에서 ${langMeta.label} → 한국어 자동 역번역 모델을 사용할 수 없습니다. 숫자·부호·용어 자동 검증은 그대로 작동합니다.`;
    }
    return;
  }

  let count = 0;
  const items = state.parsedDoc.items;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const st = state.itemStates.get(it.id);
    if (!st || !st.finalText.trim()) continue;
    if (st.keepOriginal) {
      st.backTranslatedKo = it.sourceText;
      continue;
    }
    if (els.backtranslateStatusMsg) {
      els.backtranslateStatusMsg.textContent = `🔄 역번역 검증 중... (${i + 1}/${items.length})`;
    }
    try {
      st.backTranslatedKo = await translateSingleText(reverseTranslator, st.finalText);
      count++;
    } catch {
      // ignore individual failure
    }
  }

  if (reverseTranslator && typeof reverseTranslator.destroy === 'function') {
    try {
      reverseTranslator.destroy();
    } catch {
      // ignore
    }
  }

  if (els.btnRunAllBacktranslate) els.btnRunAllBacktranslate.disabled = false;
  if (els.backtranslateStatusMsg) {
    els.backtranslateStatusMsg.textContent = `✓ 총 ${count}개 번역문의 한국어 역번역 대조를 완료했습니다!`;
  }
  scheduleAutoSave();
  renderReviewStep();
}

function renderGlossaryDrawer() {
  if (!els.glossaryTermsGrid) return;
  const langMeta = getTargetLanguageMeta(state.selectedLangKey);
  if (els.glossaryLangLabel) {
    els.glossaryLangLabel.textContent = langMeta.label;
  }

  const entries = getAllGlossaryEntries();
  els.glossaryTermsGrid.innerHTML = '';

  for (const entry of entries) {
    const targetTerm = entry.translations?.[state.selectedLangKey];
    if (!targetTerm) continue;
    const chip = document.createElement('div');
    chip.className = 'glossary-term-chip';
    chip.innerHTML = `<strong>${escapeHtml(entry.ko)}</strong> ➔ <span>${escapeHtml(targetTerm)}</span>`;
    els.glossaryTermsGrid.appendChild(chip);
  }
}

function handleAddCustomGlossary() {
  const ko = (els.inputCustomGlossaryKo?.value || '').trim();
  const target = (els.inputCustomGlossaryTarget?.value || '').trim();
  if (!ko || !target) {
    if (els.glossaryFeedbackMsg) {
      els.glossaryFeedbackMsg.textContent = '한국어 용어와 대상 언어 표현을 모두 입력해 주세요.';
    }
    return;
  }

  const customList = loadCustomGlossary();
  const existing = customList.find((e) => e.ko === ko);
  if (existing) {
    existing.translations = existing.translations || {};
    existing.translations[state.selectedLangKey] = target;
  } else {
    customList.unshift({
      ko,
      category: '내 단어장',
      translations: {
        [state.selectedLangKey]: target
      }
    });
  }
  saveCustomGlossary(customList);
  els.inputCustomGlossaryKo.value = '';
  els.inputCustomGlossaryTarget.value = '';
  if (els.glossaryFeedbackMsg) {
    els.glossaryFeedbackMsg.textContent = `✓ '${ko} ➔ ${target}' 단어가 추가되었습니다.`;
  }
  renderGlossaryDrawer();
  renderReviewStep();
}

function handleApplyGlossaryAll() {
  if (!state.parsedDoc) return;
  const entries = getAllGlossaryEntries();
  let updatedCount = 0;

  for (const item of state.parsedDoc.items) {
    const st = state.itemStates.get(item.id);
    if (!st || st.keepOriginal) continue;
    const srcTrimmed = item.sourceText.trim();
    const srcCore = srcTrimmed.replace(/^[\d.\-•()\s]+|[:：.\s]+$/g, '').trim();

    for (const entry of entries) {
      const targetTerm = entry.translations?.[state.selectedLangKey];
      if (!targetTerm) continue;
      if ((srcTrimmed === entry.ko || srcCore === entry.ko) && st.finalText.trim() !== targetTerm) {
        st.finalText = targetTerm;
        st.backTranslatedKo = '';
        updatedCount++;
        break;
      } else if (
        st.finalText.trim().length === 0 &&
        srcTrimmed.includes(entry.ko) &&
        srcTrimmed.length <= entry.ko.length + 4
      ) {
        st.finalText = targetTerm;
        st.backTranslatedKo = '';
        updatedCount++;
        break;
      }
    }
  }

  if (els.glossaryFeedbackMsg) {
    els.glossaryFeedbackMsg.textContent =
      updatedCount > 0
        ? `✓ 총 ${updatedCount}개 문장에 학교 용어집 표현을 반영했습니다.`
        : '일치하는 빈 항목이나 단독 용어 항목이 없습니다. 각 문장 아래의 추천 용어 버튼을 클릭해 삽입할 수도 있습니다.';
  }
  if (updatedCount > 0) {
    state.hasUnsavedWork = true;
    scheduleAutoSave();
    renderReviewStep();
  }
}

function handleExportGlossaryJson() {
  const customList = loadCustomGlossary();
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    schoolGlossary: customList
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `우리학교_맞춤단어장_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);

  if (els.glossaryFeedbackMsg) {
    els.glossaryFeedbackMsg.textContent = `✓ 맞춤 단어장(${customList.length}개 항목)을 파일로 저장했습니다. 동학년 선생님께 공유해 보세요!`;
  }
}

async function handleImportGlossaryFile(e) {
  const file = e.target?.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const customList = loadCustomGlossary();
    let importedCount = 0;

    if (file.name.toLowerCase().endsWith('.csv')) {
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 2 && cols[0] && cols[1] && cols[0] !== '한국어') {
          const ko = cols[0];
          const target = cols[1];
          const langKey = cols[2] || state.selectedLangKey;
          const existing = customList.find((item) => item.ko === ko);
          if (existing) {
            existing.translations = existing.translations || {};
            existing.translations[langKey] = target;
          } else {
            customList.unshift({
              ko,
              category: '공유 단어장',
              translations: { [langKey]: target }
            });
          }
          importedCount++;
        }
      }
    } else {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.schoolGlossary)
          ? parsed.schoolGlossary
          : [];
      for (const item of arr) {
        if (!item || typeof item.ko !== 'string' || !item.ko.trim()) continue;
        const ko = item.ko.trim();
        const existing = customList.find((x) => x.ko === ko);
        if (existing) {
          existing.translations = { ...(existing.translations || {}), ...(item.translations || {}) };
        } else {
          customList.unshift({
            ko,
            category: item.category || '공유 단어장',
            translations: item.translations || {}
          });
        }
        importedCount++;
      }
    }

    saveCustomGlossary(customList);
    renderGlossaryDrawer();
    renderReviewStep();
    if (els.glossaryFeedbackMsg) {
      els.glossaryFeedbackMsg.textContent = `✓ 공유 단어장 파일에서 총 ${importedCount}개 용어를 불러와 병합했습니다!`;
    }
  } catch {
    if (els.glossaryFeedbackMsg) {
      els.glossaryFeedbackMsg.textContent = '⚠️ 단어장 파일 형식이 올바르지 않습니다 (.json 또는 .csv 파일을 선택해 주세요).';
    }
  } finally {
    e.target.value = '';
  }
}

function handleRunFindReplaceAll() {
  if (!state.parsedDoc) return;
  const findStr = els.inputFindText?.value || '';
  const replaceStr = els.inputReplaceText?.value || '';
  if (!findStr) {
    if (els.findReplaceFeedback) {
      els.findReplaceFeedback.textContent = '찾을 단어를 입력해 주세요.';
    }
    return;
  }

  let changedItems = 0;
  for (const item of state.parsedDoc.items) {
    const st = state.itemStates.get(item.id);
    if (!st || !st.finalText) continue;
    if (st.finalText.includes(findStr)) {
      st.finalText = st.finalText.split(findStr).join(replaceStr);
      st.backTranslatedKo = '';
      changedItems++;
    }
  }

  if (els.findReplaceFeedback) {
    els.findReplaceFeedback.textContent =
      changedItems > 0
        ? `✓ 총 ${changedItems}개 항목에서 '${findStr}'을(를) '${replaceStr}'(으)로 바꿨습니다.`
        : `'${findStr}'이(가) 포함된 번역문을 찾지 못했습니다.`;
  }

  if (changedItems > 0) {
    state.hasUnsavedWork = true;
    scheduleAutoSave();
    renderReviewStep();
  }
}

function escapeCsvCell(val) {
  const s = String(val ?? '').replace(/"/g, '""');
  return `"${s}"`;
}

function handleExportCsv() {
  if (!state.parsedDoc) return;
  const langMeta = getTargetLanguageMeta(state.selectedLangKey);
  const rows = [
    ['번호', '위치', '구분', '한국어 원문', `${langMeta.label} 번역문`, '확인 상태'].map(escapeCsvCell).join(',')
  ];

  for (const item of state.parsedDoc.items) {
    const st = state.itemStates.get(item.id);
    rows.push(
      [
        item.index,
        item.locationLabel,
        item.contextLabel,
        item.sourceText,
        st ? st.finalText : '',
        st && st.verified ? '확인 완료' : '미검토'
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  }

  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens Korean & foreign scripts cleanly
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const base = state.parsedDoc.fileName.replace(/\.(pptx|hwpx|docx|xlsx)$/i, '');
  a.href = url;
  a.download = `${base}_${langMeta.key}_번역대조표.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);

  if (els.csvPasteFeedback) {
    els.csvPasteFeedback.textContent = '✓ 엑셀용 CSV 파일을 다운로드했습니다.';
  }
}

async function handleCopySourceLines() {
  if (!state.parsedDoc) return;
  const lines = state.parsedDoc.items.map((it) => it.sourceText.replace(/\r?\n/g, ' ')).join('\n');
  try {
    await navigator.clipboard.writeText(lines);
    if (els.csvPasteFeedback) {
      els.csvPasteFeedback.textContent = `✓ 원문 ${state.parsedDoc.items.length}줄을 클립보드에 복사했습니다.`;
    }
  } catch {
    if (els.textareaBulkPaste) {
      els.textareaBulkPaste.value = lines;
      els.textareaBulkPaste.select();
    }
    if (els.csvPasteFeedback) {
      els.csvPasteFeedback.textContent = '아래 입력창에 원문 목록을 채웠습니다. 복사하여 활용하세요.';
    }
  }
}

/**
 * Idea #6: Copy structured external AI prompt (ChatGPT / Gemini / Claude / Papago)
 */
async function handleCopyAiPrompt(fromStep3 = false) {
  if (!state.parsedDoc) return;
  const promptText = buildExternalAiTranslationPrompt(state.parsedDoc.items, state.selectedLangKey);
  const langMeta = getTargetLanguageMeta(state.selectedLangKey);

  if (fromStep3) {
    if (state.translatedLangKey && state.translatedLangKey !== state.selectedLangKey) {
      resetItemStatesForLanguageChange();
    }
    state.translatedLangKey = state.selectedLangKey;
    scheduleAutoSave();
    unlockAndGoToStep(4);
    els.csvPasteDrawer?.classList.remove('hidden');
    els.btnToggleCsvPanel?.setAttribute('aria-expanded', 'true');
  }

  try {
    await navigator.clipboard.writeText(promptText);
    if (els.csvPasteFeedback) {
      els.csvPasteFeedback.textContent = `✓ ChatGPT·Gemini용 [${langMeta.label} 맞춤형 번역 프롬프트(${state.parsedDoc.items.length}문장)]가 복사되었습니다! AI 답변을 아래 입력창에 붙여넣으세요.`;
    }
  } catch {
    if (els.textareaBulkPaste) {
      els.textareaBulkPaste.value = promptText;
      els.textareaBulkPaste.select();
    }
    if (els.csvPasteFeedback) {
      els.csvPasteFeedback.textContent = '아래 입력창에 AI 프롬프트를 채웠습니다. 복사하여 ChatGPT·Gemini에 붙여넣으세요.';
    }
  }
}

function handleApplyBulkPaste() {
  if (!state.parsedDoc) return;
  const raw = els.textareaBulkPaste?.value || '';
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l, idx, arr) => !(idx === arr.length - 1 && l === ''));

  if (lines.length === 0) {
    if (els.csvPasteFeedback) {
      els.csvPasteFeedback.textContent = '붙여넣을 번역문 줄을 입력창에 먼저 넣어 주세요.';
    }
    return;
  }

  const items = state.parsedDoc.items;
  let applied = 0;
  for (let i = 0; i < Math.min(items.length, lines.length); i++) {
    const st = state.itemStates.get(items[i].id);
    if (st && lines[i].length > 0) {
      // If pasted from TSV (source \t translation), take the last tab column
      const parts = lines[i].split('\t');
      let cleaned = parts[parts.length - 1].trim();
      // Idea #6: Strip leading numbering prefixes like "[1] ", "1. ", "(1) " from AI outputs
      cleaned = cleaned.replace(/^(?:\[\d+\]|\(\d+\)|\d+[.)])\s*/, '').trim();
      st.finalText = cleaned;
      st.backTranslatedKo = '';
      st.keepOriginal = false;
      applied++;
    }
  }

  if (els.csvPasteFeedback) {
    els.csvPasteFeedback.textContent = `✓ 총 ${applied}개 항목에 번역문을 순서대로 반영했습니다 (번호표 자동 제거 적용).`;
  }
  state.hasUnsavedWork = true;
  scheduleAutoSave();
  renderReviewStep();
}

function handleToggleCollapseVerifiedGroups() {
  if (!state.parsedDoc) return;
  const groups = getDocumentGroups();
  const verifiedGroupNums = [];
  for (const [gNum, gItems] of groups.entries()) {
    const allVerified = gItems.every((it) => state.itemStates.get(it.id)?.verified);
    if (allVerified) verifiedGroupNums.push(gNum);
  }

  if (verifiedGroupNums.length === 0) {
    window.alert('모든 문장이 [✓ 확인 완료]된 슬라이드·문단 그룹이 아직 없습니다.');
    return;
  }

  const anyNotCollapsed = verifiedGroupNums.some((g) => !state.collapsedGroups.has(g));
  if (anyNotCollapsed) {
    verifiedGroupNums.forEach((g) => state.collapsedGroups.add(g));
  } else {
    verifiedGroupNums.forEach((g) => state.collapsedGroups.delete(g));
  }
  renderReviewStep();
}

/* ==================== STEP 4: TRANSLATION REVIEW ==================== */

function autoResizeTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  const nextHeight = Math.max(92, textarea.scrollHeight + 4);
  textarea.style.height = `${nextHeight}px`;
}

function getItemNavGroup(item) {
  const ft = state.parsedDoc?.fileType;
  return ft === 'pptx' || ft === 'xlsx' ? item.groupNumber : Math.ceil(item.groupNumber / 5);
}

function formatNavGroupLabel(doc, gNum, gItems, compact = false) {
  if (!doc) return `그룹 ${gNum}`;
  if (doc.fileType === 'pptx') return `슬라이드 ${gNum}`;
  if (doc.fileType === 'xlsx') return `시트 ${gNum}`;
  if (gItems.length === 1) return `문단 ${gItems[0].groupNumber}`;
  return compact
    ? `문단 ${gItems[0].groupNumber}~${gItems[gItems.length - 1].groupNumber}`
    : `문단 ${gItems[0].groupNumber} ~ ${gItems[gItems.length - 1].groupNumber}`;
}

function expandGroupInDOM(gNum) {
  state.collapsedGroups.delete(gNum);
  const groupCards = els.reviewItemsContainer.querySelectorAll(
    `.review-card[data-nav-group="${gNum}"]`
  );
  groupCards.forEach((c) => c.classList.remove('group-collapsed'));
  const divider = els.reviewItemsContainer.querySelector(
    `.review-group-divider[data-divider-group="${gNum}"]`
  );
  const collapseBtn = divider?.querySelector('[data-role="group-collapse-btn"]');
  if (collapseBtn) {
    collapseBtn.textContent = '접기 ▲';
  }
}

function updateGroupDividerStatusUI() {
  if (!state.parsedDoc) return;
  const groups = getDocumentGroups();
  for (const [gNum, gItems] of groups.entries()) {
    const divider = els.reviewItemsContainer.querySelector(
      `.review-group-divider[data-divider-group="${gNum}"]`
    );
    if (!divider) continue;
    const doneCount = gItems.filter((it) => state.itemStates.get(it.id)?.verified).length;
    const isAllDone = doneCount === gItems.length;
    const groupTitle = formatNavGroupLabel(state.parsedDoc, gNum, gItems, false);
    divider.classList.toggle('group-all-verified', isAllDone);
    const titleWrap = divider.querySelector('.review-group-title');
    if (titleWrap) {
      titleWrap.innerHTML = `
        <span>${isAllDone ? '✅' : '📂'} ${escapeHtml(groupTitle)}</span>
        <span class="badge ${isAllDone ? 'badge-available' : 'badge-context'}">${doneCount} / ${gItems.length} 확인 완료</span>
      `;
    }
  }
}

function jumpToNextUnverified() {
  if (!state.parsedDoc) return;
  for (const item of state.parsedDoc.items) {
    const st = state.itemStates.get(item.id);
    if (st && !st.verified) {
      const gNum = getItemNavGroup(item);
      state.collapsedGroups.delete(gNum);
      focusReviewItem(item.id);
      return;
    }
  }
}

function getItemOriginStatus(st) {
  const trimmed = (st.finalText || '').trim();
  if (st.keepOriginal) {
    return {
      code: 'kept',
      label: '원문 그대로 유지',
      cssClass: 'origin-kept'
    };
  }
  if (st.autoFailed && trimmed.length === 0) {
    return {
      code: 'failed',
      label: '자동 번역 실패 · 직접 입력 필요',
      cssClass: 'origin-failed'
    };
  }
  if (trimmed.length === 0) {
    return {
      code: 'empty',
      label: '빈 번역문 (입력 필요)',
      cssClass: 'origin-empty'
    };
  }
  if (st.draftText !== null) {
    if (st.finalText !== st.draftText) {
      return {
        code: 'modified',
        label: '교사 수정본 (초안에서 수정됨)',
        cssClass: 'origin-modified'
      };
    }
    return {
      code: 'draft',
      label: '자동 번역 초안 (수정 전)',
      cssClass: 'origin-draft'
    };
  }
  return {
    code: 'manual',
    label: '교사 직접 입력',
    cssClass: 'origin-manual'
  };
}

async function handleSingleCardBacktranslate(card, item, st, btnEl) {
  if (!st.finalText.trim()) return;
  if (st.keepOriginal) {
    st.backTranslatedKo = item.sourceText;
    syncSingleCardUI(card, item, st);
    updateReviewCountersUI();
    scheduleAutoSave();
    return;
  }

  const langKey = state.selectedLangKey;
  const langMeta = getTargetLanguageMeta(langKey);
  const supportInfo = state.langSupportMap.get(langKey) || {
    resolvedCode: langMeta.candidates[0]
  };
  const resolvedCode = supportInfo.resolvedCode || langMeta.candidates[0];

  // Must invoke synchronously inside click handler for transient user activation
  const reversePromise = startReverseTranslatorCreation(resolvedCode);
  const origLabel = btnEl ? btnEl.textContent : '🔄 역번역 다시 확인';
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.textContent = '⏳ 역번역 중...';
  }

  try {
    const reverseTranslator = await reversePromise;
    const koResult = await translateSingleText(reverseTranslator, st.finalText);
    st.backTranslatedKo = koResult;
    if (reverseTranslator && typeof reverseTranslator.destroy === 'function') {
      try {
        reverseTranslator.destroy();
      } catch {
        // ignore
      }
    }
  } catch {
    const btTextEl = card.querySelector('[data-role="backtranslate-text"]');
    if (btTextEl) {
      btTextEl.textContent = `⚠️ 현재 브라우저 환경에서 ${langMeta.label} → 한국어 자동 역번역 모델을 실행할 수 없습니다. 우측 상단 [💬 교차확인 복사]를 활용할 수 있습니다.`;
      btTextEl.classList.add('is-empty');
    }
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.textContent = origLabel;
    }
    return;
  }

  if (btnEl) {
    btnEl.disabled = false;
    btnEl.textContent = '✓ 역번역 완료';
    setTimeout(() => {
      btnEl.textContent = origLabel;
    }, 1500);
  }
  syncSingleCardUI(card, item, st);
  updateReviewCountersUI();
  scheduleAutoSave();
}

function computeReviewCounters() {
  if (!state.parsedDoc) {
    return {
      total: 0,
      verified: 0,
      unverified: 0,
      empty: 0,
      modified: 0,
      failed: 0,
      overflow: 0,
      attention: 0,
      unverifiedWarnings: 0
    };
  }
  let verified = 0;
  let empty = 0;
  let modified = 0;
  let failed = 0;
  let overflow = 0;
  let attention = 0;
  let unverifiedWarnings = 0;

  for (const item of state.parsedDoc.items) {
    const st = state.itemStates.get(item.id);
    if (!st) continue;
    const isTrimmedEmpty = st.finalText.trim().length === 0;
    if (isTrimmedEmpty) empty++;
    if (st.verified) verified++;
    if (st.autoFailed && isTrimmedEmpty) failed++;
    if (
      (st.draftText !== null && st.finalText !== st.draftText && !isTrimmedEmpty) ||
      (st.draftText === null && !isTrimmedEmpty)
    ) {
      modified++;
    }
    if (evaluateLengthOverflowRisk(item.sourceText, st.finalText, item.contextLabel)) {
      overflow++;
    }
    const signal = evaluateTranslationTrafficLight(item, st, state.selectedLangKey);
    if (signal.level === 'red' || signal.level === 'yellow') {
      attention++;
      if (!st.verified) {
        unverifiedWarnings++;
      }
    }
  }

  const total = state.parsedDoc.items.length;
  return {
    total,
    verified,
    unverified: total - verified,
    empty,
    modified,
    failed,
    overflow,
    attention,
    unverifiedWarnings
  };
}

function updateReviewCountersUI() {
  const c = computeReviewCounters();
  const langMeta = getTargetLanguageMeta(state.selectedLangKey);
  els.reviewTargetLangLabel.textContent = `${langMeta.label} (${langMeta.nativeLabel})`;
  els.reviewTotalCount.textContent = `${c.total}개`;
  els.reviewVerifiedCount.textContent = `${c.verified}개`;
  els.reviewUnverifiedCount.textContent = `${c.unverified}개`;
  els.reviewEmptyCount.textContent = `${c.empty}개`;
  if (els.reviewSignalCount && els.reviewSignalChip) {
    els.reviewSignalCount.textContent = `${c.attention}개`;
    els.reviewSignalChip.classList.toggle('hidden', c.attention === 0);
  }
  if (els.reviewOverflowCount && els.reviewOverflowChip) {
    els.reviewOverflowCount.textContent = `${c.overflow}개`;
    els.reviewOverflowChip.classList.toggle('hidden', c.overflow === 0);
  }
  els.reviewFailedCount.textContent = `${c.failed}개`;
  els.reviewFailedChip.classList.toggle('hidden', c.failed === 0);

  renderUnifiedWarningSummary();
}

/**
 * PRD 4.1: Unified Review Warning Summary Panel
 * Aggregates missing numbers/dates/percentages, leftover Korean, length overflow, and glossary mismatch warnings in one place.
 */
function renderUnifiedWarningSummary() {
  if (!els.unifiedWarningSummaryPanel || !els.unifiedWarningList || !state.parsedDoc) return;

  const warningEntries = [];
  let unverifiedWarningCount = 0;

  for (const item of state.parsedDoc.items) {
    const st = state.itemStates.get(item.id);
    if (!st) continue;
    const signal = evaluateTranslationTrafficLight(item, st, state.selectedLangKey);
    if (signal.level === 'red' || signal.level === 'yellow') {
      if (!st.verified) {
        unverifiedWarningCount++;
      }
      warningEntries.push({
        item,
        st,
        signal
      });
    }
  }

  if (els.unifiedWarningTotalBadge) {
    els.unifiedWarningTotalBadge.textContent = `미확인 경고 ${unverifiedWarningCount}건 (전체 ${warningEntries.length}건)`;
    els.unifiedWarningTotalBadge.className = `badge ${
      unverifiedWarningCount > 0 ? 'badge-warn' : 'badge-available'
    }`;
  }

  els.unifiedWarningList.innerHTML = '';
  els.unifiedWarningList.classList.toggle('hidden', !state.warningListExpanded);

  if (warningEntries.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'unified-warning-empty';
    emptyMsg.innerHTML =
      '✅ <strong>현재 자동 감지된 숫자·날짜·퍼센트 누락, 미번역 한글, 길이 넘침, 용어집 불일치 경고가 없습니다.</strong> <span class="text-muted">(자동 경고가 없더라도 문맥과 표현이 자연스러운지 최종 확인해 주세요.)</span>';
    els.unifiedWarningList.appendChild(emptyMsg);
    return;
  }

  for (const { item, st, signal } of warningEntries) {
    const row = document.createElement('div');
    row.className = `unified-warning-row ${signal.level === 'red' ? 'is-red' : 'is-yellow'}${
      st.verified ? ' is-verified' : ''
    }`;

    const issueMessages =
      signal.issues && signal.issues.length > 0
        ? signal.issues.map((iss) => iss.message).join(' · ')
        : signal.label;

    const srcSnippet =
      item.sourceText.length > 48 ? `${item.sourceText.slice(0, 48)}…` : item.sourceText;

    row.innerHTML = `
      <div class="unified-warning-main">
        <span class="unified-warning-icon" aria-hidden="true">${signal.level === 'red' ? '🚨' : '⚠️'}</span>
        <span class="location-badge">${escapeHtml(item.locationLabel)}</span>
        <span class="badge ${st.verified ? 'badge-available' : 'badge-warn'}">${
          st.verified ? '✓ 교사 확인 완료' : '미확인 경고'
        }</span>
        <strong class="unified-warning-reason">${escapeHtml(issueMessages)}</strong>
        <span class="unified-warning-snippet" title="${escapeHtml(item.sourceText)}">원문: “${escapeHtml(srcSnippet)}”</span>
      </div>
      <div class="unified-warning-actions">
        <button type="button" class="btn btn-outline btn-sm" data-role="warn-jump-btn">
          🔍 문장으로 이동·수정
        </button>
        <button type="button" class="btn ${st.verified ? 'btn-surface' : 'btn-secondary'} btn-sm" data-role="warn-verify-btn">
          ${st.verified ? '확인 완료 해제' : '✓ 확인 완료 표시'}
        </button>
      </div>
    `;

    row.querySelector('[data-role="warn-jump-btn"]')?.addEventListener('click', () => {
      focusReviewItem(item.id);
    });

    row.querySelector('[data-role="warn-verify-btn"]')?.addEventListener('click', () => {
      st.verified = !st.verified;
      state.hasUnsavedWork = true;
      const card = els.reviewItemsContainer.querySelector(`.review-card[data-item-id="${item.id}"]`);
      if (card) {
        syncSingleCardUI(card, item, st);
      }
      propagateIdenticalSourceText(item, st);
      updateReviewCountersUI();
      updateGroupDividerStatusUI();
      renderReviewJumpNav();
      scheduleAutoSave();
      if (state.activeFilter !== 'all') {
        applyReviewFilter();
      }
    });

    els.unifiedWarningList.appendChild(row);
  }
}

function getDocumentGroups() {
  const groups = new Map();
  if (!state.parsedDoc) return groups;
  for (const item of state.parsedDoc.items) {
    const gNum = getItemNavGroup(item);
    if (!groups.has(gNum)) groups.set(gNum, []);
    groups.get(gNum).push(item);
  }
  return groups;
}

function renderReviewJumpNav() {
  els.reviewJumpNav.innerHTML = '';
  const doc = state.parsedDoc;
  if (!doc || doc.items.length === 0) return;

  const groups = getDocumentGroups();
  for (const [gNum, gItems] of groups.entries()) {
    const doneCount = gItems.filter((it) => state.itemStates.get(it.id)?.verified).length;
    const isAllDone = doneCount === gItems.length;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `jump-btn${isAllDone ? ' is-group-done' : ''}`;
    const labelPrefix = formatNavGroupLabel(doc, gNum, gItems, true);
    btn.textContent = `${isAllDone ? '✓ ' : ''}${labelPrefix} (${doneCount}/${gItems.length})`;

    btn.addEventListener('click', () => {
      expandGroupInDOM(gNum);
      applyReviewFilter();
      const firstCard = els.reviewItemsContainer.querySelector(
        `.review-card[data-item-id="${gItems[0].id}"]`
      );
      if (firstCard) {
        firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        els.currentPositionIndicator.textContent = `현재 위치: ${labelPrefix}`;
      }
    });
    els.reviewJumpNav.appendChild(btn);
  }
}

/**
 * Feature #5: Synchronize identical Korean source sentences across the document when edited
 */
function propagateIdenticalSourceText(editedItem, sourceState) {
  if (!state.autoSyncIdentical || !state.parsedDoc) return;
  const targetTrimmed = editedItem.sourceText.trim();
  if (!targetTrimmed) return;

  for (const other of state.parsedDoc.items) {
    if (other.id === editedItem.id) continue;
    if (other.sourceText.trim() === targetTrimmed) {
      const otherSt = state.itemStates.get(other.id);
      if (!otherSt) continue;
      otherSt.finalText = sourceState.finalText;
      otherSt.keepOriginal = sourceState.keepOriginal;
      otherSt.verified = sourceState.verified;
      otherSt.backTranslatedKo = sourceState.backTranslatedKo;

      const otherCard = els.reviewItemsContainer.querySelector(
        `.review-card[data-item-id="${other.id}"]`
      );
      if (otherCard) {
        const otherTa = otherCard.querySelector('textarea');
        if (otherTa && otherTa.value !== otherSt.finalText) {
          otherTa.value = otherSt.finalText;
          autoResizeTextarea(otherTa);
        }
        syncSingleCardUI(otherCard, other, otherSt);
      }
    }
  }
}

function renderAccuracyIssuesHtml(accuracyIssues) {
  if (!accuracyIssues || accuracyIssues.length === 0) return '';
  return accuracyIssues
    .map(
      (iss) =>
        `<div class="accuracy-issue-item ${iss.level === 'error' ? 'accuracy-issue-red issue-error' : 'accuracy-issue-yellow issue-warn'}">
          <span>${iss.level === 'error' ? '🚨' : '⚠️'}</span>
          <span>${escapeHtml(iss.message)}</span>
        </div>`
    )
    .join('');
}

function renderReviewStep() {
  if (!state.parsedDoc) return;
  updateReviewCountersUI();
  renderReviewJumpNav();

  els.reviewItemsContainer.innerHTML = '';
  const langMeta = getTargetLanguageMeta(state.selectedLangKey);
  const groups = getDocumentGroups();

  for (const [gNum, gItems] of groups.entries()) {
    const doneCount = gItems.filter((it) => state.itemStates.get(it.id)?.verified).length;
    const isAllDone = doneCount === gItems.length;
    const isCollapsed = state.collapsedGroups.has(gNum);
    const groupTitle = formatNavGroupLabel(state.parsedDoc, gNum, gItems, false);

    // Group Header Bar (Feature #8)
    const divider = document.createElement('div');
    divider.className = `review-group-divider${isAllDone ? ' group-all-verified' : ''}`;
    divider.setAttribute('data-divider-group', String(gNum));
    divider.innerHTML = `
      <div class="review-group-title">
        <span>${isAllDone ? '✅' : '📂'} ${escapeHtml(groupTitle)}</span>
        <span class="badge ${isAllDone ? 'badge-available' : 'badge-context'}">${doneCount} / ${gItems.length} 확인 완료</span>
      </div>
      <div class="tool-drawer-actions">
        <button type="button" class="btn btn-surface btn-sm" data-role="group-verify-btn">
          ✓ 이 그룹 일괄 확인 완료
        </button>
        <button type="button" class="btn btn-outline btn-sm" data-role="group-collapse-btn">
          ${isCollapsed ? '펼치기 ▼' : '접기 ▲'}
        </button>
      </div>
    `;

    divider.querySelector('[data-role="group-collapse-btn"]').addEventListener('click', () => {
      if (state.collapsedGroups.has(gNum)) {
        state.collapsedGroups.delete(gNum);
      } else {
        state.collapsedGroups.add(gNum);
      }
      renderReviewStep();
    });

    divider.querySelector('[data-role="group-verify-btn"]').addEventListener('click', () => {
      for (const it of gItems) {
        const st = state.itemStates.get(it.id);
        if (st && st.finalText.trim().length > 0) {
          st.verified = true;
        }
      }
      state.hasUnsavedWork = true;
      scheduleAutoSave();
      renderReviewStep();
    });

    els.reviewItemsContainer.appendChild(divider);

    for (const item of gItems) {
      const st = state.itemStates.get(item.id);
      const origin = getItemOriginStatus(st);
      const isEmpty = st.finalText.trim().length === 0;
      const overflowInfo = evaluateLengthOverflowRisk(
        item.sourceText,
        st.finalText,
        item.contextLabel
      );
      const signal = evaluateTranslationTrafficLight(item, st, state.selectedLangKey);
      const cardIssues = (signal.issues || []).filter(
        (iss) => iss.code !== 'length-overflow' && iss.code !== 'empty'
      );
      const glossaryMatches = findMatchingGlossaryTerms(
        item.sourceText,
        state.selectedLangKey,
        st.finalText
      );

      const card = document.createElement('article');
      card.className = `review-card${st.verified ? ' verified' : ''}${isEmpty ? ' is-empty' : ''}${
        isCollapsed ? ' group-collapsed' : ''
      }`;
      card.setAttribute('data-item-id', item.id);
      card.setAttribute('data-group-num', String(item.groupNumber));
      card.setAttribute('data-nav-group', String(gNum));
      card.setAttribute('data-location-label', item.locationLabel);

      const glossaryBarHtml =
        glossaryMatches.length > 0
          ? `<div class="glossary-suggest-bar" data-role="glossary-bar">
              <span class="glossary-suggest-label">📚 학교 필수 용어 체크:</span>
              ${glossaryMatches
                .map(
                  (m) =>
                    `<button type="button" class="glossary-suggest-chip${
                      m.isApplied ? ' is-applied' : ''
                    }" data-ko="${escapeHtml(m.ko)}" data-term="${escapeHtml(
                      m.target
                    )}" title="클릭하면 번역문 입력칸에 '${escapeHtml(m.target)}'을(를) 넣습니다">${escapeHtml(
                      m.ko
                    )} ➔ ${escapeHtml(m.target)} ${m.isApplied ? '✓ 반영됨' : '💡 클릭하여 반영'}</button>`
                )
                .join('')}
            </div>`
          : '';

      card.innerHTML = `
        <div class="review-card-header">
          <div class="review-meta-left">
            <span class="location-badge">${escapeHtml(item.locationLabel)}</span>
            <span class="badge badge-context">${escapeHtml(item.contextLabel)}</span>
            <span class="origin-badge ${origin.cssClass}" data-role="origin-badge">${escapeHtml(origin.label)}</span>
            <span class="signal-badge ${signal.cssClass}" data-role="signal-badge" title="숫자·부호·길이·용어집·역번역 의미를 종합한 자동 안심 신호등">${escapeHtml(signal.label)}</span>
          </div>
          <div class="review-meta-right">
            <button
              type="button"
              class="keep-source-toggle-btn${st.keepOriginal ? ' is-kept' : ''}"
              data-role="keep-source-btn"
              title="고유명사·날짜·학번 등 번역하지 않고 한국어 원문 그대로 유지할 항목으로 지정합니다"
            >
              ${st.keepOriginal ? '⏭️ 원문 유지 중' : '⏭️ 원문 그대로 유지'}
            </button>
            <button
              type="button"
              class="verify-toggle-btn${st.verified ? ' is-verified' : ''}"
              data-role="verify-btn"
              aria-pressed="${st.verified ? 'true' : 'false'}"
            >
              ${st.verified ? '✓ 확인 완료됨' : '미검토 (클릭하여 확인 완료)'}
            </button>
          </div>
        </div>

        <div class="review-card-body">
          <div class="review-col">
            <div class="review-col-header">
              <span>한국어 원문 (${item.sourceText.length}자)</span>
              <button type="button" class="link-btn" data-role="copy-source-btn" title="한국어 원문을 오른쪽 번역 입력칸에 그대로 복사합니다">
                원문 → 번역칸 복사
              </button>
            </div>
            <div class="source-text-box" lang="ko">${escapeHtml(item.sourceText)}</div>
            ${glossaryBarHtml}
          </div>

          <div class="review-col">
            <div class="review-col-header">
              <label for="textarea-${item.id}">${escapeHtml(langMeta.label)} 번역문 편집 <small class="text-muted">(Ctrl+Enter: 확인 완료)</small></label>
              <div class="trans-col-tools">
                <button
                  type="button"
                  class="mini-tool-btn"
                  data-role="tts-btn"
                  title="${escapeHtml(langMeta.label)} 원어민 발음으로 소리 내어 읽어줍니다"
                >
                  🔊 발음 듣기
                </button>
                <button
                  type="button"
                  class="mini-tool-btn"
                  data-role="copy-verify-btn"
                  title="다문화강사·번역앱 교차확인용 질문 양식을 클립보드에 복사합니다"
                >
                  💬 교차확인 복사
                </button>
                <span data-role="char-count" class="text-muted">${st.finalText.length}자</span>
              </div>
            </div>
            <textarea
              id="textarea-${item.id}"
              class="translation-textarea"
              lang="${escapeHtml(langMeta.key)}"
              dir="${escapeHtml(langMeta.dir || 'ltr')}"
              placeholder="${escapeHtml(langMeta.label)} 번역문을 입력하거나 수정하세요..."
            ></textarea>

            <div class="back-translation-box" data-role="backtranslate-box">
              <div class="back-translation-header">
                <span class="back-translation-label">🔄 한국어 역번역 뜻 대조 (외국어 → 한국어 재번역)</span>
                <button
                  type="button"
                  class="link-btn"
                  data-role="recheck-backtranslate-btn"
                  title="수정한 외국어 번역문을 한국어로 다시 역번역하여 뜻을 확인합니다"
                >
                  🔄 역번역 다시 확인
                </button>
              </div>
              <div
                class="back-translation-text ${st.backTranslatedKo ? '' : 'is-empty'}"
                data-role="backtranslate-text"
              >${
                st.backTranslatedKo
                  ? `“${escapeHtml(st.backTranslatedKo)}”`
                  : '역번역 대기 중 — 상단 [🔄 전체 문장 한국어 역번역 검증] 또는 우측 [🔄 역번역 다시 확인]을 누르면 외국어 번역문의 한국어 뜻이 표시됩니다.'
              }</div>
            </div>

            <div
              class="accuracy-issues-list ${cardIssues.length > 0 ? '' : 'hidden'}"
              data-role="accuracy-issues-list"
            >${renderAccuracyIssuesHtml(cardIssues)}</div>

            <div
              class="overflow-warning-bar ${
                overflowInfo
                  ? overflowInfo.level === 'high'
                    ? 'overflow-warning-high'
                    : 'overflow-warning-medium'
                  : 'hidden'
              }"
              data-role="overflow-bar"
            >
              <span data-role="overflow-text">${overflowInfo ? `📏 ${escapeHtml(overflowInfo.message)}` : ''}</span>
            </div>
            <div class="draft-reference-bar ${st.draftText !== null && st.finalText !== st.draftText ? '' : 'hidden'}" data-role="draft-ref-bar">
              <span class="draft-reference-text" data-role="draft-ref-text">자동 번역 초안: ${escapeHtml(st.draftText || '')}</span>
              <button type="button" class="link-btn" data-role="restore-draft-btn">초안으로 되돌리기</button>
            </div>
          </div>
        </div>
      `;

      const textarea = card.querySelector('textarea');
      textarea.value = st.finalText;

      const verifyBtn = card.querySelector('[data-role="verify-btn"]');
      const keepSourceBtn = card.querySelector('[data-role="keep-source-btn"]');
      const copySourceBtn = card.querySelector('[data-role="copy-source-btn"]');
      const restoreDraftBtn = card.querySelector('[data-role="restore-draft-btn"]');
      const ttsBtn = card.querySelector('[data-role="tts-btn"]');
      const copyVerifyBtn = card.querySelector('[data-role="copy-verify-btn"]');
      const recheckBtBtn = card.querySelector('[data-role="recheck-backtranslate-btn"]');
      const glossaryChips = card.querySelectorAll('.glossary-suggest-chip');

      glossaryChips.forEach((chip) => {
        chip.addEventListener('click', () => {
          const term = chip.getAttribute('data-term') || '';
          if (!term) return;
          const prevText = st.finalText;
          if (st.finalText.trim().length === 0 || item.sourceText.trim().length <= 10) {
            st.finalText = term;
          } else if (!st.finalText.toLowerCase().includes(term.toLowerCase())) {
            st.finalText = `${st.finalText.trim()} (${term})`;
          }
          if (st.finalText !== prevText) {
            st.backTranslatedKo = '';
          }
          st.keepOriginal = false;
          textarea.value = st.finalText;
          state.hasUnsavedWork = true;
          autoResizeTextarea(textarea);
          syncSingleCardUI(card, item, st);
          propagateIdenticalSourceText(item, st);
          updateReviewCountersUI();
          scheduleAutoSave();
        });
      });

      if (ttsBtn) {
        ttsBtn.addEventListener('click', () => {
          const isSpeakingNow = ttsBtn.classList.contains('is-active');
          speakTextWithBrowserTTS(
            st.finalText,
            state.selectedLangKey,
            (status) => {
              if (status === 'speaking' || status === true) {
                ttsBtn.classList.add('is-active');
                ttsBtn.textContent = '⏹️ 읽는 중 (중지)';
              } else if (status === 'empty') {
                ttsBtn.classList.remove('is-active');
                ttsBtn.textContent = '⚠️ 번역문 없음';
                setTimeout(() => {
                  ttsBtn.textContent = '🔊 발음 듣기';
                }, 1200);
              } else if (status === 'unsupported') {
                ttsBtn.classList.remove('is-active');
                ttsBtn.textContent = '⚠️ 음성 미지원';
                setTimeout(() => {
                  ttsBtn.textContent = '🔊 발음 듣기';
                }, 1500);
              } else {
                ttsBtn.classList.remove('is-active');
                ttsBtn.textContent = '🔊 발음 듣기';
              }
            },
            isSpeakingNow
          );
        });
      }

      if (copyVerifyBtn) {
        copyVerifyBtn.addEventListener('click', async () => {
          const verifyLines = [
            `[다국어 수업자료 번역 확인 요청]`,
            `• 문서 위치: ${item.locationLabel} (${item.contextLabel})`,
            `• 대상 언어: ${langMeta.label} (${langMeta.nativeLabel})`,
            `• 한국어 원문: ${item.sourceText}`,
            `• ${langMeta.label} 번역문: ${st.finalText || '(미입력)'}`,
            ...(st.backTranslatedKo ? [`• 한국어 역번역: ${st.backTranslatedKo}`] : []),
            `→ 위 ${langMeta.label} 번역문이 한국어 원문의 뜻과 자연스럽게 일치하는지 확인 부탁드립니다.`
          ].join('\n');

          try {
            await navigator.clipboard.writeText(verifyLines);
            copyVerifyBtn.classList.add('is-active');
            copyVerifyBtn.textContent = '✓ 질문 복사됨!';
            setTimeout(() => {
              copyVerifyBtn.classList.remove('is-active');
              copyVerifyBtn.textContent = '💬 교차확인 복사';
            }, 1800);
          } catch {
            copyVerifyBtn.textContent = '⚠️ 복사 실패';
            setTimeout(() => {
              copyVerifyBtn.textContent = '💬 교차확인 복사';
            }, 1500);
          }
        });
      }

      if (recheckBtBtn) {
        recheckBtBtn.addEventListener('click', () => {
          handleSingleCardBacktranslate(card, item, st, recheckBtBtn);
        });
      }

      textarea.addEventListener('focus', () => {
        els.currentPositionIndicator.textContent = `현재 위치: ${item.locationLabel} (${item.contextLabel})`;
      });

      textarea.addEventListener('input', () => {
        const prevText = st.finalText;
        st.finalText = textarea.value;
        if (st.finalText !== item.sourceText) {
          st.keepOriginal = false;
        }
        if (st.finalText !== prevText) {
          st.backTranslatedKo = st.keepOriginal ? item.sourceText : '';
        }
        state.hasUnsavedWork = true;
        autoResizeTextarea(textarea);
        syncSingleCardUI(card, item, st);
        propagateIdenticalSourceText(item, st);
        updateReviewCountersUI();
        scheduleAutoSave();
      });

      textarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          st.verified = true;
          state.hasUnsavedWork = true;
          syncSingleCardUI(card, item, st);
          propagateIdenticalSourceText(item, st);
          updateReviewCountersUI();
          updateGroupDividerStatusUI();
          renderReviewJumpNav();
          scheduleAutoSave();
          jumpToNextUnverified();
        }
      });

      keepSourceBtn.addEventListener('click', () => {
        st.keepOriginal = !st.keepOriginal;
        if (st.keepOriginal) {
          st.finalText = item.sourceText;
          st.backTranslatedKo = item.sourceText;
          st.verified = true;
          textarea.value = st.finalText;
          autoResizeTextarea(textarea);
        } else if (st.finalText === item.sourceText) {
          st.backTranslatedKo = '';
        }
        state.hasUnsavedWork = true;
        syncSingleCardUI(card, item, st);
        propagateIdenticalSourceText(item, st);
        updateReviewCountersUI();
        updateGroupDividerStatusUI();
        renderReviewJumpNav();
        scheduleAutoSave();
      });

      verifyBtn.addEventListener('click', () => {
        st.verified = !st.verified;
        state.hasUnsavedWork = true;
        syncSingleCardUI(card, item, st);
        propagateIdenticalSourceText(item, st);
        updateReviewCountersUI();
        updateGroupDividerStatusUI();
        renderReviewJumpNav();
        scheduleAutoSave();
        if (state.activeFilter !== 'all') {
          applyReviewFilter();
        }
      });

      copySourceBtn.addEventListener('click', () => {
        st.finalText = item.sourceText;
        st.backTranslatedKo = st.keepOriginal ? item.sourceText : '';
        textarea.value = st.finalText;
        state.hasUnsavedWork = true;
        autoResizeTextarea(textarea);
        syncSingleCardUI(card, item, st);
        propagateIdenticalSourceText(item, st);
        updateReviewCountersUI();
        scheduleAutoSave();
      });

      if (restoreDraftBtn) {
        restoreDraftBtn.addEventListener('click', () => {
          if (st.draftText !== null) {
            st.finalText = st.draftText;
            st.backTranslatedKo = st.draftBackTranslatedKo || '';
            st.keepOriginal = false;
            textarea.value = st.finalText;
            state.hasUnsavedWork = true;
            autoResizeTextarea(textarea);
            syncSingleCardUI(card, item, st);
            propagateIdenticalSourceText(item, st);
            updateReviewCountersUI();
            scheduleAutoSave();
          }
        });
      }

      els.reviewItemsContainer.appendChild(card);
      autoResizeTextarea(textarea);
    }
  }

  applyReviewFilter();
}

function syncSingleCardUI(card, item, st) {
  const isEmpty = st.finalText.trim().length === 0;
  const origin = getItemOriginStatus(st);
  const overflowInfo = evaluateLengthOverflowRisk(
    item.sourceText,
    st.finalText,
    item.contextLabel
  );
  const signal = evaluateTranslationTrafficLight(item, st, state.selectedLangKey);
  const cardIssues = (signal.issues || []).filter(
    (iss) => iss.code !== 'length-overflow' && iss.code !== 'empty'
  );

  card.classList.toggle('verified', st.verified);
  card.classList.toggle('is-empty', isEmpty);

  const originBadge = card.querySelector('[data-role="origin-badge"]');
  if (originBadge) {
    originBadge.textContent = origin.label;
    originBadge.className = `origin-badge ${origin.cssClass}`;
  }

  const signalBadge = card.querySelector('[data-role="signal-badge"]');
  if (signalBadge) {
    signalBadge.textContent = signal.label;
    signalBadge.className = `signal-badge ${signal.cssClass}`;
  }

  const keepSourceBtn = card.querySelector('[data-role="keep-source-btn"]');
  if (keepSourceBtn) {
    keepSourceBtn.classList.toggle('is-kept', Boolean(st.keepOriginal));
    keepSourceBtn.textContent = st.keepOriginal ? '⏭️ 원문 유지 중' : '⏭️ 원문 그대로 유지';
  }

  const verifyBtn = card.querySelector('[data-role="verify-btn"]');
  if (verifyBtn) {
    verifyBtn.classList.toggle('is-verified', st.verified);
    verifyBtn.setAttribute('aria-pressed', st.verified ? 'true' : 'false');
    verifyBtn.textContent = st.verified ? '✓ 확인 완료됨' : '미검토 (클릭하여 확인 완료)';
  }

  const charCount = card.querySelector('[data-role="char-count"]');
  if (charCount) {
    charCount.textContent = `${st.finalText.length}자`;
  }

  const btTextEl = card.querySelector('[data-role="backtranslate-text"]');
  if (btTextEl) {
    if (st.backTranslatedKo) {
      btTextEl.textContent = `“${st.backTranslatedKo}”`;
      btTextEl.classList.remove('is-empty');
    } else {
      btTextEl.textContent =
        '역번역 대기 중 — 상단 [🔄 전체 문장 한국어 역번역 검증] 또는 우측 [🔄 역번역 다시 확인]을 누르면 외국어 번역문의 한국어 뜻이 표시됩니다.';
      btTextEl.classList.add('is-empty');
    }
  }

  const accuracyListEl = card.querySelector('[data-role="accuracy-issues-list"]');
  if (accuracyListEl) {
    if (cardIssues.length > 0) {
      accuracyListEl.classList.remove('hidden');
      accuracyListEl.innerHTML = renderAccuracyIssuesHtml(cardIssues);
    } else {
      accuracyListEl.classList.add('hidden');
      accuracyListEl.innerHTML = '';
    }
  }

  const glossaryChips = card.querySelectorAll('.glossary-suggest-chip');
  glossaryChips.forEach((chip) => {
    const ko = chip.getAttribute('data-ko') || '';
    const term = chip.getAttribute('data-term') || '';
    const isApplied =
      Boolean(st.finalText && term) && st.finalText.toLowerCase().includes(term.toLowerCase());
    chip.classList.toggle('is-applied', isApplied);
    chip.textContent = `${ko} ➔ ${term} ${isApplied ? '✓ 반영됨' : '💡 클릭하여 반영'}`;
  });

  const overflowBar = card.querySelector('[data-role="overflow-bar"]');
  const overflowText = card.querySelector('[data-role="overflow-text"]');
  if (overflowBar && overflowText) {
    if (overflowInfo) {
      overflowBar.className = `overflow-warning-bar ${
        overflowInfo.level === 'high' ? 'overflow-warning-high' : 'overflow-warning-medium'
      }`;
      overflowText.textContent = `📏 ${overflowInfo.message}`;
    } else {
      overflowBar.className = 'overflow-warning-bar hidden';
      overflowText.textContent = '';
    }
  }

  const draftRefBar = card.querySelector('[data-role="draft-ref-bar"]');
  const draftRefText = card.querySelector('[data-role="draft-ref-text"]');
  if (draftRefBar && draftRefText) {
    const showDraftRef = st.draftText !== null && st.finalText !== st.draftText;
    draftRefBar.classList.toggle('hidden', !showDraftRef);
    if (showDraftRef) {
      draftRefText.textContent = `자동 번역 초안: ${st.draftText}`;
    }
  }
}

function applyReviewFilter() {
  const filter = state.activeFilter;
  const cards = els.reviewItemsContainer.querySelectorAll('.review-card');
  const visibleCountByGroup = new Map();

  cards.forEach((card) => {
    const id = card.getAttribute('data-item-id');
    const gNum = parseInt(card.getAttribute('data-nav-group') || '0', 10);
    const st = state.itemStates.get(id);
    const item = state.parsedDoc?.items.find((it) => it.id === id);
    if (!st || !item) return;

    const isEmpty = st.finalText.trim().length === 0;
    const isModified =
      (st.draftText !== null && st.finalText !== st.draftText && !isEmpty) ||
      (st.draftText === null && !isEmpty);
    const isFailed = st.autoFailed && isEmpty;
    const isOverflow = Boolean(
      evaluateLengthOverflowRisk(item.sourceText, st.finalText, item.contextLabel)
    );
    const signal = evaluateTranslationTrafficLight(item, st, state.selectedLangKey);
    const isAttention = signal.level === 'red' || signal.level === 'yellow';

    let visible = true;
    if (filter === 'unverified') visible = !st.verified;
    else if (filter === 'attention') visible = isAttention;
    else if (filter === 'empty') visible = isEmpty;
    else if (filter === 'overflow') visible = isOverflow;
    else if (filter === 'modified') visible = isModified;
    else if (filter === 'failed') visible = isFailed;

    card.classList.toggle('hidden', !visible);
    if (filter === 'all') {
      card.classList.toggle('group-collapsed', state.collapsedGroups.has(gNum));
    } else {
      card.classList.remove('group-collapsed');
    }

    if (visible) {
      visibleCountByGroup.set(gNum, (visibleCountByGroup.get(gNum) || 0) + 1);
    }
  });

  const dividers = els.reviewItemsContainer.querySelectorAll('.review-group-divider');
  dividers.forEach((div) => {
    const gNum = parseInt(div.getAttribute('data-divider-group') || '0', 10);
    if (filter === 'all') {
      div.classList.remove('hidden');
    } else {
      div.classList.toggle('hidden', (visibleCountByGroup.get(gNum) || 0) === 0);
    }
  });
}

export function focusReviewItem(itemId) {
  state.activeFilter = 'all';
  els.filterBtns.forEach((b) =>
    b.classList.toggle('active', b.getAttribute('data-filter') === 'all')
  );
  const targetItem = state.parsedDoc?.items.find((it) => it.id === itemId);
  if (targetItem) {
    state.collapsedGroups.delete(getItemNavGroup(targetItem));
  }
  if (state.activeMainView !== 'translator') {
    switchMainView('translator');
  }
  goToStep(4);
  setTimeout(() => {
    const card = els.reviewItemsContainer.querySelector(`.review-card[data-item-id="${itemId}"]`);
    if (card) {
      const gNum = parseInt(card.getAttribute('data-nav-group') || '0', 10);
      if (gNum) expandGroupInDOM(gNum);
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const ta = card.querySelector('textarea');
      if (ta) ta.focus();
    }
  }, 60);
}

/* ==================== STEP 5: FINAL CHECK, BILINGUAL MODE, PRINT & DOWNLOAD ==================== */

function updateStep5FilenameDisplay() {
  if (!state.parsedDoc) return;
  const doc = state.parsedDoc;
  const langMeta = getTargetLanguageMeta(state.selectedLangKey);
  const outName = buildOutputFileName(doc.fileName, langMeta.key, doc.fileType, state.outputMode);
  els.finalOutputFilename.textContent = outName;
  els.btnDownloadFile.textContent = `📥 번역된 ${doc.fileType.toUpperCase()} 파일 다운로드 (${outName})`;
}

function renderDownloadStep() {
  if (!state.parsedDoc) return;
  els.downloadErrorBox.classList.add('hidden');
  els.downloadSuccessMsg.classList.add('hidden');

  const doc = state.parsedDoc;
  const langMeta = getTargetLanguageMeta(state.selectedLangKey);
  const c = computeReviewCounters();

  updateStep5FilenameDisplay();
  els.finalTargetLang.textContent = `${langMeta.label} (${langMeta.nativeLabel})`;
  els.finalVerifiedSummary.textContent = `${c.verified} / ${c.total}개`;
  els.finalUnverifiedSummary.textContent = `${c.unverified}개`;
  els.finalUnverifiedSummary.className = `final-stat-value ${c.unverified > 0 ? 'text-warn' : 'text-ok'}`;
  if (els.finalWarningSummary) {
    els.finalWarningSummary.textContent = `${c.unverifiedWarnings}개`;
    els.finalWarningSummary.className = `final-stat-value ${
      c.unverifiedWarnings > 0 ? 'text-danger' : 'text-ok'
    }`;
  }
  els.finalEmptySummary.textContent = `${c.empty}개`;
  els.finalEmptySummary.className = `final-stat-value ${c.empty > 0 ? 'text-danger' : 'text-ok'}`;
  els.finalModifiedSummary.textContent = `${c.modified}개`;

  els.emptyHandlingBox.classList.toggle('hidden', c.empty === 0);

  els.downloadWarningsPanel.innerHTML = '';

  const emptyItems = doc.items.filter((it) => {
    const st = state.itemStates.get(it.id);
    return !st || st.finalText.trim().length === 0;
  });

  const unverifiedItems = doc.items.filter((it) => {
    const st = state.itemStates.get(it.id);
    return !st || !st.verified;
  });

  const unverifiedWarningItems = doc.items.filter((it) => {
    const st = state.itemStates.get(it.id);
    if (!st || st.verified) return false;
    const sig = evaluateTranslationTrafficLight(it, st, state.selectedLangKey);
    return sig.level === 'red' || sig.level === 'yellow';
  });

  const overflowItems = doc.items.filter((it) => {
    const st = state.itemStates.get(it.id);
    return st && Boolean(evaluateLengthOverflowRisk(it.sourceText, st.finalText, it.contextLabel));
  });

  if (emptyItems.length === 0 && unverifiedItems.length === 0) {
    const okBox = document.createElement('div');
    okBox.className = 'alert-box alert-success';
    okBox.innerHTML = `
      <div class="alert-title">✅ 모든 문장의 번역 입력과 교사 확인이 완료되었습니다!</div>
      <p class="alert-message">총 ${c.total}개 문장 모두 번역문이 입력되었고 ‘확인 완료’로 표시되었습니다. (※ 자동 경고가 번역 정확성을 100% 보증하지 않으므로 다운로드 후 원본 프로그램에서 최종 배치를 확인해 주세요.)</p>
    `;
    els.downloadWarningsPanel.appendChild(okBox);
  }

  if (unverifiedWarningItems.length > 0) {
    const warnBox = document.createElement('div');
    warnBox.className = 'alert-box alert-warning';
    warnBox.innerHTML = `
      <div class="alert-title">🚦 미확인 검수 경고가 있는 문장이 ${unverifiedWarningItems.length}개 있습니다</div>
      <p class="alert-message">숫자·날짜·퍼센트 누락, 미번역 한글 잔류, 길이 넘침 또는 학교 용어집 불일치 경고가 발생한 문장 중 아직 ‘확인 완료’로 표시되지 않은 항목입니다. (자동 경고가 번역 정확성을 보증하지 않으므로 선생님의 최종 검토를 권장합니다.)</p>
      <ul class="issue-list" id="warning-issue-list"></ul>
    `;
    const ul = warnBox.querySelector('#warning-issue-list');
    for (const it of unverifiedWarningItems) {
      const st = state.itemStates.get(it.id);
      const sig = evaluateTranslationTrafficLight(it, st, state.selectedLangKey);
      const li = document.createElement('li');
      const reasonText =
        sig.issues && sig.issues.length > 0
          ? sig.issues.map((i) => i.message).join(' / ')
          : sig.label;
      li.innerHTML = `<strong>${escapeHtml(it.locationLabel)} (${escapeHtml(it.contextLabel)}):</strong> ${escapeHtml(reasonText)} `;
      const jumpBtn = document.createElement('button');
      jumpBtn.type = 'button';
      jumpBtn.className = 'link-btn';
      jumpBtn.textContent = '[해당 문장으로 이동]';
      jumpBtn.addEventListener('click', () => focusReviewItem(it.id));
      li.appendChild(jumpBtn);
      ul.appendChild(li);
    }
    els.downloadWarningsPanel.appendChild(warnBox);
  }

  if (overflowItems.length > 0) {
    const ovBox = document.createElement('div');
    ovBox.className = 'alert-box alert-info';
    ovBox.innerHTML = `
      <div class="alert-title">📏 원문보다 글자 수가 많이 길어진 문장이 ${overflowItems.length}개 있습니다</div>
      <p class="alert-message">다운로드한 뒤 PowerPoint 또는 한글에서 아래 위치의 글상자나 표 칸이 넘치지 않는지 먼저 살펴봐 주세요: <strong>${overflowItems
        .slice(0, 6)
        .map((it) => escapeHtml(it.locationLabel))
        .join(', ')}${overflowItems.length > 6 ? ' 외' : ''}</strong></p>
    `;
    els.downloadWarningsPanel.appendChild(ovBox);
  }

  if (emptyItems.length > 0) {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'alert-box alert-error';
    emptyBox.innerHTML = `
      <div class="alert-title">⚠️ 번역문이 비어 있는 항목이 ${emptyItems.length}개 있습니다</div>
      <p class="alert-message">아래 항목의 <strong>[이동하여 입력하기]</strong>를 누르면 해당 문장으로 바로 이동해 번역문을 채울 수 있습니다.</p>
      <ul class="issue-list" id="empty-issue-list"></ul>
    `;
    const ul = emptyBox.querySelector('#empty-issue-list');
    for (const it of emptyItems) {
      const li = document.createElement('li');
      const snippet = it.sourceText.length > 42 ? it.sourceText.slice(0, 42) + '…' : it.sourceText;
      li.innerHTML = `<strong>${escapeHtml(it.locationLabel)} (${escapeHtml(it.contextLabel)}):</strong> "${escapeHtml(snippet)}" `;
      const jumpBtn = document.createElement('button');
      jumpBtn.type = 'button';
      jumpBtn.className = 'link-btn';
      jumpBtn.textContent = '[이동하여 입력하기]';
      jumpBtn.addEventListener('click', () => focusReviewItem(it.id));
      li.appendChild(jumpBtn);
      ul.appendChild(li);
    }
    els.downloadWarningsPanel.appendChild(emptyBox);
  }

  if (unverifiedItems.length > 0) {
    const unvBox = document.createElement('div');
    unvBox.className = 'alert-box alert-warning';
    unvBox.innerHTML = `
      <div class="alert-title">🔎 아직 ‘확인 완료’로 표시하지 않은 미검토 항목이 ${unverifiedItems.length}개 있습니다</div>
      <p class="alert-message">자동 번역 초안이나 입력한 문장을 선생님이 확인한 뒤 ‘확인 완료’로 표시하는 것을 권장합니다.</p>
      <ul class="issue-list" id="unverified-issue-list"></ul>
    `;
    const ul = unvBox.querySelector('#unverified-issue-list');
    for (const it of unverifiedItems) {
      const li = document.createElement('li');
      const snippet = it.sourceText.length > 42 ? it.sourceText.slice(0, 42) + '…' : it.sourceText;
      li.innerHTML = `<strong>${escapeHtml(it.locationLabel)} (${escapeHtml(it.contextLabel)}):</strong> "${escapeHtml(snippet)}" `;
      const jumpBtn = document.createElement('button');
      jumpBtn.type = 'button';
      jumpBtn.className = 'link-btn';
      jumpBtn.textContent = '[검토하러 이동]';
      jumpBtn.addEventListener('click', () => focusReviewItem(it.id));
      li.appendChild(jumpBtn);
      ul.appendChild(li);
    }
    els.downloadWarningsPanel.appendChild(unvBox);
  }
}

/**
 * Feature #10: Render and open Printable Teacher Comparison Sheet
 */
function handleOpenComparisonSheet() {
  if (!state.parsedDoc || !els.printableComparisonSheet || !els.printSheetTbody) return;
  const doc = state.parsedDoc;
  const langMeta = getTargetLanguageMeta(state.selectedLangKey);
  const dateStr = new Date().toLocaleDateString('ko-KR');

  els.printSheetMeta.textContent = `원본 문서: ${doc.fileName}  |  대상 언어: ${langMeta.label} (${langMeta.nativeLabel})  |  문장 수: ${doc.items.length}개  |  작성일: ${dateStr}`;
  els.printSheetTbody.innerHTML = '';

  for (const item of doc.items) {
    const st = state.itemStates.get(item.id);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(item.locationLabel)}</strong><br/><small>${escapeHtml(item.contextLabel)}</small></td>
      <td lang="ko">${escapeHtml(item.sourceText)}</td>
      <td lang="${escapeHtml(langMeta.key)}" dir="${escapeHtml(langMeta.dir || 'ltr')}">${escapeHtml(st && st.finalText ? st.finalText : '(미입력)')}</td>
    `;
    els.printSheetTbody.appendChild(tr);
  }

  els.printableComparisonSheet.classList.remove('hidden');
  els.printableComparisonSheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getMimeTypeForFileType(fileType) {
  if (fileType === 'pptx') {
    return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  }
  if (fileType === 'docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (fileType === 'xlsx') {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
  return 'application/hwp+zip';
}

function inferSubjectFromFileName(fileName = '') {
  const lower = String(fileName).toLowerCase();
  if (lower.includes('과학') || lower.includes('science')) return '과학';
  if (lower.includes('사회') || lower.includes('역사')) return '사회';
  if (lower.includes('국어') || lower.includes('독서')) return '국어';
  if (lower.includes('수학') || lower.includes('math')) return '수학';
  if (lower.includes('가정통신') || lower.includes('안내') || lower.includes('알림')) return '가정통신문·학급안내';
  if (lower.includes('창체') || lower.includes('안전')) return '창의적 체험활동';
  return '수업·학급자료';
}

function openPrefilledCaseFromCurrentDoc() {
  const doc = state.parsedDoc;
  const langKey = state.translatedLangKey || state.selectedLangKey || 'vi';
  const langMeta = getTargetLanguageMeta(langKey);
  const baseTitle = doc?.fileName
    ? doc.fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
    : '다국어 수업자료';
  const modeLabel =
    state.outputMode === 'bilingual-ko-first' || state.outputMode === 'bilingual-target-first'
      ? '한·다국어 병기'
      : '번역 변환';

  switchMainView('cases');
  openCaseWritePanel(null);

  if (els.caseInputTitle) {
    els.caseInputTitle.value = `${baseTitle} (${langMeta.label} ${modeLabel} 수업 활용)`;
  }
  if (els.caseInputLang) {
    els.caseInputLang.value = langKey;
  }
  if (els.caseInputSubject) {
    els.caseInputSubject.value = inferSubjectFromFileName(doc?.fileName || '');
  }
  if (els.caseEditId && doc?.fileType) {
    els.caseEditId.dataset.fileFormat = doc.fileType === 'hwpx' ? 'hwpx' : 'pptx';
  }
  setTimeout(() => {
    els.caseInputGoal?.focus();
  }, 100);
}

async function handleDownloadTranslatedFile(isFromStep4 = false) {
  if (!state.parsedDoc) return;
  els.downloadErrorBox?.classList.add('hidden');
  els.downloadSuccessMsg?.classList.add('hidden');
  els.step4DirectDownloadFeedback?.classList.add('hidden');
  if (els.btnDownloadFile) els.btnDownloadFile.disabled = true;
  if (els.btnStep4DirectDownload) els.btnStep4DirectDownload.disabled = true;
  if (els.btnStep4DirectDownloadBottom) els.btnStep4DirectDownloadBottom.disabled = true;

  try {
    const doc = state.parsedDoc;
    const langMeta = getTargetLanguageMeta(state.selectedLangKey);
    rememberSelectedLanguage(state.selectedLangKey);
    rememberOutputMode(state.outputMode);
    const outName = buildOutputFileName(doc.fileName, langMeta.key, doc.fileType, state.outputMode);

    const fallbackRadio = document.querySelector('input[name="empty-fallback-mode"]:checked');
    const emptyFallback = fallbackRadio ? fallbackRadio.value : 'keep-source';
    const autoShrinkFont = Boolean(els.chkAutoShrinkFont?.checked);

    const translationsMap = {};
    for (const item of doc.items) {
      const st = state.itemStates.get(item.id);
      translationsMap[item.id] = st ? st.finalText : '';
    }

    const uint8 = await buildTranslatedDocument(doc, translationsMap, {
      emptyFallback,
      outputMode: state.outputMode,
      autoShrinkFont
    });
    if (!uint8 || uint8.byteLength < 100) {
      throw new DocumentProcessError(
        '생성된 파일 데이터가 비정상적입니다',
        '결과 문서 패키지의 크기가 너무 작거나 비어 있어 다운로드를 중단했습니다.',
        '원본 파일을 다시 업로드한 후 시도해 주세요.',
        'INVALID_OUTPUT_SIZE'
      );
    }

    const mimeType = getMimeTypeForFileType(doc.fileType);
    const blob = new Blob([uint8], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    state.hasUnsavedWork = false;
    const successHtml = `
      <div>✓ <strong>${escapeHtml(outName)}</strong> 파일이 저장되었습니다! (원본 프로그램에서 열어 글자 배치를 확인해 주세요)</div>
      <div class="post-download-share-row">
        <button type="button" class="btn btn-secondary btn-sm" data-role="open-prefilled-case-btn">
          ✏️ 방금 변환한 자료로 10초 활용 후기 남기기 (제목·언어 자동 입력)
        </button>
      </div>
    `;

    if (els.downloadSuccessMsg) {
      els.downloadSuccessMsg.innerHTML = successHtml;
      els.downloadSuccessMsg.classList.remove('hidden');
      els.downloadSuccessMsg
        .querySelector('[data-role="open-prefilled-case-btn"]')
        ?.addEventListener('click', openPrefilledCaseFromCurrentDoc);
    }

    if (els.step4DirectDownloadFeedback) {
      els.step4DirectDownloadFeedback.innerHTML = successHtml;
      els.step4DirectDownloadFeedback.classList.remove('hidden');
      els.step4DirectDownloadFeedback
        .querySelector('[data-role="open-prefilled-case-btn"]')
        ?.addEventListener('click', openPrefilledCaseFromCurrentDoc);
      if (isFromStep4) {
        els.step4DirectDownloadFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  } catch (err) {
    if (els.downloadErrorTitle) {
      els.downloadErrorTitle.textContent =
        err instanceof DocumentProcessError ? err.title : '결과 파일 생성 중 오류가 발생했습니다';
    }
    if (els.downloadErrorMessage) {
      els.downloadErrorMessage.textContent =
        err?.message || '번역문을 문서 구조에 반영하는 중 문제가 발생하여 다운로드를 차단했습니다.';
    }
    if (els.downloadErrorAction) {
      els.downloadErrorAction.textContent =
        err instanceof DocumentProcessError && err.actionHint
          ? `해결 방법: ${err.actionHint}`
          : '해결 방법: 원본 파일을 다시 업로드하거나 특수 제어 문자가 포함되었는지 확인해 주세요.';
    }
    els.downloadErrorBox?.classList.remove('hidden');
  } finally {
    if (els.btnDownloadFile) els.btnDownloadFile.disabled = false;
    if (els.btnStep4DirectDownload) els.btnStep4DirectDownload.disabled = false;
    if (els.btnStep4DirectDownloadBottom) els.btnStep4DirectDownloadBottom.disabled = false;
  }
}

/* ==================== IDEA #3: MULTI-LANGUAGE BATCH ZIP DOWNLOAD ==================== */

async function handleRunMultiLangZip() {
  if (!state.parsedDoc || state.isTranslating) return;
  const checkedBoxes = Array.from(
    els.multiLangCheckboxGrid?.querySelectorAll('input[type="checkbox"]:checked') || []
  );
  const langKeys = checkedBoxes.map((cb) => cb.value).filter(Boolean);
  if (langKeys.length === 0) {
    if (els.multiLangBatchStatus) {
      els.multiLangBatchStatus.textContent = '⚠️ 일괄 변환할 언어를 최소 1개 이상 체크해 주세요.';
    }
    return;
  }

  if (typeof window.JSZip !== 'function') {
    if (els.multiLangBatchStatus) {
      els.multiLangBatchStatus.textContent = '⚠️ 압축(JSZip) 라이브러리를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.';
    }
    return;
  }

  const doc = state.parsedDoc;
  const entries = getAllGlossaryEntries();
  const autoShrinkFont = Boolean(els.chkAutoShrinkFont?.checked);
  const masterZip = new window.JSZip();

  if (els.btnRunMultiLangZip) els.btnRunMultiLangZip.disabled = true;

  try {
    let generatedFilesCount = 0;

    for (let lIdx = 0; lIdx < langKeys.length; lIdx++) {
      const langKey = langKeys[lIdx];
      const langMeta = getTargetLanguageMeta(langKey);
      if (els.multiLangBatchStatus) {
        els.multiLangBatchStatus.textContent = `⏳ [${lIdx + 1}/${langKeys.length}] ${langMeta.label} 문서 생성 중...`;
      }

      const translationsMap = {};
      // If teacher already edited/translated this language, reuse their verified/edited state
      if (langKey === state.translatedLangKey && state.itemStates.size > 0) {
        for (const item of doc.items) {
          const st = state.itemStates.get(item.id);
          translationsMap[item.id] = st && st.finalText.trim() ? st.finalText : item.sourceText;
        }
      } else {
        // Try creating Chrome built-in translator if supported, otherwise apply school glossary + bilingual/source fallback
        let translator = null;
        const supportInfo = state.langSupportMap.get(langKey) || (await checkLanguagePairSupport(langKey));
        if (supportInfo && supportInfo.supported) {
          try {
            translator = await startTranslatorCreation(supportInfo.resolvedCode || langMeta.candidates[0]);
          } catch {
            translator = null;
          }
        }

        const cache = new Map();
        for (const item of doc.items) {
          if (isNonTranslatableText(item.sourceText)) {
            translationsMap[item.id] = item.sourceText;
            continue;
          }
          const srcTrimmed = item.sourceText.trim();
          const srcCore = srcTrimmed.replace(/^[\d.\-•()\s]+|[:：.\s]+$/g, '').trim();

          // Check exact school glossary match first
          let glossaryHit = '';
          for (const entry of entries) {
            const targetTerm = entry.translations?.[langKey];
            if (targetTerm && (srcTrimmed === entry.ko || srcCore === entry.ko)) {
              glossaryHit = targetTerm;
              break;
            }
          }

          if (glossaryHit) {
            translationsMap[item.id] = glossaryHit;
          } else if (translator) {
            try {
              if (cache.has(srcTrimmed)) {
                translationsMap[item.id] = cache.get(srcTrimmed);
              } else {
                const tr = await translateSingleText(translator, item.sourceText);
                cache.set(srcTrimmed, tr);
                translationsMap[item.id] = tr;
              }
            } catch {
              translationsMap[item.id] = item.sourceText;
            }
          } else {
            // Check partial glossary hints or keep source
            const matches = findMatchingGlossaryTerms(item.sourceText, langKey, '');
            if (matches.length > 0) {
              const hints = matches.map((m) => `${m.ko}:${m.target}`).join(', ');
              translationsMap[item.id] = `${item.sourceText} (${hints})`;
            } else {
              translationsMap[item.id] = item.sourceText;
            }
          }
        }

        if (translator && typeof translator.destroy === 'function') {
          try {
            translator.destroy();
          } catch {
            // ignore
          }
        }
      }

      const fileUint8 = await buildTranslatedDocument(doc, translationsMap, {
        emptyFallback: 'keep-source',
        outputMode: state.outputMode,
        autoShrinkFont
      });
      const outName = buildOutputFileName(doc.fileName, langMeta.key, doc.fileType, state.outputMode);
      masterZip.file(outName, fileUint8);
      generatedFilesCount++;
    }

    if (els.multiLangBatchStatus) {
      els.multiLangBatchStatus.textContent = `📦 ${generatedFilesCount}개 국어 문서를 ZIP 파일로 묶는 중...`;
    }

    const zipUint8 = await masterZip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const baseName = doc.fileName.replace(/\.(pptx|hwpx|docx|xlsx)$/i, '');
    const zipFileName = `${baseName}_다국어일괄변환_${generatedFilesCount}개국어.zip`;
    const blob = new Blob([zipUint8], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    if (els.multiLangBatchStatus) {
      els.multiLangBatchStatus.textContent = `✓ 총 ${generatedFilesCount}개 국어 수업자료가 담긴 [${zipFileName}] 다운로드가 완료되었습니다!`;
    }
  } catch (err) {
    if (els.multiLangBatchStatus) {
      els.multiLangBatchStatus.textContent = `⚠️ 다국어 일괄 ZIP 생성 중 오류: ${err?.message || '다시 시도해 주세요.'}`;
    }
  } finally {
    if (els.btnRunMultiLangZip) els.btnRunMultiLangZip.disabled = false;
  }
}

/* ==================== IDEA #9: STUDENT QR MOBILE READER MODAL ==================== */

let currentStudentReaderPayload = null;

function handleOpenStudentQrModal() {
  if (!state.parsedDoc) return;
  const doc = state.parsedDoc;
  const langKey = state.selectedLangKey;
  const pairs = doc.items.map((item) => {
    const st = state.itemStates.get(item.id);
    return {
      ko: item.sourceText,
      target: st && st.finalText.trim() ? st.finalText : item.sourceText,
      loc: item.locationLabel
    };
  });

  const encoded = encodeStudentViewPayload(doc.fileName, langKey, pairs);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const shareUrl = `${baseUrl}#student-view=${encoded}`;

  if (els.inputStudentShareUrl) {
    els.inputStudentShareUrl.value = shareUrl;
  }
  if (els.imgStudentShareQr) {
    els.imgStudentShareQr.onerror = () => {
      els.imgStudentShareQr.onerror = null;
      els.imgStudentShareQr.src = './qr.svg';
    };
    // QR servers usually handle up to ~2000 chars cleanly; if URL is very long, use base app URL + hash up to safe limit
    const qrTargetUrl = shareUrl.length <= 1800 ? shareUrl : baseUrl;
    els.imgStudentShareQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(qrTargetUrl)}`;
  }
  if (els.studentShareFeedback) {
    els.studentShareFeedback.textContent = '';
  }

  openStudentReaderFromPayload(
    {
      title: doc.fileName,
      langKey,
      pairs
    },
    false
  );
}

function openStudentReaderFromPayload(payload, isDirectStudentLink = false) {
  if (!payload || !els.studentQrModal) return;
  currentStudentReaderPayload = payload;
  const langMeta = getTargetLanguageMeta(payload.langKey || 'en');

  if (els.studentQrShareSection) {
    els.studentQrShareSection.classList.toggle('hidden', isDirectStudentLink);
  }
  if (els.studentReaderDocTitle) {
    els.studentReaderDocTitle.textContent = payload.title || '다국어 활동지';
  }
  if (els.studentReaderLangBadge) {
    els.studentReaderLangBadge.textContent = `${langMeta.label} (${langMeta.nativeLabel})`;
  }

  const showKo = els.chkStudentReaderShowKo ? Boolean(els.chkStudentReaderShowKo.checked) : true;
  if (els.studentReaderCardsList) {
    els.studentReaderCardsList.innerHTML = '';
    const pairs = Array.isArray(payload.pairs) ? payload.pairs : [];
    pairs.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'student-reader-card';
      card.innerHTML = `
        <div class="student-reader-card-top">
          <span class="location-badge">${escapeHtml(p.loc || `문장 ${idx + 1}`)}</span>
          <button type="button" class="btn btn-outline btn-xs" data-role="student-card-tts">🔊 발음 듣기</button>
        </div>
        <div class="student-reader-target-line" lang="${escapeHtml(langMeta.key)}" dir="${escapeHtml(langMeta.dir || 'ltr')}">
          ${escapeHtml(p.target || p.ko || '')}
        </div>
        <div class="student-reader-ko-line ${showKo ? '' : 'hidden'}" lang="ko">
          🇰🇷 ${escapeHtml(p.ko || '')}
        </div>
      `;
      const ttsBtn = card.querySelector('[data-role="student-card-tts"]');
      ttsBtn?.addEventListener('click', () => {
        const isSpeaking = ttsBtn.classList.contains('is-active');
        speakTextWithBrowserTTS(
          p.target || p.ko || '',
          langMeta.key,
          (st) => {
            if (st === 'speaking' || st === true) {
              ttsBtn.classList.add('is-active');
              ttsBtn.textContent = '⏹️ 중지';
            } else {
              ttsBtn.classList.remove('is-active');
              ttsBtn.textContent = '🔊 발음 듣기';
            }
          },
          isSpeaking
        );
      });
      els.studentReaderCardsList.appendChild(card);
    });
  }

  els.studentQrModal.classList.remove('hidden');
}

function closeStudentQrModal() {
  if (!els.studentQrModal) return;
  els.studentQrModal.classList.add('hidden');
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

async function handleCopyStudentShareUrl() {
  const url = els.inputStudentShareUrl?.value || '';
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    if (els.studentShareFeedback) {
      els.studentShareFeedback.textContent = '✓ 학생용 다국어 활동지 링크가 복사되었습니다! 학급 게시판이나 메신저에 붙여넣으세요.';
    }
  } catch {
    els.inputStudentShareUrl?.select();
    if (els.studentShareFeedback) {
      els.studentShareFeedback.textContent = '링크 입력창을 선택했습니다. Ctrl+C를 눌러 복사해 주세요.';
    }
  }
}

function handleSpeakAllStudentCards() {
  if (!currentStudentReaderPayload || !Array.isArray(currentStudentReaderPayload.pairs)) return;
  const langKey = currentStudentReaderPayload.langKey || 'en';
  const combinedText = currentStudentReaderPayload.pairs
    .map((p) => (p.target || '').trim())
    .filter(Boolean)
    .join('. ');
  if (!combinedText) return;

  const isActive = els.btnSpeakAllStudentCards?.classList.contains('is-active');
  speakTextWithBrowserTTS(
    combinedText,
    langKey,
    (st) => {
      if (!els.btnSpeakAllStudentCards) return;
      if (st === 'speaking' || st === true) {
        els.btnSpeakAllStudentCards.classList.add('is-active');
        els.btnSpeakAllStudentCards.textContent = '⏹️ 연속 듣기 중지';
      } else {
        els.btnSpeakAllStudentCards.classList.remove('is-active');
        els.btnSpeakAllStudentCards.textContent = '🔊 전체 문장 연속 듣기';
      }
    },
    Boolean(isActive)
  );
}

/* ==================== IDEAS #4, #7, #8: TEACHER TOOLKIT (10s NOTICE TRANSLATOR, TEMPLATES, CLASSROOM TTS CARDS) ==================== */

function switchToolkitSubtab(subtabName) {
  const isNotice = subtabName !== 'cards';
  if (els.btnToolkitSubtabNotice) {
    els.btnToolkitSubtabNotice.classList.toggle('active', isNotice);
    els.btnToolkitSubtabNotice.setAttribute('aria-selected', isNotice ? 'true' : 'false');
  }
  if (els.btnToolkitSubtabCards) {
    els.btnToolkitSubtabCards.classList.toggle('active', !isNotice);
    els.btnToolkitSubtabCards.setAttribute('aria-selected', !isNotice ? 'true' : 'false');
  }
  if (els.toolkitSubviewNotice) {
    els.toolkitSubviewNotice.classList.toggle('hidden', !isNotice);
  }
  if (els.toolkitSubviewCards) {
    els.toolkitSubviewCards.classList.toggle('hidden', isNotice);
  }
  if (!isNotice) {
    renderClassroomCards();
  }
}

function initToolkitView() {
  els.btnToolkitSubtabNotice?.addEventListener('click', () => switchToolkitSubtab('notice'));
  els.btnToolkitSubtabCards?.addEventListener('click', () => switchToolkitSubtab('cards'));

  if (els.toolkitTemplateButtons) {
    els.toolkitTemplateButtons.innerHTML = '';
    const shortLabels = ['📌 준비물 안내', '📌 현장체험학습', '📌 알레르기 조사', '📌 학부모 상담'];
    SCHOOL_NOTICE_TEMPLATES.forEach((tpl, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toolkit-mini-tpl-chip';
      btn.textContent = shortLabels[idx] || `📌 ${tpl.title || tpl.label}`;
      btn.title = tpl.title || tpl.label || '';
      btn.addEventListener('click', () => {
        const ko = tpl.ko || tpl.koText || '';
        const langKey = els.selectToolkitTargetLang?.value || state.selectedLangKey || 'vi';
        if (els.textareaToolkitSource) {
          els.textareaToolkitSource.value = ko;
        }
        if (tpl.translations?.[langKey] && els.textareaToolkitTarget) {
          els.textareaToolkitTarget.value = tpl.translations[langKey];
          if (els.toolkitBacktranslateText && els.toolkitBacktranslateBox) {
            els.toolkitBacktranslateText.textContent = `“${ko}” (검증된 학교 표준 번역문)`;
            els.toolkitBacktranslateBox.classList.remove('hidden');
          }
          if (els.toolkitFeedbackMsg) {
            els.toolkitFeedbackMsg.textContent = '✓ 표준 알림장 번역문이 바로 적용되었습니다.';
          }
        } else {
          handleToolkitTranslate();
        }
      });
      els.toolkitTemplateButtons.appendChild(btn);
    });
  }

  els.selectToolkitTargetLang?.addEventListener('change', () => {
    const val = els.selectToolkitTargetLang.value || 'vi';
    applySelectedLanguageEverywhere(val);
  });

  els.btnToolkitClear?.addEventListener('click', () => {
    if (els.textareaToolkitSource) els.textareaToolkitSource.value = '';
    if (els.textareaToolkitTarget) els.textareaToolkitTarget.value = '';
    els.toolkitBacktranslateBox?.classList.add('hidden');
    if (els.toolkitFeedbackMsg) els.toolkitFeedbackMsg.textContent = '';
  });

  els.btnToolkitTranslate?.addEventListener('click', handleToolkitTranslate);

  els.btnToolkitSpeak?.addEventListener('click', () => {
    const langKey = els.selectToolkitTargetLang?.value || state.selectedLangKey || 'vi';
    const text = els.textareaToolkitTarget?.value || '';
    const isSpeaking = els.btnToolkitSpeak.classList.contains('is-active');
    speakTextWithBrowserTTS(
      text,
      langKey,
      (st) => {
        if (st === 'speaking' || st === true) {
          els.btnToolkitSpeak.classList.add('is-active');
          els.btnToolkitSpeak.textContent = '⏹️ 중지';
        } else {
          els.btnToolkitSpeak.classList.remove('is-active');
          els.btnToolkitSpeak.textContent = '🔊 발음 듣기';
        }
      },
      isSpeaking
    );
  });

  els.btnToolkitCopyTarget?.addEventListener('click', async () => {
    const target = (els.textareaToolkitTarget?.value || '').trim();
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target);
      if (els.toolkitFeedbackMsg) {
        els.toolkitFeedbackMsg.textContent = '✓ 번역문을 복사했습니다!';
      }
    } catch {
      els.textareaToolkitTarget?.select();
    }
  });

  els.btnToolkitCopyBilingual?.addEventListener('click', async () => {
    const ko = (els.textareaToolkitSource?.value || '').trim();
    const target = (els.textareaToolkitTarget?.value || '').trim();
    if (!ko && !target) return;
    const langMeta = getTargetLanguageMeta(els.selectToolkitTargetLang?.value || state.selectedLangKey || 'vi');
    const combined = `[학교 알림장 / 가정통신 안내]\n${ko}\n\n[${langMeta.label} (${langMeta.nativeLabel})]\n${target}`;
    try {
      await navigator.clipboard.writeText(combined);
      if (els.toolkitFeedbackMsg) {
        els.toolkitFeedbackMsg.textContent = '✓ [한국어 + 번역문] 문자용 문구가 복사되었습니다!';
      }
    } catch {
      els.textareaToolkitTarget?.select();
    }
  });

  renderClassroomCards();
}

async function handleToolkitTranslate() {
  const koText = (els.textareaToolkitSource?.value || '').trim();
  if (!koText) {
    if (els.toolkitFeedbackMsg) {
      els.toolkitFeedbackMsg.textContent = '번역할 한국어 알림장 문장을 입력하거나 위 예문 버튼을 눌러 주세요.';
    }
    return;
  }

  const langKey = els.selectToolkitTargetLang?.value || state.selectedLangKey || 'vi';
  const langMeta = getTargetLanguageMeta(langKey);
  if (els.labelToolkitTargetLang) {
    els.labelToolkitTargetLang.textContent = `${langMeta.label} 번역 결과`;
  }

  // Check if source matches a built-in template with pre-verified translation
  const matchedTpl = SCHOOL_NOTICE_TEMPLATES.find((t) => (t.ko || t.koText) === koText);
  if (matchedTpl && matchedTpl.translations?.[langKey]) {
    if (els.textareaToolkitTarget) {
      els.textareaToolkitTarget.value = matchedTpl.translations[langKey];
      els.textareaToolkitTarget.setAttribute('dir', langMeta.dir || 'ltr');
    }
    if (els.toolkitBacktranslateText && els.toolkitBacktranslateBox) {
      els.toolkitBacktranslateText.textContent = `“${koText}” (검증된 학교 표준 번역문)`;
      els.toolkitBacktranslateBox.classList.remove('hidden');
    }
    if (els.toolkitFeedbackMsg) {
      els.toolkitFeedbackMsg.textContent = `✓ ${langMeta.label} 표준 알림장 번역이 적용되었습니다.`;
    }
    return;
  }

  const supportInfo = state.langSupportMap.get(langKey) || {
    resolvedCode: langMeta.candidates[0]
  };
  const resolvedCode = supportInfo.resolvedCode || langMeta.candidates[0];

  // Start Translator creation synchronously on user click
  const translatorPromise = startTranslatorCreation(resolvedCode);
  const reversePromise = startReverseTranslatorCreation(resolvedCode).catch(() => null);

  if (els.btnToolkitTranslate) els.btnToolkitTranslate.disabled = true;
  if (els.toolkitFeedbackMsg) {
    els.toolkitFeedbackMsg.textContent = `⏳ ${langMeta.label} 번역 중...`;
  }

  try {
    const translator = await translatorPromise;
    const translated = await translateSingleText(translator, koText);
    if (els.textareaToolkitTarget) {
      els.textareaToolkitTarget.value = translated;
      els.textareaToolkitTarget.setAttribute('dir', langMeta.dir || 'ltr');
    }

    const reverseTranslator = await reversePromise;
    if (reverseTranslator && translated.trim()) {
      try {
        const backKo = await translateSingleText(reverseTranslator, translated);
        if (els.toolkitBacktranslateText && els.toolkitBacktranslateBox) {
          els.toolkitBacktranslateText.textContent = `“${backKo}”`;
          els.toolkitBacktranslateBox.classList.remove('hidden');
        }
      } catch {
        els.toolkitBacktranslateBox?.classList.add('hidden');
      }
      if (typeof reverseTranslator.destroy === 'function') {
        try {
          reverseTranslator.destroy();
        } catch {
          // ignore
        }
      }
    }

    if (typeof translator.destroy === 'function') {
      try {
        translator.destroy();
      } catch {
        // ignore
      }
    }

    if (els.toolkitFeedbackMsg) {
      els.toolkitFeedbackMsg.textContent = `✓ ${langMeta.label} 번역 완료!`;
    }
  } catch {
    // Fallback: apply matching school glossary terms so teacher still gets helpful terms + prompt copy
    const matches = findMatchingGlossaryTerms(koText, langKey, '');
    const glossaryHint =
      matches.length > 0
        ? `\n\n[학교 표준 용어 참고]\n` + matches.map((m) => `• ${m.ko} ➔ ${m.target}`).join('\n')
        : '';
    if (els.textareaToolkitTarget) {
      els.textareaToolkitTarget.value = `${koText}${glossaryHint}`;
    }
    if (els.toolkitFeedbackMsg) {
      els.toolkitFeedbackMsg.textContent = `ℹ️ 현재 브라우저에서 ${langMeta.label} 자동 번역 모델이 지원되지 않아 학교 표준 용어 힌트를 표시했습니다.`;
    }
  } finally {
    if (els.btnToolkitTranslate) els.btnToolkitTranslate.disabled = false;
  }
}

function renderClassroomCards() {
  if (!els.classroomCardsGrid) return;
  const langKey = els.selectToolkitTargetLang?.value || state.selectedLangKey || 'vi';
  const langMeta = getTargetLanguageMeta(langKey);
  if (els.labelToolkitTargetLang) {
    els.labelToolkitTargetLang.textContent = `${langMeta.label} 번역 결과`;
  }

  els.classroomCardsGrid.innerHTML = '';
  for (const item of CLASSROOM_COMMUNICATION_CARDS) {
    const rawTarget = item.translations?.[langKey] || item.translations?.en || item.ko;
    const targetText = typeof rawTarget === 'string' ? rawTarget : rawTarget.text || item.ko;
    const pronText =
      (typeof rawTarget === 'object' && rawTarget.pron) ||
      item.pronunciation?.[langKey] ||
      '우측 상단 [🔊 발음 듣기]로 원어민 음성을 바로 들려주세요';

    const card = document.createElement('div');
    card.className = 'classroom-phrase-card';
    card.innerHTML = `
      <div class="classroom-phrase-top">
        <span class="badge badge-context">${escapeHtml(item.category)}</span>
        <div class="inline-actions">
          <button type="button" class="btn btn-outline btn-xs" data-role="phrase-tts-btn">🔊 듣기</button>
          <button type="button" class="btn btn-surface btn-xs" data-role="phrase-copy-btn">📋 복사</button>
        </div>
      </div>
      <div class="classroom-phrase-ko">${escapeHtml(item.ko)}</div>
      <div class="classroom-phrase-target" lang="${escapeHtml(langMeta.key)}" dir="${escapeHtml(langMeta.dir || 'ltr')}">
        ${escapeHtml(targetText)}
      </div>
      <div class="classroom-phrase-pron">
        발음: <strong>${escapeHtml(pronText)}</strong>
      </div>
    `;

    const ttsBtn = card.querySelector('[data-role="phrase-tts-btn"]');
    ttsBtn?.addEventListener('click', () => {
      const isSpeaking = ttsBtn.classList.contains('is-active');
      speakTextWithBrowserTTS(
        targetText,
        langKey,
        (st) => {
          if (st === 'speaking' || st === true) {
            ttsBtn.classList.add('is-active');
            ttsBtn.textContent = '⏹️ 중지';
          } else {
            ttsBtn.classList.remove('is-active');
            ttsBtn.textContent = '🔊 발음 듣기';
          }
        },
        isSpeaking
      );
    });

    const copyBtn = card.querySelector('[data-role="phrase-copy-btn"]');
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(`${item.ko}\n${targetText}`);
        copyBtn.textContent = '✓ 복사됨';
        setTimeout(() => {
          copyBtn.textContent = '📋 복사';
        }, 1500);
      } catch {
        // ignore
      }
    });

    els.classroomCardsGrid.appendChild(card);
  }
}

/* ==================== PRD 5: LESSON UTILIZATION CASE SHARING ==================== */

function formatFileFormatLabel(fmt) {
  if (fmt === 'pptx') return 'PPTX (슬라이드)';
  if (fmt === 'hwpx') return 'HWPX (한글 문서)';
  if (fmt === 'docx') return 'DOCX (Word 문서)';
  if (fmt === 'xlsx') return 'XLSX (Excel 표)';
  if (fmt === 'both') return 'PPTX + HWPX';
  return fmt || 'PPTX';
}

function formatStatusBadgeHtml(status) {
  if (status === 'approved') {
    return '<span class="badge badge-available case-status-badge status-approved">🟢 승인됨 (공개 게시)</span>';
  }
  if (status === 'rejected') {
    return '<span class="badge badge-unavailable case-status-badge status-rejected">🔴 반려됨 (사유 확인·재제출 가능)</span>';
  }
  if (status === 'hidden') {
    return '<span class="badge badge-context case-status-badge status-hidden">🙈 비공개 전환됨</span>';
  }
  return '<span class="badge badge-downloadable case-status-badge status-pending">🟡 관리자 승인중</span>';
}

function bindCaseSharingEvents() {
  if (els.caseInputDate && !els.caseInputDate.value) {
    els.caseInputDate.value = new Date().toISOString().slice(0, 10);
  }
  if (els.caseInputLang && state.selectedLangKey) {
    els.caseInputLang.value = state.selectedLangKey;
  }

  els.btnOpenCaseForm?.addEventListener('click', () => {
    openCaseWritePanel(null);
  });

  els.btnCloseCaseForm?.addEventListener('click', () => {
    openCaseWritePanel(null);
  });

  els.btnCancelCaseForm?.addEventListener('click', () => {
    openCaseWritePanel(null);
  });

  els.btnOpenMyCases?.addEventListener('click', () => {
    const isHidden = els.myCasesPanel?.classList.contains('hidden');
    if (isHidden) {
      els.myCasesPanel?.classList.remove('hidden');
      loadAndRenderMyCases();
      els.myCasesPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      els.myCasesPanel?.classList.add('hidden');
    }
  });

  els.btnCloseMyCases?.addEventListener('click', () => {
    els.myCasesPanel?.classList.add('hidden');
  });

  els.btnLookupMyCases?.addEventListener('click', () => {
    loadAndRenderMyCases();
  });

  els.caseSubmitForm?.addEventListener('submit', handleSubmitCaseForm);

  // Public filter events
  els.filterCaseLang?.addEventListener('change', renderPublicCasesList);
  els.filterCaseGrade?.addEventListener('change', renderPublicCasesList);
  els.filterCaseFormat?.addEventListener('change', renderPublicCasesList);
  els.filterCaseSubject?.addEventListener('input', renderPublicCasesList);

  els.btnResetCaseFilters?.addEventListener('click', () => {
    if (els.filterCaseLang) els.filterCaseLang.value = 'all';
    if (els.filterCaseGrade) els.filterCaseGrade.value = 'all';
    if (els.filterCaseFormat) els.filterCaseFormat.value = 'all';
    if (els.filterCaseSubject) els.filterCaseSubject.value = '';
    state.highlightedCaseId = null;
    renderPublicCasesList();
  });

  els.btnRefreshCases?.addEventListener('click', () => {
    loadAndRenderPublicCases();
  });
}

function buildUnifiedCaseText(item) {
  if (!item) return '';
  const goal = (item.lesson_goal || '').trim();
  const proc = (item.tool_usage_process || '').trim();
  const rev = (item.teacher_review_notes || '').trim();
  const res = (item.observed_results_limits || '').trim();
  if (!proc || proc === '-' || proc === goal) {
    return goal;
  }
  return [goal, proc, rev, res].filter((v, idx, arr) => v && v !== '-' && arr.indexOf(v) === idx).join('\n\n');
}

function renderCaseBodySectionsHtml(item) {
  const reviewText = buildUnifiedCaseText(item) || (item?.title || '').trim();
  return `<p class="case-simple-review-text">${escapeHtml(reviewText)}</p>`;
}

function openCaseWritePanel(editItem = null) {
  if (!els.caseWritePanel || !els.caseSubmitForm) return;
  els.caseSubmitFeedback?.classList.add('hidden');

  if (editItem) {
    if (els.caseFormTitle) els.caseFormTitle.textContent = '✏️ 내 후기 수정하기';
    if (els.btnSubmitCase) els.btnSubmitCase.textContent = '💬 수정 등록';
    els.btnCancelCaseForm?.classList.remove('hidden');
    els.caseEditId.value = editItem.id;
    els.caseEditId.dataset.usedDate = editItem.used_date || new Date().toISOString().slice(0, 10);
    els.caseEditId.dataset.fileFormat = editItem.file_format || state.parsedDoc?.fileType || 'pptx';
    if (els.caseInputTitle) els.caseInputTitle.value = editItem.title || '';
    if (els.caseInputGrade) els.caseInputGrade.value = editItem.school_grade || '현장 교사';
    if (els.caseInputSubject) els.caseInputSubject.value = editItem.subject || '수업·학급 활용';
    if (els.caseInputLang) els.caseInputLang.value = editItem.target_language || state.selectedLangKey || 'vi';
    if (els.caseInputAuthor) {
      els.caseInputAuthor.value =
        editItem.author_display_name === '익명 교사' || editItem.author_display_name === '익명 선생님'
          ? ''
          : editItem.author_display_name || '';
    }
    if (els.caseInputGoal) els.caseInputGoal.value = buildUnifiedCaseText(editItem);
    if (els.caseInputPasscode) {
      els.caseInputPasscode.value = (els.myCasesPasscodeInput?.value || '').trim() || getOrCreateAutoCasePasscode();
    }
    if (els.chkCaseFactual) els.chkCaseFactual.checked = true;
    els.caseWritePanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    els.caseInputGoal?.focus();
  } else {
    if (els.caseFormTitle) els.caseFormTitle.textContent = '✏️ 간단 후기 남기기';
    if (els.btnSubmitCase) els.btnSubmitCase.textContent = '💬 후기 등록';
    els.btnCancelCaseForm?.classList.add('hidden');
    els.caseSubmitForm.reset();
    els.caseEditId.value = '';
    delete els.caseEditId.dataset.usedDate;
    delete els.caseEditId.dataset.fileFormat;
    if (els.caseInputTitle) els.caseInputTitle.value = '';
    if (els.caseInputGrade) els.caseInputGrade.value = '현장 교사';
    if (els.caseInputSubject) els.caseInputSubject.value = '수업·학급 활용';
    if (els.caseInputLang) {
      els.caseInputLang.value = state.selectedLangKey || 'vi';
    }
    if (els.chkCaseFactual) {
      els.chkCaseFactual.checked = true;
    }
  }

  els.caseWritePanel.classList.remove('hidden');
}

async function handleSubmitCaseForm(e) {
  e.preventDefault();
  if (!els.caseSubmitFeedback) return;

  const editId = (els.caseEditId?.value || '').trim();
  const unifiedContent = (els.caseInputGoal?.value || '').trim();

  if (!unifiedContent) {
    showCaseFormFeedback('error', '후기 내용을 한 줄 이상 입력해 주세요.');
    els.caseInputGoal?.focus();
    return;
  }

  const autoTitle =
    (els.caseInputTitle?.value || '').trim() ||
    unifiedContent.replace(/\s+/g, ' ').slice(0, 40) + (unifiedContent.length > 40 ? '…' : '');
  const autoPasscode =
    (els.caseInputPasscode?.value || '').trim() ||
    (els.myCasesPasscodeInput?.value || '').trim() ||
    getOrCreateAutoCasePasscode();
  const autoUsedDate =
    (els.caseInputDate?.value || '').trim() ||
    els.caseEditId?.dataset?.usedDate ||
    new Date().toISOString().slice(0, 10);
  const autoFileFormat =
    (els.caseInputFormat?.value || '').trim() ||
    els.caseEditId?.dataset?.fileFormat ||
    state.parsedDoc?.fileType ||
    'pptx';

  const payload = {
    title: autoTitle,
    used_date: autoUsedDate,
    school_grade: (els.caseInputGrade?.value || '').trim() || '현장 교사',
    subject: (els.caseInputSubject?.value || '').trim() || '수업·학급 활용',
    target_language: (els.caseInputLang?.value || '').trim() || state.selectedLangKey || 'vi',
    file_format: autoFileFormat,
    author_display_name: (els.caseInputAuthor?.value || '').trim() || '익명 선생님',
    lesson_goal: unifiedContent,
    tool_usage_process: unifiedContent,
    teacher_review_notes: unifiedContent,
    observed_results_limits: unifiedContent,
    aggregate_metrics: '',
    improvement_suggestions: '',
    author_passcode: autoPasscode,
    confirmed_factual: true,
    confirmed_no_pii: true,
    confirmed_public_rights: true
  };

  // Client-side PII pattern check (phone number / resident registration pattern)
  if (/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/.test(unifiedContent)) {
    showCaseFormFeedback('error', '전화번호 형태로 보이는 숫자가 포함되어 있습니다. 학생·학부모 연락처 등 개인정보를 제외하고 작성해 주세요.');
    return;
  }

  if (els.btnSubmitCase) els.btnSubmitCase.disabled = true;

  try {
    let result;
    if (editId) {
      result = await resubmitLessonCase(editId, payload.author_passcode, payload);
    } else {
      result = await submitLessonCase(payload);
    }

    if (!result || !result.ok) {
      showCaseFormFeedback('error', result?.message || '후기 등록 중 오류가 발생했습니다.');
      return;
    }

    if (els.myCasesPasscodeInput) {
      els.myCasesPasscodeInput.value = payload.author_passcode;
    }

    openCaseWritePanel(null);
    showCaseFormFeedback(
      'success',
      `✅ 후기가 등록되었습니다! (${result.status_label || '관리자 승인중'} — 확인 후 목록에 게시됩니다)`
    );

    if (!els.myCasesPanel?.classList.contains('hidden')) {
      await loadAndRenderMyCases();
    }
  } finally {
    if (els.btnSubmitCase) els.btnSubmitCase.disabled = false;
  }
}

function showCaseFormFeedback(type, msg) {
  if (!els.caseSubmitFeedback) return;
  els.caseSubmitFeedback.className = `alert-box alert-${type === 'error' ? 'error' : 'success'}`;
  els.caseSubmitFeedback.innerHTML = `<div class="alert-title">${escapeHtml(msg)}</div>`;
  els.caseSubmitFeedback.classList.remove('hidden');
}

async function loadAndRenderPublicCases() {
  if (!els.casesPublicList) return;
  els.casesPublicList.innerHTML = '<div class="cases-empty-state">⏳ 선생님들의 활용 후기를 불러오는 중입니다...</div>';

  const { items, isOfflineFallback, errorMessage } = await fetchApprovedCases();
  state.publicCases = items || [];

  if (els.casesCountPill) {
    els.casesCountPill.textContent = `${state.publicCases.length}건`;
  }

  if (els.casesServerStatusBanner) {
    if (isOfflineFallback) {
      els.casesServerStatusBanner.textContent = `⚠️ 후기 서버에 일시적으로 연결할 수 없어 예시 후기만 표시하고 있습니다 (${errorMessage || '오프라인 모드'}). 문서 번역 기능은 정상 작동합니다.`;
      els.casesServerStatusBanner.classList.remove('hidden');
    } else {
      els.casesServerStatusBanner.classList.add('hidden');
    }
  }

  renderPublicCasesList();
}

function renderPublicCasesList() {
  if (!els.casesPublicList) return;
  const langFilter = els.filterCaseLang?.value || 'all';
  const keyword = (els.filterCaseSubject?.value || '').trim().toLowerCase();

  const filtered = state.publicCases.filter((item) => {
    if (langFilter !== 'all' && item.target_language !== langFilter) return false;
    if (keyword) {
      const hay = `${item.title || ''} ${item.subject || ''} ${item.lesson_goal || ''} ${item.author_display_name || ''}`.toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    return true;
  });

  els.casesPublicList.innerHTML = '';

  if (filtered.length === 0) {
    els.casesPublicList.innerHTML =
      '<div class="cases-empty-state">아직 조건에 맞는 후기가 없습니다. 위 입력창에서 첫 번째 간단 후기를 남겨 보세요!</div>';
    return;
  }

  for (const item of filtered) {
    const langMeta = getTargetLanguageMeta(item.target_language || 'vi');
    const isHighlighted = state.highlightedCaseId && state.highlightedCaseId === item.id;
    const card = document.createElement('article');
    card.className = `case-card case-simple-card${isHighlighted ? ' is-highlighted-case' : ''}`;
    card.setAttribute('data-case-id', item.id);

    const sampleBadgeHtml = item.is_sample
      ? '<span class="badge badge-warn case-sample-badge">예시 후기</span>'
      : '';

    card.innerHTML = `
      <div class="case-simple-card-top">
        <div class="case-badge-row">
          <span class="badge badge-context case-lang-badge">🌐 ${escapeHtml(langMeta.label)}</span>
          ${sampleBadgeHtml}
          <span class="case-simple-author">${escapeHtml(item.author_display_name || '익명 선생님')}</span>
          <span class="case-simple-date">· ${escapeHtml(item.used_date || '-')}</span>
        </div>
        <button type="button" class="link-btn case-mini-report-btn" data-role="toggle-report-box">
          신고·삭제요청
        </button>
      </div>

      ${renderCaseBodySectionsHtml(item)}

      <div class="case-report-drawer hidden" data-role="report-drawer">
        <div class="case-report-row">
          <select class="drawer-input" data-role="report-type" aria-label="요청 유형 선택">
            <option value="report">부적절·개인정보 신고</option>
            <option value="delete_request">후기 삭제 요청</option>
          </select>
          <input type="text" class="drawer-input" data-role="report-reason" placeholder="요청 사유를 간단히 입력해 주세요" />
          <button type="button" class="btn btn-secondary btn-sm" data-role="submit-report-btn">접수</button>
        </div>
        <span class="drawer-feedback" data-role="report-feedback"></span>
      </div>
    `;

    const toggleReportBtn = card.querySelector('[data-role="toggle-report-box"]');
    const reportDrawer = card.querySelector('[data-role="report-drawer"]');
    toggleReportBtn?.addEventListener('click', () => {
      reportDrawer?.classList.toggle('hidden');
    });

    const submitReportBtn = card.querySelector('[data-role="submit-report-btn"]');
    submitReportBtn?.addEventListener('click', async () => {
      const reqType = card.querySelector('[data-role="report-type"]')?.value || 'report';
      const reason = card.querySelector('[data-role="report-reason"]')?.value || '';
      const fb = card.querySelector('[data-role="report-feedback"]');
      submitReportBtn.disabled = true;
      const res = await reportLessonCase({
        caseId: item.id,
        requestType: reqType,
        reason,
        contactInfo: ''
      });
      submitReportBtn.disabled = false;
      if (fb) {
        fb.textContent = res.message || (res.ok ? '접수되었습니다.' : '접수 실패');
      }
    });

    els.casesPublicList.appendChild(card);

    if (isHighlighted) {
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  }
}

async function loadAndRenderMyCases() {
  if (!els.myCasesList) return;
  const savedIds = getSavedMyCaseIds();
  const passcode = (els.myCasesPasscodeInput?.value || '').trim() || getOrCreateAutoCasePasscode();
  if (els.myCasesPasscodeInput && !els.myCasesPasscodeInput.value) {
    els.myCasesPasscodeInput.value = passcode;
  }

  if (savedIds.length === 0) {
    els.myCasesList.innerHTML =
      '<div class="cases-empty-state">아직 이 브라우저에서 등록한 후기가 없습니다. 위 입력창에서 간단 후기를 남겨 보세요!</div>';
    return;
  }

  els.myCasesList.innerHTML = '<div class="cases-empty-state">⏳ 내가 남긴 후기 상태를 확인하는 중...</div>';
  const res = await fetchMyCases(savedIds, passcode);
  state.myCases = res.items || [];

  if (state.myCases.length === 0) {
    els.myCasesList.innerHTML =
      '<div class="cases-empty-state">이 브라우저에서 등록한 후기 내역을 찾지 못했습니다.</div>';
    return;
  }

  els.myCasesList.innerHTML = '';
  for (const item of state.myCases) {
    const langMeta = getTargetLanguageMeta(item.target_language || 'vi');
    const card = document.createElement('div');
    card.className = `case-card case-simple-card my-case-card status-card-${item.status}`;
    card.innerHTML = `
      <div class="case-simple-card-top">
        <div class="case-badge-row">
          ${formatStatusBadgeHtml(item.status)}
          <span class="badge badge-context">🌐 ${escapeHtml(langMeta.label)}</span>
          <span class="case-simple-date">${escapeHtml(item.used_date || '-')}</span>
        </div>
        <div class="case-footer-left">
          <button type="button" class="btn btn-secondary btn-sm" data-role="edit-resubmit-btn">✏️ 수정</button>
          <button type="button" class="btn btn-outline btn-sm" data-role="delete-my-case-btn">🗑️ 삭제</button>
        </div>
      </div>

      ${renderCaseBodySectionsHtml(item)}

      ${
        item.status === 'rejected'
          ? `<div class="alert-box alert-error" style="margin-top: 8px;">
              <div class="alert-title">🔴 반려 사유: ${escapeHtml(item.rejection_reason || '사유 미기재')}</div>
            </div>`
          : ''
      }
      <span class="my-case-action-feedback drawer-feedback" data-role="my-case-feedback"></span>
    `;

    card.querySelector('[data-role="edit-resubmit-btn"]')?.addEventListener('click', () => {
      openCaseWritePanel(item);
    });

    card.querySelector('[data-role="delete-my-case-btn"]')?.addEventListener('click', async () => {
      const pw = (els.myCasesPasscodeInput?.value || '').trim() || getOrCreateAutoCasePasscode();
      const fb = card.querySelector('[data-role="my-case-feedback"]');
      const delRes = await removeMyLessonCase(item.id, pw);
      if (!delRes.ok) {
        if (fb) fb.textContent = delRes.message || '삭제에 실패했습니다.';
        return;
      }
      await loadAndRenderMyCases();
      await loadAndRenderPublicCases();
    });

    els.myCasesList.appendChild(card);
  }
}

/* ==================== PRD 6 & 7: ADMIN TAB & SERVER-VERIFIED APPROVAL ==================== */

function bindAdminEvents() {
  els.adminLoginForm?.addEventListener('submit', handleAdminLogin);

  els.btnAdminLogout?.addEventListener('click', () => {
    state.adminAuthenticated = false;
    state.adminPasswordSession = '';
    state.adminCases = [];
    state.adminReports = [];
    if (els.adminPasswordInput) els.adminPasswordInput.value = '';
    if (els.adminAuthMsg) els.adminAuthMsg.textContent = '관리자 세션이 잠금(로그아웃)되었습니다.';
    els.adminAuthBox?.classList.remove('hidden');
    els.adminDashboardBox?.classList.add('hidden');
    els.btnAdminLogout?.classList.add('hidden');
  });

  els.adminFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.adminActiveFilter = btn.getAttribute('data-admin-filter') || 'all';
      els.adminFilterBtns.forEach((b) => b.classList.toggle('active', b === btn));
      renderAdminDashboardLists();
    });
  });

  els.btnAdminRefresh?.addEventListener('click', () => {
    if (state.adminAuthenticated) {
      loadAndRenderAdminDashboard();
    }
  });

  els.btnToggleAdminPwChange?.addEventListener('click', () => {
    els.adminPwChangePanel?.classList.toggle('hidden');
  });

  els.btnSaveAdminNewPw?.addEventListener('click', handleAdminSaveNewPassword);
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const pw = els.adminPasswordInput?.value || '';
  if (!pw) return;

  if (els.btnAdminLogin) els.btnAdminLogin.disabled = true;
  if (els.adminAuthMsg) els.adminAuthMsg.textContent = '⏳ 서버에서 관리자 권한을 확인하는 중...';

  const res = await verifyAdminPasswordOnServer(pw);
  if (els.btnAdminLogin) els.btnAdminLogin.disabled = false;

  if (!res.ok) {
    state.adminAuthenticated = false;
    state.adminPasswordSession = '';
    if (els.adminAuthMsg) {
      els.adminAuthMsg.textContent = `❌ ${res.message || '관리자 비밀번호가 일치하지 않습니다.'}`;
    }
    return;
  }

  state.adminAuthenticated = true;
  state.adminPasswordSession = pw;
  if (els.adminPasswordInput) els.adminPasswordInput.value = '';
  if (els.adminAuthMsg) els.adminAuthMsg.textContent = '';

  els.adminAuthBox?.classList.add('hidden');
  els.adminDashboardBox?.classList.remove('hidden');
  els.btnAdminLogout?.classList.remove('hidden');

  await loadAndRenderAdminDashboard();
}

async function handleAdminSaveNewPassword() {
  if (!state.adminAuthenticated || !state.adminPasswordSession) return;
  const newPw = (els.inputAdminNewPw?.value || '').trim();
  if (newPw.length < 4) {
    if (els.adminPwChangeFeedback) {
      els.adminPwChangeFeedback.textContent = '새 관리자 비밀번호는 4자 이상이어야 합니다.';
    }
    return;
  }

  const res = await adminChangePassword(state.adminPasswordSession, newPw);
  if (!res.ok) {
    if (els.adminPwChangeFeedback) {
      els.adminPwChangeFeedback.textContent = res.message || '비밀번호 변경 실패';
    }
    return;
  }

  state.adminPasswordSession = newPw;
  if (els.inputAdminNewPw) els.inputAdminNewPw.value = '';
  if (els.adminPwChangeFeedback) {
    els.adminPwChangeFeedback.textContent = '✓ 서버 관리자 비밀번호 해시가 변경되었습니다.';
  }
}

async function loadAndRenderAdminDashboard() {
  if (!state.adminAuthenticated || !state.adminPasswordSession) return;

  const [casesRes, reportsRes] = await Promise.all([
    adminFetchAllCases(state.adminPasswordSession, 'all'),
    adminFetchCaseReports(state.adminPasswordSession)
  ]);

  if (!casesRes.ok) {
    showAdminActionFeedback('error', casesRes.message || '목록을 불러오지 못했습니다.');
    return;
  }

  state.adminCases = casesRes.items || [];
  state.adminReports = reportsRes.ok ? reportsRes.items || [] : [];

  const counts = {
    all: state.adminCases.length,
    pending: state.adminCases.filter((c) => c.status === 'pending').length,
    approved: state.adminCases.filter((c) => c.status === 'approved').length,
    rejected: state.adminCases.filter((c) => c.status === 'rejected').length,
    hidden: state.adminCases.filter((c) => c.status === 'hidden').length,
    reports: state.adminReports.filter((r) => r.status === 'open').length
  };

  if (els.adminCountAll) els.adminCountAll.textContent = String(counts.all);
  if (els.adminCountPending) els.adminCountPending.textContent = String(counts.pending);
  if (els.adminCountApproved) els.adminCountApproved.textContent = String(counts.approved);
  if (els.adminCountRejected) els.adminCountRejected.textContent = String(counts.rejected);
  if (els.adminCountHidden) els.adminCountHidden.textContent = String(counts.hidden);
  if (els.adminCountReports) els.adminCountReports.textContent = String(counts.reports);

  renderAdminDashboardLists();
}

function showAdminActionFeedback(type, message) {
  if (!els.adminActionFeedback) return;
  els.adminActionFeedback.className = `alert-box alert-${type === 'error' ? 'error' : 'success'}`;
  els.adminActionFeedback.innerHTML = `<div class="alert-title">${escapeHtml(message)}</div>`;
  els.adminActionFeedback.classList.remove('hidden');
}

function renderAdminDashboardLists() {
  if (!els.adminCasesList || !els.adminReportsList) return;

  if (state.adminActiveFilter === 'reports') {
    els.adminCasesList.classList.add('hidden');
    els.adminReportsList.classList.remove('hidden');
    renderAdminReportsList();
    return;
  }

  els.adminReportsList.classList.add('hidden');
  els.adminCasesList.classList.remove('hidden');

  const filtered = state.adminCases.filter((item) => {
    if (state.adminActiveFilter === 'all') return true;
    return item.status === state.adminActiveFilter;
  });

  els.adminCasesList.innerHTML = '';
  if (filtered.length === 0) {
    els.adminCasesList.innerHTML = '<div class="cases-empty-state">해당 상태의 게시글이 없습니다.</div>';
    return;
  }

  for (const item of filtered) {
    const langMeta = getTargetLanguageMeta(item.target_language || 'en');
    const createdDate = item.created_at ? new Date(item.created_at).toLocaleString('ko-KR') : '-';
    const card = document.createElement('article');
    card.className = `case-card admin-case-card status-card-${item.status}`;

    card.innerHTML = `
      <div class="case-card-header">
        <div class="case-badge-row">
          ${formatStatusBadgeHtml(item.status)}
          ${item.is_sample ? '<span class="badge badge-warn">📌 [예시 사례]</span>' : ''}
          <span class="badge badge-context">${escapeHtml(item.school_grade || '-')}</span>
          <span class="badge badge-context">${escapeHtml(item.subject || '-')}</span>
          <span class="badge badge-context">🌐 ${escapeHtml(langMeta.label)}</span>
          <span class="badge badge-context">📄 ${escapeHtml(formatFileFormatLabel(item.file_format))}</span>
        </div>
        <div class="case-meta-date">
          <span>제출일시: ${escapeHtml(createdDate)}</span>
          <span>· 활용일: ${escapeHtml(item.used_date || '-')}</span>
          <span>· 작성자 표시명: <strong>${escapeHtml(item.author_display_name || '익명 교사')}</strong></span>
        </div>
      </div>

      <h3 class="case-card-title">${escapeHtml(item.title)}</h3>

      <div class="admin-confirm-pills">
        <span class="badge ${item.confirmed_factual ? 'badge-available' : 'badge-unavailable'}">실제 활용 확인: ${item.confirmed_factual ? '예' : '아니오'}</span>
        <span class="badge ${item.confirmed_no_pii ? 'badge-available' : 'badge-unavailable'}">학생 개인정보 제거 확인: ${item.confirmed_no_pii ? '예' : '아니오'}</span>
        <span class="badge ${item.confirmed_public_rights ? 'badge-available' : 'badge-unavailable'}">공개·저작권 확인: ${item.confirmed_public_rights ? '예' : '아니오'}</span>
      </div>

      ${renderCaseBodySectionsHtml(item)}

      ${
        item.rejection_reason
          ? `<div class="alert-box alert-warning" style="margin-top: 10px;">
              <strong>기록된 반려/비공개 사유:</strong> ${escapeHtml(item.rejection_reason)}
            </div>`
          : ''
      }

      <div class="admin-review-controls">
        <div class="admin-reject-input-wrap">
          <input
            type="text"
            class="drawer-input"
            data-role="admin-reason-input"
            value="${escapeHtml(item.rejection_reason || '')}"
            placeholder="반려 또는 비공개 시 사유 입력 (반려 시 필수 입력 · 작성자에게 표시됨)"
          />
        </div>
        <div class="admin-action-btns">
          <button type="button" class="btn btn-primary btn-sm" data-role="admin-approve-btn">
            ✅ 승인 (공개 게시)
          </button>
          <button type="button" class="btn btn-secondary btn-sm" data-role="admin-reject-btn">
            ❌ 반려 (사유 전달)
          </button>
          <button type="button" class="btn btn-outline btn-sm" data-role="admin-hide-btn">
            🙈 비공개 전환
          </button>
          <button type="button" class="btn btn-outline btn-sm storage-clear-btn" data-role="admin-delete-btn">
            🗑️ 삭제
          </button>
        </div>
      </div>
    `;

    const reasonInput = card.querySelector('[data-role="admin-reason-input"]');

    card.querySelector('[data-role="admin-approve-btn"]')?.addEventListener('click', async () => {
      const res = await adminReviewCase(state.adminPasswordSession, item.id, 'approve', '');
      showAdminActionFeedback(res.ok ? 'success' : 'error', res.message);
      if (res.ok) {
        await loadAndRenderAdminDashboard();
        await loadAndRenderPublicCases();
      }
    });

    card.querySelector('[data-role="admin-reject-btn"]')?.addEventListener('click', async () => {
      const reason = (reasonInput?.value || '').trim();
      if (!reason) {
        showAdminActionFeedback('error', '반려할 때는 작성자에게 전달할 반려 사유를 반드시 입력해야 합니다.');
        reasonInput?.focus();
        return;
      }
      const res = await adminReviewCase(state.adminPasswordSession, item.id, 'reject', reason);
      showAdminActionFeedback(res.ok ? 'success' : 'error', res.message);
      if (res.ok) {
        await loadAndRenderAdminDashboard();
        await loadAndRenderPublicCases();
      }
    });

    card.querySelector('[data-role="admin-hide-btn"]')?.addEventListener('click', async () => {
      const reason = (reasonInput?.value || '').trim();
      const res = await adminReviewCase(state.adminPasswordSession, item.id, 'hide', reason);
      showAdminActionFeedback(res.ok ? 'success' : 'error', res.message);
      if (res.ok) {
        await loadAndRenderAdminDashboard();
        await loadAndRenderPublicCases();
      }
    });

    card.querySelector('[data-role="admin-delete-btn"]')?.addEventListener('click', async () => {
      if (!window.confirm(`'${item.title}' 게시글을 삭제 처리하시겠습니까?`)) return;
      const res = await adminReviewCase(state.adminPasswordSession, item.id, 'delete', '');
      showAdminActionFeedback(res.ok ? 'success' : 'error', res.message);
      if (res.ok) {
        await loadAndRenderAdminDashboard();
        await loadAndRenderPublicCases();
      }
    });

    els.adminCasesList.appendChild(card);
  }
}

function renderAdminReportsList() {
  if (!els.adminReportsList) return;
  els.adminReportsList.innerHTML = '';

  if (state.adminReports.length === 0) {
    els.adminReportsList.innerHTML = '<div class="cases-empty-state">접수된 게시글 신고나 수정·삭제 요청이 없습니다.</div>';
    return;
  }

  for (const rep of state.adminReports) {
    const card = document.createElement('div');
    card.className = 'case-card';
    const createdStr = rep.created_at ? new Date(rep.created_at).toLocaleString('ko-KR') : '-';
    card.innerHTML = `
      <div class="case-card-header">
        <div class="case-badge-row">
          <span class="badge ${rep.status === 'open' ? 'badge-warn' : 'badge-available'}">${
            rep.status === 'open' ? '🚨 미처리 요청' : '✓ 처리 완료'
          }</span>
          <span class="badge badge-context">${escapeHtml(rep.request_type)}</span>
          <strong>대상 글: ${escapeHtml(rep.case_title || rep.case_id)}</strong>
        </div>
        <span class="case-meta-date">접수일시: ${escapeHtml(createdStr)}</span>
      </div>
      <p style="margin: 8px 0;"><strong>사유:</strong> ${escapeHtml(rep.reason)}</p>
      ${rep.contact_info ? `<p class="text-muted"><strong>연락처/비고:</strong> ${escapeHtml(rep.contact_info)}</p>` : ''}
      ${
        rep.status === 'open'
          ? `<div style="margin-top: 8px;">
              <button type="button" class="btn btn-secondary btn-sm" data-role="resolve-report-btn">✓ 요청 처리 완료로 표시</button>
            </div>`
          : ''
      }
    `;

    card.querySelector('[data-role="resolve-report-btn"]')?.addEventListener('click', async () => {
      const res = await adminResolveCaseReport(state.adminPasswordSession, rep.id);
      showAdminActionFeedback(res.ok ? 'success' : 'error', res.message || '처리되었습니다.');
      if (res.ok) {
        await loadAndRenderAdminDashboard();
      }
    });

    els.adminReportsList.appendChild(card);
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', init);
