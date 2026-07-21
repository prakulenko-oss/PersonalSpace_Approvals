// ── ОХОРОНА ПРАЦІ: мокові дані для прототипу ──────────────────────────────
// Всі імена та документи вигадані. Демо-дата: 04.07.2026

export const DEMO_TODAY = new Date(2026, 6, 4); // 04.07.2026

/* Парсинг дд.мм.рррр та кількість днів до дати від демо-сьогодні */
export const parseUa = (s: string): Date | null => {
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return null;
  return new Date(+m[3], +m[2] - 1, +m[1]);
};

export const daysUntil = (dateStr: string): number | null => {
  const d = parseUa(dateStr);
  if (!d) return null;
  return Math.round((d.getTime() - DEMO_TODAY.getTime()) / 86400000);
};

/* Статус за терміном дії: актуально / завершується (≤45 днів ≈ 1,5 міс) / прострочено */
export type ExpiryStatus = 'ok' | 'soon' | 'expired' | 'none';

export const expiryStatus = (validUntil?: string): ExpiryStatus => {
  if (!validUntil) return 'none';
  const days = daysUntil(validUntil);
  if (days == null) return 'none';
  if (days < 0) return 'expired';
  if (days <= 45) return 'soon';
  return 'ok';
};

/* ── Інструктажі ── */
export type Briefing = {
  id: string;
  kind: 'Вступний' | 'Первинний' | 'Повторний' | 'Позаплановий' | 'Цільовий';
  note?: string;              // напр. «останній пройдений»
  passedAt?: string;          // дата проходження (немає — не проводився)
  validUntil?: string;        // термін дії (для повторного)
  periodicity?: string;       // періодичність проведення (для повторного)
  reason?: string;            // причина проведення (позаплановий/цільовий)
  basis?: string;             // підстава: наказ, розпорядження (позаплановий)
  instructions?: string[];    // назва та номер інструкцій
  techCards?: string[];       // назва та номер технологічних карт
  notConductedHint?: string;  // пояснення, коли інструктаж не проводився
  conductor?: string;         // хто провів
};

export const briefings: Briefing[] = [
  {
    id: 'b1', kind: 'Вступний',
    passedAt: '15.03.2021',
    instructions: [
      'Інструкція № 1 «Вступний інструктаж з питань охорони праці»',
    ],
    conductor: 'Інженер з охорони праці — Калиновська О. В.',
  },
  {
    id: 'b2', kind: 'Первинний',
    passedAt: '16.03.2021',
    instructions: [
      'Інструкція з охорони праці № 3 «Під час роботи з екранними пристроями (персональними компʼютерами та ноутбуками)»',
      'Інструкція № 12 «Про надання домедичної допомоги потерпілим при нещасних випадках»',
      'Інструкція з охорони праці № 13 для осіб, які працюють у форматі «Віддалений доступ»',
      'Інструкція № 16 з ОП з безпечної експлуатації побутових електроприладів та зарядних пристроїв',
    ],
    conductor: 'Керівник підрозділу — Дібровський М. С.',
  },
  {
    id: 'b3', kind: 'Повторний', note: 'останній пройдений',
    passedAt: '15.02.2026', validUntil: '15.08.2026',
    periodicity: '1 раз на 6 міс',
    instructions: [
      'Інструкція з охорони праці № 3 «Під час роботи з екранними пристроями (персональними компʼютерами та ноутбуками)»',
      'Інструкція № 12 «Про надання домедичної допомоги потерпілим при нещасних випадках»',
      'Інструкція з охорони праці № 13 для осіб, які працюють у форматі «Віддалений доступ»',
      'Інструкція № 16 з ОП з безпечної експлуатації побутових електроприладів та зарядних пристроїв',
    ],
    conductor: 'Керівник підрозділу — Дібровський М. С.',
  },
  {
    id: 'b4', kind: 'Позаплановий', note: 'останній пройдений',
    passedAt: '10.11.2025',
    reason: 'Зміни технологічного процесу',
    basis: 'Наказ № 247-ОД від 03.11.2025',
    instructions: [
      'Інструкція з охорони праці № 3 «Під час роботи з екранними пристроями (персональними компʼютерами та ноутбуками)»',
    ],
    techCards: [
      'ТК.ТД-З.МОВ.03-2022 «Обстеження споруд»',
    ],
    conductor: 'Керівник підрозділу — Дібровський М. С.',
  },
  {
    id: 'b5', kind: 'Цільовий',
    notConductedHint: 'Проводиться перед разовими роботами, що потребують окремого допуску (наряд-допуск)',
  },
];

