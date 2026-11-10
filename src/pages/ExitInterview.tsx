// @ts-nocheck
/* Exit-інтерв'ю — прощальне опитування. 6 кроків, 5 обов'язкових питань (зі зірочкою, як у поточній формі).
   Банер і степер — за референсом; фон, рамки, шрифт і кольоровий NPS — наші. Усі ПІБ вигадані. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Banknote, Building2, Check, CheckCircle2, ChevronDown, ClipboardList, FileCheck2, Heart, HeartHandshake, Info, Lock, LockKeyhole, MessageCircle, MessageSquareHeart, Send, ShieldCheck, Sparkles, TrendingUp, User, UserCog, X } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { Card, CardTitle, Chip, GhostButton, IconBubble, Pill, PrimaryButton, T } from './credit/ui';
import heroPng from '../assets/exit/hero-exit-dialogue.png';
import {
  COMPLIANCE_OPEN, COMPLIANCE_QUESTIONS, CONTACT_OPTIONS, DECIDE_OPTIONS, EMPLOYEE, EMPTY, INTRO, LIKED_OPTIONS, NPS_QUESTIONS,
  REASONS_INTRO, REASON_GROUPS, STORAGE_KEY, THINK_OPTIONS, type Answers,
} from './exitInterviewData';

const STEPS = [
  { key: 'decision', title: 'Ваше рішення', Icon: ClipboardList, caption: 'Коли виникла думка про зміни та які ваші наступні кроки' },
  { key: 'reasons', title: 'Причини', Icon: MessageSquareHeart, caption: 'Що саме вплинуло на рішення. Можна обрати кілька або лише одне' },
  { key: 'work', title: 'Робота', Icon: Heart, caption: 'Що подобалось у роботі — нам важливо знати, що варто зберегти' },
  { key: 'manager', title: 'Керівник', Icon: User, caption: 'Ваш погляд допоможе керівнику рости. Відповіді побачить лише HR' },
  { key: 'nps', title: 'Рекомендації', Icon: Sparkles, caption: 'Наскільки ви готові радити Київстар іншим' },
  { key: 'compliance', title: 'Комплаєнс', Icon: ShieldCheck, caption: 'Кілька питань за Кодексом поведінки VEON — конфіденційно' },
];
const GROUP_ICONS = { env: Building2, pay: Banknote, growth: TrendingUp, personal: HeartHandshake, manager: UserCog };
const REQUIRED_TOTAL = 5;
const REQ_NOTE = ['4 обов’язкові питання. Інші відповіді — за бажанням.', 'Усі відповіді — за бажанням.', 'Усі відповіді — за бажанням.', '1 обов’язкове питання. Інші — за бажанням.', 'Усі відповіді — за бажанням.', 'Усі відповіді — за бажанням.'];

/* ───── атоми форми ───── */
const Req = () => <span style={{ color: T.blue, marginLeft: 3, fontWeight: 800 }} aria-label="обов’язкове">*</span>;
const QLabel = ({ children, required, hint }) => (
  <div style={{ marginBottom: 10 }}>
    <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.ink, lineHeight: 1.35 }}>{children}{required && <Req />}</p>
    {hint && <p style={{ margin: '3px 0 0', fontSize: 12.5, color: T.muted }}>{hint}</p>}
  </div>
);
const ChipGroup = ({ options, value, onChange, locked }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {options.map(o => <Chip key={o} active={value === o} onClick={() => !locked && onChange(value === o ? '' : o)}>{value === o && <Check size={13} style={{ marginRight: 4 }} />}{o}</Chip>)}
  </div>
);
const CheckRow = ({ checked, onChange, label, locked }) => (
  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: locked ? 'default' : 'pointer', background: checked ? T.blue050 : '#fafcfe', border: `1px solid ${checked ? '#95d9f5' : T.line}`, transition: 'all .15s' }}>
    <input type="checkbox" checked={checked} disabled={locked} onChange={onChange} style={{ marginTop: 2, width: 17, height: 17, flexShrink: 0, accentColor: T.blue }} />
    <span style={{ fontSize: 13.5, lineHeight: 1.4, color: T.ink }}>{label}</span>
  </label>
);
const TextArea = ({ value, onChange, placeholder, rows = 3, locked }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} disabled={locked} placeholder={locked ? 'Відповідь не надано' : placeholder}
    style={{ width: '100%', resize: 'vertical', borderRadius: 12, background: '#fafcfe', padding: '12px 14px', fontSize: 14, outline: 'none', border: `1px solid ${T.line}`, color: T.ink, fontFamily: 'inherit', lineHeight: 1.5 }}
    onFocus={e => (e.currentTarget.style.borderColor = '#95d9f5')} onBlur={e => (e.currentTarget.style.borderColor = T.line)} />
);
const Select = ({ value, onChange, options, locked, error }) => (
  <div style={{ position: 'relative' }}>
    <select value={value} disabled={locked} onChange={e => onChange(e.target.value)} aria-invalid={Boolean(error)}
      style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', borderRadius: 12, background: '#fafcfe', padding: '12px 42px 12px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit', cursor: locked ? 'default' : 'pointer', border: `1px solid ${error ? '#c8872d' : value ? '#95d9f5' : T.line}`, color: value ? T.ink : T.muted, boxShadow: value ? '0 0 0 3px rgba(0,160,227,.08)' : 'none', transition: 'all .15s' }}>
      <option value="">{locked ? 'Відповідь не надано' : 'Оберіть відповідь'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={17} style={{ pointerEvents: 'none', position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', color: T.muted }} />
  </div>
);
const YesNo = ({ value, onChange, locked }) => (
  <div style={{ display: 'inline-flex', gap: 8 }}>
    {['Так', 'Ні'].map(v => <Chip key={v} active={value === v} onClick={() => !locked && onChange(value === v ? '' : v)}>{value === v && <Check size={13} style={{ marginRight: 4 }} />}{v}</Chip>)}
  </div>
);
const NpsScale = ({ value, onChange, locked }) => {
  const color = n => n <= 6 ? '#E5484D' : n <= 8 ? '#f5b81f' : '#00B87C';
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 6 }}>
        {Array.from({ length: 11 }).map((_, n) => {
          const active = value === n;
          return (
            <button key={n} type="button" disabled={locked} onClick={() => onChange(active ? null : n)} aria-pressed={active} aria-label={`${n}`} style={{ height: 40, borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: locked ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all .15s', border: `1.5px solid ${active ? color(n) : T.line}`, background: active ? color(n) : '#fafcfe', color: active ? '#fff' : T.ink, transform: active ? 'translateY(-2px)' : 'none', boxShadow: active ? `0 6px 14px ${color(n)}44` : 'none' }}>{n}</button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11.5, color: T.muted }}><span>0 — точно не порекомендую</span><span>10 — точно порекомендую</span></div>
    </div>
  );
};

/* ───── крок 2: плитки категорій (варіант 2+4) ───── */
const ReasonPicker = ({ reasons, onToggle, onRemove, locked }) => {
  const [active, setActive] = useState(REASON_GROUPS[0].key);
  const [open, setOpen] = useState(false);
  const group = REASON_GROUPS.find(g => g.key === active);
  const sel = key => reasons[key] ?? [];
  const total = REASON_GROUPS.reduce((n, g) => n + sel(g.key).length, 0);
  const withSel = REASON_GROUPS.filter(g => sel(g.key).length);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {REASON_GROUPS.map(g => {
          const Icon = GROUP_ICONS[g.key]; const isA = g.key === active; const c = sel(g.key).length;
          return (
            <button key={g.key} type="button" onClick={() => setActive(g.key)} aria-pressed={isA} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', background: isA ? T.blue050 : '#fafcfe', border: `1px solid ${isA ? '#95d9f5' : T.line}`, boxShadow: isA ? `inset 0 3px 0 ${g.color}` : 'none', transition: 'all .15s' }}>
              <span style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                <Icon size={24} strokeWidth={2} style={{ color: g.color }} />
                <span style={{ minWidth: 24, padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800, textAlign: 'center', background: c ? '#ddf4e8' : isA ? '#d4effb' : '#edf2f7', color: c ? '#0b8054' : isA ? T.blueText : T.muted }}>{c}</span>
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.3, fontWeight: 700, color: isA ? T.navy : '#52657e' }}>{g.title}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.navy, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: group.color }} />{group.title}</h3>
          <span style={{ fontSize: 12, color: T.muted }}>{sel(group.key).length} обрано · {group.items.length} варіантів</span>
        </div>
        <div key={group.key} className="ks-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 8 }}>
          {group.items.map(item => <CheckRow key={item} checked={sel(group.key).includes(item)} onChange={() => onToggle(group.key, item)} label={item} locked={locked} />)}
        </div>
      </div>

      <div style={{ marginTop: 20, borderRadius: 12, overflow: 'hidden', border: `1px solid ${total ? '#c9ebdc' : T.line}`, background: total ? '#f3fcf8' : '#fafcfe' }}>
        <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '14px 16px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: total ? '#dff5e9' : '#edf2f7', color: total ? '#0b8054' : T.muted }}><Check size={17} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: T.navy }}>{total ? `Ви обрали: ${total}` : 'Поки не обрано жодної причини'}</span>
            <span style={{ display: 'block', fontSize: 12, color: T.muted, marginTop: 2 }}>{total ? `У ${withSel.length} із ${REASON_GROUPS.length} категорій · ${locked ? 'переглянути' : 'переглянути або прибрати зайве'}` : 'Цей крок можна пропустити.'}</span>
          </span>
          <ChevronDown size={18} style={{ color: T.muted, flexShrink: 0, transition: 'transform .3s', transform: open ? 'rotate(180deg)' : undefined }} />
        </button>
        {open && (
          <div style={{ display: 'grid', gap: 14, padding: '14px 16px', borderTop: '1px solid #dcece4' }}>
            {!total && <p style={{ margin: 0, fontSize: 13, color: T.muted }}>Вибрані причини з усіх категорій з’являться тут.</p>}
            {withSel.map(g => (
              <div key={g.key}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 800, color: g.color }}>{g.title} · {sel(g.key).length}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
                  {sel(g.key).map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, borderRadius: 10, background: '#fff', padding: '9px 12px', border: '1px solid #e1eee7' }}>
                      <Check size={14} style={{ marginTop: 3, flexShrink: 0, color: '#0b8054' }} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.45, color: T.ink }}>{item}</span>
                      {!locked && <button type="button" aria-label={`Прибрати: ${item}`} onClick={() => onRemove(g.key, item)} style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, flexShrink: 0, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: T.muted }}><X size={14} /></button>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ───── степер (за референсом: смужки + номер + назва) ───── */
const Stepper = ({ step, onJump, complete, attention }) => (
  <nav aria-label="Кроки анкети" style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: 10 }}>
    {STEPS.map((s, i) => {
      const cur = i === step, done = complete[i], warn = attention && !done && !cur && [0, 3].includes(i);
      return (
        <button key={s.key} type="button" onClick={() => onJump(i)} aria-current={cur ? 'step' : undefined} style={{ minWidth: 0, padding: 8, borderRadius: 10, textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f4faff')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <span style={{ display: 'block', height: 4, borderRadius: 99, marginBottom: 8, background: cur ? T.blue : done ? T.mint : warn ? '#f5b81f' : T.line, transition: 'background .3s' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, flexShrink: 0, borderRadius: '50%', fontSize: 12, fontWeight: 800, background: cur ? T.blue : done ? T.mint050 : warn ? T.yellow050 : '#f1f5f9', color: cur ? '#fff' : done ? T.mintText : warn ? '#98601d' : T.muted }}>{done && !cur ? <Check size={14} /> : warn ? '!' : i + 1}</span>
            <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2, color: cur ? T.navy : T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
          </span>
        </button>
      );
    })}
  </nav>
);

/* ───── сторінка ───── */
export const ExitInterview = () => {
  const [a, setA] = useState<Answers>(() => { try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? { ...EMPTY, ...JSON.parse(s) } : EMPTY; } catch { return EMPTY; } });
  const [step, setStep] = useState(0);
  const [sentAt, setSentAt] = useState<Date | null>(null);
  const [review, setReview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [attention, setAttention] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const locked = Boolean(sentAt);
  const patch = (next: Partial<Answers>) => { if (locked) return; setA(c => ({ ...c, ...next })); setErrors([]); };
  useEffect(() => { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(a)); } catch { /* noop */ } }, [a]);

  const toggleIn = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
  const toggleReason = (g, v) => patch({ reasons: { ...a.reasons, [g]: toggleIn(a.reasons[g] ?? [], v) } });
  const removeReason = (g, v) => patch({ reasons: { ...a.reasons, [g]: (a.reasons[g] ?? []).filter(x => x !== v) } });

  // обов'язкові (5 зі зірочкою) по кроках
  const missingByStep = useMemo(() => ({
    0: [!a.think && 'think', !a.decide && 'decide', !a.offer && 'offer', !a.search && 'search'].filter(Boolean),
    1: [], 2: [],
    3: [!a.contact && 'contact'].filter(Boolean), 4: [], 5: [],
  }), [a]);
  const requiredDone = REQUIRED_TOTAL - Object.values(missingByStep).flat().length;
  const complete = STEPS.map((_, i) => missingByStep[i].length === 0 && (i !== 0 || (a.think && a.decide && a.offer && a.search)) && (i !== 3 || a.contact));
  const last = step === STEPS.length - 1;

  const focusTop = () => window.setTimeout(() => document.getElementById('step-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  const go = (target) => { if (target === step || target < 0 || target >= STEPS.length) return; setStep(target); setErrors([]); focusTop(); };
  const tryFinish = () => { const all = Object.entries(missingByStep).find(([, m]) => m.length); if (all) { const [s, m] = all; setAttention(true); setStep(Number(s)); setErrors(m); focusTop(); return; } dialog.current?.showModal(); };
  const submit = () => { dialog.current?.close(); setSentAt(new Date()); setReview(false); try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ } window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const S = STEPS[step];
  const err = id => errors.includes(id);
  const ErrLine = ({ id }) => err(id) ? <p role="alert" style={{ margin: '8px 0 0', fontSize: 12.5, fontWeight: 600, color: '#98601d' }}>Оберіть відповідь на обов’язкове питання.</p> : null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#fff' }}>
        <div className="ks-credit" style={{ fontSize: 13.5, color: '#374151', padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}><span style={{ fontWeight: 600 }}>Головна</span><span style={{ color: '#9ca3af', margin: '0 7px' }}>›</span>Exit-інтерв’ю</div>
        <div className="ks-credit" style={{ margin: '0 auto', width: '100%', maxWidth: 1040, padding: '20px 32px 64px' }}>

          {/* HERO — бульбашки діалогу + супутники */}
          <section className="ks-in" style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, background: 'linear-gradient(100deg,#ffffff 0%,#f6faff 40%,#eaf4fd 75%,#e2f0fb 100%)', border: '1px solid #e3eefb', boxShadow: '0 1px 3px rgba(15,60,120,.06)' }}>
            <span aria-hidden className="ks-hero-art" style={{ pointerEvents: 'none', position: 'absolute', top: '50%', right: '8%', width: 380, height: 380, transform: 'translateY(-50%)', borderRadius: '50%', background: 'radial-gradient(circle,rgba(127,214,245,.28) 0%,transparent 65%)' }} />
            <div className="ks-hero-grid" style={{ position: 'relative', padding: '24px 32px', gridTemplateColumns: '1.3fr .7fr' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12.5, letterSpacing: '.18em', textTransform: 'uppercase', color: T.blueText, fontWeight: 700 }}>Exit-інтерв’ю</p>
                <h1 style={{ margin: '6px 0 0', fontSize: 28, lineHeight: 1.15, fontWeight: 800, letterSpacing: '-.01em', color: T.navy }}>Дякуємо, що були з нами</h1>
                <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.5, color: '#4a5b71', maxWidth: 560 }}>Ваш досвід важливий для нас. {INTRO}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 14, fontSize: 13, color: T.muted }}>
                  <span>Стаж у компанії: <b style={{ color: T.ink }}>{EMPLOYEE.tenure}</b></span>
                  <span>Керівник: <b style={{ color: T.ink }}>{EMPLOYEE.manager}</b></span>
                  <Pill tone="blue" bold>≈ 7 хвилин</Pill>
                </div>
              </div>
              <div className="ks-hero-art" style={{ position: 'relative', height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={heroPng} alt="Дві бульбашки діалогу" className="ks-float" style={{ width: 170, height: 170, objectFit: 'contain', filter: 'drop-shadow(0 22px 34px rgba(0,63,125,.2))' }} />
                {[{ Icon: MessageCircle, color: T.blue, s: { top: 2, left: 24, size: 36, anim: 'ks-float-b ks-d1' } }, { Icon: HeartHandshake, color: T.navy, s: { top: 80, left: -6, size: 40, anim: 'ks-float-c ks-d2' } }, { Icon: ClipboardList, color: '#c69a00', s: { top: 100, right: 14, size: 34, anim: 'ks-float-b ks-d3' } }].map(({ Icon, color, s }, i) => (
                  <span key={i} className={s.anim} style={{ position: 'absolute', top: s.top, left: s.left, right: s.right, width: s.size, height: s.size, display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'rgba(255,255,255,.72)', border: '1px solid rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 24px rgba(0,63,125,.12)', color }}><Icon size={s.size * 0.5} strokeWidth={2.2} /></span>
                ))}
              </div>
            </div>
          </section>

          {/* УСПІХ — банер (не окремий екран) */}
          {locked && (
            <Card style={{ marginTop: 18, background: 'linear-gradient(110deg,#e7faf1 0%,#ffffff 75%)', border: '1px solid #ccf1e1' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 76, height: 76, flexShrink: 0, borderRadius: 22, background: 'linear-gradient(145deg,#fff,#c4f2df)', boxShadow: '0 12px 26px rgba(15,143,95,.12), inset 0 2px 0 #fff' }}><FileCheck2 size={38} style={{ color: T.mintText }} /></span>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: T.mintText }}><CheckCircle2 size={14} /> Надіслано</span>
                  <h2 style={{ margin: '6px 0 0', fontSize: 24, lineHeight: 1.15, fontWeight: 800, color: T.navy }}>Дякуємо, що приділили увагу!</h2>
                  <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5, color: '#4a5b71', maxWidth: 560 }}>Ваші відповіді передано HR. Вони конфіденційні й допоможуть зробити роботу в Компанії кращою. Після надсилання редагування недоступне, але відповіді можна переглянути.</p>
                  <p style={{ margin: '8px 0 0', fontSize: 12.5, color: T.muted }}>{sentAt.toLocaleString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <GhostButton onClick={() => { setReview(v => !v); if (!review) { setStep(0); focusTop(); } }}>{review ? 'Згорнути відповіді' : 'Переглянути відповіді'}</GhostButton>
              </div>
            </Card>
          )}

          {/* МАЙСТЕР */}
          {(!locked || review) && (
            <>
              {!locked && (
                <p style={{ margin: '18px 0 0', fontSize: 12.5, color: T.muted }}><span style={{ color: T.blue, fontWeight: 800 }}>*</span> Лише {REQUIRED_TOTAL} обов’язкових питань. Решта — за бажанням. До надсилання можна повертатися й змінювати відповіді.</p>
              )}
              {locked && (
                <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, padding: '10px 14px', background: T.mint050, border: '1px solid #ccf1e1', fontSize: 13, fontWeight: 700, color: '#0b6e49' }}><LockKeyhole size={16} /> Відповіді надіслано. Редагування недоступне — лише перегляд.</div>
              )}

              <div id="step-card" style={{ marginTop: 14, scrollMarginTop: 16 }}>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {/* шапка зі степером */}
                  <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.line}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.blue }}>Крок {step + 1} із {STEPS.length}</p>
                      <p style={{ margin: 0, fontSize: 12, color: T.muted }}>{locked ? 'Перегляд відповідей' : `Обов’язкові питання: ${requiredDone} із ${REQUIRED_TOTAL}`}</p>
                    </div>
                    <Stepper step={step} onJump={go} complete={complete} attention={attention} />
                  </div>

                  <div style={{ padding: '22px 24px' }}>
                    <CardTitle title={S.title} caption={`${REQ_NOTE[step]} ${S.caption}`} aside={<IconBubble Icon={S.Icon} tone={step === 5 ? 'yellow' : step === 2 ? 'mint' : 'blue'} />} />
                    {errors.length > 0 && <p role="alert" style={{ margin: '16px 0 0', display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: '10px 12px', fontSize: 13, background: T.yellow050, color: '#98601d' }}><Info size={16} style={{ flexShrink: 0, marginTop: 1 }} /> Щоб надіслати анкету, дайте відповідь на обов’язкові питання цього кроку. Без відповіді: {errors.length}.</p>}

                    <div key={step} className="ks-in" style={{ marginTop: 22 }}>
                      {/* 1 */}
                      {step === 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '26px 28px' }}>
                          <div><QLabel required>Як давно Ви почали думати про те, щоб покинути Компанію?</QLabel><Select options={THINK_OPTIONS} value={a.think} onChange={v => patch({ think: v })} locked={locked} error={err('think')} /><ErrLine id="think" /></div>
                          <div><QLabel required>Як давно Ви прийняли рішення покинути Компанію?</QLabel><Select options={DECIDE_OPTIONS} value={a.decide} onChange={v => patch({ decide: v })} locked={locked} error={err('decide')} /><ErrLine id="decide" /></div>
                          <div><QLabel required>Чи Ви наразі маєте пропозицію про роботу, яку прийняли/готові прийняти?</QLabel><YesNo value={a.offer} onChange={v => patch({ offer: v })} locked={locked} /><ErrLine id="offer" /></div>
                          <div><QLabel required>Ви здійснювали активний пошук роботи?</QLabel><YesNo value={a.search} onChange={v => patch({ search: v })} locked={locked} /><ErrLine id="search" /></div>
                        </div>
                      )}
                      {/* 2 */}
                      {step === 1 && (
                        <div>
                          <p style={{ margin: '0 0 16px', fontSize: 13.5, lineHeight: 1.5, fontWeight: 600, color: T.blueText }}>Зазначте головні причини, які вплинули на Ваше остаточне рішення. {REASONS_INTRO}</p>
                          <ReasonPicker reasons={a.reasons} onToggle={toggleReason} onRemove={removeReason} locked={locked} />
                        </div>
                      )}
                      {/* 3 */}
                      {step === 2 && (
                        <div>
                          <QLabel hint="Оберіть з нижче вказаних факторів — можна кілька">Що Вам подобалось у Вашій роботі?</QLabel>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 8 }}>{LIKED_OPTIONS.map(o => <CheckRow key={o} checked={a.liked.includes(o)} onChange={() => patch({ liked: toggleIn(a.liked, o) })} label={o} locked={locked} />)}</div>
                        </div>
                      )}
                      {/* 4 */}
                      {step === 3 && (
                        <div style={{ display: 'grid', gap: 22 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: `1px solid ${T.line}` }}>
                            <IconBubble Icon={User} tone="blue" size={38} /><div><p style={{ margin: 0, fontSize: 12, color: T.muted }}>Ваш керівник</p><p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>{EMPLOYEE.manager}</p></div>
                            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.muted }}><Lock size={13} /> бачить лише HR</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
                            <div><QLabel>Вкажіть сильні сторони Вашого керівника</QLabel><TextArea value={a.mgrStrengths} onChange={v => patch({ mgrStrengths: v })} placeholder="Що у нього/неї виходить особливо добре?" locked={locked} /></div>
                            <div><QLabel>Вкажіть зони для розвитку Вашого керівника</QLabel><TextArea value={a.mgrGrowth} onChange={v => patch({ mgrGrowth: v })} placeholder="Що могло б зробити роботу з ним/нею кращою?" locked={locked} /></div>
                          </div>
                          <div><QLabel required>Як часто Ви спілкувались з Вашим керівником, отримували зворотний зв’язок?</QLabel><ChipGroup options={CONTACT_OPTIONS} value={a.contact} onChange={v => patch({ contact: v })} locked={locked} /><ErrLine id="contact" /></div>
                        </div>
                      )}
                      {/* 5 */}
                      {step === 4 && (
                        <div style={{ display: 'grid', gap: 26 }}>
                          <p style={{ margin: 0, borderRadius: 12, padding: '10px 14px', background: '#f4f8fc', fontSize: 13, lineHeight: 1.5, color: T.muted }}>Оцініть за шкалою від 0 до 10, де 0 — «точно не порекомендую», 10 — «точно порекомендую».</p>
                          {NPS_QUESTIONS.map(q => <div key={q.key}><QLabel>{q.text}</QLabel><NpsScale value={a[q.key]} onChange={v => patch({ [q.key]: v })} locked={locked} /></div>)}
                          <div><QLabel>На Вашу думку, на що саме Компанії треба звернути увагу та покращити?</QLabel><TextArea rows={4} value={a.improve} onChange={v => patch({ improve: v })} placeholder="Будь-яка думка цінна — навіть коротка" locked={locked} /></div>
                        </div>
                      )}
                      {/* 6 */}
                      {step === 5 && (
                        <div style={{ display: 'grid', gap: 18 }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12, background: T.yellow050, border: '1px solid #fbe9a6' }}>
                            <ShieldCheck size={20} style={{ color: '#8a6a00', flexShrink: 0, marginTop: 1 }} />
                            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: '#5c4a00' }}>Ці питання ми ставимо кожному, хто завершує роботу, — так вимагає Кодекс поведінки VEON. Відповіді конфіденційні й розглядаються окремо від решти опитування. Усі питання цього кроку — за бажанням.</p>
                          </div>
                          {COMPLIANCE_QUESTIONS.map((q, i) => {
                            const v = a.compliance[q.key];
                            return (
                              <div key={q.key} style={{ padding: '14px 16px', borderRadius: 12, border: `1px solid ${v.answer === 'Так' ? '#fbe9a6' : T.line}`, background: v.answer === 'Так' ? '#fffdf2' : '#fff', transition: 'all .2s' }}>
                                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                  <p style={{ margin: 0, flex: 1, minWidth: 260, fontSize: 13.5, lineHeight: 1.5, color: T.ink }}><b style={{ color: T.muted, marginRight: 6 }}>{i + 1}.</b>{q.text}</p>
                                  <YesNo value={v.answer} onChange={ans => patch({ compliance: { ...a.compliance, [q.key]: { ...v, answer: ans } } })} locked={locked} />
                                </div>
                                <details style={{ marginTop: 10 }} open={Boolean(v.comment)}>
                                  <summary style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: T.muted, listStyle: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}><MessageCircle size={13} /> Коментар · за бажанням</summary>
                                  <div style={{ marginTop: 8 }}><TextArea rows={3} value={v.comment} onChange={c => patch({ compliance: { ...a.compliance, [q.key]: { ...v, comment: c } } })} placeholder="Опишіть, будь ласка, що саме вам відомо" locked={locked} /></div>
                                </details>
                              </div>
                            );
                          })}
                          <div><QLabel>{COMPLIANCE_OPEN}</QLabel><TextArea rows={3} value={a.complianceOpen} onChange={v => patch({ complianceOpen: v })} placeholder="Необов’язково" locked={locked} /></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* футер кроку */}
                  <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.line}`, background: '#fcfdff' }}>
                    {last && !locked && <p style={{ margin: '0 0 12px', fontSize: 13, lineHeight: 1.5, color: T.muted }}><b style={{ color: T.navy }}>Перед надсиланням перевірте відповіді.</b> Можна повернутися до будь-якого кроку. Після надсилання редагування буде недоступним.</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>{step > 0 && <GhostButton onClick={() => go(step - 1)}><ArrowLeft size={15} /> Назад</GhostButton>}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {!last && <PrimaryButton onClick={() => go(step + 1)}>Далі <ArrowRight size={15} /></PrimaryButton>}
                        {last && !locked && <PrimaryButton onClick={tryFinish}><Send size={15} /> Надіслати анкету</PrimaryButton>}
                        {last && locked && <GhostButton onClick={() => { setReview(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Завершити перегляд</GhostButton>}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          <div style={{ marginTop: 24, borderRadius: 12, padding: '14px 18px', fontSize: 13, lineHeight: 1.5, background: T.blue050, color: '#33506f' }}><b style={{ color: T.navy }}>Дякуємо за ваш внесок у Київстар.</b> Ваш досвід допомагає побачити, що працює добре та де потрібні зміни.</div>
        </div>
      </div>

      {/* підтвердження перед надсиланням */}
      <dialog ref={dialog} className="ks-credit" style={{ margin: 'auto', width: 'calc(100% - 40px)', maxWidth: 480, borderRadius: 16, border: 'none', background: '#fff', padding: 28, color: T.ink, boxShadow: '0 25px 80px rgba(0,63,125,.2)' }} aria-labelledby="confirm-title">
        <span style={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 14, background: T.blue050, marginBottom: 14 }}><LockKeyhole size={23} style={{ color: T.blue }} /></span>
        <h2 id="confirm-title" style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.navy }}>Надіслати анкету?</h2>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: T.muted }}>Після надсилання змінити відповіді буде неможливо. Переглянути — так.</p>
        <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <PrimaryButton onClick={submit}><Send size={15} /> Так, надіслати</PrimaryButton>
          <GhostButton onClick={() => dialog.current?.close()}>Повернутися до анкети</GhostButton>
        </div>
      </dialog>
    </div>
  );
};

export default ExitInterview;
