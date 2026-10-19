/**
 * Browser-side PPTX & HWPX Document Processor
 * - 100% client-side parsing, validation, and round-trip reconstruction
 * - No external network requests
 */

const OLE2_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];

export class DocumentProcessError extends Error {
  constructor(title, message, actionHint, code = 'PROCESS_ERROR') {
    super(message);
    this.name = 'DocumentProcessError';
    this.title = title;
    this.actionHint = actionHint;
    this.code = code;
  }
}

function getJSZip() {
  const zipLib = globalThis.JSZip;
  if (!zipLib) {
    throw new DocumentProcessError(
      'ZIP 처리 라이브러리를 불러오지 못했습니다',
      '브라우저에서 JSZip 라이브러리가 로드되지 않았습니다.',
      '페이지를 새로고침한 뒤 다시 시도해 주세요.',
      'JSZIP_MISSING'
    );
  }
  return zipLib;
}

function getLocalName(node) {
  return node.localName || (node.nodeName ? node.nodeName.split(':').pop() : '');
}

function getDirectChildrenByLocalName(parent, localName) {
  const result = [];
  if (!parent || !parent.childNodes) return result;
  for (let i = 0; i < parent.childNodes.length; i++) {
    const child = parent.childNodes[i];
    if (child.nodeType === 1 && getLocalName(child) === localName) {
      result.push(child);
    }
  }
  return result;
}

function ensureXmlDeclaration(xmlStr, originalXml) {
  const trimmed = xmlStr.trimStart();
  if (trimmed.startsWith('<?xml')) return xmlStr;
  const match = originalXml.match(/^<\?xml[^?]*\?>/);
  const decl = match ? match[0] : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  return `${decl}\n${xmlStr}`;
}

function parseXmlStrict(xmlStr, filePathLabel) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'application/xml');
  const parserErrors = doc.getElementsByTagName('parsererror');
  if (parserErrors && parserErrors.length > 0) {
    throw new DocumentProcessError(
      '문서 내부 XML 구조가 손상되었습니다',
      `${filePathLabel} 항목을 읽는 중 XML 구문 오류가 발생했습니다.`,
      '원본 문서를 PowerPoint 또는 한컴오피스 한글에서 열어 다시 저장한 뒤 업로드해 주세요.',
      'XML_PARSE_ERROR'
    );
  }
  return doc;
}

function checkMagicBytes(uint8) {
  if (!uint8 || uint8.length < 4) {
    return 'TOO_SMALL';
  }
  const isOle2 = OLE2_MAGIC.every((b, idx) => uint8[idx] === b);
  if (isOle2) return 'OLE2';
  const isZip = ZIP_MAGIC.every((b, idx) => uint8[idx] === b);
  if (isZip) return 'ZIP';
  return 'UNKNOWN';
}

/**
 * Inspect file extension and binary header before parsing
 */
export function validateFileMetadata(fileName, arrayBuffer) {
  const lower = (fileName || '').trim().toLowerCase();
  const ext = lower.includes('.') ? '.' + lower.split('.').pop() : '';
  const uint8 = new Uint8Array(arrayBuffer || new ArrayBuffer(0));

  if (ext === '.ppt') {
    throw new DocumentProcessError(
      '구형 PowerPoint 파일(.ppt)은 직접 변환할 수 없습니다',
      '업로드하신 파일은 이전 버전의 이진 문서(.ppt) 형식입니다. 이 앱은 표준 개방형 문서인 .pptx 형식만 지원합니다.',
      'PowerPoint에서 해당 파일을 연 뒤 [파일] → [다른 이름으로 저장] → 파일 형식을 "PowerPoint 프레젠테이션(*.pptx)"으로 선택해 저장한 후 다시 업로드해 주세요.',
      'LEGACY_PPT'
    );
  }

  if (ext === '.hwp') {
    throw new DocumentProcessError(
      '구형 한글 파일(.hwp)은 직접 변환할 수 없습니다',
      '업로드하신 파일은 이진 한글 문서(.hwp) 형식입니다. 이 앱은 개방형 표준 한글 문서인 .hwpx 형식만 지원합니다.',
      '한컴오피스 한글에서 파일을 연 뒤 [파일] → [다른 이름으로 저장하기] → 파일 형식을 "한글 표준 문서(*.hwpx)"로 선택해 저장한 후 다시 업로드해 주세요.',
      'LEGACY_HWP'
    );
  }

  if (ext === '.doc') {
    throw new DocumentProcessError(
      '구형 Word 파일(.doc)은 직접 변환할 수 없습니다',
      '업로드하신 파일은 이전 버전의 이진 문서(.doc) 형식입니다. 이 앱은 표준 개방형 문서인 .docx 형식만 지원합니다.',
      'Microsoft Word 또는 한컴오피스에서 파일을 연 뒤 [다른 이름으로 저장] → "Word 문서(*.docx)"로 저장한 후 다시 업로드해 주세요.',
      'LEGACY_DOC'
    );
  }

  if (ext === '.xls') {
    throw new DocumentProcessError(
      '구형 Excel 파일(.xls)은 직접 변환할 수 없습니다',
      '업로드하신 파일은 이전 버전의 이진 통합 문서(.xls) 형식입니다. 이 앱은 표준 개방형 문서인 .xlsx 형식만 지원합니다.',
      'Excel에서 파일을 연 뒤 [다른 이름으로 저장] → "Excel 통합 문서(*.xlsx)"로 저장한 후 다시 업로드해 주세요.',
      'LEGACY_XLS'
    );
  }

  if (ext !== '.pptx' && ext !== '.hwpx' && ext !== '.docx' && ext !== '.xlsx') {
    throw new DocumentProcessError(
      '지원하지 않는 파일 형식입니다',
      `선택한 파일(${fileName || '이름 없음'})의 확장자가 .pptx, .hwpx, .docx, .xlsx가 아닙니다.`,
      '수업자료 파일이 .pptx(파워포인트), .hwpx(한글 표준 문서), .docx(워드), .xlsx(엑셀) 형식인지 확인한 뒤 다시 선택해 주세요.',
      'UNSUPPORTED_EXT'
    );
  }

  if (uint8.length === 0) {
    throw new DocumentProcessError(
      '빈 파일입니다',
      '선택한 파일의 크기가 0바이트입니다.',
      '파일이 정상적으로 저장되었는지 확인한 뒤 다른 파일을 업로드해 주세요.',
      'EMPTY_FILE'
    );
  }

  const headerType = checkMagicBytes(uint8);
  if (headerType === 'OLE2') {
    if (ext === '.pptx') {
      throw new DocumentProcessError(
        '암호가 설정되었거나 확장자만 변경된 .ppt 파일입니다',
        '파일 확장자는 .pptx이지만 내부 구조가 암호화 문서 또는 구형 .ppt(OLE2) 형식입니다.',
        '문서에 열기 암호가 걸려 있다면 암호를 해제하고, 구형 .ppt 파일이라면 PowerPoint에서 [다른 이름으로 저장]을 통해 실제 .pptx 형식으로 저장해 주세요.',
        'OLE2_IN_PPTX'
      );
    }
    throw new DocumentProcessError(
      '암호가 설정되었거나 구형 이진(OLE2) 문서 형식입니다',
      `파일 확장자는 ${ext}이지만 내부 구조가 암호화 문서 또는 구형 이진(OLE2) 형식입니다.`,
      '문서에 열기 암호가 걸려 있다면 암호를 해제하고 [다른 이름으로 저장]을 통해 표준 개방형 문서(.pptx, .hwpx, .docx, .xlsx)로 다시 저장해 주세요.',
      'OLE2_IN_HWPX'
    );
  }

  if (headerType !== 'ZIP') {
    throw new DocumentProcessError(
      '정상적인 문서 파일 구조가 아닙니다',
      '파일이 손상되었거나 표준 압축 문서(ZIP 패키지) 형식이 아닙니다.',
      '문서 프로그램(PowerPoint, 한글, Word, Excel)에서 파일이 정상적으로 열리는지 확인하고 다시 저장한 후 업로드해 주세요.',
      'INVALID_ARCHIVE_HEADER'
    );
  }

  return ext.slice(1); // 'pptx' | 'hwpx' | 'docx' | 'xlsx'
}

