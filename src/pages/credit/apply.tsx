// @ts-nocheck
import { ArrowRight, BadgePercent, Calculator, CalendarCheck, Info, Lock, Send, ShieldCheck, Sprout, Wallet } from 'lucide-react';
import { Card, CardTitle, IconBubble, PrimaryButton, Segmented, T } from './ui';
import { CONDITIONS, HOW_STEPS, LOAN_MAX, LOAN_MIN, LOAN_STEP, LOAN_TERMS, draftFigures, fmtDate, fmtMonth, uah } from './loanData';

const HOW_ICONS = [Calculator, Send, ShieldCheck, Sprout];
const COND_ICONS = [BadgePercent, Wallet, CalendarCheck, Sprout];

export function HowItWorks({ compact = false }) {
  return (
    <Card delay={140}>
      <CardTitle title="Як це працює" caption="Чотири прості кроки — і жодних походів до бухгалтерії" />
      <ol style={{ listStyle: 'none', padding: 0, margin: '20px 0 0', display: 'grid', gap: compact ? 10 : 12, gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        {HOW_STEPS.map((step, i) => {
          const Icon = HOW_ICONS[i];
          const tone = i === 3 ? 'mint' : i === 2 ? 'yellow' : 'blue';
          return compact ? (
            <li key={step.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderRadius: 16, padding: 14, background: i === 0 ? T.blue050 : '#f8fafc' }}>
              <IconBubble Icon={Icon} tone={tone} size={36} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.ink }}><span style={{ color: T.muted }}>{i + 1}.</span> {step.title}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, lineHeight: 1.4, color: T.muted }}>{step.caption}</p>
              </div>
            </li>
          ) : (
            <li key={step.title} style={{ position: 'relative', borderRadius: 16, padding: 16, background: i === 0 ? T.blue050 : '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <IconBubble Icon={Icon} tone={tone} size={38} />
                <span style={{ fontSize: 12, fontWeight: 800, color: T.muted }}>Крок {i + 1}</span>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 15, fontWeight: 700, color: T.ink }}>{step.title}</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.4, color: T.muted }}>{step.caption}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function AmountField({ draft, onChange }) {
  const over = draft.amount > LOAN_MAX;
  const fill = Math.min(100, Math.max(0, ((draft.amount - LOAN_MIN) / (LOAN_MAX - LOAN_MIN)) * 100));
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <label htmlFor="loan-amount" style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Скільки потрібно</label>
        <span style={{ fontSize: 12, color: T.muted }}>до {uah(LOAN_MAX)}</span>
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 16, background: '#fff', padding: '12px 16px', border: `1px solid ${over ? '#f3d36b' : T.line}` }}>
        <input id="loan-amount" inputMode="numeric" value={draft.amount ? draft.amount.toLocaleString('uk-UA') : ''}
          onChange={e => { const digits = e.target.value.replace(/\D/g, ''); onChange({ amount: Math.min(Number(digits || 0), 999_999) }); }}
          style={{ width: '100%', background: 'transparent', fontSize: 26, fontWeight: 800, outline: 'none', border: 'none', color: T.navy, fontFamily: 'inherit' }} />
        <span style={{ fontSize: 22, fontWeight: 800, color: T.muted }}>₴</span>
      </div>
      <input type="range" min={LOAN_MIN} max={LOAN_MAX} step={LOAN_STEP} value={Math.min(Math.max(draft.amount, LOAN_MIN), LOAN_MAX)} onChange={e => onChange({ amount: Number(e.target.value) })}
        className="ks-range" style={{ marginTop: 16, '--fill': `${fill}%` }} aria-label="Сума кредиту" />
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
        {[20_000, 40_000, 60_000, LOAN_MAX].map(v => {
          const active = draft.amount === v;
          return (
            <button key={v} type="button" onClick={() => onChange({ amount: v })} aria-pressed={active} style={{ borderRadius: 8, padding: '8px 4px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit', ...(active ? { background: T.blue050, color: T.blueText, border: '1px solid #b6e4f8' } : { background: '#fff', color: T.muted, border: `1px solid ${T.line}` }) }}>{v / 1000} тис.</button>
          );
        })}
      </div>
      {over && (
        <p style={{ margin: '12px 0 0', display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: '10px 12px', fontSize: 13, background: T.yellow050, color: T.yellowText }}>
          <Info size={16} style={{ marginTop: 2, flexShrink: 0 }} />Наразі максимум — {uah(LOAN_MAX)}. Зменшіть суму, і ми одразу перерахуємо платіж.
        </p>
      )}
    </div>
  );
}

