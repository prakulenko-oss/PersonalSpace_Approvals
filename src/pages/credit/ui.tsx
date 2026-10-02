// @ts-nocheck
import { useMemo, useState } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';
import { STAGES } from './loanData';

/* ───────── Токени (як у референсі, київстарівська гама) ───────── */
export const T = {
  blue: '#00A0E3', blue600: '#0086c3', blue050: '#e6f6fd', blueText: '#0072a8',
  navy: '#003f7d', yellow: '#ffd100', yellow050: '#fff8dd', yellowText: '#8a6a00',
  mint: '#34d399', mint050: '#e7faf1', mintText: '#0f8f5f',
  ink: '#17203a', muted: '#6b7a90', canvas: '#f6f9fc', line: '#e6edf4',
  shadow: '0 6px 24px rgba(0,63,125,.06)', shadowLg: '0 14px 40px rgba(0,63,125,.1)',
};

export type Tone = 'mint' | 'yellow' | 'blue' | 'grey';
export const TONE: Record<Tone, { bg: string; fg: string; bar: string; soft: string }> = {
  mint: { bg: T.mint050, fg: T.mintText, bar: T.mint, soft: '#f2fcf7' },
  yellow: { bg: T.yellow050, fg: T.yellowText, bar: T.yellow, soft: '#fffdf2' },
  blue: { bg: T.blue050, fg: T.blueText, bar: T.blue, soft: '#f4fbff' },
  grey: { bg: '#f1f4f8', fg: '#6b7a90', bar: '#c4cedb', soft: '#f8fafc' },
};

/* ───────── Глобальні анімації (інжектуються раз) ───────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap');
  .ks-credit * { font-family: 'Onest', 'Segoe UI', system-ui, sans-serif !important; box-sizing: border-box; }
  @keyframes ks-fade-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .ks-in { opacity:0; animation: ks-fade-up .55s cubic-bezier(.22,1,.36,1) forwards; }
  @keyframes ks-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  .ks-float { animation: ks-float 6s ease-in-out infinite; }
  @keyframes ks-float-b { 0%,100%{transform:translate3d(0,0,0) rotate(0)} 50%{transform:translate3d(0,-16px,0) rotate(-4deg)} }
  @keyframes ks-float-c { 0%,100%{transform:translate3d(0,0,0) rotate(0)} 50%{transform:translate3d(6px,12px,0) rotate(5deg)} }
  .ks-float-b { animation: ks-float-b 7.5s ease-in-out infinite; } .ks-float-c { animation: ks-float-c 9s ease-in-out infinite; }
  .ks-d1{animation-delay:-1.2s} .ks-d2{animation-delay:-2.6s} .ks-d3{animation-delay:-4s}
  .ks-range{-webkit-appearance:none;appearance:none;height:8px;border-radius:999px;background:linear-gradient(90deg,#00A0E3 0%,#00A0E3 var(--fill),#e6edf4 var(--fill),#e6edf4 100%);outline:none;cursor:pointer;width:100%}
  .ks-range::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:#fff;border:6px solid #00A0E3;box-shadow:0 4px 12px rgba(0,160,227,.35);transition:transform .15s}
  .ks-range::-webkit-slider-thumb:hover{transform:scale(1.12)}
  .ks-range::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#fff;border:6px solid #00A0E3;box-shadow:0 4px 12px rgba(0,160,227,.35)}
  @keyframes ks-pulse-ring { 0%{box-shadow:0 0 0 0 rgba(0,160,227,.35)} 70%{box-shadow:0 0 0 12px rgba(0,160,227,0)} 100%{box-shadow:0 0 0 0 rgba(0,160,227,0)} }
  .ks-pulse-ring{animation:ks-pulse-ring 2.2s ease-out infinite}
  @keyframes ks-shimmer { 0%,100%{opacity:.75} 50%{opacity:1} } .ks-shimmer{animation:ks-shimmer 1.8s ease-in-out infinite}
  @keyframes ks-confetti { 0%{transform:translateY(-20px) rotate(0);opacity:0} 10%{opacity:1} 100%{transform:translateY(380px) rotate(540deg);opacity:0} }
  .ks-confetti{position:absolute;top:0;display:block;border-radius:3px;animation:ks-confetti 3s ease-in infinite}
  @keyframes ks-cat-breathe { 0%,100%{transform:scale(1,1)} 50%{transform:scale(1.025,.975)} }
  .ks-cat-breathe{animation:ks-cat-breathe 3.2s ease-in-out infinite}
  @keyframes ks-cat-jump { 0%,100%{transform:translateY(0) scale(1,1)} 12%{transform:translateY(0) scale(1.08,.9)} 32%{transform:translateY(-46px) scale(.96,1.06)} 50%{transform:translateY(-52px) scale(1,1)} 70%{transform:translateY(0) scale(1.06,.93)} 82%{transform:translateY(-10px) scale(1,1)} 92%{transform:translateY(0) scale(1,1)} }
  .ks-cat-jump{animation:ks-cat-jump 1.6s cubic-bezier(.3,.7,.4,1) 1.2s infinite}
  @keyframes ks-cat-tail { 0%,100%{transform:rotate(0)} 50%{transform:rotate(-16deg)} } .ks-cat-tail{animation:ks-cat-tail 2.4s ease-in-out infinite}
  @keyframes ks-sparkle { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.15)} }
  .ks-sparkle{transform-box:fill-box;transform-origin:center;animation:ks-sparkle 1.6s ease-in-out infinite}
  .ks-grid-2{display:grid;grid-template-columns:1.6fr 1fr;gap:20px;align-items:start}
  .ks-grid-2b{display:grid;grid-template-columns:1fr 1.4fr;gap:20px;align-items:start}
  .ks-grid-2c{display:grid;grid-template-columns:1fr 1.35fr;gap:20px;align-items:stretch}
  .ks-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .ks-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .ks-hero-grid{display:grid;grid-template-columns:1.12fr .88fr;gap:24px;align-items:center}
  .ks-tl{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:0}
  @media(max-width:960px){ .ks-grid-2,.ks-grid-2b,.ks-grid-2c,.ks-grid-3,.ks-hero-grid{grid-template-columns:1fr!important} .ks-grid-4{grid-template-columns:repeat(2,1fr)!important} .ks-hero-art{display:none!important} .ks-tl{grid-auto-flow:row} }
  @media(prefers-reduced-motion:reduce){ .ks-in{opacity:1;animation:none} .ks-float,.ks-float-b,.ks-float-c,.ks-cat-breathe,.ks-cat-jump,.ks-cat-tail,.ks-sparkle,.ks-pulse-ring,.ks-shimmer{animation:none!important} .ks-confetti{display:none} }
`;
if (typeof document !== 'undefined' && !document.getElementById('ks-credit-css')) {
  const s = document.createElement('style'); s.id = 'ks-credit-css'; s.textContent = CSS; document.head.appendChild(s);
}

/* ───────── Атоми ───────── */
export const Card = ({ children, delay = 0, style, className = '' }) => (
  <section className={`ks-in ${className}`} style={{ borderRadius: 20, background: '#fff', padding: 24, border: `1px solid ${T.line}`, boxShadow: T.shadow, animationDelay: `${delay}ms`, ...style }}>
    {children}
  </section>
);

