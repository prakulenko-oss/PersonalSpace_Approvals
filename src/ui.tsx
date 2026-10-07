import { useState } from 'react';
import type { ReactNode, MouseEvent } from 'react';
import type { Exec, System } from './types';
import { XCLS, XTYPES } from './model';

export const ExecChip = ({ x, onClick, drag, from, del }: {
  x: Exec;
  onClick?: (e: MouseEvent) => void;
  drag?: boolean;
  from?: string;
  del?: (e: MouseEvent) => void;
}) => (
  <span
    className={`chip ${XCLS[x.type]}${drag ? ' xchip' : ''}`}
    title={XTYPES[x.type]}
    onClick={onClick}
    {...(drag ? { 'data-drag': 'exec', 'data-pid': x.id, 'data-from': from || undefined } : {})}
  >
    {x.name}
    {del && <span className="xdel" data-x="1" title="Прибрати виконавця" onClick={del}> ×</span>}
  </span>
);

export const SysBadges = ({ s }: { s: System }) => (
  <>
    {s.sox && <span className="chip c-sox">SOX</span>}
    {s.saas && <span className="chip c-sox">SaaS</span>}
    {s.status === 'sunset' && <span className="chip c-sun">вивід</span>}
    {s.support === 'it_partner' && s.partner && <span className="chip c-mut">{s.partner}</span>}
    {s.support === 'vendor' && <span className="chip c-mut">вендор</span>}
    {s.support === 'business' && <span className="chip c-biz">бізнес</span>}
  </>
);

export const Bar = ({ pct }: { pct: number }) => (
  <div className="bar" style={{ flex: 1 }}><i style={{ width: `${pct}%` }} /></div>
);

export const Fld = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="fld"><label>{label}</label>{children}</div>
);

export const Modal = ({ onClose, children }: { onClose: () => void; children: ReactNode }) => (
  <div id="overlay" className="open"
       onMouseDown={(e) => { if ((e.target as HTMLElement).id === 'overlay') onClose(); }}>
    <div id="modal" className="modal" role="dialog" aria-modal="true">{children}</div>
  </div>
);

/** Кнопка з двокроковим підтвердженням. */
export const ArmButton = ({ label, confirmLabel, className, onConfirm }: {
  label: string; confirmLabel: string; className?: string; onConfirm: () => void;
}) => {
  const [armed, setArmed] = useState(false);
  return (
    <button type="button" className={className || 'ghost danger'}
      onClick={() => (armed ? onConfirm() : setArmed(true))}>
      {armed ? confirmLabel : label}
    </button>
  );
};
