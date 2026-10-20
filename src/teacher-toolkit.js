/**
 * Teacher Toolkit Module
 * - Idea #7: Ready-to-use Multilingual School Notice Templates (25 languages)
 * - Idea #8: Classroom Communication TTS & Pronunciation Cards (25 languages)
 * - Idea #6: External AI (ChatGPT / Gemini / Claude) Prompt Generator
 * - Idea #9: Student Mobile Reader URL Payload Encoder/Decoder & Offline SVG QR Code Generator
 */

import { getTargetLanguageMeta } from './translator-service.js';
import { findMatchingGlossaryTerms } from './school-glossary.js';

/**
 * Idea #8: Classroom Communication Cards (25 Languages + Korean Phonetic Guide)
 */
export const CLASSROOM_COMMUNICATION_CARDS = [
  {
    id: 'comm-1',
    category: '수업 시작·집중',
    ko: '자리에 앉아서 교과서를 펴 주세요.',
    pronunciation: {
      en: '플리즈 해브 어 시트 앤 오픈 유어 텍스트북.',
      'zh-Hans': '칭 쭈어하오, 다카이 커번.',
      vi: '신 하이 응오이 바오 쪼 바 머 사익 자오 코아.',
      ja: '세키니 스왓테 쿄오카쇼오 히라이테 쿠다사이.',
      ru: 'Пожалуйста, садитесь и откройте учеб_원어민 발음 듣기 권장',
      'zh-Hant': '칭 쭈어하오, 다카이 커번.',
      es: '포르 파보르, 시엔테세 이 아브라 수 리브로 데 텍스토.',
      fr: '아세예-부 에 우브레 보트르 마뉘엘, 실 부 플레.',
      ar: '민 파들리크 이즐리스 와 이프타흐 알키타브 알마드라시.',
      th: '카루나 낙 롱 래 퍼드 낭스 리얀 카/크랍.'
    },
    translations: {
      en: 'Please take your seat and open your textbook.',
      'zh-Hans': '请坐好，打开课本。',
      vi: 'Xin hãy ngồi vào chỗ và mở sách giáo khoa ra.',
      ja: '席に座って教科書を開いてください。',
      ru: 'Пожалуйста, садитесь на место и откройте учебник.',
      'zh-Hant': '請坐好，打開課本。',
      uz: "Iltimos, joyingizga o'tiring va darslikni oching.",
      mn: 'Суудалдаа суугаад сурах бичгээ дэлгэнэ үү.',
      th: 'กรุณานั่งประจำที่และเปิดหนังสือเรียน',
      km: 'សូមអង្គុយចុះ ហើយបើកសៀវភៅសិក្សា។',
      tl: 'Mangyaring umupo at buksan ang inyong aklat.',
      id: 'Silakan duduk dan buka buku pelajaran kalian.',
      my: 'ကျေးဇူးပြု၍ နေရာတွင်ထိုင်ပြီး ကျောင်းသုံးစာအုပ်ကို ဖွင့်ပါ။',
      ne: 'कृपया आफ्नो ठाउँमा बस्नुहोस् र पाठ्यपुस्तक खोल्नुहोस्।',
      si: 'කරුණාකර අසුන් ගෙන පෙළපොත පෙරළන්න.',
      hi: 'कृपया अपनी सीट पर बैठें और पाठ्यपुस्तक खोलें।',
      bn: 'অনুগ্রহ করে নিজের জায়গায় বসো এবং পাঠ্যবই খোলো।',
      ur: 'براہ کرم اپنی نشست پر بیٹھیں اور نصابی کتاب کھولیں۔',
      kk: 'Орныңызға отырып, оқулықты ашуыңызды сұраймын.',
      ky: 'Ордуңузга отуруп, окуу китебин ачыңыз.',
      ar: 'من فضلك اجلس في مكانك وافتح الكتاب المدرسي.',
      es: 'Por favor, siéntate en tu lugar y abre el libro de texto.',
      fr: 'Veuillez vous asseoir et ouvrir votre manuel scolaire.',
      pt: 'Por favor, sente-se no seu lugar e abra o livro didático.',
      tr: 'Lütfen yerinize oturun ve ders kitabınızı açın.'
    }
  },
  {
    id: 'comm-2',
    category: '수업 시작·집중',
    ko: '선생님 설명을 잘 듣고 화면을 보세요.',
    pronunciation: {
      en: '플리즈 리슨 케어풀리 앤 룩 앳 더 스크린.',
      'zh-Hans': '칭 팅 라오시 지앙지에, 칸 핑무.',
      vi: '하이 랑 응에 꼬/터이 지앙 바 닌 렌 만 힌.',
      ja: '센세이노 세츠메이오 요쿠 키이테 가멘오 미테 쿠다사이.'
    },
    translations: {
      en: 'Please listen carefully to the teacher and look at the screen.',
      'zh-Hans': '请仔细听老师讲解，看屏幕。',
      vi: 'Hãy lắng nghe giáo viên giảng giải và nhìn lên màn hình.',
      ja: '先生の説明をよく聞いて、画面を見てください。',
      ru: 'Внимательно слушайте учителя и смотрите на экран.',
      'zh-Hant': '請仔細聽老師講解，看螢幕。',
      uz: "O'qituvchining tushuntirishini diqqat bilan tinglang va ekranga qarang.",
      mn: 'Багшийн тайлбарыг анхааралтай сонсоод дэлгэц рүү харна уу.',
      th: 'กรุณาตั้งใจฟังครูอธิบายและดูที่หน้าจอ',
      km: 'សូមตั้งចិត្តស្ដាប់គ្រូពន្យល់ ហើយមើលទៅលើ الشاشة (អេក្រង់)។',
      tl: 'Makinig nang mabuti sa guro at tumingin sa screen.',
      id: 'Dengarkan penjelasan guru baik-baik dan lihat ke layar.',
      my: 'ဆရာရှင်းပြသည်ကို သေချာနားထောင်ပြီး မျက်နှာပြင်ကို ကြည့်ပါ။',
      ne: 'शिक्षकको कुरा ध्यानपूर्वक सुन्नुहोस् र स्क्रिनमा हेर्नुहोस्।',
      si: 'ගුරුතුමාගේ පැහැදිලි කිරීම හොඳින් අසා තිරය දෙස බලන්න.',
      hi: 'कृपया शिक्षक की बात ध्यान से सुनें और स्क्रीन पर देखें।',
      bn: 'মনোযোগ দিয়ে শিক্ষকের কথা শোনো এবং স্ক্রিনের দিকে তাকাও।',
      ur: 'استاد کی بات غور سے سنیں اور اسکرین کی طرف دیکھیں۔',
      kk: 'Мұғалімнің түсіндіруін мұқият тыңдап, экранға қараңыз.',
      ky: 'Мугалимдин түшүндүрмөсүн кунт коюп угуп, экранды караңыз.',
      ar: 'استمع جيداً لشرح المعلم وانظر إلى الشاشة.',
      es: 'Escucha atentamente la explicación del profesor y mira la pantalla.',
      fr: "Écoutez attentivement l'explication de l'enseignant et regardez l'écran.",
      pt: 'Ouça com atenção a explicação do professor e olhe para a tela.',
      tr: 'Lütfen öğretmeni dikkatle dinleyin ve ekrana bakın.'
    }
  },
  {
    id: 'comm-3',
    category: '활동지·모둠 활동',
    ko: '활동지 맨 위에 학년, 반, 이름을 적어 주세요.',
    pronunciation: {
      en: '플리즈 라이트 유어 그레이드, 클래스, 앤 네임 앳 더 탑.',
      'zh-Hans': '칭 짜이 활동지 딩부 시에상 니앤지, 반지 허 싱밍.',
      vi: '하이 비엣 코이, 럽 바 텐 어 쩐 다우 파이우 혹 떱.',
      ja: '프린토노 우에니 가쿠넨, 쿠미, 나마에오 카이테 쿠다사이.'
    },
    translations: {
      en: 'Please write your grade, class, and name at the top of the worksheet.',
      'zh-Hans': '请在活动纸顶部写上年级、班级和姓名。',
      vi: 'Hãy viết khối, lớp và họ tên ở phía trên phiếu học tập.',
      ja: 'ワークシートの一番上に学年・組・名前を書いてください。',
      ru: 'Напишите свой класс и имя в верхней части рабочего листа.',
      'zh-Hant': '請在學習單頂部寫上學年、班級和姓名。',
      uz: 'Ish varaqasining yuqori qismiga sinf va ism-sharifingizni yozing.',
      mn: 'Ажлын хуудасны дээд хэсэгт анги, нэрээ бичнэ үү.',
      th: 'กรุณาเขียนชั้นเรียน ห้อง และชื่อ-นามสกุลที่ด้านบนของใบงาน',
      km: 'សូមសរសេរថ្នាក់ និងឈ្មោះរបស់អ្នកនៅផ្នែកខាងលើនៃសន្លឹកកិច្ចការ។',
      tl: 'Isulat ang iyong baitang, seksyon, at pangalan sa itaas ng worksheet.',
      id: 'Tuliskan kelas dan nama lengkap di bagian atas lembar kerja.',
      my: 'လုပ်ငန်းစာရွက်၏ အပေါ်ဆုံးတွင် အတန်းနှင့် အမည်ကို ရေးပါ။',
      ne: 'कार्यपत्रकको माथिल्लो भागमा आफ्नो कक्षा र नाम लेख्नुहोस्।',
      si: 'ක්‍රියාකාරකම් පත්‍රිකාවේ ඉහළින් ඔබේ ශ්‍රේණිය, පන්තිය සහ නම ලියන්න.',
      hi: 'वर्कशीट के सबसे ऊपर अपनी कक्षा और नाम लिखें।',
      bn: 'ওয়ার্কশিটের উপরে তোমার শ্রেণি, শাখা এবং নাম লেখো।',
      ur: 'ورک شیٹ کے اوپری حصے میں اپنی جماعت اور نام لکھیں۔',
      kk: 'Жұмыс парағының жоғарғы жағына сыныбыңызды және аты-жөніңізді жазыңыз.',
      ky: 'Иш барагынын жогору жагына классыңызды жана аты-жөнүңүздү жазыңыз.',
      ar: 'يرجى كتابة الصف والاسم في أعلى ورقة العمل.',
      es: 'Escribe tu grado, grupo y nombre en la parte superior de la hoja de trabajo.',
      fr: 'Veuillez écrire votre classe et votre nom en haut de la fiche.',
      pt: 'Escreva sua série, turma e nome no topo da folha de atividades.',
      tr: 'Çalışma kağıdının üst kısmına sınıfınızı ve adınızı yazın.'
    }
  },
  {
    id: 'comm-4',
    category: '활동지·모둠 활동',
    ko: '모둠 친구들과 함께 이야기하며 과제를 해결해 보세요.',
    pronunciation: {
      en: '톡 위드 유어 그룹 멤버스 앤 솔브 더 태스크 투게더.',
      'zh-Hans': '칭 허 샤오쭈 통슈에 이치 타오룬 빙 완청 과체.',
      vi: '하이 타오 루언 중 버이 반 총 놈 데 호안 탄 바이 떱.',
      ja: '구루푸노 미나산토 하나시아이나가라 카다이오 토이테 미마쇼오.'
    },
    translations: {
      en: 'Discuss with your group members and work on the task together.',
      'zh-Hans': '请和小组同学一起讨论并完成任务。',
      vi: 'Hãy thảo luận cùng các bạn trong nhóm để giải quyết nhiệm vụ.',
      ja: 'グループの友達と話し合いながら課題に取り組んでみましょう。',
      ru: 'Обсудите задание с ребятами в группе и выполните его вместе.',
      'zh-Hant': '請和小組同學一起討論並完成任務。',
      uz: "Guruhdagi do'stlaringiz bilan maslahatlashib, topshiriqni birga bajaring.",
      mn: 'Багийн найзуудтайгаа ярилцаж даалгавраа хамтдаа хийгээрэй.',
      th: 'ลองพูดคุยปรึกษากับเพื่อนในกลุ่มเพื่อทำภารกิจร่วมกัน',
      km: 'សូមពិភាក្សាជាមួយមិត្តភក្តិក្នុងក្រុម ដើម្បីដោះស្រាយកិច្ចការជាមួយគ្នា។',
      tl: 'Makipag-usap sa iyong mga kagrupo atlutasin ang gawain nang magkakasama.',
      id: 'Diskusikan dengan teman sekelompokmu dan selesaikan tugas bersama-sama.',
      my: 'အဖွဲ့ဝင်သူငယ်ချင်းများနှင့် ဆွေးနွေးပြီး လုပ်ငန်းတာဝန်ကို အတူတကွ ဖြေရှင်းကြည့်ပါ။',
      ne: 'समूहका साथीहरूसँग छलफल गर्दै सँगै गृहकार्य/कार्य पूरा गर्नुहोस्।',
      si: 'කණ්ඩායමේ මිතුරන් සමඟ සාකච්ඡා කරමින් පැවරුම එක්ව විසඳන්න.',
      hi: 'अपने समूह के दोस्तों के साथ चर्चा करें और मिलकर कार्य पूरा करें।',
      bn: 'দলের বন্ধুদের সাথে আলোচনা করে একসাথে কাজটি সমাধান করো।',
      ur: 'اپنے گروپ کے ساتھیوں سے بات چیت کریں اور مل کر کام مکمل کریں۔',
      kk: 'Топтағы достарыңызбен ақылдаса отырып, тапсырманы бірге орындаңыз.',
      ky: 'Топтогу досторуңуз менен кеңешип, тапшырманы чогуу аткарыңыз.',
      ar: 'تحدث مع زملائك في المجموعة وحلوا المهمة معاً.',
      es: 'Habla con los compañeros de tu grupo y resuelvan la tarea juntos.',
      fr: 'Discutez avec les membres de votre groupe et réalisez la tâche ensemble.',
      pt: 'Converse com os colegas do seu grupo e resolvam a tarefa juntos.',
      tr: 'Grup arkadaşlarınızla konuşarak görevi birlikte çözmeye çalışın.'
    }
  },
  {
    id: 'comm-5',
    category: '도움 확인·격려',
    ko: '모르는 단어나 어려운 부분이 있으면 손을 들어 주세요.',
    pronunciation: {
      en: '이프 유 해브 애니 디피컬트 파트, 플리즈 레이즈 유어 핸드.',
      'zh-Hans': '루구어 유 부동 더 츠위 후어 난디앤, 칭 쥐쇼우.',
      vi: '네우 꼬 뜨 카오 호악 판 나오 코 히에우, 하이 저 따이 렌.',
      ja: '와카라나이 코토바야 무즈카시이 토코로가 아레바 테오 아게테 쿠다사이.'
    },
    translations: {
      en: 'If there is an unfamiliar word or difficult part, please raise your hand.',
      'zh-Hans': '如果有不懂的词语或困难的地方，请举手。',
      vi: 'Nếu có từ chưa biết hoặc phần nào khó hiểu, em hãy giơ tay nhé.',
      ja: 'わからない言葉や難しいところがあれば、手を挙げてください。',
      ru: 'Если есть незнакомые слова или что-то непонятно, поднимите руку.',
      'zh-Hant': '如果有不懂的詞語或困難的地方，請舉手。',
      uz: "Tushunmagan so'z yoki qiyin joyi bo'lsa, qo'lingizni ko'taring.",
      mn: 'Мэдэхгүй үг эсвэл ойлгохгүй зүйл байвал гараа өргөөрэй.',
      th: 'หากมีคำศัพท์ที่ไม่เข้าใจหรือส่วนที่ยาก กรุณายกมือขึ้น',
      km: 'ប្រសិនបើមានពាក្យមិនចេះ ឬចំណុចពិបាក សូមលើកដៃឡើង។',
      tl: 'Kung may hindi alam na salita o mahirap na bahagi, itaas lang ang kamay.',
      id: 'Jika ada kata yang belum dimengerti atau bagian yang sulit, silakan angkat tangan.',
      my: 'နားမလည်သော စကားလုံး သို့မဟုတ် ခက်ခဲသောအပိုင်းရှိပါက လက်ထောင်ပြပါ။',
      ne: 'نबुझेको शब्द वा गाह्रो भाग छ भने कृपया हात उठाउनुहोस्।',
      si: 'නොදන්නා වචනයක් හෝ අපහසු කොටසක් ඇත්නම් කරුණාකර අත ඔසවන්න.',
      hi: 'यदि कोई अनजान शब्द या कठिन भाग हो, तो कृपया अपना हाथ उठाएँ।',
      bn: 'কোনো অজানা শব্দ বা কঠিন অংশ থাকলে অনুগ্রহ করে হাত তোলো।',
      ur: 'اگر کوئی مشکل لفظ یا بات سمجھ نہ آئے تو براہ کرم ہاتھ اٹھائیں۔',
      kk: 'Түсініксіз сөз немесе қиын жері болса, қолыңызды көтеріңіз.',
      ky: 'Түшүнүксүз сөз же кыйын жери болсо, колуңузду көтөрүңүз.',
      ar: 'إذا كانت هناك كلمة غير مفهومة أو جزء صعب، يرجى رفع يدك.',
      es: 'Si hay alguna palabra que no entiendas o algo difícil, levanta la mano.',
      fr: "S'il y a un mot inconnu ou une partie difficile, veuillez lever la main.",
      pt: 'Se houver alguma palavra desconhecida ou parte difícil, levante a mão.',
      tr: 'Bilmediğiniz bir kelime veya zor bir kısım varsa lütfen elinizi kaldırın.'
    }
  },
  {
    id: 'comm-6',
    category: '도움 확인·격려',
    ko: '천천히 해도 괜찮아요. 아주 잘하고 있어요!',
    pronunciation: {
      en: '잇츠 오케이 투 고 슬로울리. 유 아 두잉 어 그레이트 잡!',
      'zh-Hans': '만만 라이 메이 관시, 니 쭈어 더 페이창 하오!',
      vi: '람 뜨 뜨 궁 카옹 사오 다우. 엠 람 똣 람!',
      ja: '윳쿠리데 다이죠오부데스요. 토테모 요쿠 데키테 이마스!'
    },
    translations: {
      en: "It's okay to take your time. You are doing a great job!",
      'zh-Hans': '慢慢来没关系，你做得非常好！',
      vi: 'Làm từ từ cũng không sao đâu. Em đang làm rất tốt!',
      ja: 'ゆっくりで大丈夫ですよ。とてもよくできています！',
      ru: 'Ничего страшного, если медленно. Ты отлично справляешься!',
      'zh-Hant': '慢慢來沒關係，你做得非常好！',
      uz: "Shoshilmasangiz ham bo'ladi. Juda yaxshi bajaryapsiz!",
      mn: 'Удаан хийсэн ч зүгээр шүү. Маш сайн хийж байна!',
      th: 'ค่อยๆ ทำก็ได้ ไม่เป็นไร เก่งมากเลย!',
      km: 'ធ្វើមួយៗក៏មិនអីដែរ។ អ្នកทำបានល្អណាស់!',
      tl: 'ayos lang kahit dahan-dahan. Napakahusay ng ginagawa mo!',
      id: 'Tidak apa-apa pelan-pelan saja. Kamu melakukannya dengan sangat baik!',
      my: 'ဖြည်းဖြည်းချင်းလုပ်လည်း ရပါတယ်။ အရမ်းတော်ပါတယ်!',
      ne: 'बिस्तारै गर्दा पनि ठीक छ। तिमीले धेरै राम्रो गरिरहेका छौ!',
      si: 'හෙමින් කළාට කමක් නැහැ. ඔබ ඉතා හොඳින් කරනවා!',
      hi: 'धीरे-धीरे करने में कोई बात नहीं। आप बहुत अच्छा कर रहे हैं!',
      bn: 'ধীরে ধীরে করলেও কোনো সমস্যা নেই। তুমি খুব ভালো করছ!',
      ur: 'آہستہ کرنے میں کوئی حرج نہیں۔ آپ بہت اچھا کر رہے ہیں!',
      kk: 'Асықпай жасасаңыз да болады. Өте жақсы орындап жатырсыз!',
      ky: 'Шашпай кылсаңыз деле болот. Абдан жакшы аткарып жатасыз!',
      ar: 'لا بأس أن تعمل ببطء. أنت تقوم بعمل رائع!',
      es: 'Está bien ir despacio. ¡Lo estás haciendo muy bien!',
      fr: 'Prenez votre temps, ce n’est pas grave. Vous travaillez très bien !',
      pt: 'Tudo bem fazer devagar. Você está indo muito bem!',
      tr: 'Yavaş yapsan da sorun değil. Çok iyi gidiyorsun!'
    }
  },
  {
    id: 'comm-7',
    category: '제출·마무리',
    ko: '다 쓴 활동지는 선생님께 제출해 주세요.',
    pronunciation: {
      en: '플리즈 핸드 인 유어 피니시드 워크시트 투 더 티처.',
      'zh-Hans': '칭 바 시에하오 더 활동지 지아오 게이 라오시.',
      vi: '하이 놉 파이우 혹 떱 다 호안 탄 초 자오 비엔.',
      ja: '카키오왓타 프린토와 센세이니 다시테 쿠다사이.'
    },
    translations: {
      en: 'Please submit your completed worksheet to the teacher.',
      'zh-Hans': '请把写好的活动纸交给老师。',
      vi: 'Hãy nộp phiếu học tập đã hoàn thành cho giáo viên.',
      ja: '書き終わったワークシートは先生に提出してください。',
      ru: 'Сдайте заполненный рабочий лист учителю.',
      'zh-Hant': '請把寫好的學習單交給老師。',
      uz: "Yozib bo'lingan ish varaqasini o'qituvchiga topshiring.",
      mn: 'Бичиж дууссан ажлын хуудсаа багшдаа хураалгана уу.',
      th: 'กรุณาส่งใบงานที่ทำเสร็จแล้วให้คุณครู',
      km: 'សូមប្រគល់សន្លឹកកិច្ចការដែលបានធ្វើរួចជូនគ្រូ។',
      tl: 'Ipasa sa guro ang natapos na worksheet.',
      id: 'Silakan kumpulkan lembar kerja yang sudah selesai kepada guru.',
      my: 'ရေးပြီးသွားသော လုပ်ငန်းစာရွက်ကို ဆရာ့ထံ အပ်နှံပါ။',
      ne: 'पूरा गरेको कार्यपत्रक शिक्षकलाई बुझाउनुहोस्।',
      si: 'ලියා අවසන් කළ ක්‍රියාකාරකම් පත්‍රිකාව ගුරුතුමාට භාර දෙන්න.',
      hi: 'पूरा किया गया वर्कशीट कृपया शिक्षक को जमा करें।',
      bn: 'লেখা শেষ হলে ওয়ার্কশিটটি শিক্ষকের কাছে জমা দাও।',
      ur: 'مکمل شدہ ورک شیٹ استاد کے पास جمع کرائیں۔',
      kk: 'Толтырылған жұмыс парағын мұғалімге тапсырыңыз.',
      ky: 'Толтурулган иш барагын мугалимге тапшырыңыз.',
      ar: 'يرجى تسليم ورقة العمل المكتملة إلى المعلم.',
      es: 'Por favor, entrega la hoja de trabajo terminada al profesor.',
      fr: 'Veuillez remettre votre fiche terminée à l’enseignant.',
      pt: 'Por favor, entregue a folha de atividades concluída ao professor.',
      tr: 'Tamamladığınız çalışma kağıdını lütfen öğretmene teslim edin.'
    }
  },
  {
    id: 'comm-8',
    category: '제출·마무리',
    ko: '가정통신문을 가방에 넣고 부모님께 꼭 보여 드리세요.',
    pronunciation: {
      en: '풋 더 스쿨 레터 인 유어 백 앤 쇼 잇 투 유어 패런츠.',
      'zh-Hans': '칭 바 지아장 통즈단 팡진 슈바오, 이딩 게이 푸무 칸.',
      vi: '하이 깟 테오 통 바오 바오 깝 바 니어 듭 초 보 메 셈.',
      ja: '오테가미오 카반니 이레테, 오우치노 히토니 카나라즈 미세테 쿠다사이.'
    },
    translations: {
      en: 'Put the school newsletter in your bag and make sure to show it to your parents.',
      'zh-Hans': '请把家长通知单放进书包，一定拿给父母看。',
      vi: 'Hãy cất thư thông báo vào cặp và nhớ đưa cho bố mẹ xem nhé.',
      ja: 'お便りをかばんに入れて、お家の人に必ず見せてください。',
      ru: 'Положите школьное уведомление в портфель и обязательно покажите родителям.',
      'zh-Hant': '請把家長通知單放進書包，一定拿給父母看。',
      uz: "Maktab xabarnomasini sumkangizga solib, albatta ota-onangizga ko'rsating.",
      mn: 'Эцэг эхийн мэдэгдлийг цүнхэндээ хийгээд аав ээждээ заавал үзүүлээрэй.',
      th: 'เก็บจดหมายข่าวโรงเรียนใส่กระเป๋าและนำไปให้ผู้ปกครองดูด้วยนะ',
      km: 'សូមដាក់លិខិតជូនដំណឹងในកាតាប ហើយកុំភ្លេចបង្ហាញជូនឪពុកម្ដាយ។',
      tl: 'Ilagay ang liham mula sa paaralan sa iyong bag at ipakita ito sa iyong mga magulang.',
      id: 'Masukkan surat pemberitahuan sekolah ke dalam tas dan pastikan ditunjukkan kepada orang tua.',
      my: 'ကျောင်းအကြောင်းကြားစာကို လွယ်အိတ်ထဲထည့်ပြီး မိဘများကို သေချာပြပါ။',
      ne: 'अभिभावक सूचना पत्र झोलामा राख्नुहोस् र अभिभावकलाई अवश्य देखाउनुहोस्।',
      si: 'දෙමාපිය දැනුම්දීමේ ලිපිය බෑගයේ දමාගෙන දෙමාපියන්ට අනිවාර්යයෙන්ම පෙන්වන්න.',
      hi: 'स्कूल सूचना पत्र को अपने बैग में रखें और माता-पिता को अवश्य दिखाएँ।',
      bn: 'স্কুলের বিজ্ঞপ্তিটি ব্যাগে রাখো এবং অবশ্যই বাবা-মাকে দেখাবে।',
      ur: 'اسکول کا اطلاع نامہ اپنے بیگ میں رکھیں اور والدین کو ضرور دکھائیں۔',
      kk: 'Ата-ана хабарламасын сөмкеге салып, ата-анаңызға міндетті түрде көрсетіңіз.',
      ky: 'Ата-энелерге билдирмени сумкага салып, ата-энеңизге сөзсүз көрсөтүңүз.',
      ar: 'ضع رسالة المدرسة في حقيبتك وتأكد من إظهارها لوالديك.',
      es: 'Guarda el comunicado escolar en tu mochila y asegúrate de mostrárselo a tus padres.',
      fr: 'Mettez la lettre d’information dans votre sac et montrez-la bien à vos parents.',
      pt: 'Coloque o comunicado escolar na mochila e não deixe de mostrar aos seus pais.',
      tr: 'Veli bilgilendirme mektubunu çantanıza koyun ve mutlaka аilenize gösterin.'
    }
  }
];