export const CardTitle = ({ title, caption, aside }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.navy }}>{title}</h2>
      {caption && <p style={{ margin: '4px 0 0', fontSize: 13, color: T.muted }}>{caption}</p>}
    </div>
    {aside}
  </div>
);

export const IconBubble = ({ Icon, tone, size = 40 }) => {
  const s = TONE[tone];
  return (
    <span style={{ display: 'inline-flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: size, height: size, background: s.bg, color: s.fg }}>
      <Icon size={size * 0.48} strokeWidth={2.1} />
    </span>
  );
};

export const Pill = ({ children, tone, bold = false }) => {
  const s = TONE[tone];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: bold ? 700 : 600, background: s.bg, color: s.fg, whiteSpace: 'nowrap' }}>{children}</span>;
};

export const PrimaryButton = ({ children, onClick, disabled = false, type = 'button', full = false }) => (
  <button type={type} onClick={onClick} disabled={disabled} style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, padding: '10px 20px', fontSize: 14, fontWeight: 700, color: '#fff', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, width: full ? '100%' : undefined,
    background: T.blue, boxShadow: disabled ? 'none' : '0 8px 20px rgba(0,160,227,.28)', transition: 'opacity .2s', fontFamily: 'inherit',
  }}>{children}</button>
);

export const GhostButton = ({ children, onClick, full = false }) => (
  <button type="button" onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, background: '#fff', padding: '10px 16px', fontSize: 14, fontWeight: 700, border: `1px solid ${T.line}`, color: T.navy, cursor: 'pointer', fontFamily: 'inherit', width: full ? '100%' : undefined }}>{children}</button>
);

export const Chip = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} aria-pressed={active} style={{
    borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
    ...(active ? { background: T.blue050, color: T.blueText, border: '1px solid #b6e4f8' } : { background: '#fff', color: T.muted, border: `1px solid ${T.line}` }),
  }}>{children}</button>
);

