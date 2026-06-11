// @ts-nocheck
/* Пам'ятка по вибору банку — прототип, перенесений з окремого проєкту.
   Типізація вимкнена (@ts-nocheck), бо компонент написаний як JSX без типів. */
   import { useState, useEffect, useRef } from 'react';
   import { TopBar } from '../components/TopBar';
   import {
     tokens,
     Button,
     Card,
     CardHeader,
     MessageBar,
     MessageBarBody,
     MessageBarTitle,
     Persona,
     makeStyles,
     mergeClasses,
     Body1,
     Caption1,
     Subtitle2,
     Divider,
   } from '@fluentui/react-components';
   import {
     CreditCardPerson24Regular,
     Globe24Regular,
     ChevronDown24Regular,
     ArrowRight16Regular,
     DocumentText24Regular,
     Chat24Regular,
     Phone24Regular,
     Clock24Regular,
     Calendar24Regular,
     Mail24Regular,
     Open16Regular,
     CheckmarkCircle24Regular,
     PersonCircle24Regular,
     WalletCreditCard24Regular,
     PersonEdit24Regular,
   } from '@fluentui/react-icons';
   
   const GLOBAL_CSS = `
     @import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap');
     .ks-app * { font-family: 'Onest', sans-serif !important; }
     .app-header-scrolled { box-shadow: 0 4px 24px rgba(0,43,92,0.07) !important; background: rgba(255,255,255,0.98) !important; }
     .hero-dot-grid::before { content:''; position:absolute; inset:0; background-image:radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px); background-size:32px 32px; pointer-events:none; z-index:1; }
     .hero-dot-grid::after { display: none; }
     @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-10px) rotate(0.5deg)} 50%{transform:translateY(-18px) rotate(0deg)} 75%{transform:translateY(-8px) rotate(-0.5deg)} }
     @keyframes floatMed  { 0%,100%{transform:translateY(0) rotate(0deg)} 30%{transform:translateY(-14px) rotate(-0.5deg)} 60%{transform:translateY(-6px) rotate(0.5deg)} }
     @keyframes floatFast { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-20px)} 70%{transform:translateY(-8px)} }
     .float-1{animation:floatSlow 5s ease-in-out infinite}
     .float-2{animation:floatMed 4.2s ease-in-out infinite 0.8s}
     .float-3{animation:floatFast 6s ease-in-out infinite 1.5s}
     @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
     .fade-up{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both}
     .fade-up-d1{animation-delay:0.05s} .fade-up-d2{animation-delay:0.12s}
     @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
     .slide-in{animation:slideIn 0.35s cubic-bezier(0.33,1,0.68,1)}
     .step-content-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows 0.4s cubic-bezier(0.33,1,0.68,1)}
     .step-content-wrap.open{grid-template-rows:1fr}
     .step-content-inner{overflow:hidden}
     .contact-row{display:flex;justify-content:space-between;align-items:center;padding:11px 4px;border-bottom:1px solid #EEF1F6;font-size:14px;transition:all 0.2s ease}
     .contact-row:last-child{border-bottom:none}
     .contact-row:hover{background:#F0F9FF;padding-left:10px;padding-right:10px;margin-left:-6px;margin-right:-6px;border-radius:8px}
     .manager-highlight{display:flex;gap:14px;align-items:flex-start;padding:16px 18px;border-radius:12px;background:#E8F6FD;border:1px solid rgba(0,160,227,0.2);margin-bottom:16px;animation:slideIn 0.35s ease}
     .pres-btn{transition:all 0.2s ease!important}
     .pres-btn:hover{background-color:#E8F6FD!important}
     @media(max-width:1024px){
       .hero-content-row{flex-direction:column!important;text-align:center;gap:24px!important;padding-bottom:32px!important}
       .hero-floats{display:none!important}
       .hero-title-el{font-size:28px!important}
       .bank-grid-3{grid-template-columns:1fr!important}
       .timeline-grid-2{grid-template-columns:1fr!important}
       .request-flex{flex-direction:column!important;gap:12px!important}
       .request-flex>span{display:none}
       .contact-actions{flex-direction:column!important;width:100%}
       .contact-actions>*{width:100%;justify-content:center!important}
       .hr-card-inner{flex-direction:column!important;align-items:flex-start!important}
       .contact-row{flex-direction:column!important;align-items:flex-start!important;gap:6px!important}
       .contact-row span:last-child{align-items:flex-start!important}
       .manager-highlight{flex-direction:column!important}
       .checklist-strip{gap:6px!important}
     }
     @media(max-width:640px){
       .hero-title-el{font-size:24px!important}
       .hero-dot-grid{padding:24px 16px 0!important}
       .checklist-strip{overflow-x:auto;justify-content:flex-start!important;padding-bottom:8px}
       .checklist-strip::-webkit-scrollbar{display:none}
       .steps-section{padding-left:12px!important;padding-right:12px!important}
       .important-section{padding-left:12px!important;padding-right:12px!important}
       .contact-section{padding-left:12px!important;padding-right:12px!important}
     }
   `;
   if (typeof document !== 'undefined' && !document.getElementById('ks-global')) {
     const s = document.createElement('style');
     s.id = 'ks-global';
     s.textContent = GLOBAL_CSS;
     document.head.appendChild(s);
   }
   
   const ks = {
     navy: '#002B5C',
     navyMid: '#00569E',
     sky: '#00A0E3',
     skyLight: '#E8F6FD',
     skyPale: '#F0F9FF',
     gold: '#FFD100',
     goldLight: '#FFF8D6',
     white: '#FFFFFF',
     bg: '#F5F7FA',
     bg2: '#EEF1F6',
     gray: '#6B7A8D',
     grayDark: '#3A4A5C',
     text: '#1A2332',
     green: '#00B87C',
     greenLight: '#E6F9F2',
     orange: '#FF8C42',
     orangeLight: '#FFF3EA',
   };
   
   const RaiffeisenLogo = ({ size = 44 }) => (
     <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
       <rect width="44" height="44" rx="6" fill="#FEE600" />
       <g transform="rotate(-38, 22, 22)">
         <rect x="20" y="8" width="5" height="16" rx="1.5" fill="#1A1A1A" />
         <rect x="14" y="7" width="17" height="7" rx="2" fill="#1A1A1A" />
       </g>
       <g transform="rotate(38, 22, 22)">
         <rect x="19" y="8" width="5" height="16" rx="1.5" fill="#1A1A1A" />
         <rect x="13" y="7" width="17" height="7" rx="2" fill="#1A1A1A" />
       </g>
     </svg>
   );
   const UkrsibLogo = ({ size = 44 }) => (
     <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
       <rect width="44" height="44" rx="10" fill="#009B5D" />
       <g fill="#FFF">
         <path d="M18.5 11l1.2 2.5 2.8.4-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.8-.4L18.5 11z" />
         <path d="M28 15l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3L28 15z" />
         <path d="M15 21l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3L15 21z" />
         <path d="M25 24l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3L25 24z" />
         <path d="M19 30l.8 1.6 1.8.2-1.3 1.3.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.3 1.8-.2L19 30z" />
       </g>
     </svg>
   );
   const KyivstarLogo = ({ size = 28 }) => (
     <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
       <path
         d="M16 2L20 10L28 12L22 18L24 26L16 22L8 26L10 18L4 12L12 10L16 2Z"
         fill="#FFD100"
         stroke="#002B5C"
         strokeWidth="1"
       />
     </svg>
   );
   
   const BANK_NAMES = { raiff: 'Райффайзен Банк', ukrsib: 'УКРСИББАНК' };
   
   const useStyles = makeStyles({
     root: {
       backgroundColor: ks.white,
       minHeight: '100vh',
       fontFamily: tokens.fontFamilyBase,
     },
     header: {
       backgroundColor: 'rgba(255,255,255,0.95)',
       borderBottom: `1px solid ${ks.bg2}`,
       backdropFilter: 'blur(12px)',
     },
     headerInner: {
       maxWidth: '1120px',
       marginLeft: 'auto',
       marginRight: 'auto',
       paddingTop: '14px',
       paddingBottom: '14px',
       paddingLeft: '24px',
       paddingRight: '24px',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'space-between',
     },
     hero: {
       position: 'relative',
       background:
         'linear-gradient(125deg, #3B3DAD 0%, #4466CC 35%, #3BA3E8 70%, #50C0F0 100%)',
       paddingTop: '28px',
       paddingBottom: '0',
       paddingLeft: '24px',
       paddingRight: '24px',
       overflow: 'hidden',
       display: 'flex',
       flexDirection: 'column',
       alignItems: 'center',
     },
     heroBgShape: { position: 'absolute', borderRadius: '50%' },
     heroTitle: {
       fontSize: '32px',
       fontWeight: 800,
       color: '#FFFFFF',
       lineHeight: 1.15,
       marginTop: '0',
       marginBottom: '12px',
       letterSpacing: '-0.01em',
     },
     heroSubtitle: {
       fontSize: '15px',
       color: 'rgba(255,255,255,0.85)',
       lineHeight: 1.6,
       marginTop: '0',
       marginBottom: '0',
       maxWidth: '420px',
     },
     stepsSection: {
       paddingTop: '40px',
       paddingBottom: '32px',
       paddingLeft: '24px',
       paddingRight: '24px',
     },
     stepsContainer: {
       maxWidth: '780px',
       marginLeft: 'auto',
       marginRight: 'auto',
     },
     stepConnector: {
       width: '2px',
       height: '20px',
       background: `linear-gradient(to bottom, ${ks.bg2}, transparent)`,
       marginLeft: 'auto',
       marginRight: 'auto',
       borderRadius: '2px',
     },
     stepBlock: {
       backgroundColor: ks.white,
       borderRadius: '12px',
       overflow: 'hidden',
       border: 'none',
       boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
       transitionProperty: 'box-shadow',
       transitionDuration: '0.25s',
       transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
     },
     stepBlockExpanded: {
       boxShadow: '0 2px 12px rgba(0,160,227,0.10), 0 0 0 1px rgba(0,160,227,0.3)',
     },
     stepHeader: {
       width: '100%',
       backgroundColor: 'transparent',
       border: 'none',
       paddingTop: '20px',
       paddingBottom: '20px',
       paddingLeft: '24px',
       paddingRight: '24px',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'space-between',
       cursor: 'pointer',
       fontFamily: tokens.fontFamilyBase,
       color: ks.text,
     },
     stepContent: {
       paddingTop: '0',
       paddingBottom: '24px',
       paddingLeft: '24px',
       paddingRight: '24px',
     },
     importantSection: {
       paddingTop: '8px',
       paddingBottom: '32px',
       paddingLeft: '24px',
       paddingRight: '24px',
     },
     importantContainer: {
       maxWidth: '780px',
       marginLeft: 'auto',
       marginRight: 'auto',
       backgroundColor: ks.white,
       borderRadius: '12px',
       paddingTop: '32px',
       paddingBottom: '32px',
       paddingLeft: '32px',
       paddingRight: '32px',
       boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
     },
     timelineGrid: {
       display: 'grid',
       gridTemplateColumns: '1fr 1fr',
       gap: '16px',
       marginBottom: '24px',
     },
     contactSection: {
       paddingTop: '0',
       paddingBottom: '40px',
       paddingLeft: '24px',
       paddingRight: '24px',
     },
     contactContainer: {
       maxWidth: '780px',
       marginLeft: 'auto',
       marginRight: 'auto',
     },
     footer: {
       backgroundColor: ks.white,
       borderTop: `1px solid ${ks.bg2}`,
       paddingTop: '16px',
       paddingBottom: '16px',
       paddingLeft: '24px',
       paddingRight: '24px',
     },
     footerInner: {
       maxWidth: '1120px',
       marginLeft: 'auto',
       marginRight: 'auto',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'space-between',
     },
     miniStep: {
       display: 'flex',
       gap: '12px',
       alignItems: 'flex-start',
       marginBottom: '12px',
     },
     miniStepNum: {
       width: '28px',
       height: '28px',
       borderRadius: '8px',
       backgroundColor: ks.skyLight,
       color: ks.sky,
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
       fontSize: '13px',
       fontWeight: 800,
       flexShrink: 0,
       border: '1px solid rgba(0,160,227,0.2)',
     },
     msgBar: {
       borderRadius: '14px',
       paddingTop: '14px',
       paddingBottom: '14px',
       paddingLeft: '18px',
       paddingRight: '18px',
       lineHeight: '1.65',
     },
   });
   
   const CHECKLIST_STEPS = [
     { label: 'Обрати банк', num: '1' },
     { label: 'Звернутись до банку', num: '2' },
     { label: 'Створити заявку', num: '3' },
     { label: 'Отримати зарплату!', num: null, isFinal: true },
   ];
   
   function AnimatedChecklist() {
     const [activeIndex, setActiveIndex] = useState(-1);
     useEffect(() => {
       let timeout;
       const run = (i) => {
         if (i < CHECKLIST_STEPS.length) {
           setActiveIndex(i);
           timeout = setTimeout(() => run(i + 1), 700);
         } else {
           timeout = setTimeout(() => {
             setActiveIndex(-1);
             timeout = setTimeout(() => run(0), 300);
           }, 2000);
         }
       };
       timeout = setTimeout(() => run(0), 400);
       return () => clearTimeout(timeout);
     }, []);
     return (
       <div
         className="checklist-strip"
         style={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           gap: 10,
           flexWrap: 'nowrap',
         }}
       >
         {CHECKLIST_STEPS.map((step, i) => {
           const filled = activeIndex >= i,
             isFinal = step.isFinal;
           return (
             <div
               key={i}
               style={{ display: 'flex', alignItems: 'center', gap: 10 }}
             >
               <div
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: 10,
                   backgroundColor: filled
                     ? isFinal
                       ? 'rgba(255,209,0,0.2)'
                       : 'rgba(255,255,255,0.18)'
                     : 'rgba(255,255,255,0.08)',
                   border: `1px solid ${
                     filled
                       ? isFinal
                         ? 'rgba(255,209,0,0.5)'
                         : 'rgba(255,255,255,0.4)'
                       : 'rgba(255,255,255,0.15)'
                   }`,
                   borderRadius: 100,
                   padding: '10px 18px 10px 16px',
                   transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                 }}
               >
                 <div
                   style={{
                     width: 26,
                     height: 26,
                     borderRadius: '50%',
                     border: `2px solid ${
                       filled
                         ? isFinal
                           ? ks.gold
                           : 'rgba(255,255,255,0.9)'
                         : 'rgba(255,255,255,0.35)'
                     }`,
                     backgroundColor: filled
                       ? isFinal
                         ? ks.gold
                         : 'rgba(255,255,255,0.9)'
                       : 'transparent',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
                     flexShrink: 0,
                   }}
                 >
                   {isFinal ? (
                     <WalletCreditCard24Regular
                       style={{
                         fontSize: 14,
                         color: filled ? ks.navy : 'rgba(255,255,255,0.4)',
                         transition: 'color 0.5s',
                       }}
                     />
                   ) : (
                     <span
                       style={{
                         fontSize: 12,
                         fontWeight: 800,
                         color: filled ? ks.navy : 'rgba(255,255,255,0.4)',
                         transition: 'color 0.5s',
                         lineHeight: 1,
                       }}
                     >
                       {step.num}
                     </span>
                   )}
                 </div>
                 <span
                   style={{
                     fontSize: 13,
                     fontWeight: 600,
                     color: filled ? '#fff' : 'rgba(255,255,255,0.4)',
                     whiteSpace: 'nowrap',
                     transition: 'color 0.5s',
                   }}
                 >
                   {step.label}
                 </span>
               </div>
               {i < CHECKLIST_STEPS.length - 1 && (
                 <ArrowRight16Regular
                   style={{
                     color:
                       activeIndex > i
                         ? 'rgba(255,255,255,0.5)'
                         : 'rgba(255,255,255,0.2)',
                     transition: 'color 0.5s',
                     flexShrink: 0,
                   }}
                 />
               )}
             </div>
           );
         })}
       </div>
     );
   }
   
   function SuccessPopup({ onClose }) {
     return (
       <div
         style={{
           position: 'fixed',
           inset: 0,
           zIndex: 1000,
           background: 'rgba(0,43,92,0.45)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           padding: 24,
         }}
         onClick={onClose}
       >
         <div
           style={{
             background: ks.white,
             borderRadius: 24,
             padding: '40px 36px',
             maxWidth: 440,
             width: '100%',
             textAlign: 'center',
             boxShadow: '0 24px 64px rgba(0,43,92,0.18)',
             animation: 'slideIn 0.4s cubic-bezier(0.33,1,0.68,1)',
           }}
           onClick={(e) => e.stopPropagation()}
         >
           <div
             style={{
               width: 140,
               height: 140,
               borderRadius: '50%',
               background: 'linear-gradient(135deg, #e0f7ef 0%, #b2f0d8 100%)',
               margin: '0 auto 24px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: 64,
             }}
           >
             🚀
           </div>
           <div
             style={{
               fontSize: 22,
               fontWeight: 800,
               color: ks.text,
               marginBottom: 12,
               lineHeight: 1.2,
             }}
           >
             Твій запит вже летить
             <br />
             по системах Компанії!
           </div>
           <div
             style={{
               fontSize: 15,
               color: ks.gray,
               lineHeight: 1.65,
               marginBottom: 32,
             }}
           >
             Скоро відбудеться магія ✨<br />
             Ми обробимо зміни і нова картка
             <br />
             запрацює вже з наступної виплати.
           </div>
           <button
             onClick={onClose}
             style={{
               display: 'inline-flex',
               alignItems: 'center',
               gap: 8,
               padding: '12px 32px',
               borderRadius: 100,
               border: 'none',
               background: ks.sky,
               color: '#fff',
               fontSize: 15,
               fontWeight: 700,
               cursor: 'pointer',
               transition: 'all 0.25s ease',
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'translateY(-2px)';
               e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,160,227,0.3)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'none';
               e.currentTarget.style.boxShadow = 'none';
             }}
           >
             Чудово, дякую!
           </button>
         </div>
       </div>
     );
   }
   
   function Step3Form({ selectedBank }) {
     const bankName = BANK_NAMES[selectedBank] || '';
     const [text, setText] = useState('');
     const [loading, setLoading] = useState(false);
     const [showSuccess, setShowSuccess] = useState(false);
     useEffect(() => {
       setText(
         `Добрий день, прошу внести зміни по Зарплатному проєкту.\nНовий Банк — ${bankName}\nНовий IBAN — `
       );
     }, [selectedBank, bankName]);
     const handleSubmit = async () => {
       setLoading(true);
       try {
         await new Promise((r) => setTimeout(r, 1200));
         setShowSuccess(true);
       } finally {
         setLoading(false);
       }
     };
     return (
       <>
         {showSuccess && <SuccessPopup onClose={() => setShowSuccess(false)} />}
         <div
           style={{
             fontSize: 14,
             color: ks.gray,
             lineHeight: 1.5,
             marginBottom: 16,
           }}
         >
           Перевір текст заявки і натисни "Створити заявку" — ми надішлемо її до
           Service Desk автоматично.
         </div>
         <textarea
           value={text}
           onChange={(e) => setText(e.target.value)}
           rows={5}
           style={{
             width: '100%',
             boxSizing: 'border-box',
             padding: '16px 18px',
             borderRadius: 12,
             border: `1.5px solid ${ks.bg2}`,
             fontSize: 14,
             color: ks.text,
             lineHeight: 1.65,
             fontFamily: 'inherit',
             resize: 'vertical',
             outline: 'none',
             transition: 'border-color 0.2s',
             marginBottom: 16,
             background: ks.bg,
           }}
           onFocus={(e) => (e.target.style.borderColor = ks.sky)}
           onBlur={(e) => (e.target.style.borderColor = ks.bg2)}
         />
         {/* ✅ #7 solid sky CTA instead of gradient */}
         <button
           onClick={handleSubmit}
           disabled={loading || !text.trim()}
           style={{
             display: 'inline-flex',
             alignItems: 'center',
             gap: 10,
             padding: '12px 28px',
             borderRadius: 100,
             border: 'none',
             background: loading ? ks.bg2 : ks.sky,
             color: loading ? ks.gray : '#fff',
             fontSize: 15,
             fontWeight: 700,
             cursor: loading ? 'default' : 'pointer',
             transition: 'all 0.25s ease',
           }}
           onMouseEnter={(e) => {
             if (!loading) {
               e.currentTarget.style.transform = 'translateY(-2px)';
               e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,160,227,0.25)';
             }
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.transform = 'none';
             e.currentTarget.style.boxShadow = 'none';
           }}
         >
           {loading ? (
             <>
               <span
                 style={{
                   width: 16,
                   height: 16,
                   borderRadius: '50%',
                   border: `2px solid ${ks.gray}`,
                   borderTopColor: 'transparent',
                   display: 'inline-block',
                   animation: 'spin 0.7s linear infinite',
                 }}
               />
               Надсилаємо...
             </>
           ) : (
             <>
               <DocumentText24Regular style={{ fontSize: 18 }} />
               Створити заявку
             </>
           )}
         </button>
         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
       </>
     );
   }
   
   export const BankMemo = () => {
     const classes = useStyles();
     const [openStep, setOpenStep] = useState(null);
     const [selectedBank, setSelectedBank] = useState(null);
     const [scrolled, setScrolled] = useState(false);
     const step2Ref = useRef(null);
   
     const handleScroll = (e) => setScrolled(e.currentTarget.scrollTop > 12);
   
     const toggleStep = (id) => setOpenStep(openStep === id ? null : id);
     const selectBank = (id) => {
       const next = selectedBank === id ? null : id;
       setSelectedBank(next);
       if (next) {
         setOpenStep(2);
         setTimeout(
           () =>
             step2Ref.current?.scrollIntoView({
               behavior: 'smooth',
               block: 'nearest',
             }),
           150
         );
       } else setOpenStep(null);
     };
   
     return (
       <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
         <TopBar />
         <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }} onScroll={handleScroll}>
         <div className={`${classes.root} ks-app`}>
           <header
             className={`${classes.header} ${
               scrolled ? 'app-header-scrolled' : ''
             }`}
           >
             <div className={classes.headerInner}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <KyivstarLogo />
                 <span style={{ fontSize: 16, fontWeight: 700, color: ks.navy }}>
                   КИЇВСТАР
                 </span>
               </div>
             </div>
           </header>
   
           <section className={`${classes.hero} hero-dot-grid`}>
             <div
               className={classes.heroBgShape}
               style={{
                 width: 650,
                 height: 650,
                 background: '#fff',
                 opacity: 0.06,
                 top: -280,
                 right: -120,
               }}
             />
             <div
               className={classes.heroBgShape}
               style={{
                 width: 420,
                 height: 420,
                 background: '#fff',
                 opacity: 0.08,
                 bottom: -220,
                 right: 40,
               }}
             />
             <div
               className={classes.heroBgShape}
               style={{
                 width: 280,
                 height: 280,
                 background: '#fff',
                 opacity: 0.05,
                 top: 30,
                 left: -100,
               }}
             />
             <div
               className="hero-content-row"
               style={{
                 position: 'relative',
                 zIndex: 2,
                 width: '100%',
                 maxWidth: 900,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 gap: 48,
                 paddingBottom: 32,
               }}
             >
               <div style={{ maxWidth: 480 }}>
                 <h1
                   className={`${classes.heroTitle} hero-title-el fade-up fade-up-d1`}
                 >
                   Вибір банку для
                   <br />
                   <span style={{ color: ks.gold }}>зарплатного проєкту</span>
                 </h1>
               </div>
               <div
                 className="hero-floats"
                 style={{
                   position: 'relative',
                   width: 200,
                   height: 170,
                   flexShrink: 0,
                 }}
               >
                 <div
                   className="float-1"
                   style={{
                     position: 'absolute',
                     width: 76,
                     height: 76,
                     borderRadius: 16,
                     top: 0,
                     left: 20,
                     background: 'rgba(255,255,255,0.18)',
                     backdropFilter: 'blur(16px)',
                     border: '1px solid rgba(255,255,255,0.35)',
                     boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                   }}
                 >
                   <RaiffeisenLogo size={46} />
                 </div>
                 <div
                   className="float-2"
                   style={{
                     position: 'absolute',
                     width: 76,
                     height: 76,
                     borderRadius: 16,
                     top: 48,
                     right: 0,
                     background: 'rgba(255,255,255,0.18)',
                     backdropFilter: 'blur(16px)',
                     border: '1px solid rgba(255,255,255,0.35)',
                     boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                   }}
                 >
                   <UkrsibLogo size={46} />
                 </div>
                 <div
                   className="float-3"
                   style={{
                     position: 'absolute',
                     width: 64,
                     height: 64,
                     borderRadius: 16,
                     bottom: 0,
                     left: 48,
                     background: 'rgba(255,255,255,0.18)',
                     backdropFilter: 'blur(16px)',
                     border: '1px solid rgba(255,255,255,0.35)',
                     boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                   }}
                 >
                   <Globe24Regular style={{ fontSize: 34, color: '#fff' }} />
                 </div>
               </div>
             </div>
             <div
               style={{
                 position: 'relative',
                 zIndex: 2,
                 width: '100%',
                 maxWidth: 900,
                 borderTop: '1px solid rgba(255,255,255,0.15)',
                 paddingTop: 20,
                 paddingBottom: 20,
               }}
             >
               <AnimatedChecklist />
             </div>
           </section>
   
           <section className={`${classes.stepsSection} steps-section`}>
             <div className={classes.stepsContainer}>
               {/* ═══ STEP 1 ═══ */}
               <StepBlock
                 num={1}
                 title="Обери бажаний банк"
                 subtitle="для зарплатного проєкту"
                 alwaysOpen
               >
                 <div
                   style={{
                     fontSize: 14,
                     color: ks.gray,
                     lineHeight: 1.5,
                     marginBottom: 16,
                   }}
                 >
                   Натисни на картку банку, щоб дізнатися більше про умови:
                 </div>
                 <div
                   className="bank-grid-3"
                   style={{
                     display: 'grid',
                     gridTemplateColumns: 'repeat(3, 1fr)',
                     gap: 12,
                     marginBottom: 16,
                   }}
                 >
                   {/* ✅ #4 no checkmark — removed from BankCardBtn */}
                   <BankCardBtn
                     id="raiff"
                     icon={<RaiffeisenLogo size={36} />}
                     name="Райффайзен Банк"
                     selected={selectedBank === 'raiff'}
                     onSelect={() => selectBank('raiff')}
                   />
                   <BankCardBtn
                     id="ukrsib"
                     icon={<UkrsibLogo size={36} />}
                     name="УКРСИББАНК"
                     selected={selectedBank === 'ukrsib'}
                     onSelect={() => selectBank('ukrsib')}
                   />
                   <BankCardBtn
                     id="other"
                     icon={<Globe24Regular />}
                     name="Інший банк"
                     selected={selectedBank === 'other'}
                     onSelect={() => selectBank('other')}
                   />
                 </div>
                 {/* ✅ #2 no border-left on bank details */}
                 {selectedBank === 'raiff' && (
                   <BankDetailsPanel
                     icon={<RaiffeisenLogo size={28} />}
                     title="Райффайзен Банк"
                     desc="Ознайомся з умовами зарплатного проєкту Райффайзен Банку перед зверненням у відділення."
                   />
                 )}
                 {selectedBank === 'ukrsib' && (
                   <BankDetailsPanel
                     icon={<UkrsibLogo size={28} />}
                     title="УКРСИББАНК"
                     desc="Ознайомся з умовами зарплатного проєкту УКРСИББАНКу перед зверненням у відділення."
                   />
                 )}
               </StepBlock>
   
               <div className={classes.stepConnector} />
   
               {/* ═══ STEP 2 ═══ */}
               <div ref={step2Ref}>
                 <StepBlock
                   num={2}
                   title="Звернись до банку"
                   subtitle={
                     selectedBank === 'raiff'
                       ? 'контакти Райффайзен Банку'
                       : selectedBank === 'ukrsib'
                       ? 'контакти УКРСИББАНКУ'
                       : 'для відкриття нової картки'
                   }
                   isOpen={openStep === 2}
                   onToggle={() => toggleStep(2)}
                 >
                   {/* Intro text — only for raiff/ukrsib, NOT for 'other' or empty */}
                   {(selectedBank === 'raiff' || selectedBank === 'ukrsib') && (
                     <div
                       style={{
                         fontSize: 14,
                         color: ks.gray,
                         lineHeight: 1.5,
                         marginBottom: 20,
                       }}
                     >
                       У разі, якщо у тебе є якісь запитання, або ти хочеш отримати
                       додаткову інформацію про відкриття нової карти та її умови,
                       звернись до менеджерів банку.
                     </div>
                   )}
   
                   {/* ✅ #10 'other' — no header, content directly */}
                   {selectedBank === 'other' && (
                     <div className="slide-in">
                       <MessageBar
                         intent="info"
                         style={{
                           marginBottom: 16,
                           borderRadius: 6,
                           whiteSpace: 'normal',
                         }}
                       >
                         <MessageBarBody style={{ whiteSpace: 'normal' }}>
                           Згідно з{' '}
                           <a
                             href="https://zakon.rada.gov.ua/laws/show/v0056500-20#Text"
                             target="_blank"
                             rel="noopener"
                             style={{ color: ks.sky, fontWeight: 600 }}
                           >
                             Постановою НБУ №56
                           </a>{' '}
                           "Про затвердження Змін до Інструкції про безготівкові
                           розрахунки в Україні в національній валюті"
                         </MessageBarBody>
                       </MessageBar>
                       <div className={classes.miniStep}>
                         <div className={classes.miniStepNum}>1</div>
                         <Body1
                           style={{
                             color: ks.gray,
                             lineHeight: 1.55,
                             paddingTop: 4,
                           }}
                         >
                           Звернись до менеджера обраного тобою банку для отримання
                           повної інформації про умови обслуговування та
                           нарахування заробітної плати на картку (комісії в вашому
                           тарифі)
                         </Body1>
                       </div>
                       <div
                         className={classes.miniStep}
                         style={{ marginBottom: 0 }}
                       >
                         <div className={classes.miniStepNum}>2</div>
                         <Body1
                           style={{
                             color: ks.gray,
                             lineHeight: 1.55,
                             paddingTop: 4,
                           }}
                         >
                           Отримай IBAN код в онлайн-додатку банку або у менеджера
                         </Body1>
                       </div>
                     </div>
                   )}
   
                   {/* ✅ #2 Raiffeisen contacts — no border-left */}
                   {selectedBank === 'raiff' && (
                     <Card
                       className="slide-in"
                       style={{ borderRadius: 16, padding: 24 }}
                     >
                       <div
                         style={{
                           display: 'flex',
                           alignItems: 'center',
                           gap: 10,
                           marginBottom: 16,
                           color: ks.navy,
                         }}
                       >
                         <RaiffeisenLogo size={28} />
                         <Subtitle2 style={{ color: ks.navy }}>
                           Райффайзен Банк
                         </Subtitle2>
                       </div>
                       {/* ✅ #3 skyLight highlight instead of yellow */}
                       <div className="manager-highlight">
                         <div
                           style={{
                             width: 36,
                             height: 36,
                             borderRadius: 12,
                             backgroundColor: 'rgba(0,160,227,0.08)',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             flexShrink: 0,
                           }}
                         >
                           <PersonCircle24Regular
                             style={{ color: ks.sky, fontSize: 20 }}
                           />
                         </div>
                         <div style={{ lineHeight: 1.65 }}>
                           <Body1>
                             <strong>Гаврилюк Ольга</strong> — відповідальний
                             менеджер
                           </Body1>
                           <div
                             style={{
                               display: 'flex',
                               flexWrap: 'wrap',
                               gap: '4px 12px',
                               marginTop: 4,
                             }}
                           >
                             <a
                               href="tel:0506023035"
                               style={{
                                 color: ks.sky,
                                 fontWeight: 600,
                                 whiteSpace: 'nowrap',
                               }}
                             >
                               050 602 30 35
                             </a>
                             <a
                               href="mailto:olga.i.gavryliuk@raiffeisen.ua"
                               style={{
                                 color: ks.sky,
                                 fontWeight: 600,
                                 fontSize: 13,
                                 whiteSpace: 'nowrap',
                               }}
                             >
                               olga.i.gavryliuk@raiffeisen.ua
                             </a>
                           </div>
                         </div>
                       </div>
                       <Caption1
                         style={{
                           color: ks.gray,
                           fontWeight: 700,
                           display: 'block',
                           marginBottom: 8,
                         }}
                       >
                         Телефони підтримки фізичних осіб:
                       </Caption1>
                       {[
                         ['Загальні питання', '0 800 500 500', '0 800 308 408'],
                         ['Raiffeisen Online', '0 800 500 133', '0 800 305 133'],
                         [
                           'Raiffeisen Business Online',
                           '0 800 505 770',
                           '0 800 305 770',
                         ],
                         [
                           'Загальні питання для бізнес-клієнтів',
                           '0 800 505 770',
                           '0 800 305 770',
                         ],
                         [
                           'Валютне врегулювання для бізнес-клієнтів',
                           '0 800 500 025',
                           '0 800 305 355',
                         ],
                         [
                           'Встановлення PIN-коду',
                           '0 800 501 150',
                           '0 800 300 373',
                         ],
                       ].map(([label, tel1, tel2]) => (
                         <div
                           key={label}
                           style={{
                             padding: '10px 0',
                             borderBottom: `1px solid ${ks.bg2}`,
                           }}
                         >
                           <Caption1
                             style={{
                               color: ks.gray,
                               display: 'block',
                               marginBottom: 5,
                             }}
                           >
                             {label}
                           </Caption1>
                           <div style={{ display: 'flex', gap: 16 }}>
                             <a
                               href={`tel:${tel1.replace(/ /g, '')}`}
                               style={{
                                 color: ks.sky,
                                 fontWeight: 600,
                                 fontSize: 14,
                                 textDecoration: 'none',
                               }}
                             >
                               {tel1}
                             </a>
                             <a
                               href={`tel:${tel2.replace(/ /g, '')}`}
                               style={{
                                 color: ks.sky,
                                 fontWeight: 600,
                                 fontSize: 14,
                                 textDecoration: 'none',
                               }}
                             >
                               {tel2}
                             </a>
                           </div>
                         </div>
                       ))}
                     </Card>
                   )}
   
                   {/* ✅ #2 UKRSIB contacts — no border-left */}
                   {selectedBank === 'ukrsib' && (
                     <Card
                       className="slide-in"
                       style={{ borderRadius: 16, padding: 24 }}
                     >
                       <div
                         style={{
                           display: 'flex',
                           alignItems: 'center',
                           gap: 10,
                           marginBottom: 16,
                           color: ks.navy,
                         }}
                       >
                         <UkrsibLogo size={28} />
                         <Subtitle2 style={{ color: ks.navy }}>
                           УКРСИББАНК — регіональні менеджери
                         </Subtitle2>
                       </div>
                       {[
                         {
                           region: 'Київ, Київська область',
                           contacts: [
                             { name: 'Волощук Віталій', tel: '0672236987' },
                             { name: 'Лепеса Альона', tel: '0967939203' },
                           ],
                         },
                         {
                           region: 'Західна Україна',
                           contacts: [{ name: 'Рудик Дмитро', tel: '0672200423' }],
                         },
                         {
                           region: 'Південь (Одеса, Миколаїв, Херсон)',
                           contacts: [{ name: 'Поляков Ігор', tel: '0975147107' }],
                         },
                         {
                           region: 'Дніпро, Запорожжя, Черкаси',
                           contacts: [{ name: 'Гірняк Петро', tel: '0979775641' }],
                         },
                         {
                           region: 'Поділля (Житомир, Тернопіль, Хмельницький)',
                           contacts: [{ name: 'Харчук Ганна', tel: '0676155473' }],
                         },
                         {
                           region: 'Схід (Харків, Полтава, Суми, Чернігів)',
                           contacts: [{ name: 'Котов Юрій', tel: '0674608796' }],
                         },
                       ].map(({ region, contacts }) => (
                         <div
                           key={region}
                           className="contact-row"
                           style={{ gap: 16 }}
                         >
                           <span style={{ color: ks.gray, flex: 1 }}>
                             {region}
                           </span>
                           <span
                             style={{
                               display: 'flex',
                               flexDirection: 'column',
                               alignItems: 'flex-end',
                               gap: 2,
                             }}
                           >
                             {contacts.map((c) => (
                               <span
                                 key={c.tel}
                                 style={{ whiteSpace: 'nowrap', fontSize: 14 }}
                               >
                                 <strong
                                   style={{ color: ks.text, fontWeight: 600 }}
                                 >
                                   {c.name}
                                 </strong>
                                 <span style={{ margin: '0 6px', color: ks.bg2 }}>
                                   ·
                                 </span>
                                 <a
                                   href={`tel:${c.tel}`}
                                   style={{ color: ks.sky, fontWeight: 700 }}
                                 >
                                   {c.tel.replace(
                                     /(\d{3})(\d{3})(\d{2})(\d{2})/,
                                     '$1 $2 $3 $4'
                                   )}
                                 </a>
                               </span>
                             ))}
                           </span>
                         </div>
                       ))}
                     </Card>
                   )}
   
                   {/* ✅ #5 no selection — only hint, no contacts */}
                   {!selectedBank && (
                     <div
                       style={{
                         padding: '14px 18px',
                         backgroundColor: ks.skyPale,
                         borderRadius: 10,
                         border: '1px solid rgba(0,160,227,0.15)',
                         fontSize: 13,
                         color: ks.gray,
                       }}
                     >
                       Обери банк у кроці 1, щоб побачити відповідні контакти
                     </div>
                   )}
                 </StepBlock>
               </div>
   
               <div className={classes.stepConnector} />
   
               {/* ═══ STEP 3 ═══ */}
               <StepBlock
                 num={3}
                 title={
                   selectedBank === 'other'
                     ? 'Онови IBAN у Персональному кабінеті'
                     : 'Створи заявку на зміну зарплатного проєкту'
                 }
                 subtitle=""
                 isOpen={openStep === 3}
                 onToggle={() => toggleStep(3)}
               >
                 {selectedBank === 'other' ? (
                   <div
                     style={{
                       display: 'flex',
                       gap: 14,
                       alignItems: 'flex-start',
                       padding: '20px 24px',
                       background: ks.skyPale,
                       borderRadius: 12,
                       border: '1px solid rgba(0,160,227,0.15)',
                     }}
                   >
                     <div
                       style={{
                         width: 36,
                         height: 36,
                         borderRadius: 10,
                         background: ks.skyLight,
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         flexShrink: 0,
                       }}
                     >
                       <DocumentText24Regular
                         style={{ color: ks.sky, fontSize: 20 }}
                       />
                     </div>
                     <div
                       style={{
                         fontSize: 14,
                         color: ks.grayDark,
                         lineHeight: 1.65,
                       }}
                     >
                       Скорегуй код IBAN у своєму{' '}
                       <strong style={{ color: ks.text }}>
                         Персональному Кабінеті
                       </strong>{' '}
                       на вкладці{' '}
                       <strong style={{ color: ks.text }}>Мій Акаунт</strong>
                     </div>
                   </div>
                 ) : (
                   <Step3Form selectedBank={selectedBank} />
                 )}
               </StepBlock>
             </div>
           </section>
   
           {/* ═══ IMPORTANT DATES ═══ */}
           <section className={`${classes.importantSection} important-section`}>
             <div className={classes.importantContainer}>
               <div
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: 10,
                   marginBottom: 20,
                 }}
               >
                 <div
                   style={{
                     width: 40,
                     height: 40,
                     borderRadius: 10,
                     backgroundColor: ks.skyLight,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     flexShrink: 0,
                   }}
                 >
                   <Calendar24Regular style={{ color: ks.sky, fontSize: 22 }} />
                 </div>
                 <div>
                   <Subtitle2 style={{ color: ks.text, display: 'block' }}>
                     Важливі терміни
                   </Subtitle2>
                   <Caption1
                     style={{ color: ks.gray, marginTop: 2, display: 'block' }}
                   >
                     Для успішної зміни банку — дотримуйся цих дат
                   </Caption1>
                 </div>
               </div>
               {/* ✅ #6 no border-left on timeline cards */}
               <div className={`${classes.timelineGrid} timeline-grid-2`}>
                 <TimelineCardHover
                   label="Перша виплата"
                   dates="з 1 по 15 число"
                   desc="Подай заявку заздалегідь перед першою виплатою"
                 />
                 <TimelineCardHover
                   label="Друга виплата"
                   dates="з 18 по 25 число"
                   desc="Подай заявку заздалегідь перед другою виплатою"
                 />
               </div>
               <MessageBar
                 intent="warning"
                 layout="multiline"
                 className={classes.msgBar}
                 style={{ marginBottom: 12 }}
               >
                 <MessageBarBody>
                   В інші дати проводиться розрахунок заробітної плати, тому
                   обробка твоєї заявки може бути відкладена до завершення
                   розрахункового періоду, а нова картка підключиться тільки в
                   наступну виплату.
                 </MessageBarBody>
               </MessageBar>
               <MessageBar
                 intent="success"
                 layout="multiline"
                 className={classes.msgBar}
               >
                 <MessageBarBody>
                   Після переведення на новий банк{' '}
                   <strong>не закривай попередню зарплатну картку</strong>, поки не
                   отримаєш повний розрахунок по всім лікарняним листам, які були
                   надані до зміни банку, та оплату, яку ти ще не отримав.
                 </MessageBarBody>
               </MessageBar>
             </div>
           </section>
   
           {/* ═══ CONTACT ═══ */}
           <section className={`${classes.contactSection} contact-section`}>
             <div className={classes.contactContainer}>
               <Card
                 style={{
                   padding: '24px 28px',
                   borderRadius: 12,
                   boxShadow:
                     '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
                 }}
               >
                 <div
                   className="hr-card-inner"
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     gap: 20,
                   }}
                 >
                   <Persona
                     name="Наталія Беженар"
                     secondaryText="HR Business Partner | Пільги та Компенсації"
                     size="extra-large"
                     avatar={{ color: 'brand', icon: <PersonCircle24Regular /> }}
                   />
                   <div
                     className="contact-actions"
                     style={{
                       display: 'flex',
                       flexDirection: 'column',
                       gap: 10,
                       flexShrink: 0,
                     }}
                   >
                     <a
                       href="tel:"
                       style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: 10,
                         color: ks.gray,
                         fontSize: 14,
                         textDecoration: 'none',
                         transition: 'color 0.2s',
                       }}
                       onMouseEnter={(e) => (e.currentTarget.style.color = ks.sky)}
                       onMouseLeave={(e) =>
                         (e.currentTarget.style.color = ks.gray)
                       }
                     >
                       <Phone24Regular
                         style={{ fontSize: 18, color: ks.sky, flexShrink: 0 }}
                       />
                       <span>+38(0XX) XXX-XX-XX</span>
                     </a>
                     <a
                       href="mailto:natalia.bezhenar@kyivstar.ua"
                       style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: 10,
                         color: ks.gray,
                         fontSize: 14,
                         textDecoration: 'none',
                         transition: 'color 0.2s',
                       }}
                       onMouseEnter={(e) => (e.currentTarget.style.color = ks.sky)}
                       onMouseLeave={(e) =>
                         (e.currentTarget.style.color = ks.gray)
                       }
                     >
                       <Mail24Regular
                         style={{ fontSize: 18, color: ks.sky, flexShrink: 0 }}
                       />
                       <span>natalia.bezhenar@kyivstar.ua</span>
                     </a>
                     <a
                       href="#"
                       style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: 10,
                         color: ks.gray,
                         fontSize: 14,
                         textDecoration: 'none',
                         transition: 'color 0.2s',
                       }}
                       onMouseEnter={(e) => (e.currentTarget.style.color = ks.sky)}
                       onMouseLeave={(e) =>
                         (e.currentTarget.style.color = ks.gray)
                       }
                     >
                       <PersonEdit24Regular
                         style={{ fontSize: 18, color: ks.sky, flexShrink: 0 }}
                       />
                       <span>Ініціювати кадрові зміни</span>
                     </a>
                   </div>
                 </div>
               </Card>
             </div>
           </section>
   
           <footer className={classes.footer}>
             <div className={classes.footerInner}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <KyivstarLogo size={20} />
                 <span style={{ fontSize: 14, fontWeight: 700, color: ks.navy }}>
                   КИЇВСТАР
                 </span>
               </div>
               <span style={{ fontSize: 12, color: ks.gray }}>
                 Персональний Кабінет | Пільги та Компенсації
               </span>
             </div>
           </footer>
         </div>
         </div>
       </div>
     );
   };
   
   export default BankMemo;
   
   /* ═══ SUB-COMPONENTS ═══ */
   
   function StepBlock({
     num,
     title,
     subtitle,
     isOpen,
     onToggle,
     children,
     alwaysOpen,
   }) {
     const classes = useStyles();
     const label = `Крок 0${num}`;
     const expanded = alwaysOpen || isOpen;
     return (
       <div
         className={mergeClasses(
           classes.stepBlock,
           expanded && classes.stepBlockExpanded
         )}
       >
         <button
           className={classes.stepHeader}
           onClick={alwaysOpen ? undefined : onToggle}
           style={{ cursor: alwaysOpen ? 'default' : 'pointer' }}
         >
           <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
             <div
               style={{
                 padding: '8px 18px',
                 borderRadius: 10,
                 border: `2px solid ${ks.sky}`,
                 backgroundColor: expanded ? ks.skyLight : ks.white,
                 color: ks.sky,
                 fontSize: 14,
                 fontWeight: 700,
                 whiteSpace: 'nowrap',
                 transition: 'all 0.3s ease',
               }}
             >
               {label}
             </div>
             <div>
               <Subtitle2
                 style={{ color: ks.text, display: 'block', textAlign: 'left' }}
               >
                 {title}
               </Subtitle2>
               {subtitle && (
                 <Caption1
                   style={{
                     color: ks.gray,
                     display: 'block',
                     textAlign: 'left',
                     marginTop: 3,
                   }}
                 >
                   {subtitle}
                 </Caption1>
               )}
             </div>
           </div>
           {!alwaysOpen && (
             <ChevronDown24Regular
               style={{
                 color: ks.gray,
                 flexShrink: 0,
                 transform: isOpen ? 'rotate(180deg)' : 'none',
                 transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
               }}
             />
           )}
         </button>
         <div className={`step-content-wrap ${expanded ? 'open' : ''}`}>
           <div className="step-content-inner">
             <div className={classes.stepContent}>{children}</div>
           </div>
         </div>
       </div>
     );
   }
   
   /* ✅ #4 removed CheckmarkCircle — selection shown by bg + border only */
   function BankCardBtn({ id, icon, name, selected, onSelect }) {
     const [hovered, setHovered] = useState(false);
     const isLogo = id === 'raiff' || id === 'ukrsib';
     const active = selected || hovered;
     return (
       <button
         onClick={onSelect}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
         style={{
           all: 'unset',
           boxSizing: 'border-box',
           cursor: 'pointer',
           backgroundColor: selected ? ks.skyLight : ks.white,
           border: `1px solid ${active ? ks.sky : ks.bg2}`,
           borderRadius: 8,
           padding: '18px 14px',
           display: 'flex',
           flexDirection: 'column',
           alignItems: 'center',
           gap: 10,
           transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
           transform: hovered ? 'translateY(-2px)' : 'none',
           boxShadow: hovered
             ? '0 4px 16px rgba(0,160,227,0.08)'
             : selected
             ? '0 2px 12px rgba(0,160,227,0.06)'
             : 'none',
         }}
       >
         <div
           style={{
             width: 52,
             height: 52,
             borderRadius: 14,
             backgroundColor: isLogo ? 'transparent' : ks.bg,
             overflow: 'hidden',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
           }}
         >
           {isLogo ? (
             <span style={{ display: 'flex' }}>{icon}</span>
           ) : (
             <span style={{ color: ks.navy, fontSize: 28, display: 'flex' }}>
               {icon}
             </span>
           )}
         </div>
         <span
           style={{
             fontSize: 13,
             fontWeight: 700,
             textAlign: 'center',
             color: ks.text,
             lineHeight: 1.3,
           }}
         >
           {name}
         </span>
       </button>
     );
   }
   
   /* ✅ #1 presentation button with hover + #2 no border-left */
   function BankDetailsPanel({ icon, title, desc }) {
     return (
       <Card className="slide-in" style={{ borderRadius: 16, padding: 24 }}>
         <div
           style={{
             display: 'flex',
             alignItems: 'center',
             gap: 10,
             marginBottom: 12,
             color: ks.navy,
           }}
         >
           <span style={{ display: 'flex' }}>{icon}</span>
           <Subtitle2 style={{ color: ks.navy }}>{title}</Subtitle2>
         </div>
         <Body1
           style={{
             color: ks.gray,
             display: 'block',
             marginBottom: 16,
             lineHeight: 1.5,
           }}
         >
           {desc}
         </Body1>
         <Button
           className="pres-btn"
           appearance="outline"
           icon={<DocumentText24Regular />}
           iconPosition="before"
           style={{
             borderColor: ks.sky,
             color: ks.sky,
             borderRadius: 100,
             fontWeight: 600,
           }}
         >
           Переглянути презентацію <Open16Regular style={{ marginLeft: 6 }} />
         </Button>
       </Card>
     );
   }
   
   /* ✅ #6 no border-left on timeline */
   function TimelineCardHover({ label, dates, desc }) {
     return (
       <Card style={{ borderRadius: 12, padding: '24px' }}>
         <div
           style={{
             display: 'flex',
             alignItems: 'center',
             gap: 6,
             color: ks.sky,
             fontSize: 12,
             fontWeight: 700,
             marginBottom: 8,
             textTransform: 'uppercase',
             letterSpacing: '0.05em',
           }}
         >
           <Clock24Regular style={{ fontSize: 16 }} />
           {label}
         </div>
         <div
           style={{
             fontSize: 24,
             fontWeight: 800,
             color: ks.navy,
             marginBottom: 6,
           }}
         >
           {dates}
         </div>
         <Caption1 style={{ color: ks.gray, lineHeight: 1.5 }}>{desc}</Caption1>
       </Card>
     );
   }
   