/**
 * Parse PPTX, HWPX, DOCX, or XLSX from an ArrayBuffer
 */
export async function extractDocumentFromBuffer(fileName, arrayBuffer) {
  const fileType = validateFileMetadata(fileName, arrayBuffer);
  const JSZip = getJSZip();

  let zip;
  try {
    zip = await JSZip.loadAsync(arrayBuffer);
  } catch {
    throw new DocumentProcessError(
      '손상된 문서 파일입니다',
      '파일 내부 압축 구조를 해제하는 중 오류가 발생했습니다. 파일 다운로드가 덜 되었거나 손상되었을 수 있습니다.',
      '원본 문서를 다시 열어 새 이름으로 저장(.pptx, .hwpx, .docx, .xlsx)한 뒤 업로드해 주세요.',
      'CORRUPTED_ZIP'
    );
  }

  if (fileType === 'pptx') {
    return await extractPptxFromZip(fileName, arrayBuffer, zip);
  }
  if (fileType === 'docx') {
    return await extractDocxFromZip(fileName, arrayBuffer, zip);
  }
  if (fileType === 'xlsx') {
    return await extractXlsxFromZip(fileName, arrayBuffer, zip);
  }
  return await extractHwpxFromZip(fileName, arrayBuffer, zip);
}

async function extractPptxFromZip(fileName, arrayBuffer, zip) {
  const slidePaths = [];
  const presXmlFile = zip.file('ppt/presentation.xml');
  const presRelsFile = zip.file('ppt/_rels/presentation.xml.rels');

  if (presXmlFile && presRelsFile) {
    try {
      const [presXml, relsXml] = await Promise.all([
        presXmlFile.async('string'),
        presRelsFile.async('string')
      ]);
      const presDoc = parseXmlStrict(presXml, 'ppt/presentation.xml');
      const relsDoc = parseXmlStrict(relsXml, 'ppt/_rels/presentation.xml.rels');

      const relMap = new Map();
      const relNodes = relsDoc.getElementsByTagName('*');
      for (let i = 0; i < relNodes.length; i++) {
        const el = relNodes[i];
        if (getLocalName(el) === 'Relationship') {
          const id = el.getAttribute('Id');
          const target = el.getAttribute('Target');
          if (id && target) {
            const normalized = target.startsWith('/')
              ? target.slice(1)
              : target.startsWith('ppt/')
                ? target
                : `ppt/${target.replace(/^\.\//, '')}`;
            relMap.set(id, normalized);
          }
        }
      }

      const allPresNodes = presDoc.getElementsByTagName('*');
      for (let i = 0; i < allPresNodes.length; i++) {
        const el = allPresNodes[i];
        if (getLocalName(el) === 'sldId') {
          const rId =
            el.getAttribute('r:id') ||
            el.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
          if (rId && relMap.has(rId)) {
            const sp = relMap.get(rId);
            if (zip.file(sp) && !slidePaths.includes(sp)) {
              slidePaths.push(sp);
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof DocumentProcessError) throw e;
    }
  }

  if (slidePaths.length === 0) {
    const candidates = Object.keys(zip.files)
      .filter((p) => /^ppt\/slides\/slide\d+\.xml$/i.test(p))
      .sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)\.xml/i)[1], 10);
        const nb = parseInt(b.match(/slide(\d+)\.xml/i)[1], 10);
        return na - nb;
      });
    slidePaths.push(...candidates);
  }

  if (slidePaths.length === 0) {
    throw new DocumentProcessError(
      '유효한 PPTX 슬라이드 구조를 찾을 수 없습니다',
      '파일 내부에 슬라이드 데이터(ppt/slides/slide*.xml)가 존재하지 않습니다.',
      '선택한 파일이 정상적인 PowerPoint 프레젠테이션(.pptx) 파일인지 확인해 주세요.',
      'NO_PPTX_SLIDES'
    );
  }

  const items = [];
  for (let sIdx = 0; sIdx < slidePaths.length; sIdx++) {
    const slidePath = slidePaths[sIdx];
    const slideNumber = sIdx + 1;
    const xmlStr = await zip.file(slidePath).async('string');
    const doc = parseXmlStrict(xmlStr, slidePath);

    const allElements = doc.getElementsByTagName('*');
    const paragraphs = [];
    for (let i = 0; i < allElements.length; i++) {
      if (getLocalName(allElements[i]) === 'p') {
        paragraphs.push(allElements[i]);
      }
    }

    let itemInSlide = 0;
    for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
      const pEl = paragraphs[pIndex];
      if (isSlideNumberOnlyParagraph(pEl)) continue;

      const text = extractPptxParagraphText(pEl);
      if (text.trim().length === 0) continue;

      itemInSlide++;
      const contextLabel = detectPptxParagraphContext(pEl);
      items.push({
        id: `pptx-s${slideNumber}-p${pIndex}`,
        index: items.length + 1,
        fileType: 'pptx',
        xmlPath: slidePath,
        groupNumber: slideNumber,
        paragraphIndex: pIndex,
        orderInGroup: itemInSlide,
        groupLabel: `슬라이드 ${slideNumber}`,
        locationLabel: `슬라이드 ${slideNumber} · 항목 ${itemInSlide}`,
        contextLabel,
        sourceText: text
      });
    }
  }

  return {
    fileName,
    fileType: 'pptx',
    originalBuffer: arrayBuffer,
    unitLabel: '슬라이드',
    unitCount: slidePaths.length,
    items
  };
}

