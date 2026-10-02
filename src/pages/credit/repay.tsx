// @ts-nocheck
import { useState } from 'react';
import { Bell, BellOff, CalendarCheck, CheckCircle2, ChevronDown, Download, PartyPopper, RotateCcw, Smartphone, Sparkles, Wallet } from 'lucide-react';
import { LoanScales, type ScalesStyle } from './scales';
import { Card, CardTitle, Chip, CopyValue, GhostButton, IconBubble, Pill, PrimaryButton, QrDemo, Segmented, T } from './ui';
import { DEMO_TODAY, REQUISITES, buildLoanState, daysBetween, encouragement, fmtDate, fmtDateFull, fmtMonth, pluralDays, pluralMonths, uah, type LoanState, type Stage } from './loanData';

const LOOKS: ScalesStyle[] = ['3d', 'vector'];

function Confetti() {
  const colors = ['#00a0e3', '#ffd100', '#34d399', '#7fd6f5', '#003f7d'];
  return (
    <div aria-hidden style={{ pointerEvents: 'none', position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {Array.from({ length: 26 }).map((_, i) => (
        <span key={i} className="ks-confetti" style={{ left: `${(i * 37) % 100}%`, width: i % 3 === 0 ? 8 : 6, height: i % 3 === 0 ? 12 : 8, background: colors[i % colors.length], animationDelay: `${(i % 7) * 0.35}s`, animationDuration: `${2.6 + (i % 4) * 0.5}s` }} />
      ))}
    </div>
  );
}

function ScalesCard({ state, look, onLook }: { state: LoanState; look: ScalesStyle; onLook: (n: ScalesStyle) => void }) {
  const note = encouragement(state.ratio);
  const milestones = [0.25, 0.5, 0.75, 1];
  const extraCut = state.monthly - state.lastRow.amount;
  const percent = Math.round(state.ratio * 100);
  const sideBox = (label, value, bg, c) => (
    <div style={{ borderRadius: 16, padding: '10px 12px', background: bg, textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: c }}>{label}</p>
      <p style={{ margin: 0, fontSize: 19, lineHeight: 1.2, fontWeight: 800, color: T.navy }}>{value}</p>
    </div>
  );
  return (
    <Card delay={140} style={{ position: 'relative', overflow: 'hidden' }}>
      {state.done && <Confetti />}
      <div className="ks-grid-2" style={{ position: 'relative', gridTemplateColumns: '1.05fr 1fr', gap: 40, alignItems: 'center' }}>
        <div>
          <div style={{ margin: '0 auto', maxWidth: 460 }}><LoanScales ratio={state.ratio} done={state.done} look={look} /></div>
          <div style={{ margin: '4px auto 0', display: 'grid', maxWidth: 460, gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {sideBox('Залишилось', uah(state.left), state.done ? '#f6f9fc' : T.yellow050, state.done ? T.muted : T.yellowText)}
            {sideBox('Сплачено', uah(state.paid), T.mint050, T.mintText)}
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: T.mintText }}><Sparkles size={14} /> Ваш прогрес · {percent}%</p>
            <div style={{ width: 168 }} title="Демо: оберіть стиль ілюстрації"><Segmented options={LOOKS} value={look} onChange={onLook} render={o => (o === '3d' ? '3D' : 'Вектор')} /></div>
          </div>
          <h2 style={{ margin: '8px 0 0', fontSize: 26, lineHeight: 1.15, fontWeight: 800, letterSpacing: '-.01em', color: T.navy }}>{note.title}</h2>
          <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.5, color: '#4a5b71' }}>{note.caption}</p>
          <p style={{ margin: '12px 0 0', display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 8px', fontSize: 13, color: T.muted }}>
            <Wallet size={14} style={{ color: T.blue }} />{uah(state.loan.amount)} · {state.loan.months} {pluralMonths(state.loan.months)} · {state.loan.purpose.toLowerCase()}
          </p>
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {milestones.map(m => {
              const reached = state.ratio >= m;
              const fill = Math.min(1, Math.max(0, (state.ratio - (m - 0.25)) / 0.25));
              return (
                <div key={m} style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', height: 8, overflow: 'hidden', borderRadius: 999, background: '#eef2f7' }}><span style={{ display: 'block', height: '100%', borderRadius: 999, width: `${fill * 100}%`, background: T.mint, transition: 'width .7s' }} /></span>
                  <span style={{ marginTop: 6, display: 'block', fontSize: 12, fontWeight: 700, color: reached ? T.mintText : T.muted }}>{m * 100}%</span>
                </div>
              );
            })}
          </div>
          {!state.done && extraCut > 0 && (
            <p style={{ margin: '16px 0 0', display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: '10px 12px', fontSize: 13, lineHeight: 1.4, background: T.mint050, color: '#0b6e49' }}>
              <CheckCircle2 size={16} style={{ marginTop: 2, flexShrink: 0 }} />Ви внесли {uah(extraCut)} понад графік — останній платіж зменшився до {uah(state.lastRow.amount)}.
            </p>
          )}
          {state.done && (
            <p style={{ margin: '16px 0 0', display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: '10px 12px', fontSize: 13, lineHeight: 1.4, background: T.mint050, color: '#0b6e49' }}>
              <PartyPopper size={16} style={{ marginTop: 2, flexShrink: 0 }} />Ваги остаточно на вашому боці. Котик радіє разом із вами!
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function NextPaymentCard({ state }: { state: LoanState }) {
  const [remind, setRemind] = useState(true);
  const next = state.nextRow; if (!next) return null;
  const days = daysBetween(DEMO_TODAY, next.date);
  return (
    <Card delay={360} style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#e6f6fd 0%,#f6fcff 55%,#fffbea 100%)', border: '1px solid #d5eefa' }}>
      <span aria-hidden style={{ pointerEvents: 'none', position: 'absolute', right: -48, bottom: -56, width: 176, height: 176, borderRadius: '50%', opacity: 0.7, background: 'radial-gradient(circle,#ffe06b 0%,transparent 65%)' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><IconBubble Icon={CalendarCheck} tone="blue" /><Pill tone="blue" bold>через {days} {pluralDays(days)}</Pill></div>
        <p style={{ margin: '16px 0 0', fontSize: 13, fontWeight: 700, color: T.blueText }}>Наступний платіж</p>
        <p style={{ margin: '4px 0 0', fontSize: 36, lineHeight: 1, fontWeight: 800, color: T.navy }}>{uah(next.amount)}</p>
        <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 600, color: T.ink }}>до {fmtDateFull(next.date)}</p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: T.muted }}>Останній платіж — {fmtMonth(state.lastRow.date).toLowerCase()}</p>
        <button type="button" onClick={() => setRemind(v => !v)} aria-pressed={remind} style={{ marginTop: 20, display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 16, background: 'rgba(255,255,255,.8)', padding: '12px 16px', textAlign: 'left', border: '1px solid #d5eefa', cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 600, color: T.ink }}>{remind ? <Bell size={16} style={{ color: T.blue }} /> : <BellOff size={16} style={{ color: T.muted }} />}Нагадати за 3 дні до дати</span>
          <span style={{ position: 'relative', height: 24, width: 40, flexShrink: 0, borderRadius: 999, background: remind ? T.blue : '#c4cedb', transition: 'background .2s' }}><span style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', left: remind ? 18 : 2, transition: 'left .2s' }} /></span>
        </button>
      </div>
    </Card>
  );
}

type PayMode = 'next' | 'full' | 'partial';
const PAY_MODES: PayMode[] = ['next', 'full', 'partial'];

function PayCard({ state }: { state: LoanState }) {
  const [mode, setMode] = useState<PayMode>('next');
  const [partial, setPartial] = useState(5_000);
  const nextAmount = state.nextRow?.amount ?? state.left;
  const amount = mode === 'full' ? state.left : mode === 'next' ? nextAmount : Math.min(Math.max(0, partial), state.left);
  const labels = { next: 'Платіж', full: 'Усе одразу', partial: 'Своя сума' };
  return (
    <Card delay={420}>
      <CardTitle title="Сплатити" caption="Скануйте QR у будь-якому банку — сума й реквізити підставляться самі" />
      <div style={{ marginTop: 16 }}><Segmented options={PAY_MODES} value={mode} onChange={setMode} render={o => labels[o]} /></div>
      {mode === 'partial' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 16, background: '#fff', padding: '10px 16px', border: `1px solid ${T.line}` }}>
            <input inputMode="numeric" value={partial ? partial.toLocaleString('uk-UA') : ''} onChange={e => setPartial(Number(e.target.value.replace(/\D/g, '') || 0))} aria-label="Сума оплати" style={{ width: '100%', background: 'transparent', fontSize: 20, fontWeight: 800, outline: 'none', border: 'none', color: T.navy, fontFamily: 'inherit' }} />
            <span style={{ fontSize: 18, fontWeight: 800, color: T.muted }}>₴</span>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>{[2_000, 5_000, 10_000].map(v => <Chip key={v} active={partial === v} onClick={() => setPartial(v)}>{uah(v)}</Chip>)}</div>
          {partial > state.left && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: T.yellowText }}>Це більше за залишок — візьмемо рівно {uah(state.left)}.</p>}
        </div>
      )}
      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, borderRadius: 18, padding: 16, background: '#f8fafc' }}>
        <div style={{ borderRadius: 16, background: '#fff', padding: 12, boxShadow: '0 8px 22px rgba(0,63,125,.08)' }}><QrDemo seed={Math.round(amount) || 1} size={132} /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: T.muted }}>До сплати</p>
          <p style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800, color: T.navy }}>{uah(amount)}</p>
          <p style={{ margin: '6px 0 0', display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, lineHeight: 1.4, color: T.muted }}><Smartphone size={14} style={{ marginTop: 2, flexShrink: 0 }} />Відкриється мобільний банк. Оплата одразу зменшить залишок.</p>
          {mode === 'full' && <p style={{ margin: '8px 0 0', fontSize: 12.5, fontWeight: 700, color: T.mintText }}>Без штрафів за дострокове погашення</p>}
        </div>
      </div>
      <details style={{ marginTop: 16 }}>
        <summary style={{ display: 'flex', cursor: 'pointer', listStyle: 'none', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 0', fontSize: 13.5, fontWeight: 700, color: T.navy }}>Реквізити для оплати вручну <ChevronDown size={16} /></summary>
        <div style={{ marginTop: 4 }}>
          <CopyValue label="Отримувач" value={REQUISITES.recipient} /><CopyValue label="IBAN" value={REQUISITES.iban} /><CopyValue label="ЄДРПОУ" value={REQUISITES.edrpou} /><CopyValue label="Призначення платежу" value={REQUISITES.purpose} />
        </div>
      </details>
    </Card>
  );
}

