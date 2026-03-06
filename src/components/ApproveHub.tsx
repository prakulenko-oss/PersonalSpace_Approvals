import { useState, useCallback, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Checkbox,
  Input,
  Text,
  Avatar,
  Textarea,
  Toaster,
  useToastController,
  useId,
  Toast,
  ToastTitle,
  ToastBody,
} from '@fluentui/react-components';
import type { ToastIntent } from '@fluentui/react-components';
import {
  Search,
  ExternalLink,
  Check,
  X,
  Database,
  FileText,
  LayoutGrid,
  Shield,
  CreditCard,
  Users,
  BarChart3,
  Paperclip,
  Download,
  File,
  Loader2,
  Eye,
  AlertCircle,
} from 'lucide-react';

// ============================================
// DESIGN TOKENS - Spacing Scale (4px base)
// ============================================
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
  xxxxl: '40px',
} as const;

// ============================================
// DESIGN TOKENS - Elevation (Shadows)
// ============================================
const elevation = {
  shadow2: '0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)',
  shadow4: '0 2px 4px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.1)',
  shadow8: '0 4px 8px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.1)',
  shadow16: '0 8px 16px rgba(0, 0, 0, 0.1), 0 16px 32px rgba(0, 0, 0, 0.12)',
} as const;

// ============================================
// DESIGN TOKENS - Motion (Fluent)
// ============================================
const motion = {
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

// Document type categories
const ACTIONABLE_TYPES = ['Візування', 'Підписання'];
const isActionable = (type: string) => ACTIONABLE_TYPES.includes(type);

const useStyles = makeStyles({
  // ============================================
  // GLOBAL FOCUS STYLES
  // ============================================
  focusVisible: {
    ':focus-visible': {
      outline: `2px solid ${tokens.colorBrandBackground}`,
      outlineOffset: '2px',
    },
  },

  // ============================================
  // APP LAYOUT - Responsive
  // ============================================
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  appBody: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  // ============================================
  // SIDEBAR - Responsive
  // ============================================
  sidebar: {
    width: '260px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    transition: `width ${motion.normal} ${motion.easeOut}`,
    '@media (max-width: 1024px)': {
      width: '220px',
    },
    '@media (max-width: 768px)': {
      width: '72px',
    },
  },
  sidebarHeader: {
    padding: `${spacing.lg} ${spacing.xl}`,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    '@media (max-width: 768px)': {
      padding: spacing.md,
      justifyContent: 'center',
    },
  },
  sidebarLogo: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '18px',
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
  },
  sidebarTitle: {
    fontSize: '15px',
    fontWeight: 600,
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  sidebarNav: {
    flex: 1,
    padding: `${spacing.sm} ${spacing.md}`,
    overflowY: 'auto',
  },
  navLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
    padding: `${spacing.md} ${spacing.md} ${spacing.sm}`,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '2px',
    borderLeft: '3px solid transparent',
    transition: `all ${motion.fast} ${motion.easeOut}`,
    color: tokens.colorNeutralForeground2,
    outline: 'none',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorBrandBackground}`,
      outlineOffset: '2px',
    },
    ':active': {
      transform: 'scale(0.98)',
      backgroundColor: tokens.colorNeutralBackground4,
    },
    '@media (max-width: 768px)': {
      justifyContent: 'center',
      padding: spacing.md,
    },
  },
  navItemActive: {
    backgroundColor: tokens.colorNeutralBackground3,
    borderLeftColor: tokens.colorBrandBackground,
    color: tokens.colorBrandForeground1,
    fontWeight: 600,
    boxShadow: elevation.shadow2,
    '@media (max-width: 768px)': {
      borderLeftColor: 'transparent',
      borderBottomColor: tokens.colorBrandBackground,
    },
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  navText: {
    flex: 1,
    fontSize: '14px',
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  navBadge: {
    fontSize: '12px',
    fontWeight: 600,
    padding: `3px ${spacing.sm}`,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
    color: '#7C3AED',
    border: '1px solid rgba(124, 58, 237, 0.2)',
    '@media (max-width: 768px)': {
      position: 'absolute' as const,
      top: '-4px',
      right: '-4px',
      minWidth: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 5px',
    },
  },
  navBadgeUrgent: {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
    color: '#DC2626',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  navItemWrapper: {
    position: 'relative' as const,
  },
  sidebarStats: {
    margin: `${spacing.sm} ${spacing.md}`,
    padding: spacing.lg,
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: spacing.sm,
    boxShadow: elevation.shadow2,
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  statsHeader: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: spacing.md,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: spacing.sm,
    color: tokens.colorNeutralForeground2,
  },
  statsValue: {
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  statsValueGreen: {
    fontWeight: 600,
    color: tokens.colorPaletteGreenForeground1,
  },

  // ============================================
  // MAIN CONTENT - Responsive
  // ============================================
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
    minWidth: 0,
  },
  heroHeader: {
    background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
    padding: `${spacing.xxxl} ${spacing.xxxxl}`,
    margin: `${spacing.xxl} ${spacing.xxxl}`,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative' as const,
    overflow: 'hidden',
    minHeight: '180px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)',
    '@media (max-width: 768px)': {
      padding: `${spacing.xl} ${spacing.lg}`,
      margin: `${spacing.lg}`,
      minHeight: '140px',
      borderRadius: '12px',
    },
  },
  heroContent: {
    position: 'relative' as const,
    zIndex: 1,
    maxWidth: '60%',
    '@media (max-width: 768px)': {
      maxWidth: '100%',
    },
  },
  heroTitle: {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: spacing.sm,
    lineHeight: '1.2',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    '@media (max-width: 768px)': {
      fontSize: '24px',
    },
  },
  heroSubtitle: {
    fontSize: '15px',
    opacity: 0.95,
    lineHeight: '1.5',
    maxWidth: '500px',
    '@media (max-width: 768px)': {
      fontSize: '14px',
    },
  },
  heroIllustration: {
    position: 'absolute' as const,
    right: spacing.xxxxl,
    bottom: 0,
    width: '280px',
    height: '180px',
    zIndex: 0,
    '@media (max-width: 1024px)': {
      width: '200px',
      height: '140px',
      right: spacing.xl,
    },
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  sectionHeader: {
    padding: `${spacing.lg} ${spacing.xxl}`,
    margin: `0 ${spacing.xxxl}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    '@media (max-width: 768px)': {
      padding: `${spacing.md} ${spacing.lg}`,
      margin: `0 ${spacing.lg}`,
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  toolbar: {
    padding: `${spacing.md} ${spacing.xxxxl}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '52px',
    '@media (max-width: 768px)': {
      padding: `${spacing.md} ${spacing.lg}`,
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  toolbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskCount: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },

  // ============================================
  // CONTENT AREA - Responsive
  // ============================================
  contentArea: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    '@media (max-width: 1024px)': {
      flexDirection: 'column',
    },
  },
  taskList: {
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing.xl} ${spacing.xxl}`,
    margin: `0 ${spacing.xxxl} ${spacing.xxl} ${spacing.xxxl}`,
    '@media (max-width: 768px)': {
      padding: spacing.lg,
      margin: `0 ${spacing.lg} ${spacing.lg} ${spacing.lg}`,
    },
  },
  taskListSplit: {
    maxWidth: '55%',
    '@media (max-width: 1024px)': {
      maxWidth: '100%',
      flex: '0 0 auto',
      maxHeight: '40vh',
    },
  },

  // ============================================
  // TASK CARD - with focus, active states
  // ============================================
  taskCard: {
    marginBottom: spacing.md,
    padding: '0',
    cursor: 'pointer',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '12px',
    transition: `all ${motion.normal} ${motion.easeOut}`,
    overflow: 'hidden',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    ':hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)',
      border: `1px solid ${tokens.colorBrandStroke1}`,
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colorBrandBackground}`,
      outlineOffset: '2px',
    },
    ':active': {
      transform: 'scale(0.995)',
    },
  },
  taskCardSelected: {
    border: `2px solid ${tokens.colorBrandBackground}`,
    backgroundColor: tokens.colorBrandBackground2,
    boxShadow: elevation.shadow8,
  },
  taskCardInner: {
    padding: `${spacing.lg} ${spacing.xl}`,
    display: 'flex',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  taskCheckbox: {
    paddingTop: '2px',
  },
  taskBody: {
    flex: 1,
    minWidth: 0,
  },
  taskHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  taskBadgeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  taskTypeActionable: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: '#7C3AED',
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
    border: '1px solid rgba(124, 58, 237, 0.2)',
    padding: `4px ${spacing.md}`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  taskTypeViewOnly: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: tokens.colorNeutralForeground2,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: `2px ${spacing.sm}`,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  taskDate: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
  },
  taskDateUrgent: {
    color: tokens.colorPaletteRedForeground1,
    fontWeight: 500,
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '4px',
    color: tokens.colorNeutralForeground1,
  },
  taskDesc: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    marginBottom: spacing.sm,
    lineHeight: '1.4',
  },
  taskFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  taskAuthorName: {
    marginRight: spacing.sm,
  },
  taskDepartment: {
    color: tokens.colorNeutralForeground3,
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  taskCardActions: {
    display: 'flex',
    gap: spacing.sm,
  },

  // ============================================
  // DETAIL PANEL - Responsive
  // ============================================
  detailPanel: {
    width: '45%',
    backgroundColor: tokens.colorNeutralBackground1,
    borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: elevation.shadow8,
    '@media (max-width: 1024px)': {
      width: '100%',
      flex: 1,
      borderLeft: 'none',
      borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },
  },
  detailHeader: {
    padding: `${spacing.md} ${spacing.xl}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailHeaderBtns: {
    display: 'flex',
    gap: '4px',
  },
  detailBody: {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.xxl,
  },
  detailType: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
    marginBottom: spacing.sm,
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '1.4',
    marginBottom: spacing.xl,
    color: tokens.colorNeutralForeground1,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: `${spacing.lg} ${spacing.xxl}`,
    marginBottom: spacing.xxl,
    paddingBottom: spacing.xl,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
  detailField: {},
  detailFieldFull: {
    gridColumn: 'span 2',
    '@media (max-width: 480px)': {
      gridColumn: 'span 1',
    },
  },
  detailFieldLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
    marginBottom: '4px',
  },
  detailFieldValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  detailSectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground2,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
    marginBottom: spacing.sm,
  },
  detailDescription: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.6',
    padding: spacing.lg,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '6px',
    marginBottom: spacing.lg,
  },
  detailInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: `${spacing.md} ${spacing.lg}`,
    backgroundColor: tokens.colorBrandBackground2,
    borderRadius: '6px',
    fontSize: '13px',
    color: tokens.colorBrandForeground1,
  },
  detailInfoWarning: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: `${spacing.md} ${spacing.lg}`,
    backgroundColor: tokens.colorPaletteYellowBackground1,
    borderRadius: '6px',
    fontSize: '15px',
    color: tokens.colorPaletteYellowForeground2,
  },
  detailFooter: {
    padding: `${spacing.lg} ${spacing.xxl}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.md,
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
  detailFooterViewOnly: {
    padding: `${spacing.lg} ${spacing.xxl}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    justifyContent: 'center',
  },

  // ============================================
  // EMPTY STATE
  // ============================================
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `60px ${spacing.xl}`,
    textAlign: 'center' as const,
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: tokens.colorPaletteGreenBackground1,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    color: tokens.colorPaletteGreenForeground1,
    boxShadow: elevation.shadow4,
  },

  // ============================================
  // KEYBOARD SHORTCUTS HINT
  // ============================================
  // ============================================
  // CONFIRMATION MODAL STYLES
  // ============================================
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '16px',
    padding: spacing.xxl,
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    position: 'relative' as const,
  },
  modalHeader: {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: spacing.md,
    color: tokens.colorNeutralForeground1,
  },
  modalBody: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
    marginBottom: spacing.xxl,
    lineHeight: '1.5',
  },
  modalFooter: {
    display: 'flex',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  characterCounter: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    marginTop: spacing.xs,
    textAlign: 'right' as const,
  },
  characterCounterError: {
    color: '#e53e3e',
  },
  // ============================================
  // BUTTON STYLES with active state
  // ============================================
  btnActive: {
    ':active': {
      transform: 'scale(0.96)',
    },
  },
});

