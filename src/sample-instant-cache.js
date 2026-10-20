/**
 * Instant Zero-Latency Translation & Back-Translation Cache for Built-in Sample Documents
 * - Guarantees 0-second completion from Step 1 -> Step 4/5 on first visit without waiting for
 *   multi-hundred-MB browser AI model downloads or failing on browsers/languages without native API support.
 * - Strictly 100% On-Device (no external network requests).
 */

export const SAMPLE_SENTENCE_CACHE = {
  '지구와 달의 운동': {
    backKo: '지구와 달의 움직임 (자전과 공전)',
    vi: 'Chuyển động của Trái Đất và Mặt Trăng',
    'zh-Hans': '地球与月球的运动',
    tl: 'Ang Paggalaw ng Daigdig at ng Buwan',
    km: 'ចលនារបស់ផែនដី និងព្រះចន្ទ',
    ru: 'Движение Земли и Луны',
    uz: 'Yer va Oyning harakati',
    kk: 'Жер мен Айдың қозғалысы',
    ky: 'Жер менен Айдын кыймылы',
    ja: '地球と月の運動',
    mn: 'Дэлхий ба Сарны хөдөлгөөн',
    th: 'การเคลื่อนที่ของโลกและดวงจันทร์',
    en: 'Movement of the Earth and the Moon',
    es: 'El movimiento de la Tierra y la Luna',
    fr: 'Le mouvement de la Terre et de la Lune',
    pt: 'O movimento da Terra e da Lua',
    tr: 'Dünya ve Ay’ın Hareketi',
    ar: 'حركة الأرض والقمر',
    'zh-Hant': '地球與月球的運動',
    id: 'Gerakan Bumi dan Bulan',
    my: 'ကမ္ဘာနှင့် လတို့၏ ရွေ့လျားမှု',
    ne: 'पृथ्वी र चन्द्रमाको चाल',
    si: 'පෘථිවියේ සහ චන්ද්‍රයාගේ චලිතය',
    hi: 'पृथ्वी और चंद्रमा की गति',
    bn: 'পৃথিবী ও চাঁদের গতি',
    ur: 'زمین اور چاند کی حرکت'
  },
  '초등학교 6학년 1학기 과학 2단원 수업자료': {
    backKo: '초등학교 6학년 1학기 과학 2단원 학습 자료',
    vi: 'Tài liệu học tập Khoa học Khối lớp 6 Học kỳ 1 - Bài 2',
    'zh-Hans': '小学6年级第1学期科学第2单元教学资料',
    tl: 'Materyal sa Agham Baitang 6 Semestre 1 Yunit 2',
    km: 'ឯកសារមេរៀនវិទ្យាសាស្ត្រ ថ្នាក់ទី៦ ឆមាសទី១ ជំពូកទី២',
    ru: 'Учебный материал по естествознанию, 6 класс, 1 семестр, раздел 2',
    uz: 'Boshlang‘ich maktab 6-sinf 1-semestr Tabiiy fanlar 2-bo‘lim dars materiali',
    kk: 'Бастауыш мектеп 6-сынып 1-тоқсан Жаратылыстану 2-бөлім оқу материалы',
    ky: 'Башталгыч мектеп 6-класс 1-чейрек Табият таануу 2-бөлүм окуу материалы',
    ja: '小学校6学年（6年生） 1学期 理科 第2単元 授業資料',
    mn: 'Бага сургуулийн 6-р анги, 1-р улирлын Байгалийн ухааны 2-р бүлгийн хичээлийн материал',
    th: 'สื่อการเรียนวิทยาศาสตร์ ชั้นปีที่ 6 (ป.6) ภาคเรียนที่ 1 หน่วยที่ 2',
    en: 'Elementary Grade 6 Semester 1 Science Unit 2 Lesson Material',
    es: 'Material de clase de Ciencias - 6.º grado de primaria, Semestre 1, Unidad 2',
    fr: 'Support de cours de Sciences (Niveau / Classe 6e) - Semestre 1, Unité 2',
    pt: 'Material de aula de Ciências - 6.º ano, 1.º semestre, Unidade 2',
    tr: 'İlkokul 6. Sınıf Düzeyi 1. Dönem Fen Bilimleri 2. Ünite Ders Materyali',
    ar: 'مادة درس العلوم - الصف الدراسي 6 الابتدائي - الفصل 1 - الوحدة 2',
    'zh-Hant': '小學6年級第1學期科學第2單元教學資料',
    id: 'Materi Pelajaran Sains Kelas 6 SD Semester 1 Unit 2',
    my: 'မူလတန်း အတန်း 6 ပထမနှစ်ဝက် (1) သိပ္ပံ အခန်း (2) သင်ခန်းစာ',
    ne: 'प्राथमिक तह कक्षा ६ सत्र १ विज्ञान एकाइ २ पाठ सामग्री',
    si: '6 ශ්‍රේණිය 1 වාරය විද්‍යාව 2 ඒකකයේ පාඩම් මාලාව',
    hi: 'प्राथमिक विद्यालय कक्षा 6 सेमेस्टर 1 विज्ञान इकाई 2 पाठ सामग्री',
    bn: 'প্রাথমিক বিদ্যালয় ৬ষ্ঠ শ্রেণি ১ম সেমিস্টার বিজ্ঞান ২য় অধ্যায় পাঠ্য উপকরণ',
    ur: 'پرائمری اسکول جماعت 6 سمسٹر 1 سائنس یونٹ 2 تدریسی مواد'
  },
  '오늘의 학습 목표': {
    backKo: '오늘의 공부할 문제 (학습 목표)',
    vi: 'Mục tiêu học tập hôm nay',
    'zh-Hans': '今天的学习目标',
    tl: 'Mga Layunin sa Pagkatuto Ngayong Araw',
    km: 'វត្ថុបំណងនៃការរៀនថ្ងៃនេះ',
    ru: 'Цели урока на сегодня',
    uz: 'Bugungi dars maqsadi',
    kk: 'Бүгінгі оқу мақсаты',
    ky: 'Бүгүнкү окуу максаты',
    ja: '今日の学習目標',
    mn: 'Өнөөдрийн суралцах зорилго',
    th: 'จุดประสงค์การเรียนรู้วันนี้',
    en: "Today's Learning Objectives",
    es: 'Objetivos de aprendizaje de hoy',
    fr: "Objectifs d'apprentissage du jour",
    pt: 'Objetivos de aprendizagem de hoje',
    tr: 'Bugünün Öğrenme Hedefleri',
    ar: 'أهداف التعلم اليوم',
    'zh-Hant': '今天的學習目標',
    id: 'Tujuan Pembelajaran Hari Ini',
    my: 'ယနေ့ သင်ယူမှု ရည်မှန်းချက်',
    ne: 'आजको सिकाइ उद्देश्य',
    si: 'අද ඉගෙනුම් අරමුණු',
    hi: 'आज के सीखने के उद्देश्य',
    bn: 'আজকের শিখন উদ্দেশ্য',
    ur: 'آج کے سیکھنے کے مقاصد'
  },
  '하루 동안 태양과 달의 위치가 달라지는 까닭을 설명할 수 있습니다.': {
    backKo: '하루 동안 태양과 달의 위치가 바뀌는 이유를 설명할 수 있습니다.',
    vi: 'Có thể giải thích lý do vị trí của Mặt Trời và Mặt Trăng thay đổi trong một ngày.',
    'zh-Hans': '能够解释一天中太阳和月亮位置发生变化的原因。',
    tl: 'Maipapaliwanag kung bakit nagbabago ang posisyon ng Araw at Buwan sa loob ng isang araw.',
    km: 'អាចពន្យល់ពីមូលហេតុដែលទីតាំងព្រះអាទិត្យ និងព្រះចន្ទផ្លាស់ប្តូរក្នុងរយៈពេលមួយថ្ងៃ។',
    ru: 'Сможем объяснить причину изменения положения Солнца и Луны в течение дня.',
    uz: 'Kun davomida Quyosh va Oyning joylashuvi o‘zgarishi sababini tushuntira oladi.',
    kk: 'Күн мен Айдың бір тәулік ішінде орнын өзгерту себебін түсіндіре алады.',
    ky: 'Күн менен Айдын бир сутка ичинде ордун өзгөртүү себебин түшүндүрө алат.',
    ja: '一日の間に太陽と月の位置が変わる理由を説明できます。',
    mn: 'Өдрийн туршид Нар, Сарны байрлал өөрчлөгддөг шалтгааныг тайлбарлаж чадна.',
    th: 'สามารถอธิบายเหตุผลที่ตำแหน่งของดวงอาทิตย์และดวงจันทร์เปลี่ยนไปในหนึ่งวันได้',
    en: 'We can explain why the positions of the Sun and the Moon change during a day.',
    es: 'Podemos explicar por qué cambia la posición del Sol y de la Luna durante el día.',
    fr: 'Nous pouvons expliquer pourquoi la position du Soleil et de la Lune change au cours d’une journée.',
    pt: 'Podemos explicar por que a posição do Sol e da Lua muda ao longo de um dia.',
    tr: 'Gün boyunca Güneş ve Ay’ın konumunun neden değiştiğini açıklayabiliriz.',
    ar: 'يمكننا شرح سبب تغير موقع الشمس والقمر خلال اليوم.',
    'zh-Hant': '能夠解釋一天中太陽和月亮位置發生變化的原因。',
    id: 'Dapat menjelaskan alasan mengapa posisi Matahari dan Bulan berubah sepanjang hari.',
    my: 'တစ်နေ့တာအတွင်း နေနှင့်လတို့၏ တည်နေရာ ပြောင်းလဲရသည့် အကြောင်းရင်းကို ရှင်းပြနိုင်သည်။',
    ne: 'एक दिनभरिमा सूर्य र चन्द्रमाको स्थान किन बदलिन्छ भनी व्याख्या गर्न सकिन्छ।',
    si: 'දිනයක් තුළ සූර්යයාගේ සහ චන්ද්‍රයාගේ පිහිටීම වෙනස් වීමට හේතුව පැහැදිලි කළ හැකිය.',
    hi: 'हम समझा सकते हैं कि एक दिन के दौरान सूर्य और चंद्रमा की स्थिति क्यों बदलती है।',
    bn: 'দিনের বেলা সূর্য ও চাঁদের অবস্থান কেন পরিবর্তিত হয় তা ব্যাখ্যা করতে পারব।',
    ur: 'ہم وضاحت کر سکتے ہیں کہ دن کے دوران سورج اور چاند کی پوزیشن کیوں بدلتی ہے۔'
  },
  '지구의 자전이 무엇인지 모형실험으로 확인할 수 있습니다.': {
    backKo: '지구의 자전이 무엇인지 모형 실험을 통해 확인할 수 있습니다.',
    vi: 'Có thể kiểm chứng sự tự quay của Trái Đất là gì thông qua thí nghiệm mô hình.',
    'zh-Hans': '能够通过模型实验确认什么是地球的自转。',
    tl: 'Masusuri sa pamamagitan ng modelong eksperimento kung ano ang pag-ikot (rotasyon) ng Daigdig.',
    km: 'អាចផ្ទៀងផ្ទាត់ថាតើការវិលជុំវិញខ្លួនឯងរបស់ផែនដីគឺជាអ្វី តាមរយៈការពិសោធន៍គំរូ។',
    ru: 'Сможем с помощью модельного опыта убедиться, что такое вращение Земли вокруг своей оси.',
    uz: 'Yerning o‘z o‘qi atrofida aylanishi (rotatsiyasi) nima ekanligini model tajribasi orqali tekshira oladi.',
    kk: 'Жердің өз осінен айналуы не екенін модельдік тәжірибе арқылы тексере алады.',
    ky: 'Жердин өз огунда айлануусу эмне экенин моделдик тажрыйба аркылуу текшере алат.',
    ja: '地球の自転とは何かを模型実験で確認できます。',
    mn: 'Дэлхийн эргэлт гэж юу болохыг загвар туршилтаар шалгаж чадна.',
    th: 'สามารถตรวจสอบว่าการหมุนรอบตัวเองของโลกคืออะไรด้วยการทดลองแบบจำลอง',
    en: "We can verify what the Earth's rotation is through a model experiment.",
    es: 'Podemos comprobar qué es la rotación de la Tierra mediante un experimento con modelos.',
    fr: 'Nous pouvons vérifier ce qu’est la rotation de la Terre grâce à une expérience avec une maquette.',
    pt: 'Podemos verificar o que é a rotação da Terra por meio de um experimento com modelo.',
    tr: 'Dünya’nın kendi ekseni etrafında dönmesinin (rotasyonunun) ne olduğunu model deneyiyle doğrulayabiliriz.',
    ar: 'يمكننا التحقق مما هو دوران الأرض حول محورها من خلال تجربة نموذجية.',
    'zh-Hant': '能夠透過模型實驗確認什麼是地球的自轉。',
    id: 'Dapat memastikan apa itu rotasi Bumi melalui percobaan model.',
    my: 'ကမ္ဘာ့လည်ပတ်မှုဆိုသည်မှာ အဘယ်နည်းဆိုသည်ကို ပုံစံငယ်လက်တွေ့စမ်းသပ်ချက်ဖြင့် အတည်ပြုနိုင်သည်။',
    ne: 'पृथ्वीको परिभ्रमण के हो भन्ने कुरा नमुना प्रयोगबाट पुष्टि गर्न सकिन्छ।',
    si: 'පෘථිවියේ භ්‍රමණය යනු කුමක්දැයි ආකෘති පරීක්ෂණයකින් තහවුරු කර ගත හැකිය.',
    hi: 'हम मॉडल प्रयोग के माध्यम से जांच सकते हैं कि पृथ्वी का घूर्णन क्या है।',
    bn: 'মডেল পরীক্ষার মাধ্যমে পৃথিবীর আহ্নিক গতি কী তা যাচাই করতে পারব।',
    ur: 'ہم ماڈل تجربے کے ذریعے تصدیق کر سکتے ہیں کہ زمین کی محوری گردش کیا ہے۔'
  },
  '낮과 밤이 번갈아 나타나는 현상을 이해합니다.': {
    backKo: '낮과 밤이 번갈아 생기는 현상을 이해합니다.',
    vi: 'Hiểu được hiện tượng ngày và đêm xuất hiện luân phiên.',
    'zh-Hans': '理解昼夜交替出现的现象。',
    tl: 'Mauunawaan ang penomenon ng pagpapalit-palit ng araw at gabi.',
    km: 'យល់ដឹងពីបាតុភូតដែលថ្ងៃ និងយប់កើតឡើងឆ្លាស់គ្នា។',
    ru: 'Понимаем явление чередования дня и ночи.',
    uz: 'Kun va tunning almashinib kelishi hodisasini tushunadi.',
    kk: 'Күн мен түннің алма-кезек ауысу құбылысын түсінеді.',
    ky: 'Күн менен түндүн алмак-салмак алмашуу кубулушун түшүнөт.',
    ja: '昼と夜が交互に現れる現象を理解します。',
    mn: 'Өдөр, шөнө ээлжлэн солигдох үзэгдлийг ойлгоно.',
    th: 'เข้าใจปรากฏการณ์ที่กลางวันและกลางคืนเกิดขึ้นสลับกัน',
    en: 'We understand the phenomenon of day and night occurring alternately.',
    es: 'Comprendemos el fenómeno por el cual el día y la noche se alternan.',
    fr: 'Nous comprenons le phénomène d’alternance du jour et de la nuit.',
    pt: 'Compreendemos o fenômeno da alternância entre o dia e a noite.',
    tr: 'Gece ve gündüzün birbirini takip ederek oluşması olayını anlarız.',
    ar: 'نفهم ظاهرة تعاقب الليل والنهار.',
    'zh-Hant': '理解晝夜交替出現的現象。',
    id: 'Memahami fenomena terjadinya siang dan malam secara bergantian.',
    my: 'နေ့နှင့်ည တစ်လှည့်စီ ဖြစ်ပေါ်သော သဘာဝကို နားလည်သည်။',
    ne: 'दिन र रात पालैपालो देखा पर्ने प्रक्रिया बुझ्छौं।',
    si: 'දිවා කාලය සහ රාත්‍රී කාලය මාරුවෙන් මාරුවට ඇතිවීමේ සංසිද්ධිය තේරුම් ගනිමු.',
    hi: 'हम दिन और रात के बारी-बारी से होने की घटना को समझते हैं।',
    bn: 'দিন ও রাত পর্যায়ক্রমে হওয়ার ঘটনাটি বুঝতে পারি।',
    ur: 'ہم دن اور رات کے باری باری آنے کے عمل کو سمجھتے ہیں۔'
  },
  '준비물: 지구본, 손전등, 관측 기록장, 색연필': {
    backKo: '준비물: 지구본, 손전등, 관찰 기록장, 색연필',
    vi: 'Đồ dùng chuẩn bị: Quả địa cầu, đèn pin, sổ ghi chép quan sát, bút chì màu',
    'zh-Hans': '准备物品：地球仪、手电筒、观察记录本、彩色铅笔',
    tl: 'Mga Kagamitan: Globo, flashlight, kuwaderno sa pagmamasid, mga krayola/kulay',
    km: 'សម្ភារៈត្រូវត្រៀម៖ ផែនដីគំរូ (គ្លូប), ពិល, សៀវភៅកត់ត្រាការសង្កេត, ខ្មៅដៃពណ៌',
    ru: 'Необходимые материалы: глобус, фонарик, журнал наблюдений, цветные карандаши',
    uz: 'Kerakli jihozlar: globus, qo‘l chirog‘i (fonarik), kuzatuv daftari, rangli qalamlar',
    kk: 'Қажетті құралдар: глобус, қолшам, бақылау дәптері, түрлі-түсті қарындаштар',
    ky: 'Керектүү куралдар: глобус, кол чырак, байкоо дептери, түстүү карандаштар',
    ja: '準備物：地球儀、懐中電灯、観察記録帳、色鉛筆',
    mn: 'Бэлтгэх зүйлс: Глобус, гар чийдэн, ажиглалтын тэмдэглэлийн дэвтэр, өнгийн харандаа',
    th: 'อุปกรณ์ที่ต้องเตรียม: ลูกโลก, ไฟฉาย, สมุดบันทึกการสังเกต, ดินสอสี',
    en: 'Materials Needed: Globe, flashlight, observation notebook, colored pencils',
    es: 'Materiales necesarios: Globo terráqueo, linterna, cuaderno de observación, lápices de colores',
    fr: 'Matériel nécessaire : Globe terrestre, lampe de poche, carnet d’observation, crayons de couleur',
    pt: 'Materiais necessários: Globo terrestre, lanterna, caderno de observação, lápis de cor',
    tr: 'Gerekli Malzemeler: Yer küre, el feneri, gözlem defteri, kuru boya kalemleri',
    ar: 'الأدوات المطلوبة: مجسم الكرة الأرضية، مصباح يدوي، دفتر الملاحظات، أقلام ملونة',
    'zh-Hant': '準備物品：地球儀、手電筒、觀察記錄本、彩色鉛筆',
    id: 'Perlengkapan yang Diperlukan: Bola dunia (globe), senter, buku catatan pengamatan, pensil warna',
    my: 'လိုအပ်သော ပစ္စည်းများ - ကမ္ဘာလုံးပုံစံငယ်၊ လက်နှိပ်ဓာတ်မီး၊ လေ့လာမှုမှတ်တမ်းစာအုပ်၊ ရောင်စုံခဲတံ',
    ne: 'आवश्यक सामग्रीहरू: ग्लोब, टर्चलाइट, अवलोकन पुस्तिका, रङ्गीन सिसाकलम',
    si: 'අවශ්‍ය ද්‍රව්‍ය: ලෝක ගෝලය, විදුලි පන්දම, නිරීක්ෂණ සටහන් පොත, පාට පැන්සල්',
    hi: 'आवश्यक सामग्री: ग्लोब, टॉर्च, अवलोकन नोटबुक, रंगीन पेंसिलें',
    bn: 'প্রয়োজনীয় উপকরণ: গ্লোব, টর্চলাইট, পর্যবেক্ষণ খাতা, রঙিন পেন্সিল',
    ur: 'ضروری اشیاء: گلوب، ٹارچ، مشاہداتی کاپی، رنگین پنسلیں'
  },
  '탐구 활동 순서 및 유의사항': {
    backKo: '탐구 활동 순서와 주의할 점',
    vi: 'Trình tự hoạt động khám phá và lưu ý',
    'zh-Hans': '探究活动顺序及注意事项',
    tl: 'Pagkakasunod-sunod ng Gawain sa Pagsisiyasat at mga Paalala',
    km: 'លំដាប់លំដោយនៃសកម្មភាពស្រាវជ្រាវ និងចំណុចគួរប្រុងប្រយ័ត្ន',
    ru: 'Порядок исследовательской работы и правила безопасности',
    uz: 'Tadqiqot faoliyati tartibi va ehtiyot choralari',
    kk: 'Зерттеу жұмысының реті және ескертулер',
    ky: 'Изилдөө ишинин тартиби жана эскертүүлөр',
    ja: '探究活動の順序および注意事項',
    mn: 'Судалгааны үйл ажиллагааны дараалал ба анхаарах зүйлс',
    th: 'ลำดับกิจกรรมการสำรวจและข้อควรระวัง',
    en: 'Inquiry Activity Steps and Precautions',
    es: 'Pasos de la actividad de indagación y precauciones',
    fr: 'Étapes de l’activité d’exploration et consignes de sécurité',
    pt: 'Etapas da atividade de investigação e observações',
    tr: 'Araştırma Etkinliği Sırası ve Dikkat Edilecek Noktalar',
    ar: 'خطوات نشاط الاستقصاء والتنبيهات المهمة',
    'zh-Hant': '探究活動順序及注意事項',
    id: 'Urutan Kegiatan Eksplorasi dan Hal yang Perlu Diperhatikan',
    my: 'စူးစမ်းလေ့လာမှု လုပ်ငန်းစဉ်နှင့် သတိပြုရန်အချက်များ',
    ne: 'खोज क्रियाकलापको क्रम र ध्यान दिनुपर्ने कुराहरू',
    si: 'ගවේෂණ ක්‍රියාකාරකම් පිළිවෙළ සහ සැලකිලිමත් විය යුතු කරුණු',
    hi: 'खोज गतिविधि का क्रम और सावधानियाँ',
    bn: 'অনুসন্ধান কার্যক্রমের ক্রম এবং সতর্কতা',
    ur: 'تحقیقی سرگرمی کی ترتیب اور احتیاطی تدابیر'
  },
  '탐구 단계': {
    backKo: '탐구 단계',
    vi: 'Bước khám phá',
    'zh-Hans': '探究阶段',
    tl: 'Hakbang sa Pagsisiyasat',
    km: 'ដំណាក់កាលស្រាវជ្រាវ',
    ru: 'Этап исследования',
    uz: 'Tadqiqot bosqichi',
    kk: 'Зерттеу кезеңі',
    ky: 'Изилдөө баскычы',
    ja: '探究段階',
    mn: 'Судалгааны үе шат',
    th: 'ขั้นตอนการสำรวจ',
    en: 'Inquiry Step',
    es: 'Etapa de indagación',
    fr: 'Étape d’exploration',
    pt: 'Etapa de investigação',
    tr: 'Araştırma Aşaması',
    ar: 'مرحلة الاستقصاء',
    'zh-Hant': '探究階段',
    id: 'Tahap Eksplorasi',
    my: 'စူးစမ်းလေ့လာမှု အဆင့်',
    ne: 'खोज चरण',
    si: 'ගවේෂණ පියවර',
    hi: 'खोज चरण',
    bn: 'অনুসন্ধান ধাপ',
    ur: 'تحقیقی مرحلہ'
  },
  '활동 내용': {
    backKo: '활동 내용',
    vi: 'Nội dung hoạt động',
    'zh-Hans': '活动内容',
    tl: 'Nilalaman ng Gawain',
    km: 'ខ្លឹមសារសកម្មភាព',
    ru: 'Содержание работы',
    uz: 'Faoliyat mazmuni',
    kk: 'Жұмыс мазмұны',
    ky: 'Иштин мазмуну',
    ja: '活動内容',
    mn: 'Үйл ажиллагааны агуулга',
    th: 'รายละเอียดกิจกรรม',
    en: 'Activity Details',
    es: 'Contenido de la actividad',
    fr: 'Contenu de l’activité',
    pt: 'Conteúdo da atividade',
    tr: 'Etkinlik İçeriği',
    ar: 'محتوى النشاط',
    'zh-Hant': '活動內容',
    id: 'Isi Kegiatan',
    my: 'လုပ်ဆောင်ချက် အကြောင်းအရာ',
    ne: 'क्रियाकलापको विवरण',
    si: 'ක්‍රියාකාරකම් විස්තරය',
    hi: 'गतिविधि विवरण',
    bn: 'কার্যক্রমের বিবরণ',
    ur: 'سرگرمی کی تفصیل'
  },
  '1단계: 위치 맞추기': {
    backKo: '1단계: 위치 맞추기',
    vi: 'Bước 1: Xác định vị trí',
    'zh-Hans': '第1步：对准位置',
    tl: 'Hakbang 1: Itama ang Posisyon',
    km: 'ជំហានទី 1៖ កំណត់ទីតាំងឱ្យត្រូវ',
    ru: 'Шаг 1: Определение положения',
    uz: '1-bosqich: Joylashuvni moslash',
    kk: '1-қадам: Орналасуды сәйкестендіру',
    ky: '1-кадам: Жайгашууну тууралоо',
    ja: '1段階：位置を合わせる',
    mn: '1-р алхам: Байрлалыг тааруулах',
    th: 'ขั้นตอนที่ 1: จัดตำแหน่งให้ตรง',
    en: 'Step 1: Align the Position',
    es: 'Paso 1: Ajustar la posición',
    fr: 'Étape 1 : Repérer la position',
    pt: 'Passo 1: Ajustar a posição',
    tr: '1. Adım: Konumu Ayarlama',
    ar: 'الخطوة 1: ضبط الموقع',
    'zh-Hant': '第1步：對準位置',
    id: 'Langkah 1: Menyesuaikan Posisi',
    my: 'အဆင့် 1: တည်နေရာ ချိန်ညှိခြင်း',
    ne: 'चरण १: स्थान मिलाउने',
    si: '1 පියවර: පිහිටීම සකස් කිරීම',
    hi: 'चरण 1: स्थिति मिलाना',
    bn: 'ধাপ ১: অবস্থান মেলানো',
    ur: 'مرحلہ 1: پوزیشن درست کرنا'
  },
  '지구본에서 우리나라 위치를 찾아 관측자 모형을 붙입니다.': {
    backKo: '지구본에서 한국 위치를 찾아 관측자 모형을 붙입니다.',
    vi: 'Tìm vị trí Hàn Quốc trên quả địa cầu và gắn mô hình người quan sát vào.',
    'zh-Hans': '在地球仪上找到韩国的位置，贴上观测者模型。',
    tl: 'Hanapin ang lokasyon ng Korea sa globo at idikit ang modelo ng tagamasid.',
    km: 'ស្វែងរកទីតាំងប្រទេសកូរ៉េនៅលើផែនដីគំរូ រួចបិទរូបគំរូអ្នកសង្កេតការណ៍។',
    ru: 'Найдите на глобусе положение Кореи и прикрепите фигурку наблюдателя.',
    uz: 'Globusdan Koreya joylashuvini topib, kuzatuvchi modelini yopishtiring.',
    kk: 'Глобустан Кореяның орнын тауып, бақылаушы моделін жапсырыңыз.',
    ky: 'Глобустан Кореянын ордун таап, байкоочунун моделин чаптаңыз.',
    ja: '地球儀で韓国の位置を探し、観測者模型を貼ります。',
    mn: 'Глобус дээрээс Солонгос улсын байрлалыг олж, ажиглагчийн загварыг наана.',
    th: 'หาตำแหน่งของประเทศเกาหลีบนลูกโลกแล้วติดหุ่นจำลองผู้สังเกตการณ์',
    en: 'Find the location of Korea on the globe and attach the observer model.',
    es: 'Encuentra la ubicación de Corea en el globo terráqueo y coloca el modelo del observador.',
    fr: 'Trouvez l’emplacement de la Corée sur le globe et collez la figurine de l’observateur.',
    pt: 'Encontre a localização da Coreia no globo terrestre e cole o modelo do observador.',
    tr: 'Yer kürede Kore’nin konumunu bulun ve gözlemci maketini yapıştırın.',
    ar: 'ابحث عن موقع كوريا على مجسم الكرة الأرضية وألصق نموذج الراصد.',
    'zh-Hant': '在地球儀上找到韓國的位置，貼上觀測者模型。',
    id: 'Temukan lokasi Korea pada bola dunia lalu tempelkan model pengamat.',
    my: 'ကမ္ဘာလုံးပုံစံငယ်ပေါ်တွင် ကိုရီးယားနိုင်ငံ တည်နေရာကို ရှာပြီး လေ့လာသူပုံစံငယ်ကို ကပ်ပါ။',
    ne: 'ग्लोबमा कोरियाको स्थान खोजेर अवलोकनकर्ताको नमुना टाँस्नुहोस्।',
    si: 'ලෝක ගෝලයේ කොරියාවේ පිහිටීම සොයා නිරීක්ෂක ආකෘතිය අලවන්න.',
    hi: 'ग्लोब पर कोरिया का स्थान खोजें और प्रेक्षक मॉडल चिपकाएँ।',
    bn: 'গ্লোবে কোরিয়ার অবস্থান খুঁজে বের করে পর্যবেক্ষক মডেলটি লাগান।',
    ur: 'گلوب پر کوریا کا مقام تلاش کریں اور مشاہدہ کرنے والے کا ماڈل چسپاں کریں۔'
  },
  '2단계: 회전하며 관찰하기': {
    backKo: '2단계: 돌리면서 관찰하기',
    vi: 'Bước 2: Xoay và quan sát',
    'zh-Hans': '第2步：一边旋转一边观察',
    tl: 'Ika-2 Hakbang: Paikutin at Pagmasdan',
    km: 'ជំហានទី 2៖ បង្វិលហើយសង្កេតមើល',
    ru: 'Шаг 2: Вращение и наблюдение',
    uz: '2-bosqich: Aylantirib kuzatish',
    kk: '2-қадам: Айналдыра отырып бақылау',
    ky: '2-кадам: Айландырып байкоо жүргүзүү',
    ja: '2段階：回転させながら観察する',
    mn: '2-р алхам: Эргүүлэн ажиглах',
    th: 'ขั้นตอนที่ 2: หมุนและสังเกต',
    en: 'Step 2: Rotate and Observe',
    es: 'Paso 2: Girar y observar',
    fr: 'Étape 2 : Faire tourner et observer',
    pt: 'Passo 2: Girar e observar',
    tr: '2. Adım: Döndürerek Gözlemleme',
    ar: 'الخطوة 2: التدوير والملاحظة',
    'zh-Hant': '第2步：一邊旋轉一邊觀察',
    id: 'Langkah 2: Memutar dan Mengamati',
    my: 'အဆင့် 2: လှည့်ပတ်၍ လေ့လာကြည့်ရှုခြင်း',
    ne: 'चरण २: घुमाउँदै अवलोकन गर्ने',
    si: '2 පියවර: කරකවමින් නිරීක්ෂණය කිරීම',
    hi: 'चरण 2: घुमाते हुए अवलोकन करना',
    bn: 'ধাপ ২: ঘুরিয়ে পর্যবেক্ষণ করা',
    ur: 'مرحلہ 2: گھماتے ہوئے مشاہدہ کرنا'
  },
  '손전등 빛을 비추고 지구본을 서쪽에서 동쪽으로 천천히 돌립니다.': {
    backKo: '손전등 불빛을 비추면서 지구본을 서쪽에서 동쪽으로 천천히 회전시킵니다.',
    vi: 'Chiếu ánh sáng đèn pin vào và xoay quả địa cầu chậm rãi từ Tây sang Đông.',
    'zh-Hans': '用手电筒照射，并将地球仪从西向东慢慢转动。',
    tl: 'Tutukan ng ilaw ng flashlight at dahan-dahang paikutin ang globo mula Kanluran papuntang Silangan.',
    km: 'បញ្ចាំងភ្លើងពិល រួចបង្វិលផែនដីគំរូយឺតៗពីទិសខាងលិចទៅទិសខាងកើត។',
    ru: 'Направьте свет фонарика и медленно вращайте глобус с запада на восток.',
    uz: 'Qo‘l chirog‘i nurini tushirib, globusni g‘arbdan sharqqa qarab sekin aylantiring.',
    kk: 'Қолшам жарығын түсіріп, глобусты батыстан шығысқа қарай баяу айналдырыңыз.',
    ky: 'Кол чырактын жарыгын тийгизип, глобусту батыштан чыгышка карай акырын айландырыңыз.',
    ja: '懐中電灯の光を当てて、地球儀を西から東へゆっくり回します。',
    mn: 'Гар чийдэнгийн гэрэл тусгаж, глобусыг баруунаас зүүн тийш удаан эргүүлнэ.',
    th: 'ส่องไฟฉายแล้วค่อยๆ หมุนลูกโลกจากทิศตะวันตกไปทิศตะวันออกอย่างช้าๆ',
    en: 'Shine the flashlight and slowly rotate the globe from west to east.',
    es: 'Ilumina con la linterna y gira lentamente el globo terráqueo de oeste a este.',
    fr: 'Éclairez avec la lampe de poche et faites tourner lentement le globe d’ouest en est.',
    pt: 'Ilumine com a lanterna e gire lentamente o globo terrestre de oeste para leste.',
    tr: 'El feneri ışığını tutun ve yer küreyi batıdan doğuya doğru yavaşça döndürün.',
    ar: 'سلّط ضوء المصباح اليدوي وأدر مجسم الكرة الأرضية ببطء من الغرب إلى الشرق.',
    'zh-Hant': '用手電筒照射，並將地球儀從西向東慢慢轉動。',
    id: 'Arahkan cahaya senter lalu putar bola dunia secara perlahan dari barat ke timur.',
    my: 'လက်နှိပ်ဓာတ်မီးထိုးပြီး ကမ္ဘာလုံးပုံစံငယ်ကို အနောက်မှ အရှေ့သို့ ဖြည်းညှင်းစွာ လှည့်ပါ။',
    ne: 'टर्चलाइटको उज्यालो पारेर ग्लोबलाई पश्चिमबाट पूर्वतिर बिस्तारै घुमाउनुहोस्।',
    si: 'විදුලි පන්දම් ආලෝකය එල්ල කර ලෝක ගෝලය බටහිර සිට නැගෙනහිරට සෙමින් කරකවන්න.',
    hi: 'टॉर्च की रोशनी डालें और ग्लोब को पश्चिम से पूर्व की ओर धीरे-धीरे घुमाएँ।',
    bn: 'টর্চলাইটের আলো ফেলুন এবং গ্লোবটিকে পশ্চিম থেকে পূর্ব দিকে ধীরে ধীরে ঘোরান।',
    ur: 'ٹارچ کی روشنی ڈالیں اور گلوب کو مغرب سے مشرق کی طرف آہستہ آہستہ گھمائیں۔'
  },
  // ==================== HWPX SAMPLE ITEMS ====================
  '[6학년 과학] 지구와 달의 운동 실험 활동지': {
    backKo: '[6학년 과학] 지구와 달의 운동 실험 활동지',
    vi: '[Khoa học Khối lớp 6] Phiếu hoạt động thí nghiệm: Chuyển động của Trái Đất và Mặt Trăng',
    'zh-Hans': '[6年级科学] 地球与月球的运动实验活动单',
    tl: '[Agham Baitang 6] Activity Sheet / Worksheet sa Eksperimento: Paggalaw ng Daigdig at Buwan',
    km: '[វិទ្យាសាស្ត្រថ្នាក់ទី៦] សន្លឹកកិច្ចការពិសោធន៍៖ ចលនារបស់ផែនដី និងព្រះចន្ទ',
    ru: '[Естествознание, 6 класс] Рабочий лист эксперимента: Движение Земли и Луны',
    uz: '[6-sinf Tabiiy fanlar] Yer va Oyning harakati tajriba Ish varaqasi',
    kk: '[6-сынып Жаратылыстану] Жер мен Айдың қозғалысы тәжірибелік жұмыс парағы',
    ky: '[6-класс Табият таануу] Жер менен Айдын кыймылы тажрыйба иш барагы',
    ja: '[6学年（6年生） 理科] 地球と月の運動 実験ワークシート',
    mn: '[6-р анги Байгалийн ухаан] Дэлхий ба Сарны хөдөлгөөн туршилтын ажлын хуудас',
    th: '[วิทยาศาสตร์ ชั้นปีที่ 6] ใบกิจกรรม / ใบงานการทดลอง เรื่อง การเคลื่อนที่ของโลกและดวงจันทร์',
    en: '[Grade 6 Science] Earth and Moon Movement Experiment Activity Sheet',
    es: '[Ciencias 6.º grado] Hoja de actividades de experimento: Movimiento de la Tierra y la Luna',
    fr: "[Sciences Niveau / Classe 6e] Fiche d'activité d'expérience : Le mouvement de la Terre et de la Lune",
    pt: '[Ciências 6.º ano] Folha de atividades: Movimento da Terra e da Lua',
    tr: '[6. Sınıf Düzeyi Fen] Dünya ve Ay’ın Hareketi Deney Çalışma Kağıdı',
    ar: '[علوم الصف الدراسي 6] ورقة عمل تجربة حركة الأرض والقمر',
    'zh-Hant': '[6年級科學] 地球與月球的運動實驗學習單',
    id: '[Sains Kelas 6] Lembar Kerja Eksperimen Gerakan Bumi dan Bulan',
    my: '[အတန်း 6 သိပ္ပံ] ကမ္ဘာနှင့် လတို့၏ ရွေ့လျားမှု လက်တွေ့စမ်းသပ်ချက် လေ့ကျင့်ခန်းစာရွက်',
    ne: '[कक्षा ६ विज्ञान] पृथ्वी र चन्द्रमाको चाल प्रयोगात्मक कार्यपत्र',
    si: '[6 ශ්‍රේණිය විද්‍යාව] පෘථිවියේ සහ චන්ද්‍රයාගේ චලිතය පරීක්ෂණ ක්‍රියාකාරකම් පත්‍රිකාව',
    hi: '[कक्षा 6 विज्ञान] पृथ्वी और चंद्रमा की गति प्रयोग कार्यपत्रक',
    bn: '[৬ষ্ঠ শ্রেণির বিজ্ঞান] পৃথিবী ও চাঁদের গতি পরীক্ষণ অনুশীলন পত্র',
    ur: '[جماعت 6 سائنس] زمین اور چاند کی حرکت کا تجرباتی ورک شیٹ'
  },
  '1. 학습 목표: 지구의 자전으로 인해 낮과 밤이 생기는 원리를 설명할 수 있다.': {
    backKo: '1. 학습 목표: 지구의 자전 때문에 낮과 밤이 생기는 원리를 설명할 수 있다.',
    vi: '1. Mục tiêu học tập: Giải thích được nguyên lý hình thành ngày và đêm do sự tự quay của Trái Đất.',
    'zh-Hans': '1. 学习目标：能够解释由于地球自转而产生昼夜交替的原理。',
    tl: '1. Mga Layunin sa Pagkatuto: Maipapaliwanag ang prinsipyo kung paano nagkakaroon ng araw at gabi dahil sa pag-ikot ng Daigdig.',
    km: '1. វត្ថុបំណងនៃការរៀន៖ អាចពន្យល់ពីគោលការណ៍ដែលបង្កើតឱ្យមានថ្ងៃ និងយប់ដោយសារការវិលជុំវិញខ្លួនឯងរបស់ផែនដី។',
    ru: '1. Цели урока: Объяснить принцип смены дня и ночи вследствие вращения Земли вокруг своей оси.',
    uz: '1. Dars maqsadi: Yerning o‘z o‘qi atrofida aylanishi tufayli kun va tun hosil bo‘lishi tamoyilini tushuntira oladi.',
    kk: '1. Оқу мақсаты: Жердің өз осінен айналуы салдарынан күн мен түннің пайда болу принципін түсіндіре алады.',
    ky: '1. Окуу максаты: Жердин өз огунда айлануусунан улам күн менен түндүн пайда болуу принцибин түшүндүрө алат.',
    ja: '1. 学習目標：地球の自転によって昼と夜ができる仕組みを説明できる。',
    mn: '1. Суралцах зорилго: Дэлхийн эргэлтийн улмаас өдөр, шөнө үүсэх зарчмыг тайлбарлаж чадна.',
    th: '1. จุดประสงค์การเรียนรู้: อธิบายหลักการเกิดกลางวันและกลางคืนจากการหมุนรอบตัวเองของโลกได้',
    en: "1. Learning Objectives: Explain the principle of how day and night occur due to the Earth's rotation.",
    es: '1. Objetivos de aprendizaje: Explicar el principio de cómo se producen el día y la noche debido a la rotación de la Tierra.',
    fr: "1. Objectifs d'apprentissage : Expliquer le principe de l'apparition du jour et de la nuit dû à la rotation de la Terre.",
    pt: '1. Objetivos de aprendizagem: Explicar o princípio de como surgem o dia e a noite devido à rotação da Terra.',
    tr: '1. Öğrenme Hedefleri: Dünya’nın kendi ekseni etrafında dönmesiyle gece ve gündüzün oluşma ilkesini açıklayabilir.',
    ar: '1. أهداف التعلم: شرح مبدأ حدوث الليل والنهار بسبب دوران الأرض حول محورها.',
    'zh-Hant': '1. 學習目標：能夠解釋由於地球自轉而產生晝夜交替的原理。',
    id: '1. Tujuan Pembelajaran: Dapat menjelaskan prinsip terjadinya siang dan malam akibat rotasi Bumi.',
    my: '1. သင်ယူမှု ရည်မှန်းချက် - ကမ္ဘာ့လည်ပတ်မှုကြောင့် နေ့နှင့်ည ဖြစ်ပေါ်လာပုံ သဘောတရားကို ရှင်းပြနိုင်သည်။',
    ne: '1. सिकाइ उद्देश्य: पृथ्वीको परिभ्रमणका कारण दिन र रात हुने सिद्धान्त व्याख्या गर्न सकिन्छ।',
    si: '1. ඉගෙනුම් අරමුණු: පෘථිවියේ භ්‍රමණය හේතුවෙන් දිවා රාත්‍රී ඇතිවන ආකාරය පැහැදිලි කළ හැකිය.',
    hi: '1. सीखने के उद्देश्य: पृथ्वी के घूर्णन के कारण दिन और रात होने के सिद्धांत को समझा सकते हैं।',
    bn: '1. শিখন উদ্দেশ্য: পৃথিবীর আহ্নিক গতির কারণে দিন ও রাত হওয়ার মূলনীতি ব্যাখ্যা করতে পারব।',
    ur: '1. سیکھنے کے مقاصد: زمین کی محوری گردش کی وجہ سے دن اور رات بننے کے اصول کی وضاحت کر سکتے ہیں۔'
  },
  '2. 실험 준비물 안내\n지구본 1개, 손전등 1개, 관측자 모형 스티커': {
    backKo: '2. 실험 준비물 안내\n지구본 1개, 손전등 1개, 관측자 모형 스티커',
    vi: '2. Hướng dẫn Đồ dùng chuẩn bị thí nghiệm\n1 quả địa cầu, 1 đèn pin, nhãn dán mô hình người quan sát',
    'zh-Hans': '2. 实验准备物品指南\n地球仪1个、手电筒1个、观测者模型贴纸',
    tl: '2. Gabay sa Mga Kagamitan sa Eksperimento\n1 globo, 1 flashlight, sticker ng modelo ng tagamasid',
    km: '2. ការណែនាំអំពីសម្ភារៈត្រូវត្រៀមសម្រាប់ពិសោធន៍\nផែនដីគំរូ 1, ពិល 1, ស្ទីគ័ររូបគំរូអ្នកសង្កេតការណ៍',
    ru: '2. Необходимые материалы для эксперимента\n1 глобус, 1 фонарик, наклейка с фигуркой наблюдателя',
    uz: '2. Tajriba uchun Kerakli jihozlar\n1 ta globus, 1 ta qo‘l chirog‘i, kuzatuvchi modeli stikeri',
    kk: '2. Тәжірибеге Қажетті құралдар\n1 глобус, 1 қолшам, бақылаушы моделі стикері',
    ky: '2. Тажрыйбага Керектүү куралдар\n1 глобус, 1 кол чырак, байкоочунун модели чаптамасы',
    ja: '2. 実験準備物の案内\n地球儀1個、懐中電灯1個、観測者模型ステッカー',
    mn: '2. Туршилтад Бэлтгэх зүйлс\nГлобус 1 ш, гар чийдэн 1 ш, ажиглагчийн загвар наалт',
    th: '2. แนะนำอุปกรณ์ที่ต้องเตรียมสำหรับการทดลอง\nลูกโลก 1 ลูก, ไฟฉาย 1 กระบอก, สติกเกอร์หุ่นจำลองผู้สังเกตการณ์',
    en: '2. Experiment Materials Needed Guide\n1 globe, 1 flashlight, observer model sticker',
    es: '2. Guía de Materiales necesarios del experimento\n1 globo terráqueo, 1 linterna, pegatina del modelo de observador',
    fr: "2. Liste du Matériel nécessaire d'expérience\n1 globe terrestre, 1 lampe de poche, autocollant de l'observateur",
    pt: '2. Guia de Materiais necessários do experimento\n1 globo terrestre, 1 lanterna, adesivo do modelo de observador',
    tr: '2. Deney İçin Gerekli Malzemeler Rehberi\n1 adet yer küre, 1 adet el feneri, gözlemci maketi çıkartması',
    ar: '2. دليل الأدوات المطلوبة للتجربة\nمجسم كرة أرضية 1، مصباح يدوي 1، ملصق نموذج الراصد',
    'zh-Hant': '2. 實驗準備物品指南\n地球儀1個、手電筒1個、觀測者模型貼紙',
    id: '2. Panduan Perlengkapan yang Diperlukan Eksperimen\n1 bola dunia, 1 senter, stiker model pengamat',
    my: '2. လက်တွေ့စမ်းသပ်ချက်အတွက် လိုအပ်သော ပစ္စည်းများ လမ်းညွှန်\nကမ္ဘာလုံး ၁ လုံး၊ လက်နှိပ်ဓာတ်မီး ၁ လက်၊ လေ့လာသူပုံစံငယ် စတစ်ကာ',
    ne: '2. प्रयोगात्मक आवश्यक सामग्रीहरू जानकारी\nग्लोब १ थान, टर्चलाइट १ थान, अवलोकनकर्ता नमुना स्टिकर',
    si: '2. පරීක්ෂණය සඳහා අවශ්‍ය ද්‍රව්‍ය මාර්ගෝපදේශය\nලෝක ගෝල 1ක්, විදුලි පන්දම් 1ක්, නිරීක්ෂක ආකෘති ස්ටිකරය',
    hi: '2. प्रयोग आवश्यक सामग्री जानकारी\n1 ग्लोब, 1 टॉर्च, प्रेक्षक मॉडल स्टिकर',
    bn: '2. পরীক্ষণের প্রয়োজনীয় উপকরণ নির্দেশিকা\n১টি গ্লোব, ১টি টর্চলাইট, পর্যবেক্ষক মডেলের স্টিকার',
    ur: '2. تجربے کے لیے ضروری اشیاء کی معلومات\n1 گلوب، 1 ٹارچ، مشاہدہ کار ماڈل اسٹیکر'
  },
  '3. 모둠별 관찰 기록표': {
    backKo: '3. 모둠별 관찰 기록표',
    vi: '3. Bảng ghi chép quan sát theo nhóm',
    'zh-Hans': '3. 小组观察记录表',
    tl: '3. Tala ng Obserbasyon ng Bawat Pangkat',
    km: '3. តារាងកំណត់ត្រាសង្កេតតាមក្រុម',
    ru: '3. Запись наблюдений по группам (таблица)',
    uz: '3. Guruhlar bo‘yicha Kuzatuv qaydlari jadvali',
    kk: '3. Топтық Бақылау жазбасы кестесі',
    ky: '3. Топтор боюнча Байкоо жазуусу таблицасы',
    ja: '3. グループ別観察記録表',
    mn: '3. Багийн ажиглалтын тэмдэглэлийн хүснэгт',
    th: '3. ตารางบันทึกการสังเกตประจำกลุ่ม',
    en: '3. Group Observation Record Table',
    es: '3. Tabla de registro de observación por grupo',
    fr: "3. Journal d'observation par groupe (tableau)",
    pt: '3. Tabela de registro de observação por grupo',
    tr: '3. Grup Gözlem Kaydı Tablosu',
    ar: '3. جدول سجل الملاحظة حسب المجموعة',
    'zh-Hant': '3. 小組觀察記錄表',
    id: '3. Tabel Catatan Pengamatan Kelompok',
    my: '3. အဖွဲ့လိုက် လေ့လာမှတ်သားချက် ဇယား',
    ne: '3. समूहगत अवलोकन अभिलेख तालिका',
    si: '3. කණ්ඩායම් නිරීක්ෂණ සටහන වගුව',
    hi: '3. समूहवार अवलोकन रिकॉर्ड तालिका',
    bn: '3. দলগত পর্যবেক্ষণ রেকর্ড সারণি',
    ur: '3. گروپ کے لحاظ سے مشاہداتی ریکارڈ جدول'
  },
  '관찰 항목': {
    backKo: '관찰 항목',
    vi: 'Hạng mục quan sát',
    'zh-Hans': '观察项目',
    tl: 'Aytem sa Pagmamasid',
    km: 'ចំណុចសង្កេត',
    ru: 'Объект наблюдения',
    uz: 'Kuzatuv bandi',
    kk: 'Бақылау тармағы',
    ky: 'Байкоо пункту',
    ja: '観察項目',
    mn: 'Ажиглах зүйл',
    th: 'หัวข้อการสังเกต',
    en: 'Observation Item',
    es: 'Elemento de observación',
    fr: 'Élément observé',
    pt: 'Item de observação',
    tr: 'Gözlem Maddesi',
    ar: 'عنصر الملاحظة',
    'zh-Hant': '觀察項目',
    id: 'Item Pengamatan',
    my: 'လေ့လာရန် အချက်',
    ne: 'अवलोकन बुँदा',
    si: 'නිරීක්ෂණ අංගය',
    hi: 'अवलोकन बिंदु',
    bn: 'পর্যবেক্ষণ বিষয়',
    ur: 'مشاہدے کا نکتہ'
  },
  '관찰 결과 기록하기': {
    backKo: '관찰 결과 기록하기',
    vi: 'Ghi chép kết quả quan sát',
    'zh-Hans': '记录观察结果',
    tl: 'Itala ang Resulta ng Pagmamasid',
    km: 'កត់ត្រាទុកលទ្ធផលនៃការសង្កេត',
    ru: 'Запись результатов наблюдения',
    uz: 'Kuzatuv natijasini yozib olish',
    kk: 'Бақылау нәтижесін жазу',
    ky: 'Байкоо жыйынтыгын жазуу',
    ja: '観察結果を記録する',
    mn: 'Ажиглалтын үр дүнг тэмдэглэх',
    th: 'บันทึกผลการสังเกต',
    en: 'Record Observation Results',
    es: 'Registrar los resultados de la observación',
    fr: 'Noter les résultats de l’observation',
    pt: 'Registrar os resultados da observação',
    tr: 'Gözlem Sonuçlarını Kaydetme',
    ar: 'تسجيل نتائج الملاحظة',
    'zh-Hant': '記錄觀察結果',
    id: 'Mencatat Hasil Pengamatan',
    my: 'လေ့လာတွေ့ရှိချက် ရလဒ်ကို မှတ်တမ်းတင်ခြင်း',
    ne: 'अवलोकन नतिजा टिपोट गर्ने',
    si: 'නිරීක්ෂණ ප්‍රතිඵල සටහන් කිරීම',
    hi: 'अवलोकन परिणाम दर्ज करें',
    bn: 'পর্যবেক্ষণের ফলাফল লিপিবদ্ধ করা',
    ur: 'مشاہدے کے نتائج درج کریں'
  },
  '빛을 받는 쪽(낮)': {
    backKo: '빛을 받는 쪽 (낮)',
    vi: 'Phía nhận được ánh sáng (Ban ngày)',
    'zh-Hans': '受光的一面（白天）',
    tl: 'Panig na Tinatamaan ng Liwanag (Araw)',
    km: 'ផ្នែកដែលទទួលពន្លឺ (ពេលថ្ងៃ)',
    ru: 'Освещённая сторона (День)',
    uz: 'Yorug‘lik tushayotgan tomon (Kunduz)',
    kk: 'Жарық түсетін жағы (Күндіз)',
    ky: 'Жарык тийген тарап (Күндүз)',
    ja: '光を受ける側（昼）',
    mn: 'Гэрэл тусаж буй тал (Өдөр)',
    th: 'ด้านที่ได้รับแสง (กลางวัน)',
    en: 'Side receiving light (Daytime)',
    es: 'Lado que recibe la luz (Día)',
    fr: 'Côté éclairé (Jour)',
    pt: 'Lado que recebe luz (Dia)',
    tr: 'Işık Alan Taraf (Gündüz)',
    ar: 'الجانب المواجه للضوء (النهار)',
    'zh-Hant': '受光的一面（白天）',
    id: 'Sisi yang terkena cahaya (Siang)',
    my: 'အလင်းရောင် ရရှိသောဘက် (နေ့ဘက်)',
    ne: 'उज्यालो पर्ने भाग (दिउँसो)',
    si: 'ආලෝකය ලැබෙන පැත්ත (දිවා කාලය)',
    hi: 'रोशनी पड़ने वाला भाग (दिन)',
    bn: 'আলো পাওয়া দিক (দিন)',
    ur: 'روشنی پڑنے والی سمت (دن)'
  },
  '손전등 빛이 직접 비추어 밝게 보입니다.': {
    backKo: '손전등 불빛이 직접 비춰서 밝게 보입니다.',
    vi: 'Ánh sáng đèn pin chiếu trực tiếp vào nên nhìn thấy sáng rõ.',
    'zh-Hans': '手电筒的光直接照射，看起来很明亮。',
    tl: 'Direktang tinatamaan ng liwanag ng flashlight kaya maliwanag itong nakikita.',
    km: 'ពន្លឺពិលបញ្ចាំងចំដោយផ្ទាល់ ធ្វើឱ្យមើលឃើញភ្លឺច្បាស់។',
    ru: 'Свет фонарика падает прямо, поэтому эта сторона выглядит ярко освещённой.',
    uz: 'Qo‘l chirog‘i nuri bevosita tushgani uchun yorug‘ bo‘lib ko‘rinadi.',
    kk: 'Қолшам жарығы тікелей түскендіктен жарық болып көрінеді.',
    ky: 'Кол чырактын жарыгы түз тийгендиктен жарык болуп көрүнөт.',
    ja: '懐中電灯の光が直接当たり、明るく見えます。',
    mn: 'Гар чийдэнгийн гэрэл шууд тусаж байгаа тул гэрэлтэй харагдана.',
    th: 'แสงไฟฉายส่องโดยตรงจึงทำให้มองเห็นสว่างชัดเจน',
    en: 'It looks bright because the flashlight beam shines directly on it.',
    es: 'Se ve brillante porque la luz de la linterna ilumina directamente.',
    fr: 'Elle paraît lumineuse car la lampe de poche l’éclaire directement.',
    pt: 'Parece iluminado porque a luz da lanterna incide diretamente.',
    tr: 'El feneri ışığı doğrudan vurduğu için aydınlık görünür.',
    ar: 'يبدو مضيئاً لأن ضوء المصباح اليدوي يسلط عليه مباشرة.',
    'zh-Hant': '手電筒的光直接照射，看起來很明亮。',
    id: 'Terlihat terang karena cahaya senter menyinari secara langsung.',
    my: 'လက်နှိပ်ဓာတ်မီး အလင်းရောင် တိုက်ရိုက်ကျရောက်သောကြောင့် လင်းထိန်စွာ မြင်ရသည်။',
    ne: 'टर्चलाइटको उज्यालो सिधै परेकोले उज्यालो देखिन्छ।',
    si: 'විදුලි පන්දම් ආලෝකය සෘජුවම වැටෙන බැවින් දීප්තිමත්ව පෙනේ.',
    hi: 'टॉर्च की रोशनी सीधे पड़ने के कारण यह उज्ज्वल दिखाई देता है।',
    bn: 'টর্চলাইটের আলো সরাসরি পড়ায় এটি উজ্জ্বল দেখায়।',
    ur: 'ٹارچ کی روشنی براہِ راست پڑنے کی وجہ سے یہ روشن نظر آتا ہے۔'
  },
  '4. 정리 질문: 지구가 자전하는 방향은 어느 방향인가요?': {
    backKo: '4. 마무리 질문: 지구가 자전하는 방향은 어느 쪽인가요?',
    vi: '4. Câu hỏi tổng kết: Trái Đất tự quay theo hướng nào?',
    'zh-Hans': '4. 总结问题：地球自转的方向是哪个方向？',
    tl: '4. Tanong sa Pagbubuod: Saang direksyon umiikot ang Daigdig?',
    km: '4. សំណួរសង្ខេប៖ តើផែនដីវិលជុំវិញខ្លួនឯងតាមទិសណា?',
    ru: '4. Итоговый вопрос: В каком направлении вращается Земля?',
    uz: '4. Yakuniy savol: Yer qaysi yo‘nalishda o‘z o‘qi atrofida aylanadi?',
    kk: '4. Қорытынды сұрақ: Жер өз осінен қай бағытта айналады?',
    ky: '4. Жыйынтыктоочу суроо: Жер өз огунда кайсы багытتا айланат?',
    ja: '4. まとめの質問：地球が自転する向きはどの方向ですか？',
    mn: '4. Дүгнэлт асуулт: Дэлхий аль чиглэлд эргэдэг вэ?',
    th: '4. คำถามสรุป: โลกหมุนรอบตัวเองไปในทิศทางใด?',
    en: '4. Review Question: In which direction does the Earth rotate?',
    es: '4. Pregunta de repaso: ¿En qué dirección gira la Tierra?',
    fr: '4. Question bilan : Dans quel sens la Terre tourne-t-elle sur elle-même ?',
    pt: '4. Pergunta de revisão: Em que direção a Terra gira?',
    tr: '4. Değerlendirme Sorusu: Dünya kendi ekseni etrafında hangi yönde döner?',
    ar: '4. سؤال المراجعة: في أي اتجاه تدور الأرض حول محورها؟',
    'zh-Hant': '4. 總結問題：地球自轉的方向是哪個方向？',
    id: '4. Pertanyaan Rangkuman: Ke arah manakah Bumi berotasi?',
    my: '4. ပြန်လည်သုံးသပ်ရန် မေးခွန်း - ကမ္ဘာသည် မည်သည့်ဦးတည်ချက်သို့ လည်ပတ်သနည်း?',
    ne: '4. सारांश प्रश्न: पृथ्वी कुन दिशामा घुम्छ?',
    si: '4. සමාලෝචන ප්‍රශ්නය: පෘථිවිය භ්‍රමණය වන්නේ කුමන දිශාවටද?',
    hi: '4. समीक्षा प्रश्न: पृथ्वी किस दिशा में घूमती है?',
    bn: '4. সারসংক্ষেপ প্রশ্ন: পৃথিবী কোন দিকে ঘোরে?',
    ur: '4. جائزہ سوال: زمین کس سمت میں گھومتی ہے؟'
  }
};

