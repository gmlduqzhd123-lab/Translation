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
  translateSingleText
} from './src/translator-service.js';

const state = {
  currentStep: 1,
  maxUnlockedStep: 1,
  parsedDoc: null,
  selectedLangKey: 'en',
  langSupportMap: new Map(),
  itemStates: new Map(), // id -> { draftText, finalText, verified, autoFailed, errorMessage }
  activeFilter: 'all',
  isTranslating: false,
  cancelTranslationRequested: false,
  hasUnsavedWork: false
};

// DOM Elements
const els = {};

function cacheElements() {
  els.stepperItems = document.querySelectorAll('.stepper-item');
  els.stepperBtns = document.querySelectorAll('.stepper-btn');
  els.stepPanels = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4'),
    5: document.getElementById('step-5')
  };

  // Manual Modal
  els.btnOpenManual = document.getElementById('btn-open-manual');
  els.btnOpenManualInline = document.getElementById('btn-open-manual-inline');
  els.manualModal = document.getElementById('manual-modal');
  els.btnCloseManual = document.getElementById('btn-close-manual');
  els.btnCloseManualBottom = document.getElementById('btn-close-manual-bottom');
  els.manualTabs = document.querySelectorAll('.modal-tab');
  els.manualTabPanels = document.querySelectorAll('.manual-tab-panel');
  els.detailsLegacyConvert = document.getElementById('details-legacy-convert');

  // Step 1
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
  els.languageOptionsGrid = document.getElementById('language-options-grid');
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

  // Step 4
  els.btnBackToStep3 = document.getElementById('btn-back-to-step3');
  els.btnBackToStep3Bottom = document.getElementById('btn-back-to-step3-bottom');
  els.btnToStep5 = document.getElementById('btn-to-step5');
  els.btnToStep5Bottom = document.getElementById('btn-to-step5-bottom');
  els.reviewTargetLangLabel = document.getElementById('review-target-lang-label');
  els.reviewTotalCount = document.getElementById('review-total-count');
  els.reviewVerifiedCount = document.getElementById('review-verified-count');
  els.reviewUnverifiedCount = document.getElementById('review-unverified-count');
  els.reviewEmptyCount = document.getElementById('review-empty-count');
  els.reviewFailedChip = document.getElementById('review-failed-chip');
  els.reviewFailedCount = document.getElementById('review-failed-count');
  els.filterBtns = document.querySelectorAll('.filter-btn');
  els.btnNextUnverified = document.getElementById('btn-next-unverified');
  els.btnFillEmptyWithSource = document.getElementById('btn-fill-empty-with-source');
  els.btnVerifyAllVisible = document.getElementById('btn-verify-all-visible');
  els.currentPositionIndicator = document.getElementById('current-position-indicator');
  els.reviewJumpNav = document.getElementById('review-jump-nav');
  els.reviewItemsContainer = document.getElementById('review-items-container');

  // Step 5
  els.btnBackToStep4 = document.getElementById('btn-back-to-step4');
  els.btnBackToStep4Bottom = document.getElementById('btn-back-to-step4-bottom');
  els.btnRestartNewFile = document.getElementById('btn-restart-new-file');
  els.finalOutputFilename = document.getElementById('final-output-filename');
  els.finalTargetLang = document.getElementById('final-target-lang');
  els.finalVerifiedSummary = document.getElementById('final-verified-summary');
  els.finalUnverifiedSummary = document.getElementById('final-unverified-summary');
  els.finalEmptySummary = document.getElementById('final-empty-summary');
  els.finalModifiedSummary = document.getElementById('final-modified-summary');
  els.downloadWarningsPanel = document.getElementById('download-warnings-panel');
  els.emptyHandlingBox = document.getElementById('empty-handling-box');
  els.downloadErrorBox = document.getElementById('download-error-box');
  els.downloadErrorTitle = document.getElementById('download-error-title');
  els.downloadErrorMessage = document.getElementById('download-error-message');
  els.downloadErrorAction = document.getElementById('download-error-action');
  els.btnDownloadFile = document.getElementById('btn-download-file');
  els.downloadSuccessMsg = document.getElementById('download-success-msg');
}