function isSlideNumberOnlyParagraph(pEl) {
  const flds = getDirectChildrenByLocalName(pEl, 'fld');
  const runs = getDirectChildrenByLocalName(pEl, 'r');
  if (flds.length === 1 && runs.length === 0) {
    const fldType = (flds[0].getAttribute('type') || '').toLowerCase();
    if (fldType.includes('slidenum')) return true;
  }
  return false;
}

function extractPptxParagraphText(pEl) {
  let out = '';
  for (let i = 0; i < pEl.childNodes.length; i++) {
    const child = pEl.childNodes[i];
    if (child.nodeType !== 1) continue;
    const ln = getLocalName(child);
    if (ln === 'r' || ln === 'fld') {
      const tNodes = getDirectChildrenByLocalName(child, 't');
      for (const tNode of tNodes) {
        out += tNode.textContent || '';
      }
    } else if (ln === 'br') {
      out += '\n';
    } else if (ln === 't') {
      out += child.textContent || '';
    }
  }
  return out;
}

function detectPptxParagraphContext(pEl) {
  let curr = pEl.parentNode;
  while (curr && curr.nodeType === 1) {
    const ln = getLocalName(curr);
    if (ln === 'tc') return '표 셀';
    if (ln === 'sp') {
      const nvSpPr = getDirectChildrenByLocalName(curr, 'nvSpPr')[0];
      if (nvSpPr) {
        const nvPr = getDirectChildrenByLocalName(nvSpPr, 'nvPr')[0];
        if (nvPr) {
          const ph = getDirectChildrenByLocalName(nvPr, 'ph')[0];
          if (ph) {
            const phType = ph.getAttribute('type') || '';
            if (phType === 'title' || phType === 'ctrTitle') return '제목';
            if (phType === 'subTitle') return '부제목';
          }
        }
      }
      return '텍스트 상자';
    }
    curr = curr.parentNode;
  }
  return '본문';
}

