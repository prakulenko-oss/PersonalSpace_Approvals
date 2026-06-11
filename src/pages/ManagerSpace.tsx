import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { TopBar } from '../components/TopBar';
import {
  Users, FileText, Briefcase, Calendar, BarChart3, Settings,
  ChevronDown, ChevronRight, ChevronUp, ChevronLeft, Bell, User,
  Send, X, Menu, ArrowLeft,
  AlertTriangle, AlertCircle, HardHat, Network, CalendarX,
  CheckCircle, Info, ListChecks, HelpCircle, Cake, CalendarDays, Shield,
  UserPen, UserX, ArrowRightLeft, Banknote,
  Bold, Italic, Underline, List, ListOrdered,
} from 'lucide-react';

/* ════════════════════════ TYPES & DATA ════════════════════════ */

type IssueIcon = 'risk' | 'booking' | 'training' | 'form' | 'schedule' | 'ok';

const issueLabels: Record<IssueIcon, string> = {
  risk: 'Ризик контракту',
  booking: 'Закінчується бронювання',
  training: 'Непройдений інструктаж',
  form: 'Відсутня форма організації праці',
  schedule: 'Несформований графік',
  ok: 'Все гаразд',
};

type EmployeeDetail = {
  absenceType: string; absenceStart: string; absenceEnd: string;
  vacationReserve: string; birthDate: string; isVeteran: boolean;
  novaPoshtaBranch: string; contacts: string[];
  contractStatus: string; contractEnd: string; contractNote: string;
  trainingStatus: string; trainingEnd: string;
  scheduleStatus: string;
  bookingStatus: string; bookingEnd: string;
  workForm: string; regDate: string;
};

type DeptEmployee = {
  id: string; name: string; position: string;
  initials?: string; avatarColor?: string;
  absenceType: string; issues: IssueIcon[]; unusedDays: number;
  detail: EmployeeDetail;
};

type Department = {
  id: string; name: string;
  headerIssues: IssueIcon[];
  employeesCount: string; absentCount: string; problems: string;
  employees: DeptEmployee[];
};

const makeDetail = (over: Partial<EmployeeDetail> = {}): EmployeeDetail => ({
  absenceType: '—', absenceStart: '', absenceEnd: '',
  vacationReserve: '12 днів', birthDate: '14.02.1991', isVeteran: false,
  novaPoshtaBranch: 'Київ, Відділення №23, вул. Солом\u2019янська 12', contacts: ['+380 67 000 0000'],
  contractStatus: 'Активний', contractEnd: '31.12.2026',
  contractNote: 'Дія договору буде автоматично продовжена на невизначений строк, якщо за 14 к.д. до його завершення не буде отримано відповідь.',
  trainingStatus: 'Повторний - Пройдено', trainingEnd: '29.06.2026',
  scheduleStatus: 'Сформовано',
  bookingStatus: 'Актуальне', bookingEnd: '27.08.2026',
  workForm: '', regDate: '04.02.2026',
  ...over,
});

const departments: Department[] = [
  {
    id: 'd1', name: 'Департамент систем управління підприємством',
    headerIssues: ['training', 'schedule', 'booking', 'risk', 'form'],
    employeesCount: '3 співробітників', absentCount: '1 відсутніх', problems: '6 проблем',
    employees: [
      {
        id: 'markov', name: 'Марков Геннадій Юрійович', position: 'Розробник архітектури програмного забезпечення...',
        initials: 'МГ', avatarColor: '#5b8def',
        absenceType: '', issues: ['training'], unusedDays: 9,
        detail: makeDetail({
          vacationReserve: '9 днів', birthDate: '02.11.1987',
          trainingStatus: 'Первинний - Непройдений', trainingEnd: '30.06.2026',
        }),
      },
      {
        id: 'test2', name: 'Тестовий2 Користувач', position: 'DevOps',
        absenceType: '', issues: ['ok'], unusedDays: 25,
        detail: makeDetail({ vacationReserve: '25 днів' }),
      },
      {
        id: 'test1', name: 'Тестовий1 Користувач', position: 'QA',
        absenceType: 'Відпустка', issues: ['training', 'schedule', 'booking', 'risk', 'form'], unusedDays: 5,
        detail: makeDetail({
          absenceType: 'Відпустка', absenceStart: '08.06.2026', absenceEnd: '16.06.2026',
          vacationReserve: '5 днів', birthDate: '30.07.1993', isVeteran: true,
          novaPoshtaBranch: 'Суми, Відділення №1 Вантажне. Сад, Сумський Район',
          contacts: ['Донька: +380966745322', 'Донька: +380678907655'],
          contractStatus: 'Не активний', contractEnd: '09.07.2999',
          scheduleStatus: 'Не сформовано',
        }),
      },
    ],
  },
  {
    id: 'd2', name: 'Відділ автоматизації операційних процесів',
    headerIssues: ['training', 'schedule'],
    employeesCount: '7 співробітників', absentCount: '0 відсутніх', problems: '12 проблем',
    employees: [
      {
        id: 'test4', name: 'Тестовий4 Користувач', position: 'Інженер',
        absenceType: '', issues: ['training', 'schedule'], unusedDays: 9,
        detail: makeDetail({ vacationReserve: '9 днів', scheduleStatus: 'Не сформовано', trainingStatus: 'Первинний - Непройдений', trainingEnd: '20.07.2026' }),
      },
      {
        id: 'test5', name: 'Тестовий5 Користувач', position: 'Інженер',
        absenceType: '', issues: ['form'], unusedDays: 21,
        detail: makeDetail({ vacationReserve: '21 день' }),
      },
    ],
  },
  {
    id: 'd3', name: 'Відділ управління операційними системами',
    headerIssues: ['training', 'schedule', 'risk'],
    employeesCount: '5 співробітників', absentCount: '0 відсутніх', problems: '9 проблем',
    employees: [
      {
        id: 'test6', name: 'Тестовий6 Користувач', position: 'Адміністратор',
        absenceType: '', issues: ['risk'], unusedDays: 7,
        detail: makeDetail({ vacationReserve: '7 днів', contractStatus: 'Не активний', contractEnd: '01.08.2026' }),
      },
      {
        id: 'test7', name: 'Тестовий7 Користувач', position: 'Адміністратор',
        absenceType: '', issues: ['ok'], unusedDays: 26,
        detail: makeDetail({ vacationReserve: '26 днів' }),
      },
    ],
  },
  {
    id: 'd4', name: 'Відділ управління фінансовими системами',
    headerIssues: ['training', 'schedule'],
    employeesCount: '14 співробітників', absentCount: '0 відсутніх', problems: '20 проблем',
    employees: [
      {
        id: 'test8', name: 'Тестовий8 Користувач', position: 'Економіст',
        absenceType: '', issues: ['schedule'], unusedDays: 11,
        detail: makeDetail({ vacationReserve: '11 днів', scheduleStatus: 'Не сформовано' }),
      },
      {
        id: 'test9', name: 'Тестовий9 Користувач', position: 'Економіст',
        absenceType: '', issues: ['training'], unusedDays: 16,
        detail: makeDetail({ vacationReserve: '16 днів', trainingStatus: 'Первинний - Непройдений', trainingEnd: '05.08.2026' }),
      },
    ],
  },
];

