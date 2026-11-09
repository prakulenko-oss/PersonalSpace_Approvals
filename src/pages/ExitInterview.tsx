// @ts-nocheck
/* Exit-інтерв'ю — прощальне опитування перед звільненням.
   Кроки з прогресом, автозбереження чернетки, обов'язкові лише 5 питань зі зірочкою (як у поточній формі).
   Стиль — як сторінка «Кредит від компанії». Усі дані/ПІБ вигадані. */
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardList, Heart, Lock, MessageSquareHeart, Send, ShieldCheck, Sparkles, User, Wand2 } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { Card, CardTitle, Chip, GhostButton, IconBubble, Pill, PrimaryButton, T } from './credit/ui';
import {
  COMPLIANCE_OPEN, COMPLIANCE_QUESTIONS, CONTACT_OPTIONS, DECIDE_OPTIONS, EMPLOYEE, EMPTY, INTRO, LIKED_OPTIONS, NPS_QUESTIONS,
  REASONS_INTRO, REASON_GROUPS, SAMPLE, STORAGE_KEY, THINK_OPTIONS, type Answers,
} from './exitInterviewData';

const STEPS = [
  { key: 'decision', title: 'Про рішення', Icon: ClipboardList, caption: 'Два коротких питання — коли ви почали замислюватись і коли вирішили' },
  { key: 'reasons', title: 'Причини', Icon: MessageSquareHeart, caption: 'Що саме вплинуло на рішення. Можна обрати кілька або лише одне' },
  { key: 'work', title: 'Робота', Icon: Heart, caption: 'Що подобалось — нам важливо знати, що варто зберегти' },
  { key: 'manager', title: 'Керівник', Icon: User, caption: 'Ваш погляд допоможе керівнику рости. Відповіді побачить лише HR' },
  { key: 'nps', title: 'Рекомендації', Icon: Sparkles, caption: 'Наскільки ви готові радити Київстар іншим' },
  { key: 'compliance', title: 'Комплаєнс', Icon: ShieldCheck, caption: 'Кілька обов\u2019язкових питань за Кодексом поведінки VEON — конфіденційно' },
];

/* ───── атоми форми ───── */
const Req = () => <span style={{ color: '#E5484D', marginLeft: 3 }} aria-label="обов’язкове">*</span>;

const QLabel = ({ children, required, hint }) => (
  <div style={{ marginBottom: 10 }}>
    <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: T.ink, lineHeight: 1.35 }}>{children}{required && <Req />}</p>
    {hint && <p style={{ margin: '3px 0 0', fontSize: 12.5, color: T.muted }}>{hint}</p>}
  </div>
);

const ChipGroup = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {options.map(o => <Chip key={o} active={value === o} onClick={() => onChange(value === o ? '' : o)}>{o}</Chip>)}
  </div>
);

const CheckRow = ({ checked, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', background: checked ? T.blue050 : 'transparent', border: `1px solid ${checked ? '#b6e4f8' : 'transparent'}`, transition: 'all .15s' }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ marginTop: 2, width: 17, height: 17, flexShrink: 0, accentColor: T.blue }} />
    <span style={{ fontSize: 13.5, lineHeight: 1.4, color: T.ink }}>{label}</span>
  </label>
);

const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
    style={{ width: '100%', resize: 'vertical', borderRadius: 12, background: '#fff', padding: '12px 14px', fontSize: 14, outline: 'none', border: `1px solid ${T.line}`, color: T.ink, fontFamily: 'inherit', lineHeight: 1.5 }}
    onFocus={e => (e.currentTarget.style.borderColor = T.blue)} onBlur={e => (e.currentTarget.style.borderColor = T.line)} />
);

const YesNo = ({ value, onChange }) => (
  <div style={{ display: 'inline-flex', background: '#f1f4f8', borderRadius: 10, padding: 3, gap: 3 }}>
    {['Так', 'Ні'].map(v => (
      <button key={v} type="button" onClick={() => onChange(v)} aria-pressed={value === v} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', ...(value === v ? { background: '#fff', color: T.navy, boxShadow: '0 1px 3px rgba(0,0,0,.08)' } : { background: 'transparent', color: T.muted }) }}>{v}</button>
    ))}
  </div>
);

