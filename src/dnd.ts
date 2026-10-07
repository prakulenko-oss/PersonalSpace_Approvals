import type { AppState } from './types';
import { dispState, getCell } from './model';

export interface DndCallbacks {
  getState: () => AppState;
  onAssignPerson: (pid: string, sysId: string, roleId: string, fromKey: string | null) => void;
  onAssignExec: (xid: string, sysId: string, roleId: string, fromKey: string | null) => void;
  onPickRole: (kind: 'person' | 'exec', id: string, sysId: string, fromKey: string | null) => void;
  onMoveSystem: (sysId: string, unit: string, x: number, y: number, sectionEl: HTMLElement) => void;
}

interface DragCtx {
  kind: 'person' | 'exec' | 'sys';
  el: HTMLElement;
  id: string;
  from: string;
  sys: string;
  x0: number;
  y0: number;
  started: boolean;
  ptype: string;
  ghost?: HTMLElement;
}

/** Pointer-based drag&drop (миша + тач). Повертає cleanup. */
export function initDnd(cb: DndCallbacks): () => void {
  let dnd: DragCtx | null = null;

  const clearOver = () =>
    document.querySelectorAll('.dropover').forEach((el) => el.classList.remove('dropover'));

  const cleanup = () => {
    dnd?.ghost?.remove();
    document.body.classList.remove('dragging');
    clearOver();
    dnd = null;
  };

  const roleDroppable = (card: HTMLElement | null, row: HTMLElement | null): boolean => {
    if (!card || !row || !row.dataset.role) return false;
    const c = getCell(cb.getState(), card.dataset.sys!, row.dataset.role);
    return dispState(c) !== 'na';
  };

  const down = (e: PointerEvent) => {
    const h = (e.target as HTMLElement).closest<HTMLElement>('[data-drag]');
    if (!h) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-x]')) return;
    dnd = {
      kind: h.dataset.drag as DragCtx['kind'],
      el: h,
      id: h.dataset.pid || '',
      from: h.dataset.from || '',
      sys: h.dataset.sys || '',
      x0: e.clientX, y0: e.clientY,
      started: false,
      ptype: e.pointerType,
    };
  };

  const move = (e: PointerEvent) => {
    if (!dnd) return;
    const dx = e.clientX - dnd.x0;
    const dy = e.clientY - dnd.y0;
    if (!dnd.started) {
      const start = dnd.ptype === 'touch' && dnd.kind !== 'sys'
        ? Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)
        : Math.hypot(dx, dy) > 5;
      if (!start) return;
      dnd.started = true;
      document.body.classList.add('dragging');
      const g = dnd.el.cloneNode(true) as HTMLElement;
      g.id = 'ghost';
      g.style.width = `${dnd.el.offsetWidth}px`;
      document.body.appendChild(g);
      dnd.ghost = g;
    }
    e.preventDefault();
    if (dnd.ghost) dnd.ghost.style.transform = `translate(${e.clientX + 8}px, ${e.clientY + 8}px)`;
    clearOver();
    const hit = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!hit) return;
    if (dnd.kind === 'sys') {
      const sec = hit.closest<HTMLElement>('.usec');
      if (sec) sec.classList.add('dropover');
    } else {
      const row = hit.closest<HTMLElement>('.rrow');
      const card = hit.closest<HTMLElement>('.sys-card');
      if (roleDroppable(card, row)) row!.classList.add('dropover');
      else if (card) card.classList.add('dropover');
    }
  };

  const up = (e: PointerEvent) => {
    if (!dnd) return;
    if (!dnd.started) { dnd = null; return; }
    (window as unknown as { __justDragged?: boolean }).__justDragged = true;
    const hit = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const d = dnd;
    cleanup();
    if (!hit) return;
    if (d.kind === 'sys') {
      const sec = hit.closest<HTMLElement>('.usec');
      if (sec && sec.dataset.unit) cb.onMoveSystem(d.sys, sec.dataset.unit, e.clientX, e.clientY, sec);
      return;
    }
    const row = hit.closest<HTMLElement>('.rrow');
    const card = hit.closest<HTMLElement>('.sys-card');
    if (roleDroppable(card, row)) {
      const fn = d.kind === 'exec' ? cb.onAssignExec : cb.onAssignPerson;
      fn(d.id, card!.dataset.sys!, row!.dataset.role!, d.from || null);
    } else if (card) {
      cb.onPickRole(d.kind as 'person' | 'exec', d.id, card.dataset.sys!, d.from || null);
    }
  };

  document.addEventListener('pointerdown', down);
  document.addEventListener('pointermove', move, { passive: false });
  document.addEventListener('pointerup', up);
  document.addEventListener('pointercancel', cleanup);
  return () => {
    document.removeEventListener('pointerdown', down);
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointercancel', cleanup);
    cleanup();
  };
}

/** Проковтнути синтетичний click одразу після drag. */
export function consumeDragClick(): boolean {
  const w = window as unknown as { __justDragged?: boolean };
  if (w.__justDragged) { w.__justDragged = false; return true; }
  return false;
}
