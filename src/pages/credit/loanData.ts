/* ───────── Налаштування програми (замінюються реальними) ───────── */
export const LOAN_MAX = 100_000; // ліміт суми, ₴
export const LOAN_MIN = 5_000;
export const LOAN_STEP = 1_000;
export const LOAN_TERMS = [6, 12, 18, 24]; // строки, міс.
export const PAY_DAY = 10; // до якого числа місяця сплачувати
export const DECISION_DAYS = 5; // робочих днів на рішення (архівні стани)

export const REQUISITES = {
  recipient: 'АТ «Київстар»',
  iban: 'UA12 3456 7800 0002 6001 2345 6789 0',
  edrpou: '21673832',
  purpose: 'Погашення безвідсоткової позики, Сидоренко Х. О.',
};

/* ───────── Стани ───────── */
export type Stage = 'none' | 'sent' | 'active' | 'done' | 'pending' | 'rejected';

/** archive — старі стани («На розгляді», «Відмова»): лишаються для історії, розробникам не передаються */
export const STAGES: { key: Stage; label: string; archive?: boolean }[] = [
  { key: 'none', label: 'Без кредиту' },
  { key: 'sent', label: 'Заявку надіслано' },
  { key: 'active', label: 'Погашення' },
  { key: 'done', label: 'Погашено' },
  { key: 'pending', label: 'На розгляді', archive: true },
  { key: 'rejected', label: 'Відмова', archive: true },
];

/** Адреса HR — заглушка, замінити на реальну */
export const HR_EMAIL = 'hr-loans@kyivstar.ua';

/** Профіль працівника (демо). У порталі — з профілю користувача */
export const EMPLOYEE = {
  fullName: 'Сидоренко Христина Олегівна',
  short: 'Сидоренко Х. О.',
  tabNumber: '104582',
  position: 'Провідна менеджерка з продукту',
  department: 'Департамент B2C-продуктів',
  manager: 'Коваль Олена Петрівна',
  managerEmail: 'o.koval@kyivstar.ua',
};

export const APPROVAL_ACCEPT = '.msg,.eml,.pdf,.png,.jpg,.jpeg,.docx';

export const DEMO_TODAY = new Date(2026, 9, 2);

export const DEMO = {
  loan: { amount: 60_000, months: 12, start: new Date(2026, 3, 10), purpose: 'Ремонт квартири' },
  paidMonths: 5,
  extraPaid: 2_000,
  rejectReason: 'Ще не виповнилось 6 місяців роботи в компанії — це мінімальний стаж для програми.',
  rejectAfter: new Date(2026, 11, 15),
};

export const PURPOSES = ['Ремонт', 'Навчання', "Здоров'я", "Сім'я", 'Переїзд', 'Інше'];

export const HOW_STEPS = [
  { title: 'Розрахуйте', caption: 'Оберіть суму й строк — платіж побачите одразу' },
  { title: 'Погодьте з керівником', caption: 'Напишіть керівнику й збережіть його відповідь' },
  { title: 'Надішліть лист у HR', caption: 'Лист сформується сам — лише прикладіть погодження' },
  { title: 'Гасіть у своєму темпі', caption: `HR підготує наказ і договір, далі — платежі до ${PAY_DAY} числа` },
];

export const CONDITIONS = [
  { title: '0% — справді', caption: 'Повертаєте рівно ту суму, яку взяли' },
  { title: `До ${uah(LOAN_MAX)}`, caption: `На строк від ${LOAN_TERMS[0]} до ${LOAN_TERMS[LOAN_TERMS.length - 1]} місяців` },
  { title: 'Від 6 місяців у команді', caption: 'Мінімальний стаж для участі в програмі' },
  { title: 'Дострокове погашення', caption: 'Без штрафів — будь-коли й будь-якою сумою' },
];

