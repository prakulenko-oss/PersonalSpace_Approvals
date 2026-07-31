import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { TopBar } from '../components/TopBar';
import { S, Toast, ModalShell } from './managerUi';
import { Badge, Button, Checkbox, Switch } from '@fluentui/react-components';
import {
  ShieldCheck, Stethoscope, FileSignature, ExternalLink,
  FileText, Info, X, PenLine,
  HelpCircle, ChevronDown, UserCheck, Link2, Contact, GraduationCap, PlayCircle,
} from 'lucide-react';
import {
  briefings, medicalExams, workplaceCards, instructorCertificate, internshipInfo, admissionDate, attestationCardInDocNet,
  daysUntil, expiryStatus,
} from '../data/safety';
import type { ExpiryStatus, WorkplaceCard } from '../data/safety';

/* ════════════════════════ СТАТУСИ ════════════════════════ */

type SectionKey = 'briefings' | 'medical' | 'attestation' | 'internship';
type CardStatus = 'ok' | 'warning' | 'critical' | 'muted';

const statusVisual: Record<CardStatus, { accent: string; tint: string; badge: 'success' | 'warning' | 'danger' | 'informative'; label: string }> = {
  ok:       { accent: '#22c55e', tint: '#ffffff', badge: 'success', label: 'Все чинне' },
  warning:  { accent: '#f59e0b', tint: '#ffffff', badge: 'warning', label: 'Завершується' },
  critical: { accent: '#ef4444', tint: '#ffffff', badge: 'danger',  label: 'Критично' },
  muted:    { accent: '#cbd5e1', tint: '#ffffff', badge: 'informative', label: 'Не передбачено' },
};

const worst = (statuses: ExpiryStatus[]): CardStatus => {
  if (statuses.includes('expired') || statuses.includes('critical')) return 'critical';
  if (statuses.includes('soon')) return 'warning';
  return 'ok';
};

const daysWord = (d: number) => (d === 1 ? 'день' : d < 5 ? 'дні' : 'днів');

/* Пігулка з лічильником днів — пастельний фон + кольоровий текст (зразок бізнесу) */
const pillPalette = {
  ok:       { bg: '#ecfdf5', text: '#10b981' },
  soon:     { bg: '#fff7ed', text: '#f59e0b' },
  critical: { bg: '#fff1f2', text: '#e11d48' },
} as const;

const DaysPill = ({ days, tone }: { days: number; tone: keyof typeof pillPalette }) => (
  <span style={{
    display: 'inline-block', padding: '3px 9px', borderRadius: 8,
    backgroundColor: pillPalette[tone].bg, color: pillPalette[tone].text,
    fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
  }}>
    {days} {daysWord(days)}
  </span>
);

const ExpiryBadge = ({ validUntil }: { validUntil?: string }) => {
  const st = expiryStatus(validUntil);
  const days = validUntil ? daysUntil(validUntil) : null;
  if (st === 'none') return <Badge appearance="tint" color="informative">Безстроково</Badge>;
  if (st === 'ok') return <Badge appearance="tint" color="success">Чинний</Badge>;
  if (st === 'expired') return <Badge appearance="tint" color="danger">Прострочено</Badge>;
  const isCritical = st === 'critical';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Badge appearance="tint" color={isCritical ? 'danger' : 'warning'}>{isCritical ? 'Критично' : 'Завершується'}</Badge>
      {days != null && <DaysPill days={days} tone={isCritical ? 'critical' : 'soon'} />}
    </span>
  );
};

/* ════════════════════════ 3D ІКОНКИ (Fluent Emoji) ════════════════════════ */

const FLUENT = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets';

const emojiSrc: Record<SectionKey, string> = {
  briefings:   `${FLUENT}/Construction%20worker/Default/3D/construction_worker_3d_default.png`,
  medical:     `${FLUENT}/Health%20worker/Default/3D/health_worker_3d_default.png`,
  attestation: `${FLUENT}/Clipboard/3D/clipboard_3d.png`,
  internship:  `${FLUENT}/Handshake/3D/handshake_3d.png`,
};

const fallbackIcon: Record<SectionKey, ReactNode> = {
  briefings:   <ShieldCheck size={40} color="#2563eb" />,
  medical:     <Stethoscope size={40} color="#2563eb" />,
  attestation: <FileSignature size={40} color="#2563eb" />,
  internship:  <UserCheck size={40} color="#2563eb" />,
};

const Emoji3D = ({ section, size = 64 }: { section: SectionKey; size?: number }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <span style={{ display: 'inline-flex' }}>{fallbackIcon[section]}</span>;
  return (
    <img
      src={emojiSrc[section]}
      alt=""
      width={size}
      height={size}
      style={{ display: 'block', filter: 'drop-shadow(0 6px 10px rgba(15,60,120,0.18))' }}
      onError={() => setFailed(true)}
    />
  );
};

