/**
 * School & Classroom Multilingual Glossary + Non-translatable Text Detector
 * - Supports 10 languages: en, zh-Hans, vi, ja, ru, uz, mn, th, km, tl
 * - Used for:
 *   1. Suggesting accurate school terminology per item in Step 4
 *   2. Bulk-applying glossary terms across the document
 *   3. Custom teacher glossary entries persisted in localStorage
 *   4. Auto-detecting numbers/dates/symbols that should keep source text
 */

const CUSTOM_GLOSSARY_STORAGE_KEY = 'lesson_translator_custom_glossary_v1';

export const BUILTIN_SCHOOL_GLOSSARY = [
  {
    ko: '학습 목표',
    category: '수업 단계',
    translations: {
      en: 'Learning Objectives',
      'zh-Hans': '学习目标',
      vi: 'Mục tiêu học tập',
      ja: '学習目標',
      ru: 'Цели урока',
      uz: 'Dars maqsadi',
      mn: 'Суралцах зорилго',
      th: 'จุดประสงค์การเรียนรู้',
      km: 'វត្ថុបំណងនៃការរៀន',
      tl: 'Mga Layunin sa Pagkatuto'
    }
  },
  {
    ko: '준비물',
    category: '수업 준비',
    translations: {
      en: 'Materials Needed',
      'zh-Hans': '准备物品',
      vi: 'Đồ dùng chuẩn bị',
      ja: '準備物',
      ru: 'Необходимые материалы',
      uz: 'Kerakli jihozlar',
      mn: 'Бэлтгэх зүйлс',
      th: 'อุปกรณ์ที่ต้องเตรียม',
      km: 'សម្ភារៈត្រូវត្រៀម',
      tl: 'Mga Kagamitan'
    }
  },
  {
    ko: '모둠 활동',
    category: '활동 형태',
    translations: {
      en: 'Group Activity',
      'zh-Hans': '小组活动',
      vi: 'Hoạt động nhóm',
      ja: 'グループ活動',
      ru: 'Групповая работа',
      uz: 'Guruh faoliyati',
      mn: 'Багийн үйл ажиллагаа',
      th: 'กิจกรรมกลุ่ม',
      km: 'សកម្មភាពក្រុម',
      tl: 'Pangkatang Gawain'
    }
  },
  {
    ko: '짝 활동',
    category: '활동 형태',
    translations: {
      en: 'Pair Activity',
      'zh-Hans': '同伴活动',
      vi: 'Hoạt động cặp đôi',
      ja: 'ペア活動',
      ru: 'Работа в парах',
      uz: 'Juftlikda ishlash',
      mn: 'Хосоороо ажиллах',
      th: 'กิจกรรมคู่',
      km: 'សកម្មភាពដៃគូ',
      tl: 'Gawaing Magkapareha'
    }
  },
  {
    ko: '개인 활동',
    category: '활동 형태',
    translations: {
      en: 'Individual Activity',
      'zh-Hans': '个人活动',
      vi: 'Hoạt động cá nhân',
      ja: '個人活動',
      ru: 'Индивидуальная работа',
      uz: 'Mustaqil ish',
      mn: 'Бие даасан ажил',
      th: 'กิจกรรมเดี่ยว',
      km: 'សកម្មភាពបុគ្គល',
      tl: 'Indibidwal na Gawain'
    }
  },
  {
    ko: '활동지',
    category: '수업 자료',
    translations: {
      en: 'Activity Sheet',
      'zh-Hans': '活动单',
      vi: 'Phiếu hoạt động',
      ja: 'ワークシート',
      ru: 'Рабочий лист',
      uz: 'Ish varaqasi',
      mn: 'Ажлын хуудас',
      th: 'ใบกิจกรรม',
      km: 'សន្លឹកកិច្ចការ',
      tl: 'Activity Sheet'
    }
  },
  {
    ko: '교과서',
    category: '수업 자료',
    translations: {
      en: 'Textbook',
      'zh-Hans': '教科书',
      vi: 'Sách giáo khoa',
      ja: '教科書',
      ru: 'Учебник',
      uz: 'Darslik',
      mn: 'Сурах бичиг',
      th: 'หนังสือเรียน',
      km: 'សៀវភៅសិក្សា',
      tl: 'Aklat-aralin'
    }
  },
  {
    ko: '실험 결과',
    category: '과학·탐구',
    translations: {
      en: 'Experiment Results',
      'zh-Hans': '实验结果',
      vi: 'Kết quả thí nghiệm',
      ja: '実験結果',
      ru: 'Результаты опыта',
      uz: 'Tajriba natijasi',
      mn: 'Туршилтын үр дүн',
      th: 'ผลการทดลอง',
      km: 'លទ្ធផលពិសោធន៍',
      tl: 'Resulta ng Eksperimento'
    }
  },
  {
    ko: '관찰 기록',
    category: '과학·탐구',
    translations: {
      en: 'Observation Record',
      'zh-Hans': '观察记录',
      vi: 'Ghi chép quan sát',
      ja: '観察記録',
      ru: 'Запись наблюдений',
      uz: 'Kuzatuv qaydlari',
      mn: 'Ажиглалтын тэмдэглэл',
      th: 'บันทึกการสังเกต',
      km: 'កំណត់ត្រាសង្เกต',
      tl: 'Tala ng Obserbasyon'
    }
  },
  {
    ko: '수행평가',
    category: '평가·행정',
    translations: {
      en: 'Performance Assessment',
      'zh-Hans': '表现性评价',
      vi: 'Đánh giá thực hành',
      ja: 'パフォーマンス評価',
      ru: 'Практическая оценка',
      uz: 'Amaliy baholash',
      mn: 'Гүйцэтгэлийн үнэлгээ',
      th: 'การประเมินภาคปฏิบัติ',
      km: 'ការវាយតម្លៃការអនុវត្ត',
      tl: 'Performance Assessment'
    }
  },
  {
    ko: '가정통신문',
    category: '평가·행정',
    translations: {
      en: 'School Newsletter',
      'zh-Hans': '家长通知书',
      vi: 'Thư thông báo gửi phụ huynh',
      ja: '家庭通信（お便り）',
      ru: 'Информационное письмо для родителей',
      uz: 'Ota-onalar uchun xabarnoma',
      mn: 'Эцэг эхэд хүргэх мэдэгдэл',
      th: 'จดหมายข่าวแจ้งผู้ปกครอง',
      km: 'លិខិតជូនដំណឹងដល់មាតាបិតា',
      tl: 'Liham para sa mga Magulang'
    }
  },
  {
    ko: '알림장',
    category: '평가·행정',
    translations: {
      en: 'Daily Notice',
      'zh-Hans': '通知本',
      vi: 'Sổ báo bài',
      ja: '連絡帳',
      ru: 'Дневник объявлений',
      uz: 'Kundalik eslatma',
      mn: 'Мэдэгдлийн дэвтэр',
      th: 'สมุดจดการบ้าน',
      km: 'សៀវភៅតាមដាន',
      tl: 'Talaan ng Paalala'
    }
  },
  {
    ko: '주의사항',
    category: '수업 단계',
    translations: {
      en: 'Precautions',
      'zh-Hans': '注意事项',
      vi: 'Lưu ý quan trọng',
      ja: '注意事項',
      ru: 'Меры предосторожности',
      uz: 'Ehtiyot choralari',
      mn: 'Анхаарах зүйлс',
      th: 'ข้อควรระวัง',
      km: 'ចំណុចគួរប្រុងប្រយ័ត្ន',
      tl: 'Mga Paalala sa Kaligtasan'
    }
  },
  {
    ko: '정리하기',
    category: '수업 단계',
    translations: {
      en: 'Wrap-up & Review',
      'zh-Hans': '总结与回顾',
      vi: 'Tổng kết bài học',
      ja: 'まとめ',
      ru: 'Подведение итогов',
      uz: 'Xulosa qilish',
      mn: 'Дүгнэлт хийх',
      th: 'สรุปบทเรียน',
      km: 'សង្ខេបមេរៀន',
      tl: 'Pagbubuod'
    }
  },
  {
    ko: '발표하기',
    category: '활동 형태',
    translations: {
      en: 'Presentation',
      'zh-Hans': '发表与分享',
      vi: 'Thuyết trình',
      ja: '発表する',
      ru: 'Презентация',
      uz: 'Taqdimot qilish',
      mn: 'Илтгэх',
      th: 'การนำเสนอ',
      km: 'ការធ្វើបទបង្ហាញ',
      tl: 'Pag-uulat'
    }
  },
  {
    ko: '학년',
    category: '학생 정보',
    translations: {
      en: 'Grade',
      'zh-Hans': '年级',
      vi: 'Khối lớp',
      ja: '学年',
      ru: 'Класс (параллель)',
      uz: 'Sinf',
      mn: 'Анги',
      th: 'ชั้นปี',
      km: 'ថ្នាក់ទី',
      tl: 'Baitang'
    }
  },
  {
    ko: '학번',
    category: '학생 정보',
    translations: {
      en: 'Student ID',
      'zh-Hans': '学号',
      vi: 'Mã số học sinh',
      ja: '出席番号',
      ru: 'Номер ученика',
      uz: "O'quvchi raqami",
      mn: 'Сурагчийн дугаар',
      th: 'เลขประจำตัวนักเรียน',
      km: 'អត្តលេខសិស្ស',
      tl: 'Student Number'
    }
  },
  {
    ko: '이름',
    category: '학생 정보',
    translations: {
      en: 'Name',
      'zh-Hans': '姓名',
      vi: 'Họ và tên',
      ja: '名前',
      ru: 'Имя',
      uz: 'Ism-sharif',
      mn: 'Нэр',
      th: 'ชื่อ-นามสกุล',
      km: 'ឈ្មោះ',
      tl: 'Pangalan'
    }
  },
  {
    ko: '과제',
    category: '평가·행정',
    translations: {
      en: 'Homework / Assignment',
      'zh-Hans': '课后作业',
      vi: 'Bài tập về nhà',
      ja: '課題（宿題）',
      ru: 'Домашнее задание',
      uz: 'Uyga vazifa',
      mn: 'Гэрийн даалгавар',
      th: 'การบ้าน',
      km: 'កិច្ចការផ្ទះ',
      tl: 'Takdang-aralin'
    }
  },
  {
    ko: '생각해 봅시다',
    category: '수업 단계',
    translations: {
      en: "Let's Think Together",
      'zh-Hans': '想一想',
      vi: 'Cùng suy nghĩ nhé',
      ja: '考えてみましょう',
      ru: 'Давайте подумаем',
      uz: "O'ylab ko'raylik",
      mn: 'Хамтдаа эргэцүүлье',
      th: 'ลองคิดดูสิ',
      km: 'ចូរគិតទាំងអស់គ្នា',
      tl: 'Pag-isipan Natin'
    }
  }
];

