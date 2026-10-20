import qrcode from '../vendor/qrcode-generator.mjs';

// Bound density/encoding work; never substitute the app homepage for a worksheet.
export const MAX_STUDENT_QR_URL_LENGTH = 1800;
export function createStudentQrDataUrl(shareUrl) {
  if (typeof shareUrl !== 'string' || !shareUrl) {
    return { dataUrl: null, message: '공유 링크를 만들 수 없습니다. 문서를 다시 확인해 주세요.' };
  }
  if (shareUrl.length > MAX_STUDENT_QR_URL_LENGTH) {
    return { dataUrl: null, message: '활동지 내용이 길어 QR은 만들지 않았습니다. 아래 학생용 링크를 복사해 공유하세요. 앱 첫 화면 QR로 대체하지 않습니다.' };
  }
  try {
    const qr = qrcode(0, 'M');
    qr.addData(shareUrl, 'Byte');
    qr.make();
    return { dataUrl: qr.createDataURL(4, 16), message: '✓ QR을 이 기기에서 생성했습니다. 외부 QR 서비스로 문서 내용을 보내지 않습니다.' };
  } catch {
    return { dataUrl: null, message: 'QR을 생성하지 못했습니다. 아래 학생용 링크를 복사해 공유하세요.' };
  }
}