/**
 * Idea #7: Ready-to-use School Notice & Homeroom Templates
 */
export const SCHOOL_NOTICE_TEMPLATES = [
  {
    id: 'tpl-supply',
    category: '알림장·준비물',
    title: '미술·실험 수업 준비물 안내',
    ko: '[알림장] 내일 수업 준비물은 가위, 풀, 색연필입니다. 이름표를 붙여서 가방에 챙겨 보내 주세요.',
    translations: {
      en: '[School Notice] Tomorrow’s class supplies are scissors, glue, and colored pencils. Please label them with your child’s name and pack them in their bag.',
      'zh-Hans': '【班级通知】明天上课需要准备剪刀、胶水和彩色铅笔。请贴上名字并放进书包里。',
      vi: '[Thông báo] Đồ dùng học tập cho buổi học ngày mai gồm kéo, hồ dán và bút chì màu. Xin phụ huynh ghi tên học sinh và chuẩn bị vào cặp giúp em.',
      ja: '【連絡帳】明日の授業の持ち物は、はさみ・のり・色鉛筆です。名前を書いてかばんに入れて持たせてください。',
      ru: '[Объявление] На завтрашний урок понадобятся ножницы, клей и цветные карандаши. Пожалуйста, подпишите их и положите в портфель.',
      tl: '[Paalala ng Paaralan] Ang mga gamit sa klase bukas ay gunting, pandikit (glue), at mga krayola/kulay. Pakilagyan ng pangalan ng bata at ilagay sa bag.',
      km: '[សេចក្តីជូនដំណឹង] សម្ភារៈសិក្សាសម្រាប់ថ្ងៃស្អែករួមមាន កន្ត្រៃ កាវបិទ និងខ្មៅដៃពណ៌។ សូមបិទឈ្មោះសិស្ស ហើយដាក់ក្នុងកាតាបឱ្យកូនផង។',
      uz: '[Maktab xabarnomasi] Ertangi dars uchun kerakli jihozlar: qaychi, yelim va rangli qalamlar. Iltimos, ism-sharifini yozib sumkasiga solib bering.',
      kk: '[Мектеп хабарламасы] Ертеңгі сабаққа қажетті құралдар: қайшы, желім және түрлі-түсті қарындаштар. Аты-жөнін жазып, сөмкесіне салып жіберіңіз.',
      ky: '[Мектеп билдирмеси] Эртеңки сабакка керектүү куралдар: кайчы, желим жана түстүү карандаштар. Аты-жөнүн жазып, сумкасына салып бериңиз.',
      mn: '[Ангийн мэдэгдэл] Маргаашийн хичээлд бэлтгэх зүйлс бол хайч, цавуу, өнгийн харандаа юм. Нэрийг нь бичээд цүнхэнд нь хийж явуулна уу.',
      th: '[แจ้งเตือนประจำวัน] อุปกรณ์การเรียนสำหรับวันพรุ่งนี้คือ กรรไกร กาว และดินสอสี กรุณาติดป้ายชื่อและจัดใส่กระเป๋านักเรียนมาด้วย',
      es: '[Aviso escolar] Los materiales para la clase de mañana son tijeras, pegamento y lápices de colores. Por favor, póngales una etiqueta con el nombre y guárdelos en la mochila.',
      fr: '[Avis scolaire] Le matériel pour le cours de demain comprend des ciseaux, de la colle et des crayons de couleur. Merci d’y inscrire le nom de l’élève et de les mettre dans le sac.',
      pt: '[Aviso escolar] Os materiais para a aula de amanhã são tesoura, cola e lápis de cor. Por favor, coloque o nome da criança e guarde na mochila.',
      tr: '[Okul Duyurusu] Yarınki ders için gerekli malzemeler makas, yapıştırıcı ve kuru boya kalemleridir. Lütfen isim etiketi yapıştırarak çantasına koyunuz.',
      ar: '[إشعار مدرسي] أدوات درس الغد هي مقص وصمغ وأقلام ملونة. يرجى كتابة اسم الطالب عليها ووضعها في الحقيبة.',
      'zh-Hant': '【班級通知】明天上課需要準備剪刀、膠水和彩色鉛筆。請貼上名字並放進書包裡。',
      id: '[Pengumuman Sekolah] Perlengkapan pelajaran besok adalah gunting, lem, dan pensil warna. Mohon beri label nama anak dan masukkan ke dalam tas.',
      my: '[ကျောင်းအသိပေးချက်] မနက်ဖြန် သင်ခန်းစာအတွက် လိုအပ်သောပစ္စည်းများမှာ ကတ်ကြေး၊ ကော်နှင့် ရောင်စုံခဲတံတို့ ဖြစ်ပါသည်။ အမည်ကပ်၍ လွယ်အိတ်ထဲ ထည့်ပေးလိုက်ပါ။',
      ne: '[विद्यालय सूचना] भोलिको कक्षाका लागि आवश्यक सामग्रीहरू कैँची, गम र रङ्गीन सिसाकलम हुन्। कृपया नाम टाँसेर झोलामा राखिदिनुहोस्।',
      si: '[පාසල් දැනුම්දීම] හෙට පාඩම සඳහා අවශ්‍ය ද්‍රව්‍ය වන්නේ කතුර, ගම් සහ පාට පැන්සල් ය. කරුණාකර නම සඳහන් කර බෑගයට දමා එවන්න.',
      hi: '[स्कूल सूचना] कल की कक्षा के लिए आवश्यक सामग्री कैंची, गोंद और रंगीन पेंसिलें हैं। कृपया उन पर नाम का स्टिकर लगाकर बैग में रख दें।',
      bn: '[স্কুল বিজ্ঞপ্তি] আগামীকালের ক্লাসের জন্য প্রয়োজনীয় উপকরণ হলো কাঁচি, আঠা এবং রঙিন পেন্সিল। অনুগ্রহ করে নামের স্টিকার লাগিয়ে ব্যাগে ভরে দিন।',
      ur: '[اسکول کی اطلاع] کل کی کلاس کے لیے ضروری اشیاء قینچی، گوند اور رنگین پنسلیں ہیں۔ براہِ کرم نام کا اسٹیکر لگا کر بیگ میں رکھ دیں۔'
    }
  },
  {
    id: 'tpl-fieldtrip',
    category: '가정통신문·동의서',
    title: '현장체험학습 신청 및 동의서 회신 안내',
    ko: '[가정통신문] 현장체험학습 안내장을 확인하시고, 참가 신청 및 보호자 동의서를 작성하여 금요일까지 담임교사에게 제출해 주세요.',
    translations: {
      en: '[School Newsletter] Please review the Field Trip guide, fill out the participation and Parent/Guardian consent form, and return it to the homeroom teacher by Friday.',
      'zh-Hans': '【家长通知单】请查看现场体验学习通知，填写参加申请及监护人同意书后，于本周五前交给班主任。',
      vi: '[Thư gửi phụ huynh] Xin quý phụ huynh xem kỹ thông báo học tập trải nghiệm thực tế, điền vào giấy đồng ý của phụ huynh và nộp lại cho giáo viên chủ nhiệm trước thứ Sáu.',
      ja: '【家庭通信文】校外体験学習の案内をご確認の上、参加申込および保護者同意書をご記入いただき、金曜日までに担任教師へご提出ください。',
      ru: '[Уведомление для родителей] Ознакомьтесь с информацией о выездном занятии, заполните согласие родителей и передайте классному руководителю до пятницы.',
      tl: '[Liham sa Magulang] Pakibasa ang gabay sa Field Trip, punan ang form ng pagsali at pahintulot ng magulang/tagapag-alaga, at ipasa sa gurong tagapayo hanggang Biyernes.',
      km: '[លិខិតជូនមាតាបិតា] សូមពិនិត្យមើលសេចក្តីណែនាំអំពីដំណើរទស្សនកិច្ចសិក្សា ហើយបំពេញពាក្យសុំចូលរួម និងលិខិតយល់ព្រមរបស់អាណាព្យាបាល រួចប្រគល់ជូនគ្រូបន្ទុកថ្នាក់ត្រឹមថ្ងៃសុក្រ។',
      uz: '[Ota-onalar xabarnomasi] Sayyor o‘quv mashg‘uloti yo‘riqnomasini ko‘rib chiqib, ishtirok etish arizasi va ota-ona rozilik xatini to‘ldirib, juma kunigacha sinf rahbariga topshiring.',
      kk: '[Ата-аналарға хабарлама] Танымдық саяхат туралы нұсқаулықпен танысып, қатысу өтініші мен ата-ана келісім парағын толтырып, жұмаға дейін сынып жетекшісіне тапсырыңыз.',
      ky: '[Ата-энелерге билдирме] Көчмө окуу экскурсиясы боюнча маалыматты карап чыгып, катышуу арызын жана ата-эненин макулдук баракчасын толтуруп, жума күнүнө чейин класс жетекчиге тапшырыңыз.',
      mn: '[Эцэг эхийн мэдэгдэл] Танхимаас гадуурх сургалтын удирдамжтай танилцаж, оролцох хүсэлт болон асран хамгаалагчийн зөвшөөрлийн хуудсыг бөглөөд Баасан гарагийн дотор анги удирдсан багшид хураалгана уу.',
      th: '[จดหมายข่าวผู้ปกครอง] กรุณาตรวจสอบเอกสารแจ้งการทัศนศึกษาและกรอกใบสมัครเข้าร่วมพร้อมหนังสือยินยอมของผู้ปกครอง ส่งให้ครูประจำชั้นภายในวันศุกร์',
      es: '[Comunicado escolar] Por favor revise la guía de la excursión educativa, complete la solicitud y el consentimiento de los padres/tutores, y entréguelo al maestro titular antes del viernes.',
      fr: '[Lettre aux parents] Veuillez consulter la note sur la sortie pédagogique, remplir la demande de participation et l’autorisation parentale, puis les remettre à l’enseignant titulaire d’ici vendredi.',
      pt: '[Comunicado aos pais] Verifique o informativo sobre a visita de estudo, preencha a inscrição e o termo de autorização dos responsáveis e entregue ao professor titular até sexta-feira.',
      tr: '[Veli Bilgilendirme] Lütfen okul dışı gezi kılavuzunu inceleyin, katılım başvurusunu ve veli izin belgesini doldurarak Cuma gününe kadar sınıf öğretmenine teslim edin.',
      ar: '[رسالة لأولياء الأمور] يرجى الاطلاع على إرشادات الرحلة التعليمية الميدانية، وتعبئة طلب المشاركة وموافقة ولي الأمر، وتسليمها لمعلم الفصل حتى يوم الجمعة.',
      'zh-Hant': '【家長通知單】請查看現場體驗學習通知，填寫參加申請及監護人同意書後，於本週五前交給班導師。',
      id: '[Surat Pemberitahuan] Mohon periksa panduan kegiatan belajar lapangan, isi formulir pendaftaran dan surat persetujuan orang tua/wali, lalu serahkan kepada wali kelas paling lambat hari Jumat.',
      my: '[မိဘထံအကြောင်းကြားစာ] လက်တွေ့လေ့လာရေးခရီး လမ်းညွှန်စာကို ဖတ်ရှုပြီး ပါဝင်ခွင့်လျှောက်လွှာနှင့် အုပ်ထိန်းသူ သဘောတူညီချက်ကို ဖြည့်စွက်၍ သောကြာနေ့နောက်ဆုံးထားပြီး အတန်းပိုင်ဆရာထံ ပေးပို့ပါ။',
      ne: '[अभिभावक सूचना] कृपया शैक्षिक भ्रमण सम्बन्धी जानकारी हेरी सहभागी फारम र अभिभावक मञ्जुरीनामा भरेर शुक्रबारसम्म कक्षा शिक्षकलाई बुझाउनुहोस्।',
      si: '[දෙමාපිය නිවේදනය] කරුණාකර ක්ෂේත්‍ර අධ්‍යයන චාරිකා විස්තරය පරීක්ෂා කර, සහභාගීත්ව අයදුම්පත සහ දෙමාපිය කැමැත්ත ප්‍රකාශය පුරවා සිකුරාදාට පෙර පන්ති භාර ගුරුතුමාට භාර දෙන්න.',
      hi: '[अभिभावक सूचना पत्र] कृपया शैक्षणिक भ्रमण विवरण देखें तथा प्रतिभागिता आवेदन और अभिभावक सहमति पत्र भरकर शुक्रवार तक कक्षा शिक्षक को जमा करें।',
      bn: '[অভিভাবক বিজ্ঞপ্তি] অনুগ্রহ করে শিক্ষাসফরের নির্দেশিকাটি দেখুন এবং অংশগ্রহণের আবেদন ও অভিভাবকের সম্মতিপত্র পূরণ করে শুক্রবারের মধ্যে শ্রেণি শিক্ষকের কাছে জমা দিন।',
      ur: '[والدین کے لیے اطلاع نامہ] براہِ کرم تعلیمی دورے کی ہدایات دیکھیں اور شرکت کا فارم نیز سرپرست کا اجازت نامہ پُر کر کے جمعہ تک کلاس ٹیچر کے پاس جمع کرائیں۔'
    }
  },
  {
    id: 'tpl-allergy',
    category: '급식·보건·안전',
    title: '학교 급식 식품 알레르기 조사 안내',
    ko: '[급식 안내] 안전한 학교 급식을 위해 학생에게 특정 식품 알레르기(우유, 달걀, 땅콩, 새우 등)가 있는 경우 회신서에 꼭 적어 보내 주세요.',
    translations: {
      en: '[School Lunch Notice] For safe school meals, if your child has any food allergies (milk, eggs, peanuts, shrimp, etc.), please write them on the reply slip and return it.',
      'zh-Hans': '【学校供餐通知】为了保障安全的学校供餐，如果学生对特定食物（牛奶、鸡蛋、花生、虾等）过敏，请务必在回执单上注明并交回。',
      vi: '[Thông báo bữa ăn học đường] Để đảm bảo an toàn bữa ăn tại trường, nếu học sinh bị dị ứng với thực phẩm nào (sữa, trứng, đậu phộng, tôm...), xin phụ huynh ghi rõ vào phiếu phản hồi.',
      ja: '【給食案内】安全な学校給食のため、お子様に特定の食物アレルギー（牛乳、卵、ピーナッツ、エビなど）がある場合は、返信票に必ずご記入の上ご提出ください。',
      ru: '[Школьное питание] Для безопасного питания в школе, если у ребёнка есть пищевая аллергия (на молоко, яйца, арахис, креветки и др.), обязательно укажите это в бланке ответа.',
      tl: '[Paalala sa Tanghalian sa Paaralan] Para sa ligtas na pagkain sa paaralan, kung ang bata ay may allergy sa pagkain (gatas, itlog, mani, hipon, atbp.), pakisulat ito sa reply slip at ibalik sa guro.',
      km: '[សេចក្តីជូនដំណឹងអំពីអាហារសាលា] ដើម្បីសុវត្ថិភាពអាហារនៅសាលា ប្រសិនបើសិស្សមានអាឡែហ្ស៊ីនឹងអាហារណាមួយ (ទឹកដោះគោ ស៊ុត សណ្តែកដី បង្គា ជាដើម) សូមសរសេរបញ្ជាក់ក្នុងប័ណ្ណឆ្លើយតបឱ្យបានច្បាស់។',
      uz: '[Maktab ovqatlanish xabarnomasi] Xavfsiz maktab tushligi uchun farzandingizda ayrim oziq-ovqatlarga (sut, tuxum, yeryong‘oq, krevetka va b.) allergiya bo‘lsa, javob varaqasiga albatta yozib yuboring.',
      kk: '[Мектеп тамақтануы] Қауіпсіз мектеп тамағы үшін балада белгілі бір тағамға аллергия (сүт, жұмыртқа, жержаңғақ, асшаян т.б.) болса, жауап парағына міндетті түрде жазып жіберіңіз.',
      ky: '[Мектеп тамак-ашы] Коопсуз мектеп тамактануусу үчүн балада белгилүү бир тамак-ашка аллергия (сүт, жумуртка, жержаңгак, креветка ж.б.) болсо, жооп баракчасына сөзсүз жазып бериңиз.',
      mn: '[Сургуулийн үдийн хоолны мэдэгдэл] Аюулгүй хооллолтын төлөө хүүхдэд тодорхой хүнсний харшил (сүү, өндөг, газрын самар, сам хорхой гэх мэт) байвал хариу хуудсанд заавал бичиж ирүүлнэ үү.',
      th: '[แจ้งเรื่องอาหารกลางวันโรงเรียน] เพื่อความปลอดภัยในการรับประทานอาหารที่โรงเรียน หากนักเรียนมีอาการแพ้อาหารชนิดใด (เช่น นม ไข่ ถั่วลิสง กุ้ง ฯลฯ) กรุณาระบุในใบตอบกลับและส่งคืนครู',
      es: '[Aviso de comedor escolar] Para garantizar comidas escolares seguras, si el estudiante tiene alguna alergia alimentaria (leche, huevo, maní, camarones, etc.), anótelo en la hoja de respuesta.',
      fr: '[Cantine scolaire] Pour la sécurité des repas scolaires, si votre enfant souffre d’allergies alimentaires (lait, œufs, arachides, crevettes, etc.), veuillez l’indiquer sur le coupon-réponse.',
      pt: '[Aviso sobre merenda escolar] Para uma alimentação escolar segura, caso o aluno tenha alergia a algum alimento (leite, ovo, amendoim, camarão, etc.), informe na folha de resposta.',
      tr: '[Okul Yemeği Duyurusu] Güvenli okul yemeği için öğrencinin belirli gıdalara (süt, yumurta, yer fıstığı, karides vb.) alerjisi varsa lütfen yanıt formuna mutlaka yazarak gönderiniz.',
      ar: '[إشعار الوجبات المدرسية] لضمان سلامة الوجبات المدرسية، إذا كان لدى الطالب حساسية تجاه أطعمة معينة (الحليب، البيض، الفول السوداني، الروبيان وغيرها)، يرجى تدوين ذلك في قسيمة الرد.',
      'zh-Hant': '【學校供餐通知】為了保障安全的學校供餐，如果學生對特定食物（牛奶、雞蛋、花生、蝦等）過敏，請務必在回執單上註明並交回。',
      id: '[Info Makan Siang Sekolah] Demi keamanan makan di sekolah, jika siswa memiliki alergi makanan tertentu (susu, telur, kacang tanah, udang, dll.), mohon tulis pada lembar balasan.',
      my: '[ကျောင်းနေ့လယ်စာ အသိပေးချက်] ဘေးကင်းသော ကျောင်းနေ့လယ်စာအတွက် ကျောင်းသားတွင် အစားအစာ ဓာတ်မတည့်မှု (နွားနို့၊ ကြက်ဥ၊ မြေပဲ၊ ပုစွန် စသည်) ရှိပါက အကြောင်းပြန်စာရွက်တွင် သေချာရေးသားပေးပို့ပါ။',
      ne: '[विद्यालय खाजा/खाना सूचना] सुरक्षित विद्यालय खानाका लागि विद्यार्थीलाई कुनै खाद्य एलर्जी (दूध, अण्डा, बदाम, झिँगेमाछा आदि) भएमा जवाफी फारममा अवश्य उल्लेख गरी पठाउनुहोस्।',
      si: '[පාසල් ආහාර දැනුම්දීම] ආරක්ෂිත පාසල් ආහාර වේලක් සඳහා දරුවාට යම් ආහාර අසාත්මිකතාවක් (කිරි, බිත්තර, රටකජු, ඉස්සන් ආදිය) ඇත්නම් පිළිතුරු පත්‍රිකාවේ අනිවාර්යයෙන්ම සඳහන් කර එවන්න.',
      hi: '[स्कूल भोजन सूचना] सुरक्षित स्कूल भोजन के लिए यदि छात्र को किसी खाद्य पदार्थ (दूध, अंडा, मूंगफली, झींगा आदि) से एलर्जी है, तो कृपया उत्तर प्रपत्र में अवश्य लिखकर भेजें।',
      bn: '[স্কুল টিফিন/খাবার বিজ্ঞপ্তি] নিরাপদ স্কুল খাবারের জন্য শিক্ষার্থীর যদি কোনো নির্দিষ্ট খাবারে অ্যালার্জি (দুধ, ডিম, চিনাবাদাম, চিংড়ি ইত্যাদি) থাকে, তবে উত্তরপত্রে তা অবশ্যই লিখে পাঠান।',
      ur: '[اسکول لنچ کی اطلاع] محفوظ اسکول کھانے کے لیے اگر طالب علم کو کسی خاص غذا (دودھ، انڈا، مونگ پھلی، جھینگا وغیرہ) سے الرجی ہو تو براہِ کرم جوابی فارم میں ضرور لکھ کر بھیجیں۔'
    }
  },
  {
    id: 'tpl-consult',
    category: '상담·학사 일정',
    title: '학부모 상담 주간 신청 안내',
    ko: '[상담 안내] 다음 주는 학부모 상담 주간입니다. 방문 상담 또는 전화 상담 중 희망하시는 날짜와 시간대를 선택하여 회신서를 보내 주세요.',
    translations: {
      en: '[Consultation Notice] Next week is Parent-Teacher Consultation Week. Please choose your preferred date and time for an in-person or phone consultation and return the reply slip.',
      'zh-Hans': '【家长咨询通知】下周是家长咨询周。请选择您希望的到校咨询或电话咨询日期与时间段，并交回回执单。',
      vi: '[Thông báo tư vấn phụ huynh] Tuần tới là tuần lễ tư vấn phụ huynh. Xin quý phụ huynh chọn ngày giờ mong muốn (tư vấn trực tiếp hoặc qua điện thoại) và gửi lại phiếu phản hồi.',
      ja: '【保護者面談案内】来週は保護者面談週間です。来校面談または電話面談のうち、ご希望の日時を選択して返信票をご提出ください。',
      ru: '[Консультации для родителей] Следующая неделя — неделя родительских консультаций. Пожалуйста, выберите удобную дату и время (очно или по телефону) и верните бланк ответа.',
      tl: '[Paalala sa Konsultasyon ng Magulang] Sa susunod na linggo ay Linggo ng Konsultasyon ng Magulang at Guro. Pakipili ang nais na petsa at oras (personal na pagbisita o sa telepono) at ibalik ang reply slip.',
      km: '[សេចក្តីជូនដំណឹងអំពីការពិគ្រោះយោបល់មាតាបិតា] សប្តាហ៍ក្រោយគឺជាសប្តាហ៍ពិគ្រោះយោបល់ជាមួយមាតាបិតាសិស្ស។ សូមជ្រើសរើសថ្ងៃ និងម៉ោងដែលអ្នកចង់បាន (ជួបផ្ទាល់ ឬតាមទូរស័ព្ទ) រួចផ្ញើប័ណ្ណឆ្លើយតបមកវិញ។',
      uz: '[Ota-onalar maslahatlashuvi] Kelasi hafta — ota-onalar bilan suhbat haftaligi. Maktabga tashrif buyurish yoki telefon orqali suhbatlashish uchun qulay sana va vaqtni tanlab, javob varaqasini yuboring.',
      kk: '[Ата-аналар кеңесі] Келесі апта — ата-аналармен кеңесу апталығы. Мектепке келіп немесе телефон арқылы кеңесу үшін қолайлы күн мен уақытты таңдап, жауап парағын жіберіңіз.',
      ky: '[Ата-энелер менен кеңешүү] Кийинки жума — ата-энелер менен маектешүү жумалыгы. Мектепке келип же телефон аркылуу сүйлөшүү үчүн ыңгайлуу күн менен убакытты тандап, жооп баракчасын берип жибериңиз.',
      mn: '[Эцэг эхийн зөвлөгөөний мэдэгдэл] Ирэх долоо хоног бол эцэг эхтэй уулзах долоо хоног юм. Биечлэн ирэх эсвэл утсаар зөвлөгөө авах өдөр, цагаа сонгоод хариу хуудсыг илгээнэ үү.',
      th: '[แจ้งสัปดาห์พบผู้ปกครอง] สัปดาห์หน้าเป็นสัปดาห์การปรึกษาหารือผู้ปกครอง กรุณาเลือกวันและเวลาที่สะดวก (พบครูที่โรงเรียนหรือทางโทรศัพท์) แล้วส่งใบตอบกลับคืนครู',
      es: '[Aviso de tutoría con padres] La próxima semana es la Semana de Consultas con los Padres. Elija la fecha y el horario que prefiera (presencial o por teléfono) y envíe la hoja de respuesta.',
      fr: '[Entretiens parents-enseignants] La semaine prochaine est la semaine de consultation des parents. Veuillez choisir la date et l’heure souhaitées (en personne ou par téléphone) et renvoyer le coupon-réponse.',
      pt: '[Aviso de reunião de pais] A próxima semana é a Semana de Atendimento aos Pais. Escolha a data e o horário de sua preferência (presencial ou por telefone) e envie a folha de resposta.',
      tr: '[Veli Görüşme Haftası] Gelecek hafta Veli Görüşme Haftasıdır. Yüz yüze veya telefonla görüşme seçeneklerinden uygun tarih ve saati seçerek yanıt formunu gönderiniz.',
      ar: '[إشعار أسبوع استشارات أولياء الأمور] الأسبوع القادم هو أسبوع التشاور مع أولياء الأمور. يرجى اختيار التاريخ والوقت المناسبين (حضورياً أو عبر الهاتف) وإرسال قسيمة الرد.',
      'zh-Hant': '【家長諮詢通知】下週是家長諮詢週。請選擇您希望的到校諮詢或電話諮詢日期與時間段，並交回回執單。',
      id: '[Pengumuman Konsultasi Orang Tua] Minggu depan adalah Pekan Konsultasi Orang Tua. Silakan pilih tanggal dan waktu yang diinginkan (tatap muka atau melalui telepon) lalu kirimkan lembar balasan.',
      my: '[မိဘဆရာ ဆွေးနွေးပွဲ အသိပေးချက်] လာမည့်သီတင်းပတ်သည် မိဘဆရာ ဆွေးနွေးပွဲ ရက်သတ္တပတ် ဖြစ်ပါသည်။ လူကိုယ်တိုင် သို့မဟုတ် ဖုန်းဖြင့် ဆွေးနွေးလိုသည့် နေ့ရက်နှင့် အချိန်ကို ရွေးချယ်၍ အကြောင်းပြန်စာရွက် ပေးပို့ပါ။',
      ne: '[अभिभावक परामर्श सूचना] अर्को हप्ता अभिभावक परामर्श सप्ताह हो। प्रत्यक्ष भेटघाट वा फोन परामर्शका लागि आफूलाई पायक पर्ने मिति र समय छनोट गरी जवाफी फारम पठाउनुहोस्।',
      si: '[දෙමාපිය සාකච්ඡා දැනුම්දීම] ලබන සතිය දෙමාපිය උපදේශන සතියයි. පාසලට පැමිණ හෝ දුරකථනයෙන් සාකච්ඡා කිරීම සඳහා ඔබ කැමති දිනය සහ වේලාව තෝරා පිළිතුරු පත්‍රිකාව එවන්න.',
      hi: '[अभिभावक परामर्श सूचना] अगला सप्ताह अभिभावक परामर्श सप्ताह है। कृपया व्यक्तिगत या फोन परामर्श के लिए अपनी पसंदीदा तिथि और समय चुनकर उत्तर प्रपत्र भेजें।',
      bn: '[অভিভাবক পরামর্শ সপ্তাহ] আগামী সপ্তাহ অভিভাবক পরামর্শ সপ্তাহ। সরাসরি সাক্ষাৎ বা ফোনে পরামর্শের জন্য আপনার পছন্দের তারিখ ও সময় বেছে নিয়ে উত্তরপত্রটি পাঠিয়ে দিন।',
      ur: '[والدین مشاورتی ہفتہ] اگلا ہفتہ والدین سے مشاورت کا ہفتہ ہے۔ براہِ کرم بالمشافہ یا فون پر بات چیت کے لیے اپنی پسندیدہ تاریخ اور وقت منتخب کر کے جوابی فارم ارسال کریں۔'
    }
  }
];