function TermField({ draft, onChange }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.ink }}>На який строк</p>
      <div style={{ marginTop: 8 }}>
        <Segmented options={LOAN_TERMS} value={draft.months} onChange={m => onChange({ months: m })} render={m => `${m} міс.`} />
      </div>
    </div>
  );
}

function ResultPanel({ draft }) {
  const { monthly, first, last } = draftFigures(draft);
  const over = draft.amount > LOAN_MAX;
  const row = (l, v, c = T.ink, bold = 700) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span style={{ color: T.muted, whiteSpace: 'nowrap' }}>{l}</span><span style={{ fontWeight: bold, color: c, textAlign: 'right' }}>{v}</span></div>
  );
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, padding: 20, background: 'linear-gradient(135deg,#e6f6fd 0%,#f4fbff 60%,#fffbea 100%)' }}>
      <span aria-hidden style={{ position: 'absolute', top: -40, right: -40, width: 128, height: 128, borderRadius: '50%', opacity: 0.6, background: 'radial-gradient(circle,#ffe06b 0%,transparent 65%)', pointerEvents: 'none' }} />
      <p style={{ position: 'relative', margin: 0, fontSize: 13, fontWeight: 700, color: T.blueText }}>Щомісячний платіж</p>
      <p style={{ position: 'relative', margin: '4px 0 0', fontSize: 38, lineHeight: 1, fontWeight: 800, letterSpacing: '-.01em', color: T.navy, opacity: over ? 0.35 : 1, transition: 'opacity .3s' }}>{uah(monthly)}</p>
      <div style={{ position: 'relative', marginTop: 16, display: 'grid', gap: 10, fontSize: 13 }}>
        {row('Переплата', '0 ₴', T.mintText, 800)}
        {row('Перший платіж', `до ${fmtDate(first)}`)}
        {row('Останній платіж', fmtMonth(last))}
      </div>
    </div>
  );
}

export function CalculatorCard({ draft, onChange, onApply, locked }) {
  const valid = draft.amount >= LOAN_MIN && draft.amount <= LOAN_MAX;
  return (
    <Card delay={120}>
      <CardTitle title="Калькулятор" caption="Спробуйте різні варіанти — це ні до чого не зобов'язує" />
      <div className="ks-grid-2" style={{ marginTop: 20, gridTemplateColumns: '1.15fr .85fr' }}>
        <div style={{ display: 'grid', alignContent: 'start', gap: 24 }}>
          <AmountField draft={draft} onChange={onChange} />
          <TermField draft={draft} onChange={onChange} />
        </div>
        <div style={{ display: 'grid', alignContent: 'space-between', gap: 16 }}>
          <ResultPanel draft={draft} />
          {locked ? (
            <p style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 16, padding: '12px 16px', fontSize: 13, lineHeight: 1.4, background: '#f1f4f8', color: '#4a5b71' }}>
              <Info size={16} style={{ marginTop: 2, flexShrink: 0, color: T.blue }} />{locked}
            </p>
          ) : (
            <PrimaryButton onClick={onApply} disabled={!valid}>Перейти до заявки <ArrowRight size={16} /></PrimaryButton>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ConditionsStrip() {
  return (
    <section className="ks-in" style={{ marginTop: 24, animationDelay: '90ms' }} aria-labelledby="loan-conditions">
      <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <h2 id="loan-conditions" style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1b1b1b', display: 'inline-block', borderBottom: `2px solid ${T.accent}`, paddingBottom: 3 }}>Що важливо знати</h2>
        <p style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: T.muted }}><Lock size={13} /> Лист із заявкою отримують лише колеги з HR, які ведуть програму</p>
      </div>
      <ul className="ks-grid-4" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {CONDITIONS.map((item, i) => {
          const Icon = COND_ICONS[i];
          return (
            <li key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderRadius: 12, background: '#fff', padding: 16, border: `1px solid ${T.cardLine}`, boxShadow: T.shadow }}>
              <IconBubble Icon={Icon} tone={i === 0 ? 'mint' : i === 2 ? 'yellow' : 'blue'} size={38} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.3, fontWeight: 800, color: T.ink }}>{item.title}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, lineHeight: 1.4, color: T.muted }}>{item.caption}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
