import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { TopBar } from '../components/TopBar';
import { S, Toast, ModalShell } from './managerUi';
import { Badge, Button, Checkbox } from '@fluentui/react-components';
import {
  ShieldCheck, Stethoscope, FileSignature, ExternalLink,
  FileText, Info, X, PenLine,
  HelpCircle, ChevronDown,
} from 'lucide-react';
import {
  briefings, medicalExams, workplaceCards,
  daysUntil, expiryStatus,
} from '../data/safety';
import type { ExpiryStatus, WorkplaceCard } from '../data/safety';

/* ════════════════════════ СТАТУСИ ════════════════════════ */

type SectionKey = 'briefings' | 'medical' | 'attestation';
type CardStatus = 'ok' | 'warning' | 'expired';

const statusVisual: Record<CardStatus, { accent: string; tint: string; badge: 'success' | 'warning' | 'danger'; label: string }> = {
  ok:      { accent: '#22c55e', tint: '#ffffff', badge: 'success', label: 'Все актуально' },
  warning: { accent: '#f59e0b', tint: '#fffbeb', badge: 'warning', label: 'Потребує уваги' },
  expired: { accent: '#ef4444', tint: '#fef2f2', badge: 'danger',  label: 'Прострочено' },
};

const worst = (statuses: ExpiryStatus[]): CardStatus => {
  if (statuses.includes('expired')) return 'expired';
  if (statuses.includes('soon')) return 'warning';
  return 'ok';
};

const daysWord = (d: number) => (d === 1 ? 'день' : d < 5 ? 'дні' : 'днів');

const ExpiryBadge = ({ validUntil }: { validUntil?: string }) => {
  const st = expiryStatus(validUntil);
  const days = validUntil ? daysUntil(validUntil) : null;
  if (st === 'none') return <Badge appearance="tint" color="informative">Безстроково</Badge>;
  if (st === 'ok') return <Badge appearance="tint" color="success">Актуально</Badge>;
  if (st === 'soon') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Badge appearance="tint" color="warning">Завершується</Badge>
      {days != null && <span style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>через {days} {daysWord(days)}</span>}
    </span>
  );
  return <Badge appearance="tint" color="danger">Прострочено</Badge>;
};

/* ════════════════════════ 3D ІКОНКИ (Fluent Emoji) ════════════════════════ */

const FLUENT = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets';

const emojiSrc: Record<SectionKey, string> = {
  briefings:   `${FLUENT}/Shield/3D/shield_3d.png`,
  medical:     `${FLUENT}/Stethoscope/3D/stethoscope_3d.png`,
  attestation: `${FLUENT}/Memo/3D/memo_3d.png`,
};

const fallbackIcon: Record<SectionKey, ReactNode> = {
  briefings:   <ShieldCheck size={40} color="#2563eb" />,
  medical:     <Stethoscope size={40} color="#2563eb" />,
  attestation: <FileSignature size={40} color="#2563eb" />,
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
  container: { maxWidth: 1180, width: '100%', margin: '0 auto', padding: '26px 24px 48px' },
  h1: { fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 },
  sub: { fontSize: 14, color: '#6b7280', marginTop: 6 },
  cardsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginTop: 24 },
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
        padding: selected ? '21px 21px 17px' : '22px 22px 18px',
        boxShadow: selected ? '0 8px 22px rgba(0,120,212,0.16)' : '0 1px 4px rgba(15,60,120,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Кольорова смуга статусу */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: v.accent, borderRadius: '16px 16px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <Emoji3D section={section} />
        <Badge appearance="tint" color={v.badge}>{v.label}</Badge>
      </div>

      <div style={{ marginTop: 14, fontSize: 16.5, fontWeight: 700, color: '#111827' }}>{title}</div>
      <div style={{ marginTop: 7, fontSize: 14, color: '#374151', lineHeight: 1.45 }}>{mainLine}</div>
      {dateLine && (
        <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: status === 'ok' ? '#15803d' : status === 'warning' ? '#b45309' : '#b91c1c' }}>
          {dateLine}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, fontSize: 12.5, fontWeight: 600, color: selected ? '#0078d4' : '#6b7280' }}>
        Детальніше
        <ChevronDown size={14} style={{ transform: selected ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </div>
    </div>
  );
};

/* ════════════════════════ ДЕТАЛІ: ІНСТРУКТАЖІ ════════════════════════ */