/**
 * Lookup instant pre-verified translation for built-in sample sentences.
 * Supports exact multi-line or line-by-line lookup.
 */
export function lookupInstantSampleTranslation(sourceText, langKey) {
  const raw = String(sourceText ?? '');
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/\r\n/g, '\n');
  const directEntry = SAMPLE_SENTENCE_CACHE[normalized];
  if (directEntry && directEntry[langKey]) {
    return {
      translated: directEntry[langKey],
      backKo: directEntry.backKo || normalized,
      isSampleCache: true
    };
  }

  // Check if all non-empty lines exist in SAMPLE_SENTENCE_CACHE
  const lines = normalized.split('\n');
  if (lines.length > 1) {
    const outLines = [];
    const backLines = [];
    let allMatched = true;
    for (const line of lines) {
      const l = line.trim();
      if (!l) {
        outLines.push('');
        backLines.push('');
        continue;
      }
      const entry = SAMPLE_SENTENCE_CACHE[l];
      if (entry && entry[langKey]) {
        outLines.push(entry[langKey]);
        backLines.push(entry.backKo || l);
      } else {
        allMatched = false;
        break;
      }
    }
    if (allMatched) {
      return {
        translated: outLines.join('\n'),
        backKo: backLines.join('\n'),
        isSampleCache: true
      };
    }
  }

  return null;
}

