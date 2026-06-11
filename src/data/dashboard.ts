import type { CalDay, CompanyEvent, Vacancy } from '../types';

// ── NAV TILES ─────────────────────────────────────────────────────────────
// SVG іконки відповідають оригінальному дизайну

export interface NavTileData {
  label: string;
  svg: string;   // SVG path content (inner paths only)
  dev?: boolean;
  sub?: string;
  route?: string;
}

export const navTiles: NavTileData[] = [
  {
    label: 'Про Компанію',
    svg: `<path d="M12 3v18M4.22 7.22l15.56 9.56M4.22 16.78l15.56-9.56"/>`,
    route: '/about',
  },
  {
    label: 'Відпустки та відсутність',
    svg: `<path d="M12 14v6"/><path d="M4 14a8 8 0 0 1 16 0H4z"/><path d="M3 18.5c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1"/>`,
    route: '/vacations',
  },
  {
    label: 'Цілі та оцінка',
    svg: `<polyline points="3 3 3 21 21 21"/><polyline points="7 16 11 12 15 15 20 8"/><polyline points="16 8 20 8 20 12"/>`,
    route: '/goals',
  },
  {
    label: 'Корисні посилання',
    svg: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><rect x="8" y="13" width="8" height="4" rx="1"/><circle cx="12" cy="15" r="1"/>`,
    route: '/links',
  },
  {
    label: 'Корпоративні Політики',
    svg: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/><path d="M7 13h.01" stroke-width="2"/><path d="M7 17h.01" stroke-width="2"/>`,
    route: '/policies',
  },
  {
    label: 'Пільги та Компенсації',
    svg: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><rect x="8" y="13" width="8" height="5" rx="1"/><circle cx="12" cy="15.5" r="1.5" fill="#0078d4"/>`,
    route: '/benefits',
  },
  {
    label: 'Навчання',
    svg: `<path d="M22 10l-10-5-10 5 10 5 10-5z"/><path d="M6 12v5c0 2 2.67 4 6 4s6-2 6-4v-5"/>`,
    route: '/learning',
  },
  {
    label: 'Забронювати робоче місце',
    svg: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke-width="2.5"/>`,
    route: '/workspace',
  },
  {
    label: 'Структура Компанії',
    svg: `<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4"/><path d="M6 16v-4"/><path d="M18 16v-4"/><path d="M6 12h12"/>`,
    route: '/structure',
  },
  {
    label: 'Страхування',
    svg: `<path d="M8.5 14.5L12 18l5.5-5.5a2.828 2.828 0 00-4-4l-1.5 1.5"/><path d="M5 11l4.5 4.5a2.828 2.828 0 004 4l4.5-4.5"/><path d="M10 13l4 4"/>`,
    route: '/insurance',
  },
  {
    label: 'Відрядження',
    svg: `<path d="M5 10h14l-2-4H7l-2 4z"/><path d="M3 10v6h2v2h2v-2h10v2h2v-2h2v-6H3z"/><circle cx="7" cy="16" r="1.5"/><circle cx="17" cy="16" r="1.5"/>`,
    dev: true,
    sub: 'В розробці',
  },
  {
    label: 'Мій Акаунт',
    svg: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    sub: 'Все про мене',
    route: '/my-account',
  },
];

// ── FOOTER LINKS ──────────────────────────────────────────────────────────

export const footerColumns = [
  ['Зарплатний листок', 'Створити відпустку', 'Камера Їдальня', 'Психологічна підтримка'],
  ['ФРІ', 'ФЕРМА', 'ФАКТ', 'Все про Винагороди'],
  ['Корпоративні цінності', 'Кодекс поведінки', 'Корпоративне Волонтерство', 'Compliance', 'Зміни в Персональному Кабінеті'],
];

// ── CALENDAR ──────────────────────────────────────────────────────────────

export const calDays: CalDay[] = [
  { d: 30, other: true }, { d: 31, other: true }, { d: 1 }, { d: 2 }, { d: 3 }, { d: 4 }, { d: 5, holiday: true },
  { d: 6 }, { d: 7 }, { d: 8 }, { d: 9 }, { d: 10 }, { d: 11 }, { d: 12 },
  { d: 13, holiday: true }, { d: 14 }, { d: 15 }, { d: 16 }, { d: 17 }, { d: 18, today: true }, { d: 19 },
  { d: 20 }, { d: 21 }, { d: 22 }, { d: 23 }, { d: 24 }, { d: 25 }, { d: 26 },
  { d: 27 }, { d: 28 }, { d: 29 }, { d: 30 }, { d: 1, other: true }, { d: 2, other: true, holiday: true }, { d: 3, other: true },
];

// ── EVENTS ────────────────────────────────────────────────────────────────

export const companyEvents: CompanyEvent[] = [
  { date: 'May 1',   name: 'День праці',                                           tag: 'Державне свято' },
  { date: 'May 8',   name: "День пам'яті та перемоги над нацизмом",               tag: 'Державне свято' },
  { date: 'June 1',  name: 'Додатковий вихідний день до Трійці',                  tag: 'Державне свято' },
  { date: 'June 29', name: 'Додатковий вихідний день до Дня Конституції України', tag: 'Державне свято' },
];

// ── JOB VACANCIES ─────────────────────────────────────────────────────────

export const vacancies: Vacancy[] = [
  { title: 'Business Development', loc: 'All Ukraine', hot: true },
  { title: 'Contact Center',       loc: 'All Ukraine' },
  { title: 'Finance',              loc: 'All Ukraine' },
  { title: 'HR & Administration',  loc: 'All Ukraine' },
  { title: 'Network',              loc: 'All Ukraine' },
];

// ── CURRENT USER ─────────────────────────────────────────────────────────

export const currentUser = {
  initials: 'PR',
  name: 'Олександр',
  pendingApprovals: 18,
};