async function extractHwpxFromZip(fileName, arrayBuffer, zip) {
  const sectionPaths = Object.keys(zip.files)
    .filter((p) => /^Contents\/section\d+\.xml$/i.test(p))
    .sort((a, b) => {
      const na = parseInt(a.match(/section(\d+)\.xml/i)[1], 10);
      const nb = parseInt(b.match(/section(\d+)\.xml/i)[1], 10);
      return na - nb;
    });

  if (sectionPaths.length === 0) {
    throw new DocumentProcessError(
      '유효한 HWPX 본문 구조를 찾을 수 없습니다',
      '파일 내부에 한글 표준 문서 본문(Contents/section*.xml)이 존재하지 않습니다.',
      '한컴오피스 한글에서 [다른 이름으로 저장하기] → "한글 표준 문서(*.hwpx)" 형식으로 저장한 파일인지 확인해 주세요.',
      'NO_HWPX_SECTIONS'
    );
  }

  const items = [];
  let globalParaNumber = 0;

  for (let sIdx = 0; sIdx < sectionPaths.length; sIdx++) {
    const sectionPath = sectionPaths[sIdx];
    const sectionNumber = sIdx + 1;
    const xmlStr = await zip.file(sectionPath).async('string');
    const doc = parseXmlStrict(xmlStr, sectionPath);

    const allElements = doc.getElementsByTagName('*');
    const paragraphs = [];
    for (let i = 0; i < allElements.length; i++) {
      if (getLocalName(allElements[i]) === 'p') {
        paragraphs.push(allElements[i]);
      }
    }

    for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
      const pEl = paragraphs[pIndex];
      const ownTNodes = getOwnHwpxTNodes(pEl);
      if (ownTNodes.length === 0) continue;

      const text = ownTNodes.map((tNode) => extractHwpxTNodeText(tNode)).join('');
      if (text.trim().length === 0) continue;

      globalParaNumber++;
      const contextLabel = detectHwpxParagraphContext(pEl);
      items.push({
        id: `hwpx-s${sectionNumber}-p${pIndex}`,
        index: globalParaNumber,
        fileType: 'hwpx',
        xmlPath: sectionPath,
        groupNumber: globalParaNumber,
        sectionNumber,
        paragraphIndex: pIndex,
        orderInGroup: globalParaNumber,
        groupLabel: `문단 ${globalParaNumber}`,
        locationLabel: sectionPaths.length > 1
          ? `섹션 ${sectionNumber} · 문단 ${globalParaNumber}`
          : `문단 ${globalParaNumber}`,
        contextLabel,
        sourceText: text
      });
    }
  }

  return {
    fileName,
    fileType: 'hwpx',
    originalBuffer: arrayBuffer,
    unitLabel: '문단',
    unitCount: items.length,
    sectionCount: sectionPaths.length,
    items
  };
}

function getOwnHwpxTNodes(pEl) {
  const result = [];
  const runs = getDirectChildrenByLocalName(pEl, 'run');
  for (const run of runs) {
    const tNodes = getDirectChildrenByLocalName(run, 't');
    for (const tNode of tNodes) {
      result.push(tNode);
    }
  }
  return result;
}

function extractHwpxTNodeText(tNode) {
  let out = '';
  for (let i = 0; i < tNode.childNodes.length; i++) {
    const child = tNode.childNodes[i];
    if (child.nodeType === 3 || child.nodeType === 4) {
      out += child.nodeValue || '';
    } else if (child.nodeType === 1) {
      const ln = getLocalName(child);
      if (ln === 'lineBreak') out += '\n';
      else if (ln === 'tab') out += '\t';
      else if (ln === 'fwSpace' || ln === 'nbSpace') out += ' ';
      else out += child.textContent || '';
    }
  }
  return out;
}

function detectHwpxParagraphContext(pEl) {
  let curr = pEl.parentNode;
  while (curr && curr.nodeType === 1) {
    const ln = getLocalName(curr);
    if (ln === 'tc') return '표 셀';
    if (ln === 'header') return '머리말';
    if (ln === 'footer') return '꼬리말';
    if (ln === 'footNote') return '각주';
    if (ln === 'endNote') return '미주';
    if (ln === 'drawText') return '글상자/도형';
    curr = curr.parentNode;
  }
  return '본문 문단';
}

async function extractDocxFromZip(fileName, arrayBuffer, zip) {
  const docPaths = Object.keys(zip.files)
    .filter((p) => /^word\/(document|header\d+|footer\d+)\.xml$/i.test(p))
    .sort((a, b) => {
      if (a.toLowerCase() === 'word/document.xml') return -1;
      if (b.toLowerCase() === 'word/document.xml') return 1;
      return a.localeCompare(b);
    });

  if (docPaths.length === 0) {
    throw new DocumentProcessError(
      '유효한 Word(.docx) 본문 구조를 찾을 수 없습니다',
      '파일 내부에 워드 본문 데이터(word/document.xml)가 존재하지 않습니다.',
      '선택한 파일이 정상적인 Word 문서(.docx) 파일인지 확인해 주세요.',
      'NO_DOCX_BODY'
    );
  }

  const items = [];
  let globalParaNumber = 0;

  for (const xmlPath of docPaths) {
    const xmlStr = await zip.file(xmlPath).async('string');
    const doc = parseXmlStrict(xmlStr, xmlPath);
    const allElements = doc.getElementsByTagName('*');
    const paragraphs = [];
    for (let i = 0; i < allElements.length; i++) {
      if (getLocalName(allElements[i]) === 'p') {
        paragraphs.push(allElements[i]);
      }
    }

    for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
      const pEl = paragraphs[pIndex];
      const text = extractDocxParagraphText(pEl);
      if (text.trim().length === 0) continue;

      globalParaNumber++;
      const contextLabel = detectDocxParagraphContext(pEl, xmlPath);
      items.push({
        id: `docx-${xmlPath.replace(/[^a-zA-Z0-9]/g, '_')}-p${pIndex}`,
        index: globalParaNumber,
        fileType: 'docx',
        xmlPath,
        groupNumber: globalParaNumber,
        paragraphIndex: pIndex,
        orderInGroup: globalParaNumber,
        groupLabel: `문단 ${globalParaNumber}`,
        locationLabel: `문단 ${globalParaNumber}`,
        contextLabel,
        sourceText: text
      });
    }
  }

  return {
    fileName,
    fileType: 'docx',
    originalBuffer: arrayBuffer,
    unitLabel: '문단',
    unitCount: items.length,
    items
  };
}

