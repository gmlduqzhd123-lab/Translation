/**
 * Built-in Browser Translator API Service
 * - Uses Chrome Built-in AI Translator API (self.Translator)
 * - No external translation API or server calls
 * - Preserves transient user activation when invoking Translator.create()
 */

export const SOURCE_LANGUAGE = {
  code: 'ko',
  label: '한국어',
  nativeLabel: '한국어'
};

export const TARGET_LANGUAGES = [
  {
    key: 'en',
    label: '영어',
    nativeLabel: 'English',
    candidates: ['en'],
    tier: 'core',
    sampleGreeting: 'English (영어)'
  },
  {
    key: 'zh-Hans',
    label: '중국어 간체',
    nativeLabel: '中文(简体)',
    candidates: ['zh-Hans', 'zh'],
    tier: 'core',
    sampleGreeting: '中文(简体) (중국어 간체)'
  },
  {
    key: 'vi',
    label: '베트남어',
    nativeLabel: 'Tiếng Việt',
    candidates: ['vi'],
    tier: 'core',
    sampleGreeting: 'Tiếng Việt (베트남어)'
  },
  {
    key: 'ja',
    label: '일본어',
    nativeLabel: '日本語',
    candidates: ['ja'],
    tier: 'core',
    sampleGreeting: '日本語 (일본어)'
  },
  {
    key: 'ru',
    label: '러시아어',
    nativeLabel: 'Русский',
    candidates: ['ru'],
    tier: 'core',
    sampleGreeting: 'Русский (러시아어)'
  },
  {
    key: 'uz',
    label: '우즈베크어',
    nativeLabel: 'Oʻzbekcha',
    candidates: ['uz'],
    tier: 'extended',
    sampleGreeting: 'Oʻzbekcha (우즈베크어)'
  },
  {
    key: 'mn',
    label: '몽골어',
    nativeLabel: 'Монгол',
    candidates: ['mn'],
    tier: 'extended',
    sampleGreeting: 'Монгол (몽골어)'
  },
  {
    key: 'th',
    label: '태국어',
    nativeLabel: 'ภาษาไทย',
    candidates: ['th'],
    tier: 'extended',
    sampleGreeting: 'ภาษาไทย (태국어)'
  },
  {
    key: 'km',
    label: '캄보디아어(크메르어)',
    nativeLabel: 'ភាសាខ្មែរ',
    candidates: ['km'],
    tier: 'extended',
    sampleGreeting: 'ភាសាខ្មែរ (캄보디아어)'
  },
  {
    key: 'tl',
    label: '필리핀어(타갈로그어)',
    nativeLabel: 'Tagalog / Filipino',
    candidates: ['tl', 'fil'],
    tier: 'extended',
    sampleGreeting: 'Tagalog (필리핀어)'
  }
];

export function getTargetLanguageMeta(key) {
  return TARGET_LANGUAGES.find((l) => l.key === key) || TARGET_LANGUAGES[0];
}

export function detectEnvironmentInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isMobile =
    (typeof navigator !== 'undefined' && navigator.userAgentData?.mobile === true) ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const isChrome = /Chrome\/\d+/i.test(ua) && !/Edg\/|OPR\//i.test(ua);
  const isSecure = typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false;

  const hasStandardTranslator =
    typeof self !== 'undefined' &&
    'Translator' in self &&
    typeof self.Translator?.availability === 'function' &&
    typeof self.Translator?.create === 'function';

  const hasLegacyTranslation =
    typeof self !== 'undefined' &&
    (('translation' in self && typeof self.translation?.createTranslator === 'function') ||
      Boolean(self.ai?.translator));

  return {
    userAgent: ua,
    isMobile,
    isChrome,
    isSecure,
    hasTranslatorApi: hasStandardTranslator || hasLegacyTranslation,
    apiVariant: hasStandardTranslator ? 'standard' : hasLegacyTranslation ? 'legacy' : 'none'
  };
}

/**
 * Runtime check for whether Korean -> targetKey is supported by the browser's built-in Translator API
 */