/**
 * Idea #6: Build an optimized External AI (ChatGPT / Gemini / Claude) translation prompt
 */
export function buildExternalAiTranslationPrompt(items, langKey) {
  const langMeta = getTargetLanguageMeta(langKey);
  const allText = items.map((it) => it.sourceText).join('\n');
  const glossaryMatches = findMatchingGlossaryTerms(allText, langKey);

  const glossaryGuide =
    glossaryMatches.length > 0
      ? `\n[학교 표준 용어집 참고 (해당 단어 등장 시 아래 표현 우선 사용)]\n` +
        glossaryMatches.map((m) => `- ${m.ko} → ${m.target}`).join('\n')
      : '';

  const numberedLines = items
    .map((it, idx) => `[${idx + 1}] ${it.sourceText.replace(/\r?\n/g, ' ')}`)
    .join('\n');

  return [
    `다음 한국어 학교 수업자료·안내문 문장(총 ${items.length}개)을 자연스럽고 정확한 ${langMeta.label}(${langMeta.nativeLabel})로 번역해 주세요.`,
    ``,
    `[번역 규칙]`,
    `1. 초·중·고 학생과 학부모가 이해하기 쉬운 명확하고 정중한 교육 현장 표현을 사용해 주세요.`,
    `2. 원문에 포함된 숫자, 날짜, 시간, 퍼센트(%), 기호는 절대 누락하지 말고 그대로 유지해 주세요.`,
    `3. 결과는 아래 [번역문 일괄 붙여넣기] 칸에 바로 붙여넣을 수 있도록 부가 설명 없이 정확히 1번부터 ${items.length}번까지 한 줄에 하나씩만 출력해 주세요.`,
    glossaryGuide,
    ``,
    `[원문 목록]`,
    numberedLines
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Idea #9: Encode/Decode compact Student Mobile Reader payload into URL hash
 */
export function encodeStudentViewPayload(fileName, langKey, pairs) {
  const compact = {
    f: String(fileName || '수업자료').slice(0, 60),
    l: langKey || 'en',
    p: pairs.slice(0, 25).map((item) => [
      String(item.loc || '').slice(0, 20),
      String(item.ko || '').slice(0, 160),
      String(item.target || item.tr || '').slice(0, 220)
    ])
  };
  const json = JSON.stringify(compact);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeStudentViewPayload(encoded) {
  try {
    const base64 = String(encoded || '')
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
    const binary = atob(base64 + pad);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!parsed || !Array.isArray(parsed.p)) return null;
    return {
      title: parsed.f || '수업자료',
      fileName: parsed.f || '수업자료',
      langKey: parsed.l || 'en',
      pairs: parsed.p.map(([loc, ko, tr]) => ({ loc, ko, target: tr, tr }))
    };
  } catch {
    return null;
  }
}