// ============================================
// INTERFACES
// ============================================
interface Attachment {
  name: string;
  size: string;
}

interface Task {
  id: number;
  type: string;
  number: string;
  date: string;
  urgent: boolean;
  docType: string;
  contractor: string;
  summary: string;
  preparedBy: string;
  preparedByDept: string;
  createdBy: string;
  createdByDept: string;
  attachments: Attachment[];
}

interface SystemItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  urgent: boolean;
}

// ============================================
// DATA
// ============================================
const systems: SystemItem[] = [
  { id: 'erp', name: 'ERP Система', icon: <Database size={20} style={{ color: '#7C3AED' }} aria-hidden="true" />, count: 5, urgent: true },
  { id: 'docflow', name: 'Документообіг', icon: <FileText size={20} style={{ color: '#2563EB' }} aria-hidden="true" />, count: 12, urgent: false },
  { id: 'bpms', name: 'BPMS', icon: <LayoutGrid size={20} style={{ color: '#0891B2' }} aria-hidden="true" />, count: 3, urgent: false },
  { id: 'access', name: 'Контроль доступу', icon: <Shield size={20} style={{ color: '#10B981' }} aria-hidden="true" />, count: 7, urgent: true },
  { id: 'finance', name: 'Фінанси', icon: <CreditCard size={20} style={{ color: '#F59E0B' }} aria-hidden="true" />, count: 2, urgent: false },
  { id: 'hr', name: 'Відпустки та кадри', icon: <Users size={20} style={{ color: '#EC4899' }} aria-hidden="true" />, count: 4, urgent: false },
];

