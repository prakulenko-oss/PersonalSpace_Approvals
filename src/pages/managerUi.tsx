import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, User, X, Mail } from 'lucide-react';

/* Спільні UI-примітиви для сторінок Простору Менеджера */

export const S: Record<string, CSSProperties> = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  body: { display: 'flex', flex: 1, minHeight: 0 },
  main: { flex: 1, minWidth: 0, overflowY: 'auto', padding: '20px 24px', backgroundColor: '#fff' },
  rightBar: { width: '350px', flexShrink: 0, overflowY: 'auto', padding: '20px 20px 20px 0', display: 'flex', flexDirection: 'column', gap: '18px' },
  card: { backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #b9d3f0', boxShadow: '0 1px 3px rgba(15,60,120,0.06)' },
  modalBackdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  input: { width: '100%', padding: '9px 13px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fff', color: '#111827' },
  label: { display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#1f2937', marginBottom: '6px' },
  btnGhost: { padding: '9px 22px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' },
  btnPrimary: { padding: '9px 26px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnLink: { backgroundColor: 'transparent', border: 'none', color: '#2563eb', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 4px' },
  modalTitleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 26px 0' },
  modalTitle: { fontSize: '19px', fontWeight: 600, color: '#111827' },
};

/* Хук: чи вузький екран (мобільний) */
export const useIsMobile = (breakpoint = 760) => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
};

export const Toast = ({ message }: { message: string }) => (
  <div style={{
    position: 'fixed', top: 70, right: 20, backgroundColor: '#10b981', color: '#fff',
    padding: '14px 22px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    zIndex: 1000, maxWidth: '400px', fontSize: '14px', fontWeight: 500,
  }}>
    {message}
  </div>
);

/* Модалка: закриття по Esc + повернення фокуса на елемент, що відкрив */
export const ModalShell = ({ children, maxWidth, onClose }: { children: ReactNode; maxWidth: number; onClose: () => void }) => {
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    opener.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener.current?.focus?.();
    };
  }, [onClose]);
  return (
    <div style={S.modalBackdrop} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxWidth, width: '100%', maxHeight: '92vh', overflowY: 'auto', animation: 'mp-modal-in 0.18s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

/* Шторка справа з анімацією виїзду; Esc закриває */
export const Drawer = ({ children, width = 500, onClose }: { children: ReactNode; width?: number; onClose: () => void }) => {
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    opener.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener.current?.focus?.();
    };
  }, [onClose]);
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,30,60,0.18)', zIndex: 140, animation: 'mp-fade-in 0.18s ease' }} />
      <aside
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: `${width}px`, maxWidth: '92vw',
          backgroundColor: '#fff', zIndex: 150, display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 28px rgba(15,40,80,0.16)', borderLeft: '1px solid #e5e7eb',
          animation: 'mp-drawer-in 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {children}
      </aside>
    </>
  );
};

/* Успіх: лист надіслано (за прикладом бізнесу) */
export const SuccessModal = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <ModalShell maxWidth={380} onClose={onClose}>
    <div style={{ padding: '16px 28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onClose} aria-label="Закрити" style={{ padding: '4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', padding: '8px 8px 0' }}>
        <Mail size={64} color="#5aa9e6" strokeWidth={1.6} />
        <div style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.5 }}>{title}</div>
      </div>
    </div>
  </ModalShell>
);

export const RightBlockHeader = ({ icon, title, open, onToggle }: { icon: ReactNode; title: string; open: boolean; onToggle: () => void }) => (
  <div
    onClick={onToggle}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      {icon}
      <span style={{ fontWeight: 600, fontSize: '16px', color: '#1b1b1b', borderBottom: '2px solid #2f6fde', paddingBottom: '3px' }}>{title}</span>
    </div>
    {open ? <ChevronUp size={18} color="#2f6fde" /> : <ChevronDown size={18} color="#2f6fde" />}
  </div>
);

export const Avatar = ({ emp, size = 36 }: { emp: { initials?: string; avatarColor?: string }; size?: number }) => (
  emp.initials
    ? <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: emp.avatarColor || '#6b7280', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.34, flexShrink: 0 }}>{emp.initials}</div>
    : <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={size * 0.5} color="#9ca3af" /></div>
);

export const sectionTitleStyle: CSSProperties = { fontWeight: 600, fontSize: '17px', color: '#1b1b1b', borderBottom: '2px solid #2f6fde', paddingBottom: '3px' };

/* Глобальні keyframes для анімацій (інжектуються один раз) */
export const AnimStyles = () => (
  <style>{`
    @keyframes mp-modal-in { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: none; } }
    @keyframes mp-drawer-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes mp-fade-in { from { opacity: 0; } to { opacity: 1; } }
  `}</style>
);
