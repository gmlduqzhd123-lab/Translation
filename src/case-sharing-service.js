/**
 * Classroom Utilization Case Sharing & Admin Approval Service
 * - Connects to Supabase PostgreSQL RPC endpoints with Row Level Security (RLS)
 * - Strictly isolated from core PPTX/HWPX translation workflow:
 *   even if the network or case server is unreachable, document translation works 100% normally.
 * - Never embeds any admin password in client-side code; all admin authorization is verified server-side.
 */

const SUPABASE_URL = 'https://tjrrtgdhtjdkofwqnxnz.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqcnJ0Z2RodGpka29md3FueG56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDEwMTQsImV4cCI6MjA5NzExNzAxNH0.mSksKPavVode9bp5U-PBMJajGMBkKfBTDDyrKkb6nAY';

const MY_CASE_IDS_STORAGE_KEY = 'multilingual_translator_my_case_ids_v1';

export const CASE_STATUS_META = {
  pending: {
    key: 'pending',
    label: '관리자 승인중',
    badgeClass: 'case-status-pending',
    description: '제출 완료 후 관리자 검토 대기 상태입니다. 승인 전에는 공개 목록과 공유 링크에 표시되지 않습니다.'
  },
  approved: {
    key: 'approved',
    label: '승인됨',
    badgeClass: 'case-status-approved',
    description: '관리자 검토를 거쳐 공개 목록에 게시되었으며 고유 링크로 공유할 수 있습니다.'
  },
  rejected: {
    key: 'rejected',
    label: '반려됨',
    badgeClass: 'case-status-rejected',
    description: '반려 사유를 확인하고 내용을 수정한 뒤 다시 제출할 수 있습니다.'
  },
  hidden: {
    key: 'hidden',
    label: '비공개 처리됨',
    badgeClass: 'case-status-hidden',
    description: '관리자에 의해 비공개로 전환된 게시글입니다.'
  }
};

export const FALLBACK_SAMPLE_CASES = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    title: '[예시] 4학년 과학 식물의 한살이 관찰 슬라이드(PPTX) 베트남어 병기 자료 제작 예시',
    used_date: '2026-04-10',
    school_grade: '초등 4학년',
    subject: '과학',
    target_language: 'vi',
    file_format: 'pptx',
    lesson_goal:
      '강낭콩의 싹트기와 자람 과정을 설명하는 수업에서 다문화 학생이 실험 준비물과 관찰 순서를 모국어와 한국어로 동시에 이해하도록 지원',
    tool_usage_process:
      '1단계에서 예시 과학 수업 PPTX를 불러온 뒤, 3단계에서 베트남어(Tiếng Việt)를 선택해 브라우저 내장 Translator API로 초안을 생성하고 5단계에서 [한국어 원문 + 번역문 함께 표기(병기)] 모드로 다운로드함',
    teacher_review_notes:
      '학교 표준 용어집을 활용해 준비물, 모둠 활동, 실험 관찰 용어를 표준 베트남어 표현으로 통일하고, 역번역 검증으로 관찰 순서 문장의 의미가 정확한지 확인함',
    observed_results_limits:
      '원문과 번역문이 한 슬라이드에 함께 표시되어 교사가 한국어로 설명할 때 학생이 해당 부분을 쉽게 따라왔으나, 슬라이드 제목 상자는 2줄로 늘어나 PowerPoint에서 글자 크기를 2pt 줄여 조정함',
    aggregate_metrics: '시연용 예시 자료 (실제 수업 실적 집계 제외)',
    improvement_suggestions: '표 안의 텍스트가 길어질 때 줄바꿈 미리보기 경고가 도움이 되었음',
    author_display_name: '작성 예시 안내용 (시스템 제공)',
    status: 'approved',
    is_sample: true,
    created_at: '2026-04-10T09:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    title: '[예시] 과학 탐구 활동지 및 실험 안전 안내문(HWPX) 러시아어 변환 예시',
    used_date: '2026-04-12',
    school_grade: '초등 5학년',
    subject: '과학',
    target_language: 'ru',
    file_format: 'hwpx',
    lesson_goal:
      '온도와 열 단원 실험 활동지의 안전 수칙과 탐구 기록 방법을 러시아어권 학생에게 정확히 안내',
    tool_usage_process:
      '한컴오피스 한글에서 .hwpx 표준 문서로 저장한 활동지를 업로드하고 러시아어(Русский) 자동 번역 초안 생성 후 문단별 검수를 거쳐 .hwpx 파일로 다운로드함',
    teacher_review_notes:
      '신호등 자동 진단에서 실험 온도 숫자(℃)와 번호가 누락되지 않았는지 점검하고, 고유명사(교실 명칭)는 [원문 그대로 유지]로 설정함',
    observed_results_limits:
      '한글(HWPX) 표 서식이 그대로 유지되어 별도 편집 시간을 줄였으며, 러시아어 문장 길이가 한국어보다 약 1.8배 길어져 한컴오피스에서 표 셀 여백을 한 번 확인함',
    aggregate_metrics: '시연용 예시 자료 (실제 수업 실적 집계 제외)',
    improvement_suggestions: '교과별 자주 쓰는 안전 수칙 표현을 사용자 단어장에 등록해 재사용함',
    author_display_name: '작성 예시 안내용 (시스템 제공)',
    status: 'approved',
    is_sample: true,
    created_at: '2026-04-12T09:00:00Z'
  }
];

