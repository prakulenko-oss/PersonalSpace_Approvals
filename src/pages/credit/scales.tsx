// @ts-nocheck
import { useEffect, useState } from 'react';
import standPng from '../../assets/credit/stand.png';
import beamPng from '../../assets/credit/beam.png';
import panPng from '../../assets/credit/pan.png';
import coinsPng from '../../assets/credit/coins.png';
import catSitPng from '../../assets/credit/cat-sit.png';
import catJumpPng from '../../assets/credit/cat-jump.png';

/**
 * Ваги прогресу погашення.
 * Ліва чаша — «Залишилось» (монетки поступово зникають),
 * права — «Сплачено» (котик і монетки, що переходять на ваш бік).
 * ratio: 0..1 — частка сплаченого. Коли 1 — ваги переважують у бік «Сплачено», котик стрибає.
 */
export type ScalesStyle = '3d' | 'vector';

const VB = { w: 440, h: 330 };
const P = { x: 220, y: 92 };
const L = 160;
const MAX_TILT = 12;
const DONE_TILT = 15;
const EASE = '1.4s cubic-bezier(.22,1,.36,1)';

function useAnimatedRatio(ratio) {
  const [shown, setShown] = useState(0);
  useEffect(() => { const id = window.setTimeout(() => setShown(ratio), 250); return () => window.clearTimeout(id); }, [ratio]);
  return shown;
}