function init() {
  cacheElements();
  checkMobileBanner();
  bindEvents();
  renderLanguageCards();
  refreshAllLanguageSupport();
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
  });

  // Stepper navigation
  els.stepperBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.getAttribute('data-step-target'), 10);
      if (target <= state.maxUnlockedStep && !state.isTranslating) {
        goToStep(target);
      }
    });
  });

  // Step 1: Upload & Drag-Drop & Keyboard
  els.btnSelectFile.addEventListener('click', (e) => {
    e.stopPropagation();
    els.fileInput.click();
  });

  els.dropZone.addEventListener('click', (e) => {
    if (e.target === els.btnSelectFile) return;
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
    unlockAndGoToStep(4);
  });
  els.btnCancelTranslation.addEventListener('click', () => {
    state.cancelTranslationRequested = true;
  });

  // Step 4 buttons
  const backToStep3 = () => goToStep(3);
  const forwardToStep5 = () => unlockAndGoToStep(5);
  els.btnBackToStep3.addEventListener('click', backToStep3);
  els.btnBackToStep3Bottom.addEventListener('click', backToStep3);
  els.btnToStep5.addEventListener('click', forwardToStep5);
  els.btnToStep5Bottom.addEventListener('click', forwardToStep5);

  els.filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeFilter = btn.getAttribute('data-filter') || 'all';
      els.filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
      applyReviewFilter();
    });
  });

  els.btnNextUnverified?.addEventListener('click', jumpToNextUnverified);

  els.btnFillEmptyWithSource.addEventListener('click', () => {
    if (!state.parsedDoc) return;
    let changed = 0;
    for (const item of state.parsedDoc.items) {
      const st = state.itemStates.get(item.id);
      if (st && st.finalText.trim().length === 0) {
        st.finalText = item.sourceText;
        changed++;
      }
    }
    if (changed > 0) {
      state.hasUnsavedWork = true;
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
    renderReviewStep();
  });

  // Step 5 buttons
  els.btnBackToStep4.addEventListener('click', () => goToStep(4));
  els.btnBackToStep4Bottom.addEventListener('click', () => goToStep(4));
  els.btnRestartNewFile.addEventListener('click', () => {
    if (
      state.hasUnsavedWork &&
      !window.confirm('새 파일을 불러오면 현재 편집 중인 번역 내용이 초기화됩니다. 계속하시겠습니까?')
    ) {
      return;
    }
    state.hasUnsavedWork = false;
    state.parsedDoc = null;
    state.itemStates.clear();
    state.maxUnlockedStep = 1;
    goToStep(1);
  });

  els.btnDownloadFile.addEventListener('click', handleDownloadTranslatedFile);
}

function unlockAndGoToStep(stepNum) {
  if (stepNum > state.maxUnlockedStep) {
    state.maxUnlockedStep = stepNum;
  }
  goToStep(stepNum);
}

function goToStep(stepNum) {
  state.currentStep = stepNum;
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
        '정상적인 .pptx 또는 .hwpx 파일인지 확인한 후 다시 시도해 주세요.'
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
        '페이지를 새로고침하거나 직접 .pptx·.hwpx 파일을 선택해 주세요.'
      );
    }
  }
}

async function processLoadedBuffer(fileName, arrayBuffer) {
  const parsed = await extractDocumentFromBuffer(fileName, arrayBuffer);
  state.parsedDoc = parsed;
  state.itemStates.clear();
  for (const item of parsed.items) {
    state.itemStates.set(item.id, {
      draftText: null,
      finalText: '',
      verified: false,
      autoFailed: false,
      errorMessage: null
    });
  }
  state.activeFilter = 'all';
  state.hasUnsavedWork = parsed.items.length > 0;
  state.maxUnlockedStep = parsed.items.length > 0 ? 3 : 2;
  els.translationResultAlert.classList.add('hidden');
  els.translationProgressPanel.classList.add('hidden');
  goToStep(2);
}

