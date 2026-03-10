import { useState, useCallback, useMemo, useEffect } from 'react';
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
  Dropdown,
  Option,
  Tooltip,
} from '@fluentui/react-components';
import type { ToastIntent } from '@fluentui/react-components';
import {
  Search,
  ExternalLink,
  Check,
  X,
  Inbox,
  Key,
  FileEdit,
  Trophy,
  Paperclip,
  Download,
  File,
  Loader2,
  Eye,
  AlertCircle,
  Flame,
  ArrowUpDown,
  Sparkles,
  HelpCircle,
  Lightbulb,
  LayoutGrid,
  Wallet,
  FileText,
  Users,
  Settings,
  Shield,
  Archive,
} from 'lucide-react';

// ============================================
// DESIGN TOKENS
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

const elevation = {
  shadow2: '0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)',
  shadow4: '0 2px 4px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.1)',
  shadow8: '0 4px 8px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.1)',
} as const;

const motion = {
  fast: '100ms',
  normal: '200ms',
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
} as const;

// Document type categories
const ACTIONABLE_TYPES = ['Візування', 'Підписання'];
const isActionable = (type: string) => ACTIONABLE_TYPES.includes(type);

// Filter categories
const filterCategories = [
  { id: 'all',       label: 'Всі',       icon: LayoutGrid },
  { id: 'finance',   label: 'Фінанси',   icon: Wallet },
  { id: 'documents', label: 'Документи', icon: FileText },
  { id: 'hr',        label: 'Кадри',     icon: Users },
  { id: 'processes', label: 'Процеси',   icon: Settings },
  { id: 'access',    label: 'Доступи',   icon: Shield },
];

// Sorting options
const sortOptions = [
  { id: 'date-asc',  label: 'За строком (спочатку термінові)' },
  { id: 'date-desc', label: 'За строком (спочатку пізні)' },
  { id: 'type',      label: 'За типом' },
  { id: 'author',    label: 'За автором (А → Я)' },
];

// ─── inline border helper (використовується в style={} пропах) ───────────────
const ib = (color: string, width = '1px'): React.CSSProperties => ({
  borderTopWidth:    width, borderBottomWidth:    width,
  borderLeftWidth:   width, borderRightWidth:     width,
  borderTopStyle:   'solid', borderBottomStyle:   'solid',
  borderLeftStyle:  'solid', borderRightStyle:    'solid',
  borderTopColor:   color,  borderBottomColor:   color,
  borderLeftColor:  color,  borderRightColor:    color,
});