/* ════════════════════════ ЛОКАЛЬНІ СТИЛІ ════════════════════════ */

const st: Record<string, CSSProperties> = {
  container: { maxWidth: 1500, width: '100%', margin: '0 auto', padding: '26px 32px 48px' },
  h1: { fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 },
  sub: { fontSize: 14, color: '#6b7280', marginTop: 6 },
  cardsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(196px, 1fr))', gap: 14, marginTop: 24 },
  detailPanel: {
    marginTop: 22, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
    boxShadow: '0 2px 8px rgba(15,60,120,0.06)', overflow: 'hidden',
    animation: 'safetyFadeUp .28s ease',
  },
  detailHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 22px', borderBottom: '1px solid #f1f5f9',
  },
  detailTitle: { fontSize: 17, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 10 },
  detailBody: { padding: '18px 22px 22px' },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    padding: '14px 16px', border: '1px solid #eef2f7', borderRadius: 10, backgroundColor: '#fafcff',
  },
  callout: {
    display: 'flex', gap: 12, alignItems: 'flex-start', backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe', borderRadius: 12, padding: '13px 16px', marginTop: 16,
    fontSize: 13.5, color: '#1e3a8a', lineHeight: 1.5,
  },
};

const LocalAnim = () => (
  <style>{`
    @keyframes safetyFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .safety-card { transition: transform .16s ease, box-shadow .16s ease; }
    .safety-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15,60,120,0.13); }
  `}</style>
);

/* ════════════════════════ КАРТКА-СВІТЛОФОР ════════════════════════ */