export async function checkLanguagePairSupport(targetKey) {
  const env = detectEnvironmentInfo();
  const langMeta = getTargetLanguageMeta(targetKey);

  if (!env.isSecure) {
    return {
      targetKey: langMeta.key,
      resolvedCode: langMeta.candidates[0],
      supported: false,
      status: 'insecure-context',
      badgeText: '보안 연결 필요',
      reason: '내장 Translator API는 HTTPS(GitHub Pages 등) 또는 localhost 보안 환경에서만 작동합니다.',
      actionHint: '수동 번역 입력으로 계속 진행하거나 HTTPS 배포 주소에서 접속해 주세요.'
    };
  }

  if (!env.hasTranslatorApi) {
    const mobileNote = env.isMobile
      ? '모바일 브라우저에서는 브라우저 내장 Translator API가 지원되지 않습니다.'
      : '현재 사용 중인 브라우저에 내장 Translator API(window.Translator)가 없습니다.';
    return {
      targetKey: langMeta.key,
      resolvedCode: langMeta.candidates[0],
      supported: false,
      status: 'api-missing',
      badgeText: '자동 번역 미지원 브라우저',
      reason: mobileNote,
      actionHint: '자동 번역을 사용하려면 데스크톱 Chrome 최신 버전을 사용해 주세요. 현재 브라우저에서도 수동 번역문 입력 및 파일 변환·다운로드는 모두 사용할 수 있습니다.'
    };
  }

  if (env.apiVariant === 'standard') {
    let lastError = null;
    for (const candidateCode of langMeta.candidates) {
      try {
        const availability = await self.Translator.availability({
          sourceLanguage: SOURCE_LANGUAGE.code,
          targetLanguage: candidateCode
        });

        if (availability === 'available' || availability === 'readily') {
          return {
            targetKey: langMeta.key,
            resolvedCode: candidateCode,
            supported: true,
            status: 'available',
            badgeText: '즉시 자동 번역 가능',
            reason: `한국어(ko) → ${langMeta.label}(${candidateCode}) 내장 번역 모델이 브라우저에 준비되어 있습니다.`,
            actionHint: '자동 번역 시작 버튼을 누르면 브라우저 안에서 즉시 번역 초안을 생성합니다.'
          };
        }

        if (availability === 'downloadable' || availability === 'after-download' || availability === 'downloading') {
          return {
            targetKey: langMeta.key,
            resolvedCode: candidateCode,
            supported: true,
            status: availability === 'downloading' ? 'downloading' : 'downloadable',
            badgeText: availability === 'downloading' ? '모델 다운로드 중' : '자동 번역 가능 (모델 다운로드 필요)',
            reason: `한국어(ko) → ${langMeta.label}(${candidateCode}) 자동 번역이 지원됩니다. 최초 실행 시 브라우저가 언어 모델을 다운로드합니다.`,
            actionHint: '자동 번역 시작 버튼을 클릭하면 모델 다운로드 후 번역 초안을 생성합니다.'
          };
        }
      } catch (err) {
        lastError = err;
      }
    }

    return {
      targetKey: langMeta.key,
      resolvedCode: langMeta.candidates[0],
      supported: false,
      status: 'unavailable',
      badgeText: '언어 조합 미지원',
      reason: lastError
        ? `한국어 → ${langMeta.label} 언어 조합 확인 중 오류가 발생했습니다 (${lastError.message}).`
        : `현재 브라우저 환경에서 한국어(ko) → ${langMeta.label} 내장 번역 모델을 사용할 수 없습니다.`,
      actionHint: '아래 [수동 입력으로 검토 단계 이동] 버튼을 눌러 번역문을 직접 입력하거나 수정할 수 있습니다.'
    };
  }

  // Legacy experimental fallback (window.translation / window.ai.translator)
  try {
    const api = self.translation || self.ai?.translator;
    const candidateCode = langMeta.candidates[0];
    if (typeof api.canTranslate === 'function') {
      const res = await api.canTranslate({
        sourceLanguage: SOURCE_LANGUAGE.code,
        targetLanguage: candidateCode
      });
      if (res && res !== 'no') {
        return {
          targetKey: langMeta.key,
          resolvedCode: candidateCode,
          supported: true,
          status: res === 'readily' ? 'available' : 'downloadable',
          badgeText: res === 'readily' ? '즉시 자동 번역 가능' : '자동 번역 가능 (모델 준비 필요)',
          reason: `한국어(ko) → ${langMeta.label}(${candidateCode}) 번역 API를 사용할 수 있습니다.`,
          actionHint: '자동 번역 시작 버튼을 눌러 번역 초안을 생성하세요.'
        };
      }
    }
  } catch {
    // Fall through
  }

  return {
    targetKey: langMeta.key,
    resolvedCode: langMeta.candidates[0],
    supported: false,
    status: 'unavailable',
    badgeText: '자동 번역 사용 불가',
    reason: `현재 브라우저에서 한국어 → ${langMeta.label} 자동 번역을 사용할 수 없습니다.`,
    actionHint: '수동 번역문 입력으로 다음 단계를 진행할 수 있습니다.'
  };
}

/**
 * Create a Translator instance synchronously from the user click handler
 * so transient user activation is preserved when status is "downloadable".
 */
export function startTranslatorCreation(resolvedTargetCode, onDownloadProgress) {
  const env = detectEnvironmentInfo();
  if (!env.hasTranslatorApi) {
    return Promise.reject(new Error('현재 브라우저에서 내장 Translator API를 지원하지 않습니다.'));
  }

  if (env.apiVariant === 'standard') {
    return self.Translator.create({
      sourceLanguage: SOURCE_LANGUAGE.code,
      targetLanguage: resolvedTargetCode,
      monitor(m) {
        if (m && typeof m.addEventListener === 'function') {
          m.addEventListener('downloadprogress', (e) => {
            const loaded = typeof e.loaded === 'number' ? e.loaded : 0;
            const total = typeof e.total === 'number' && e.total > 0 ? e.total : 1;
            const ratio = Math.min(1, Math.max(0, loaded / total));
            if (typeof onDownloadProgress === 'function') {
              onDownloadProgress(ratio, loaded, total);
            }
          });
        }
      }
    });
  }

  const api = self.translation || self.ai?.translator;
  return api.createTranslator({
    sourceLanguage: SOURCE_LANGUAGE.code,
    targetLanguage: resolvedTargetCode
  });
}

/**
 * Translate a single item text while preserving line breaks (\n)
 */
export async function translateSingleText(translator, sourceText) {
  const raw = String(sourceText ?? '');
  if (!raw.trim()) return raw;

  const lines = raw.split(/\r?\n/);
  if (lines.length === 1) {
    const out = await translator.translate(raw);
    return String(out ?? '').trim();
  }

  const translatedLines = [];
  for (const line of lines) {
    if (!line.trim()) {
      translatedLines.push('');
    } else {
      const res = await translator.translate(line);
      translatedLines.push(String(res ?? '').trim());
    }
  }
  return translatedLines.join('\n');
}