const useStyles = makeStyles({
  // ============================================
  // APP LAYOUT
  // ============================================
  app: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#F8FAFC',
  },

  // ============================================
  // SIDEBAR
  // ============================================
  sidebar: {
    width: '240px',
    backgroundColor: 'white',
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    borderRightColor: tokens.colorNeutralStroke2,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: `${spacing.xl} ${spacing.lg}`,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
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
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
  },
  sidebarTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
  },
  sidebarNav: {
    padding: `${spacing.sm} ${spacing.md}`,
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: spacing.xs,
    transition: `all ${motion.fast} ${motion.easeOut}`,
    color: tokens.colorNeutralForeground2,
    fontWeight: 500,
    fontSize: '14px',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  navItemActive: {
    backgroundColor: '#229FFF',
    color: 'white',
    fontWeight: 600,
    ':hover': {
      backgroundColor: '#1E8FE5',
    },
  },
  navItemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: 'transparent',
    },
  },
  navBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '12px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '10px',
    minWidth: '24px',
    textAlign: 'center' as const,
  },
  navBadgeInactive: {
    marginLeft: 'auto',
    backgroundColor: '#229FFF',
    color: 'white',
    fontSize: '12px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '10px',
    minWidth: '24px',
    textAlign: 'center' as const,
  },
  comingSoon: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
    marginLeft: 'auto',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },

  // ============================================
  // GAMIFICATION
  // ============================================
  progressBlock: {
    margin: spacing.md,
    padding: spacing.lg,
    background: 'linear-gradient(135deg, rgba(34, 159, 255, 0.03) 0%, rgba(37, 99, 235, 0.05) 100%)',
    borderRadius: '12px',
    borderTopWidth:    '1px',
    borderBottomWidth: '1px',
    borderLeftWidth:   '1px',
    borderRightWidth:  '1px',
    borderTopStyle:    'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle:   'solid',
    borderRightStyle:  'solid',
    borderTopColor:    tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor:   tokens.colorNeutralStroke2,
    borderRightColor:  tokens.colorNeutralStroke2,
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    fontWeight: 600,
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  progressStats: {
    display: 'flex',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  progressNumber: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#229FFF',
    lineHeight: 1,
  },
  progressLabel: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  progressBar: {
    height: '6px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#229FFF',
    borderRadius: '3px',
  },
  progressRank: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#10B981',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  },

  // ============================================
  // MAIN
  // ============================================
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
    backgroundColor: '#F8FAFC',
  },

  // ============================================
  // HERO HEADER
  // ============================================
  heroHeader: {
    background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
    padding: `${spacing.xxl} ${spacing.xxxl}`,
    margin: `${spacing.xl} ${spacing.xxl}`,
    color: 'white',
    position: 'relative' as const,
    overflow: 'hidden',
    minHeight: '100px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
  },
  heroContent: {
    position: 'relative' as const,
    zIndex: 1,
  },
  heroTitle: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: '14px',
    opacity: 0.9,
  },
  heroDecor1: {
    position: 'absolute' as const,
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: '-60px',
    right: '100px',
  },
  heroDecor2: {
    position: 'absolute' as const,
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: '-40px',
    right: '250px',
  },
  heroDecor3: {
    position: 'absolute' as const,
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: '20px',
    right: '350px',
  },

  // ============================================
  // FILTER BAR
  // ============================================
  filterBar: {
    padding: `${spacing.md} ${spacing.xl}`,
    margin: `0 ${spacing.xxl}`,
    marginTop: `-${spacing.lg}`,
    backgroundColor: 'white',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    boxShadow: elevation.shadow2,
    position: 'relative' as const,
    zIndex: 10,
  },
  filterChips: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    overflowX: 'auto',
  },
  filterChip: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: '20px',
    borderTopWidth:    '1px',
    borderBottomWidth: '1px',
    borderLeftWidth:   '1px',
    borderRightWidth:  '1px',
    borderTopStyle:    'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle:   'solid',
    borderRightStyle:  'solid',
    borderTopColor:    tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor:   tokens.colorNeutralStroke2,
    borderRightColor:  tokens.colorNeutralStroke2,
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap' as const,
    transition: `all ${motion.fast} ${motion.easeOut}`,
    ':hover': {
      borderTopColor:    '#229FFF',
      borderBottomColor: '#229FFF',
      borderLeftColor:   '#229FFF',
      borderRightColor:  '#229FFF',
      color: '#229FFF',
    },
  },
  filterChipActive: {
    backgroundColor: '#229FFF',
    borderTopColor:    '#229FFF',
    borderBottomColor: '#229FFF',
    borderLeftColor:   '#229FFF',
    borderRightColor:  '#229FFF',
    color: 'white',
    boxShadow: '0 2px 4px rgba(34, 159, 255, 0.3)',
    ':hover': {
      backgroundColor: '#1E8FE5',
      borderTopColor:    '#1E8FE5',
      borderBottomColor: '#1E8FE5',
      borderLeftColor:   '#1E8FE5',
      borderRightColor:  '#1E8FE5',
      color: 'white',
    },
  },
  filterSearch: {
    width: '240px',
    flexShrink: 0,
  },

  // ============================================
  // TOOLBAR
  // ============================================
  toolbar: {
    padding: `${spacing.md} ${spacing.xxl}`,
    margin: `${spacing.md} ${spacing.xxl} 0`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  taskCount: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },

  // ============================================
  // CONTENT AREA
  // ============================================
  contentArea: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  taskList: {
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing.sm} ${spacing.xxl}`,
  },
  taskListSplit: {
    maxWidth: '55%',
  },

  // ============================================
  // TASK CARD
  // ============================================
  taskCard: {
    marginBottom: spacing.md,
    backgroundColor: 'white',
    borderRadius: '12px',
    borderTopWidth:    '1px',
    borderBottomWidth: '1px',
    borderLeftWidth:   '1px',
    borderRightWidth:  '1px',
    borderTopStyle:    'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle:   'solid',
    borderRightStyle:  'solid',
    borderTopColor:    tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor:   tokens.colorNeutralStroke2,
    borderRightColor:  tokens.colorNeutralStroke2,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: `all ${motion.normal} ${motion.easeOut}`,
    boxShadow: elevation.shadow2,
    opacity: 1,
    transform: 'translateX(0) scale(1)',
    ':hover': {
      boxShadow: elevation.shadow4,
      transform: 'translateY(-1px)',
    },
  },
  taskCardSelected: {
    borderTopWidth:    '2px',
    borderBottomWidth: '2px',
    borderLeftWidth:   '2px',
    borderRightWidth:  '2px',
    borderTopColor:    '#229FFF',
    borderBottomColor: '#229FFF',
    borderLeftColor:   '#229FFF',
    borderRightColor:  '#229FFF',
    boxShadow: elevation.shadow8,
  },
  taskCardRemoving: {
    opacity: 0,
    transform: 'translateX(100px) scale(0.95)',
    transition: `all 400ms ${motion.easeOut}`,
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
    color: '#229FFF',
    background: 'linear-gradient(135deg, rgba(34, 159, 255, 0.1) 0%, rgba(34, 159, 255, 0.05) 100%)',
    borderTopWidth:    '1px',
    borderBottomWidth: '1px',
    borderLeftWidth:   '1px',
    borderRightWidth:  '1px',
    borderTopStyle:    'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle:   'solid',
    borderRightStyle:  'solid',
    borderTopColor:    'rgba(34, 159, 255, 0.2)',
    borderBottomColor: 'rgba(34, 159, 255, 0.2)',
    borderLeftColor:   'rgba(34, 159, 255, 0.2)',
    borderRightColor:  'rgba(34, 159, 255, 0.2)',
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
    padding: `4px ${spacing.md}`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  taskDate: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
  taskDateUrgent: {
    color: '#EF4444',
    fontWeight: 600,
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
  taskAuthorName: {},
  taskDepartment: {
    color: tokens.colorNeutralForeground3,
  },
  taskCardActions: {
    display: 'flex',
    gap: spacing.sm,
  },

  // ============================================
  // ARCHIVE STATUS BADGES
  // ============================================
  archiveStatusApproved: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: '#059669',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: `4px ${spacing.md}`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  archiveStatusRejected: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: '#DC2626',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: `4px ${spacing.md}`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  archiveProcessedDate: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  archiveRejectReason: {
    fontSize: '13px',
    color: '#DC2626',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    padding: spacing.md,
    borderRadius: '8px',
    marginTop: spacing.sm,
    lineHeight: '1.4',
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  // ============================================
  // DETAIL PANEL
  // ============================================
  detailPanel: {
    width: '45%',
    backgroundColor: 'white',
    borderLeftWidth:  '1px',
    borderLeftStyle:  'solid',
    borderLeftColor:  tokens.colorNeutralStroke2,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: elevation.shadow8,
  },
  detailHeader: {
    padding: `${spacing.md} ${spacing.xl}`,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailBody: {
    flex: 1,
    overflowY: 'auto',
    padding: spacing.xxl,
  },
  detailType: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#229FFF',
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
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke2,
  },
  detailField: {},
  detailFieldFull: {
    gridColumn: 'span 2',
  },
  detailFieldLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
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
    color: tokens.colorNeutralForeground3,
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
    borderRadius: '8px',
    fontStyle: 'italic' as const,
    marginBottom: spacing.lg,
  },
  detailInfoWarning: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: '#FEF3C7',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#92400E',
    marginBottom: spacing.lg,
  },
  detailFooter: {
    padding: `${spacing.lg} ${spacing.xxl}`,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.md,
  },
  detailFooterViewOnly: {
    padding: `${spacing.lg} ${spacing.xxl}`,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: tokens.colorNeutralStroke2,
    display: 'flex',
    justifyContent: 'center',
  },

  // ============================================
  // ATTACHMENTS BLOCK
  // ============================================
  attachmentsBlock: {
    marginBottom: spacing.lg,
    borderTopWidth:    '1px',
    borderBottomWidth: '1px',
    borderLeftWidth:   '1px',
    borderRightWidth:  '1px',
    borderTopStyle:    'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle:   'solid',
    borderRightStyle:  'solid',
    borderTopColor:    tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor:   tokens.colorNeutralStroke2,
    borderRightColor:  tokens.colorNeutralStroke2,
    borderRadius: spacing.sm,
    overflow: 'hidden',
  },
  attachmentsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md} ${spacing.lg}`,
    backgroundColor: tokens.colorNeutralBackground3,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens.colorNeutralStroke2,
  },
  attachmentsList: {
    padding: `${spacing.sm} 0`,
    margin: 0,
    listStyle: 'none',
  },
  attachmentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.sm} ${spacing.lg}`,
  },

  // ============================================
  // EMPTY STATE
  // ============================================
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    backgroundColor: '#DCFCE7',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    color: '#22C55E',
  },

  // ============================================
  // MODAL
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
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: spacing.xxl,
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    position: 'relative' as const,
  },
  modalHeader: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: spacing.xs,
    color: tokens.colorNeutralForeground1,
  },
  modalFooter: {
    display: 'flex',
    gap: spacing.md,
    justifyContent: 'flex-end',
    marginTop: spacing.xl,
  },

  // ============================================
  // ONBOARDING
  // ============================================
  onboardingOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: spacing.xxxl,
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center' as const,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  onboardingDecor: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #229FFF 0%, #57338B 50%, #10B981 100%)',
  },
  onboardingIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(34, 159, 255, 0.1) 0%, rgba(34, 159, 255, 0.05) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: spacing.xl,
  },
  onboardingTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
    marginBottom: spacing.md,
  },
  onboardingText: {
    fontSize: '15px',
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.6',
    marginBottom: spacing.xl,
  },
  onboardingTips: {
    textAlign: 'left' as const,
    padding: spacing.lg,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '12px',
    marginBottom: spacing.xl,
  },
  onboardingTip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
  },
  onboardingTipIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  onboardingSteps: {
    display: 'flex',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  onboardingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralStroke2,
  },
  onboardingDotActive: {
    backgroundColor: '#229FFF',
    width: '24px',
    borderRadius: '4px',
  },

  // ============================================
  // EMPATHY ELEMENTS
  // ============================================
  welcomeBack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.sm,
  },
  encouragement: {
    position: 'fixed' as const,
    bottom: spacing.xxl,
    right: spacing.xxl,
    backgroundColor: 'white',
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: '12px',
    boxShadow: elevation.shadow8,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
    zIndex: 100,
    animationName: 'slideIn',
    animationDuration: '300ms',
    animationTimingFunction: 'ease-out',
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
  category: string;
  docType: string;
  contractor: string;
  summary: string;
  preparedBy: string;
  preparedByDept: string;
  createdBy: string;
  createdByDept: string;
  attachments: Attachment[];
}

interface ArchivedTask extends Task {
  status: 'approved' | 'rejected';
  processedAt: string;  // Дата/час опрацювання
  processedDate: string; // Для фільтрації: 'today' | 'yesterday' | '2days'
  rejectReason?: string;
}

// Archive date filter options
const archiveDateFilters = [
  { id: 'today', label: 'Сьогодні' },
  { id: 'yesterday', label: 'Вчора' },
  { id: '2days', label: 'За 2 дні' },
];

// ============================================
// DATA
// ============================================

// Mock archived tasks
const archivedTasks: ArchivedTask[] = [
  {
    id: 101,
    type: 'Візування',
    number: '№12340',
    date: '05.03.2026',
    urgent: false,
    category: 'finance',
    docType: 'Службова записка',
    contractor: 'ТОВ "Бета-Сервіс"',
    summary: 'Затвердження квартального бюджету на маркетингові активності.',
    preparedBy: 'Петренко В.І.',
    preparedByDept: 'Фінансовий відділ',
    createdBy: 'Петренко В.І.',
    createdByDept: 'Фінансовий відділ',
    attachments: [{ name: 'Бюджет_Q1.xlsx', size: '245 KB' }],
    status: 'approved',
    processedAt: '09.03.2026, 10:15',
    processedDate: 'today',
  },
  {
    id: 102,
    type: 'Підписання',
    number: '№12338',
    date: '04.03.2026',
    urgent: false,
    category: 'documents',
    docType: 'Договір',
    contractor: 'ПП "ТехноПостач"',
    summary: 'Договір на постачання серверного обладнання для нового ЦОД.',
    preparedBy: 'Сидоренко О.М.',
    preparedByDept: 'IT департамент',
    createdBy: 'Сидоренко О.М.',
    createdByDept: 'IT департамент',
    attachments: [
      { name: 'Договір_ТехноПостач.pdf', size: '1.2 MB' },
      { name: 'Специфікація_обладнання.pdf', size: '890 KB' },
    ],
    status: 'approved',
    processedAt: '09.03.2026, 09:30',
    processedDate: 'today',
  },
  {
    id: 103,
    type: 'Візування',
    number: '№12335',
    date: '03.03.2026',
    urgent: true,
    category: 'hr',
    docType: 'Наказ',
    contractor: '—',
    summary: 'Преміювання співробітників відділу продажів за результатами лютого.',
    preparedBy: 'Коваленко І.П.',
    preparedByDept: 'Відділ кадрів',
    createdBy: 'Коваленко І.П.',
    createdByDept: 'Відділ кадрів',
    attachments: [{ name: 'Наказ_премія.pdf', size: '156 KB' }],
    status: 'rejected',
    processedAt: '08.03.2026, 16:45',
    processedDate: 'yesterday',
    rejectReason: 'Необхідно погодити з фінансовим директором. Перевищено ліміт преміального фонду на 15%.',
  },
  {
    id: 104,
    type: 'По руху',
    number: '№12330',
    date: '02.03.2026',
    urgent: false,
    category: 'processes',
    docType: 'Заявка',
    contractor: 'Microsoft',
    summary: 'Продовження ліцензій Microsoft 365 для корпоративних користувачів.',
    preparedBy: 'Ткаченко Р.О.',
    preparedByDept: 'IT департамент',
    createdBy: 'Ткаченко Р.О.',
    createdByDept: 'IT департамент',
    attachments: [],
    status: 'approved',
    processedAt: '08.03.2026, 11:20',
    processedDate: 'yesterday',
  },
  {
    id: 105,
    type: 'Підписання',
    number: '№12325',
    date: '01.03.2026',
    urgent: false,
    category: 'finance',
    docType: 'Акт',
    contractor: 'ТОВ "Логістик-Про"',
    summary: 'Акт звірки взаєморозрахунків за лютий 2026 року.',
    preparedBy: 'Мельник О.П.',
    preparedByDept: 'Бухгалтерія',
    createdBy: 'Мельник О.П.',
    createdByDept: 'Бухгалтерія',
    attachments: [{ name: 'Акт_звірки_лютий.pdf', size: '420 KB' }],
    status: 'approved',
    processedAt: '07.03.2026, 14:00',
    processedDate: '2days',
  },
  {
    id: 106,
    type: 'Візування',
    number: '№12320',
    date: '28.02.2026',
    urgent: false,
    category: 'documents',
    docType: 'Службова записка',
    contractor: '—',
    summary: 'Запит на виділення додаткового бюджету для участі у виставці IT-Forum 2026.',
    preparedBy: 'Бондаренко К.С.',
    preparedByDept: 'Відділ маркетингу',
    createdBy: 'Бондаренко К.С.',
    createdByDept: 'Відділ маркетингу',
    attachments: [{ name: 'Кошторис_виставка.xlsx', size: '78 KB' }],
    status: 'rejected',
    processedAt: '07.03.2026, 10:30',
    processedDate: '2days',
    rejectReason: 'Участь у даній виставці не передбачена маркетинговим планом на Q1. Розглянути для Q2.',
  },
];

const initialTasks: Task[] = [
  {
    id: 1,
    type: 'Візування',
    number: '№12345',
    date: '06.02.2026',
    urgent: true,
    category: 'finance',
    docType: 'Службова записка',
    contractor: 'ТОВ "Альфа-Трейд"',
    summary: 'Реорганізація відділу маркетингу та впровадження нових KPI для Q1 2026.',
    preparedBy: 'Оболоник А.С.',
    preparedByDept: 'Відділ управління операційними системами',
    createdBy: 'Іваненко М.В.',
    createdByDept: 'Канцелярія',
    attachments: [
      { name: 'Договір_постачання.pdf', size: '2.4 MB' },
      { name: 'Специфікація.xlsx', size: '156 KB' },
    ],
  },
  {
    id: 2,
    type: 'Підписання',
    number: '№987-Н',
    date: '10.02.2026',
    urgent: false,
    category: 'documents',
    docType: 'Наказ',
    contractor: '—',
    summary: 'Відрядження до м. Одеса для проведення аудиту філії.',
    preparedBy: 'Коваленко І.П.',
    preparedByDept: 'Відділ кадрів',
    createdBy: 'Коваленко І.П.',
    createdByDept: 'Відділ кадрів',
    attachments: [{ name: 'Кошторис_45.pdf', size: '320 KB' }],
  },
  {
    id: 3,
    type: 'По руху',
    number: '№0042',
    date: '11.02.2026',
    urgent: false,
    category: 'hr',
    docType: 'Заявка',
    contractor: 'Adobe Inc.',
    summary: 'Закупівля 5 ліцензій Adobe Creative Cloud.',
    preparedBy: 'Сидоренко О.М.',
    preparedByDept: 'IT департамент',
    createdBy: 'Сидоренко О.М.',
    createdByDept: 'IT департамент',
    attachments: [],
  },
  {
    id: 4,
    type: 'Розгляд',
    number: '№0098',
    date: '12.02.2026',
    urgent: false,
    category: 'access',
    docType: 'Договір',
    contractor: 'ПП "ТехноПостач"',
    summary: 'Розгляд договору з постачальником обладнання.',
    preparedBy: 'Петренко В.І.',
    preparedByDept: 'Юридичний відділ',
    createdBy: 'Бондаренко К.Л.',
    createdByDept: 'Юридичний відділ',
    attachments: [{ name: 'Договір.pdf', size: '1.2 MB' }],
  },
  {
    id: 5,
    type: 'Візування',
    number: '№0156',
    date: '08.02.2026',
    urgent: true,
    category: 'finance',
    docType: 'Бюджет',
    contractor: '—',
    summary: 'Бюджет на Q2 2026 — затвердження видатків.',
    preparedBy: 'Мельник О.П.',
    preparedByDept: 'Фінансовий відділ',
    createdBy: 'Ткаченко Р.С.',
    createdByDept: 'Фінансовий відділ',
    attachments: [{ name: 'Бюджет_Q2.xlsx', size: '890 KB' }],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================
export const ApproveHub: React.FC = () => {
  const styles = useStyles();
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  // State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [currentArchivedTask, setCurrentArchivedTask] = useState<ArchivedTask | null>(null);
  const [activeView, setActiveView] = useState<'inbox' | 'archive'>('inbox');
  const [activeFilter, setActiveFilter] = useState('all');
  const [archiveDateFilter, setArchiveDateFilter] = useState('today');
  const [sortBy, setSortBy] = useState('date-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  // Animation & Onboarding
  const [removingTaskIds, setRemovingTaskIds] = useState<number[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('approvehub-onboarding-seen');
    }
    return false;
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [encouragementMessage, setEncouragementMessage] = useState<string | null>(null);

  // Stats
  const [todayApproved, setTodayApproved] = useState(12);
  const progressPercent = Math.min(100, (todayApproved / 20) * 100);

  // Encouragement messages
  const encouragements = [
    { threshold: 5,  message: 'Непогано! Вже 5 документів ✨' },
    { threshold: 10, message: 'Десятка! Так тримати! 🔥' },
    { threshold: 15, message: '15 документів — ти машина! 🚀' },
    { threshold: 20, message: '20! Ти сьогодні герой! 🏆' },
  ];

  useEffect(() => {
    const encouragement = encouragements.find(e => e.threshold === todayApproved);
    if (encouragement) {
      setEncouragementMessage(encouragement.message);
      setTimeout(() => setEncouragementMessage(null), 3000);
    }
  }, [todayApproved]);

  const showToast = useCallback((title: string, body: string, intent: ToastIntent = 'success') => {
    dispatchToast(
      <Toast>
        <ToastTitle>{title}</ToastTitle>
        <ToastBody>{body}</ToastBody>
      </Toast>,
      { intent, timeout: 5000 }
    );
  }, [dispatchToast]);

  const removeTaskWithAnimation = useCallback((taskId: number, callback?: () => void) => {
    setRemovingTaskIds(prev => [...prev, taskId]);
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setRemovingTaskIds(prev => prev.filter(id => id !== taskId));
      setTodayApproved(prev => prev + 1);
      callback?.();
    }, 400);
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setCurrentTask(task);
    setRejectReason('');
    setAttachmentsLoading(false);
    setAttachmentsLoaded(false);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setCurrentTask(null);
  }, []);

  const handleApprove = useCallback(() => {
    if (currentTask) {
      const taskNumber = currentTask.number;
      removeTaskWithAnimation(currentTask.id, () => {
        setCurrentTask(null);
      });
      showToast('Затверджено ✓', `${taskNumber} — готово!`, 'success');
    }
  }, [currentTask, showToast, removeTaskWithAnimation]);

  const handleApproveTask = useCallback((e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    removeTaskWithAnimation(task.id, () => {
      setSelectedTasks(prev => prev.filter(id => id !== task.id));
      if (currentTask?.id === task.id) {
        setCurrentTask(null);
      }
    });
    showToast('Затверджено ✓', `${task.number} — готово!`, 'success');
  }, [currentTask, showToast, removeTaskWithAnimation]);

  const handleOpenRejectModal = useCallback(() => {
    setShowRejectModal(true);
    setRejectReason('');
  }, []);

  const handleCloseRejectModal = useCallback(() => {
    setShowRejectModal(false);
    setRejectReason('');
  }, []);

  const handleRejectConfirm = useCallback(() => {
    if (currentTask && rejectReason.trim()) {
      setTasks(prev => prev.filter(t => t.id !== currentTask.id));
      setCurrentTask(null);
      setRejectReason('');
      setShowRejectModal(false);
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

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      const matchesFilter = activeFilter === 'all' || task.category === activeFilter;
      const matchesSearch = !searchQuery.trim() ||
        task.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.preparedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.number.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('.');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
          return parseDate(a.date).getTime() - parseDate(b.date).getTime();
        case 'date-desc':
          return parseDate(b.date).getTime() - parseDate(a.date).getTime();
        case 'type': {
          const aActionable = isActionable(a.type) ? 0 : 1;
          const bActionable = isActionable(b.type) ? 0 : 1;
          if (aActionable !== bActionable) return aActionable - bActionable;
          return a.type.localeCompare(b.type, 'uk');
        }
        case 'author':
          return a.preparedBy.localeCompare(b.preparedBy, 'uk');
        default:
          return 0;
      }
    });
  }, [tasks, activeFilter, searchQuery, sortBy]);

  // Filtered archived tasks
  const filteredArchivedTasks = useMemo(() => {
    return archivedTasks.filter(task => {
      const matchesFilter = activeFilter === 'all' || task.category === activeFilter;
      const matchesSearch = !searchQuery.trim() ||
        task.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.preparedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.number.toLowerCase().includes(searchQuery.toLowerCase());
      
      // For "today" show only today, for "yesterday" show yesterday, for "2days" show all
      let dateMatch = false;
      if (archiveDateFilter === 'today') {
        dateMatch = task.processedDate === 'today';
      } else if (archiveDateFilter === 'yesterday') {
        dateMatch = task.processedDate === 'today' || task.processedDate === 'yesterday';
      } else {
        dateMatch = true; // '2days' shows all
      }
      
      return matchesFilter && dateMatch && matchesSearch;
    });
  }, [activeFilter, archiveDateFilter, searchQuery]);

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

  return (
    <div className={styles.app}>
      <Toaster toasterId={toasterId} position="top-end" />

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>✓</div>
          <span className={styles.sidebarTitle}>ApproveHub</span>
        </div>

        <nav className={styles.sidebarNav}>
          <div 
            className={`${styles.navItem} ${activeView === 'inbox' ? styles.navItemActive : ''}`}
            onClick={() => {
              setActiveView('inbox');
              setCurrentArchivedTask(null);
            }}
            style={{ cursor: 'pointer' }}
          >
            <Inbox size={20} />
            <span>Затвердження</span>
            {tasks.length > 0 && <span className={styles.navBadge}>{tasks.length}</span>}
          </div>

          <div 
            className={`${styles.navItem} ${activeView === 'archive' ? styles.navItemActive : ''}`}
            onClick={() => {
              setActiveView('archive');
              setCurrentTask(null);
              setSelectedTasks([]);
            }}
            style={{ cursor: 'pointer' }}
          >
            <Archive size={20} />
            <span>Архів</span>
          </div>

          <div className={`${styles.navItem} ${styles.navItemDisabled}`}>
            <Key size={20} />
            <span>Доступи</span>
            <span className={styles.comingSoon}>скоро</span>
          </div>

          <div className={`${styles.navItem} ${styles.navItemDisabled}`}>
            <FileEdit size={20} />
            <span>Заявки</span>
            <span className={styles.comingSoon}>скоро</span>
          </div>
        </nav>

        <div className={styles.progressBlock}>
          <div className={styles.progressHeader}>
            <Trophy size={16} style={{ color: '#229FFF' }} />
            <span>Твій прогрес</span>
          </div>
          <div className={styles.progressStats}>
            <span className={styles.progressNumber}>{todayApproved}</span>
            <span className={styles.progressLabel}>опрацьовано сьогодні</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
          <div className={styles.progressRank}>
            <span style={{ color: '#10B981' }}>●</span>
            Ти в топ-5!
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        {/* Hero Header */}
        <div className={styles.heroHeader}>
          <div className={styles.heroDecor1} />
          <div className={styles.heroDecor2} />
          <div className={styles.heroDecor3} />
          <div className={styles.heroContent}>
            {activeView === 'inbox' ? (
              <>
                <div className={styles.heroTitle}>Доброго дня, Олександре! 👋</div>
                <div className={styles.heroSubtitle}>
                  У вас {tasks.length} {tasks.length === 1 ? 'завдання' : 'завдань'} на затвердження
                </div>
              </>
            ) : (
              <>
                <div className={styles.heroTitle}>Архів документів 📋</div>
                <div className={styles.heroSubtitle}>
                  Опрацьовані документи за останні дні
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter Bar with Search and Help */}
        <div className={styles.filterBar}>
          <div className={styles.filterChips}>
            {activeView === 'archive' && (
              <>
                {archiveDateFilters.map(dateFilter => (
                  <button
                    key={dateFilter.id}
                    className={`${styles.filterChip} ${archiveDateFilter === dateFilter.id ? styles.filterChipActive : ''}`}
                    onClick={() => setArchiveDateFilter(dateFilter.id)}
                    style={{ marginRight: spacing.sm }}
                  >
                    {dateFilter.label}
                  </button>
                ))}
                <div style={{ width: '1px', height: '24px', backgroundColor: tokens.colorNeutralStroke2, margin: `0 ${spacing.sm}` }} />
              </>
            )}
            {filterCategories.map(cat => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={`${styles.filterChip} ${activeFilter === cat.id ? styles.filterChipActive : ''}`}
                  onClick={() => setActiveFilter(cat.id)}
                >
                  <IconComponent size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <Tooltip content="Показати підказки" relationship="label">
              <Button
                appearance="subtle"
                icon={<HelpCircle size={18} />}
                onClick={() => {
                  setOnboardingStep(0);
                  setShowOnboarding(true);
                }}
                style={{ 
                  color: tokens.colorNeutralForeground3,
                  minWidth: 'auto',
                  padding: spacing.sm,
                }}
              />
            </Tooltip>
            <div className={styles.filterSearch}>
              <Input
                contentBefore={<Search size={18} />}
                placeholder="Швидкий пошук..."
                value={searchQuery}
                onChange={(_e, data) => setSearchQuery(data.value)}
              />
            </div>
          </div>
        </div>

        {/* Toolbar - different for inbox vs archive */}
        {activeView === 'inbox' ? (
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <Checkbox
                label="Обрати всі для затвердження"
                checked={isAllSelected}
                onChange={(_e, data) => handleSelectAll(!!data.checked)}
              />
            </div>
            <div className={styles.toolbarRight}>
              {selectedCount > 0 && (
                <Button
                  appearance="primary"
                  icon={<Check size={16} />}
                  onClick={handleApproveSelected}
                  style={{ backgroundColor: '#22C55E', borderRadius: '8px' }}
                >
                  Затвердити {selectedCount} {selectedCount === 1 ? 'документ' : selectedCount < 5 ? 'документи' : 'документів'}
                </Button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <ArrowUpDown size={16} style={{ color: tokens.colorNeutralForeground3 }} />
                <Dropdown
                  value={sortOptions.find(s => s.id === sortBy)?.label}
                  onOptionSelect={(_e, data) => setSortBy(data.optionValue as string)}
                  style={{ minWidth: '220px' }}
                >
                  {sortOptions.map(option => (
                    <Option key={option.id} value={option.id}>
                      {option.label}
                    </Option>
                  ))}
                </Dropdown>
              </div>
              <span className={styles.taskCount}>
                {filteredTasks.length} {filteredTasks.length === 1 ? 'документ' : filteredTasks.length < 5 ? 'документи' : 'документів'}
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <Text style={{ color: tokens.colorNeutralForeground2 }}>
                Перегляд опрацьованих документів
              </Text>
            </div>
            <div className={styles.toolbarRight}>
              <span className={styles.taskCount}>
                {filteredArchivedTasks.length} {filteredArchivedTasks.length === 1 ? 'документ' : filteredArchivedTasks.length < 5 ? 'документи' : 'документів'}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={styles.contentArea}>
          {activeView === 'inbox' ? (
            // INBOX VIEW
            <>
              <div className={`${styles.taskList} ${currentTask ? styles.taskListSplit : ''}`}>
                {filteredTasks.length === 0 ? (
                  searchQuery.trim() ? (
                // 1. No search results
                <div className={styles.emptyState}>
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ marginBottom: spacing.lg }}>
                    <circle cx="50" cy="50" r="22" stroke="#229FFF" strokeWidth="3" fill="rgba(34, 159, 255, 0.05)" />
                    <line x1="67" y1="67" x2="85" y2="85" stroke="#229FFF" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="43" cy="48" r="3" fill="#229FFF" />
                    <circle cx="57" cy="48" r="3" fill="#229FFF" />
                    <path d="M43 58 Q50 54 57 58" stroke="#229FFF" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <text x="20" y="30" fontSize="16" fill="#229FFF" opacity="0.4">?</text>
                    <text x="90" y="35" fontSize="20" fill="#229FFF" opacity="0.6">?</text>
                    <text x="100" y="70" fontSize="14" fill="#229FFF" opacity="0.3">?</text>
                  </svg>
                  <Text weight="semibold" size={500} style={{ marginBottom: spacing.xs }}>
                    Хм, нічого не знайшли 🤔
                  </Text>
                  <Text style={{ color: tokens.colorNeutralForeground2, textAlign: 'center', marginBottom: spacing.md, lineHeight: '1.5' }}>
                    За запитом "{searchQuery}" документів немає.<br />
                    Може, спробуємо інші слова?
                  </Text>
                  <Button
                    appearance="outline"
                    onClick={() => setSearchQuery('')}
                    style={{ 
                      marginTop: spacing.sm,
                      borderRadius: '8px',
                      borderColor: '#229FFF',
                      color: '#229FFF',
                    }}
                  >
                    Очистити пошук
                  </Button>
                </div>
              ) : tasks.length > 0 ? (
                // 2. Category is empty
                <div className={styles.emptyState}>
                  <svg width="130" height="130" viewBox="0 0 130 130" fill="none" style={{ marginBottom: spacing.lg }}>
                    <rect x="30" y="45" width="70" height="55" rx="8" stroke="#229FFF" strokeWidth="2.5" fill="rgba(34, 159, 255, 0.03)" />
                    <path d="M30 55 L65 55 L70 45 L100 45" stroke="#229FFF" strokeWidth="2.5" fill="none" />
                    <circle cx="50" cy="85" r="8" stroke="#D1D5DB" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
                    <circle cx="75" cy="82" r="5" stroke="#D1D5DB" strokeWidth="1" fill="none" strokeDasharray="2 2" />
                    <path d="M20 75 Q35 73 45 75" stroke="#D1D5DB" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
                    <path d="M85 80 Q100 78 115 80" stroke="#D1D5DB" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
                    <path d="M105 35 L105 25 M100 30 L110 30" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="25" cy="40" r="2" fill="#10B981" opacity="0.6" />
                  </svg>
                  <Text weight="semibold" size={500} style={{ marginBottom: spacing.xs }}>
                    Тут порожньо... як у степу 🌾
                  </Text>
                  <Text style={{ color: tokens.colorNeutralForeground2, textAlign: 'center', lineHeight: '1.5' }}>
                    {activeFilter !== 'all'
                      ? <>У категорії "{filterCategories.find(f => f.id === activeFilter)?.label}" поки тихо.<br />Жодного документа на затвердження!</>
                      : <>Нових документів поки немає.<br />Перевірте пізніше!</>
                    }
                  </Text>
                  {activeFilter !== 'all' && (
                    <Button
                      appearance="outline"
                      onClick={() => setActiveFilter('all')}
                      style={{ 
                        marginTop: spacing.lg,
                        borderRadius: '8px',
                        borderColor: '#229FFF',
                        color: '#229FFF',
                      }}
                    >
                      Показати всі документи ({tasks.length})
                    </Button>
                  )}
                </div>
              ) : (
                // 3. Inbox Zero
                <div className={styles.emptyState}>
                  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" style={{ marginBottom: spacing.lg }}>
                    <rect x="45" y="70" width="50" height="55" rx="6" fill="url(#coffeeGradient)" />
                    <ellipse cx="70" cy="70" rx="25" ry="6" fill="#059669" />
                    <rect x="90" y="90" width="8" height="25" rx="4" fill="#059669" />
                    <path d="M55 60 Q 50 50 55 40" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
                    <path d="M70 55 Q 65 45 70 35" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
                    <path d="M85 60 Q 80 50 85 40" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
                    <circle cx="100" cy="50" r="18" fill="#10B981" />
                    <path d="M93 50L98 55L107 44" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="25" cy="40" r="4" fill="rgba(124, 58, 237, 0.2)" />
                    <circle cx="115" cy="100" r="5" fill="rgba(37, 99, 235, 0.2)" />
                    <circle cx="30" cy="110" r="3" fill="rgba(16, 185, 129, 0.2)" />
                    <defs>
                      <linearGradient id="coffeeGradient" x1="45" y1="70" x2="95" y2="125">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <Text weight="semibold" size={500} style={{ marginBottom: spacing.xs, fontSize: '18px' }}>
                    Чудова робота! ✨
                  </Text>
                  <Text style={{ color: tokens.colorNeutralForeground2, textAlign: 'center', lineHeight: '1.6' }}>
                    Усі документи розглянуто.<br />
                    Час для кави ☕
                  </Text>
                  <div style={{
                    marginTop: spacing.xl,
                    padding: spacing.md,
                    background: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#059669',
                    fontWeight: 500,
                  }}>
                    🎯 Сьогодні опрацьовано: {todayApproved} документів
                  </div>
                </div>
              )
            ) : (
              filteredTasks.map(task => {
                const isSelected = currentTask?.id === task.id;
                const canApprove = isActionable(task.type);
                const isChecked = selectedTasks.includes(task.id);
                const isRemoving = removingTaskIds.includes(task.id);

                return (
                  <article
                    key={task.id}
                    className={`${styles.taskCard} ${isSelected ? styles.taskCardSelected : ''} ${isRemoving ? styles.taskCardRemoving : ''}`}
                    onClick={() => !isRemoving && handleTaskClick(task)}
                    style={{ pointerEvents: isRemoving ? 'none' : 'auto' }}
                  >
                    <div className={styles.taskCardInner}>
                      <div className={styles.taskCheckbox} onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={isChecked}
                          disabled={!canApprove}
                          onChange={() => toggleTaskSelection(task.id)}
                        />
                      </div>
                      <div className={styles.taskBody}>
                        <div className={styles.taskHeader}>
                          <div className={styles.taskBadgeContainer}>
                            <span className={canApprove ? styles.taskTypeActionable : styles.taskTypeViewOnly}>
                              {canApprove ? <Check size={14} /> : <Eye size={14} />}
                              {task.type}
                            </span>
                          </div>
                          <span className={`${styles.taskDate} ${task.urgent ? styles.taskDateUrgent : ''}`}>
                            {task.urgent && <Flame size={14} />}
                            Строк: {task.date}
                          </span>
                        </div>
                        <div className={styles.taskTitle}>
                          {task.number} — {task.summary.length > 55 ? task.summary.substring(0, 55) + '...' : task.summary}
                        </div>
                        <div className={styles.taskDesc}>{task.summary}</div>
                        <div className={styles.taskFooter}>
                          <div className={styles.taskMeta}>
                            <Avatar name={task.preparedBy} size={20} />
                            <span className={styles.taskAuthorName}>{task.preparedBy}</span>
                            <span className={styles.taskDepartment}>· {task.preparedByDept}</span>
                          </div>
                          {canApprove && (
                            <div className={styles.taskCardActions}>
                              <Button
                                size="small"
                                icon={<Check size={16} />}
                                onClick={(e) => handleApproveTask(e, task)}
                                onMouseEnter={() => setHoveredBtn(`card-${task.id}`)}
                                onMouseLeave={() => setHoveredBtn(null)}
                                style={{
                                  backgroundColor: hoveredBtn === `card-${task.id}` ? '#22C55E' : '#f0fff4',
                                  color: hoveredBtn === `card-${task.id}` ? 'white' : '#22C55E',
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  ...ib('#22C55E'),
                                }}
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

          {/* Detail Panel */}
          {currentTask && (
            <aside className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <Button appearance="subtle" icon={<ExternalLink size={20} />}>
                  Відкрити в системі
                </Button>
                <Button appearance="subtle" icon={<X size={20} />} onClick={handleCloseDetail} />
              </div>

              <div className={styles.detailBody}>
                <div className={styles.detailType}>
                  {currentTask.type} {currentTask.number}
                </div>
                <div className={styles.detailTitle}>
                  {currentTask.summary.length > 60 ? currentTask.summary.substring(0, 60) + '...' : currentTask.summary}
                </div>

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

                <div className={styles.detailSectionTitle}>Короткий зміст</div>
                <div className={styles.detailDescription}>{currentTask.summary}</div>

                <div style={{ marginBottom: spacing.lg }}>
                  <div className={styles.detailSectionTitle}>Готував</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: '4px' }}>
                    <Avatar name={currentTask.preparedBy} size={24} />
                    <span style={{ fontWeight: 500 }}>{currentTask.preparedBy}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: tokens.colorNeutralForeground3, marginLeft: '32px' }}>
                    {currentTask.preparedByDept}
                  </div>
                </div>

                <div style={{ marginBottom: spacing.lg }}>
                  <div className={styles.detailSectionTitle}>Створив</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: '4px' }}>
                    <Avatar name={currentTask.createdBy} size={24} />
                    <span style={{ fontWeight: 500 }}>{currentTask.createdBy}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: tokens.colorNeutralForeground3, marginLeft: '32px' }}>
                    {currentTask.createdByDept}
                  </div>
                </div>

                {/* Attachments */}
                {currentTask.attachments.length > 0 && (
                  <div className={styles.attachmentsBlock}>
                    <div className={styles.attachmentsHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                        <Paperclip size={20} />
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>
                          ВКЛАДЕННЯ ({currentTask.attachments.length})
                        </span>
                      </div>
                      {!attachmentsLoaded && (
                        <Button
                          size="small"
                          icon={attachmentsLoading
                            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Download size={16} />}
                          onClick={handleLoadAttachments}
                          disabled={attachmentsLoading}
                          style={{
                            backgroundColor: 'transparent',
                            color: '#229FFF',
                            borderRadius: '6px',
                            ...ib('#229FFF'),
                          }}
                        >
                          {attachmentsLoading ? 'Завантаження...' : 'Завантажити'}
                        </Button>
                      )}
                    </div>
                    <ul className={styles.attachmentsList}>
                      {currentTask.attachments.map((file, idx) => (
                        <li
                          key={idx}
                          className={styles.attachmentItem}
                          style={{
                            cursor: attachmentsLoaded ? 'pointer' : 'default',
                            opacity: attachmentsLoaded ? 1 : 0.6,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                            <File size={20} style={{ color: '#229FFF' }} />
                            <span style={{
                              fontSize: '13px',
                              color: attachmentsLoaded ? '#229FFF' : tokens.colorNeutralForeground2,
                              textDecoration: attachmentsLoaded ? 'underline' : 'none',
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
                  </div>
                )}

                {/* View-only warning */}
                {!isActionable(currentTask.type) && (
                  <div className={styles.detailInfoWarning}>
                    <AlertCircle size={20} />
                    <span>Цей документ доступний лише для перегляду. Для затвердження перейдіть у систему.</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              {isActionable(currentTask.type) ? (
                <div className={styles.detailFooter}>
                  <Button
                    icon={<Check size={20} />}
                    onClick={handleApprove}
                    onMouseEnter={() => setHoveredBtn('detail-approve')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      backgroundColor: hoveredBtn === 'detail-approve' ? '#22C55E' : '#f0fff4',
                      color: hoveredBtn === 'detail-approve' ? 'white' : '#22C55E',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontWeight: 600,
                      ...ib('#22C55E'),
                    }}
                  >
                    Затвердити
                  </Button>
                  <Button
                    icon={<X size={20} />}
                    onClick={handleOpenRejectModal}
                    onMouseEnter={() => setHoveredBtn('detail-reject')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      backgroundColor: hoveredBtn === 'detail-reject' ? '#fee2e2' : 'transparent',
                      color: '#e53e3e',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontWeight: 600,
                      ...ib('#e53e3e'),
                    }}
                  >
                    Відхилити
                  </Button>
                </div>
              ) : (
                <div className={styles.detailFooterViewOnly}>
                  <Button
                    icon={<ExternalLink size={20} />}
                    onMouseEnter={() => setHoveredBtn('open-system')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      backgroundColor: hoveredBtn === 'open-system' ? '#0078d4' : '#e6f2ff',
                      color: hoveredBtn === 'open-system' ? 'white' : '#0078d4',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontWeight: 600,
                      ...ib('#0078d4'),
                    }}
                  >
                    Відкрити в системі
                  </Button>
                </div>
              )}
            </aside>
          )}
            </>
          ) : (
            // ARCHIVE VIEW
            <>
              <div className={`${styles.taskList} ${currentArchivedTask ? styles.taskListSplit : ''}`}>
                {filteredArchivedTasks.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Archive size={64} style={{ color: tokens.colorNeutralForeground3, marginBottom: spacing.lg }} />
                    <Text weight="semibold" size={500} style={{ marginBottom: spacing.xs }}>
                      Архів порожній
                    </Text>
                    <Text style={{ color: tokens.colorNeutralForeground2, textAlign: 'center' }}>
                      За обраний період немає опрацьованих документів
                    </Text>
                  </div>
                ) : (
                  filteredArchivedTasks.map(task => (
                    <article
                      key={task.id}
                      className={`${styles.taskCard} ${currentArchivedTask?.id === task.id ? styles.taskCardSelected : ''}`}
                      onClick={() => setCurrentArchivedTask(task)}
                    >
                      <div className={styles.taskCardInner}>
                        <div className={styles.taskBody} style={{ marginLeft: 0 }}>
                          <div className={styles.taskHeader}>
                            <div className={styles.taskBadgeContainer}>
                              <span className={task.status === 'approved' ? styles.archiveStatusApproved : styles.archiveStatusRejected}>
                                {task.status === 'approved' ? <Check size={14} /> : <X size={14} />}
                                {task.status === 'approved' ? 'Затверджено' : 'Відхилено'}
                              </span>
                            </div>
                            <span className={styles.archiveProcessedDate}>
                              {task.processedAt}
                            </span>
                          </div>
                          <div className={styles.taskTitle}>
                            {task.number} — {task.summary.length > 55 ? task.summary.substring(0, 55) + '...' : task.summary}
                          </div>
                          <div className={styles.taskDesc}>{task.summary}</div>
                          {task.status === 'rejected' && task.rejectReason && (
                            <div className={styles.archiveRejectReason}>
                              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{task.rejectReason.length > 80 ? task.rejectReason.substring(0, 80) + '...' : task.rejectReason}</span>
                            </div>
                          )}
                          <div className={styles.taskFooter}>
                            <div className={styles.taskMeta}>
                              <Avatar name={task.preparedBy} size={20} />
                              <span className={styles.taskAuthorName}>{task.preparedBy}</span>
                              <span className={styles.taskDepartment}>· {task.preparedByDept}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Archive Detail Panel */}
              {currentArchivedTask && (
                <aside className={styles.detailPanel}>
                  <div className={styles.detailHeader}>
                    <Button appearance="subtle" icon={<ExternalLink size={20} />}>
                      Відкрити в системі
                    </Button>
                    <Button appearance="subtle" icon={<X size={20} />} onClick={() => setCurrentArchivedTask(null)} />
                  </div>

                  <div className={styles.detailBody}>
                    <div style={{ marginBottom: spacing.md }}>
                      <span className={currentArchivedTask.status === 'approved' ? styles.archiveStatusApproved : styles.archiveStatusRejected}>
                        {currentArchivedTask.status === 'approved' ? <Check size={14} /> : <X size={14} />}
                        {currentArchivedTask.status === 'approved' ? 'Затверджено' : 'Відхилено'}
                      </span>
                    </div>
                    <div className={styles.detailType}>
                      {currentArchivedTask.type} {currentArchivedTask.number}
                    </div>
                    <div className={styles.detailTitle}>
                      {currentArchivedTask.summary}
                    </div>

                    <div className={styles.detailGrid}>
                      <div className={styles.detailField}>
                        <div className={styles.detailFieldLabel}>Опрацьовано</div>
                        <div className={styles.detailFieldValue}>{currentArchivedTask.processedAt}</div>
                      </div>
                      <div className={styles.detailField}>
                        <div className={styles.detailFieldLabel}>Строк документа</div>
                        <div className={styles.detailFieldValue}>{currentArchivedTask.date}</div>
                      </div>
                      <div className={styles.detailField}>
                        <div className={styles.detailFieldLabel}>Вид документа</div>
                        <div className={styles.detailFieldValue}>{currentArchivedTask.docType}</div>
                      </div>
                      <div className={styles.detailField}>
                        <div className={styles.detailFieldLabel}>Контрагент</div>
                        <div className={styles.detailFieldValue}>{currentArchivedTask.contractor}</div>
                      </div>
                    </div>

                    {currentArchivedTask.status === 'rejected' && currentArchivedTask.rejectReason && (
                      <div style={{ marginTop: spacing.lg }}>
                        <div className={styles.detailFieldLabel} style={{ marginBottom: spacing.sm }}>Причина відхилення</div>
                        <div className={styles.archiveRejectReason}>
                          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{currentArchivedTask.rejectReason}</span>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: spacing.lg }}>
                      <div className={styles.detailFieldLabel} style={{ marginBottom: spacing.sm }}>Короткий зміст</div>
                      <Text style={{ fontStyle: 'italic', lineHeight: '1.5' }}>
                        {currentArchivedTask.summary}
                      </Text>
                    </div>

                    <div style={{ marginTop: spacing.lg }}>
                      <div className={styles.detailFieldLabel} style={{ marginBottom: spacing.md }}>Готував</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                        <Avatar name={currentArchivedTask.preparedBy} size={32} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{currentArchivedTask.preparedBy}</div>
                          <div style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>{currentArchivedTask.preparedByDept}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailFooterViewOnly}>
                    <Button
                      icon={<ExternalLink size={20} />}
                      style={{
                        backgroundColor: '#e6f2ff',
                        color: '#0078d4',
                        borderRadius: '8px',
                        padding: '10px 24px',
                        fontWeight: 600,
                        ...ib('#0078d4'),
                      }}
                    >
                      Відкрити в системі
                    </Button>
                  </div>
                </aside>
              )}
            </>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {showRejectModal && currentTask && (
        <div className={styles.modalOverlay} onClick={handleCloseRejectModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button
              onClick={handleCloseRejectModal}
              style={{
                position: 'absolute',
                top: spacing.lg,
                right: spacing.lg,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertCircle size={24} style={{ color: '#DC2626' }} />
              </div>
              <div>
                <div className={styles.modalHeader}>Відхилення документа</div>
                <div style={{ fontSize: '14px', color: tokens.colorNeutralForeground2 }}>
                  {currentTask.type} {currentTask.number}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: tokens.colorNeutralForeground2, marginBottom: spacing.sm }}>
                Причина відхилення <span style={{ color: '#EF4444' }}>*</span>
              </div>
              <Textarea
                placeholder="Опишіть причину відхилення документа..."
                value={rejectReason}
                onChange={(_e, data) => {
                  if (data.value.length <= 500) {
                    setRejectReason(data.value);
                  }
                }}
                style={{ width: '100%', minHeight: '120px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spacing.xs, fontSize: '12px', color: tokens.colorNeutralForeground3 }}>
                {rejectReason.length}/500
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button appearance="secondary" onClick={handleCloseRejectModal} style={{ borderRadius: '8px' }}>
                Скасувати
              </Button>
              <Button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
                style={{
                  backgroundColor: !rejectReason.trim() ? '#E5E7EB' : '#EF4444',
                  color: !rejectReason.trim() ? '#9CA3AF' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                }}
              >
                Відхилити документ
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approve Modal */}
      {showBulkApproveModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBulkApproveModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>Масове затвердження</div>
            <div style={{ color: tokens.colorNeutralForeground2, marginBottom: spacing.lg }}>
              Ви впевнені, що хочете затвердити {selectedTasks.length} документів?
            </div>
            <div className={styles.modalFooter}>
              <Button appearance="secondary" onClick={() => setShowBulkApproveModal(false)} style={{ borderRadius: '8px' }}>
                Скасувати
              </Button>
              <Button
                onClick={handleConfirmBulkApprove}
                style={{ backgroundColor: '#22C55E', color: 'white', border: 'none', borderRadius: '8px' }}
              >
                Затвердити всі ({selectedTasks.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className={styles.onboardingOverlay}>
          <div className={styles.onboardingCard}>
            <div className={styles.onboardingDecor} />

            {onboardingStep === 0 && (
              <>
                <div className={styles.onboardingIcon}>
                  <Sparkles size={40} style={{ color: '#229FFF' }} />
                </div>
                <div className={styles.onboardingTitle}>
                  Вітаємо в ApproveHub! 🎉
                </div>
                <div className={styles.onboardingText}>
                  Тут зібрані всі документи, що очікують на ваше затвердження.<br />
                  Більше не потрібно перемикатися між системами!
                </div>
              </>
            )}

            {onboardingStep === 1 && (
              <>
                <div className={styles.onboardingIcon}>
                  <Lightbulb size={40} style={{ color: '#F59E0B' }} />
                </div>
                <div className={styles.onboardingTitle}>
                  Як це працює?
                </div>
                <div className={styles.onboardingTips}>
                  <div className={styles.onboardingTip}>
                    <div className={styles.onboardingTipIcon} style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
                      <Check size={14} style={{ color: '#229FFF' }} />
                    </div>
                    <div>
                      <strong style={{ color: '#229FFF' }}>Візування / Підписання</strong> — документи, які ви можете затвердити або відхилити
                    </div>
                  </div>
                  <div className={styles.onboardingTip}>
                    <div className={styles.onboardingTipIcon} style={{ backgroundColor: tokens.colorNeutralBackground3 }}>
                      <Eye size={14} style={{ color: tokens.colorNeutralForeground2 }} />
                    </div>
                    <div>
                      <strong>По руху / Розгляд</strong> — документи для ознайомлення, дії в оригінальній системі
                    </div>
                  </div>
                  <div className={styles.onboardingTip} style={{ marginBottom: 0 }}>
                    <div className={styles.onboardingTipIcon} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                      <Flame size={14} style={{ color: '#EF4444' }} />
                    </div>
                    <div>
                      <strong style={{ color: '#EF4444' }}>Терміново</strong> — протерміновані документи
                    </div>
                  </div>
                </div>
              </>
            )}

            {onboardingStep === 2 && (
              <>
                <div className={styles.onboardingIcon}>
                  <Sparkles size={40} style={{ color: '#229FFF' }} />
                </div>
                <div className={styles.onboardingTitle}>
                  Корисні можливості 🚀
                </div>
                <div className={styles.onboardingTips}>
                  <div className={styles.onboardingTip}>
                    <div className={styles.onboardingTipIcon} style={{ backgroundColor: 'rgba(34, 159, 255, 0.1)' }}>
                      <Search size={14} style={{ color: '#229FFF' }} />
                    </div>
                    <div>
                      <strong>Швидкий пошук</strong> — знаходьте документи та фільтруйте по категоріях
                    </div>
                  </div>
                  <div className={styles.onboardingTip}>
                    <div className={styles.onboardingTipIcon} style={{ backgroundColor: 'rgba(34, 159, 255, 0.1)' }}>
                      <Check size={14} style={{ color: '#229FFF' }} />
                    </div>
                    <div>
                      <strong>Масове затвердження</strong> — оберіть кілька документів та затвердіть одразу
                    </div>
                  </div>
                  <div className={styles.onboardingTip}>
                    <div className={styles.onboardingTipIcon} style={{ backgroundColor: 'rgba(34, 159, 255, 0.1)' }}>
                      <FileText size={14} style={{ color: '#229FFF' }} />
                    </div>
                    <div>
                      <strong>Детальна картка</strong> — клікніть на документ для перегляду деталей
                    </div>
                  </div>
                  <div className={styles.onboardingTip} style={{ marginBottom: 0 }}>
                    <div className={styles.onboardingTipIcon} style={{ backgroundColor: 'rgba(34, 159, 255, 0.1)' }}>
                      <Download size={14} style={{ color: '#229FFF' }} />
                    </div>
                    <div>
                      <strong>Вкладення</strong> — завантажуйте файли прямо з детальної картки
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '15px', 
                  color: '#10B981', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.sm
                }}>
                  <Trophy size={20} />
                  Готові до роботи!
                </div>
              </>
            )}

            <div className={styles.onboardingSteps}>
              {[0, 1, 2].map(step => (
                <div
                  key={step}
                  className={`${styles.onboardingDot} ${onboardingStep === step ? styles.onboardingDotActive : ''}`}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center' }}>
              {onboardingStep > 0 && (
                <Button
                  appearance="outline"
                  onClick={() => setOnboardingStep(prev => prev - 1)}
                  style={{ 
                    borderRadius: '8px',
                    borderColor: tokens.colorNeutralStroke1,
                  }}
                >
                  Назад
                </Button>
              )}
              <Button
                appearance="primary"
                onClick={() => {
                  if (onboardingStep < 2) {
                    setOnboardingStep(prev => prev + 1);
                  } else {
                    setShowOnboarding(false);
                    localStorage.setItem('approvehub-onboarding-seen', 'true');
                  }
                }}
                style={{
                  backgroundColor: '#229FFF',
                  borderRadius: '8px',
                  minWidth: '120px',
                }}
              >
                {onboardingStep < 2 ? 'Далі' : 'Почати роботу'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Encouragement Popup */}
      {encouragementMessage && (
        <div className={styles.encouragement}>
          <Sparkles size={20} style={{ color: '#F59E0B' }} />
          <span>{encouragementMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ApproveHub;