/* ── Навчання ── */
export type Training = {
  id: string;
  title: string;
  protocol: string;           // № протоколу з електронного архіву
  passedAt: string;
  validUntil: string;
  org: string;                // навчальний центр
  hasCertificate: boolean;    // посвідчення в архіві
};

export const trainings: Training[] = [
  {
    id: 't1', title: 'Охорона праці (загальне навчання)',
    protocol: '№ 45-ОП', passedAt: '20.09.2023', validUntil: '20.09.2026',
    org: 'Навчальний центр «Профі-Безпека»', hasCertificate: true,
  },
  {
    id: 't2', title: 'Електробезпека (ІІІ група допуску)',
    protocol: '№ 12-ЕБ', passedAt: '05.08.2025', validUntil: '05.08.2026',
    org: 'Навчальний центр «Енерго-Освіта»', hasCertificate: true,
  },
  {
    id: 't3', title: 'Пожежна безпека',
    protocol: '№ 07-ПБ', passedAt: '10.02.2024', validUntil: '10.02.2027',
    org: 'Навчальний центр «Профі-Безпека»', hasCertificate: false,
  },
];

/* ── Медичні огляди ── */
export type MedicalExam = {
  id: string;
  kind: string;               // попередній / періодичний
  passedAt: string;
  nextAt?: string;            // дата наступного медогляду
  clinic: string;
};

export const medicalExams: MedicalExam[] = [
  {
    id: 'm1', kind: 'Періодичний медичний огляд',
    passedAt: '12.05.2026', nextAt: '12.05.2027',
    clinic: 'МЦ «Здоровʼя Плюс»',
  },
  {
    id: 'm2', kind: 'Попередній медичний огляд (при прийнятті)',
    passedAt: '10.03.2021',
    clinic: 'МЦ «Здоровʼя Плюс»',
  },
];

/* ── Посвідчення керівника (право проведення інструктажів) ── */
export type InstructorCertificate = {
  number: string;
  issuedAt: string;
  validUntil: string;
  issuedBy: string;
  title: string;
};

export const instructorCertificate: InstructorCertificate = {
  number: 'ПЗ № 1247-ОП',
  issuedAt: '20.03.2024',
  validUntil: '20.03.2027',
  issuedBy: 'Навчальний центр «Профі-Безпека»',
  title: 'Посвідчення про перевірку знань з питань охорони праці',
};

/* ── Атестація робочого місця ── */
export type WorkplaceCard = {
  id: string;
  cardNo: string;             // № карти умов праці
  position: string;           // посада, для якої складено карту
  attestedAt: string;         // дата атестації
  acquaintedAt?: string;      // дата ознайомлення
  kepSignedAt?: string;       // факт підписання КЕП
  resignBy?: string;          // наступне перепідписання (5 років)
  reason?: string;            // причина появи нової карти
};

export const workplaceCards: WorkplaceCard[] = [
  {
    id: 'w2', cardNo: 'Карта умов праці № 214',
    position: 'Провідний фахівець з внутрішніх комунікацій',
    attestedAt: '02.06.2026',
    reason: 'Зміна посади — потрібне ознайомлення та підписання КЕП',
  },
  {
    id: 'w1', cardNo: 'Карта умов праці № 128',
    position: 'Фахівець з внутрішніх комунікацій',
    attestedAt: '14.04.2023', acquaintedAt: '20.04.2023',
    kepSignedAt: '20.04.2023', resignBy: '14.04.2028',
  },
];