/* ==================== STEP 2: EXTRACT RESULTS ==================== */

function renderExtractStep() {
  const doc = state.parsedDoc;
  if (!doc) return;

  els.extractFileName.textContent = doc.fileName;
  els.extractFileTypeBadge.textContent =
    doc.fileType === 'pptx' ? 'PPTX (PowerPoint)' : 'HWPX (한글 표준 문서)';
  els.extractUnitLabel.textContent = doc.fileType === 'pptx' ? '전체 슬라이드 수' : '전체 섹션 수';
  els.extractUnitCount.textContent =
    doc.fileType === 'pptx' ? `${doc.unitCount}장` : `${doc.sectionCount || 1}개 섹션`;
  els.extractItemCount.textContent = `${doc.items.length}개`;

  const hasItems = doc.items.length > 0;
  els.extractEmptyBox.classList.toggle('hidden', hasItems);
  els.btnToStep3.disabled = !hasItems;
  els.btnToStep3Bottom.disabled = !hasItems;

  els.extractListContainer.innerHTML = '';
  if (!hasItems) return;

  if (doc.fileType === 'pptx') {
    const slideGroups = new Map();
    for (const item of doc.items) {
      if (!slideGroups.has(item.groupNumber)) {
        slideGroups.set(item.groupNumber, []);
      }
      slideGroups.get(item.groupNumber).push(item);
    }

    for (const [slideNum, items] of slideGroups.entries()) {
      const card = document.createElement('div');
      card.className = 'extract-group-card';

      const header = document.createElement('div');
      header.className = 'extract-group-header';
      header.innerHTML = `<span>슬라이드 ${slideNum}</span><span>추출 문장 ${items.length}개</span>`;
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

function renderLanguageCards() {
  els.languageOptionsGrid.innerHTML = '';
  for (const lang of TARGET_LANGUAGES) {
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
      <div class="lang-name-native" lang="${escapeHtml(lang.key)}">${escapeHtml(lang.nativeLabel)} (${escapeHtml(lang.candidates[0])})</div>
    `;

    const radio = label.querySelector('input[type="radio"]');
    radio.addEventListener('change', () => {
      if (state.isTranslating) return;
      state.selectedLangKey = lang.key;
      document.querySelectorAll('.lang-option-card').forEach((c) => {
        c.classList.toggle('selected', c.getAttribute('data-lang-key') === lang.key);
      });
      updateSelectedLanguageStatusUI();
    });

    els.languageOptionsGrid.appendChild(label);
  }
}

async function refreshAllLanguageSupport() {
  for (const lang of TARGET_LANGUAGES) {
    const info = await checkLanguagePairSupport(lang.key);
    state.langSupportMap.set(lang.key, info);
    const cardBadge = document.getElementById(`lang-card-badge-${lang.key}`);
    if (cardBadge) {
      cardBadge.textContent = info.supported
        ? info.status === 'available'
          ? '자동 번역 가능'
          : '모델 다운로드 가능'
        : '수동 입력 전용';
      cardBadge.className = `badge ${
        info.supported
          ? info.status === 'available'
            ? 'badge-available'
            : 'badge-downloadable'
          : 'badge-unavailable'
      }`;
    }
  }
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
        ? '브라우저 내장 번역 모델이 준비되어 있어 즉시 번역 초안을 생성합니다.'
        : '최초 실행 시 브라우저가 언어 모델을 다운로드한 뒤 자동으로 번역 초안을 생성합니다.';
  } else {
    els.btnStartAutoTranslate.textContent = `자동 번역 사용 불가 (${langMeta.label})`;
    els.autoTranslateHelper.textContent =
      '현재 브라우저 또는 언어 조합은 자동 번역을 지원하지 않습니다. 오른쪽 [직접 번역문 입력하기] 버튼을 눌러 계속 작업하세요.';
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
  try {
    translator = await translatorPromise;
  } catch (err) {
    state.isTranslating = false;
    els.btnStartAutoTranslate.disabled = false;
    els.btnSkipToManual.disabled = false;
    els.translationProgressPanel.classList.add('hidden');

    showTranslationAlert(
      'error',
      `자동 번역 모델을 준비하지 못했습니다 (${err?.name || '오류'})`,
      `원인: ${err?.message || '브라우저에서 번역 모델 생성을 거부했거나 다운로드에 실패했습니다.'}`,
      '우측의 [직접 번역문 입력하기] 버튼을 눌러 직접 번역문을 입력해 작업을 계속할 수 있습니다.'
    );
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let idx = 0; idx < total; idx++) {
    if (state.cancelTranslationRequested) {
      break;
    }

    const item = items[idx];
    const itemState = state.itemStates.get(item.id);
    els.translationProgressTitle.textContent = `한국어 → ${langMeta.label} 번역 초안 생성 중...`;
    els.itemTranslateCurrentLabel.textContent = `${item.locationLabel} (${item.contextLabel}) 번역 중`;
    els.translationProgressCounts.textContent = `${idx + 1} / ${total}`;

    try {
      const translated = await translateSingleText(translator, item.sourceText);
      itemState.draftText = translated;
      itemState.finalText = translated;
      itemState.verified = false; // Never auto-mark as verified
      itemState.autoFailed = false;
      itemState.errorMessage = null;
      successCount++;
    } catch (itemErr) {
      itemState.autoFailed = true;
      itemState.errorMessage = itemErr?.message || '자동 번역 실패';
      failCount++;
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

  state.isTranslating = false;
  state.hasUnsavedWork = true;
  els.btnStartAutoTranslate.disabled = false;
  els.btnSkipToManual.disabled = false;

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
      '다음 단계(번역 검토)에서 실패 표시된 항목의 번역문을 직접 입력해 주세요.'
    );
  } else {
    showTranslationAlert(
      'success',
      `자동 번역 초안 생성 완료 (${successCount}개 항목)`,
      `모든 항목의 ${langMeta.label} 번역 초안이 생성되었습니다. 아직 ‘미검토’ 상태이므로 내용을 확인하고 수정해 주세요.`,
      '번역 검토 화면으로 이동합니다.'
    );
  }

  unlockAndGoToStep(4);
}

function showTranslationAlert(type, title, message, actionHint) {
  els.translationResultAlert.className = `alert-box alert-${type}`;
  els.translationResultAlert.innerHTML = `
    <div class="alert-title">${escapeHtml(title)}</div>
    <p class="alert-message">${escapeHtml(message)}</p>
    ${actionHint ? `<p class="alert-action">${escapeHtml(actionHint)}</p>` : ''}
  `;
  els.translationResultAlert.classList.remove('hidden');
}

/* ==================== STEP 4: TRANSLATION REVIEW ==================== */

function autoResizeTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  const nextHeight = Math.max(92, textarea.scrollHeight + 4);
  textarea.style.height = `${nextHeight}px`;
}

function jumpToNextUnverified() {
  if (!state.parsedDoc) return;
  for (const item of state.parsedDoc.items) {
    const st = state.itemStates.get(item.id);
    if (st && !st.verified) {
      focusReviewItem(item.id);
      return;
    }
  }
}

function getItemOriginStatus(st) {
  const trimmed = (st.finalText || '').trim();
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

function computeReviewCounters() {
  if (!state.parsedDoc) {
    return { total: 0, verified: 0, unverified: 0, empty: 0, modified: 0, failed: 0 };
  }
  let verified = 0;
  let empty = 0;
  let modified = 0;
  let failed = 0;

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
  }

  const total = state.parsedDoc.items.length;
  return {
    total,
    verified,
    unverified: total - verified,
    empty,
    modified,
    failed
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
  els.reviewFailedCount.textContent = `${c.failed}개`;
  els.reviewFailedChip.classList.toggle('hidden', c.failed === 0);
}

function renderReviewJumpNav() {
  els.reviewJumpNav.innerHTML = '';
  const doc = state.parsedDoc;
  if (!doc || doc.items.length === 0) return;

  if (doc.fileType === 'pptx') {
    const slides = [...new Set(doc.items.map((it) => it.groupNumber))];
    for (const sNum of slides) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jump-btn';
      btn.textContent = `슬라이드 ${sNum}`;
      btn.addEventListener('click', () => {
        const firstCard = els.reviewItemsContainer.querySelector(
          `.review-card[data-group-num="${sNum}"]:not(.hidden)`
        );
        if (firstCard) {
          firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          els.currentPositionIndicator.textContent = `현재 위치: 슬라이드 ${sNum}`;
        }
      });
      els.reviewJumpNav.appendChild(btn);
    }
  } else {
    const items = doc.items;
    const stepSize = items.length > 20 ? 10 : 1;
    for (let i = 0; i < items.length; i += stepSize) {
      const startNum = items[i].groupNumber;
      const endNum = items[Math.min(items.length - 1, i + stepSize - 1)].groupNumber;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jump-btn';
      btn.textContent = stepSize === 1 ? `문단 ${startNum}` : `문단 ${startNum}~${endNum}`;
      btn.addEventListener('click', () => {
        const targetCard = els.reviewItemsContainer.querySelector(
          `.review-card[data-item-id="${items[i].id}"]`
        );
        if (targetCard && !targetCard.classList.contains('hidden')) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          els.currentPositionIndicator.textContent = `현재 위치: ${items[i].locationLabel}`;
        }
      });
      els.reviewJumpNav.appendChild(btn);
    }
  }
}

function renderReviewStep() {
  if (!state.parsedDoc) return;
  updateReviewCountersUI();
  renderReviewJumpNav();

  els.reviewItemsContainer.innerHTML = '';
  const langMeta = getTargetLanguageMeta(state.selectedLangKey);

  for (const item of state.parsedDoc.items) {
    const st = state.itemStates.get(item.id);
    const origin = getItemOriginStatus(st);
    const isEmpty = st.finalText.trim().length === 0;

    const card = document.createElement('article');
    card.className = `review-card${st.verified ? ' verified' : ''}${isEmpty ? ' is-empty' : ''}`;
    card.setAttribute('data-item-id', item.id);
    card.setAttribute('data-group-num', String(item.groupNumber));
    card.setAttribute('data-location-label', item.locationLabel);

    card.innerHTML = `
      <div class="review-card-header">
        <div class="review-meta-left">
          <span class="location-badge">${escapeHtml(item.locationLabel)}</span>
          <span class="badge badge-context">${escapeHtml(item.contextLabel)}</span>
          <span class="origin-badge ${origin.cssClass}" data-role="origin-badge">${escapeHtml(origin.label)}</span>
        </div>
        <div class="review-meta-right">
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
            <span>한국어 원문</span>
            <button type="button" class="link-btn" data-role="copy-source-btn" title="한국어 원문을 오른쪽 번역 입력칸에 그대로 복사합니다">
              원문 → 번역칸 복사
            </button>
          </div>
          <div class="source-text-box" lang="ko">${escapeHtml(item.sourceText)}</div>
        </div>

        <div class="review-col">
          <div class="review-col-header">
            <label for="textarea-${item.id}">${escapeHtml(langMeta.label)} 번역문 편집 <small class="text-muted">(Ctrl+Enter: 확인 완료)</small></label>
            <span data-role="char-count" class="text-muted">${st.finalText.length}자</span>
          </div>
          <textarea
            id="textarea-${item.id}"
            class="translation-textarea"
            lang="${escapeHtml(langMeta.key)}"
            placeholder="${escapeHtml(langMeta.label)} 번역문을 입력하거나 수정하세요..."
          ></textarea>
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
    const copySourceBtn = card.querySelector('[data-role="copy-source-btn"]');
    const restoreDraftBtn = card.querySelector('[data-role="restore-draft-btn"]');

    textarea.addEventListener('focus', () => {
      els.currentPositionIndicator.textContent = `현재 위치: ${item.locationLabel} (${item.contextLabel})`;
    });

    textarea.addEventListener('input', () => {
      st.finalText = textarea.value;
      state.hasUnsavedWork = true;
      autoResizeTextarea(textarea);
      syncSingleCardUI(card, item, st);
      updateReviewCountersUI();
    });

    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        st.verified = true;
        state.hasUnsavedWork = true;
        syncSingleCardUI(card, item, st);
        updateReviewCountersUI();
        jumpToNextUnverified();
      }
    });

    verifyBtn.addEventListener('click', () => {
      st.verified = !st.verified;
      state.hasUnsavedWork = true;
      syncSingleCardUI(card, item, st);
      updateReviewCountersUI();
      if (state.activeFilter !== 'all') {
        applyReviewFilter();
      }
    });

    copySourceBtn.addEventListener('click', () => {
      st.finalText = item.sourceText;
      textarea.value = st.finalText;
      state.hasUnsavedWork = true;
      autoResizeTextarea(textarea);
      syncSingleCardUI(card, item, st);
      updateReviewCountersUI();
    });

    if (restoreDraftBtn) {
      restoreDraftBtn.addEventListener('click', () => {
        if (st.draftText !== null) {
          st.finalText = st.draftText;
          textarea.value = st.finalText;
          state.hasUnsavedWork = true;
          autoResizeTextarea(textarea);
          syncSingleCardUI(card, item, st);
          updateReviewCountersUI();
        }
      });
    }

    els.reviewItemsContainer.appendChild(card);
    autoResizeTextarea(textarea);
  }

  applyReviewFilter();
}