const initialTasks: Task[] = [
  { id: 1, type: 'Візування', number: '№12345', date: '06.02.2026', urgent: true, docType: 'Службова записка', contractor: 'ТОВ "Альфа-Трейд"', summary: 'Реорганізація відділу маркетингу та впровадження нових KPI для Q1 2026.', preparedBy: 'Оболоник А.С.', preparedByDept: 'Відділ управління операційними системами', createdBy: 'Іваненко М.В.', createdByDept: 'Канцелярія', attachments: [{ name: 'Договір_постачання.pdf', size: '2.4 MB' }, { name: 'Специфікація.xlsx', size: '156 KB' }] },
  { id: 2, type: 'Підписання', number: '№987-Н', date: '10.02.2026', urgent: false, docType: 'Наказ', contractor: '—', summary: 'Відрядження до м. Одеса для проведення аудиту філії.', preparedBy: 'Коваленко І.П.', preparedByDept: 'Відділ кадрів', createdBy: 'Коваленко І.П.', createdByDept: 'Відділ кадрів', attachments: [{ name: 'Кошторис_45.pdf', size: '320 KB' }] },
  { id: 3, type: 'По руху', number: '№0042', date: '11.02.2026', urgent: false, docType: 'Заявка', contractor: 'Adobe Inc.', summary: 'Закупівля 5 ліцензій Adobe Creative Cloud.', preparedBy: 'Сидоренко О.М.', preparedByDept: 'IT департамент', createdBy: 'Сидоренко О.М.', createdByDept: 'IT департамент', attachments: [] },
  { id: 4, type: 'Розгляд', number: '№0098', date: '12.02.2026', urgent: false, docType: 'Договір', contractor: 'ПП "ТехноПостач"', summary: 'Розгляд договору з постачальником обладнання.', preparedBy: 'Петренко В.І.', preparedByDept: 'Юридичний відділ', createdBy: 'Бондаренко К.Л.', createdByDept: 'Юридичний відділ', attachments: [{ name: 'Договір.pdf', size: '1.2 MB' }] },
  { id: 5, type: 'Візування', number: '№0156', date: '08.02.2026', urgent: true, docType: 'Бюджет', contractor: '—', summary: 'Бюджет на Q2 2026 — затвердження видатків.', preparedBy: 'Мельник О.П.', preparedByDept: 'Фінансовий відділ', createdBy: 'Ткаченко Р.С.', createdByDept: 'Фінансовий відділ', attachments: [{ name: 'Бюджет_Q2.xlsx', size: '890 KB' }] },
];

