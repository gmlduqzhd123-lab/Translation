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
  // 1위: 베트남
  {
    key: 'vi',
    label: '베트남어',
    nativeLabel: 'Tiếng Việt',
    candidates: ['vi'],
    speechLang: 'vi-VN',
    tier: 'core',
    sampleGreeting: 'Tiếng Việt (베트남어)'
  },
  // 2위·4위: 중국 / 중국(한국계)
  {
    key: 'zh-Hans',
    label: '중국어 간체',
    nativeLabel: '中文(简体)',
    candidates: ['zh-Hans', 'zh-CN', 'zh'],
    speechLang: 'zh-CN',
    tier: 'core',
    sampleGreeting: '中文(简体) (중국어 간체)'
  },
  // 3위: 필리핀
  {
    key: 'tl',
    label: '필리핀어(타갈로그어)',
    nativeLabel: 'Tagalog / Filipino',
    candidates: ['tl', 'fil'],
    speechLang: 'fil-PH',
    tier: 'core',
    sampleGreeting: 'Tagalog (필리핀어)'
  },
  // 5위: 캄보디아
  {
    key: 'km',
    label: '캄보디아어(크메르어)',
    nativeLabel: 'ភាសាខ្មែរ',
    candidates: ['km'],
    speechLang: 'km-KH',
    tier: 'core',
    sampleGreeting: 'ភាសាខ្មែរ (캄보디아어)'
  },
  // 6위·11위: 러시아·중앙아시아(한국계) / 러시아
  {
    key: 'ru',
    label: '러시아어',
    nativeLabel: 'Русский',
    candidates: ['ru'],
    speechLang: 'ru-RU',
    tier: 'core',
    sampleGreeting: 'Русский (러시아어)'
  },
  // 7위: 중앙아시아 (우즈베크어 · 카자흐어 · 키르기스어)
  {
    key: 'uz',
    label: '우즈베크어',
    nativeLabel: 'Oʻzbekcha',
    candidates: ['uz'],
    speechLang: 'uz-UZ',
    tier: 'extended',
    sampleGreeting: 'Oʻzbekcha (우즈베크어)'
  },
  {
    key: 'kk',
    label: '카자흐어',
    nativeLabel: 'Қазақша',
    candidates: ['kk'],
    speechLang: 'kk-KZ',
    tier: 'extended',
    sampleGreeting: 'Қазақша (카자흐어)'
  },
  {
    key: 'ky',
    label: '키르기스어',
    nativeLabel: 'Кыргызча',
    candidates: ['ky'],
    speechLang: 'ky-KG',
    tier: 'extended',
    sampleGreeting: 'Кыргызча (키르기스어)'
  },
  // 9위: 일본
  {
    key: 'ja',
    label: '일본어',
    nativeLabel: '日本語',
    candidates: ['ja'],
    speechLang: 'ja-JP',
    tier: 'extended',
    sampleGreeting: '日本語 (일본어)'
  },
  // 10위: 몽골
  {
    key: 'mn',
    label: '몽골어',
    nativeLabel: 'Монгол',
    candidates: ['mn'],
    speechLang: 'mn-MN',
    tier: 'extended',
    sampleGreeting: 'Монгол (몽골어)'
  },
  // 12위: 태국
  {
    key: 'th',
    label: '태국어',
    nativeLabel: 'ภาษาไทย',
    candidates: ['th'],
    speechLang: 'th-TH',
    tier: 'extended',
    sampleGreeting: 'ภาษาไทย (태국어)'
  },
  // 13위: 미국
  {
    key: 'en',
    label: '영어',
    nativeLabel: 'English',
    candidates: ['en'],
    speechLang: 'en-US',
    tier: 'extended',
    sampleGreeting: 'English (영어)'
  },
  // 14위: 유럽 (스페인어 · 프랑스어 · 포르투갈어 · 튀르키예어)
  {
    key: 'es',
    label: '스페인어',
    nativeLabel: 'Español',
    candidates: ['es'],
    speechLang: 'es-ES',
    tier: 'extended',
    sampleGreeting: 'Español (스페인어)'
  },
  {
    key: 'fr',
    label: '프랑스어',
    nativeLabel: 'Français',
    candidates: ['fr'],
    speechLang: 'fr-FR',
    tier: 'extended',
    sampleGreeting: 'Français (프랑스어)'
  },
  {
    key: 'pt',
    label: '포르투갈어',
    nativeLabel: 'Português',
    candidates: ['pt'],
    speechLang: 'pt-BR',
    tier: 'extended',
    sampleGreeting: 'Português (포르투갈어)'
  },
  {
    key: 'tr',
    label: '튀르키예어',
    nativeLabel: 'Türkçe',
    candidates: ['tr'],
    speechLang: 'tr-TR',
    tier: 'extended',
    sampleGreeting: 'Türkçe (튀르키예어)'
  },
  // 15위: 중동
  {
    key: 'ar',
    label: '아랍어',
    nativeLabel: 'العربية',
    candidates: ['ar'],
    speechLang: 'ar-SA',
    dir: 'rtl',
    tier: 'extended',
    sampleGreeting: 'العربية (아랍어)'
  },
  // 16위: 대만
  {
    key: 'zh-Hant',
    label: '중국어 번체',
    nativeLabel: '中文(繁體)',
    candidates: ['zh-Hant', 'zh-TW', 'zh-HK'],
    speechLang: 'zh-TW',
    tier: 'extended',
    sampleGreeting: '中文(繁體) (중국어 번체)'
  },
  // 18위: 인도네시아
  {
    key: 'id',
    label: '인도네시아어',
    nativeLabel: 'Bahasa Indonesia',
    candidates: ['id', 'in'],
    speechLang: 'id-ID',
    tier: 'extended',
    sampleGreeting: 'Bahasa Indonesia (인도네시아어)'
  },
  // 기타 지역 (미얀마 · 네팔 · 스리랑카 · 인도 · 방글라데시 · 파키스탄)
  {
    key: 'my',
    label: '미얀마어(버마어)',
    nativeLabel: 'မြန်မာဘာသာ',
    candidates: ['my'],
    speechLang: 'my-MM',
    tier: 'extended',
    sampleGreeting: 'မြန်မာဘာသာ (미얀마어)'
  },
  {
    key: 'ne',
    label: '네팔어',
    nativeLabel: 'नेपाली',
    candidates: ['ne'],
    speechLang: 'ne-NP',
    tier: 'extended',
    sampleGreeting: 'नेपाली (네팔어)'
  },
  {
    key: 'si',
    label: '스리랑카어(신할라어)',
    nativeLabel: 'සිංහල',
    candidates: ['si'],
    speechLang: 'si-LK',
    tier: 'extended',
    sampleGreeting: 'සිංහල (신할라어)'
  },
  {
    key: 'hi',
    label: '힌디어(인도)',
    nativeLabel: 'हिन्दी',
    candidates: ['hi'],
    speechLang: 'hi-IN',
    tier: 'extended',
    sampleGreeting: 'हिन्दी (힌디어)'
  },
  {
    key: 'bn',
    label: '벵골어(방글라데시)',
    nativeLabel: 'বাংলা',
    candidates: ['bn'],
    speechLang: 'bn-BD',
    tier: 'extended',
    sampleGreeting: 'বাংলা (벵골어)'
  },
  {
    key: 'ur',
    label: '파키스탄어(우르두어)',
    nativeLabel: 'اردو',
    candidates: ['ur'],
    speechLang: 'ur-PK',
    dir: 'rtl',
    tier: 'extended',
    sampleGreeting: 'اردو (우르두어)'
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
  if (!api) return Promise.reject(new Error('레거시 번역 API를 찾을 수 없습니다.'));
  return api.createTranslator({
    sourceLanguage: SOURCE_LANGUAGE.code,
    targetLanguage: resolvedTargetCode
  });
}