function extractDocxParagraphText(pEl) {
  let out = '';
  const runs = getDirectChildrenByLocalName(pEl, 'r');
  for (const r of runs) {
    for (let i = 0; i < r.childNodes.length; i++) {
      const child = r.childNodes[i];
      if (child.nodeType !== 1) continue;
      const ln = getLocalName(child);
      if (ln === 't') {
        out += child.textContent || '';
      } else if (ln === 'br' || ln === 'cr') {
        out += '\n';
      } else if (ln === 'tab') {
        out += '\t';
      }
    }
  }
  return out;
}

function detectDocxParagraphContext(pEl, xmlPath) {
  if (/header/i.test(xmlPath)) return '머리글';
  if (/footer/i.test(xmlPath)) return '바닥글';
  let curr = pEl.parentNode;
  while (curr && curr.nodeType === 1) {
    const ln = getLocalName(curr);
    if (ln === 'tc') return '표 셀';
    if (ln === 'txbxContent') return '글상자/도형';
    curr = curr.parentNode;
  }
  return '본문 문단';
}

async function extractXlsxFromZip(fileName, arrayBuffer, zip) {
  const items = [];
  let globalIndex = 0;

  // 1. SharedStrings table (xl/sharedStrings.xml)
  const sharedPath = 'xl/sharedStrings.xml';
  if (zip.file(sharedPath)) {
    const xmlStr = await zip.file(sharedPath).async('string');
    const doc = parseXmlStrict(xmlStr, sharedPath);
    const allElements = doc.getElementsByTagName('*');
    const siNodes = [];
    for (let i = 0; i < allElements.length; i++) {
      if (getLocalName(allElements[i]) === 'si') {
        siNodes.push(allElements[i]);
      }
    }

    for (let sIdx = 0; sIdx < siNodes.length; sIdx++) {
      const si = siNodes[sIdx];
      const text = extractXlsxSiText(si);
      if (text.trim().length === 0) continue;
      globalIndex++;
      items.push({
        id: `xlsx-ss-${sIdx}`,
        index: globalIndex,
        fileType: 'xlsx',
        xmlPath: sharedPath,
        groupNumber: Math.ceil(globalIndex / 10),
        paragraphIndex: sIdx,
        orderInGroup: globalIndex,
        groupLabel: `시트 텍스트 그룹 ${Math.ceil(globalIndex / 10)}`,
        locationLabel: `셀 텍스트 #${globalIndex}`,
        contextLabel: '엑셀 셀',
        sourceText: text
      });
    }
  }

  // 2. Inline strings in worksheets (xl/worksheets/sheet*.xml)
  const sheetPaths = Object.keys(zip.files)
    .filter((p) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(p))
    .sort();

  for (let shIdx = 0; shIdx < sheetPaths.length; shIdx++) {
    const sheetPath = sheetPaths[shIdx];
    const xmlStr = await zip.file(sheetPath).async('string');
    const doc = parseXmlStrict(xmlStr, sheetPath);
    const allElements = doc.getElementsByTagName('*');
    const isNodes = [];
    for (let i = 0; i < allElements.length; i++) {
      if (getLocalName(allElements[i]) === 'is') {
        isNodes.push(allElements[i]);
      }
    }

    for (let iIdx = 0; iIdx < isNodes.length; iIdx++) {
      const isEl = isNodes[iIdx];
      const text = extractXlsxSiText(isEl);
      if (text.trim().length === 0) continue;
      globalIndex++;
      items.push({
        id: `xlsx-sh${shIdx + 1}-is${iIdx}`,
        index: globalIndex,
        fileType: 'xlsx',
        xmlPath: sheetPath,
        groupNumber: shIdx + 1,
        paragraphIndex: iIdx,
        orderInGroup: globalIndex,
        groupLabel: `시트 ${shIdx + 1}`,
        locationLabel: `시트 ${shIdx + 1} · 셀 #${globalIndex}`,
        contextLabel: '엑셀 셀',
        sourceText: text
      });
    }
  }

  if (items.length === 0) {
    throw new DocumentProcessError(
      '추출할 텍스트 셀이 없습니다',
      '선택한 엑셀(.xlsx) 파일에서 번역할 문자열 셀을 찾지 못했습니다.',
      '문자열이 포함된 엑셀 통합 문서인지 확인해 주세요.',
      'EMPTY_XLSX_TEXT'
    );
  }

  return {
    fileName,
    fileType: 'xlsx',
    originalBuffer: arrayBuffer,
    unitLabel: '셀 항목',
    unitCount: items.length,
    items
  };
}

function extractXlsxSiText(siEl) {
  let out = '';
  const all = siEl.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) {
    if (getLocalName(all[i]) === 't') {
      out += all[i].textContent || '';
    }
  }
  return out;
}

/**
 * Rebuild a valid PPTX, HWPX, DOCX, or XLSX Uint8Array with translations applied
 * options.emptyFallback: 'keep-source' | 'empty'
 * options.outputMode: 'replace' | 'bilingual-ko-first' | 'bilingual-target-first'
 * options.autoShrinkFont: boolean (Idea #5: auto-reduce PPTX font size on text overflow)
 */