/**
 * Checks whether a parsed document matches our built-in sample documents
 */
export function isBuiltInSampleDocument(parsedDoc) {
  if (!parsedDoc || !Array.isArray(parsedDoc.items) || parsedDoc.items.length === 0) {
    return false;
  }
  let matchCount = 0;
  for (const item of parsedDoc.items) {
    const normalized = String(item.sourceText ?? '').trim().replace(/\r\n/g, '\n');
    if (SAMPLE_SENTENCE_CACHE[normalized]) {
      matchCount++;
    }
  }
  return matchCount >= Math.ceil(parsedDoc.items.length * 0.7);
}

/**
 * Offline school dictionary & pattern-based draft generator for unsupported browser/language combinations.
 * Replaces known school glossary terms inside the sentence so teachers never face a blank screen.
 */
export function generateSchoolDictionaryDraft(sourceText, langKey, glossaryEntries = []) {
  const raw = String(sourceText ?? '').trim();
  if (!raw) return { translated: '', backKo: '', matchedCount: 0 };

  const sampleHit = lookupInstantSampleTranslation(raw, langKey);
  if (sampleHit) {
    return {
      translated: sampleHit.translated,
      backKo: sampleHit.backKo,
      matchedCount: 1,
      isSampleCache: true
    };
  }

  // Sort glossary terms by Korean length descending so longer phrases match first
  const sortedEntries = [...glossaryEntries]
    .filter((e) => e && e.ko && e.translations && e.translations[langKey])
    .sort((a, b) => b.ko.length - a.ko.length);

  let working = raw;
  let matchedCount = 0;
  const matchedPairs = [];

  for (const entry of sortedEntries) {
    const koTerm = entry.ko.trim();
    const targetTerm = entry.translations[langKey];
    if (!koTerm || !targetTerm) continue;
    if (working === koTerm) {
      return {
        translated: targetTerm,
        backKo: koTerm,
        matchedCount: 1
      };
    }
    if (working.includes(koTerm)) {
      working = working.split(koTerm).join(targetTerm);
      matchedCount++;
      matchedPairs.push(`${koTerm} → ${targetTerm}`);
    }
  }

  if (matchedCount > 0) {
    return {
      translated: working,
      backKo: `[학교 표준용어 ${matchedCount}건 자동 치환] ${raw}`,
      matchedCount
    };
  }

  return {
    translated: raw,
    backKo: raw,
    matchedCount: 0
  };
}