const kpiCards = [
  { title: 'Відпустка',    emoji: '🏝️', value: '1', accent: '#2f6fde', iconBg: '#e3edfb' },
  { title: 'Відрядження',  emoji: '🚗',  value: '0', accent: '#9333ea', iconBg: '#f3e8ff' },
  { title: 'Лікарняні',    emoji: '🤒',  value: '0', accent: '#f97316', iconBg: '#ffedd5' },
  { title: 'Декрет',       emoji: '🤰',  value: '0', accent: '#ec4899', iconBg: '#fce7f3' },
  { title: 'Мобілізовані', emoji: '🪖',  value: '0', accent: '#22c55e', iconBg: '#dcfce7' },
];

const reports = [
  { title: 'Штатний розклад',          icon: <Users size={18} color="#2563eb" />,        iconBg: '#e3edfb' },
  { title: 'Мобілізація / бронювання', icon: <Shield size={18} color="#b45309" />,       iconBg: '#fdf0d5' },
  { title: 'Графік роботи',            icon: <CalendarDays size={18} color="#16a34a" />, iconBg: '#dcfce7' },
  { title: 'Графік відпусток',         icon: <BarChart3 size={18} color="#9333ea" />,    iconBg: '#f3e8ff' },
];

const sidebarNav = [
  { label: 'Кадрові операції / відсутності', icon: Users,     active: true },
  { label: 'Довіреності / КЕП',              icon: FileText,  active: false },
  { label: 'Посадові інструкції',            icon: Briefcase, active: false },
  { label: 'Календар',                       icon: Calendar,  active: false },
  { label: 'Звіти',                          icon: BarChart3, active: false },
  { label: 'Налаштування',                   icon: Settings,  active: false },
];

/* Кадрові операції (3 типи, як на проді) */

type HrOperation = 'dismissal' | 'transfer' | 'salary';

const hrOperations: { id: HrOperation; title: string; sub: string; icon: ReactNode }[] = [
  { id: 'dismissal', title: 'Звільнення',  sub: 'Припинення відносин', icon: <UserX size={22} /> },
  { id: 'transfer',  title: 'Переведення', sub: 'Новий відділ',        icon: <ArrowRightLeft size={22} /> },
  { id: 'salary',    title: 'Зарплата',    sub: 'Перегляд окладу',     icon: <Banknote size={22} /> },
];

const hrOperationTitles: Record<HrOperation, { modal: string; detail: string; calloutTitle: string; emailSubject: string }> = {
  dismissal: { modal: 'Звільнення',  detail: 'Звільнення',   calloutTitle: 'Звільнення співробітника 👋',   emailSubject: 'Звільнення співробітника' },
  transfer:  { modal: 'Переведення', detail: 'Переведення',  calloutTitle: 'Переведення співробітника 🔄',  emailSubject: 'Переведення співробітника' },
  salary:    { modal: 'Зарплата',    detail: 'Зміна окладу', calloutTitle: 'Зміна окладу співробітника 💶', emailSubject: 'Перегляд посадового окладу співробітника' },
};

const emailTo = 'Tatiana Lubchenko (HR) <Tatiana.Lubchenko@kyivstar.net>, Nataliya Bejenar <Nataliya.Bejenar@kyivstar.net>';
const emailCc = 'Pavel Rakulenko <Pavel.Rakulenko@kyivstar.ua>';

/* Дані для модалок швидких дій */

const monthOptions = ['Червень 2026', 'Липень 2026', 'Серпень 2026', 'Вересень 2026'];

const reminderListTypes = ['Усі нагадування', 'Несформований графік відпусток', 'Критична кількість невикористаної відпустки'];

const plannedAbsences = [
  { name: 'Тестовий2 Користувач', dept: 'Департамент систем управління підприємством', period: '22.06 - 07.07', type: 'Щорічна відпустка' },
  { name: 'Тестовий1 Користувач', dept: 'Департамент систем управління підприємством', period: '08.06 - 16.06', type: 'Щорічна відпустка' },
];

const birthdays = [
  { name: 'Шевченко Катерина', position: "Провідний аналітик комп'ютерних систем",   date: '19 червня' },
  { name: 'Морозов Сергій',    position: "Провідний інженер з комп'ютерних систем",  date: '4 червня' },
  { name: 'Козлов Сергій',     position: "Провідний інженер з комп'ютерних систем",  date: '22 червня' },
];

/* ════════════════════════ SHARED STYLES ════════════════════════ */