export async function buildTranslatedDocument(parsedDoc, translationsById, options = {}) {
  const { emptyFallback = 'keep-source', outputMode = 'replace', autoShrinkFont = true } = options;
  if (!parsedDoc || !parsedDoc.originalBuffer || !Array.isArray(parsedDoc.items)) {
    throw new DocumentProcessError(
      '원본 문서 정보가 없습니다',
      '변환할 원본 문서 데이터가 메모리에 존재하지 않습니다.',
      '첫 화면에서 파일을 다시 업로드한 후 진행해 주세요.',
      'MISSING_DOC_STATE'
    );
  }

  const resolvedMap = {};
  for (const item of parsedDoc.items) {
    const rawVal = translationsById[item.id];
    const trimmed = typeof rawVal === 'string' ? rawVal.trim() : '';
    const srcTrimmed = String(item.sourceText ?? '').trim();

    if (trimmed.length === 0) {
      resolvedMap[item.id] = emptyFallback === 'empty' ? '' : item.sourceText;
    } else if (outputMode === 'bilingual-ko-first') {
      resolvedMap[item.id] =
        trimmed === srcTrimmed ? item.sourceText : `${item.sourceText}\n${trimmed}`;
    } else if (outputMode === 'bilingual-target-first') {
      resolvedMap[item.id] =
        trimmed === srcTrimmed ? item.sourceText : `${trimmed}\n${item.sourceText}`;
    } else {
      resolvedMap[item.id] = rawVal;
    }
  }

  if (parsedDoc.fileType === 'pptx') {
    return await rebuildPptxUint8(parsedDoc.originalBuffer, parsedDoc.items, resolvedMap, {
      autoShrinkFont
    });
  }
  if (parsedDoc.fileType === 'hwpx') {
    return await rebuildHwpxUint8(parsedDoc.originalBuffer, parsedDoc.items, resolvedMap);
  }
  if (parsedDoc.fileType === 'docx') {
    return await rebuildDocxUint8(parsedDoc.originalBuffer, parsedDoc.items, resolvedMap);
  }
  if (parsedDoc.fileType === 'xlsx') {
    return await rebuildXlsxUint8(parsedDoc.originalBuffer, parsedDoc.items, resolvedMap);
  }
  throw new DocumentProcessError(
    '알 수 없는 파일 형식입니다',
    `지원하지 않는 문서 유형(${parsedDoc.fileType})입니다.`,
    'PPTX, HWPX, DOCX, XLSX 파일을 다시 업로드해 주세요.',
    'UNKNOWN_TYPE'
  );
}