const NpsScale = ({ value, onChange }) => {
  const color = n => n <= 6 ? '#E5484D' : n <= 8 ? '#f5b81f' : '#00B87C';
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 6 }}>
        {Array.from({ length: 11 }).map((_, n) => {
          const active = value === n;
          return (
            <button key={n} type="button" onClick={() => onChange(active ? null : n)} aria-pressed={active} aria-label={`${n}`} style={{
              height: 40, borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              border: `1.5px solid ${active ? color(n) : T.line}`, background: active ? color(n) : '#fff', color: active ? '#fff' : T.ink,
              transform: active ? 'translateY(-2px)' : 'none', boxShadow: active ? `0 6px 14px ${color(n)}44` : 'none',
            }}>{n}</button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11.5, color: T.muted }}><span>0 — точно не порекомендую</span><span>10 — точно порекомендую</span></div>
    </div>
  );
};

/* ───── смуга прогресу ───── */
const Stepper = ({ step, onJump, done }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: 0, marginTop: 20 }}>
    {STEPS.map((s, i) => {
      const past = i < step, cur = i === step;
      const col = past ? '#00B87C' : cur ? T.blue : '#CBD5E1';
      return (
        <button key={s.key} type="button" onClick={() => (i <= step || done) && onJump(i)} disabled={i > step && !done} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: i <= step || done ? 'pointer' : 'default', fontFamily: 'inherit', padding: '4px 0' }}>
          {i < STEPS.length - 1 && <span aria-hidden style={{ position: 'absolute', top: 17, left: '50%', width: '100%', height: 2, background: past ? '#86D9A8' : T.line, zIndex: 0 }} />}
          <span className={cur ? 'ks-pulse-ring' : ''} style={{ position: 'relative', zIndex: 1, width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', background: past ? '#00B87C' : cur ? T.blue : '#fff', border: `2px solid ${col}`, color: past || cur ? '#fff' : '#94A3B8', transition: 'all .3s' }}>
            {past ? <Check size={15} strokeWidth={3} /> : <s.Icon size={14} />}
          </span>
          <span style={{ fontSize: 12, fontWeight: cur ? 800 : 600, color: cur ? T.blue : past ? T.ink : '#94A3B8', whiteSpace: 'nowrap' }}>{s.title}</span>
        </button>
      );
    })}
  </div>
);