const S: Record<string, CSSProperties> = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  body: { display: 'flex', flex: 1, minHeight: 0 },
  main: { flex: 1, minWidth: 0, overflowY: 'auto', padding: '20px 24px', backgroundColor: '#fff' },
  rightBar: { width: '350px', flexShrink: 0, overflowY: 'auto', padding: '20px 20px 20px 0', display: 'flex', flexDirection: 'column', gap: '18px' },
  card: { backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #b9d3f0', boxShadow: '0 1px 3px rgba(15,60,120,0.06)' },
  modalBackdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  input: { width: '100%', padding: '9px 13px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fff', color: '#111827' },
  label: { display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#1f2937', marginBottom: '6px' },
  btnGhost: { padding: '9px 22px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' },
  btnPrimary: { padding: '9px 26px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnLink: { backgroundColor: 'transparent', border: 'none', color: '#2563eb', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 4px' },
  modalTitleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 26px 0' },
  modalTitle: { fontSize: '19px', fontWeight: 600, color: '#111827' },
};

/* ════════════════════════ SMALL COMPONENTS ════════════════════════ */

const IssueBadge = ({ icon, size = 17 }: { icon: IssueIcon; size?: number }) => {
  const title = issueLabels[icon];
  switch (icon) {
    case 'risk':     return <FileText size={size} color="#ea8c1e"><title>{title}</title></FileText>;
    case 'booking':  return <AlertCircle size={size} color="#e02f2f"><title>{title}</title></AlertCircle>;
    case 'training': return <HardHat size={size} color="#e8a020"><title>{title}</title></HardHat>;
    case 'form':     return <Network size={size} color="#9333ea"><title>{title}</title></Network>;
    case 'schedule': return <CalendarX size={size} color="#3a5e8c"><title>{title}</title></CalendarX>;
    case 'ok':       return <CheckCircle size={size} color="#16a34a"><title>{title}</title></CheckCircle>;
  }
};

/** Бейдж невикористаних відпусток: ≤7 — зелений, 8–24 — кремовий, >24 — рожевий (критично) */
const UnusedBadge = ({ days }: { days: number }) => {
  const palette = days > 24
    ? { bg: '#fce7f0', color: '#be185d' }
    : days > 7
      ? { bg: '#fdf3e3', color: '#b45309' }
      : { bg: '#d8f5e3', color: '#166534' };
  return (
    <span style={{ padding: '5px 14px', fontSize: '12.5px', fontWeight: 600, borderRadius: '7px', backgroundColor: palette.bg, color: palette.color }}>
      {days} {days === 1 ? 'день' : days < 5 ? 'дні' : 'днів'}
    </span>
  );
};

const Avatar = ({ emp, size = 36 }: { emp: { initials?: string; avatarColor?: string }; size?: number }) => (
  emp.initials
    ? <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: emp.avatarColor || '#6b7280', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.34, flexShrink: 0 }}>{emp.initials}</div>
    : <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={size * 0.5} color="#9ca3af" /></div>
);

const Toast = ({ message }: { message: string }) => (
  <div style={{
    position: 'fixed', top: 70, right: 20, backgroundColor: '#10b981', color: '#fff',
    padding: '14px 22px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    zIndex: 1000, maxWidth: '400px', fontSize: '14px', fontWeight: 500,
  }}>
    {message}
  </div>
);

const ModalShell = ({ children, maxWidth, onClose }: { children: ReactNode; maxWidth: number; onClose: () => void }) => (
  <div style={S.modalBackdrop} onClick={onClose}>
    <div
      style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxWidth, width: '100%', maxHeight: '92vh', overflowY: 'auto' }}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const RightBlockHeader = ({ icon, title, open, onToggle }: { icon: ReactNode; title: string; open: boolean; onToggle: () => void }) => (
  <div
    onClick={onToggle}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      {icon}
      <span style={{ fontWeight: 600, fontSize: '16px', color: '#1b1b1b', borderBottom: '2px solid #2f6fde', paddingBottom: '3px' }}>{title}</span>
    </div>
    {open ? <ChevronUp size={18} color="#2f6fde" /> : <ChevronDown size={18} color="#2f6fde" />}
  </div>
);

const InfoField = ({ label, value, multiline }: { label: string; value: string | string[]; multiline?: boolean }) => (
  <div>
    <div style={{ fontSize: '12.5px', color: '#6b7280', marginBottom: '5px' }}>{label}</div>
    {Array.isArray(value)
      ? value.map(v => <div key={v} style={{ fontWeight: 600, color: '#111827', fontSize: '13.5px' }}>{v}</div>)
      : <div style={{ fontWeight: 600, color: '#111827', fontSize: multiline ? '13.5px' : '14px' }}>{value}</div>}
  </div>
);

const toUaDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

/* ════════════════════════ PAGE ════════════════════════ */