/**
 * Create a Reverse Translator instance (foreign targetLanguage -> Korean 'ko')
 * synchronously from a user click handler so teachers can verify meaning in Korean.
 */
export function startReverseTranslatorCreation(resolvedSourceCode, onDownloadProgress) {
  const env = detectEnvironmentInfo();
  if (!env.hasTranslatorApi) {
    return Promise.reject(new Error('현재 브라우저에서 내장 역번역 API를 지원하지 않습니다.'));
  }

  if (env.apiVariant === 'standard') {
    return self.Translator.create({
      sourceLanguage: resolvedSourceCode,
      targetLanguage: SOURCE_LANGUAGE.code,
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
  if (!api) return Promise.reject(new Error('레거시 역번역 API를 찾을 수 없습니다.'));
  return api.createTranslator({
    sourceLanguage: resolvedSourceCode,
    targetLanguage: SOURCE_LANGUAGE.code
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

let activeTtsResetCallback = null;

/**
 * Speak foreign text using browser-native Web Speech API (window.speechSynthesis)
 */
export function speakTextWithBrowserTTS(text, langKey, onStateChange, forceStop = false) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (typeof onStateChange === 'function') onStateChange('unsupported');
    return false;
  }
  const synth = window.speechSynthesis;

  if (forceStop && synth.speaking) {
    synth.cancel();
    if (typeof activeTtsResetCallback === 'function') {
      const prev = activeTtsResetCallback;
      activeTtsResetCallback = null;
      prev('idle');
    }
    if (typeof onStateChange === 'function') onStateChange('idle');
    return false;
  }

  const trimmed = String(text ?? '').trim();
  if (!trimmed) {
    if (typeof onStateChange === 'function') onStateChange('empty');
    return false;
  }

  if (synth.speaking) {
    synth.cancel();
  }
  if (typeof activeTtsResetCallback === 'function') {
    const prev = activeTtsResetCallback;
    activeTtsResetCallback = null;
    prev('idle');
  }

  const langMeta = getTargetLanguageMeta(langKey);
  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.lang = langMeta.speechLang || langMeta.candidates[0] || 'en-US';
  utter.rate = 0.95;

  activeTtsResetCallback = onStateChange || null;
  if (typeof onStateChange === 'function') {
    onStateChange('speaking');
  }
  utter.onend = () => {
    if (activeTtsResetCallback === onStateChange) {
      activeTtsResetCallback = null;
    }
    if (typeof onStateChange === 'function') onStateChange('idle');
  };
  utter.onerror = () => {
    if (activeTtsResetCallback === onStateChange) {
      activeTtsResetCallback = null;
    }
    if (typeof onStateChange === 'function') onStateChange('idle');
  };

  synth.speak(utter);
  return true;
}