async function callSupabaseRpc(rpcName, params = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${rpcName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(params),
      signal: controller.signal
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg =
        (data && (data.message || data.error_description || data.details || data.hint)) ||
        `서버 요청 실패 (HTTP ${res.status})`;
      throw new Error(msg);
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getSavedMyCaseIds() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(MY_CASE_IDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id))
      : [];
  } catch {
    return [];
  }
}

export function rememberMyCaseId(caseId) {
  if (!caseId || typeof caseId !== 'string') return;
  try {
    if (typeof localStorage === 'undefined') return;
    const current = getSavedMyCaseIds();
    if (!current.includes(caseId)) {
      current.unshift(caseId);
      localStorage.setItem(MY_CASE_IDS_STORAGE_KEY, JSON.stringify(current.slice(0, 50)));
    }
  } catch {
    // ignore storage quota errors
  }
}

export function clearSavedMyCaseIds() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(MY_CASE_IDS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function fetchApprovedCases() {
  try {
    const rows = await callSupabaseRpc('get_approved_translation_cases', {});
    const list = Array.isArray(rows) ? rows : FALLBACK_SAMPLE_CASES;
    return {
      items: list,
      cases: list,
      isOfflineFallback: false,
      offline: false,
      errorMessage: null
    };
  } catch (err) {
    return {
      items: FALLBACK_SAMPLE_CASES,
      cases: FALLBACK_SAMPLE_CASES,
      isOfflineFallback: true,
      offline: true,
      errorMessage:
        err?.message ||
        '사례 공유 서버에 일시적으로 연결할 수 없어 내장 예시 사례만 표시합니다. (문서 번역 기능은 정상 작동합니다.)'
    };
  }
}

export async function submitLessonCase(formData) {
  try {
    const result = await callSupabaseRpc('submit_translation_case', {
      p_title: formData.title,
      p_used_date: formData.used_date ?? formData.usedDate,
      p_school_grade: formData.school_grade ?? formData.schoolGrade ?? formData.school_level,
      p_subject: formData.subject,
      p_target_language: formData.target_language ?? formData.targetLanguage,
      p_file_format: formData.file_format ?? formData.fileFormat ?? 'pptx',
      p_lesson_goal: formData.lesson_goal ?? formData.lessonGoal,
      p_tool_usage_process: formData.tool_usage_process ?? formData.toolUsageProcess,
      p_teacher_review_notes:
        formData.teacher_review_notes ?? formData.teacherReviewNotes ?? formData.review_modifications,
      p_observed_results_limits:
        formData.observed_results_limits ?? formData.observedResultsLimits,
      p_aggregate_metrics:
        formData.aggregate_metrics ?? formData.aggregateMetrics ?? formData.metrics_summary ?? '',
      p_improvement_suggestions:
        formData.improvement_suggestions ?? formData.improvementSuggestions ?? '',
      p_author_display_name:
        formData.author_display_name ?? formData.authorDisplayName ?? '익명 교사',
      p_confirmed_factual: Boolean(
        formData.confirmed_factual ?? formData.confirmedFactual ?? formData.confirmed_authentic
      ),
      p_confirmed_no_pii: Boolean(formData.confirmed_no_pii ?? formData.confirmedNoPii),
      p_confirmed_public_rights: Boolean(
        formData.confirmed_public_rights ??
          formData.confirmedPublicRights ??
          formData.confirmed_copyright
      ),
      p_author_passcode: formData.author_passcode ?? formData.authorPasscode
    });

    if (result?.id) {
      rememberMyCaseId(result.id);
    }
    const status = result?.status || 'pending';
    return {
      ok: true,
      status,
      status_label: CASE_STATUS_META[status]?.label || '관리자 승인중',
      ...(typeof result === 'object' ? result : {})
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.message || '사례 제출 중 오류가 발생했습니다.'
    };
  }
}

export async function fetchMyCases(arg1 = [], arg2 = '') {
  try {
    let myIds = [];
    let cleanPass = '';
    if (Array.isArray(arg1)) {
      myIds = arg1;
      cleanPass = String(arg2 ?? '').trim();
    } else if (typeof arg1 === 'string') {
      cleanPass = arg1.trim();
      myIds = Array.isArray(arg2) ? arg2 : getSavedMyCaseIds();
    } else {
      myIds = getSavedMyCaseIds();
    }

    if (myIds.length === 0 && cleanPass.length < 4) {
      const empty = [];
      empty.ok = true;
      empty.items = empty;
      return empty;
    }

    // Only return rows matching author passcode if a passcode is provided;
    // when both case_ids and passcode are provided, verify passcode match if passcode was explicitly supplied
    const rows = await callSupabaseRpc('get_my_translation_cases', {
      p_case_ids: myIds.length > 0 ? myIds : null,
      p_author_passcode: cleanPass
    });
    const list = Array.isArray(rows) ? rows : [];
    for (const r of list) {
      if (r.id) rememberMyCaseId(r.id);
    }
    list.ok = true;
    list.items = list;
    return list;
  } catch (err) {
    const empty = [];
    empty.ok = false;
    empty.items = empty;
    empty.message = err?.message || '내 제출 글 조회 실패';
    return empty;
  }
}

export const fetchMySubmittedCases = fetchMyCases;

export async function resubmitLessonCase(caseId, authorPasscode, formData) {
  try {
    const result = await callSupabaseRpc('resubmit_translation_case', {
      p_case_id: caseId,
      p_author_passcode: authorPasscode,
      p_title: formData.title,
      p_used_date: formData.used_date ?? formData.usedDate,
      p_school_grade: formData.school_grade ?? formData.schoolGrade ?? formData.school_level,
      p_subject: formData.subject,
      p_target_language: formData.target_language ?? formData.targetLanguage,
      p_file_format: formData.file_format ?? formData.fileFormat ?? 'pptx',
      p_lesson_goal: formData.lesson_goal ?? formData.lessonGoal,
      p_tool_usage_process: formData.tool_usage_process ?? formData.toolUsageProcess,
      p_teacher_review_notes:
        formData.teacher_review_notes ?? formData.teacherReviewNotes ?? formData.review_modifications,
      p_observed_results_limits:
        formData.observed_results_limits ?? formData.observedResultsLimits,
      p_aggregate_metrics:
        formData.aggregate_metrics ?? formData.aggregateMetrics ?? formData.metrics_summary ?? '',
      p_improvement_suggestions:
        formData.improvement_suggestions ?? formData.improvementSuggestions ?? '',
      p_author_display_name:
        formData.author_display_name ?? formData.authorDisplayName ?? '익명 교사'
    });
    const status = result?.status || 'pending';
    return {
      ok: true,
      status,
      status_label: CASE_STATUS_META[status]?.label || '관리자 승인중',
      ...(typeof result === 'object' ? result : {})
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.message || '재제출 중 오류가 발생했습니다.'
    };
  }
}

export async function removeMyLessonCase(caseId, authorPasscode) {
  try {
    const ok = await callSupabaseRpc('remove_my_translation_case', {
      p_case_id: caseId,
      p_author_passcode: authorPasscode
    });
    return {
      ok: Boolean(ok),
      message: ok
        ? '제출한 게시글이 삭제되었습니다.'
        : '작성자 비밀번호가 일치하지 않거나 삭제할 수 없습니다.'
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.message || '삭제 중 오류가 발생했습니다.'
    };
  }
}

export async function reportLessonCase(arg1, requestType = 'report', reason = '', requesterContact = '') {
  try {
    let payload;
    if (arg1 && typeof arg1 === 'object') {
      payload = {
        p_case_id: arg1.caseId ?? arg1.case_id,
        p_request_type: arg1.requestType ?? arg1.request_type ?? 'report',
        p_reason: arg1.reason ?? '',
        p_requester_contact: arg1.contactInfo ?? arg1.requesterContact ?? ''
      };
    } else {
      payload = {
        p_case_id: arg1,
        p_request_type: requestType,
        p_reason: reason,
        p_requester_contact: requesterContact
      };
    }
    const ok = await callSupabaseRpc('report_translation_case', payload);
    return {
      ok: Boolean(ok),
      message: ok
        ? '✓ 요청이 접수되었습니다. 관리자가 확인 후 조치합니다.'
        : '요청 접수에 실패했습니다.'
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.message || '요청 접수 중 오류가 발생했습니다.'
    };
  }
}

export async function verifyAdminPasswordOnServer(adminPassword) {
  try {
    const ok = await callSupabaseRpc('check_translation_admin_password', {
      p_admin_password: adminPassword
    });
    return {
      ok: Boolean(ok),
      valid: Boolean(ok),
      message: ok ? '관리자 인증이 완료되었습니다.' : '관리자 비밀번호가 일치하지 않습니다.'
    };
  } catch (err) {
    return {
      ok: false,
      valid: false,
      message: err?.message || '서버 관리자 인증 확인 중 오류가 발생했습니다.'
    };
  }
}

export async function verifyAdminPassword(adminPassword) {
  const res = await verifyAdminPasswordOnServer(adminPassword);
  return res.ok;
}

export async function adminFetchAllCases(adminPassword) {
  try {
    const rows = await callSupabaseRpc('admin_list_translation_cases', {
      p_admin_password: adminPassword
    });
    return {
      ok: true,
      items: Array.isArray(rows) ? rows : []
    };
  } catch (err) {
    return {
      ok: false,
      items: [],
      message: err?.message || '관리자 게시글 목록을 불러오지 못했습니다.'
    };
  }
}

export const fetchAdminCasesFromServer = adminFetchAllCases;

export async function adminReviewCase(
  adminPassword,
  caseId,
  action,
  rejectionReason = ''
) {
  try {
    const res = await callSupabaseRpc('admin_review_translation_case', {
      p_admin_password: adminPassword,
      p_case_id: caseId,
      p_action: action,
      p_rejection_reason: rejectionReason
    });
    const actionLabel =
      action === 'approve'
        ? '✅ 승인 완료: 게시글이 공개 목록에 게시되었습니다.'
        : action === 'reject'
          ? '❌ 반려 완료: 작성자에게 반려 사유가 전달됩니다.'
          : action === 'hide'
            ? '🙈 비공개 전환 완료: 공개 목록에서 숨김 처리되었습니다.'
            : '🗑️ 삭제 완료: 게시글이 영구 삭제되었습니다.';
    return {
      ok: true,
      message: actionLabel,
      ...(typeof res === 'object' ? res : {})
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.message || '관리자 상태 변경 처리에 실패했습니다.'
    };
  }
}

export const reviewCaseAsAdminOnServer = adminReviewCase;

export async function adminFetchCaseReports(adminPassword) {
  try {
    const rows = await callSupabaseRpc('admin_list_case_reports', {
      p_admin_password: adminPassword
    });
    const items = (Array.isArray(rows) ? rows : []).map((r) => ({
      ...r,
      contact_info: r.requester_contact || r.contact_info || ''
    }));
    return {
      ok: true,
      items
    };
  } catch (err) {
    return {
      ok: false,
      items: [],
      message: err?.message || '신고 목록 조회에 실패했습니다.'
    };
  }
}

export const fetchAdminReportsFromServer = adminFetchCaseReports;

export async function adminResolveCaseReport(adminPassword, reportId) {
  try {
    const ok = await callSupabaseRpc('admin_resolve_case_report', {
      p_admin_password: adminPassword,
      p_report_id: reportId
    });
    return {
      ok: Boolean(ok),
      message: ok ? '✓ 요청이 처리 완료 상태로 변경되었습니다.' : '처리에 실패했습니다.'
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.message || '요청 처리 중 오류가 발생했습니다.'
    };
  }
}

export const resolveAdminReportOnServer = adminResolveCaseReport;

export async function adminChangePassword(currentPassword, newPassword) {
  try {
    const ok = await callSupabaseRpc('admin_change_translation_password', {
      p_current_password: currentPassword,
      p_new_password: newPassword
    });
    return {
      ok: Boolean(ok),
      message: ok ? '✓ 서버 관리자 비밀번호가 변경되었습니다.' : '비밀번호 변경에 실패했습니다.'
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.message || '비밀번호 변경 중 오류가 발생했습니다.'
    };
  }
}

export const changeAdminPasswordOnServer = adminChangePassword;