export const ManagerSpace = () => {
  // Layout
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sections
  const [teamOpen, setTeamOpen] = useState(true);
  const [openDepts, setOpenDepts] = useState<string[]>(['d1']);

  // Right column blocks
  const [quickOpen, setQuickOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(true);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  // Employee detail modal
  const [detailEmp, setDetailEmp] = useState<DeptEmployee | null>(null);

  // HR operation wizard
  const [hrEmp, setHrEmp] = useState<{ emp: DeptEmployee; deptName: string } | null>(null);
  const [hrStep, setHrStep] = useState<'select' | 'form'>('select');
  const [hrOp, setHrOp] = useState<HrOperation | null>(null);

  // Quick action modals
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderType, setReminderType] = useState(reminderListTypes[0]);
  const [absencesOpen, setAbsencesOpen] = useState(false);
  const [birthdaysOpen, setBirthdaysOpen] = useState(false);

  const toggleDept = (id: string) =>
    setOpenDepts(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);

  const openHrWizard = (emp: DeptEmployee, deptName: string) => {
    setHrEmp({ emp, deptName });
    setHrStep('select');
    setHrOp(null);
  };
  const closeHrWizard = () => setHrEmp(null);

  const today = new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const detail = detailEmp?.detail ?? null;

  return (
    <div style={S.page}>
      <TopBar />

      {/* Breadcrumb bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '12px 20px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <Menu size={20} color="#374151" style={{ cursor: 'pointer' }} onClick={() => setSidebarCollapsed(c => !c)} />
        <div style={{ fontSize: '13.5px', color: '#374151' }}>
          <span style={{ fontWeight: 600 }}>Головна</span>
          <span style={{ color: '#9ca3af', margin: '0 7px' }}>›</span>
          <span>Головна</span>
        </div>
      </div>

      <div style={S.body}>

        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside style={{
          width: sidebarCollapsed ? '56px' : '264px',
          flexShrink: 0, borderRight: '1px solid #ececec',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.2s ease', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', padding: sidebarCollapsed ? '16px 0' : '16px 14px 16px 18px' }}>
            {!sidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px', color: '#00A0E3', lineHeight: 1 }}>✻</span>
                <span style={{ fontSize: '17px', fontWeight: 600, color: '#1b1b1b' }}>Простір Менеджера</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(c => !c)}
              style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#2f6fde', padding: '4px', display: 'flex' }}
              title={sidebarCollapsed ? 'Розгорнути меню' : 'Згорнути меню'}
            >
              {sidebarCollapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', padding: sidebarCollapsed ? '4px 6px' : '4px 0', gap: '2px' }}>
            {sidebarNav.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => { if (!item.active) showToast('Розділ у розробці'); }}
                  title={item.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '11px',
                    padding: sidebarCollapsed ? '11px' : '11px 18px',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: '13.5px', fontWeight: 500, fontFamily: 'inherit',
                    backgroundColor: item.active ? '#ededed' : 'transparent',
                    color: item.active ? '#1b1b1b' : '#4b5563',
                    borderLeft: !sidebarCollapsed && item.active ? '3px solid #2f6fde' : '3px solid transparent',
                    borderRadius: sidebarCollapsed ? '8px' : 0,
                  }}
                >
                  <Icon size={18} color={item.active ? '#2f6fde' : '#6b7280'} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ═══ MAIN ═══ */}
        <main style={S.main}>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '18px', marginBottom: '24px' }}>
            {kpiCards.map(kpi => (
              <div key={kpi.title} style={{ ...S.card, borderColor: '#e3e3e3', padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: kpi.accent }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ width: 42, height: 42, backgroundColor: kpi.iconBg, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '21px' }}>
                    {kpi.emoji}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{kpi.value}</div>
                    <div style={{ fontSize: '13px', color: '#374151', marginTop: '6px' }}>{kpi.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Управління Командою */}
          <div style={{ ...S.card, marginBottom: '24px' }}>
            <div
              onClick={() => setTeamOpen(o => !o)}
              style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <ListChecks size={19} color="#2f6fde" />
                <span style={{ fontWeight: 600, fontSize: '17px', color: '#1b1b1b', borderBottom: '2px solid #2f6fde', paddingBottom: '3px' }}>Управління Командою</span>
              </div>
              {teamOpen ? <ChevronUp size={18} color="#2f6fde" /> : <ChevronDown size={18} color="#2f6fde" />}
            </div>

            {teamOpen && (
              <>
                {/* Legend */}
                <div style={{ padding: '10px 18px 14px', backgroundColor: '#fafbfd', borderTop: '1px solid #eef2f7', borderBottom: '1px solid #eef2f7' }}>
                  <div style={{ fontSize: '13.5px', color: '#374151', marginBottom: '9px' }}>
                    Легенда статусів <span style={{ fontWeight: 600 }}>"Відкриті питання"</span>:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 22px' }}>
                    {(['risk', 'booking', 'training', 'form', 'schedule', 'ok'] as IssueIcon[]).map(ic => (
                      <div key={ic} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', color: '#374151' }}>
                        <IssueBadge icon={ic} size={16} />
                        <span>{issueLabels[ic]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table header */}
                <div style={{ padding: '12px 18px', display: 'grid', gridTemplateColumns: '36px 1fr 170px 200px 200px', gap: '12px', fontSize: '11px', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.04em', alignItems: 'center' }}>
                  <div />
                  <div>Співробітник <span style={{ color: '#2f6fde' }}>↑</span></div>
                  <div>Тип відсутності</div>
                  <div>Відкриті питання</div>
                  <div>Невикористані відпустки</div>
                </div>

                {/* Department rows */}
                {departments.map(dept => {
                  const open = openDepts.includes(dept.id);
                  return (
                    <div key={dept.id}>
                      <div
                        onClick={() => toggleDept(dept.id)}
                        style={{ padding: '13px 18px', display: 'grid', gridTemplateColumns: '36px 1fr 440px', gap: '12px', alignItems: 'center', cursor: 'pointer', borderTop: '1px solid #eef2f7', backgroundColor: open ? '#fafbfd' : 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f5f8fc')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = open ? '#fafbfd' : 'transparent')}
                      >
                        <div>{open ? <ChevronDown size={16} color="#2f6fde" /> : <ChevronRight size={16} color="#6b7280" />}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <Users size={18} color="#2f6fde" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dept.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            {dept.headerIssues.map((ic, i) => <IssueBadge key={i} icon={ic} size={16} />)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '22px', fontSize: '13px', color: '#374151' }}>
                          <span>{dept.employeesCount}</span>
                          <span>{dept.absentCount}</span>
                          <span style={{ color: '#dc2626', fontWeight: 500 }}>{dept.problems}</span>
                        </div>
                      </div>

                      {open && dept.employees.map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => setDetailEmp(emp)}
                          style={{ padding: '11px 18px', display: 'grid', gridTemplateColumns: '36px 1fr 170px 200px 200px', gap: '12px', alignItems: 'center', fontSize: '13.5px', cursor: 'pointer', borderTop: '1px solid #eef2f7' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f5fb')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            <Avatar emp={emp} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
                              <div style={{ fontSize: '11.5px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.position}</div>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); openHrWizard(emp, dept.name); }}
                              title="Ініціювати кадрову операцію"
                              style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#e8f1fd', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                              onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#d4e6fb')}
                              onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = '#e8f1fd')}
                            >
                              <UserPen size={17} color="#2f6fde" />
                            </button>
                          </div>
                          <div style={{ color: '#111827' }}>{emp.absenceType}</div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {emp.issues.map((ic, i) => <IssueBadge key={i} icon={ic} size={16} />)}
                          </div>
                          <div>
                            <UnusedBadge days={emp.unusedDays} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Звіти */}
          <div style={{ ...S.card, marginBottom: '24px' }}>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '9px' }}>
              <BarChart3 size={19} color="#2f6fde" />
              <span style={{ fontWeight: 600, fontSize: '17px', color: '#1b1b1b', borderBottom: '2px solid #2f6fde', paddingBottom: '3px' }}>Звіти</span>
            </div>
            <div style={{ padding: '6px 18px 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {reports.map(r => (
                <div
                  key={r.title}
                  onClick={() => showToast(`Звіт «${r.title}» буде надіслано на вашу пошту`)}
                  style={{ padding: '12px 14px', border: '1px solid #b9d3f0', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '11px', transition: 'all 0.15s ease', backgroundColor: '#fff' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2f6fde'; e.currentTarget.style.backgroundColor = '#f5f9ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#b9d3f0'; e.currentTarget.style.backgroundColor = '#fff'; }}
                >
                  <div style={{ width: 38, height: 38, backgroundColor: r.iconBg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {r.icon}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#111827' }}>{r.title}</div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ═══ RIGHT COLUMN ═══ */}
        <aside style={S.rightBar}>
          {/* Швидкі дії */}
          <div style={S.card}>
            <RightBlockHeader
              icon={<HelpCircle size={18} color="#2f6fde" />}
              title="Швидкі дії"
              open={quickOpen}
              onToggle={() => setQuickOpen(o => !o)}
            />
            {quickOpen && (
              <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => setReminderOpen(true)} style={{ width: '100%', padding: '14px', backgroundColor: '#229FFF', color: '#fff', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', position: 'relative', fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                    <Send size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>Надіслати нагадування</div>
                      <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.88)', marginTop: '2px' }}>Нагадати про завершення відпустки</div>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 21, height: 21, borderRadius: '50%', backgroundColor: '#89CCFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#0c4a6e' }}>2</div>
                </button>
                <button onClick={() => setAbsencesOpen(true)} style={{ width: '100%', padding: '14px', backgroundColor: '#B8328B', color: '#fff', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                    <Calendar size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>Планові відсутності</div>
                      <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.88)', marginTop: '2px' }}>Календар відпусток на наступний місяць</div>
                    </div>
                  </div>
                </button>
                <button onClick={() => setBirthdaysOpen(true)} style={{ width: '100%', padding: '14px', backgroundColor: '#F49157', color: '#fff', border: 'none', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                    <Cake size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>Дні народження</div>
                      <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.88)', marginTop: '2px' }}>Звіт про дні народження співробітників</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Статистика місяця */}
          <div style={S.card}>
            <RightBlockHeader
              icon={<ListChecks size={18} color="#2f6fde" />}
              title="Статистика місяця"
              open={statsOpen}
              onToggle={() => setStatsOpen(o => !o)}
            />
            {statsOpen && (
              <div style={{ padding: '2px 16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                  <span style={{ color: '#4b5563' }}>Використано відпускних днів</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>61 / 129</span>
                </div>
                <div style={{ width: '100%', height: '7px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}>
                  <div style={{ width: '47%', height: '7px', backgroundColor: '#2f6fde', borderRadius: '4px' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                  <span style={{ fontWeight: 700 }}>47%</span> від річного ліміту
                </div>
                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <button
                    onClick={() => showToast('Звіт буде надіслано на вашу пошту')}
                    style={{ ...S.btnPrimary, backgroundColor: '#2f6fde', padding: '8px 32px' }}
                  >
                    Звіт
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Останні сповіщення */}
          <div style={S.card}>
            <RightBlockHeader
              icon={<Bell size={18} color="#2f6fde" />}
              title="Останні сповіщення"
              open={notifOpen}
              onToggle={() => setNotifOpen(o => !o)}
            />
            {notifOpen && (
              <div style={{ padding: '2px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  onClick={() => showToast('Відкриваються запити на відпустку...')}
                  style={{ display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#e3edfb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Send size={15} color="#2f6fde" />
                  </div>
                  <span style={{ fontSize: '13.5px', color: '#111827' }}>Запити на відпустку (1)</span>
                </div>
                <div
                  onClick={() => showToast('Відкриваються запити на графік відпусток...')}
                  style={{ display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#e3edfb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CalendarDays size={15} color="#2f6fde" />
                  </div>
                  <span style={{ fontSize: '13.5px', color: '#111827' }}>Запити на графік відпусток (1)</span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Floating help bubble */}
      <div
        onClick={() => showToast('Довідка Простору Менеджера відкриється тут')}
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 58, height: 46,
          backgroundColor: '#7AC143', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '22px', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(122,193,67,0.45)', zIndex: 40,
        }}
        title="Допомога"
      >
        ?
      </div>

      {/* ═══ HR OPERATION WIZARD ═══ */}
      {hrEmp && (
        <HrOperationModal
          emp={hrEmp.emp}
          deptName={hrEmp.deptName}
          step={hrStep}
          op={hrOp}
          onSelectOp={setHrOp}
          onNext={() => hrOp && setHrStep('form')}
          onBack={() => setHrStep('select')}
          onClose={closeHrWizard}
          onSent={() => { closeHrWizard(); showToast('Лист надіслано HR. Запит на кадрову операцію зареєстровано!'); }}
        />
      )}

      {/* ═══ EMPLOYEE DETAIL MODAL ═══ */}
      {detailEmp && detail && (
        <ModalShell maxWidth={920} onClose={() => setDetailEmp(null)}>
          <div style={S.modalTitleRow}>
            <div style={S.modalTitle}>Деталі співробітника</div>
            <button onClick={() => setDetailEmp(null)} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={22} />
            </button>
          </div>

          <div style={{ padding: '0 26px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '13px', marginTop: '16px', marginBottom: '18px' }}>
              <Avatar emp={detailEmp} size={44} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15.5px', color: '#111827' }}>{detailEmp.name}</span>
                  {detail.isVeteran && (
                    <span style={{ padding: '2px 12px', border: '1px solid #93c5fd', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 600, borderRadius: '99px' }}>Ветеран</span>
                  )}
                </div>
                <div style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '2px' }}>{detailEmp.position}</div>
              </div>
            </div>

            {/* Info panel */}
            <div style={{ backgroundColor: '#f7f8fa', borderRadius: '12px', padding: '20px 22px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1.1fr', gap: '20px', marginBottom: '18px' }}>
                <InfoField label="Тип відсутності" value={detail.absenceType} />
                <InfoField label="Період відсутності" value={detail.absenceStart ? `${detail.absenceStart} - ${detail.absenceEnd}` : '—'} />
                <InfoField label="Дата народження" value={detail.birthDate} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12.5px', color: '#6b7280' }}>Невикористані відпустки</span>
                    <Send size={14} color="#2f6fde" style={{ cursor: 'pointer' }} onClick={() => showToast('Нагадування про відпустку надіслано')} />
                  </div>
                  <div style={{ backgroundColor: '#d8f5e3', color: '#166534', textAlign: 'center', borderRadius: '7px', padding: '6px', fontWeight: 700, fontSize: '13.5px' }}>
                    {detail.vacationReserve}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 2.1fr', gap: '20px' }}>
                <div style={{ gridColumn: '1 / 3' }}>
                  <InfoField label="Відділення НП" value={detail.novaPoshtaBranch} multiline />
                </div>
                <InfoField label="Контакти" value={detail.contacts} />
              </div>
            </div>

            {/* Open issues */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#111827', marginBottom: '13px' }}>Відкриті питання:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '13px' }}>
                <div style={{ backgroundColor: '#fdf1f1', border: '1px solid #f3c6c6', borderRadius: '10px', padding: '13px 15px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <AlertTriangle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#7f1d1d' }}>Статус контракту: {detail.contractStatus}</span>
                      <Send size={13} color="#dc2626" style={{ cursor: 'pointer' }} onClick={() => showToast('Повідомлення HR менеджеру надіслано')} />
                    </div>
                    <span style={{ fontSize: '12.5px', color: '#7f1d1d', whiteSpace: 'nowrap' }}>до {detail.contractEnd}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9a3b3b', marginTop: '8px', lineHeight: 1.45 }}>
                    {detail.contractNote}
                  </div>
                </div>
                <div style={{ backgroundColor: '#fdf1f1', border: '1px solid #f3c6c6', borderRadius: '10px', padding: '13px 15px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <AlertTriangle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#7f1d1d' }}>Інструктаж: {detail.trainingStatus}</span>
                      <FileText size={13} color="#dc2626" style={{ cursor: 'pointer' }} onClick={() => showToast('Відкривається документ інструктажу в Докнет...')} />
                    </div>
                    <span style={{ fontSize: '12.5px', color: '#7f1d1d', whiteSpace: 'nowrap' }}>до {detail.trainingEnd}</span>
                  </div>
                </div>
                <div style={{ backgroundColor: '#fdf1f1', border: '1px solid #f3c6c6', borderRadius: '10px', padding: '13px 15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#7f1d1d' }}>Графік відпусток: {detail.scheduleStatus}</span>
                    <Send size={13} color="#dc2626" style={{ cursor: 'pointer' }} onClick={() => showToast('Нагадування про графік відпусток надіслано')} />
                  </div>
                </div>
                <div style={{ backgroundColor: '#fdf8ec', border: '1px solid #ead9a8', borderRadius: '10px', padding: '13px 15px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={15} color="#92702a" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#6b5418' }}>Бронювання: {detail.bookingStatus}</span>
                    </div>
                    <span style={{ fontSize: '12.5px', color: '#6b5418', whiteSpace: 'nowrap' }}>до {detail.bookingEnd}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Work organization form */}
            <div style={{ backgroundColor: '#f7f8fa', borderRadius: '12px', padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
                <Briefcase size={18} color="#2f6fde" />
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#111827' }}>Форма організації праці:</span>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ ...S.label, fontWeight: 400, color: '#6b7280' }}>Форма організації праці</label>
                <select defaultValue={detail.workForm} style={S.input}>
                  <option value=""></option>
                  <option value="office">Офісна</option>
                  <option value="remote">Дистанційна</option>
                  <option value="hybrid">Гібридна</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ ...S.label, fontWeight: 400, color: '#6b7280' }}>Дійсне з</label>
                  <input type="text" defaultValue={today} style={S.input} />
                </div>
                <div>
                  <label style={{ ...S.label, fontWeight: 400, color: '#6b7280' }}>Дата реєстрації</label>
                  <input type="text" value={detail.regDate} disabled style={{ ...S.input, backgroundColor: '#eef0f3', color: '#9ca3af' }} />
                </div>
              </div>
              <button
                onClick={() => { showToast('Форму організації праці збережено'); setDetailEmp(null); }}
                style={{ ...S.btnPrimary, width: '100%', padding: '11px', fontSize: '14.5px' }}
              >
                Зберегти
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ═══ REMINDER MODAL ═══ */}
      {reminderOpen && (
        <ModalShell maxWidth={540} onClose={() => setReminderOpen(false)}>
          <div style={S.modalTitleRow}>
            <div style={S.modalTitle}>Надіслати нагадування</div>
            <button onClick={() => setReminderOpen(false)} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={22} />
            </button>
          </div>
          <div style={{ padding: '14px 26px 24px' }}>
            <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5, marginBottom: '16px' }}>
              Натиснувши кнопку Підтвердити, усі працівники з вибраної категорії отримають емейл нагадування
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ ...S.label, fontWeight: 400, color: '#374151' }}>Тип списку:</label>
              <select value={reminderType} onChange={e => setReminderType(e.target.value)} style={S.input}>
                {reminderListTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <ul style={{ margin: '0 0 22px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(reminderType === reminderListTypes[0] || reminderType === reminderListTypes[1]) && (
                <li style={{ fontSize: '13.5px', color: '#111827' }}>Працівників з несформованим графіком відпусток: 1</li>
              )}
              {(reminderType === reminderListTypes[0] || reminderType === reminderListTypes[2]) && (
                <li style={{ fontSize: '13.5px', color: '#111827' }}>Працівників з критично великою кількістю невикористаної відпустки &gt;24: 1</li>
              )}
              <li style={{ fontSize: '13.5px', color: '#111827' }}>
                Усього нагадувань: {reminderType === reminderListTypes[0] ? 2 : 1}
              </li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => { setReminderOpen(false); showToast('Нагадування надіслано працівникам!'); }}
                style={S.btnPrimary}
              >
                Підтвердити
              </button>
              <button onClick={() => setReminderOpen(false)} style={S.btnGhost}>Закрити</button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ═══ PLANNED ABSENCES MODAL ═══ */}
      {absencesOpen && (
        <ModalShell maxWidth={540} onClose={() => setAbsencesOpen(false)}>
          <div style={S.modalTitleRow}>
            <div style={S.modalTitle}>Планові відсутності</div>
            <button onClick={() => setAbsencesOpen(false)} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={22} />
            </button>
          </div>
          <div style={{ padding: '14px 26px 24px' }}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ ...S.label, fontWeight: 400, color: '#374151' }}>Оберіть місяць:</label>
              <select style={S.input}>
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ fontSize: '13.5px', color: '#4b5563', marginBottom: '13px' }}>Наступні співробітники мають заплановану відсутність</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              {plannedAbsences.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '13px 15px', backgroundColor: '#f7f8fa', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                    <Avatar emp={{}} size={40} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#111827' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.dept}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#111827' }}>{p.period}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.type}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setAbsencesOpen(false)} style={S.btnGhost}>Закрити</button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ═══ BIRTHDAYS MODAL ═══ */}
      {birthdaysOpen && (
        <ModalShell maxWidth={540} onClose={() => setBirthdaysOpen(false)}>
          <div style={S.modalTitleRow}>
            <div style={S.modalTitle}>Дні народження</div>
            <button onClick={() => setBirthdaysOpen(false)} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={22} />
            </button>
          </div>
          <div style={{ padding: '14px 26px 24px' }}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ ...S.label, fontWeight: 400, color: '#374151' }}>Оберіть місяць:</label>
              <select style={S.input}>
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ fontSize: '13.5px', color: '#4b5563', marginBottom: '13px' }}>Дні народження співробітників цього місяця:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              {birthdays.map(b => (
                <div key={b.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '13px 15px', backgroundColor: '#f7f8fa', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                    <Avatar emp={{}} size={40} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#111827' }}>{b.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{b.position}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#111827', flexShrink: 0 }}>{b.date}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => { setBirthdaysOpen(false); showToast('Звіт про дні народження надіслано на вашу пошту'); }}
                style={S.btnPrimary}
              >
                Відправити звіт на пошту
              </button>
              <button onClick={() => setBirthdaysOpen(false)} style={S.btnGhost}>Закрити</button>
            </div>
          </div>
        </ModalShell>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
};

/* ════════════════════════ HR OPERATION MODAL ════════════════════════ */

type HrModalProps = {
  emp: DeptEmployee; deptName: string;
  step: 'select' | 'form';
  op: HrOperation | null;
  onSelectOp: (op: HrOperation) => void;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
  onSent: () => void;
};

const HrOperationModal = ({ emp, deptName, step, op, onSelectOp, onNext, onBack, onClose, onSent }: HrModalProps) => {
  return (
    <ModalShell maxWidth={step === 'select' ? 700 : 660} onClose={onClose}>
      {step === 'select' && (
        <>
          <div style={S.modalTitleRow}>
            <div style={S.modalTitle}>Ініціювати кадрові зміни</div>
            <button onClick={onClose} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={22} />
            </button>
          </div>
          <div style={{ padding: '20px 26px 24px' }}>
            {/* Selected employee */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', backgroundColor: '#f7f8fa', border: '1px solid #eceef2', borderRadius: '10px', marginBottom: '20px' }}>
              <Avatar emp={emp} size={42} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{emp.name}</div>
                <div style={{ fontSize: '12.5px', color: '#6b7280' }}>{deptName}</div>
              </div>
            </div>

            {/* Operation cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
              {hrOperations.map(o => {
                const selected = op === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => onSelectOp(o.id)}
                    style={{
                      padding: '20px 14px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                      border: selected ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      backgroundColor: '#fff',
                      boxShadow: selected ? '0 2px 10px rgba(37,99,235,0.12)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 50, height: 50, borderRadius: '12px', margin: '0 auto 12px',
                      backgroundColor: selected ? '#2563eb' : '#eceef2',
                      color: selected ? '#fff' : '#9ca3af',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {o.icon}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#111827' }}>{o.title}</div>
                    <div style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '4px' }}>{o.sub}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '18px' }}>
              <button onClick={onClose} style={{ ...S.btnLink, color: '#374151' }}>Скасувати</button>
              <button
                onClick={onNext}
                disabled={!op}
                style={{ ...S.btnPrimary, opacity: op ? 1 : 0.5, cursor: op ? 'pointer' : 'default' }}
              >
                Далі
              </button>
            </div>
          </div>
        </>
      )}

      {step === 'form' && op && (
        <HrOperationForm emp={emp} op={op} onBack={onBack} onClose={onClose} onSent={onSent} />
      )}
    </ModalShell>
  );
};

/* ════════════════════════ HR OPERATION FORM (step 2) ════════════════════════ */

const HrOperationForm = ({ emp, op, onBack, onClose, onSent }: {
  emp: DeptEmployee; op: HrOperation;
  onBack: () => void; onClose: () => void; onSent: () => void;
}) => {
  const titles = hrOperationTitles[op];

  // Спільні поля
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reason, setReason] = useState('');
  const [budget, setBudget] = useState('');
  const [comments, setComments] = useState('');
  // Зарплата
  const [newSalary, setNewSalary] = useState('');
  // Переведення
  const [newDept, setNewDept] = useState('');

  const [letter, setLetter] = useState<string | null>(null);

  const requiredFilled =
    op === 'salary'
      ? !!(effectiveDate && newSalary && reason && comments)
      : op === 'transfer'
        ? !!(effectiveDate && newDept && comments)
        : !!(effectiveDate && reason && comments);

  const buildLetter = () => {
    const d = toUaDate(effectiveDate);
    if (op === 'salary') {
      return `Добрий день!\n\nПрошу погодити перегляд посадового окладу співробітнику з (${d}).\n${emp.name}  (таб. № К33)\nЗапропонований оклад: ${newSalary} грн\nПричина перегляду: ${reason}\nБюджет: ${budget || '—'}\n\nІнші коментарі: ${comments}`;
    }
    if (op === 'transfer') {
      return `Добрий день!\n\nПрошу погодити переведення співробітника з (${d}).\n${emp.name}  (таб. № К33)\nНовий підрозділ: ${newDept}\nПричина: ${reason || '—'}\n\nІнші коментарі: ${comments}`;
    }
    return `Добрий день!\n\nПрошу погодити звільнення співробітника з (${d}).\n${emp.name}  (таб. № К33)\nПричина: ${reason}\n\nІнші коментарі: ${comments}`;
  };

  return (
    <>
      <div style={S.modalTitleRow}>
        <div style={S.modalTitle}>{titles.modal}</div>
        <button onClick={onClose} style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={22} />
        </button>
      </div>
      <div style={{ padding: '14px 26px 24px' }}>
        <div style={{ fontWeight: 600, fontSize: '15px', color: '#1f2937', marginBottom: '14px' }}>
          Заповніть деталі для операції {titles.detail}
        </div>

        {/* Callout */}
        <div style={{ backgroundColor: '#fdf8ec', border: '1px solid #f0e3bd', borderRadius: '10px', padding: '12px 15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={15} color="#2563eb" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: '#1f2937' }}>{titles.calloutTitle}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', marginLeft: '23px' }}>{emp.name}</div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={S.label}>{op === 'dismissal' ? 'Дата звільнення *' : op === 'transfer' ? 'Дата переведення *' : 'Дата набуття чинності *'}</label>
            <input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} style={S.input} />
          </div>

          {op === 'salary' && (
            <div>
              <label style={S.label}>Новий оклад *</label>
              <div style={{ display: 'flex' }}>
                <span style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRight: 'none', borderRadius: '8px 0 0 8px', backgroundColor: '#f3f4f6', fontSize: '14px', color: '#6b7280' }}>₴</span>
                <input
                  type="number" placeholder="25 000" value={newSalary} onChange={e => setNewSalary(e.target.value)}
                  style={{ ...S.input, borderRadius: '0 8px 8px 0' }}
                />
              </div>
            </div>
          )}

          {op === 'transfer' && (
            <div>
              <label style={S.label}>Новий підрозділ *</label>
              <select value={newDept} onChange={e => setNewDept(e.target.value)} style={S.input}>
                <option value="" disabled>Оберіть підрозділ</option>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={S.label}>{op === 'dismissal' ? 'Причина звільнення *' : op === 'salary' ? 'Причина перегляду *' : 'Причина'}</label>
            <input type="text" placeholder={op === 'salary' ? 'Вкажіть причину перегляду' : 'Вкажіть причину'} value={reason} onChange={e => setReason(e.target.value)} style={S.input} />
          </div>

          {op === 'salary' && (
            <div>
              <label style={S.label}>Бюджет</label>
              <input type="text" placeholder="Вкажіть бюджет" value={budget} onChange={e => setBudget(e.target.value)} style={S.input} />
            </div>
          )}

          <div>
            <label style={S.label}>Інші коментарі *</label>
            <textarea rows={3} placeholder="Вкажіть інші коментарі" value={comments} onChange={e => setComments(e.target.value)} style={{ ...S.input, resize: 'vertical' }} />
          </div>
        </div>

        {/* Generate letter */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: letter ? '20px' : '24px' }}>
          <button
            onClick={() => requiredFilled && setLetter(buildLetter())}
            disabled={!requiredFilled}
            style={{ ...S.btnPrimary, backgroundColor: requiredFilled ? '#2563eb' : '#a8c7f5', cursor: requiredFilled ? 'pointer' : 'default' }}
          >
            Сформувати текст листа
          </button>
        </div>

        {letter !== null && (
          <>
            {/* Email meta */}
            <div style={{ backgroundColor: '#eaf3fd', borderRadius: '10px', padding: '13px 16px', marginBottom: '14px', fontSize: '12.5px', color: '#1f2937', lineHeight: 1.55 }}>
              <div>Кому: {emailTo}</div>
              <div>Копія: {emailCc}</div>
              <div>Тема: {titles.emailSubject}</div>
            </div>

            {/* Letter editor */}
            <div style={{ border: '1px solid #d1d5db', borderRadius: '10px', overflow: 'hidden', marginBottom: '22px' }}>
              <div style={{ padding: '9px 14px', borderBottom: '1px solid #e5e7eb', fontSize: '12.5px', color: '#4b5563', backgroundColor: '#fafafa' }}>
                Шаблон листа про зміну {titles.modal === 'Зарплата' ? 'Зарплати' : titles.modal.toLowerCase()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 14px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fcfcfc' }}>
                <Bold size={15} color="#374151" style={{ cursor: 'pointer' }} />
                <Italic size={15} color="#374151" style={{ cursor: 'pointer' }} />
                <Underline size={15} color="#374151" style={{ cursor: 'pointer' }} />
                <List size={15} color="#374151" style={{ cursor: 'pointer' }} />
                <ListOrdered size={15} color="#374151" style={{ cursor: 'pointer' }} />
              </div>
              <textarea
                value={letter}
                onChange={e => setLetter(e.target.value)}
                rows={12}
                style={{ width: '100%', border: 'none', outline: 'none', padding: '16px', fontSize: '13.5px', fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', color: '#111827' }}
              />
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={S.btnLink}>
            <ArrowLeft size={15} /> Назад
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <button onClick={onClose} style={{ ...S.btnLink, color: '#374151' }}>Скасувати</button>
            {letter !== null && (
              <button onClick={onSent} style={S.btnPrimary}>Надіслати лист</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerSpace;
