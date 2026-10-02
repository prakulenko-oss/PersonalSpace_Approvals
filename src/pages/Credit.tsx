// @ts-nocheck
/* Кредит від компанії — повна сторінка (перенесено з референсу kyivstar-poa-kep, адаптовано під наш стек).
   Процес: калькулятор → лист у HR з погодженням керівника → HR готує наказ і договір → кошти → погашення. */
import { useRef, useState } from 'react';
import heroLoanPng from '../assets/credit/hero-loan.png';
import { BookOpen, CalendarCheck, ChevronDown, Heart, HeartHandshake, MessageCircle, Wallet } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { IconBubble, StageSwitch, T, TONE } from './credit/ui';
import { CalculatorCard, ConditionsStrip, HowItWorks } from './credit/apply';
import { LetterComposer, SentLetterCard, type SentLetter } from './credit/letter';
import { RepayStage, RepayWaiting } from './credit/repay';
import { HistoryCard, ReviewStage, type CurrentApplication } from './credit/reviewHistory';
import { DEMO, DEMO_TODAY, buildLoanState, fmtDateFull, fmtMonth, type Draft, type Stage } from './credit/loanData';

const HERO_COPY: Record<Stage, { h: [string, string]; sub: string }> = {
  none:     { h: ['Підтримаємо,', 'коли це потрібно'],        sub: 'Безвідсотковий кредит від компанії. Без відсотків, довідок і зайвих паперів.' },
  sent:     { h: ['Заявку надіслано —', 'далі справа за HR'],   sub: 'HR підготує наказ і договір та напише вам на пошту. Ми поруч, якщо виникнуть питання.' },
  pending:  { h: ['Заявку отримали —', 'ми вже працюємо'],      sub: "Зазвичай рішення готове за кілька робочих днів. Повідомимо, щойно воно з'явиться." },
  rejected: { h: ['Цього разу не вийшло,', 'але ми поруч'],     sub: 'Пояснимо причину й підкажемо, коли можна спробувати знову.' },
  active:   { h: ['Ви на правильному', 'шляху'],                sub: 'Майже половину вже погашено, і ви трохи випереджаєте графік. Ми поруч на кожному кроці.' },
  done:     { h: ['Кредит погашено.', 'Пишаємося вами!'],       sub: "Усі платежі позаду. Дякуємо за відповідальність — і пам'ятайте, що ми поруч." },
};

const MAIN_CAPTION: Record<Stage, string> = {
  none: 'Оберіть суму й строк — лист у HR сформується автоматично',
  sent: 'Ваша заявка й лист, який отримав HR',
  pending: 'Статус заявки й наступні кроки',
  rejected: 'Що сталося і що можна зробити далі',
  active: 'Заявка, за якою оформлено поточний кредит',
  done: 'Можна розрахувати й оформити новий кредит',
};

const DEMO_LETTER: SentLetter = {
  draft: { amount: DEMO.loan.amount, months: DEMO.loan.months, purpose: 'Ремонт', note: '', agree: true },
  files: [{ name: 'Погодження_Коваль_О.msg', size: 48_200 }],
  sentAt: new Date(2026, 2, 24),
};

function currentApplication(stage: Stage, letter: SentLetter | null): CurrentApplication | null {
  if (stage === 'sent' && letter) {
    const sent = fmtDateFull(letter.sentAt);
    return { title: 'Заявка на кредит', amount: letter.draft.amount, caption: `Надіслано в HR ${sent}`, status: 'У роботі в HR', tone: 'blue', steps: [
      { label: 'Погодження керівника', date: 'додано до листа', state: 'done' },
      { label: 'Лист надіслано в HR', date: sent, state: 'done' },
      { label: 'HR готує наказ і договір', date: 'зараз', state: 'current' },
      { label: 'Підписання договору', state: 'next' },
      { label: 'Кошти на картку', state: 'next' },
    ] };
  }
  if (stage === 'active' || stage === 'done') {
    const state = buildLoanState(stage); const done = stage === 'done';
    return { title: `Кредит · ${DEMO.loan.purpose.toLowerCase()}`, amount: DEMO.loan.amount, caption: `${fmtMonth(DEMO.loan.start)} — ${fmtMonth(state.lastRow.date).toLowerCase()}`, status: done ? 'Погашено' : 'Погашається', tone: done ? 'mint' : 'blue', steps: [
      { label: 'Лист надіслано в HR', date: fmtDateFull(DEMO_LETTER.sentAt), state: 'done' },
      { label: 'Наказ і договір', date: fmtDateFull(new Date(2026, 3, 2)), state: 'done' },
      { label: 'Кошти на картку', date: fmtDateFull(DEMO.loan.start), state: 'done' },
      { label: done ? 'Усі платежі сплачено' : `Погашення · ${Math.round(state.ratio * 100)}%`, date: done ? '12 з 12' : `${DEMO.paidMonths} з ${DEMO.loan.months} платежів`, state: done ? 'done' : 'current' },
      { label: 'Кредит закрито', date: done ? fmtDateFull(new Date(2027, 2, 28)) : fmtMonth(state.lastRow.date).toLowerCase(), state: done ? 'done' : 'next' },
    ] };
  }
  return null;
}

