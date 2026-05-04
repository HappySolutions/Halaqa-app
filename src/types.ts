
export interface Student {
  id: string;
  name: string;
}

export interface Report {
  id: string;
  studentId: string;
  studentName: string;
  pagesReviewed: number;
  surahs: string;
  hasReviewed: boolean;
  isDeferred: boolean;
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'عبير احمد' },
  { id: '2', name: 'سارة يوسف' },
  { id: '3', name: 'بشرى يوسف' },
  { id: '4', name: 'مريم سلطان' },
  { id: '5', name: 'لطيفه العقيل' },
  { id: '6', name: 'سلمى حافظ' },
  { id: '7', name: 'نادية الشلالي' },
  { id: '8', name: 'لمار بصفر' },
  { id: '9', name: 'بحريه العنزي' },
  { id: '10', name: 'تقى حسن' },
  { id: '11', name: 'رشا عبده عمر' },
  { id: '12', name: 'اروى السماني' },
  { id: '13', name: 'مى حامد سعد' },
  { id: '14', name: 'ستنا الامين' },
  { id: '15', name: 'شيخه سعيد' },
  { id: '16', name: 'حواء محمد مهدي' },
  { id: '17', name: 'جنى احمد الخشمان' },
  { id: '18', name: 'كوثر جمال الضاه' },
  { id: '19', name: 'رميساء قليدو' },
  { id: '20', name: 'مريم ميرغني' },
  { id: '21', name: 'مريم مصطفي' },
  { id: '22', name: 'نوف ثايب' },
  { id: '23', name: 'هيفاء عادل' },
  { id: '24', name: 'فاطمه ربيع' },
  { id: '26', name: 'عبير الصعب' },
  { id: '27', name: 'شيرين سامي' },
  { id: '28', name: 'مؤته صالح' },
  { id: '29', name: 'سميه يوجين' },
  { id: '30', name: 'مرسم سلطان' },
  { id: '31', name: 'هاجر محمد' },
  { id: '32', name: 'ميادة نجم' },
  { id: '33', name: 'امل بلال' },
  { id: '34', name: 'ضحى بخش' },
  { id: '35', name: 'أسماء على صالح' },
  { id: '36', name: 'سارة مساعد' },
  { id: '37', name: 'هبة محمد عبد الماجد' },
  { id: '38', name: 'خوله عبدالله' },
  { id: '39', name: 'ايمان فوزي' },
  { id: '40', name: 'سميحه الحداد' },
  { id: '41', name: 'ليناقريشي' },
  { id: '42', name: 'زكية الهوساوي' },
  { id: '43', name: 'هدير حامد صقر' },
  { id: '44', name: 'وعد عمر' },
  { id: '45', name: 'اسماء العسكري' },
  { id: '46', name: 'ساره البلوي' },
];