export function loadCustomGlossary() {
  try {
    const raw = localStorage.getItem(CUSTOM_GLOSSARY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomGlossary(entries) {
  try {
    localStorage.setItem(CUSTOM_GLOSSARY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore storage quota errors
  }
}

export function getAllGlossaryEntries() {
  const custom = loadCustomGlossary();
  return [...custom, ...BUILTIN_SCHOOL_GLOSSARY];
}

/**
 * Find glossary entries whose Korean term appears in sourceText
 * Also checks whether currentTranslation already contains the target glossary term.
 */
export function findMatchingGlossaryTerms(sourceText, langKey, currentTranslation = '') {
  const raw = String(sourceText ?? '');
  if (!raw.trim()) return [];
  const entries = getAllGlossaryEntries();
  const matches = [];
  const lowerTrans = String(currentTranslation ?? '').toLowerCase();

  for (const entry of entries) {
    if (!entry.ko) continue;
    const targetTerm = entry.translations?.[langKey];
    if (!targetTerm) continue;
    if (raw.includes(entry.ko)) {
      const isApplied =
        lowerTrans.length > 0 && lowerTrans.includes(String(targetTerm).toLowerCase());
      matches.push({
        ko: entry.ko,
        target: targetTerm,
        category: entry.category || '사용자 단어',
        isApplied
      });
    }
  }
  return matches;
}

/**
 * Detect whether a source text consists purely of numbers, dates, symbols, or punctuation
 * so it can automatically keep the source text and be marked verified.
 */
export function isNonTranslatableText(text) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return false;
  // Contains any Hangul syllable/jamo or Latin/CJK letters?
  const hasLetters = /[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\u4e00-\u9fff\u3040-\u30ff\u0400-\u04ff]/.test(trimmed);
  if (!hasLetters) {
    return true;
  }
  // Common date/URL/email patterns that should not be translated
  if (/^https?:\/\/\S+$/i.test(trimmed)) return true;
  if (/^\d{4}[./-]\s*\d{1,2}[./-]\s*\d{1,2}\.?$/.test(trimmed)) return true;
  return false;
}

/**
 * Evaluate length overflow risk between Korean source text and translated text.
 * Returns null if normal, or { ratioPct, level, message } if long.
 */
export function evaluateLengthOverflowRisk(sourceText, translatedText, contextLabel = '') {
  const src = String(sourceText ?? '').trim();
  const dst = String(translatedText ?? '').trim();
  if (!src || !dst || src === dst) return null;

  const srcLen = src.length;
  const dstLen = dst.length;
  if (dstLen <= 12) return null;

  const ratio = dstLen / Math.max(1, srcLen);
  const ratioPct = Math.round(ratio * 100);
  const isTightContext =
    contextLabel.includes('제목') ||
    contextLabel.includes('표') ||
    contextLabel.includes('도형');

  const warnRatio = isTightContext ? 1.65 : 1.9;
  const minExtraChars = isTightContext ? 10 : 18;

  if (ratio >= warnRatio && dstLen - srcLen >= minExtraChars) {
    return {
      ratioPct,
      srcLen,
      dstLen,
      level: ratio >= 2.5 ? 'high' : 'medium',
      message: `원문 대비 길이 ${ratioPct}% (${srcLen}자 → ${dstLen}자 · ${
        isTightContext ? '제목/표 칸 넘침 주의' : '글상자 줄바꿈 확인 권장'
      })`
    };
  }
  return null;
}

/**
 * Automatically detect translation accuracy issues even when the teacher doesn't know the target language:
 * 1. Numbers in Korean source missing from translation
 * 2. Untranslated Hangul characters remaining inside foreign translation
 * 3. Question mark (?) in source missing from translation
 */
export function evaluateTranslationAccuracyIssues(sourceText, translatedText, keepOriginal = false) {
  const src = String(sourceText ?? '').trim();
  const dst = String(translatedText ?? '').trim();
  const issues = [];

  if (!src || !dst || keepOriginal) {
    return issues;
  }

  // 1. Check numbers present in source (handle dotted dates like 2026.10.19 and thousand commas like 1,000)
  const rawNumberTokens = src.match(/\d+(?:[.,]\d+)*/g) || [];
  const srcNumbers = [];
  for (const token of rawNumberTokens) {
    const dotParts = token.split('.');
    if (dotParts.length > 2) {
      // Multi-dot sequence (e.g. 2026.10.19) -> check each integer part separately
      for (const p of dotParts) {
        if (p) srcNumbers.push(p.replace(/,/g, ''));
      }
    } else {
      srcNumbers.push(token);
    }
  }

  if (srcNumbers.length > 0) {
    const dstNoComma = dst.replace(/(\d),[,\s]*(\d)/g, '$1$2');
    const missingNums = srcNumbers.filter((num) => {
      const normalized = num.replace(/,/g, '');
      const altDecimal = num.includes('.') ? num.replace('.', ',') : num;
      return !dst.includes(num) && !dstNoComma.includes(normalized) && !dst.includes(altDecimal);
    });
    if (missingNums.length > 0) {
      issues.push({
        code: 'missing-number',
        type: 'missing-number',
        severity: 'red',
        level: 'error',
        message: `숫자 누락 의심: 원문의 숫자(${[...new Set(missingNums)].join(', ')})가 번역문에 없습니다.`
      });
    }
  }

  // 2. Check leftover Hangul characters in foreign translation
  const leftoverHangul = dst.match(/[가-힣]{2,}/g) || [];
  if (leftoverHangul.length > 0) {
    if (dst === src) {
      issues.push({
        code: 'untranslated-source',
        type: 'untranslated-source',
        severity: 'red',
        level: 'error',
        message: '미번역 한글 상태: 번역문이 한국어 원문 그대로입니다. (원문을 유지하려면 [⏭️ 원문 그대로 유지]를 켜 주세요.)'
      });
    } else {
      issues.push({
        code: 'leftover-hangul',
        type: 'leftover-hangul',
        severity: 'red',
        level: 'error',
        message: `미번역 한글 포함: 번역문 안에 한글(${[...new Set(leftoverHangul)].slice(0, 3).join(', ')})이 남아 있습니다.`
      });
    }
  }

  // 3. Check question mark mismatch
  const srcIsQuestion = /[?？]\s*$/.test(src);
  const dstIsQuestion = /[?？]\s*$/.test(dst);
  if (srcIsQuestion && !dstIsQuestion) {
    issues.push({
      code: 'missing-question',
      type: 'missing-question',
      severity: 'yellow',
      level: 'warn',
      message: '문장부호 확인: 원문은 물음표(?)로 끝나지만 번역문 끝에 물음표가 없습니다.'
    });
  }

  return issues;
}

function extractKoreanKeyTokens(koText) {
  const cleaned = String(koText ?? '')
    .replace(/[^\w가-힣\s]/g, ' ')
    .trim();
  if (!cleaned) return [];
  const rawWords = cleaned.split(/\s+/);
  const tokens = new Set();

  for (const w of rawWords) {
    if (/^\d+$/.test(w)) {
      tokens.add(w);
      continue;
    }
    const stripped = w.replace(
      /(은|는|이|가|을|를|에|에서|으로|로|과|와|의|도|만|부터|까지|에게|한테|합시다|봅시다|하세요|하십시오|입니다|습니다|ㅂ니다|어요|아요|다|요)$/u,
      ''
    );
    if (stripped.length >= 2) {
      tokens.add(stripped.slice(0, 2));
    } else if (w.length >= 2) {
      tokens.add(w.slice(0, 2));
    }
  }
  return [...tokens];
}

export function computeKoreanMeaningSimilarity(sourceKo, backTranslatedKo) {
  const srcTokens = extractKoreanKeyTokens(sourceKo);
  const backTokens = extractKoreanKeyTokens(backTranslatedKo);
  if (srcTokens.length === 0 || backTokens.length === 0) return 1;

  let matched = 0;
  const backJoined = String(backTranslatedKo ?? '');
  for (const tok of srcTokens) {
    if (backTokens.includes(tok) || backJoined.includes(tok)) {
      matched++;
    }
  }
  return matched / srcTokens.length;
}

/**
 * Compute Traffic-Light confidence badge (🟢 안심 / 🟡 점검 권장 / 🔴 확인 필요)
 * Supports both (itemObj, stateObj, langKey) and (sourceText, translatedText, backTranslatedKo, contextLabel, keepOriginal, langKey)
 */
export function evaluateTranslationTrafficLight(
  arg1,
  arg2,
  backTranslatedKo = '',
  contextLabel = '',
  keepOriginal = false,
  langKey = ''
) {
  let sourceText = arg1;
  let translatedText = arg2;
  let resolvedLangKey = langKey;
  if (arg1 && typeof arg1 === 'object' && 'sourceText' in arg1) {
    sourceText = arg1.sourceText;
    contextLabel = arg1.contextLabel || '';
    if (typeof backTranslatedKo === 'string' && backTranslatedKo.length > 0) {
      resolvedLangKey = backTranslatedKo;
    }
    if (arg2 && typeof arg2 === 'object') {
      translatedText = arg2.finalText ?? '';
      backTranslatedKo = arg2.backTranslatedKo ?? '';
      keepOriginal = Boolean(arg2.keepOriginal);
    }
  } else if (
    !resolvedLangKey &&
    typeof contextLabel === 'string' &&
    BUILTIN_SCHOOL_GLOSSARY[0]?.translations?.[contextLabel]
  ) {
    resolvedLangKey = contextLabel;
    contextLabel = '';
  }

  const dst = String(translatedText ?? '').trim();
  if (!dst) {
    const badgeText = '⚪ 번역문 미입력';
    return {
      status: 'empty',
      level: 'empty',
      badgeText,
      label: badgeText,
      cssClass: 'signal-empty',
      issues: []
    };
  }

  if (keepOriginal) {
    const badgeText = '🟢 안심 (원문 유지)';
    return {
      status: 'green',
      level: 'green',
      badgeText,
      label: badgeText,
      cssClass: 'signal-green',
      issues: []
    };
  }

  const issues = evaluateTranslationAccuracyIssues(sourceText, dst, keepOriginal);
  const overflow = evaluateLengthOverflowRisk(sourceText, dst, contextLabel);
  if (overflow) {
    issues.push({
      code: 'length-overflow',
      type: 'length-overflow',
      severity: 'yellow',
      level: 'warn',
      message: overflow.message
    });
  }

  if (resolvedLangKey) {
    const glossaryMatches = findMatchingGlossaryTerms(sourceText, resolvedLangKey, dst);
    const unapplied = glossaryMatches.filter((m) => !m.isApplied);
    if (unapplied.length > 0) {
      issues.push({
        code: 'glossary-mismatch',
        type: 'glossary-mismatch',
        severity: 'yellow',
        level: 'warn',
        message: `용어집 불일치 확인: 학교 표준 용어(${unapplied
          .slice(0, 3)
          .map((m) => `'${m.ko}' → '${m.target}'`)
          .join(', ')})가 번역문에 반영되지 않았습니다.`
      });
    }
  }

  if (backTranslatedKo && backTranslatedKo.trim().length > 0) {
    const sim = computeKoreanMeaningSimilarity(sourceText, backTranslatedKo);
    if (sim < 0.25 && String(sourceText).trim().length >= 6) {
      issues.push({
        code: 'meaning-divergence',
        type: 'meaning-divergence',
        severity: 'yellow',
        level: 'warn',
        message: '역번역 표현 차이: 한국어 역번역 문장과 원문 표현 차이가 크므로 의미를 한 번 확인해 주세요.'
      });
    }
  }

  const hasRed = issues.some((i) => i.severity === 'red');
  const hasYellow = issues.some((i) => i.severity === 'yellow');

  if (hasRed) {
    const badgeText = '🔴 확인 필요 (숫자·한글 오류 의심)';
    return {
      status: 'red',
      level: 'red',
      badgeText,
      label: badgeText,
      cssClass: 'signal-red',
      issues
    };
  }
  if (hasYellow) {
    const badgeText = '🟡 점검 권장 (길이·부호·표현 확인)';
    return {
      status: 'yellow',
      level: 'yellow',
      badgeText,
      label: badgeText,
      cssClass: 'signal-yellow',
      issues
    };
  }

  const badgeText = backTranslatedKo
    ? '🟢 안심 (역번역·숫자·부호 정상)'
    : '🟢 안심 (숫자·문장부호·길이 정상)';
  return {
    status: 'green',
    level: 'green',
    badgeText,
    label: badgeText,
    cssClass: 'signal-green',
    issues: []
  };
}