/* ───────── Хелпери ───────── */
export function uah(value: number) {
  return `${Math.round(value).toLocaleString('uk-UA')} ₴`;
}
export function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, date.getDate());
}
export function payDate(start: Date, index: number) {
  const month = addMonths(start, index + 1);
  return new Date(month.getFullYear(), month.getMonth(), PAY_DAY);
}
export function fmtDate(date: Date) {
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
}
export function fmtDateFull(date: Date) {
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/\s*р\.?$/, '');
}
export function fmtMonth(date: Date) {
  const text = date.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }).replace(/\s*р\.?$/, '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
export function addWorkdays(date: Date, count: number) {
  const next = new Date(date);
  let left = count;
  while (left > 0) {
    next.setDate(next.getDate() + 1);
    const day = next.getDay();
    if (day !== 0 && day !== 6) left -= 1;
  }
  return next;
}
export function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}
export function pluralDays(n: number) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'день';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'дні';
  return 'днів';
}
export function pluralMonths(n: number) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'місяць';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'місяці';
  return 'місяців';
}

/* ───────── Розрахунок поточного кредиту ───────── */
export type ScheduleRow = { index: number; date: Date; amount: number; status: 'paid' | 'next' | 'planned' };

export function buildLoanState(stage: Stage) {
  const { loan, paidMonths, extraPaid } = DEMO;
  const monthly = loan.amount / loan.months;
  const done = stage === 'done';
  const paid = done ? loan.amount : Math.min(loan.amount, paidMonths * monthly + extraPaid);
  const left = Math.max(0, loan.amount - paid);
  const ratio = loan.amount ? paid / loan.amount : 0;

  // доплата понад графік зменшує останні платежі
  let extra = done ? 0 : extraPaid;
  const amounts = Array.from({ length: loan.months }, () => monthly);
  for (let i = amounts.length - 1; i >= paidMonths && extra > 0; i -= 1) {
    const cut = Math.min(amounts[i], extra);
    amounts[i] -= cut;
    extra -= cut;
  }

  const schedule: ScheduleRow[] = amounts.map((amount, index) => ({
    index,
    date: payDate(loan.start, index),
    amount: done ? monthly : amount,
    status: done || index < paidMonths ? 'paid' : index === paidMonths ? 'next' : 'planned',
  }));

  const nextRow = schedule.find(r => r.status === 'next') ?? null;
  const lastRow = schedule[schedule.length - 1];
  return { loan, monthly, paid, left, ratio, schedule, nextRow, lastRow, done };
}
export type LoanState = ReturnType<typeof buildLoanState>;

export function encouragement(ratio: number) {
  if (ratio >= 1) return { title: 'Фініш! Ви все погасили', caption: 'Усі платежі позаду — це ваша перемога.' };
  if (ratio >= 0.75) return { title: 'Фініш уже видно', caption: 'Залишилось зовсім трохи — ще кілька кроків.' };
  if (ratio >= 0.5) return { title: 'Більше половини позаду', caption: 'Ви йдете стабільно — так тримати.' };
  if (ratio >= 0.4) return { title: 'Майже половина позаду', caption: 'Ви йдете стабільно й навіть трохи випереджаєте графік.' };
  if (ratio >= 0.2) return { title: 'Гарний темп', caption: 'Кожен платіж наближає фініш.' };
  return { title: 'Гарний старт', caption: 'Перші кроки найважливіші — ви вже в дорозі.' };
}

/* ───────── Історія (демо) ───────── */
export type HistoryItem = {
  id: string; kind: 'loan' | 'application'; title: string; period: string; amount: number;
  status: 'closed' | 'declined'; statusLabel: string; note: string;
};
export const HISTORY: HistoryItem[] = [
  { id: 'KS-0287', kind: 'loan', title: 'Кредит на навчання', period: 'Червень — листопад 2025 · 6 місяців', amount: 30_000, status: 'closed', statusLabel: 'Погашено', note: 'Погашено на місяць раніше графіка' },
  { id: 'KS-0198', kind: 'application', title: 'Заявка на кредит', period: 'Подано 12 лютого 2025', amount: 25_000, status: 'declined', statusLabel: 'Не погоджено', note: 'Тоді ще не виповнилось 6 місяців стажу — наступну заявку вже погодили' },
];

/* ───────── Чернетка заявки ───────── */
export type Draft = { amount: number; months: number; purpose: string; note: string; agree: boolean };

export function draftFigures(draft: Draft) {
  const monthly = draft.amount > 0 && draft.months > 0 ? draft.amount / draft.months : 0;
  const start = new Date(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 1);
  return { monthly, first: payDate(start, 0), last: payDate(start, draft.months - 1) };
}