async function rebuildPptxUint8(originalBuffer, items, resolvedMap, pptxOptions = {}) {
  const { autoShrinkFont = true } = pptxOptions;
  const JSZip = getJSZip();
  const zip = await JSZip.loadAsync(originalBuffer);
  const serializer = new XMLSerializer();

  const byPath = new Map();
  for (const item of items) {
    if (!byPath.has(item.xmlPath)) byPath.set(item.xmlPath, []);
    byPath.get(item.xmlPath).push(item);
  }

  for (const [xmlPath, slideItems] of byPath.entries()) {
    const entry = zip.file(xmlPath);
    if (!entry) {
      throw new DocumentProcessError(
        '슬라이드 XML 항목을 찾을 수 없습니다',
        `원본 파일 내 ${xmlPath} 경로가 누락되어 파일을 생성할 수 없습니다.`,
        '원본 파일을 다시 업로드한 뒤 시도해 주세요.',
        'MISSING_SLIDE_XML'
      );
    }
    const originalXml = await entry.async('string');
    const doc = parseXmlStrict(originalXml, xmlPath);

    const allElements = doc.getElementsByTagName('*');
    const paragraphs = [];
    for (let i = 0; i < allElements.length; i++) {
      if (getLocalName(allElements[i]) === 'p') {
        paragraphs.push(allElements[i]);
      }
    }

    for (const item of slideItems) {
      const targetP = paragraphs[item.paragraphIndex];
      if (!targetP) {
        throw new DocumentProcessError(
          '원본 슬라이드 문단 위치 연결 실패',
          `${item.locationLabel}의 원본 XML 위치(인덱스 ${item.paragraphIndex})를 찾을 수 없습니다.`,
          '파일을 다시 업로드하여 추출을 다시 진행해 주세요.',
          'PPTX_NODE_MISMATCH'
        );
      }
      replacePptxParagraphText(doc, targetP, resolvedMap[item.id], {
        sourceText: item.sourceText,
        autoShrinkFont
      });
    }

    const serialized = ensureXmlDeclaration(serializer.serializeToString(doc), originalXml);
    // Validate serialized XML is well-formed before writing
    parseXmlStrict(serialized, xmlPath);
    zip.file(xmlPath, serialized);
  }

  return await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

function sanitizeXml10Text(str) {
  return String(str ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');
}

function replacePptxParagraphText(doc, pEl, newText, shrinkMeta = {}) {
  const aNs = pEl.namespaceURI || 'http://schemas.openxmlformats.org/drawingml/2006/main';
  const prefix = pEl.prefix ? `${pEl.prefix}:` : 'a:';

  let firstRPr = null;
  let endParaRPr = null;
  const toRemove = [];

  for (let i = 0; i < pEl.childNodes.length; i++) {
    const child = pEl.childNodes[i];
    if (child.nodeType !== 1) continue;
    const ln = getLocalName(child);
    if (ln === 'r' || ln === 'fld') {
      if (!firstRPr) {
        const rPr = getDirectChildrenByLocalName(child, 'rPr')[0];
        if (rPr) firstRPr = rPr.cloneNode(true);
      }
      toRemove.push(child);
    } else if (ln === 'br' || ln === 't') {
      toRemove.push(child);
    } else if (ln === 'endParaRPr') {
      endParaRPr = child;
    }
  }

  // Idea #5: Automatically scale down font size when translated text is significantly longer than Korean source
  if (shrinkMeta.autoShrinkFont && firstRPr) {
    const srcLen = Math.max(1, String(shrinkMeta.sourceText || '').trim().length);
    const dstLen = String(newText || '').trim().length;
    const ratio = dstLen / srcLen;
    if (ratio >= 1.35 && dstLen > 12) {
      const scale = ratio >= 2.1 ? 0.78 : ratio >= 1.7 ? 0.84 : 0.9;
      const szAttr = firstRPr.getAttribute('sz');
      if (szAttr) {
        const currentSz = parseInt(szAttr, 10);
        if (!Number.isNaN(currentSz) && currentSz >= 1000) {
          const nextSz = Math.max(900, Math.round((currentSz * scale) / 50) * 50);
          firstRPr.setAttribute('sz', String(nextSz));
        }
      }
    }
  }

  for (const node of toRemove) {
    pEl.removeChild(node);
  }

  const lines = sanitizeXml10Text(newText).split(/\r?\n/);
  for (let idx = 0; idx < lines.length; idx++) {
    if (idx > 0) {
      const brEl = doc.createElementNS(aNs, `${prefix}br`);
      if (firstRPr) brEl.appendChild(firstRPr.cloneNode(true));
      pEl.insertBefore(brEl, endParaRPr || null);
    }
    const rEl = doc.createElementNS(aNs, `${prefix}r`);
    if (firstRPr) {
      rEl.appendChild(firstRPr.cloneNode(true));
    }
    const tEl = doc.createElementNS(aNs, `${prefix}t`);
    const lineText = lines[idx];
    if (/^\s|\s$|\s{2,}/.test(lineText)) {
      tEl.setAttribute('xml:space', 'preserve');
    }
    tEl.textContent = lineText;
    rEl.appendChild(tEl);
    pEl.insertBefore(rEl, endParaRPr || null);
  }
}

async function rebuildDocxUint8(originalBuffer, items, resolvedMap) {
  const JSZip = getJSZip();
  const zip = await JSZip.loadAsync(originalBuffer);
  const serializer = new XMLSerializer();

  const byPath = new Map();
  for (const item of items) {
    if (!byPath.has(item.xmlPath)) byPath.set(item.xmlPath, []);
    byPath.get(item.xmlPath).push(item);
  }

  for (const [xmlPath, docItems] of byPath.entries()) {
    const entry = zip.file(xmlPath);
    if (!entry) continue;
    const originalXml = await entry.async('string');
    const doc = parseXmlStrict(originalXml, xmlPath);

    const allElements = doc.getElementsByTagName('*');
    const paragraphs = [];
    for (let i = 0; i < allElements.length; i++) {
      if (getLocalName(allElements[i]) === 'p') {
        paragraphs.push(allElements[i]);
      }
    }

    for (const item of docItems) {
      const targetP = paragraphs[item.paragraphIndex];
      if (targetP) {
        replaceDocxParagraphText(doc, targetP, resolvedMap[item.id]);
      }
    }

    const serialized = ensureXmlDeclaration(serializer.serializeToString(doc), originalXml);
    parseXmlStrict(serialized, xmlPath);
    zip.file(xmlPath, serialized);
  }

  return await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

function replaceDocxParagraphText(doc, pEl, newText) {
  const wNs = pEl.namespaceURI || 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const prefix = pEl.prefix ? `${pEl.prefix}:` : 'w:';

  let firstRPr = null;
  const runs = getDirectChildrenByLocalName(pEl, 'r');
  for (const r of runs) {
    if (!firstRPr) {
      const rPr = getDirectChildrenByLocalName(r, 'rPr')[0];
      if (rPr) firstRPr = rPr.cloneNode(true);
    }
    pEl.removeChild(r);
  }

  const lines = sanitizeXml10Text(newText).split(/\r?\n/);
  const rEl = doc.createElementNS(wNs, `${prefix}r`);
  if (firstRPr) {
    rEl.appendChild(firstRPr.cloneNode(true));
  }

  for (let i = 0; i < lines.length; i++) {
    if (i > 0) {
      const brEl = doc.createElementNS(wNs, `${prefix}br`);
      rEl.appendChild(brEl);
    }
    const tEl = doc.createElementNS(wNs, `${prefix}t`);
    tEl.setAttribute('xml:space', 'preserve');
    tEl.textContent = lines[i];
    rEl.appendChild(tEl);
  }
  pEl.appendChild(rEl);
}

async function rebuildXlsxUint8(originalBuffer, items, resolvedMap) {
  const JSZip = getJSZip();
  const zip = await JSZip.loadAsync(originalBuffer);
  const serializer = new XMLSerializer();

  const byPath = new Map();
  for (const item of items) {
    if (!byPath.has(item.xmlPath)) byPath.set(item.xmlPath, []);
    byPath.get(item.xmlPath).push(item);
  }

  for (const [xmlPath, sheetItems] of byPath.entries()) {
    const entry = zip.file(xmlPath);
    if (!entry) continue;
    const originalXml = await entry.async('string');
    const doc = parseXmlStrict(originalXml, xmlPath);

    const targetTag = xmlPath === 'xl/sharedStrings.xml' ? 'si' : 'is';
    const allElements = doc.getElementsByTagName('*');
    const targetNodes = [];
    for (let i = 0; i < allElements.length; i++) {
      if (getLocalName(allElements[i]) === targetTag) {
        targetNodes.push(allElements[i]);
      }
    }

    for (const item of sheetItems) {
      const targetEl = targetNodes[item.paragraphIndex];
      if (targetEl) {
        replaceXlsxSiText(doc, targetEl, resolvedMap[item.id]);
      }
    }

    const serialized = ensureXmlDeclaration(serializer.serializeToString(doc), originalXml);
    parseXmlStrict(serialized, xmlPath);
    zip.file(xmlPath, serialized);
  }

  return await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

function replaceXlsxSiText(doc, siEl, newText) {
  const ns = siEl.namespaceURI || 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const prefix = siEl.prefix ? `${siEl.prefix}:` : '';
  while (siEl.firstChild) {
    siEl.removeChild(siEl.firstChild);
  }
  const tEl = doc.createElementNS(ns, `${prefix}t`);
  const cleaned = sanitizeXml10Text(newText);
  if (/^\s|\s$|\s{2,}|\n/.test(cleaned)) {
    tEl.setAttribute('xml:space', 'preserve');
  }
  tEl.textContent = cleaned;
  siEl.appendChild(tEl);
}

async function rebuildHwpxUint8(originalBuffer, items, resolvedMap) {
  const JSZip = getJSZip();
  const srcZip = await JSZip.loadAsync(originalBuffer);
  const serializer = new XMLSerializer();

  const modifiedXmlMap = new Map();
  const byPath = new Map();
  for (const item of items) {
    if (!byPath.has(item.xmlPath)) byPath.set(item.xmlPath, []);
    byPath.get(item.xmlPath).push(item);
  }

  for (const [xmlPath, secItems] of byPath.entries()) {
    const entry = srcZip.file(xmlPath);
    if (!entry) {
      throw new DocumentProcessError(
        'HWPX 섹션 XML 항목을 찾을 수 없습니다',
        `원본 파일 내 ${xmlPath} 경로가 누락되어 파일을 생성할 수 없습니다.`,
        '원본 파일을 다시 업로드한 뒤 시도해 주세요.',
        'MISSING_SECTION_XML'
      );
    }
    const originalXml = await entry.async('string');
    const doc = parseXmlStrict(originalXml, xmlPath);

    const allElements = doc.getElementsByTagName('*');
    const paragraphs = [];
    for (let i = 0; i < allElements.length; i++) {
      if (getLocalName(allElements[i]) === 'p') {
        paragraphs.push(allElements[i]);
      }
    }

    for (const item of secItems) {
      const targetP = paragraphs[item.paragraphIndex];
      if (!targetP) {
        throw new DocumentProcessError(
          '원본 HWPX 문단 위치 연결 실패',
          `${item.locationLabel}의 원본 XML 위치(인덱스 ${item.paragraphIndex})를 찾을 수 없습니다.`,
          '파일을 다시 업로드하여 추출을 다시 진행해 주세요.',
          'HWPX_NODE_MISMATCH'
        );
      }
      replaceHwpxParagraphText(doc, targetP, resolvedMap[item.id]);
    }

    const serialized = ensureXmlDeclaration(serializer.serializeToString(doc), originalXml);
    parseXmlStrict(serialized, xmlPath);
    modifiedXmlMap.set(xmlPath, serialized);
  }

  const outZip = new JSZip();
  // OWPML spec: mimetype must be the first entry and stored uncompressed (STORE)
  if (srcZip.file('mimetype')) {
    const mimeBytes = await srcZip.file('mimetype').async('uint8array');
    outZip.file('mimetype', mimeBytes, { compression: 'STORE' });
  } else {
    outZip.file('mimetype', 'application/hwp+zip', { compression: 'STORE' });
  }

  for (const [relativePath, entry] of Object.entries(srcZip.files)) {
    if (relativePath === 'mimetype' || entry.dir) continue;
    if (modifiedXmlMap.has(relativePath)) {
      outZip.file(relativePath, modifiedXmlMap.get(relativePath), {
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
    } else if (relativePath === 'Preview/PrvText.txt') {
      const previewLines = items.map((it) => resolvedMap[it.id] ?? it.sourceText).join('\r\n');
      outZip.file(relativePath, previewLines, {
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
    } else {
      const raw = await entry.async('uint8array');
      outZip.file(relativePath, raw, {
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
    }
  }

  return await outZip.generateAsync({ type: 'uint8array' });
}

function replaceHwpxParagraphText(doc, pEl, newText) {
  const ownTNodes = getOwnHwpxTNodes(pEl);
  if (ownTNodes.length === 0) return;

  const firstT = ownTNodes[0];
  const hpNs = firstT.namespaceURI || pEl.namespaceURI || 'http://www.hancom.co.kr/hwpml/2011/paragraph';
  const prefix = firstT.prefix ? `${firstT.prefix}:` : 'hp:';

  while (firstT.firstChild) {
    firstT.removeChild(firstT.firstChild);
  }

  const lines = sanitizeXml10Text(newText).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) {
      const lb = doc.createElementNS(hpNs, `${prefix}lineBreak`);
      firstT.appendChild(lb);
    }
    if (lines[i].length > 0 || lines.length === 1) {
      firstT.appendChild(doc.createTextNode(lines[i]));
    }
  }

  for (let i = 1; i < ownTNodes.length; i++) {
    const tNode = ownTNodes[i];
    while (tNode.firstChild) {
      tNode.removeChild(tNode.firstChild);
    }
  }

  const staleLineSegs = getDirectChildrenByLocalName(pEl, 'linesegarray');
  for (const ls of staleLineSegs) {
    pEl.removeChild(ls);
  }
}

export function buildOutputFileName(originalName, targetLangCode, fileType, outputMode = 'replace') {
  const base = (originalName || 'lesson').replace(/\.(pptx|hwpx|docx|xlsx)$/i, '');
  const safeLang = (targetLangCode || 'translated').replace(/[^a-zA-Z0-9_-]/g, '_');
  if (outputMode === 'bilingual-ko-first' || outputMode === 'bilingual-target-first') {
    return `${base}_ko_${safeLang}.${fileType}`;
  }
  return `${base}_${safeLang}.${fileType}`;
}

