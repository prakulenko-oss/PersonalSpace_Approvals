const P = ({ d, sz }: { d: string; sz?: number }) => (
  <svg viewBox="0 0 24 24" width={sz} height={sz} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
export const IcHome = () => <P d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-5v-6h-4v6H5a1 1 0 01-1-1z" />;
export const IcMap = () => <P d="M9 20l-5.5-2.2V5.3L9 7.5l6-2.8 5.5 2.2v12.5L15 17.2l-6 2.8zM9 7.5v12.5M15 4.7v12.5" />;
export const IcChart = () => <P d="M4 19h16M6 16v-5m4 5V8m4 8v-3m4 3V6" />;
export const IcDoc = () => <P d="M7 3h7l4 4v14H7zM14 3v4h4M10 12h5m-5 4h5" />;
export const IcLayers = () => <P d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />;
export const IcPeople = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5S13.9 16 14.5 19M16 5.5a3 3 0 010 5.5M17.5 14.8c1.7.6 2.7 1.9 3 4.2" />
  </svg>
);
export const IcOrg = () => <P d="M4 21V8l6-4v17M10 21V10l6-3v14m0 0h4V11l-4-1.5M7 9h.01M7 13h.01M7 17h.01M13 12h.01M13 16h.01" />;
export const IcList = () => <P d="M4 7h16M4 12h10M4 17h7" />;
export const IcGear = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.4m0 13.6v2.4M4.9 4.9l1.7 1.7m10.8 10.8l1.7 1.7M2.8 12h2.4m13.6 0h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
  </svg>
);
export const IcCollapse = () => <P d="M11 7l-5 5 5 5m7-10l-5 5 5 5" />;
export const IcArrowUR = ({ sz = 15 }: { sz?: number }) => <P sz={sz} d="M7 17L17 7M9 7h8v8" />;
export const IcArrowL = ({ sz = 15 }: { sz?: number }) => <P sz={sz} d="M19 12H5m6-6l-6 6 6 6" />;
export const IcAlert = ({ sz = 17 }: { sz?: number }) => <P sz={sz} d="M12 4L2.5 20h19L12 4zm0 7v4m0 3h.01" />;
export const IcShield = ({ sz = 17 }: { sz?: number }) => <P sz={sz} d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" />;
export const IcShieldOk = ({ sz = 15 }: { sz?: number }) => <P sz={sz} d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3zM9 12l2 2 4-4" />;
export const IcHelp = ({ sz = 17 }: { sz?: number }) => (
  <svg viewBox="0 0 24 24" width={sz} height={sz} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <circle cx="12" cy="12" r="9" /><path d="M9.5 9.3a2.6 2.6 0 115 .9c-.6 1-1.7 1.3-2.1 2.3-.1.3-.1.6-.1 1m0 3h.01" />
  </svg>
);
export const IcJson = ({ sz = 17 }: { sz?: number }) => <P sz={sz} d="M7 3h7l4 4v14H7zM14 3v4h4M10 13l-1.5 2L10 17m4-4l1.5 2L14 17" />;
export const IcChevR = ({ sz = 15 }: { sz?: number }) => <P sz={sz} d="M9 6l6 6-6 6" />;
export const IcPencil = ({ sz = 14 }: { sz?: number }) => <P sz={sz} d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z" />;
export const IcInfo = ({ sz = 14 }: { sz?: number }) => (
  <svg viewBox="0 0 24 24" width={sz} height={sz} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" />
  </svg>
);
export const IcNet = ({ sz = 30 }: { sz?: number }) => (
  <svg viewBox="0 0 24 24" width={sz} height={sz} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
    <circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="18" r="2.5" /><circle cx="19" cy="18" r="2.5" />
    <path d="M10.8 7.2L6.3 15.8M13.2 7.2l4.5 8.6M7.5 18h9" />
  </svg>
);