const StatusCard = ({
  section, title, mainLine, dateLine, status, selected, onClick,
}: {
  section: SectionKey;
  title: string;
  mainLine: string;
  dateLine?: string;
  status: CardStatus;
  selected: boolean;
  onClick: () => void;
}) => {
  const v = statusVisual[status];
  return (
    <div
      className="safety-card"
      onClick={onClick}
      style={{
        position: 'relative', cursor: 'pointer', borderRadius: 16,
        backgroundColor: v.tint,
        border: selected ? '2px solid #0078d4' : '1px solid #e2e8f0',
        padding: selected ? '17px 17px 13px' : '18px 18px 14px',
        boxShadow: selected ? '0 8px 22px rgba(0,120,212,0.16)' : '0 1px 4px rgba(15,60,120,0.06)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box',
      }}
    >
      {/* Кольорова смуга статусу */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: v.accent, borderRadius: '16px 16px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <Emoji3D section={section} size={54} />
        <Badge appearance="tint" color={v.badge} style={{ whiteSpace: 'nowrap' }}>{v.label}</Badge>
      </div>

      <div style={{ marginTop: 12, fontSize: 15.5, fontWeight: 700, color: '#111827' }}>{title}</div>
      <div style={{ marginTop: 7, fontSize: 14, color: '#374151', lineHeight: 1.45 }}>{mainLine}</div>
      {dateLine && (
        <div style={{ marginTop: 4, fontSize: 17, fontWeight: 700, color: status === 'ok' ? '#15803d' : status === 'warning' ? '#b45309' : '#b91c1c' }}>
          {dateLine}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 'auto', paddingTop: 12, fontSize: 12.5, fontWeight: 600, color: selected ? '#0078d4' : '#6b7280' }}>
        Детальніше
        <ChevronDown size={14} style={{ transform: selected ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </div>
    </div>
  );
};

/* ════════════════════════ ДЕТАЛІ: ІНСТРУКТАЖІ ════════════════════════ */

/* Пара «мітка → значення» в розгорнутих деталях */
const DetailField = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
    <div style={{ fontSize: 13.5, color: '#111827', marginTop: 3, lineHeight: 1.5 }}>{value}</div>
  </div>
);

/* Список документів (інструкції / техкарти) з посиланнями */
const DocList = ({ docs, onOpen }: { docs: string[]; onOpen: () => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 3 }}>
    {docs.map(d => (
      <button key={d} onClick={onOpen} style={{ ...S.btnLink, padding: '2px 0', fontSize: 13.5, textAlign: 'left', alignItems: 'flex-start' }}>
        <FileText size={14} style={{ flexShrink: 0, marginTop: 3 }} />
        <span style={{ lineHeight: 1.45 }}>{d}</span>
      </button>
    ))}
  </div>
);

const BriefingsDetail = ({ showToast }: { showToast: (m: string) => void }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const openDoc = () => showToast('Документ відкриється з системи Документообігу (docNet)');

  return (
    <div style={st.detailBody}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {briefings.map(b => {
          /* Інструктаж, що ще не проводився (подієві: Позаплановий / Цільовий) */
          if (!b.passedAt) {
            return (
              <div key={b.id} style={{ ...st.row, backgroundColor: '#fafafa', border: '1px dashed #d1d5db' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: '#6b7280' }}>{b.kind} інструктаж</div>
                  {b.notConductedHint && (
                    <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>{b.notConductedHint}</div>
                  )}
                </div>
                <span style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>Не проводився</span>
              </div>
            );
          }

          const expanded = expandedId === b.id;
          return (
            <div
              key={b.id}
              style={{
                border: expanded ? '1px solid #bfd7f2' : '1px solid #eef2f7',
                borderRadius: 10,
                backgroundColor: expanded ? '#f5f9ff' : '#fafcff',
                overflow: 'hidden',
                transition: 'background-color .15s ease, border-color .15s ease',
              }}
            >
              {/* Рядок 2-го рівня — клікабельний */}
              <div
                onClick={() => setExpandedId(expanded ? null : b.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 16px', cursor: 'pointer' }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: '#111827' }}>
                    {b.kind} інструктаж
                    {b.note && <span style={{ fontWeight: 400, color: '#6b7280' }}> · {b.note}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
                    Пройдено {b.passedAt}
                    {b.validUntil ? ` · діє до ${b.validUntil}` : ''}
                    {b.periodicity ? ` · проводиться ${b.periodicity.toLowerCase()}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <ExpiryBadge validUntil={b.validUntil} />
                  <ChevronDown size={16} color="#6b7280" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                </div>
              </div>

              {/* Акордеон 3-го рівня */}
              {expanded && (
                <div style={{ padding: '4px 16px 16px', borderTop: '1px solid #e3edfb', animation: 'safetyFadeUp .22s ease' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px 24px', paddingTop: 13 }}>
                    {b.periodicity && <DetailField label="Періодичність проведення" value={b.periodicity} />}
                    {b.reason && <DetailField label="Причина проведення" value={b.reason} />}
                    {b.basis && <DetailField label="Підстава для проведення" value={b.basis} />}
                    {b.conductor && <DetailField label="Інструктаж провів" value={b.conductor} />}
                  </div>
                  {b.instructions && b.instructions.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <DetailField label="Інструкції" value={<DocList docs={b.instructions} onOpen={openDoc} />} />
                    </div>
                  )}
                  {b.techCards && b.techCards.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <DetailField label="Технологічні карти" value={<DocList docs={b.techCards} onOpen={openDoc} />} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Місток в архів — єдиний формат колаутів */}
      <div style={st.callout}>
        <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          Історія всіх пройдених інструктажів зберігається в системі Документообігу (docNet)
          — <button onClick={() => showToast('Відкривається система Документообігу (docNet)')} style={{ ...S.btnLink, padding: 0, fontSize: 13.5 }}>відкрити в docNet <ExternalLink size={13} /></button>
        </div>
      </div>
    </div>
  );
};

const NotApplicableBlock = ({ text, callout }: { text: string; callout: string }) => (
  <div style={st.detailBody}>
    <div style={{ ...st.row, backgroundColor: '#fafafa', border: '1px dashed #d1d5db' }}>
      <span style={{ fontSize: 13.5, color: '#6b7280' }}>{text}</span>
      <Badge appearance="tint" color="informative">Не передбачено</Badge>
    </div>
    <div style={st.callout}>
      <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <div>{callout}</div>
    </div>
  </div>
);

/* ════════════════════════ ДЕТАЛІ: МЕДИЧНІ ОГЛЯДИ ════════════════════════ */

const MedicalDetail = () => (
  <div style={st.detailBody}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {medicalExams.map(m => (
        <div key={m.id} style={st.row}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14.5, color: '#111827' }}>{m.kind}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
              Пройдено {m.passedAt}{m.nextAt ? ` · наступний ${m.nextAt}` : ''} · {m.clinic}
            </div>
          </div>
          {m.nextAt
            ? <ExpiryBadge validUntil={m.nextAt} />
            : <Badge appearance="tint" color="informative">Пройдено</Badge>}
        </div>
      ))}
    </div>

    <div style={st.callout}>
      <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <div>
        Обовʼязковий медичний огляд проводиться для визначення стану здоровʼя та професійної придатності
        працівників до виконання певних видів робіт.
        <div style={{ marginTop: 6 }}>
          Якщо Ваша посада (професія) відноситься до «Переліку категорій працівників ПрАТ «Київстар»,
          які підлягають обовʼязковому медичному огляду», Вам завчасно надійде інформація про дату
          проходження медичного огляду.
        </div>
      </div>
    </div>
  </div>
);

/* ════════════════════════ ДЕТАЛІ: АТЕСТАЦІЯ + КЕП ════════════════════════ */

const KepSignModal = ({ card, onClose, onSigned }: { card: WorkplaceCard; onClose: () => void; onSigned: () => void }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [signing, setSigning] = useState(false);

  const sign = () => {
    setSigning(true);
    window.setTimeout(() => { setSigning(false); onSigned(); }, 900);
  };

  return (
    <ModalShell maxWidth={560} onClose={onClose}>
      <div style={S.modalTitleRow}>
        <span style={S.modalTitle}>Ознайомлення з картою умов праці</span>
        <button onClick={onClose} aria-label="Закрити" style={{ padding: 4, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: '18px 26px 26px' }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 18px', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <FileSignature size={20} color="#2563eb" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>{card.cardNo}</span>
          </div>
          <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7 }}>
            <div><span style={{ color: '#6b7280' }}>Посада:</span> {card.position}</div>
            <div><span style={{ color: '#6b7280' }}>Дата атестації:</span> {card.attestedAt}</div>
            <div><span style={{ color: '#6b7280' }}>Підстава:</span> {card.reason ?? 'Планова атестація'}</div>
          </div>
          <button onClick={() => {}} style={{ ...S.btnLink, marginTop: 8, paddingLeft: 0 }}>
            <FileText size={14} /> Переглянути повну карту умов праці (PDF)
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <Checkbox
            checked={confirmed}
            onChange={(_, d) => setConfirmed(!!d.checked)}
            label="Я ознайомився / ознайомилася з картою умов праці на моєму робочому місці"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={S.btnGhost}>Скасувати</button>
          <Button appearance="primary" disabled={!confirmed || signing} onClick={sign} icon={<PenLine size={16} />}>
            {signing ? 'Підписання…' : 'Підписати КЕП'}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

const AttestationDetail = ({
  cards, onSignRequest, showToast,
}: {
  cards: WorkplaceCard[];
  onSignRequest: (c: WorkplaceCard) => void;
  showToast: (m: string) => void;
}) => (
  <div style={st.detailBody}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {cards.map(c => (
        <div key={c.id} style={{ ...st.row, backgroundColor: c.kepSignedAt ? '#fafcff' : '#fffbeb', borderColor: c.kepSignedAt ? '#eef2f7' : '#fcd34d' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5, color: '#111827' }}>{c.cardNo}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
              {c.position}
              {c.acquaintedAt && <> · ознайомлення <b style={{ color: '#111827' }}>{c.acquaintedAt}</b></>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {c.kepSignedAt
              ? <Badge appearance="tint" color="success">Ознайомлено</Badge>
              : (
                <>
                  <Badge appearance="tint" color="warning">Очікує ознайомлення</Badge>
                  <Button appearance="primary" size="small" icon={<PenLine size={14} />} onClick={() => onSignRequest(c)}>
                    Ознайомитись і підписати
                  </Button>
                </>
              )}
          </div>
        </div>
      ))}
    </div>

    <div style={st.callout}>
      <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      {attestationCardInDocNet ? (
        <div>
          Ваше робоче місце атестовано. Відомості щодо оцінки факторів виробничого середовища
          та трудового процесу, умов праці викладені у Карті умов праці, яка знаходиться
          в системі Документообігу
          — <button onClick={() => showToast('Відкривається система Документообігу (docNet)')} style={{ ...S.btnLink, padding: 0, fontSize: 13.5 }}>відкрити в docNet <ExternalLink size={13} /></button>
        </div>
      ) : (
        <div>
          Ваше робоче місце було атестоване у 2018 році. Умови праці на робочому місці допустимі.
          Через дію воєнного стану строки проведення чергової атестації продовжені відповідно
          до законодавства, тому результати попередньої атестації залишаються чинними.
          Підстав для занепокоєння немає.
        </div>
      )}
    </div>
  </div>
);

/* ════════════════════════ ДЕТАЛІ: СТАЖУВАННЯ / ДУБЛЮВАННЯ ════════════════════════ */

const InternshipDetail = ({ showToast }: { showToast: (m: string) => void }) => {
  const info = internshipInfo;
  const admission = admissionDate(info);
  const blockTitle: CSSProperties = {
    fontSize: 12.5, fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 0 8px',
  };
  return (
    <div style={st.detailBody}>
      {/* Блок 1: стажування (дублювання) на робочому місці */}
      <div style={blockTitle}>Стажування (дублювання) на робочому місці</div>
      {info.internship ? (
        <div style={{ ...st.row, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14.5, color: '#111827' }}>
              {info.internship.kind} · {info.internship.shifts} {info.internship.shifts === 1 ? 'зміна' : info.internship.shifts < 5 ? 'зміни' : 'змін'}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
              З {info.internship.from} до {info.internship.to}
              {info.internship.signedAt && ` · підписано ${info.internship.signedAt}`}
            </div>
            {info.internship.verifiedBy && (
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                Знання перевірив, допуск здійснив: {info.internship.verifiedBy}
              </div>
            )}
          </div>
          <Badge appearance="tint" color={info.internship.status === 'Пройдено' ? 'success' : 'warning'}>
            {info.internship.status}
          </Badge>
        </div>
      ) : (
        <div style={{ ...st.row, backgroundColor: '#fafafa', border: '1px dashed #d1d5db' }}>
          <span style={{ fontSize: 13.5, color: '#6b7280' }}>Стажування / дублювання не призначалось</span>
        </div>
      )}

      {/* Блок 2: звільнення від стажування / дублювання */}
      <div style={{ ...blockTitle, marginTop: 18 }}>Звільнення від стажування / дублювання</div>
      {info.exemption ? (
        <div style={{ ...st.row, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14.5, color: '#111827' }}>Звільнення від стажування / дублювання</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>{info.exemption.orderNo}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              Знання перевірив, допуск здійснив: {info.exemption.verifiedBy}
            </div>
          </div>
          <Badge appearance="tint" color="success">Звільнено</Badge>
        </div>
      ) : (
        <div style={{ ...st.row, backgroundColor: '#fafafa', border: '1px dashed #d1d5db' }}>
          <span style={{ fontSize: 13.5, color: '#6b7280' }}>Звільнення не оформлювалось</span>
        </div>
      )}

      {/* Допуск до самостійної роботи (дата перевірки знань з відповідного блоку) */}
      {admission && (
        <>
          <div style={{ ...blockTitle, marginTop: 18 }}>Допуск до самостійної роботи</div>
          <div style={{ ...st.row, borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: '#111827' }}>Допущено до самостійної роботи з {admission}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
                Дата перевірки знань, допуск до роботи: {admission}
              </div>
            </div>
            <Badge appearance="tint" color="success">Допущено</Badge>
          </div>
        </>
      )}

      <div style={st.callout}>
        <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          Дані про стажування, дублювання та допуск до самостійної роботи відображаються з системи Документообігу (docNet).
          Повні документи (накази, розпорядження) доступні там
          — <button onClick={() => showToast('Відкривається система Документообігу (docNet)')} style={{ ...S.btnLink, padding: 0, fontSize: 13.5 }}>відкрити в docNet <ExternalLink size={13} /></button>
        </div>
      </div>
    </div>
  );
};


/* Плейсхолдер 5-го розділу «Навчання» — поки без функціоналу (запит бізнесу) */
const TrainingPlaceholderCard = () => {
  const [failed, setFailed] = useState(false);
  return (
    <div
      aria-disabled
      style={{
        position: 'relative', borderRadius: 16, backgroundColor: '#fff',
        border: '1px dashed #cbd5e1',
        padding: '18px 18px 14px',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box',
        cursor: 'default',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: '#cbd5e1', borderRadius: '16px 16px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        {failed
          ? <GraduationCap size={40} color="#94a3b8" />
          : (
            <img
              src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Graduation%20cap/3D/graduation_cap_3d.png"
              alt="" width={54} height={54}
              style={{ display: 'block', filter: 'grayscale(0.35) opacity(0.85) drop-shadow(0 6px 10px rgba(15,60,120,0.12))' }}
              onError={() => setFailed(true)}
            />
          )}
        <Badge appearance="tint" color="informative">Незабаром</Badge>
      </div>
      <div style={{ marginTop: 12, fontSize: 15.5, fontWeight: 700, color: '#475569' }}>Навчання</div>
      <div style={{ marginTop: 7, fontSize: 14, color: '#94a3b8', lineHeight: 1.45 }}>
        Скоро тут зʼявляться ваші курси, терміни дії та навчальні досягнення
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 12, fontSize: 12.5, fontWeight: 600, color: '#cbd5e1' }}>
        Детальніше
      </div>
    </div>
  );
};

/* ════════════════════════ ПРАВА КОЛОНКА ════════════════════════ */

/* Картка «Загальний курс з ОП» — за патерном «Мої страхові відомості».
   ТЗ: відображається ЛИШЕ керівникам, які мають посвідчення; для інших блок прихований.
   У прототипі демо-персона — керівник, тому блок видимий. */
const CertificateCard = ({ showToast }: { showToast: (m: string) => void }) => {
  const cert = instructorCertificate;
  const status = expiryStatus(cert.validUntil);
  const row: CSSProperties = {
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9',
  };
  const label: CSSProperties = { fontSize: 13, color: '#6b7280' };
  const value: CSSProperties = { fontSize: 13.5, fontWeight: 600, color: '#111827', textAlign: 'right' };

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #93c5fd', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, paddingBottom: 10, borderBottom: '2px solid #0078d4', marginBottom: -1 }}>
          <GraduationCap size={18} color="#0078d4" />
          <span style={{ fontSize: 15.5, fontWeight: 700, color: '#111827' }}>Загальний курс з ОП</span>
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: '#6b7280', margin: '10px 0 2px', lineHeight: 1.5 }}>
        {cert.title}
      </div>

      <div style={row}>
        <span style={label}>Номер посвідчення</span>
        <span style={value}>{cert.number}</span>
      </div>
      <div style={row}>
        <span style={label}>Дата видачі</span>
        <span style={value}>{cert.issuedAt}</span>
      </div>
      <div style={row}>
        <span style={label}>Чинне до</span>
        <span style={{ ...value, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {cert.validUntil}
          <Badge appearance="tint" color={status === 'ok' ? 'success' : status === 'soon' ? 'warning' : 'danger'}>
            {status === 'ok' ? 'Чинне' : status === 'soon' ? 'Завершується' : 'Прострочено'}
          </Badge>
        </span>
      </div>
      <div style={{ ...row, borderBottom: 'none' }}>
        <span style={label}>Видано</span>
        <span style={value}>{cert.issuedBy}</span>
      </div>

      <button
        onClick={() => showToast('Посвідчення відкриється з системи Документообігу (docNet)')}
        style={{ ...S.btnLink, paddingLeft: 0, marginTop: 4 }}
      >
        Переглянути посвідчення <ExternalLink size={14} />
      </button>
    </div>
  );
};

/* Корисні посилання — за портальним принципом (як у Страхуванні) */
const QuickLinksCard = ({ showToast }: { showToast: (m: string) => void }) => {
  const links: { label: string; hint: string; icon?: ReactNode }[] = [
    { label: 'Вступний інструктаж', hint: 'відео', icon: <PlayCircle size={15} color="#2563eb" /> },
    { label: 'Інструкції з охорони праці', hint: 'SharePoint' },
    { label: 'Технологічні карти', hint: 'SharePoint' },
  ];
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px 8px' }}>
      {/* Заголовок — за патерном «Контакти» */}
      <div style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, paddingBottom: 10, borderBottom: '2px solid #0078d4', marginBottom: -1 }}>
          <Link2 size={18} color="#0078d4" />
          <span style={{ fontSize: 15.5, fontWeight: 700, color: '#111827' }}>Корисні посилання</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
        {links.map((l, i) => (
          <button
            key={l.label}
            onClick={() => showToast(`«${l.label}» відкриється у відповідному розділі (${l.hint})`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '12px 2px',
              backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: i === links.length - 1 ? 'none' : '1px solid #f1f5f9',
              fontFamily: 'inherit', fontSize: 13.5, color: '#111827', textAlign: 'left',
            }}
          >
            {l.icon}
            <span>{l.label}</span>
            <ExternalLink size={13} color="#374151" />
          </button>
        ))}
      </div>
    </div>
  );
};

/* Контакти — за портальним зразком (синя рамка, роль + email) */
const ContactsCard = () => {
  const contacts = [
    { role: 'Інженер з охорони праці', email: 'OP_SUPPORT@kyivstar.net' },
    { role: 'Відповідальна особа за електрогосподарство', email: 'ENERGO.SAFETY@kyivstar.net' },
  ];
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #93c5fd', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, paddingBottom: 10, borderBottom: '2px solid #0078d4', marginBottom: -1 }}>
          <Contact size={18} color="#0078d4" />
          <span style={{ fontSize: 15.5, fontWeight: 700, color: '#111827' }}>Контакти</span>
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {contacts.map(c => (
          <div key={c.email}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{c.role}</div>
            <a
              href={`mailto:${c.email}`}
              style={{ display: 'inline-block', marginTop: 6, fontSize: 13.5, color: '#2563eb', textDecoration: 'underline' }}
            >
              {c.email}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════ СТОРІНКА ════════════════════════ */

export const EmployeeSafety = () => {
  /* Демо-перемикач: «базовий профіль» — посада без медогляду, атестації та стажування */
  const [demoBasic, setDemoBasic] = useState(false);
  const [cards, setCards] = useState(workplaceCards);
  const [signingCard, setSigningCard] = useState<WorkplaceCard | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  /* ── Агрегація статусів для карток ── */

  const briefingsAgg = useMemo(() => {
    /* Світлофор рахуємо лише по «постійній трійці» — Позаплановий і Цільовий
       подієві та не мають терміну дії */
    const core = briefings.filter(b => ['Вступний', 'Первинний', 'Повторний'].includes(b.kind));
    const status = worst(core.map(b => expiryStatus(b.validUntil)));
    const critical = core
      .filter(b => b.validUntil)
      .sort((a, b) => (daysUntil(a.validUntil!) ?? 9e9) - (daysUntil(b.validUntil!) ?? 9e9))[0];
    return {
      status,
      mainLine: status === 'ok'
        ? 'Всі обовʼязкові інструктажі пройдені'
        : `${critical.kind} — діє до`,
      dateLine: status === 'ok' ? undefined : critical.validUntil,
    };
  }, []);

  const medicalAgg = useMemo(() => {
    if (demoBasic) {
      return { status: 'muted' as CardStatus, mainLine: 'Не передбачено вашою посадою', dateLine: undefined };
    }
    const next = medicalExams.find(m => m.nextAt);
    const status = worst([expiryStatus(next?.nextAt)]);
    return {
      status,
      mainLine: status === 'ok'
        ? 'Періодичний медогляд пройдено · наступний'
        : 'Час подбати про себе — наступний медогляд',
      dateLine: next?.nextAt,
    };
  }, [demoBasic]);

  const attestationAgg = useMemo(() => {
    if (demoBasic) {
      return { status: 'muted' as CardStatus, mainLine: 'Атестація для вашого робочого місця відсутня', dateLine: undefined };
    }
    /* Спрощений показ (домовленість з бізнесом 22.07.2026): без нагадувань
       «потрібно підписати» — основне поле: дата ознайомлення з чинною картою */
    const pending = cards.filter(c => !c.kepSignedAt).length;
    const current = cards.find(c => c.kepSignedAt);
    if (pending > 0) {
      return {
        status: 'warning' as CardStatus,
        mainLine: `${pending} ${pending === 1 ? 'документ очікує' : 'документи очікують'} підписання КЕП`,
        dateLine: undefined,
      };
    }
    return {
      status: 'ok' as CardStatus,
      mainLine: `${current?.cardNo ?? 'Карта умов праці'} · ознайомлення`,
      dateLine: current?.acquaintedAt,
    };
  }, [cards, demoBasic]);

  const internshipAgg = useMemo(() => {
    if (demoBasic) {
      return { status: 'muted' as CardStatus, mainLine: 'Стажування для вашої посади не передбачене', dateLine: undefined };
    }
    if (internshipInfo.internship?.status === 'Триває') {
      return {
        status: 'warning' as CardStatus,
        mainLine: `${internshipInfo.internship.kind} триває`,
        dateLine: `до ${internshipInfo.internship.to}`,
      };
    }
    const admission = admissionDate(internshipInfo);
    if (admission) {
      return {
        status: 'ok' as CardStatus,
        mainLine: 'Допуск до самостійної роботи',
        dateLine: `з ${admission}`,
      };
    }
    return { status: 'ok' as CardStatus, mainLine: 'Дані відсутні', dateLine: undefined };
  }, [demoBasic]);

  /* Відкрита панель: за замовчуванням — перша секція, що потребує уваги */
  const [openSection, setOpenSection] = useState<SectionKey | null>(() => {
    const agg: [SectionKey, CardStatus][] = [
      ['briefings', briefingsAgg.status],
      ['medical', medicalAgg.status],
      ['attestation', attestationAgg.status],
      ['internship', internshipAgg.status],
    ];
    return agg.find(([, s]) => s === 'critical')?.[0]
        ?? agg.find(([, s]) => s === 'warning')?.[0]
        ?? null;
  });

  const toggleSection = (s: SectionKey) => setOpenSection(prev => (prev === s ? null : s));

  const markSigned = (id: string) => {
    setCards(prev => prev.map(c =>
      c.id === id
        ? { ...c, acquaintedAt: '04.07.2026', kepSignedAt: '04.07.2026', resignBy: '02.06.2031', reason: undefined }
        : c
    ));
    setSigningCard(null);
    showToast('Карту умов праці підписано КЕП ✅');
  };

  /* Персональний рядок-підсумок: імʼя + агрегований стан + найближча критична річ */
  const personalSummary = useMemo(() => {
    const name = 'Павле'; // у продуктовій версії — імʼя користувача у кличному відмінку з Ульсімус
    const agg: { label: string; status: CardStatus; dateLine?: string }[] = [
      { label: 'інструктажі', status: briefingsAgg.status, dateLine: briefingsAgg.dateLine },
      { label: 'медогляд', status: medicalAgg.status, dateLine: medicalAgg.dateLine },
      { label: 'атестація', status: attestationAgg.status },
      { label: 'стажування', status: internshipAgg.status },
    ];
    const applicable = agg.filter(a => a.status !== 'muted');
    const critical = applicable.filter(a => a.status === 'critical');
    const warning = applicable.filter(a => a.status === 'warning');
    if (critical.length > 0) {
      return `${name}, наближається ${critical[0].label === 'медогляд' ? 'медогляд' : `термін: ${critical[0].label}`} ${critical[0].dateLine ?? ''} — ваш керівник уже отримав нагадування та організує все необхідне.`;
    }
    if (warning.length > 0) {
      return `${name}, загалом усе гаразд — ${warning.length === 1 ? 'одна дата наближається' : `${warning.length} дати наближаються`}, процес нагадувань уже працює.`;
    }
    return `${name}, у вас усе чинне — можна спокійно працювати.`;
  }, [briefingsAgg, medicalAgg, attestationAgg, internshipAgg]);

  const detailTitles: Record<SectionKey, string> = {
    briefings: 'Проходження інструктажів',
    medical: 'Медичні огляди',
    attestation: 'Атестація робочого місця',
    internship: 'Стажування / дублювання, допуск до роботи',
  };

  return (
    <div style={S.page}>
      <LocalAnim />
      <TopBar />

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 20px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <div style={{ fontSize: '13.5px', color: '#374151' }}>
          <span style={{ fontWeight: 600 }}>Головна</span>
          <span style={{ color: '#9ca3af', margin: '0 7px' }}>›</span>
          <span>Охорона Праці</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', backgroundColor: '#fff' }}>
        <div style={st.container}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={st.h1}>Охорона Праці</h1>
              <div style={st.sub}>{personalSummary}</div>
            </div>
            {/* Демо-перемикач профілю (лише для прототипу) */}
            <Switch
              checked={demoBasic}
              onChange={(_, d) => setDemoBasic(!!d.checked)}
              label="Базовий профіль (демо)"
            />
          </div>

          {/* ── Дві колонки: основний контент + права колонка ── */}
          <div style={{ display: 'flex', gap: 24, marginTop: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Основна колонка */}
            <div style={{ flex: '1 1 620px', minWidth: 0 }}>
              {/* ── Три картки-світлофори ── */}
              <div style={{ ...st.cardsRow, marginTop: 0 }}>
                <StatusCard
                  section="briefings"
                  title="Інструктажі"
                  mainLine={briefingsAgg.mainLine}
                  dateLine={briefingsAgg.dateLine}
                  status={briefingsAgg.status}
                  selected={openSection === 'briefings'}
                  onClick={() => toggleSection('briefings')}
                />
                <StatusCard
                  section="medical"
                  title="Медичні огляди"
                  mainLine={medicalAgg.mainLine}
                  dateLine={medicalAgg.dateLine}
                  status={medicalAgg.status}
                  selected={openSection === 'medical'}
                  onClick={() => toggleSection('medical')}
                />
                <StatusCard
                  section="attestation"
                  title="Атестація робочого місця"
                  mainLine={attestationAgg.mainLine}
                  dateLine={attestationAgg.dateLine}
                  status={attestationAgg.status}
                  selected={openSection === 'attestation'}
                  onClick={() => toggleSection('attestation')}
                />
                <StatusCard
                  section="internship"
                  title="Стажування та допуск"
                  mainLine={internshipAgg.mainLine}
                  dateLine={internshipAgg.dateLine}
                  status={internshipAgg.status}
                  selected={openSection === 'internship'}
                  onClick={() => toggleSection('internship')}
                />
                <TrainingPlaceholderCard />
              </div>

              {/* ── Детальна панель ── */}
              {openSection && (
                <div style={st.detailPanel} key={openSection}>
                  <div style={st.detailHeader}>
                    <div style={st.detailTitle}>
                      <Emoji3D section={openSection} size={26} />
                      {detailTitles[openSection]}
                    </div>
                    <button
                      onClick={() => setOpenSection(null)}
                      aria-label="Згорнути"
                      style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {openSection === 'briefings' && <BriefingsDetail showToast={showToast} />}
                  {openSection === 'medical' && (demoBasic
                    ? <NotApplicableBlock
                        text="Медичний огляд для вашої посади не передбачений"
                        callout="Ваша посада (професія) не відноситься до «Переліку категорій працівників ПрАТ «Київстар», які підлягають обовʼязковому медичному огляду», тому проходження медогляду для вас не передбачене. Це нормально — жодних дій від вас не потрібно."
                      />
                    : <MedicalDetail />)}
                  {openSection === 'attestation' && (demoBasic
                    ? <NotApplicableBlock
                        text="Атестація для вашого робочого місця відсутня"
                        callout="Атестація робочих місць проводиться не для всіх посад. Її відсутність у вашому профілі — це нормально, робити нічого не потрібно."
                      />
                    : <AttestationDetail cards={cards} onSignRequest={setSigningCard} showToast={showToast} />)}
                  {openSection === 'internship' && (demoBasic
                    ? <NotApplicableBlock
                        text="Стажування / дублювання для вашої посади не передбачене"
                        callout="Для Вашої посади стажування/дублювання не передбачено. Їх відсутність — це нормально, жодних дій від вас не потрібно."
                      />
                    : <InternshipDetail showToast={showToast} />)}
                </div>
              )}
            </div>

            {/* Права колонка — роль керівника */}
            <aside style={{ flex: '0 1 320px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CertificateCard showToast={showToast} />
              <QuickLinksCard showToast={showToast} />
              <ContactsCard />
            </aside>
          </div>
        </div>
      </div>

      {/* Плаваюча довідка */}
      <div
        onClick={() => showToast('Довідка з Охорони Праці відкриється тут')}
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 58, height: 46,
          backgroundColor: '#7AC143', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(122,193,67,0.45)', zIndex: 40,
        }}
      >
        <HelpCircle size={22} />
      </div>

      {signingCard && (
        <KepSignModal
          card={signingCard}
          onClose={() => setSigningCard(null)}
          onSigned={() => markSigned(signingCard.id)}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
};

export default EmployeeSafety;