function DoneCard({ onNew }) {
  return (
    <Card delay={360} style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#e7faf1 0%,#f4fdf9 55%,#fffbea 100%)', border: '1px solid #ccf1e1' }}>
      <IconBubble Icon={PartyPopper} tone="mint" size={48} />
      <h2 style={{ margin: '16px 0 0', fontSize: 20, fontWeight: 800, color: T.navy }}>Ви молодець!</h2>
      <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5, color: '#4a5b71' }}>Кредит закрито {fmtDateFull(new Date(2027, 2, 28))}. Дякуємо за відповідальність і довіру — ви пройшли весь шлях.</p>
      <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
        <PrimaryButton full><Download size={16} /> Довідка про погашення</PrimaryButton>
        <GhostButton onClick={onNew} full><RotateCcw size={15} /> Подати нову заявку</GhostButton>
      </div>
      <p style={{ margin: '16px 0 0', fontSize: 12.5, color: T.muted }}>Якщо знову знадобиться підтримка — ми поруч.</p>
    </Card>
  );
}

const ROW_STATUS = { paid: { label: 'Сплачено', tone: 'mint' }, next: { label: 'Наступний', tone: 'blue' }, planned: { label: 'За графіком', tone: 'grey' } };

function ScheduleCard({ state }: { state: LoanState }) {
  const paidCount = state.schedule.filter(r => r.status === 'paid').length;
  const th = { padding: '10px 24px', fontSize: 12, fontWeight: 700, color: T.muted, textAlign: 'left', whiteSpace: 'nowrap' };
  return (
    <Card delay={480} style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '24px 24px 12px' }}><CardTitle title="Графік платежів" caption={`Сплачено ${paidCount} з ${state.schedule.length} · щомісяця до 10 числа`} /></div>
      <div style={{ maxHeight: 470, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead style={{ position: 'sticky', top: 0, background: '#fff' }}><tr><th style={th}>№</th><th style={{ ...th, paddingLeft: 0 }}>Дата</th><th style={{ ...th, textAlign: 'right', paddingLeft: 0 }}>Сума</th><th style={{ ...th, textAlign: 'right' }}>Статус</th></tr></thead>
          <tbody>
            {state.schedule.map(r => {
              const m = ROW_STATUS[r.status]; const hl = r.status === 'next';
              return (
                <tr key={r.index} style={{ borderTop: `1px solid ${T.line}`, background: hl ? T.blue050 : undefined }}>
                  <td style={{ padding: '12px 24px', fontWeight: 700, color: T.muted }}>{r.index + 1}</td>
                  <td style={{ padding: '12px 0', fontWeight: 600, color: T.ink }}>{fmtDate(r.date)} {r.date.getFullYear()}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 800, color: r.status === 'paid' ? T.mintText : T.navy }}>{uah(r.amount)}</td>
                  <td style={{ padding: '12px 24px', textAlign: 'right' }}><Pill tone={m.tone} bold={hl}>{m.label}</Pill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function RepayStage({ stage, onNew }: { stage: Extract<Stage, 'active' | 'done'>; onNew: () => void }) {
  const state = buildLoanState(stage);
  const [look, setLook] = useState<ScalesStyle>('3d');
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <ScalesCard state={state} look={look} onLook={setLook} />
      {state.done ? (
        <div className="ks-grid-2b"><DoneCard onNew={onNew} /><ScheduleCard state={state} /></div>
      ) : (
        <>
          <div className="ks-grid-2c"><NextPaymentCard state={state} /><PayCard state={state} /></div>
          <ScheduleCard state={state} />
        </>
      )}
    </div>
  );
}

/** Стан «Заявку надіслано»: погашення ще не почалось */
export function RepayWaiting({ amount, months }) {
  const monthly = amount / months;
  return (
    <Card delay={0} style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#f4fbff 0%,#ffffff 60%,#fffbea 100%)' }}>
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
        <img src="/images/hero-loan.png" alt="" className="ks-float" style={{ width: 120, flexShrink: 0, margin: '0 auto' }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: T.navy }}>Погашення почнеться після зарахування коштів</h3>
          <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5, color: '#4a5b71' }}>Щойно HR оформить документи й кошти надійдуть, тут з'являться ваш прогрес, графік і QR для оплати. Поки що нічого робити не треба.</p>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[['Сума', uah(amount)], ['Щомісяця', uah(monthly)], ['Строк', `${months} міс.`]].map(([l, v]) => (
              <div key={l} style={{ borderRadius: 16, background: '#fff', padding: '10px 12px', border: `1px solid ${T.line}` }}>
                <p style={{ margin: 0, fontSize: 12, color: T.muted }}>{l}</p><p style={{ margin: 0, fontSize: 16, lineHeight: 1.2, fontWeight: 800, color: T.navy }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