/* ───── сторінка ───── */
export const ExitInterview = () => {
  const [a, setA] = useState<Answers>(() => { try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? { ...EMPTY, ...JSON.parse(s) } : EMPTY; } catch { return EMPTY; } });
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [saved, setSaved] = useState(false);
  const patch = (next: Partial<Answers>) => setA(c => ({ ...c, ...next }));

  // автозбереження чернетки
  useEffect(() => { try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(a)); setSaved(true); const t = setTimeout(() => setSaved(false), 1400); return () => clearTimeout(t); } catch { /* noop */ } }, [a]);

  const toggleIn = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
  const toggleReason = (g: string, v: string) => patch({ reasons: { ...a.reasons, [g]: toggleIn(a.reasons[g] ?? [], v) } });

  // обов'язкові (5 зі зірочкою) — по кроках
  const missing = useMemo(() => ({
    0: [!a.think && 'коли почали думати', !a.decide && 'коли прийняли рішення'].filter(Boolean),
    1: [], 2: [!a.offer && 'пропозиція про роботу', !a.search && 'активний пошук'].filter(Boolean),
    3: [!a.contact && 'частота спілкування з керівником'].filter(Boolean), 4: [], 5: [],
  }), [a]);
  const stepOk = missing[step].length === 0;
  const allOk = Object.values(missing).every(m => m.length === 0);
  const reasonsCount = Object.values(a.reasons).reduce((n, arr) => n + arr.length, 0);
  const progress = Math.round(((step + (sent ? 1 : 0)) / STEPS.length) * 100);

  const next = () => { if (!stepOk) return; if (step < STEPS.length - 1) { setStep(step + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const back = () => { if (step > 0) { setStep(step - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const submit = () => { if (!allOk) return; setSent(true); try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ } window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const S = STEPS[step];

  /* ── екран успіху ── */
  if (sent) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#fff' }}>
          <div className="ks-credit" style={{ fontSize: 13.5, color: '#374151', padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}><span style={{ fontWeight: 600 }}>Головна</span><span style={{ color: '#9ca3af', margin: '0 7px' }}>›</span>Exit-інтерв’ю</div>
          <div className="ks-credit" style={{ maxWidth: 760, margin: '48px auto', padding: '0 24px' }}>
            <Card style={{ textAlign: 'center', padding: '40px 32px', background: 'linear-gradient(150deg,#e7faf1 0%,#f4fdf9 55%,#fffbea 100%)', border: '1px solid #ccf1e1' }}>
              <div style={{ margin: '0 auto', width: 64, height: 64, borderRadius: '50%', background: '#00B87C', color: '#fff', display: 'grid', placeItems: 'center' }}><Check size={32} strokeWidth={3} /></div>
              <h1 style={{ margin: '20px 0 0', fontSize: 26, fontWeight: 800, color: T.navy }}>Дякуємо, що приділили увагу!</h1>
              <p style={{ margin: '10px auto 0', maxWidth: 520, fontSize: 15, lineHeight: 1.55, color: '#4a5b71' }}>Ваші відповіді збережено й передано HR. Вони допоможуть нам зробити роботу в Компанії кращою для тих, хто лишається, і для тих, хто прийде.</p>
              <div style={{ margin: '22px auto 0', maxWidth: 520, textAlign: 'left', display: 'grid', gap: 10 }}>
                {[['Відповіді конфіденційні', 'Їх бачить лише HR; керівнику передається узагальнений зворотний зв’язок без цитат.'], ['Що далі', 'HR-партнер зв’яжеться з вами, якщо захоче уточнити щось із написаного — за вашої згоди.'], ['Ми вдячні', 'Бажаємо успіху на новому етапі — і будемо раді бачити вас знову.']].map(([t, d]) => (
                  <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><CheckCircle2 size={18} style={{ color: '#00B87C', flexShrink: 0, marginTop: 2 }} /><div><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.ink }}>{t}</p><p style={{ margin: 0, fontSize: 13, color: T.muted, lineHeight: 1.45 }}>{d}</p></div></div>
                ))}
              </div>
              <div style={{ marginTop: 26 }}><PrimaryButton onClick={() => (window.location.href = '/')}>На головну</PrimaryButton></div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#fff' }}>
        <div className="ks-credit" style={{ fontSize: 13.5, color: '#374151', padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}><span style={{ fontWeight: 600 }}>Головна</span><span style={{ color: '#9ca3af', margin: '0 7px' }}>›</span>Exit-інтерв’ю</div>
        <div className="ks-credit" style={{ margin: '0 auto', width: '100%', maxWidth: 1040, padding: '20px 32px 64px' }}>

          {/* HERO */}
          <section className="ks-in" style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, background: 'linear-gradient(100deg,#ffffff 0%,#f6faff 40%,#eaf4fd 75%,#e2f0fb 100%)', border: '1px solid #e3eefb', boxShadow: '0 1px 3px rgba(15,60,120,.06)', padding: '24px 32px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ maxWidth: 620 }}>
                <p style={{ margin: 0, fontSize: 12.5, letterSpacing: '.18em', textTransform: 'uppercase', color: T.blueText, fontWeight: 700 }}>Exit-інтерв’ю</p>
                <h1 style={{ margin: '6px 0 0', fontSize: 28, lineHeight: 1.15, fontWeight: 800, letterSpacing: '-.01em', color: T.navy }}>Дякуємо, що були з нами</h1>
                <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.5, color: '#4a5b71' }}>{INTRO}</p>
              </div>
              <div style={{ display: 'grid', gap: 6, fontSize: 13, color: T.muted, minWidth: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Стаж у компанії</span><b style={{ color: T.ink }}>{EMPLOYEE.tenure}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Керівник</span><b style={{ color: T.ink }}>{EMPLOYEE.manager}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}><span>Займе</span><Pill tone="blue" bold>≈ 7 хвилин</Pill></div>
              </div>
            </div>
            <Stepper step={step} onJump={setStep} done={allOk} />
            <div style={{ marginTop: 14, height: 6, borderRadius: 99, background: '#e6edf4', overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#00A0E3,#00B87C)', transition: 'width .5s cubic-bezier(.22,1,.36,1)' }} /></div>
          </section>

          {/* демо-рядок */}
          <div className="ks-in" style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: saved ? '#00B87C' : T.muted, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color .3s' }}><Check size={14} /> {saved ? 'Чернетку збережено' : 'Чернетка зберігається автоматично'}</span>
            <button type="button" onClick={() => patch(SAMPLE)} title="Демо: заповнити зразковими відповідями" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: T.muted, background: 'transparent', border: '1px dashed #c9d6e4', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}><Wand2 size={14} /> Демо: заповнити зразком</button>
          </div>

          {/* КРОК */}
          <div key={step} style={{ marginTop: 18 }}>
            <Card>
              <CardTitle title={`Крок ${step + 1} з ${STEPS.length} · ${S.title}`} caption={S.caption} aside={<IconBubble Icon={S.Icon} tone={step === 5 ? 'yellow' : step === 2 ? 'mint' : 'blue'} />} />

              {/* 1. Про рішення */}
              {step === 0 && (
                <div style={{ display: 'grid', gap: 26, marginTop: 22 }}>
                  <div><QLabel required>Як давно Ви почали думати про те, щоб покинути Компанію?</QLabel><ChipGroup options={THINK_OPTIONS} value={a.think} onChange={v => patch({ think: v })} /></div>
                  <div><QLabel required>Як давно Ви прийняли рішення покинути Компанію?</QLabel><ChipGroup options={DECIDE_OPTIONS} value={a.decide} onChange={v => patch({ decide: v })} /></div>
                </div>
              )}

              {/* 2. Причини */}
              {step === 1 && (
                <div style={{ marginTop: 18 }}>
                  <p style={{ margin: '0 0 16px', fontSize: 13.5, color: T.muted, lineHeight: 1.5 }}>Зазначте головні причини, які вплинули на Ваше остаточне рішення. {REASONS_INTRO}{reasonsCount > 0 && <> <Pill tone="blue" bold>обрано {reasonsCount}</Pill></>}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                    {REASON_GROUPS.map(g => {
                      const sel = a.reasons[g.key] ?? [];
                      return (
                        <div key={g.key} style={{ borderRadius: 12, border: `1px solid ${sel.length ? '#b6e4f8' : T.line}`, background: sel.length ? '#f7fcff' : '#fff', padding: '12px 10px', transition: 'all .2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 8px' }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.navy }}>{g.title}</p>
                            {sel.length > 0 && <Pill tone="blue" bold>{sel.length}</Pill>}
                          </div>
                          <div style={{ display: 'grid', gap: 2 }}>{g.items.map(item => <CheckRow key={item} checked={sel.includes(item)} onChange={() => toggleReason(g.key, item)} label={item} />)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Робота */}
              {step === 2 && (
                <div style={{ display: 'grid', gap: 26, marginTop: 22 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    <div><QLabel required>Чи Ви наразі маєте пропозицію про роботу, яку прийняли/готові прийняти?</QLabel><YesNo value={a.offer} onChange={v => patch({ offer: v })} /></div>
                    <div><QLabel required>Ви здійснювали активний пошук роботи?</QLabel><YesNo value={a.search} onChange={v => patch({ search: v })} /></div>
                  </div>
                  <div>
                    <QLabel hint="Оберіть з нижче вказаних факторів — можна кілька">Що Вам подобалось у Вашій роботі?</QLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>{LIKED_OPTIONS.map(o => <CheckRow key={o} checked={a.liked.includes(o)} onChange={() => patch({ liked: toggleIn(a.liked, o) })} label={o} />)}</div>
                  </div>
                </div>
              )}

              {/* 4. Керівник */}
              {step === 3 && (
                <div style={{ display: 'grid', gap: 22, marginTop: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: `1px solid ${T.line}` }}>
                    <IconBubble Icon={User} tone="blue" size={38} /><div><p style={{ margin: 0, fontSize: 12, color: T.muted }}>Ваш керівник</p><p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>{EMPLOYEE.manager}</p></div>
                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.muted }}><Lock size={13} /> бачить лише HR</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
                    <div><QLabel>Вкажіть сильні сторони Вашого керівника</QLabel><TextArea value={a.mgrStrengths} onChange={v => patch({ mgrStrengths: v })} placeholder="Що у нього/неї виходить особливо добре?" /></div>
                    <div><QLabel>Вкажіть зони для розвитку Вашого керівника</QLabel><TextArea value={a.mgrGrowth} onChange={v => patch({ mgrGrowth: v })} placeholder="Що могло б зробити роботу з ним/нею кращою?" /></div>
                  </div>
                  <div><QLabel required>Як часто Ви спілкувались з Вашим керівником, отримували зворотний зв’язок?</QLabel><ChipGroup options={CONTACT_OPTIONS} value={a.contact} onChange={v => patch({ contact: v })} /></div>
                </div>
              )}

              {/* 5. Рекомендації */}
              {step === 4 && (
                <div style={{ display: 'grid', gap: 26, marginTop: 22 }}>
                  <p style={{ margin: 0, fontSize: 13.5, color: T.muted }}>Оцініть за шкалою від 0 до 10, де 0 — «точно не порекомендую», 10 — «точно порекомендую».</p>
                  {NPS_QUESTIONS.map(q => <div key={q.key}><QLabel>{q.text}</QLabel><NpsScale value={a[q.key]} onChange={v => patch({ [q.key]: v })} /></div>)}
                  <div><QLabel>На Вашу думку, на що саме Компанії треба звернути увагу та покращити?</QLabel><TextArea rows={4} value={a.improve} onChange={v => patch({ improve: v })} placeholder="Будь-яка думка цінна — навіть коротка" /></div>
                </div>
              )}

              {/* 6. Комплаєнс */}
              {step === 5 && (
                <div style={{ display: 'grid', gap: 18, marginTop: 20 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12, background: '#fff8dd', border: '1px solid #fbe9a6' }}>
                    <ShieldCheck size={20} style={{ color: '#8a6a00', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: '#5c4a00' }}>Ці питання ми ставимо кожному, хто завершує роботу, — так вимагає Кодекс поведінки VEON. Якщо вам нічого не відомо, просто залиште «Ні». Відповіді конфіденційні й розглядаються окремо від решти опитування.</p>
                  </div>
                  {COMPLIANCE_QUESTIONS.map((q, i) => {
                    const v = a.compliance[q.key];
                    return (
                      <div key={q.key} style={{ padding: '14px 16px', borderRadius: 12, border: `1px solid ${v.answer === 'Так' ? '#fbe9a6' : T.line}`, background: v.answer === 'Так' ? '#fffdf2' : '#fff', transition: 'all .2s' }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                          <p style={{ margin: 0, flex: 1, minWidth: 260, fontSize: 13.5, lineHeight: 1.5, color: T.ink }}><b style={{ color: T.muted, marginRight: 6 }}>{i + 1}.</b>{q.text}</p>
                          <YesNo value={v.answer} onChange={ans => patch({ compliance: { ...a.compliance, [q.key]: { ...v, answer: ans } } })} />
                        </div>
                        {v.answer === 'Так' && <div style={{ marginTop: 12 }}><TextArea rows={3} value={v.comment} onChange={c => patch({ compliance: { ...a.compliance, [q.key]: { ...v, comment: c } } })} placeholder="Опишіть, будь ласка, що саме вам відомо" /></div>}
                      </div>
                    );
                  })}
                  <div><QLabel>{COMPLIANCE_OPEN}</QLabel><TextArea rows={3} value={a.complianceOpen} onChange={v => patch({ complianceOpen: v })} placeholder="Необов’язково" /></div>
                </div>
              )}

              {/* навігація кроку */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 26, paddingTop: 18, borderTop: `1px solid ${T.line}`, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, fontSize: 12.5, color: stepOk ? T.muted : '#b45309', lineHeight: 1.4 }}>
                  {stepOk ? (step === STEPS.length - 1 ? (allOk ? 'Усе готово — можна надсилати.' : 'Залишились обов’язкові питання на попередніх кроках.') : 'Решта питань — за бажанням.') : `Щоб перейти далі, дайте відповідь: ${missing[step].join(', ')}.`}
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  {step > 0 && <GhostButton onClick={back}><ArrowLeft size={15} /> Назад</GhostButton>}
                  {step < STEPS.length - 1
                    ? <PrimaryButton onClick={next} disabled={!stepOk}>Далі <ArrowRight size={15} /></PrimaryButton>
                    : <PrimaryButton onClick={submit} disabled={!allOk}><Send size={15} /> Надіслати</PrimaryButton>}
                </div>
              </div>
            </Card>
          </div>

          <p style={{ margin: '18px 0 0', textAlign: 'center', fontSize: 12.5, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Lock size={13} /> Відповіді конфіденційні та використовуються лише для покращення роботи в Компанії</p>
        </div>
      </div>
    </div>
  );
};

export default ExitInterview;