export const Segmented = ({ options, value, onChange, render }) => (
  <div style={{ display: 'grid', gap: 4, borderRadius: 999, padding: 4, background: '#f1f4f8', gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
    {options.map(o => {
      const active = o === value;
      return (
        <button key={String(o)} type="button" onClick={() => onChange(o)} aria-pressed={active} style={{
          borderRadius: 999, padding: '8px 12px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
          ...(active ? { background: '#fff', color: T.navy, boxShadow: '0 3px 10px rgba(0,63,125,.1)' } : { background: 'transparent', color: T.muted }),
        }}>{render(o)}</button>
      );
    })}
  </div>
);

export const StageSwitch = ({ stage, onChange }) => (
  <div className="ks-in" style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, borderRadius: 16, background: 'rgba(255,255,255,.7)', padding: '12px 16px', border: '1px dashed #c9d6e4', animationDelay: '80ms' }}>
    <span style={{ marginRight: 4, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: T.muted }}><Sparkles size={14} /> Демо-стан</span>
    {STAGES.filter(s => !s.archive).map(s => <Chip key={s.key} active={stage === s.key} onClick={() => onChange(s.key)}>{s.label}</Chip>)}
    <span style={{ margin: '0 4px', height: 20, width: 1, background: '#d5dfea' }} aria-hidden />
    <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: '#9aa8ba' }}>Архів</span>
    {STAGES.filter(s => s.archive).map(s => (
      <button key={s.key} type="button" onClick={() => onChange(s.key)} aria-pressed={stage === s.key} style={{
        borderRadius: 999, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        ...(stage === s.key ? { background: '#eef2f7', color: T.ink, border: '1px solid #c9d6e4' } : { background: 'transparent', color: '#9aa8ba', border: '1px dashed #d5dfea' }),
      }}>{s.label}</button>
    ))}
  </div>
);

export const CopyValue = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(value); } catch { /* noop */ } setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: `1px solid ${T.line}` }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 12, color: T.muted }}>{label}</p>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: T.ink, wordBreak: 'break-word' }}>{value}</p>
      </div>
      <button type="button" onClick={copy} aria-label={`Скопіювати: ${label}`} style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, flexShrink: 0, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: copied ? T.mintText : T.muted }}>
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
    </div>
  );
};

/** Демонстраційний QR — не сканується, лише візуал */
export const QrDemo = ({ seed, size = 140 }) => {
  const N = 25, cell = 100 / N;
  const cells = useMemo(() => {
    let st = seed * 9301 + 49297; const rnd = () => { st = (st * 9301 + 49297) % 233280; return st / 233280; };
    const out = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const inF = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      const inLogo = x >= 10 && x <= 14 && y >= 10 && y <= 14;
      if (!inF && !inLogo && rnd() > 0.55) out.push([x, y]);
    }
    return out;
  }, [seed]);
  const finder = (x, y) => (
    <g key={`f${x}-${y}`}>
      <rect x={x * cell} y={y * cell} width={cell * 7} height={cell * 7} rx={2.2} fill={T.navy} />
      <rect x={(x + 1) * cell} y={(y + 1) * cell} width={cell * 5} height={cell * 5} rx={1.4} fill="#fff" />
      <rect x={(x + 2) * cell} y={(y + 2) * cell} width={cell * 3} height={cell * 3} rx={1} fill={T.blue} />
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }} role="img" aria-label="QR-код для оплати">
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x * cell + 0.3} y={y * cell + 0.3} width={cell - 0.6} height={cell - 0.6} rx={0.9} fill={T.navy} />)}
      {finder(0, 0)}{finder(N - 7, 0)}{finder(0, N - 7)}
      <rect x={40} y={40} width={20} height={20} rx={6} fill={T.yellow} />
      <text x={50} y={54.5} textAnchor="middle" fontSize={11} fontWeight={800} fill={T.navy}>₴</text>
    </svg>
  );
};

/* Горизонтальний таймлайн (історія/поточна заявка) */
export type TimelineStep = { label: string; date?: string; state: 'done' | 'current' | 'next' };
export const Timeline = ({ steps }: { steps: TimelineStep[] }) => (
  <ol className="ks-tl" style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}>
    {steps.map((step, i) => {
      const done = step.state === 'done', cur = step.state === 'current', last = i === steps.length - 1;
      return (
        <li key={step.label} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 12, paddingBottom: 8 }}>
          {!last && <span aria-hidden style={{ position: 'absolute', top: 13, left: 28, right: 0, height: 2, background: done ? T.mint : '#e3e9f1' }} />}
          <span className={cur ? 'ks-pulse-ring' : ''} style={{ position: 'relative', zIndex: 1, display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: '50%', flexShrink: 0, ...(done ? { background: T.mint, color: '#fff' } : cur ? { background: T.blue, color: '#fff' } : { background: '#fff', border: '2px solid #dbe3ee' }) }}>
            {done ? <Check size={15} strokeWidth={3} /> : cur ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} /> : null}
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13.5, lineHeight: 1.3, fontWeight: 700, color: step.state === 'next' ? T.muted : T.ink }}>{step.label}</span>
            {step.date && <span style={{ display: 'block', fontSize: 12, color: cur ? T.blueText : T.muted }}>{step.date}</span>}
          </span>
        </li>
      );
    })}
  </ol>
);