function geometry(ratio) {
  const deg = ratio >= 1 ? DONE_TILT : -MAX_TILT + ratio * MAX_TILT * 2;
  const rad = (deg * Math.PI) / 180;
  const dx = L * Math.cos(rad), dy = L * Math.sin(rad);
  return { deg, left: { x: P.x - dx, y: P.y - dy }, right: { x: P.x + dx, y: P.y + dy } };
}
const move = (x, y) => ({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`, transition: `transform ${EASE}` });

/* ───────────── 3D (реальні ассети) ───────────── */
const PAN = { w: 124, h: 124 * (483 / 360), rim: 0.7 };

function Scales3D({ ratio, done }) {
  const g = geometry(ratio);
  const stand = { w: 150, h: 150 * (572 / 360) };
  const beam = { w: (2 * L) / 0.806, h: ((2 * L) / 0.806) * (143 / 640) };
  const coinsScale = 0.4 + 0.6 * (1 - ratio);
  const rim = PAN.h * PAN.rim;
  const cat = done ? { w: 92, h: 92 * (497 / 420), src: catJumpPng } : { w: 78, h: 78 * (563 / 420), src: catSitPng };

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }} role="img" aria-label={`Ваги: сплачено ${Math.round(ratio * 100)}%`}>
      <ellipse cx={P.x} cy={VB.h - 14} rx={110} ry={10} fill="rgba(0,63,125,.08)" />
      <g style={{ transform: `rotate(${g.deg}deg)`, transformOrigin: `${P.x}px ${P.y}px`, transformBox: 'view-box', transition: `transform ${EASE}` }}>
        <image href={beamPng} x={P.x - beam.w / 2} y={P.y - beam.h * 0.35} width={beam.w} height={beam.h} />
      </g>
      <image href={standPng} x={P.x - stand.w / 2} y={P.y - stand.h * 0.115} width={stand.w} height={stand.h} />
      {/* ліва чаша — залишилось */}
      <g style={move(g.left.x, g.left.y)}>
        <image href={panPng} x={-PAN.w / 2} y={-8} width={PAN.w} height={PAN.h} />
        <g style={{ transform: `translate(0px, ${rim - 2}px) scale(${coinsScale})`, opacity: ratio >= 1 ? 0 : 1, transition: `transform ${EASE}, opacity .8s ease` }}>
          <image href={coinsPng} x={-50} y={-72} width={100} height={72.5} />
        </g>
      </g>
      {/* права чаша — сплачено */}
      <g style={move(g.right.x, g.right.y)}>
        <image href={panPng} x={-PAN.w / 2} y={-8} width={PAN.w} height={PAN.h} />
        <g style={{ transform: `translate(30px, ${rim - 4}px) scale(${0.15 + 0.35 * ratio})`, opacity: ratio > 0.05 ? 1 : 0, transition: `transform ${EASE}, opacity .8s ease` }}>
          <image href={coinsPng} x={-50} y={-72} width={100} height={72.5} />
        </g>
        <g className={done ? 'ks-cat-jump' : 'ks-cat-breathe'} style={{ transformOrigin: `0px ${rim}px`, transformBox: 'view-box' }}>
          <image href={cat.src} x={-cat.w * 0.58} y={rim + 6 - cat.h} width={cat.w} height={cat.h} />
        </g>
      </g>
    </svg>
  );
}

/* ───────────── Вектор (SVG) ───────────── */
function Coin({ x, y, visible, delay = 0 }) {
  return (
    <g style={{ transform: `translate(${x}px, ${visible ? y : y - 14}px)`, opacity: visible ? 1 : 0, transition: `transform .6s cubic-bezier(.22,1,.36,1) ${delay}ms, opacity .5s ease ${delay}ms` }}>
      <rect x={-13} y={-3} width={26} height={7} rx={3.5} fill="#e0a800" />
      <ellipse cx={0} cy={-3} rx={13} ry={4.2} fill="#ffd100" />
      <ellipse cx={0} cy={-3} rx={7} ry={2} fill="none" stroke="#e0a800" strokeWidth={1.2} />
    </g>
  );
}
function VectorPan({ children }) {
  return (
    <g>
      <line x1={0} y1={0} x2={-54} y2={86} stroke="#003f7d" strokeWidth={2} strokeLinecap="round" />
      <line x1={0} y1={0} x2={54} y2={86} stroke="#003f7d" strokeWidth={2} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={86} stroke="#003f7d" strokeWidth={2} strokeLinecap="round" opacity={0.55} />
      <circle cx={0} cy={0} r={5.5} fill="none" stroke="#ffd100" strokeWidth={3.5} />
      {children}
      <path d="M-62 88 Q 0 136 62 88 Z" fill="url(#ks-pan)" />
      <ellipse cx={0} cy={88} rx={62} ry={7} fill="#ffffff" stroke="#d5eefa" strokeWidth={1.5} />
    </g>
  );
}
function VectorCat({ done }) {
  return (
    <g className={done ? 'ks-cat-jump' : 'ks-cat-breathe'} style={{ transformOrigin: '0px 92px', transformBox: 'view-box' }}>
      <path className="ks-cat-tail" d="M-20 84 q-24 2 -22 -20" fill="none" stroke="#003f7d" strokeWidth={8} strokeLinecap="round" style={{ transformOrigin: '-20px 84px', transformBox: 'view-box' }} />
      <ellipse cx={0} cy={64} rx={25} ry={27} fill="url(#ks-cat)" />
      <ellipse cx={0} cy={70} rx={12} ry={16} fill="#9adcf3" />
      {done ? (<><ellipse cx={-27} cy={30} rx={6} ry={8} fill="#0a4f92" transform="rotate(-25 -27 30)" /><ellipse cx={27} cy={30} rx={6} ry={8} fill="#0a4f92" transform="rotate(25 27 30)" /></>)
            : (<><ellipse cx={-9} cy={89} rx={8} ry={5} fill="#0a4f92" /><ellipse cx={9} cy={89} rx={8} ry={5} fill="#0a4f92" /></>)}
      <polygon points="-19,16 -21,-6 -4,8" fill="#003f7d" /><polygon points="19,16 21,-6 4,8" fill="#003f7d" />
      <polygon points="-17,13 -18,0 -8,8" fill="#ffb7c5" /><polygon points="17,13 18,0 8,8" fill="#ffb7c5" />
      <circle cx={0} cy={24} r={21} fill="url(#ks-cat)" />
      {done ? (<><path d="M-12 22 q4 -6 8 0" fill="none" stroke="#ffd100" strokeWidth={2.6} strokeLinecap="round" /><path d="M4 22 q4 -6 8 0" fill="none" stroke="#ffd100" strokeWidth={2.6} strokeLinecap="round" /></>)
            : (<><circle cx={-8} cy={22} r={4.2} fill="#ffd100" /><circle cx={8} cy={22} r={4.2} fill="#ffd100" /><circle cx={-7.5} cy={22.5} r={2} fill="#17203a" /><circle cx={8.5} cy={22.5} r={2} fill="#17203a" /></>)}
      <path d="M-1.8 28.5 h3.6 l-1.8 2.2 z" fill="#ffb7c5" />
      {done ? <path d="M-5 32 q5 6 10 0 z" fill="#ff8fa3" /> : <path d="M-5 32 q2.5 2.6 5 0 q2.5 2.6 5 0" fill="none" stroke="#9adcf3" strokeWidth={1.6} strokeLinecap="round" />}
      <rect x={-15} y={41} width={30} height={5} rx={2.5} fill="#ffd100" /><circle cx={0} cy={49} r={3.2} fill="#ffd100" />
      {done && (<g className="ks-sparkle"><circle cx={-38} cy={10} r={3} fill="#ffd100" /><circle cx={40} cy={4} r={3.5} fill="#00a0e3" /><circle cx={-30} cy={-8} r={2} fill="#34d399" /><circle cx={34} cy={-14} r={2.2} fill="#ffd100" /></g>)}
    </g>
  );
}
function ScalesVector({ ratio, done }) {
  const g = geometry(ratio);
  const leftSlots = [[-28, 84], [0, 84], [28, 84], [-28, 77], [0, 77], [28, 77], [-14, 70], [14, 70], [0, 63]];
  const rightSlots = [[36, 84], [36, 77], [36, 70], [36, 63], [36, 56], [36, 49]];
  const leftCoins = Math.ceil((1 - ratio) * leftSlots.length - 0.001);
  const rightCoins = Math.round(ratio * rightSlots.length);
  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }} role="img" aria-label={`Ваги: сплачено ${Math.round(ratio * 100)}%`}>
      <defs>
        <linearGradient id="ks-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4cc3f0" /><stop offset="100%" stopColor="#0086c3" /></linearGradient>
        <linearGradient id="ks-pan" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7fd6f5" /><stop offset="100%" stopColor="#00a0e3" /></linearGradient>
        <linearGradient id="ks-col" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0a4f92" /><stop offset="100%" stopColor="#003f7d" /></linearGradient>
        <radialGradient id="ks-cat" cx="0.38" cy="0.32" r="0.8"><stop offset="0%" stopColor="#1d5fa3" /><stop offset="100%" stopColor="#003f7d" /></radialGradient>
        <radialGradient id="ks-ball" cx="0.35" cy="0.3" r="0.8"><stop offset="0%" stopColor="#fff1a6" /><stop offset="100%" stopColor="#ffc400" /></radialGradient>
      </defs>
      <ellipse cx={P.x} cy={VB.h - 14} rx={110} ry={10} fill="rgba(0,63,125,.08)" />
      <rect x={P.x - 9} y={P.y} width={18} height={VB.h - 40 - P.y} rx={9} fill="url(#ks-col)" />
      <rect x={P.x - 70} y={VB.h - 44} width={140} height={22} rx={11} fill="url(#ks-pan)" />
      <rect x={P.x - 52} y={VB.h - 52} width={104} height={12} rx={6} fill="#7fd6f5" />
      <g style={{ transform: `rotate(${g.deg}deg)`, transformOrigin: `${P.x}px ${P.y}px`, transformBox: 'view-box', transition: `transform ${EASE}` }}>
        <rect x={P.x - L - 8} y={P.y - 6} width={2 * L + 16} height={12} rx={6} fill="url(#ks-beam)" />
        <circle cx={P.x - L} cy={P.y} r={7} fill="url(#ks-ball)" /><circle cx={P.x + L} cy={P.y} r={7} fill="url(#ks-ball)" />
      </g>
      <circle cx={P.x} cy={P.y} r={14} fill="url(#ks-ball)" />
      <g style={move(g.left.x, g.left.y)}><VectorPan>{leftSlots.map(([x, y], i) => <Coin key={i} x={x} y={y} visible={i < leftCoins} delay={(leftSlots.length - i) * 40} />)}</VectorPan></g>
      <g style={move(g.right.x, g.right.y)}><VectorPan>{rightSlots.map(([x, y], i) => <Coin key={i} x={x} y={y} visible={i < rightCoins} delay={300 + i * 80} />)}<g transform="translate(-6 -4)"><VectorCat done={done} /></g></VectorPan></g>
    </svg>
  );
}

export function LoanScales({ ratio, done, look }: { ratio: number; done: boolean; look: ScalesStyle }) {
  const shown = useAnimatedRatio(ratio);
  return look === '3d' ? <Scales3D ratio={shown} done={done} /> : <ScalesVector ratio={shown} done={done} />;
}