function syncSingleCardUI(card, item, st) {
  const isEmpty = st.finalText.trim().length === 0;
  const origin = getItemOriginStatus(st);

  card.classList.toggle('verified', st.verified);
  card.classList.toggle('is-empty', isEmpty);

  const originBadge = card.querySelector('[data-role="origin-badge"]');
  if (originBadge) {
    originBadge.textContent = origin.label;
    originBadge.className = `origin-badge ${origin.cssClass}`;
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

  cards.forEach((card) => {
    const id = card.getAttribute('data-item-id');
    const st = state.itemStates.get(id);
    if (!st) return;

    const isEmpty = st.finalText.trim().length === 0;
    const isModified =
      (st.draftText !== null && st.finalText !== st.draftText && !isEmpty) ||
      (st.draftText === null && !isEmpty);
    const isFailed = st.autoFailed && isEmpty;

    let visible = true;
    if (filter === 'unverified') visible = !st.verified;
    else if (filter === 'empty') visible = isEmpty;
    else if (filter === 'modified') visible = isModified;
    else if (filter === 'failed') visible = isFailed;

    card.classList.toggle('hidden', !visible);
  });
}

export function focusReviewItem(itemId) {
  state.activeFilter = 'all';
  els.filterBtns.forEach((b) =>
    b.classList.toggle('active', b.getAttribute('data-filter') === 'all')
  );
  goToStep(4);
  setTimeout(() => {
    const card = els.reviewItemsContainer.querySelector(`.review-card[data-item-id="${itemId}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const ta = card.querySelector('textarea');
      if (ta) ta.focus();
    }
  }, 60);
}

/* ==================== STEP 5: FINAL CHECK & DOWNLOAD ==================== */

function renderDownloadStep() {
  if (!state.parsedDoc) return;
  els.downloadErrorBox.classList.add('hidden');
  els.downloadSuccessMsg.classList.add('hidden');

  const doc = state.parsedDoc;
  const langMeta = getTargetLanguageMeta(state.selectedLangKey);
  const c = computeReviewCounters();
  const outName = buildOutputFileName(doc.fileName, langMeta.key, doc.fileType);

  els.finalOutputFilename.textContent = outName;
  els.finalTargetLang.textContent = `${langMeta.label} (${langMeta.nativeLabel})`;
  els.finalVerifiedSummary.textContent = `${c.verified} / ${c.total}개`;
  els.finalUnverifiedSummary.textContent = `${c.unverified}개`;
  els.finalUnverifiedSummary.className = `final-stat-value ${c.unverified > 0 ? 'text-warn' : 'text-ok'}`;
  els.finalEmptySummary.textContent = `${c.empty}개`;
  els.finalEmptySummary.className = `final-stat-value ${c.empty > 0 ? 'text-danger' : 'text-ok'}`;
  els.finalModifiedSummary.textContent = `${c.modified}개`;

  els.emptyHandlingBox.classList.toggle('hidden', c.empty === 0);
  els.btnDownloadFile.textContent = `📥 번역된 ${doc.fileType.toUpperCase()} 파일 다운로드 (${outName})`;

  els.downloadWarningsPanel.innerHTML = '';

  const emptyItems = doc.items.filter((it) => {
    const st = state.itemStates.get(it.id);
    return !st || st.finalText.trim().length === 0;
  });

  const unverifiedItems = doc.items.filter((it) => {
    const st = state.itemStates.get(it.id);
    return !st || !st.verified;
  });

  if (emptyItems.length === 0 && unverifiedItems.length === 0) {
    const okBox = document.createElement('div');
    okBox.className = 'alert-box alert-success';
    okBox.innerHTML = `
      <div class="alert-title">✅ 모든 문장의 번역 입력과 확인이 완료되었습니다!</div>
      <p class="alert-message">총 ${c.total}개 문장 모두 번역문이 입력되었고 ‘확인 완료’로 표시되었습니다. 아래 다운로드 버튼을 눌러 결과 파일을 저장하세요.</p>
    `;
    els.downloadWarningsPanel.appendChild(okBox);
    return;
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

async function handleDownloadTranslatedFile() {
  if (!state.parsedDoc) return;
  els.downloadErrorBox.classList.add('hidden');
  els.downloadSuccessMsg.classList.add('hidden');
  els.btnDownloadFile.disabled = true;

  try {
    const doc = state.parsedDoc;
    const langMeta = getTargetLanguageMeta(state.selectedLangKey);
    const outName = buildOutputFileName(doc.fileName, langMeta.key, doc.fileType);

    const fallbackRadio = document.querySelector('input[name="empty-fallback-mode"]:checked');
    const emptyFallback = fallbackRadio ? fallbackRadio.value : 'keep-source';

    const translationsMap = {};
    for (const item of doc.items) {
      const st = state.itemStates.get(item.id);
      translationsMap[item.id] = st ? st.finalText : '';
    }

    const uint8 = await buildTranslatedDocument(doc, translationsMap, { emptyFallback });
    if (!uint8 || uint8.byteLength < 100) {
      throw new DocumentProcessError(
        '생성된 파일 데이터가 비정상적입니다',
        '결과 문서 패키지의 크기가 너무 작거나 비어 있어 다운로드를 중단했습니다.',
        '원본 파일을 다시 업로드한 후 시도해 주세요.',
        'INVALID_OUTPUT_SIZE'
      );
    }

    const mimeType =
      doc.fileType === 'pptx'
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : 'application/hwp+zip';

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
    els.downloadSuccessMsg.textContent = `✓ ${outName} 파일이 저장되었습니다! PowerPoint 또는 한글에서 열어 글자 넘침과 배치를 꼭 확인해 주세요.`;
    els.downloadSuccessMsg.classList.remove('hidden');
  } catch (err) {
    els.downloadErrorTitle.textContent =
      err instanceof DocumentProcessError ? err.title : '결과 파일 생성 중 오류가 발생했습니다';
    els.downloadErrorMessage.textContent =
      err?.message || '번역문을 문서 구조에 반영하는 중 문제가 발생하여 다운로드를 차단했습니다.';
    els.downloadErrorAction.textContent =
      err instanceof DocumentProcessError && err.actionHint
        ? `해결 방법: ${err.actionHint}`
        : '해결 방법: 원본 파일을 다시 업로드하거나 특수 제어 문자가 포함되었는지 확인해 주세요.';
    els.downloadErrorBox.classList.remove('hidden');
  } finally {
    els.btnDownloadFile.disabled = false;
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