const HELP = [
  { Icon: BookOpen, tone: 'blue', title: 'Положення про позики', caption: 'Умови програми простою мовою', link: 'Читати' },
  { Icon: MessageCircle, tone: 'mint', title: 'Є питання?', caption: 'Відповімо в чаті протягом робочого дня', link: 'Написати' },
  { Icon: HeartHandshake, tone: 'yellow', title: 'Стало складно платити?', caption: 'Напишіть нам — разом знайдемо рішення', link: 'Поговорити' },
];

/* ───── Hero з 3D-ілюстрацією та «супутниками» ───── */
function Hero({ heading, subtext }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const sats = [{ Icon: Wallet, color: T.blue }, { Icon: Heart, color: '#c69a00' }, { Icon: CalendarCheck, color: T.navy }];
  const spots = [{ top: 4, left: 30, size: 36, anim: 'ks-float-b ks-d1' }, { top: 74, left: -8, size: 40, anim: 'ks-float-c ks-d2' }, { top: 96, right: 10, size: 34, anim: 'ks-float-b ks-d3' }];
  const onMove = e => { const b = ref.current?.getBoundingClientRect(); if (!b) return; setTilt({ x: (e.clientX - b.left) / b.width - 0.5, y: (e.clientY - b.top) / b.height - 0.5 }); };
  return (
    <section ref={ref} onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} className="ks-in" style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, background: 'linear-gradient(100deg,#ffffff 0%,#f6faff 40%,#eaf4fd 75%,#e2f0fb 100%)', border: '1px solid #e3eefb', boxShadow: '0 1px 3px rgba(15,60,120,.06)' }}>
      <span aria-hidden className="ks-hero-art" style={{ pointerEvents: 'none', position: 'absolute', top: '50%', right: '10%', width: 420, height: 420, transform: 'translateY(-50%)', borderRadius: '50%', background: 'radial-gradient(circle,rgba(127,214,245,.28) 0%,transparent 65%)' }} />
      <span aria-hidden className="ks-float-c ks-d1 ks-hero-art" style={{ pointerEvents: 'none', position: 'absolute', top: 36, right: '40%', width: 12, height: 12, borderRadius: '50%', background: T.yellow, opacity: 0.85 }} />
      <span aria-hidden className="ks-float-b ks-d3 ks-hero-art" style={{ pointerEvents: 'none', position: 'absolute', bottom: 48, right: '48%', width: 8, height: 8, borderRadius: '50%', background: T.blue, opacity: 0.7 }} />
      <div className="ks-hero-grid" style={{ position: 'relative', padding: '22px 48px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.15, fontWeight: 800, letterSpacing: '-.01em', color: T.navy }}>{heading[0]}<br />{heading[1]}</h1>
          <p style={{ margin: '8px 0 0', maxWidth: 440, fontSize: 15.5, lineHeight: 1.5, color: '#4a5b71' }}>{subtext}</p>
        </div>
        <div className="ks-hero-art" style={{ position: 'relative', height: 150, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={heroLoanPng} alt="Безвідсотковий кредит" className="ks-float" style={{ width: 170, height: 170, objectFit: 'contain', filter: 'drop-shadow(0 22px 34px rgba(0,63,125,.2))', marginLeft: tilt.x * 18, marginTop: tilt.y * 14, transition: 'margin .25s ease-out' }} />
          {sats.map(({ Icon, color }, i) => {
            const s = spots[i];
            return (
              <span key={i} className={s.anim} style={{ position: 'absolute', top: s.top, left: s.left, right: s.right, width: s.size, height: s.size, display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'rgba(255,255,255,.72)', border: '1px solid rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 24px rgba(0,63,125,.12)', color }}>
                <Icon size={s.size * 0.5} strokeWidth={2.2} />
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionHead({ id, title, caption }) {
  return (
    <div id={id} className="ks-in" style={{ margin: '32px 0 16px', scrollMarginTop: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-.01em', color: T.navy }}>{title}</h2>
      <p style={{ margin: '4px 0 0', fontSize: 14, color: T.muted }}>{caption}</p>
    </div>
  );
}

function Collapsible({ id, title, caption, open, onToggle, children }) {
  const btn = (
    <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={`${id}-body`} style={{ display: 'inline-flex', flexShrink: 0, alignItems: 'center', gap: 6, borderRadius: 10, background: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 700, border: `1px solid ${T.cardLine}`, color: T.navy, cursor: 'pointer', fontFamily: 'inherit' }}>
      {open ? 'Згорнути' : 'Розгорнути'}<ChevronDown size={16} style={{ transition: 'transform .3s', transform: open ? 'rotate(180deg)' : undefined }} />
    </button>
  );
  return (
    <section id={id} className="ks-in" style={{ marginTop: 32, scrollMarginTop: 24 }}>
      {open ? (
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div><h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-.01em', color: T.navy }}>{title}</h2><p style={{ margin: '4px 0 0', fontSize: 14, color: T.muted }}>{caption}</p></div>
          {btn}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 12, background: '#fff', padding: '16px 24px', border: `1px solid ${T.cardLine}`, boxShadow: T.shadow }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: T.navy }}>{title}</h2>{btn}
        </div>
      )}
      {open && <div id={`${id}-body`}>{children}</div>}
    </section>
  );
}

const OPEN_BY_DEFAULT: Stage[] = ['none', 'pending', 'rejected'];

export const Credit = () => {
  const [stage, setStage] = useState<Stage>('none');
  const [open, setOpen] = useState(true);
  const [letterOpen, setLetterOpen] = useState(false);
  const [sent, setSent] = useState<SentLetter | null>(null);
  const [draft, setDraft] = useState<Draft>({ amount: 40_000, months: 12, purpose: '', note: '', agree: false });
  const patch = (next: Partial<Draft>) => setDraft(c => ({ ...c, ...next }));
  const hero = HERO_COPY[stage];

  const go = (next: Stage) => { setStage(next); setOpen(OPEN_BY_DEFAULT.includes(next)); setLetterOpen(false); };
  const scrollTo = (id: string) => window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);

  const letter = stage === 'sent' ? (sent ?? { draft, files: [{ name: 'Погодження_керівника.msg', size: 41_000 }], sentAt: DEMO_TODAY }) : DEMO_LETTER;
  const repayLeft = fmtMonth(buildLoanState('active').lastRow.date).toLowerCase();

  const newLoan = (
    <div style={{ display: 'grid', gap: 20 }}>
      <div className="ks-grid-2">
        <CalculatorCard draft={draft} onChange={patch} onApply={() => { setLetterOpen(true); scrollTo('loan-letter'); }} />
        <HowItWorks compact />
      </div>
      {letterOpen && <LetterComposer draft={draft} onChange={patch} onSend={files => { setSent({ draft, files, sentAt: DEMO_TODAY }); go('sent'); scrollTo('my-loan'); }} />}
    </div>
  );

  let body = null;
  if (stage === 'none' || stage === 'done') body = newLoan;
  if (stage === 'sent') body = <SentLetterCard letter={letter} note="HR готує наказ і договір. Коли документи будуть готові, вам напишуть на пошту." />;
  if (stage === 'active') body = <SentLetterCard letter={letter} note={`Новий кредит можна буде оформити після погашення поточного — за графіком це ${repayLeft}, або раніше, якщо закриєте достроково.`} />;
  if (stage === 'pending' || stage === 'rejected') body = <ReviewStage stage={stage} draft={draft} onNew={() => go('none')} />;

  const showRepay = stage === 'sent' || stage === 'active' || stage === 'done';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: T.canvas }}>
        <div className="ks-credit" style={{ fontSize: 13.5, color: '#374151', padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}><span style={{ fontWeight: 600 }}>Головна</span><span style={{ color: '#9ca3af', margin: '0 7px' }}>›</span>Кредит від компанії</div>
        <div className="ks-credit" style={{ margin: '0 auto', width: '100%', maxWidth: 1180, padding: '20px 32px 64px' }}>

          <div key={`hero-${stage}`}><Hero heading={hero.h} subtext={hero.sub} /></div>

          <ConditionsStrip />
          <StageSwitch stage={stage} onChange={go} />

          <Collapsible id="my-loan" title="Мій кредит" caption={MAIN_CAPTION[stage]} open={open} onToggle={() => setOpen(v => !v)}>
            <div key={`main-${stage}`}>{body}</div>
          </Collapsible>

          {showRepay && (
            <>
              <SectionHead id="repay" title="Погашення" caption={stage === 'sent' ? "З'явиться, щойно кошти надійдуть" : stage === 'done' ? 'Усі платежі позаду' : 'Прогрес, наступний платіж і оплата — в одному місці'} />
              <div key={`repay-${stage}`}>
                {stage === 'sent' ? <RepayWaiting amount={letter.draft.amount} months={letter.draft.months} /> : <RepayStage stage={stage as 'active' | 'done'} onNew={() => { setOpen(true); scrollTo('my-loan'); }} />}
              </div>
            </>
          )}

          <SectionHead id="history" title="Історія" caption="Ваші заявки й кредити" />
          <HistoryCard current={currentApplication(stage, stage === 'sent' ? letter : null)} />

          <SectionHead id="help" title="Допомога" caption="Якщо щось незрозуміло або змінились обставини" />
          <div className="ks-grid-3">
            {HELP.map((c, i) => {
              const s = TONE[c.tone];
              return (
                <a key={c.title} href="#" onClick={e => e.preventDefault()} className="ks-in" style={{ display: 'block', borderRadius: 12, padding: 20, textDecoration: 'none', background: s.soft, border: `1px solid ${s.bg}`, animationDelay: `${120 + i * 80}ms`, transition: 'transform .3s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                  <IconBubble Icon={c.Icon} tone={c.tone} size={36} />
                  <p style={{ margin: '14px 0 0', fontSize: 15, fontWeight: 700, color: T.ink }}>{c.title}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: T.muted }}>{c.caption}</p>
                  <span style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: T.blue }}>{c.link} <span aria-hidden>→</span></span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credit;
