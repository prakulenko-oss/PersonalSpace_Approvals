import type { CalDay, CompanyEvent, Vacancy } from '../types';
import {
  Building2, CalendarDays, TrendingUp, Link2, FileText,
  CreditCard, GraduationCap, Monitor, Share2, Shield, Truck, User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── NAV TILES ─────────────────────────────────────────────────────────────

export interface NavTileData {
  label: string;
  Icon: LucideIcon;
  dev?: boolean;
  sub?: string;
  route?: string;
}

export const navTiles: NavTileData[] = [
  { label: 'Про Компанію',              Icon: Building2,     route: '/about' },
  { label: 'Відпустки та відсутність',  Icon: CalendarDays,  route: '/vacations' },
  { label: 'Цілі та оцінка',            Icon: TrendingUp,    route: '/goals' },
  { label: 'Корисні посилання',         Icon: Link2,         route: '/links' },
  { label: 'Корпоративні Політики',     Icon: FileText,      route: '/policies' },
  { label: 'Пільги та Компенсації',     Icon: CreditCard,    route: '/benefits' },
  { label: 'Навчання',                  Icon: GraduationCap, route: '/learning' },
  { label: 'Забронювати робоче місце',  Icon: Monitor,       route: '/workspace' },
  { label: 'Структура Компанії',        Icon: Share2,        route: '/structure' },
  { label: 'Страхування',               Icon: Shield,        route: '/insurance' },
  { label: 'Відрядження',              Icon: Truck,         dev: true, sub: 'В розробці' },
  { label: 'Мій Акаунт',               Icon: User,          sub: 'Все про мене', route: '/my-account' },
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
// Змініть тут — і відображатиметься скрізь

export const currentUser = {
  initials: 'PR',
  name: 'Олександр',
  pendingApprovals: 18,
};