// ============================================
// MAIN COMPONENT
// ============================================
export const ApproveHub: React.FC = () => {
  const styles = useStyles();
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  // State
  const [activeSystem, setActiveSystem] = useState('docflow');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
  const [liveRegionMessage, setLiveRegionMessage] = useState('');

  // Toast notifications
  const showToast = useCallback((title: string, body: string, intent: ToastIntent = 'success') => {
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        <ToastBody>{body}</ToastBody>
      </Toast>,
      { intent, timeout: 5000 }
    );
    // Update live region for screen readers
    setLiveRegionMessage(`${title}: ${body}`);
    setTimeout(() => setLiveRegionMessage(''), 100);
  }, [dispatchToast]);

  // Handlers
  const handleSystemClick = useCallback((id: string) => {
    setActiveSystem(id);
    setCurrentTask(null);
    setRejectReason('');
    setAttachmentsLoading(false);
    setAttachmentsLoaded(false);
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setCurrentTask(task);
    setRejectReason('');
    setAttachmentsLoading(false);
    setAttachmentsLoaded(false);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setCurrentTask(null);
    setRejectReason('');
  }, []);

  const handleApprove = useCallback(() => {
    if (currentTask) {
      setTasks(prev => prev.filter(t => t.id !== currentTask.id));
      setCurrentTask(null);
      showToast('Затверджено', `Документ ${currentTask.number} успішно затверджено`, 'success');
    }
  }, [currentTask, showToast]);

  const handleApproveTask = useCallback((e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== task.id));
    setSelectedTasks(prev => prev.filter(id => id !== task.id));
    if (currentTask?.id === task.id) {
      setCurrentTask(null);
    }
    showToast('Затверджено', `Документ ${task.number} успішно затверджено`, 'success');
  }, [currentTask, showToast]);

  const handleRejectConfirm = useCallback(() => {
    if (currentTask && rejectReason.trim()) {
      setTasks(prev => prev.filter(t => t.id !== currentTask.id));
      setCurrentTask(null);
      setRejectReason('');
      showToast('Відхилено', `Документ ${currentTask.number} відхилено`, 'warning');
    }
  }, [currentTask, rejectReason, showToast]);

  const handleApproveSelected = useCallback(() => {
    setShowBulkApproveModal(true);
  }, []);

  const handleConfirmBulkApprove = useCallback(() => {
    const count = selectedTasks.length;
    setTasks(prev => prev.filter(t => !selectedTasks.includes(t.id)));
    setSelectedTasks([]);
    setCurrentTask(null);
    setShowBulkApproveModal(false);
    showToast('Затверджено', `${count} документів успішно затверджено`, 'success');
  }, [selectedTasks, showToast]);

  const toggleTaskSelection = useCallback((id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task && !isActionable(task.type)) return;
    setSelectedTasks(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, [tasks]);

  const handleLoadAttachments = useCallback(() => {
    setAttachmentsLoading(true);
    setTimeout(() => {
      setAttachmentsLoading(false);
      setAttachmentsLoaded(true);
    }, 1500);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Close modals with Escape
      if (e.key === 'Escape') {
        if (showBulkApproveModal) {
          e.preventDefault();
          setShowBulkApproveModal(false);
          return;
        }
        handleCloseDetail();
        return;
      }

      // Approve: A
      if (e.key === 'a' && currentTask && isActionable(currentTask.type)) {
        e.preventDefault();
        handleApprove();
      }

      // Reject: R (if reason filled)
      if (e.key === 'r' && currentTask && isActionable(currentTask.type) && rejectReason.trim() && rejectReason.length <= 500) {
        e.preventDefault();
        handleRejectConfirm();
      }

      // Search: /
      if (e.key === '/') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTask, rejectReason, showBulkApproveModal, handleApprove, handleRejectConfirm, handleCloseDetail]);

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.type.toLowerCase().includes(query) ||
      task.number.toLowerCase().includes(query) ||
      task.summary.toLowerCase().includes(query) ||
      task.preparedBy.toLowerCase().includes(query)
    );
  });

  const actionableTasks = filteredTasks.filter(t => isActionable(t.type));
  const isAllSelected = actionableTasks.length > 0 && actionableTasks.every(t => selectedTasks.includes(t.id));
  const selectedCount = selectedTasks.length;

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedTasks(actionableTasks.map(t => t.id));
    } else {
      setSelectedTasks([]);
    }
  }, [actionableTasks]);

  const activeSystemData = systems.find(s => s.id === activeSystem);

  return (
    <div lang="uk" className={styles.app} role="application" aria-label="ApproveHub - Центр затверджень">
      <Toaster toasterId={toasterId} position="top-end" />

      <div className={styles.appBody}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar} role="navigation" aria-label="Навігація по системах">
        <div className={styles.sidebarHeader}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '20px' }}>✓</span>
          </div>
          <span className={styles.sidebarTitle}>ApproveHub</span>
        </div>

        <nav className={styles.sidebarNav} aria-label="Список систем">
          <div className={styles.navLabel} id="systems-label">Системи затвердження</div>
          <ul role="listbox" aria-labelledby="systems-label" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {systems.map(sys => (
              <li key={sys.id} className={styles.navItemWrapper}>
                <div
                  role="option"
                  aria-selected={activeSystem === sys.id}
                  tabIndex={0}
                  className={`${styles.navItem} ${activeSystem === sys.id ? styles.navItemActive : ''}`}
                  onClick={() => handleSystemClick(sys.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSystemClick(sys.id);
                    }
                  }}
                >
                  <span className={styles.navIcon} aria-hidden="true">{sys.icon}</span>
                  <span className={styles.navText}>{sys.name}</span>
                  <span 
                    className={`${styles.navBadge} ${sys.urgent ? styles.navBadgeUrgent : ''}`}
                    aria-label={`${sys.count} документів${sys.urgent ? ', терміново' : ''}`}
                  >
                    {sys.count}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarStats} role="region" aria-label="Статистика">
          <div className={styles.statsHeader}>
            <BarChart3 size={20} style={{ color: '#7C3AED' }} aria-hidden="true" />
            <span>Сьогодні</span>
          </div>
          <div className={styles.statsRow}>
            <span>Оброблено</span>
            <span className={styles.statsValue}>8/15</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            background: 'rgba(124, 58, 237, 0.1)', 
            borderRadius: '3px',
            overflow: 'hidden',
            marginTop: '8px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '53%',
              height: '100%',
              background: 'linear-gradient(90deg, #7C3AED 0%, #2563EB 100%)',
              borderRadius: '3px',
              transition: 'width 0.6s ease-out'
            }} />
          </div>
          <div className={styles.statsRow}>
            <span>Залишилось</span>
            <span className={styles.statsValue}>{tasks.length}</span>
          </div>
          <div className={styles.statsRow}>
            <span>Затверджено сьогодні</span>
            <span className={styles.statsValueGreen}>8</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main} role="main" aria-label="Список документів">
        <header className={styles.heroHeader}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Центр затверджень</h1>
            <p className={styles.heroSubtitle}>
              Швидке опрацювання та затвердження документів з усіх оперативних систем компанії
            </p>
          </div>
          {/* Hero Illustration */}
          <div className={styles.heroIllustration} aria-hidden="true">
            <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Desk */}
              <rect x="40" y="140" width="200" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
              {/* Person */}
              <circle cx="140" cy="80" r="20" fill="rgba(255,255,255,0.3)"/>
              <rect x="125" y="100" width="30" height="40" rx="8" fill="rgba(255,255,255,0.3)"/>
              {/* Documents Stack */}
              <rect x="180" y="100" width="50" height="40" rx="4" fill="rgba(255,255,255,0.25)"/>
              <rect x="185" y="95" width="50" height="40" rx="4" fill="rgba(255,255,255,0.3)"/>
              <rect x="190" y="90" width="50" height="40" rx="4" fill="rgba(255,255,255,0.35)"/>
              {/* Checkmarks */}
              <circle cx="215" cy="70" r="15" fill="#10B981"/>
              <path d="M209 70L213 74L221 66" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="245" cy="85" r="12" fill="#10B981"/>
              <path d="M240 85L243 88L250 81" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              {/* Laptop */}
              <rect x="80" y="115" width="60" height="35" rx="4" fill="rgba(255,255,255,0.2)"/>
              <rect x="85" y="120" width="50" height="25" rx="2" fill="rgba(59,130,246,0.3)"/>
              {/* Decorative Elements */}
              <circle cx="250" cy="40" r="8" fill="rgba(255,255,255,0.15)"/>
              <circle cx="60" cy="50" r="6" fill="rgba(255,255,255,0.1)"/>
              <circle cx="90" cy="30" r="10" fill="rgba(255,255,255,0.12)"/>
            </svg>
          </div>
        </header>

        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <FileText size={20} aria-hidden="true" />
            <span>{activeSystemData?.name}</span>
          </div>
          <Input
            data-search-input
            contentBefore={<Search size={20} aria-hidden="true" />}
            placeholder="Пошук... (натисніть /)"
            style={{ width: '240px' }}
            value={searchQuery}
            onChange={(_e, data) => setSearchQuery(data.value)}
            aria-label="Пошук документів"
          />
        </div>

        <div className={styles.toolbar} role="toolbar" aria-label="Панель інструментів">
          <div className={styles.toolbarLeft}>
            <Checkbox
              label="Вибрати всі"
              checked={isAllSelected}
              onChange={(_e, data) => handleSelectAll(!!data.checked)}
              aria-label={`Вибрати всі документи для затвердження (${actionableTasks.length})`}
            />
          </div>
          <div className={styles.toolbarRight}>
            {selectedCount > 0 && (
              <Button
                icon={<Check size={16} aria-hidden="true" />}
                onClick={handleApproveSelected}
                className={styles.btnActive}
                style={{
                  backgroundColor: hoveredBtn === 'toolbar-approve' ? '#22a566' : '#f0fff4',
                  color: hoveredBtn === 'toolbar-approve' ? 'white' : '#22a566',
                  border: '1px solid #22a566',
                  borderRadius: '8px',
                  padding: '6px 20px',
                  fontWeight: 600,
                  transition: `all ${motion.fast} ${motion.easeOut}`,
                }}
                onMouseEnter={() => setHoveredBtn('toolbar-approve')}
                onMouseLeave={() => setHoveredBtn(null)}
                aria-label={`Затвердити ${selectedCount} обраних документів`}
              >
                Затвердити обрані ({selectedCount})
              </Button>
            )}
            <span className={styles.taskCount} aria-live="polite">
              {filteredTasks.length} документів
            </span>
          </div>
        </div>

        <div className={styles.contentArea}>
          <div 
            className={`${styles.taskList} ${currentTask ? styles.taskListSplit : ''}`}
            role="list"
            aria-label="Список документів на затвердження"
          >
            {filteredTasks.length === 0 ? (
              // Empty state - all done
              searchQuery.trim() ? (
                // No search results
                <div className={styles.emptyState} role="status">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ marginBottom: spacing.lg }}>
                    {/* Magnifying glass */}
                    <circle cx="50" cy="50" r="20" stroke="#7C3AED" strokeWidth="3" fill="none"/>
                    <line x1="65" y1="65" x2="80" y2="80" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round"/>
                    {/* Question mark */}
                    <circle cx="90" cy="35" r="15" fill="rgba(124, 58, 237, 0.1)"/>
                    <text x="90" y="42" fontSize="18" fill="#7C3AED" textAnchor="middle" fontWeight="600">?</text>
                  </svg>
                  <Text weight="semibold" size={500} style={{ marginBottom: spacing.xs }}>
                    Нічого не знайдено
                  </Text>
                  <Text style={{ color: tokens.colorNeutralForeground2, textAlign: 'center', marginBottom: spacing.md }}>
                    За запитом "{searchQuery}" не знайдено документів
                  </Text>
                  <Button 
                    appearance="subtle" 
                    onClick={() => setSearchQuery('')}
                    style={{ marginTop: spacing.sm }}
                  >
                    Очистити пошук
                  </Button>
                </div>
              ) : (
                // All tasks completed
                <div className={styles.emptyState} role="status">
                  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" style={{ marginBottom: spacing.lg }}>
                    {/* Coffee cup */}
                    <rect x="45" y="70" width="50" height="55" rx="6" fill="url(#coffeeGradient)"/>
                    <ellipse cx="70" cy="70" rx="25" ry="6" fill="#059669"/>
                    <rect x="90" y="90" width="8" height="25" rx="4" fill="#059669"/>
                    {/* Steam */}
                    <path d="M55 60 Q 50 50 55 40" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
                    <path d="M70 55 Q 65 45 70 35" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
                    <path d="M85 60 Q 80 50 85 40" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
                    {/* Checkmark badge */}
                    <circle cx="100" cy="50" r="18" fill="#10B981"/>
                    <path d="M93 50L98 55L107 44" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    {/* Decorative elements */}
                    <circle cx="25" cy="40" r="4" fill="rgba(124, 58, 237, 0.2)"/>
                    <circle cx="115" cy="100" r="5" fill="rgba(37, 99, 235, 0.2)"/>
                    <circle cx="30" cy="110" r="3" fill="rgba(16, 185, 129, 0.2)"/>
                    
                    <defs>
                      <linearGradient id="coffeeGradient" x1="45" y1="70" x2="95" y2="125">
                        <stop offset="0%" stopColor="#10B981"/>
                        <stop offset="100%" stopColor="#059669"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <Text weight="semibold" size={500} style={{ marginBottom: spacing.xs, fontSize: '18px' }}>
                    Чудова робота! ✨
                  </Text>
                  <Text style={{ color: tokens.colorNeutralForeground2, textAlign: 'center', lineHeight: '1.6' }}>
                    Усі документи в цій системі розглянуто.<br />
                    Час для кави ☕
                  </Text>
                  <div style={{ 
                    marginTop: spacing.xl, 
                    padding: spacing.md,
                    background: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#059669',
                    fontWeight: 500
                  }}>
                    🎯 Сьогодні опрацьовано: 8 документів
                  </div>
                </div>
              )
            ) : (
              filteredTasks.map(task => {
                const isSelected = currentTask?.id === task.id;
                const canApprove = isActionable(task.type);
                const isChecked = selectedTasks.includes(task.id);

                return (
                  <article
                    key={task.id}
                    role="listitem"
                    tabIndex={0}
                    aria-selected={isSelected}
                    aria-label={`${task.type} ${task.number}: ${task.summary}`}
                    className={`${styles.taskCard} ${isSelected ? styles.taskCardSelected : ''}`}
                    onClick={() => handleTaskClick(task)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTaskClick(task);
                      }
                    }}
                  >
                    <div className={styles.taskCardInner}>
                      <div className={styles.taskCheckbox} onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={isChecked}
                          disabled={!canApprove}
                          onChange={() => toggleTaskSelection(task.id)}
                          aria-label={`Вибрати документ ${task.number}`}
                        />
                      </div>
                      <div className={styles.taskBody}>
                        <div className={styles.taskHeader}>
                          <div className={styles.taskBadgeContainer}>
                            <span className={canApprove ? styles.taskTypeActionable : styles.taskTypeViewOnly}>
                              {canApprove ? <Check size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                              {task.type}
                            </span>
                          </div>
                          <span className={`${styles.taskDate} ${task.urgent ? styles.taskDateUrgent : ''}`}>
                            {task.urgent && <span aria-label="Терміново">🔥 </span>}
                            Строк: {task.date}
                          </span>
                        </div>
                        <h3 className={styles.taskTitle}>{task.number} — {task.summary.substring(0, 55)}...</h3>
                        <p className={styles.taskDesc}>{task.summary}</p>
                        <div className={styles.taskFooter}>
                          <div className={styles.taskMeta}>
                            <Avatar name={task.preparedBy} size={20} aria-hidden="true" />
                            <span className={styles.taskAuthorName}>{task.preparedBy}</span>
                            <span className={styles.taskDepartment}>· {task.preparedByDept}</span>
                          </div>
                          {canApprove && (
                            <div className={styles.taskCardActions}>
                              <Button
                                size="small"
                                icon={<Check size={16} aria-hidden="true" />}
                                onClick={(e) => handleApproveTask(e, task)}
                                className={styles.btnActive}
                                onMouseEnter={() => setHoveredBtn(`card-${task.id}`)}
                                onMouseLeave={() => setHoveredBtn(null)}
                                style={{
                                  backgroundColor: hoveredBtn === `card-${task.id}` ? '#22a566' : '#f0fff4',
                                  color: hoveredBtn === `card-${task.id}` ? 'white' : '#22a566',
                                  border: '1px solid #22a566',
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  transition: `all ${motion.fast} ${motion.easeOut}`,
                                }}
                                aria-label={`Затвердити документ ${task.number}`}
                              >
                                Затвердити
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* DETAIL PANEL */}
          {currentTask && (
            <aside 
              className={styles.detailPanel} 
              role="complementary" 
              aria-label={`Деталі документа ${currentTask.number}`}
            >
              <div className={styles.detailHeader}>
                <Button 
                  appearance="subtle" 
                  icon={<ExternalLink size={20} aria-hidden="true" />}
                  aria-label="Відкрити документ у зовнішній системі"
                >
                  Відкрити в системі
                </Button>
                <Button 
                  appearance="subtle" 
                  icon={<X size={20} aria-hidden="true" />} 
                  onClick={handleCloseDetail}
                  aria-label="Закрити панель деталей"
                />
              </div>

              <div className={styles.detailBody}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: tokens.colorBrandForeground1, marginBottom: spacing.sm }}>
                  {currentTask.type} {currentTask.number}
                </div>
                <div className={styles.detailTitle} id="detail-title">{currentTask.summary.substring(0, 60)}...</div>

                <section aria-labelledby="detail-info-heading" style={{ marginBottom: spacing.lg }}>
                  <div id="detail-info-heading" style={{ position: 'absolute', left: '-10000px' }}>Інформація про документ</div>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailField}>
                      <div className={styles.detailFieldLabel}>Строк</div>
                      <div className={styles.detailFieldValue}>{currentTask.date}</div>
                    </div>
                  <div className={styles.detailField}>
                    <div className={styles.detailFieldLabel}>Вид документа</div>
                    <div className={styles.detailFieldValue}>{currentTask.docType}</div>
                  </div>
                  <div className={styles.detailFieldFull}>
                    <div className={styles.detailFieldLabel}>Контрагент</div>
                    <div className={styles.detailFieldValue}>{currentTask.contractor}</div>
                  </div>
                </div>
                </section>

                <section aria-labelledby="detail-summary-heading">
                  <div id="detail-summary-heading" className={styles.detailSectionTitle}>Короткий зміст</div>
                  <div className={styles.detailDescription}>{currentTask.summary}</div>
                </section>

                <section aria-labelledby="detail-preparer-heading" style={{ marginBottom: spacing.lg }}>
                  <div id="detail-preparer-heading" className={styles.detailSectionTitle}>Готував</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: '4px' }}>
                    <Avatar name={currentTask.preparedBy} size={24} aria-hidden="true" />
                    <span style={{ fontWeight: 500 }}>{currentTask.preparedBy}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: tokens.colorNeutralForeground3, marginLeft: '34px' }}>
                    {currentTask.preparedByDept}
                  </div>
                </section>

                <section aria-labelledby="detail-creator-heading" style={{ marginBottom: spacing.lg }}>
                  <div id="detail-creator-heading" className={styles.detailSectionTitle}>Створив</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: '4px' }}>
                    <Avatar name={currentTask.createdBy} size={24} aria-hidden="true" />
                    <span style={{ fontWeight: 500 }}>{currentTask.createdBy}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: tokens.colorNeutralForeground3, marginLeft: '34px' }}>
                    {currentTask.createdByDept}
                  </div>
                </section>

                {/* Attachments */}
                {currentTask.attachments.length > 0 && (
                  <section 
                    aria-labelledby="attachments-heading"
                    style={{
                      marginBottom: spacing.lg,
                      border: `1px solid ${tokens.colorNeutralStroke2}`,
                      borderRadius: spacing.sm,
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${spacing.md} ${spacing.lg}`,
                      backgroundColor: tokens.colorNeutralBackground3,
                      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                        <Paperclip size={20} aria-hidden="true" />
                        <div id="attachments-heading" style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>
                          ВКЛАДЕННЯ ({currentTask.attachments.length})
                        </div>
                      </div>
                      {!attachmentsLoaded && (
                        <Button
                          size="small"
                          icon={attachmentsLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
                          onClick={handleLoadAttachments}
                          disabled={attachmentsLoading}
                          aria-label={attachmentsLoading ? 'Завантаження файлів...' : 'Завантажити вкладення'}
                          style={{
                            backgroundColor: 'transparent',
                            border: `1px solid ${tokens.colorBrandBackground}`,
                            color: tokens.colorBrandForeground1,
                            borderRadius: '6px',
                          }}
                        >
                          {attachmentsLoading ? 'Завантаження...' : 'Завантажити'}
                        </Button>
                      )}
                    </div>
                    <ul style={{ padding: `${spacing.sm} 0`, margin: 0, listStyle: 'none' }}>
                      {currentTask.attachments.map((file, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: `${spacing.sm} ${spacing.lg}`,
                            cursor: attachmentsLoaded ? 'pointer' : 'default',
                            opacity: attachmentsLoaded ? 1 : 0.6,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                            <File size={20} style={{ color: tokens.colorBrandBackground }} aria-hidden="true" />
                            <span style={{
                              fontSize: '13px',
                              color: attachmentsLoaded ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground2,
                              textDecoration: attachmentsLoaded ? 'underline' : 'none'
                            }}>
                              {file.name}
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>
                            {file.size}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Rejection reason (for actionable) */}
                {isActionable(currentTask.type) && (
                  <section aria-labelledby="reject-reason-heading" style={{ marginBottom: spacing.lg }}>
                    <div id="reject-reason-heading" className={styles.detailSectionTitle}>
                      Причина відхилення {!rejectReason.trim() && <span style={{ color: '#e53e3e' }}>*</span>}
                    </div>
                    <Textarea
                      placeholder="Опишіть детально причину відхилення документа. Наприклад: 'Документ не містить необхідних підписів' або 'Потрібні додаткові роз'яснення по пункту 3.2'"
                      value={rejectReason}
                      onChange={(_e, data) => {
                        const newValue = data.value;
                        if (newValue.length <= 500) {
                          setRejectReason(newValue);
                        }
                      }}
                      style={{
                        width: '100%',
                        minHeight: '100px',
                        borderColor: !rejectReason.trim() ? '#e53e3e' : rejectReason.length > 500 ? '#e53e3e' : undefined,
                      }}
                      aria-label="Причина відхилення документа"
                      aria-required="true"
                      aria-invalid={!rejectReason.trim() || rejectReason.length > 500}
                      aria-describedby="reject-reason-hint reject-reason-counter"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }}>
                      {!rejectReason.trim() ? (
                        <div id="reject-reason-hint" style={{ fontSize: '12px', color: '#e53e3e' }}>
                          * Обов'язкове поле для відхилення документа
                        </div>
                      ) : (
                        <div id="reject-reason-hint" style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>
                          Вкажіть конкретну та зрозумілу причину відхилення
                        </div>
                      )}
                      <div 
                        id="reject-reason-counter"
                        className={`${styles.characterCounter} ${rejectReason.length > 500 ? styles.characterCounterError : ''}`}
                        aria-live="polite"
                      >
                        {rejectReason.length}/500
                      </div>
                    </div>
                  </section>
                )}

                {/* View-only warning */}
                {!isActionable(currentTask.type) && (
                  <div className={styles.detailInfoWarning} role="alert">
                    <AlertCircle size={20} aria-hidden="true" />
                    <span>Цей документ доступний лише для перегляду. Для затвердження перейдіть у систему.</span>
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              {isActionable(currentTask.type) ? (
                <div className={styles.detailFooter}>
                  <Button
                    icon={<Check size={20} aria-hidden="true" />}
                    onClick={handleApprove}
                    className={styles.btnActive}
                    onMouseEnter={() => setHoveredBtn('detail-approve')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      backgroundColor: hoveredBtn === 'detail-approve' ? '#22a566' : '#f0fff4',
                      color: hoveredBtn === 'detail-approve' ? 'white' : '#22a566',
                      border: '1px solid #22a566',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontWeight: 600,
                      transition: `all ${motion.fast} ${motion.easeOut}`,
                    }}
                    aria-label="Затвердити документ (клавіша A)"
                  >
                    Затвердити
                  </Button>
                  <Button
                    icon={<X size={20} aria-hidden="true" />}
                    onClick={handleRejectConfirm}
                    disabled={!rejectReason.trim() || rejectReason.length > 500}
                    className={styles.btnActive}
                    onMouseEnter={() => setHoveredBtn('detail-reject')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      backgroundColor: (!rejectReason.trim() || rejectReason.length > 500) ? '#f5f5f5' : (hoveredBtn === 'detail-reject' ? '#fee2e2' : 'transparent'),
                      color: (!rejectReason.trim() || rejectReason.length > 500) ? '#999' : '#e53e3e',
                      border: `1px solid ${(!rejectReason.trim() || rejectReason.length > 500) ? '#ccc' : '#e53e3e'}`,
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontWeight: 600,
                      transition: `all ${motion.fast} ${motion.easeOut}`,
                      cursor: (!rejectReason.trim() || rejectReason.length > 500) ? 'not-allowed' : 'pointer',
                    }}
                    aria-label={
                      rejectReason.length > 500 
                        ? "Причина відхилення перевищує ліміт 500 символів" 
                        : (rejectReason.trim() ? "Відхилити документ (клавіша R)" : "Введіть причину відхилення")
                    }
                  >
                    Відхилити
                  </Button>
                </div>
              ) : (
                <div className={styles.detailFooterViewOnly}>
                  <Button
                    icon={<ExternalLink size={20} aria-hidden="true" />}
                    className={styles.btnActive}
                    onMouseEnter={() => setHoveredBtn('open-system')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      backgroundColor: hoveredBtn === 'open-system' ? '#0078d4' : '#e6f2ff',
                      color: hoveredBtn === 'open-system' ? 'white' : '#0078d4',
                      border: '1px solid #0078d4',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontWeight: 600,
                      transition: `all ${motion.fast} ${motion.easeOut}`,
                    }}
                    aria-label="Відкрити документ у зовнішній системі"
                  >
                    Відкрити в системі
                  </Button>
                </div>
              )}
            </aside>
          )}
        </div>
      </main>

      {/* Bulk Approve Confirmation Modal */}
      {showBulkApproveModal && selectedTasks.length > 0 && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setShowBulkApproveModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-approve-modal-title"
          aria-describedby="bulk-approve-modal-description"
        >
          <div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div id="bulk-approve-modal-title" className={styles.modalHeader}>Масове затвердження</div>
            <div id="bulk-approve-modal-description" className={styles.modalBody}>
              <p>Ви впевнені, що хочете затвердити <strong>{selectedTasks.length}</strong> {selectedTasks.length === 1 ? 'документ' : selectedTasks.length < 5 ? 'документи' : 'документів'}?</p>
              <div style={{ 
                marginTop: spacing.md, 
                padding: spacing.md, 
                backgroundColor: tokens.colorNeutralBackground3,
                borderRadius: spacing.sm,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {tasks.filter(t => selectedTasks.includes(t.id)).map(task => (
                  <div key={task.id} style={{ 
                    padding: spacing.sm,
                    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
                    fontSize: '13px'
                  }}>
                    <div style={{ fontWeight: 600 }}>{task.number}</div>
                    <div style={{ color: tokens.colorNeutralForeground3 }}>{task.summary}</div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: spacing.md, fontSize: '13px', color: tokens.colorNeutralForeground3 }}>
                ⚠️ Ця дія обробить всі вибрані документи одночасно. Скасувати масове затвердження неможливо.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <Button
                appearance="secondary"
                onClick={() => setShowBulkApproveModal(false)}
                style={{ borderRadius: '8px' }}
                aria-label="Скасувати масове затвердження"
              >
                Скасувати
              </Button>
              <Button
                appearance="primary"
                onClick={handleConfirmBulkApprove}
                style={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderColor: '#10B981',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
                aria-label={`Підтвердити затвердження ${selectedTasks.length} документів`}
              >
                Затвердити всі ({selectedTasks.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Screen reader live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {liveRegionMessage}
      </div>
      </div> {/* Close appBody */}
    </div>
  );
};

export default ApproveHub;