const BriefingsDetail = ({ showToast }: { showToast: (m: string) => void }) => (
  <div style={st.detailBody}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {briefings.map(b => (
        <div key={b.id} style={st.row}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5, color: '#111827' }}>
              {b.kind} інструктаж
              {b.note && <span style={{ fontWeight: 400, color: '#6b7280' }}> · {b.note}</span>}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
              Пройдено {b.passedAt}{b.validUntil ? ` · діє до ${b.validUntil}` : ''} · {b.conductor}
            </div>
          </div>
          <ExpiryBadge validUntil={b.validUntil} />
        </div>
      ))}
    </div>

    {/* Місток в архів */}
    <div style={{ ...st.row, marginTop: 14, backgroundColor: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileText size={18} color="#475569" />
        <span style={{ fontSize: 13.5, color: '#374151' }}>
          Історія всіх пройдених інструктажів зберігається в системі Документообігу
        </span>
      </div>
      <button onClick={() => showToast('Відкривається система Документообігу (docNet)')} style={{ ...S.btnLink, whiteSpace: 'nowrap' }}>
        Відкрити в docNet <ExternalLink size={14} />
      </button>
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
      <div>Періодичний медогляд є обовʼязковим. Про наближення дати наступного медогляду ви отримаєте нагадування.</div>
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
  cards, onSignRequest,
}: {
  cards: WorkplaceCard[];
  onSignRequest: (c: WorkplaceCard) => void;
}) => (
  <div style={st.detailBody}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {cards.map(c => (
        <div key={c.id} style={{ ...st.row, backgroundColor: c.kepSignedAt ? '#fafcff' : '#fffbeb', borderColor: c.kepSignedAt ? '#eef2f7' : '#fcd34d' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5, color: '#111827' }}>{c.cardNo}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
              {c.position} · атестація {c.attestedAt}
              {c.acquaintedAt && ` · ознайомлення ${c.acquaintedAt}`}
              {c.resignBy && ` · перепідписання до ${c.resignBy}`}
            </div>
            {c.reason && <div style={{ fontSize: 12.5, color: '#b45309', marginTop: 3 }}>{c.reason}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {c.kepSignedAt
              ? <Badge appearance="tint" color="success">КЕП · {c.kepSignedAt}</Badge>
              : (
                <>
                  <Badge appearance="tint" color="warning">Очікує підписання</Badge>
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
      <div>
        Карта умов праці перепідписується <b>раз на 5 років</b>, а також <b>при зміні посади</b> або <b>зміні умов праці</b>.
        Підписання здійснюється КЕП безпосередньо в Кабінеті.
      </div>
    </div>
  </div>
);

/* ════════════════════════ СТОРІНКА ════════════════════════ */

export const EmployeeSafety = () => {
  const [cards, setCards] = useState(workplaceCards);
  const [signingCard, setSigningCard] = useState<WorkplaceCard | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  /* ── Агрегація статусів для карток ── */

  const briefingsAgg = useMemo(() => {
    const status = worst(briefings.map(b => expiryStatus(b.validUntil)));
    const critical = briefings
      .filter(b => b.validUntil)
      .sort((a, b) => (daysUntil(a.validUntil!) ?? 9e9) - (daysUntil(b.validUntil!) ?? 9e9))[0];
    return {
      status,
      mainLine: status === 'ok'
        ? 'Вступний, Первинний та Повторний пройдені'
        : `${critical.kind} — діє до`,
      dateLine: status === 'ok' ? undefined : critical.validUntil,
    };
  }, []);

  const medicalAgg = useMemo(() => {
    const next = medicalExams.find(m => m.nextAt);
    const status = worst([expiryStatus(next?.nextAt)]);
    return {
      status,
      mainLine: status === 'ok' ? 'Періодичний медогляд пройдено · наступний' : 'Наступний медогляд',
      dateLine: next?.nextAt,
    };
  }, []);

  const attestationAgg = useMemo(() => {
    const pending = cards.filter(c => !c.kepSignedAt).length;
    const signed = cards.find(c => c.kepSignedAt);
    if (pending > 0) {
      return {
        status: 'warning' as CardStatus,
        mainLine: `${pending} ${pending === 1 ? 'документ очікує' : 'документи очікують'} підписання КЕП`,
        dateLine: undefined,
      };
    }
    return {
      status: 'ok' as CardStatus,
      mainLine: 'Все підписано · наступне перепідписання',
      dateLine: signed?.resignBy,
    };
  }, [cards]);

  /* Відкрита панель: за замовчуванням — перша секція, що потребує уваги */
  const [openSection, setOpenSection] = useState<SectionKey | null>(() => {
    const agg: [SectionKey, CardStatus][] = [
      ['briefings', briefingsAgg.status],
      ['medical', medicalAgg.status],
      ['attestation', attestationAgg.status],
    ];
    return agg.find(([, s]) => s === 'expired')?.[0]
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

  const detailTitles: Record<SectionKey, string> = {
    briefings: 'Проходження інструктажів',
    medical: 'Медичні огляди',
    attestation: 'Атестація робочого місця',
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
          <h1 style={st.h1}>Охорона Праці</h1>
          <div style={st.sub}>
            Ваші інструктажі, медичні огляди та атестація робочого місця — вся картина одним поглядом.
          </div>

          {/* ── Три картки-світлофори ── */}
          <div style={st.cardsRow}>
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
              {openSection === 'medical' && <MedicalDetail />}
              {openSection === 'attestation' && (
                <AttestationDetail cards={cards} onSignRequest={setSigningCard} />
              )}
            </div>
          )}
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
