// ── ОХОРОНА ПРАЦІ: дані команди для Простору менеджера ─────────────────────
// Всі імена вигадані. Демо-дата: 04.07.2026 (див. safety.ts)

/* Навчання підлеглого */
export type TeamTraining = {
  title: string;
  protocol: string;
  passedAt: string;
  validUntil: string;
  requestSent?: boolean;      // заявку на нове навчання вже сформовано в docNet
};

/* Повторний інструктаж підлеглого */
export type TeamBriefing = {
  passedAt: string;
  validUntil: string;
  periodicity: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  introBriefingAt: string;      // вступний
  primaryBriefingAt: string;    // первинний
  repeatBriefing: TeamBriefing; // останній повторний
  trainings: TeamTraining[];
};

/* ── Електробезпека (окремий таб; довідники — з вимог docNet) ── */
export type ElGroup =
  | 'II до 1000 В' | 'II до та понад 1000 В'
  | 'III до 1000 В' | 'III до та понад 1000 В'
  | 'IV до 1000 В' | 'IV до та понад 1000 В'
  | 'V понад 1000 В';

export type ElPeriodicity = '1 раз на рік' | '1 раз на 3 роки';

export type ElPersonnelCategory =
  | 'адміністративно-технічний' | 'оперативний' | 'оперативно-ремонтний'
  | 'ремонтний' | 'електротехнологічний';

export type ElectricalRecord = {
  memberId: string;
  ruleName: string;             // назва правил (коротко)
  ruleFull: string;             // повна назва для drawer
  personnelCategory: ElPersonnelCategory;
  prevGroup: ElGroup;           // попередня група з ел. безпеки
  requiredGroup: ElGroup;       // необхідна група з ел. безпеки
  lastCheck: string;            // дата попередньої перевірки
  nextCheck: string;            // дата наступної перевірки
  periodicity: ElPeriodicity;
};

export const electricalRecords: ElectricalRecord[] = [
  {
    memberId: 'e1',
    ruleName: 'ПБЕЕС',
    ruleFull: 'Правила безпечної експлуатації електроустановок споживачів',
    personnelCategory: 'адміністративно-технічний',
    prevGroup: 'III до 1000 В',
    requiredGroup: 'IV до та понад 1000 В',
    lastCheck: '28.07.2025', nextCheck: '28.07.2026',
    periodicity: '1 раз на рік',
  },
  {
    memberId: 'e6',
    ruleName: 'ПБЕЕС',
    ruleFull: 'Правила безпечної експлуатації електроустановок споживачів',
    personnelCategory: 'електротехнологічний',
    prevGroup: 'III до 1000 В',
    requiredGroup: 'III до 1000 В',
    lastCheck: '18.06.2025', nextCheck: '18.06.2026',
    periodicity: '1 раз на рік',
  },
  {
    memberId: 'e3',
    ruleName: 'ПБЕЕС',
    ruleFull: 'Правила безпечної експлуатації електроустановок споживачів',
    personnelCategory: 'ремонтний',
    prevGroup: 'II до 1000 В',
    requiredGroup: 'II до 1000 В',
    lastCheck: '05.02.2025', nextCheck: '05.02.2028',
    periodicity: '1 раз на 3 роки',
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: 'e1', name: 'Вигадко Орест', role: 'Керівник напряму розробки',
    introBriefingAt: '10.02.2019', primaryBriefingAt: '11.02.2019',
    repeatBriefing: { passedAt: '20.01.2026', validUntil: '20.07.2026', periodicity: '1 раз на 6 міс' },
    trainings: [
      { title: 'Охорона праці (загальне навчання)', protocol: '№ 38-ОП', passedAt: '12.08.2023', validUntil: '12.08.2026' },
    ],
  },
  {
    id: 'e2', name: 'Квіткова Мирослава', role: 'Старший фахівець з фінансових операцій',
    introBriefingAt: '03.06.2021', primaryBriefingAt: '04.06.2021',
    repeatBriefing: { passedAt: '10.03.2026', validUntil: '10.09.2026', periodicity: '1 раз на 6 міс' },
    trainings: [
      { title: 'Охорона праці (загальне навчання)', protocol: '№ 51-ОП', passedAt: '15.10.2024', validUntil: '15.10.2027' },
    ],
  },
  {
    id: 'e3', name: 'Джерелько Дмитро', role: 'Фахівець із закупівель',
    introBriefingAt: '17.09.2020', primaryBriefingAt: '18.09.2020',
    repeatBriefing: { passedAt: '05.12.2025', validUntil: '05.06.2026', periodicity: '1 раз на 6 міс' },
    trainings: [
      { title: 'Охорона праці (загальне навчання)', protocol: '№ 22-ОП', passedAt: '01.06.2023', validUntil: '01.06.2026' },
      { title: 'Пожежна безпека', protocol: '№ 05-ПБ', passedAt: '14.03.2025', validUntil: '14.03.2028' },
    ],
  },
  {
    id: 'e4', name: 'Хмаркова Соломія', role: 'Провідний юрисконсульт',
    introBriefingAt: '22.04.2022', primaryBriefingAt: '25.04.2022',
    repeatBriefing: { passedAt: '02.02.2026', validUntil: '02.08.2026', periodicity: '1 раз на 6 міс' },
    trainings: [
      { title: 'Охорона праці (загальне навчання)', protocol: '№ 47-ОП', passedAt: '20.09.2024', validUntil: '20.09.2027' },
    ],
  },
  {
    id: 'e5', name: 'Місяченко Андрій', role: 'Водій службового автомобіля',
    introBriefingAt: '08.11.2018', primaryBriefingAt: '09.11.2018',
    repeatBriefing: { passedAt: '15.05.2026', validUntil: '15.08.2026', periodicity: '1 раз на 3 міс (для працівників, які керують службовим автомобілем)' },
    trainings: [
      { title: 'Охорона праці (загальне навчання)', protocol: '№ 33-ОП', passedAt: '10.07.2023', validUntil: '10.07.2026' },
      { title: 'Безпека дорожнього руху', protocol: '№ 02-БДР', passedAt: '05.04.2025', validUntil: '05.04.2027' },
    ],
  },
  {
    id: 'e6', name: 'Калиновський Артем', role: 'Старший фахівець з управління процесами',
    introBriefingAt: '30.01.2023', primaryBriefingAt: '31.01.2023',
    repeatBriefing: { passedAt: '14.04.2026', validUntil: '14.10.2026', periodicity: '1 раз на 6 міс' },
    trainings: [
      { title: 'Охорона праці (загальне навчання)', protocol: '№ 58-ОП', passedAt: '25.11.2025', validUntil: '25.11.2028' },
    ],
  },
];
