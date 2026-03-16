import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
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
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  CounterBadge,
  ProgressBar,
  Spinner,
  ToggleButton,
  TabList,
  Tab,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableCellLayout,
  TableSelectionCell,
  Card,
  CardHeader,
} from '@fluentui/react-components';
import type { ToastIntent, SelectTabData, SelectTabEvent } from '@fluentui/react-components';
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
  Sun,
  Heart,
  Plane,
  List,
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

// ============================================
// SEMANTIC COLORS (single source of truth)
// ============================================
const colors = {
  brand:          '#229FFF',
  brandHover:     '#1E8FE5',
  brandBg:        'rgba(34, 159, 255, 0.1)',
  brandBgSubtle:  'rgba(34, 159, 255, 0.04)',
  approve:        '#22C55E',
  approveHover:   '#16a34a',
  approveBg:      '#f0fff4',
  reject:         '#EF4444',
  rejectHover:    '#dc2626',
  rejectBg:       '#fee2e2',
  rejectBgSubtle: 'rgba(239, 68, 68, 0.05)',
  urgent:         '#EF4444',
  success:        '#10B981',
  successDark:    '#059669',
  warning:        '#F59E0B',
  warningBg:      '#FEF3C7',
  gradientStart:  '#7C3AED',
  gradientEnd:    '#2563EB',
  openSystem:     '#0078d4',
  openSystemBg:   '#e6f2ff',
} as const;

// Document type categories
const ACTIONABLE_TYPES = ['Візування', 'Підписання'];
const isActionable = (type: string) => ACTIONABLE_TYPES.includes(type);

// Filter categories
const filterCategories = [
  { id: 'all',       label: 'Всі',       icon: LayoutGrid },
  { id: 'finance',   label: 'Фінанси',   icon: Wallet },
  { id: 'documents', label: 'Документи', icon: FileText },
  { id: 'hr',        label: 'Люди',      icon: Users },
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
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke2),
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
    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '18px',
    boxShadow: `0 2px 8px rgba(124, 58, 237, 0.3)`,
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
    backgroundColor: colors.brand,
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
    backgroundColor: colors.brand,
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
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
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
    color: colors.brand,
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
    backgroundColor: colors.brand,
    borderRadius: '3px',
  },
  progressRank: {
    fontSize: '12px',
    fontWeight: 500,
    color: colors.success,
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
    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 100%)`,
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
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap' as const,
    transition: `all ${motion.fast} ${motion.easeOut}`,
    ':hover': {
      ...shorthands.borderColor('#229FFF'),
      color: colors.brand,
    },
  },
  filterChipActive: {
    backgroundColor: colors.brand,
    ...shorthands.borderColor('#229FFF'),
    color: 'white',
    boxShadow: `0 2px 4px ${colors.brandBg}`,
    ':hover': {
      backgroundColor: '#1E8FE5',
      ...shorthands.borderColor('#1E8FE5'),
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
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
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
    ...shorthands.borderWidth('2px'),
    ...shorthands.borderColor('#229FFF'),
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
    color: colors.brand,
    background: 'linear-gradient(135deg, rgba(34, 159, 255, 0.1) 0%, rgba(34, 159, 255, 0.05) 100%)',
    ...shorthands.border('1px', 'solid', 'rgba(34, 159, 255, 0.2)'),
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
    color: colors.reject,
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
    color: colors.successDark,
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
    backgroundColor: colors.brandBg,
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
  // TEAM TABLE (Fluent Table overrides for original spacing)
  // ============================================
  teamTable: {
    width: '100%',
  },
  teamTableRow: {
    backgroundColor: 'white',
    transition: `all ${motion.fast} ${motion.easeOut}`,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: colors.brandBgSubtle,
    },
  },
  teamTableRowSelected: {
    backgroundColor: 'rgba(34, 159, 255, 0.08)',
  },
  teamEmployee: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  teamEmployeeInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  teamEmployeeName: {
    fontWeight: 500,
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  teamEmployeePosition: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  teamPeriod: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  teamDuration: {
    fontSize: '14px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  teamActions: {
    display: 'flex',
    gap: spacing.sm,
    opacity: 0,
    transition: `opacity ${motion.fast} ${motion.easeOut}`,
  },
  teamActionsVisible: {
    opacity: 1,
  },
  teamTypeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: `4px ${spacing.md}`,
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  teamTypeBadgeVacation: {
    backgroundColor: 'rgba(34, 159, 255, 0.1)',
    color: colors.brand,
  },
  teamTypeBadgeSick: {
    backgroundColor: colors.brandBg,
    color: colors.reject,
  },
  teamTypeBadgeTrip: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: colors.success,
  },

  // ============================================
  // DETAIL PANEL
  // ============================================
  detailPanel: {
    width: '45%',
    backgroundColor: 'white',
    ...shorthands.borderLeft('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    flexDirection: 'column',
    boxShadow: elevation.shadow8,
  },
  detailHeader: {
    padding: `${spacing.md} ${spacing.xl}`,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
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
    color: colors.brand,
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
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
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
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.md,
  },
  detailFooterViewOnly: {
    padding: `${spacing.lg} ${spacing.xxl}`,
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke2),
    display: 'flex',
    justifyContent: 'center',
  },

  // ============================================
  // ATTACHMENTS BLOCK
  // ============================================
  attachmentsBlock: {
    marginBottom: spacing.lg,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    borderRadius: spacing.sm,
    overflow: 'hidden',
  },
  attachmentsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md} ${spacing.lg}`,
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
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
    backgroundColor: colors.brand,
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

  // ============================================
  // BUTTON VARIANTS (replacing inline style overrides)
  // ============================================
  btnApprove: {
    backgroundColor: colors.approve,
    color: 'white',
    ...shorthands.border('none'),
    ...shorthands.borderRadius('8px'),
    ':hover': {
      backgroundColor: colors.approveHover,
      color: 'white',
    },
    ':active': {
      backgroundColor: '#15803d',
    },
  },
  btnApproveGhost: {
    backgroundColor: colors.approveBg,
    color: colors.approve,
    ...shorthands.border('1px', 'solid', colors.approve),
    ...shorthands.borderRadius('8px'),
    fontWeight: 600,
    ':hover': {
      backgroundColor: colors.approve,
      color: 'white',
    },
  },
  btnReject: {
    backgroundColor: colors.reject,
    color: 'white',
    ...shorthands.border('none'),
    ...shorthands.borderRadius('8px'),
    ':hover': {
      backgroundColor: colors.rejectHover,
      color: 'white',
    },
  },
  btnRejectDisabled: {
    backgroundColor: '#E5E7EB',
    color: '#9CA3AF',
    ...shorthands.border('none'),
    ...shorthands.borderRadius('8px'),
  },
  btnRejectGhost: {
    backgroundColor: colors.rejectBgSubtle,
    color: colors.reject,
    ...shorthands.border('1px', 'solid', colors.reject),
    ...shorthands.borderRadius('8px'),
    fontWeight: 600,
    ':hover': {
      backgroundColor: colors.rejectBg,
      color: colors.reject,
    },
  },
  btnBrand: {
    backgroundColor: colors.brand,
    ...shorthands.borderRadius('8px'),
    ':hover': {
      backgroundColor: colors.brandHover,
    },
  },
  btnBrandOutline: {
    ...shorthands.borderRadius('8px'),
    ...shorthands.borderColor(colors.brand),
    color: colors.brand,
    ':hover': {
      backgroundColor: colors.brandBgSubtle,
    },
  },
  btnCompactAction: {
    minWidth: 'auto',
    ...shorthands.padding('4px', '8px'),
  },
  btnOpenSystem: {
    backgroundColor: colors.openSystemBg,
    color: colors.openSystem,
    ...shorthands.border('1px', 'solid', colors.openSystem),
    ...shorthands.borderRadius('8px'),
    fontWeight: 600,
    ...shorthands.padding('10px', '24px'),
    ':hover': {
      backgroundColor: colors.openSystem,
      color: 'white',
    },
  },

  // ============================================
  // PAGINATION
  // ============================================
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: `${spacing.lg} ${spacing.xxl}`,
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke2),
  },
  pageBtn: {
    minWidth: '36px',
    height: '36px',
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground2,
    transition: `all ${motion.fast} ${motion.easeOut}`,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  pageBtnActive: {
    backgroundColor: colors.brand,
    color: 'white',
    ...shorthands.borderColor(colors.brand),
    ':hover': {
      backgroundColor: colors.brandHover,
    },
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: 'white',
    },
  },
  pageInfo: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
    ...shorthands.padding('0', spacing.md),
  },

  // ============================================
  // 2-COLUMN CARDS GRID
  // ============================================
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.md,
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

// Team request interface
interface TeamRequest {
  id: number;
  type: 'vacation' | 'sick' | 'business_trip';
  employeeName: string;
  employeePosition: string;
  employeeAvatar?: string;
  periodStart: string;
  periodEnd: string;
  duration: number;
  daysLeft?: number;
  daysTotal?: number;
  comment?: string;
}

// Archive date filter options
const archiveDateFilters = [
  { id: 'today', label: 'Сьогодні' },
  { id: 'yesterday', label: 'Вчора' },
  { id: '2days', label: 'За 2 дні' },
];

// Team request type labels
const teamRequestTypeLabels: Record<string, string> = {
  vacation: 'Відпустка',
  sick: 'Лікарняний',
  business_trip: 'Відрядження',
};

// Mock team requests
const initialTeamRequests: TeamRequest[] = [
  {
    id: 201,
    type: 'vacation',
    employeeName: 'Плахтій Денис Ігорович',
    employeePosition: 'Frontend Developer',
    periodStart: '15.03.2026',
    periodEnd: '18.03.2026',
    duration: 4,
    daysLeft: 18,
    daysTotal: 24,
    comment: 'Сімейні обставини',
  },
  {
    id: 202,
    type: 'vacation',
    employeeName: 'Коваленко Марія Сергіївна',
    employeePosition: 'Product Manager',
    periodStart: '20.03.2026',
    periodEnd: '22.03.2026',
    duration: 3,
    daysLeft: 20,
    daysTotal: 24,
    comment: 'Планова відпустка',
  },
  {
    id: 203,
    type: 'business_trip',
    employeeName: 'Бондаренко Олексій Петрович',
    employeePosition: 'Sales Manager',
    periodStart: '17.03.2026',
    periodEnd: '19.03.2026',
    duration: 3,
    comment: 'Зустріч з партнерами в Одесі',
  },
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
  {
    id: 6,
    type: 'Візування',
    number: '№0201',
    date: '14.02.2026',
    urgent: false,
    category: 'finance',
    docType: 'Рахунок',
    contractor: 'ТОВ "Глобал-Сервіс"',
    summary: 'Оплата послуг консалтингу за січень 2026.',
    preparedBy: 'Литвиненко Г.А.',
    preparedByDept: 'Фінансовий відділ',
    createdBy: 'Литвиненко Г.А.',
    createdByDept: 'Фінансовий відділ',
    attachments: [{ name: 'Рахунок_012.pdf', size: '180 KB' }],
  },
  {
    id: 7,
    type: 'Підписання',
    number: '№0202',
    date: '15.02.2026',
    urgent: false,
    category: 'documents',
    docType: 'Договір',
    contractor: 'ПП "Інфо-Тех"',
    summary: 'Договір на обслуговування серверної інфраструктури на 2026 рік.',
    preparedBy: 'Гончаренко Д.В.',
    preparedByDept: 'IT департамент',
    createdBy: 'Гончаренко Д.В.',
    createdByDept: 'IT департамент',
    attachments: [{ name: 'Договір_ІнфоТех.pdf', size: '2.1 MB' }, { name: 'SLA_додаток.pdf', size: '450 KB' }],
  },
  {
    id: 8,
    type: 'Візування',
    number: '№0203',
    date: '09.02.2026',
    urgent: true,
    category: 'hr',
    docType: 'Наказ',
    contractor: '—',
    summary: 'Переведення співробітника між підрозділами — Ковальчук О.С.',
    preparedBy: 'Шевченко Т.М.',
    preparedByDept: 'Відділ кадрів',
    createdBy: 'Шевченко Т.М.',
    createdByDept: 'Відділ кадрів',
    attachments: [{ name: 'Наказ_переведення.pdf', size: '95 KB' }],
  },
  {
    id: 9,
    type: 'По руху',
    number: '№0204',
    date: '16.02.2026',
    urgent: false,
    category: 'processes',
    docType: 'Заявка',
    contractor: 'AWS',
    summary: 'Розширення хмарної інфраструктури — додаткові EC2 інстанси.',
    preparedBy: 'Кравченко Р.І.',
    preparedByDept: 'IT департамент',
    createdBy: 'Кравченко Р.І.',
    createdByDept: 'IT департамент',
    attachments: [],
  },
  {
    id: 10,
    type: 'Підписання',
    number: '№0205',
    date: '13.02.2026',
    urgent: false,
    category: 'finance',
    docType: 'Акт',
    contractor: 'ТОВ "Логістик-Про"',
    summary: 'Акт звірки взаєморозрахунків за Q4 2025.',
    preparedBy: 'Федоренко Н.В.',
    preparedByDept: 'Бухгалтерія',
    createdBy: 'Федоренко Н.В.',
    createdByDept: 'Бухгалтерія',
    attachments: [{ name: 'Акт_звірки_Q4.pdf', size: '520 KB' }],
  },
  {
    id: 11,
    type: 'Візування',
    number: '№0206',
    date: '17.02.2026',
    urgent: false,
    category: 'documents',
    docType: 'Службова записка',
    contractor: '—',
    summary: 'Запит на оновлення корпоративної політики інформаційної безпеки.',
    preparedBy: 'Романенко В.В.',
    preparedByDept: 'Служба безпеки',
    createdBy: 'Романенко В.В.',
    createdByDept: 'Служба безпеки',
    attachments: [{ name: 'Політика_ІБ_v2.pdf', size: '1.8 MB' }],
  },
  {
    id: 12,
    type: 'Розгляд',
    number: '№0207',
    date: '18.02.2026',
    urgent: false,
    category: 'access',
    docType: 'Заявка',
    contractor: 'Salesforce',
    summary: 'Запит на доступ до CRM-системи для нових менеджерів з продажу.',
    preparedBy: 'Тарасенко А.О.',
    preparedByDept: 'Відділ продажів',
    createdBy: 'Тарасенко А.О.',
    createdByDept: 'Відділ продажів',
    attachments: [],
  },
  {
    id: 13,
    type: 'Візування',
    number: '№0208',
    date: '07.02.2026',
    urgent: true,
    category: 'finance',
    docType: 'Бюджет',
    contractor: '—',
    summary: 'Додатковий бюджет на маркетингову кампанію весна 2026.',
    preparedBy: 'Захарченко К.І.',
    preparedByDept: 'Відділ маркетингу',
    createdBy: 'Захарченко К.І.',
    createdByDept: 'Відділ маркетингу',
    attachments: [{ name: 'Кошторис_маркетинг.xlsx', size: '340 KB' }],
  },
  {
    id: 14,
    type: 'Підписання',
    number: '№0209',
    date: '19.02.2026',
    urgent: false,
    category: 'documents',
    docType: 'Договір',
    contractor: 'ТОВ "Медіа-Груп"',
    summary: 'Договір на розміщення корпоративної реклами в соціальних мережах.',
    preparedBy: 'Яременко Л.С.',
    preparedByDept: 'Відділ маркетингу',
    createdBy: 'Яременко Л.С.',
    createdByDept: 'Відділ маркетингу',
    attachments: [{ name: 'Договір_МедіаГруп.pdf', size: '980 KB' }],
  },
  {
    id: 15,
    type: 'Візування',
    number: '№0210',
    date: '20.02.2026',
    urgent: false,
    category: 'processes',
    docType: 'Регламент',
    contractor: '—',
    summary: 'Затвердження нового регламенту погодження закупівель понад 100 000 грн.',
    preparedBy: 'Даниленко П.М.',
    preparedByDept: 'Юридичний відділ',
    createdBy: 'Даниленко П.М.',
    createdByDept: 'Юридичний відділ',
    attachments: [{ name: 'Регламент_закупівлі_v3.pdf', size: '1.5 MB' }],
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
  const [currentTeamRequest, setCurrentTeamRequest] = useState<TeamRequest | null>(null);
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
  const [hoveredTeamRow, setHoveredTeamRow] = useState<number | null>(null);
  const [hoveredTaskRow, setHoveredTaskRow] = useState<number | null>(null);
  const [demoEmptyInbox, setDemoEmptyInbox] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>(initialTeamRequests);
  const [selectedTeamRequests, setSelectedTeamRequests] = useState<number[]>([]);

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const CARDS_PER_PAGE = 6;
  const ROWS_PER_PAGE = 10;

  // Stats
  const [todayApproved, setTodayApproved] = useState(12);
  const progressPercent = Math.min(100, (todayApproved / 20) * 100);

  // Progress rank message based on count
  const getProgressRankMessage = (count: number): string => {
    if (count > 20) return '🏆 Ти в Топ!';
    if (count === 20) return '🎉 20! Ти герой погоджень!';
    if (count >= 15) return '🚀 15 документів — ти машина!';
    if (count >= 10) return '🔥 Десятка! Так тримати!';
    if (count >= 5) return '☕ Розмірений темп — теж темп!';
    return '🌱 Кожен документ на вагу золота!';
  };

  // Encouragement messages (popup when reaching milestone)
  const encouragements = [
    { threshold: 5,  message: 'Непогано! Вже 5 документів ✨' },
    { threshold: 10, message: 'Десятка! Так тримати! 🔥' },
    { threshold: 15, message: '15 документів — ти машина! 🚀' },
    { threshold: 20, message: '20! Ти герой погоджень! 🎉' },
  ];

  useEffect(() => {
    const encouragement = encouragements.find(e => e.threshold === todayApproved);
    if (encouragement) {
      setEncouragementMessage(encouragement.message);
      setTimeout(() => setEncouragementMessage(null), 3000);
    }
  }, [todayApproved]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, sortBy, viewMode, activeView, archiveDateFilter]);

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

  // Filtered team requests
  const filteredTeamRequests = useMemo(() => {
    return teamRequests.filter(request => {
      const matchesSearch = !searchQuery.trim() ||
        request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.employeePosition.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [teamRequests, searchQuery]);

  const actionableTasks = filteredTasks.filter(t => isActionable(t.type));
  const isAllSelected = actionableTasks.length > 0 && actionableTasks.every(t => selectedTasks.includes(t.id));
  const selectedCount = selectedTasks.length;

  // Pagination
  const itemsPerPage = viewMode === 'cards' ? CARDS_PER_PAGE : ROWS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTasks = filteredTasks.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);
  const showPagination = filteredTasks.length > itemsPerPage;

  // Team select all
  const isAllTeamSelected = filteredTeamRequests.length > 0 && 
    filteredTeamRequests.every(r => selectedTeamRequests.includes(r.id));
  const selectedTeamCount = selectedTeamRequests.length;

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedTasks(actionableTasks.map(t => t.id));
    } else {
      setSelectedTasks([]);
    }
  }, [actionableTasks]);

  const handleSelectAllTeam = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedTeamRequests(filteredTeamRequests.map(r => r.id));
    } else {
      setSelectedTeamRequests([]);
    }
  }, [filteredTeamRequests]);

  const handleApproveTeamRequest = useCallback((e: React.MouseEvent, request: TeamRequest) => {
    e.stopPropagation();
    setTeamRequests(prev => prev.filter(r => r.id !== request.id));
    setSelectedTeamRequests(prev => prev.filter(id => id !== request.id));
    if (currentTeamRequest?.id === request.id) {
      setCurrentTeamRequest(null);
    }
    setTodayApproved(prev => prev + 1);
    showToast('Затверджено ✓', `${teamRequestTypeLabels[request.type]} для ${request.employeeName.split(' ')[0]} — готово!`, 'success');
  }, [currentTeamRequest, showToast]);

  const handleRejectTeamRequest = useCallback((e: React.MouseEvent, request: TeamRequest) => {
    e.stopPropagation();
    setTeamRequests(prev => prev.filter(r => r.id !== request.id));
    setSelectedTeamRequests(prev => prev.filter(id => id !== request.id));
    if (currentTeamRequest?.id === request.id) {
      setCurrentTeamRequest(null);
    }
    showToast('Відхилено', `${teamRequestTypeLabels[request.type]} для ${request.employeeName.split(' ')[0]} відхилено`, 'warning');
  }, [currentTeamRequest, showToast]);

  const handleApproveSelectedTeam = useCallback(() => {
    const count = selectedTeamRequests.length;
    setTeamRequests(prev => prev.filter(r => !selectedTeamRequests.includes(r.id)));
    setSelectedTeamRequests([]);
    setCurrentTeamRequest(null);
    setTodayApproved(prev => prev + count);
    showToast('Затверджено ✓', `${count} ${count === 1 ? 'заявку' : count < 5 ? 'заявки' : 'заявок'} затверджено`, 'success');
  }, [selectedTeamRequests, showToast]);

  return (
    <div className={styles.app}>
      <Toaster toasterId={toasterId} position="top-end" />

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>✓</div>
          <span className={styles.sidebarTitle}>Погоджуй легко</span>
        </div>

        <nav className={styles.sidebarNav}>
          <Button 
            appearance="subtle"
            className={`${styles.navItem} ${activeView === 'inbox' ? styles.navItemActive : ''}`}
            onClick={() => {
              setActiveView('inbox');
              setCurrentArchivedTask(null);
              setCurrentTeamRequest(null);
            }}
            icon={<Inbox size={20} />}
          >
            <span className="nm">Затвердження</span>
            {(tasks.length + teamRequests.length) > 0 && (
              <CounterBadge
                count={tasks.length + teamRequests.length}
                appearance="filled"
                color={activeView === 'inbox' ? 'brand' : 'informative'}
                size="small"
                style={{ marginLeft: 'auto' }}
              />
            )}
          </Button>

          <Button 
            appearance="subtle"
            className={`${styles.navItem} ${activeView === 'archive' ? styles.navItemActive : ''}`}
            onClick={() => {
              setActiveView('archive');
              setCurrentTask(null);
              setCurrentTeamRequest(null);
              setSelectedTasks([]);
              setSelectedTeamRequests([]);
            }}
            icon={<Archive size={20} />}
          >
            <span className="nm">Архів</span>
          </Button>

          <Button 
            appearance="subtle" 
            disabled
            className={`${styles.navItem} ${styles.navItemDisabled}`}
            icon={<Key size={20} />}
          >
            <span className="nm">Доступи</span>
            <span className={styles.comingSoon}>скоро</span>
          </Button>

          <Button 
            appearance="subtle" 
            disabled
            className={`${styles.navItem} ${styles.navItemDisabled}`}
            icon={<FileEdit size={20} />}
          >
            <span className="nm">Заявки</span>
            <span className={styles.comingSoon}>скоро</span>
          </Button>
        </nav>

        <div className={styles.progressBlock}>
          <div className={styles.progressHeader}>
            <Trophy size={16} style={{ color: '#229FFF' }} />
            <span>Твій прогрес</span>
          </div>
          <div className={styles.progressStats}>
            <span className={styles.progressNumber}>{todayApproved}</span>
            <span className={styles.progressLabel}>опрацьовано за місяць</span>
          </div>
          <ProgressBar
            value={progressPercent / 100}
            thickness="large"
            style={{ marginBottom: spacing.sm }}
            color="brand"
          />
          <div className={styles.progressRank}>
            <span style={{ color: '#10B981' }}>●</span>
            {getProgressRankMessage(todayApproved)}
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
                  У вас {tasks.length + teamRequests.length} {(tasks.length + teamRequests.length) === 1 ? 'завдання' : 'завдань'} на затвердження
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
                  <ToggleButton
                    key={dateFilter.id}
                    checked={archiveDateFilter === dateFilter.id}
                    onClick={() => setArchiveDateFilter(dateFilter.id)}
                    appearance="subtle"
                    size="small"
                    className={`${styles.filterChip} ${archiveDateFilter === dateFilter.id ? styles.filterChipActive : ''}`}
                    style={{ marginRight: spacing.sm }}
                  >
                    {dateFilter.label}
                  </ToggleButton>
                ))}
                <div style={{ width: '1px', height: '24px', backgroundColor: tokens.colorNeutralStroke2, margin: `0 ${spacing.sm}` }} />
              </>
            )}
            {filterCategories.map(cat => {
              const IconComponent = cat.icon;
              return (
                <ToggleButton
                  key={cat.id}
                  checked={activeFilter === cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  appearance="subtle"
                  size="small"
                  icon={<IconComponent size={14} />}
                  className={`${styles.filterChip} ${activeFilter === cat.id ? styles.filterChipActive : ''}`}
                >
                  {cat.label}
                </ToggleButton>
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
                checked={
                  activeFilter === 'hr' 
                    ? isAllTeamSelected 
                    : activeFilter === 'all'
                      ? isAllSelected && isAllTeamSelected
                      : isAllSelected
                }
                onChange={(_e, data) => {
                  if (activeFilter === 'hr') {
                    handleSelectAllTeam(!!data.checked);
                  } else if (activeFilter === 'all') {
                    handleSelectAll(!!data.checked);
                    handleSelectAllTeam(!!data.checked);
                  } else {
                    handleSelectAll(!!data.checked);
                  }
                }}
                disabled={demoEmptyInbox || (
                  activeFilter === 'hr' 
                    ? filteredTeamRequests.length === 0 
                    : activeFilter === 'all'
                      ? (actionableTasks.length === 0 && filteredTeamRequests.length === 0)
                      : actionableTasks.length === 0
                )}
              />
              <div style={{ 
                marginLeft: spacing.xl, 
                paddingLeft: spacing.xl, 
                ...shorthands.borderLeft('1px', 'solid', tokens.colorNeutralStroke2),
              }}>
                <Checkbox
                  label="🎬 Демо: Inbox Zero"
                  checked={demoEmptyInbox}
                  onChange={(_e, data) => setDemoEmptyInbox(!!data.checked)}
                />
              </div>
            </div>
            <div className={styles.toolbarRight}>
              {(selectedCount > 0 || selectedTeamCount > 0) && !demoEmptyInbox && (
                <Button
                  appearance="primary"
                  icon={<Check size={16} />}
                  onClick={() => {
                    if (selectedCount > 0) handleApproveSelected();
                    if (selectedTeamCount > 0) handleApproveSelectedTeam();
                  }}
                  className={styles.btnApprove}
                >
                  Затвердити {selectedCount + selectedTeamCount}
                </Button>
              )}
              {/* View Mode Toggle - show for all filters */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: tokens.colorNeutralBackground2,
                borderRadius: '8px',
                padding: '2px',
              }}>
                <Tooltip content="Картки" relationship="label">
                  <Button
                    appearance="subtle"
                    icon={<LayoutGrid size={18} />}
                    onClick={() => setViewMode('cards')}
                    style={{
                      backgroundColor: viewMode === 'cards' ? 'white' : 'transparent',
                      color: viewMode === 'cards' ? '#229FFF' : tokens.colorNeutralForeground3,
                      borderRadius: '6px',
                      minWidth: '36px',
                      padding: '6px',
                      boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  />
                </Tooltip>
                <Tooltip content="Компактний" relationship="label">
                  <Button
                    appearance="subtle"
                    icon={<List size={18} />}
                    onClick={() => setViewMode('compact')}
                    style={{
                      backgroundColor: viewMode === 'compact' ? 'white' : 'transparent',
                      color: viewMode === 'compact' ? '#229FFF' : tokens.colorNeutralForeground3,
                      borderRadius: '6px',
                      minWidth: '36px',
                      padding: '6px',
                      boxShadow: viewMode === 'compact' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  />
                </Tooltip>
              </div>
              {/* Sorting - hide for hr filter */}
              {activeFilter !== 'hr' && (
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
              )}
              <span className={styles.taskCount}>
                {demoEmptyInbox ? '0' : activeFilter === 'hr' 
                  ? `${filteredTeamRequests.length} ${filteredTeamRequests.length === 1 ? 'заявка' : filteredTeamRequests.length < 5 ? 'заявки' : 'заявок'}`
                  : activeFilter === 'all'
                    ? `${filteredTasks.length + filteredTeamRequests.length} завдань`
                    : `${filteredTasks.length} ${filteredTasks.length === 1 ? 'документ' : filteredTasks.length < 5 ? 'документи' : 'документів'}`
                }
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
              <div className={`${styles.taskList} ${currentTask || currentTeamRequest ? styles.taskListSplit : ''}`} style={activeFilter === 'hr' ? { padding: 0 } : {}}>
                {/* Filter: Люди (hr) - show only team requests */}
                {activeFilter === 'hr' ? (
                  filteredTeamRequests.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Text style={{ fontSize: '64px', marginBottom: spacing.lg }}>🏖️</Text>
                      <Text weight="semibold" size={500} style={{ marginBottom: spacing.xs }}>
                        Усі відпочивають за планом!
                      </Text>
                      <Text style={{ color: tokens.colorNeutralForeground2, textAlign: 'center', lineHeight: '1.6' }}>
                        Наразі немає запитів від команди.<br />
                        Час і вам випити кави ☕
                      </Text>
                    </div>
                  ) : viewMode === 'compact' ? (
                    // HR Compact View - Fluent Table
                    <Table className={styles.teamTable}>
                      <TableHeader>
                        <TableRow>
                          <TableSelectionCell style={{ width: '40px' }} />
                          <TableHeaderCell style={{ padding: "16px" }}>Тип</TableHeaderCell>
                          <TableHeaderCell style={{ padding: "16px" }}>Співробітник</TableHeaderCell>
                          <TableHeaderCell style={{ padding: "16px" }}>Період</TableHeaderCell>
                          <TableHeaderCell style={{ padding: "16px" }}>Тривалість</TableHeaderCell>
                          <TableHeaderCell style={{ width: '100px', padding: '16px' }} />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeamRequests.map(request => (
                          <TableRow
                            key={request.id}
                            className={`${styles.teamTableRow} ${currentTeamRequest?.id === request.id ? styles.teamTableRowSelected : ''}`}
                            onClick={() => setCurrentTeamRequest(request)}
                            onMouseEnter={() => setHoveredTeamRow(request.id)}
                            onMouseLeave={() => setHoveredTeamRow(null)}
                          >
                            <TableSelectionCell
                              checked={selectedTeamRequests.includes(request.id)}
                              onChange={(_e, data) => {
                                if (data.checked) {
                                  setSelectedTeamRequests(prev => [...prev, request.id]);
                                } else {
                                  setSelectedTeamRequests(prev => prev.filter(id => id !== request.id));
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <TableCell style={{ padding: "16px" }}>
                              <span className={`${styles.teamTypeBadge} ${
                                request.type === 'vacation' ? styles.teamTypeBadgeVacation :
                                request.type === 'sick' ? styles.teamTypeBadgeSick :
                                styles.teamTypeBadgeTrip
                              }`}>
                                {request.type === 'vacation' && <Sun size={12} />}
                                {request.type === 'sick' && <Heart size={12} />}
                                {request.type === 'business_trip' && <Plane size={12} />}
                                {teamRequestTypeLabels[request.type]}
                              </span>
                            </TableCell>
                            <TableCell style={{ padding: "16px" }}>
                              <TableCellLayout media={<Avatar name={request.employeeName} size={24} />}>
                                {request.employeeName}
                              </TableCellLayout>
                            </TableCell>
                            <TableCell style={{ padding: "16px" }}>
                              <Text size={200}>{request.periodStart} — {request.periodEnd}</Text>
                            </TableCell>
                            <TableCell style={{ padding: "16px" }}>
                              <Text size={200}>{request.duration} {request.duration === 1 ? 'день' : request.duration < 5 ? 'дні' : 'днів'}</Text>
                            </TableCell>
                            <TableCell style={{ padding: "16px" }}>
                              <div className={`${styles.teamActions} ${hoveredTeamRow === request.id || currentTeamRequest?.id === request.id ? styles.teamActionsVisible : ''}`}>
                                <Button
                                  appearance="primary"
                                  icon={<Check size={16} />}
                                  size="small"
                                  onClick={(e) => handleApproveTeamRequest(e, request)}
                                  className={`${styles.btnApprove} ${styles.btnCompactAction}`}
                                />
                                <Button
                                  appearance="outline"
                                  icon={<X size={16} />}
                                  size="small"
                                  onClick={(e) => handleRejectTeamRequest(e, request)}
                                  className={`${styles.btnRejectGhost} ${styles.btnCompactAction}`}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    // HR Cards View
                    filteredTeamRequests.map(request => (
                      <article
                        key={request.id}
                        className={`${styles.taskCard} ${currentTeamRequest?.id === request.id ? styles.taskCardSelected : ''}`}
                        onClick={() => setCurrentTeamRequest(request)}
                      >
                        <div className={styles.taskCardInner}>
                          <div className={styles.taskCheckbox} onClick={e => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedTeamRequests.includes(request.id)}
                              onChange={(_e, data) => {
                                if (data.checked) {
                                  setSelectedTeamRequests(prev => [...prev, request.id]);
                                } else {
                                  setSelectedTeamRequests(prev => prev.filter(id => id !== request.id));
                                }
                              }}
                            />
                          </div>
                          <div className={styles.taskBody}>
                            <div className={styles.taskHeader}>
                              <div className={styles.taskBadgeContainer}>
                                <span className={`${styles.teamTypeBadge} ${
                                  request.type === 'vacation' ? styles.teamTypeBadgeVacation :
                                  request.type === 'sick' ? styles.teamTypeBadgeSick :
                                  styles.teamTypeBadgeTrip
                                }`}>
                                  {request.type === 'vacation' && <Sun size={12} />}
                                  {request.type === 'sick' && <Heart size={12} />}
                                  {request.type === 'business_trip' && <Plane size={12} />}
                                  {teamRequestTypeLabels[request.type]}
                                </span>
                              </div>
                              <span className={styles.taskDate}>
                                {request.duration} {request.duration === 1 ? 'день' : request.duration < 5 ? 'дні' : 'днів'}
                              </span>
                            </div>
                            <div className={styles.taskTitle}>
                              {request.employeeName}
                            </div>
                            <div className={styles.taskDesc}>
                              {request.employeePosition} • {request.periodStart} — {request.periodEnd}
                            </div>
                            {request.comment && (
                              <div style={{ 
                                marginTop: spacing.sm, 
                                fontSize: '13px', 
                                color: tokens.colorNeutralForeground3,
                                fontStyle: 'italic',
                              }}>
                                💬 "{request.comment}"
                              </div>
                            )}
                            <div className={styles.taskFooter}>
                              <div className={styles.taskMeta}>
                                <Avatar name={request.employeeName} size={20} />
                                <span className={styles.taskAuthorName}>{request.employeeName.split(' ')[0]}</span>
                                {request.daysLeft !== undefined && (
                                  <span className={styles.taskDepartment}>· Залишок: {request.daysLeft} з {request.daysTotal} днів</span>
                                )}
                              </div>
                              <div className={styles.taskCardActions}>
                                <Button
                                  size="small"
                                  icon={<Check size={16} />}
                                  onClick={(e) => handleApproveTeamRequest(e, request)}
                                  className={styles.btnApproveGhost}
                                >
                                  Затвердити
                                </Button>
                                <Button
                                  size="small"
                                  icon={<X size={16} />}
                                  onClick={(e) => handleRejectTeamRequest(e, request)}
                                  className={styles.btnRejectGhost}
                                >
                                  Відхилити
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )
                ) : activeFilter === 'access' ? (
                  // Inbox Zero demo for Access filter
                  <div className={styles.emptyState}>
                    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" style={{ marginBottom: spacing.lg }}>
                      <rect x="45" y="70" width="50" height="55" rx="6" fill="url(#coffeeGradientDemo)" />
                      <ellipse cx="70" cy="70" rx="25" ry="6" fill="#059669" />
                      <rect x="90" y="90" width="8" height="25" rx="4" fill="#059669" />
                      <path d="M55 60 Q 50 50 55 40" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
                      <path d="M70 55 Q 65 45 70 35" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
                      <path d="M85 60 Q 80 50 85 40" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
                      <circle cx="100" cy="50" r="18" fill="#10B981" />
                      <path d="M93 50L98 55L107 44" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="25" cy="40" r="4" fill="rgba(34, 159, 255, 0.2)" />
                      <circle cx="115" cy="100" r="5" fill="rgba(34, 159, 255, 0.2)" />
                      <circle cx="30" cy="110" r="3" fill="rgba(16, 185, 129, 0.2)" />
                      <defs>
                        <linearGradient id="coffeeGradientDemo" x1="45" y1="70" x2="95" y2="125">
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
                  </div>
                ) : (filteredTasks.length === 0 || demoEmptyInbox) ? (
                  searchQuery.trim() && !demoEmptyInbox ? (
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
                    className={styles.btnBrandOutline}
                    style={{ marginTop: spacing.sm }}
                  >
                    Очистити пошук
                  </Button>
                </div>
              ) : (tasks.length > 0 && !demoEmptyInbox) ? (
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
                      className={styles.btnBrandOutline}
                      style={{ marginTop: spacing.lg }}
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
                </div>
              )
            ) : viewMode === 'compact' ? (
              // COMPACT VIEW - Table
              <>
              <Table className={styles.teamTable}>
                <TableHeader>
                  <TableRow>
                    <TableSelectionCell style={{ width: '40px' }} />
                    <TableHeaderCell style={{ padding: "16px", width: '120px' }}>Тип</TableHeaderCell>
                    <TableHeaderCell style={{ padding: "16px" }}>Документ</TableHeaderCell>
                    <TableHeaderCell style={{ padding: "16px", width: '170px' }}>Контрагент</TableHeaderCell>
                    <TableHeaderCell style={{ padding: "16px", width: '150px' }}>Автор</TableHeaderCell>
                    <TableHeaderCell style={{ padding: "16px", width: '100px' }}>Строк</TableHeaderCell>
                    <TableHeaderCell style={{ width: '100px', padding: '16px' }} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTasks.map(task => {
                    const canApprove = isActionable(task.type);
                    const isChecked = selectedTasks.includes(task.id);
                    const isRemoving = removingTaskIds.includes(task.id);

                    return (
                      <TableRow
                        key={task.id}
                        className={`${styles.teamTableRow} ${currentTask?.id === task.id ? styles.teamTableRowSelected : ''} ${isRemoving ? styles.taskCardRemoving : ''}`}
                        onClick={() => !isRemoving && handleTaskClick(task)}
                        onMouseEnter={() => setHoveredTaskRow(task.id)}
                        onMouseLeave={() => setHoveredTaskRow(null)}
                        style={{ pointerEvents: isRemoving ? 'none' : 'auto' }}
                      >
                        {canApprove ? (
                          <TableSelectionCell
                            checked={isChecked}
                            onChange={() => toggleTaskSelection(task.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <TableCell style={{ width: '40px', padding: '16px' }} />
                        )}
                        <TableCell style={{ padding: "16px" }}>
                          <span className={`${styles.teamTypeBadge} ${canApprove ? styles.teamTypeBadgeVacation : ''}`}
                            style={canApprove ? {} : { backgroundColor: 'rgba(156, 163, 175, 0.1)', color: '#6B7280' }}>
                            {canApprove ? <Check size={12} /> : <Eye size={12} />}
                            {task.type}
                          </span>
                        </TableCell>
                        <TableCell style={{ padding: "16px" }}>
                          <TableCellLayout>
                            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                              {task.urgent && <Flame size={14} style={{ color: colors.reject, flexShrink: 0 }} />}
                              <Text weight="medium">
                                {task.number} — {task.summary.length > 40 ? task.summary.substring(0, 40) + '...' : task.summary}
                              </Text>
                            </div>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell style={{ padding: "16px" }}>
                          <Text style={{ color: tokens.colorNeutralForeground2 }}>
                            {task.contractor.length > 20 ? task.contractor.substring(0, 20) + '...' : task.contractor}
                          </Text>
                        </TableCell>
                        <TableCell style={{ padding: "16px" }}>
                          <TableCellLayout media={<Avatar name={task.preparedBy} size={24} />}>
                            <Text size={200}>{task.preparedBy}</Text>
                          </TableCellLayout>
                        </TableCell>
                        <TableCell style={{ padding: "16px" }}>
                          <Text size={200} className={task.urgent ? styles.taskDateUrgent : ''}>
                            {task.date}
                          </Text>
                        </TableCell>
                        <TableCell style={{ padding: "16px" }}>
                          <div className={`${styles.teamActions} ${hoveredTaskRow === task.id || currentTask?.id === task.id ? styles.teamActionsVisible : ''}`}>
                            {canApprove ? (
                              <>
                                <Button
                                  appearance="primary"
                                  icon={<Check size={16} />}
                                  size="small"
                                  onClick={(e) => handleApproveTask(e, task)}
                                  className={`${styles.btnApprove} ${styles.btnCompactAction}`}
                                />
                                <Button
                                  appearance="outline"
                                  icon={<X size={16} />}
                                  size="small"
                                  onClick={(e) => { e.stopPropagation(); setCurrentTask(task); handleOpenRejectModal(); }}
                                  className={`${styles.btnRejectGhost} ${styles.btnCompactAction}`}
                                />
                              </>
                            ) : (
                              <Button
                                appearance="subtle"
                                icon={<Eye size={16} />}
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleTaskClick(task); }}
                                className={styles.btnCompactAction}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination for compact view */}
              {showPagination && (
                <div className={styles.pagination}>
                  <Button
                    appearance="subtle"
                    size="small"
                    className={`${styles.pageBtn} ${safePage <= 1 ? styles.pageBtnDisabled : ''}`}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    ←
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      appearance="subtle"
                      size="small"
                      className={`${styles.pageBtn} ${page === safePage ? styles.pageBtnActive : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    appearance="subtle"
                    size="small"
                    className={`${styles.pageBtn} ${safePage >= totalPages ? styles.pageBtnDisabled : ''}`}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                  >
                    →
                  </Button>
                  <span className={styles.pageInfo}>{safePage} з {totalPages}</span>
                </div>
              )}

              {/* Team Requests Table in Compact View */}
              {(activeFilter === 'all' || activeFilter === 'hr') && filteredTeamRequests.length > 0 && (
                <div style={{ marginTop: spacing.xl }}>
                  {activeFilter === 'all' && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: spacing.sm, 
                      marginBottom: spacing.md,
                      paddingBottom: spacing.md,
                      ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
                    }}>
                      <Users size={18} style={{ color: '#229FFF' }} />
                      <Text weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>
                        Запити від команди
                      </Text>
                      <span style={{ 
                        backgroundColor: 'rgba(34, 159, 255, 0.1)', 
                        color: colors.brand, 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontSize: '12px',
                        fontWeight: 600,
                      }}>
                        {filteredTeamRequests.length}
                      </span>
                    </div>
                  )}
                  <Table className={styles.teamTable}>
                    <TableHeader>
                      <TableRow>
                        <TableSelectionCell style={{ width: '40px' }} />
                        <TableHeaderCell style={{ padding: "16px" }}>Тип</TableHeaderCell>
                        <TableHeaderCell style={{ padding: "16px" }}>Співробітник</TableHeaderCell>
                        <TableHeaderCell style={{ padding: "16px" }}>Період</TableHeaderCell>
                        <TableHeaderCell style={{ padding: "16px" }}>Тривалість</TableHeaderCell>
                        <TableHeaderCell style={{ width: '100px', padding: '16px' }} />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeamRequests.map(request => (
                        <TableRow
                          key={`team-${request.id}`}
                          className={`${styles.teamTableRow} ${currentTeamRequest?.id === request.id ? styles.teamTableRowSelected : ''}`}
                          onClick={() => setCurrentTeamRequest(request)}
                          
                        >
                          <TableSelectionCell
                            checked={selectedTeamRequests.includes(request.id)}
                            onChange={(_e, data) => {
                              if (data.checked) {
                                setSelectedTeamRequests(prev => [...prev, request.id]);
                              } else {
                                setSelectedTeamRequests(prev => prev.filter(id => id !== request.id));
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <TableCell style={{ padding: "16px" }}>
                            <span className={`${styles.teamTypeBadge} ${
                              request.type === 'vacation' ? styles.teamTypeBadgeVacation :
                              request.type === 'sick' ? styles.teamTypeBadgeSick :
                              styles.teamTypeBadgeTrip
                            }`}>
                              {request.type === 'vacation' && <Sun size={12} />}
                              {request.type === 'sick' && <Heart size={12} />}
                              {request.type === 'business_trip' && <Plane size={12} />}
                              {teamRequestTypeLabels[request.type]}
                            </span>
                          </TableCell>
                          <TableCell style={{ padding: "16px" }}>
                            <TableCellLayout media={<Avatar name={request.employeeName} size={24} />}>
                              {request.employeeName}
                            </TableCellLayout>
                          </TableCell>
                          <TableCell style={{ padding: "16px" }}>
                            <Text size={200}>{request.periodStart} — {request.periodEnd}</Text>
                          </TableCell>
                          <TableCell style={{ padding: "16px" }}>
                            <Text size={200}>
                              {request.duration} {request.duration === 1 ? 'день' : request.duration < 5 ? 'дні' : 'днів'}
                            </Text>
                          </TableCell>
                          <TableCell style={{ padding: "16px" }}>
                            <div className={`${styles.teamActions} ${hoveredTeamRow === request.id || currentTeamRequest?.id === request.id ? styles.teamActionsVisible : ''}`}>
                              <Button
                                appearance="primary"
                                icon={<Check size={16} />}
                                size="small"
                                onClick={(e) => handleApproveTeamRequest(e, request)}
                                className={`${styles.btnApprove} ${styles.btnCompactAction}`}
                              />
                              <Button
                                appearance="outline"
                                icon={<X size={16} />}
                                size="small"
                                onClick={(e) => handleRejectTeamRequest(e, request)}
                                className={`${styles.btnRejectGhost} ${styles.btnCompactAction}`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
            ) : (
              // CARDS VIEW — 2-column grid with pagination
              <>
              <div className={styles.cardsGrid}>
              {paginatedTasks.map(task => {
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
                        {canApprove ? (
                          <Checkbox
                            checked={isChecked}
                            onChange={() => toggleTaskSelection(task.id)}
                          />
                        ) : (
                          <div style={{ width: '16px' }} />
                        )}
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
                                className={styles.btnApproveGhost}
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
              })}
              </div>

              {/* Pagination for cards view */}
              {showPagination && (
                <div className={styles.pagination}>
                  <Button
                    appearance="subtle"
                    size="small"
                    className={`${styles.pageBtn} ${safePage <= 1 ? styles.pageBtnDisabled : ''}`}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    ←
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      appearance="subtle"
                      size="small"
                      className={`${styles.pageBtn} ${page === safePage ? styles.pageBtnActive : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    appearance="subtle"
                    size="small"
                    className={`${styles.pageBtn} ${safePage >= totalPages ? styles.pageBtnDisabled : ''}`}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                  >
                    →
                  </Button>
                  <span className={styles.pageInfo}>{safePage} з {totalPages}</span>
                </div>
              )}
            </>
            )}

            {/* Team Requests Section - show for 'all' filter */}
            {activeFilter === 'all' && filteredTeamRequests.length > 0 && !demoEmptyInbox && viewMode === 'cards' && (
              <div style={{ marginTop: spacing.xl }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm, 
                  marginBottom: spacing.md,
                  paddingBottom: spacing.md,
                  ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
                }}>
                  <Users size={18} style={{ color: '#229FFF' }} />
                  <Text weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>
                    Запити від команди
                  </Text>
                  <span style={{ 
                    backgroundColor: 'rgba(34, 159, 255, 0.1)', 
                    color: colors.brand, 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    fontSize: '12px',
                    fontWeight: 600,
                  }}>
                    {filteredTeamRequests.length}
                  </span>
                </div>
                {/* Team Request Cards */}
                {filteredTeamRequests.map(request => (
                  <article
                    key={request.id}
                    className={`${styles.taskCard} ${currentTeamRequest?.id === request.id ? styles.taskCardSelected : ''}`}
                    onClick={() => setCurrentTeamRequest(request)}
                  >
                    <div className={styles.taskCardInner}>
                      <div className={styles.taskCheckbox} onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedTeamRequests.includes(request.id)}
                          onChange={(_e, data) => {
                            if (data.checked) {
                              setSelectedTeamRequests(prev => [...prev, request.id]);
                            } else {
                              setSelectedTeamRequests(prev => prev.filter(id => id !== request.id));
                            }
                          }}
                        />
                      </div>
                      <div className={styles.taskBody}>
                        <div className={styles.taskHeader}>
                          <div className={styles.taskBadgeContainer}>
                            <span className={`${styles.teamTypeBadge} ${
                              request.type === 'vacation' ? styles.teamTypeBadgeVacation :
                              request.type === 'sick' ? styles.teamTypeBadgeSick :
                              styles.teamTypeBadgeTrip
                            }`}>
                              {request.type === 'vacation' && <Sun size={12} />}
                              {request.type === 'sick' && <Heart size={12} />}
                              {request.type === 'business_trip' && <Plane size={12} />}
                              {teamRequestTypeLabels[request.type]}
                            </span>
                          </div>
                          <span className={styles.taskDate}>
                            {request.duration} {request.duration === 1 ? 'день' : request.duration < 5 ? 'дні' : 'днів'}
                          </span>
                        </div>
                        <div className={styles.taskTitle}>
                          {request.employeeName}
                        </div>
                        <div className={styles.taskDesc}>
                          {request.employeePosition} • {request.periodStart} — {request.periodEnd}
                        </div>
                        {request.comment && (
                          <div style={{ 
                            marginTop: spacing.sm, 
                            fontSize: '13px', 
                            color: tokens.colorNeutralForeground3,
                            fontStyle: 'italic',
                          }}>
                            💬 "{request.comment}"
                          </div>
                        )}
                        <div className={styles.taskFooter}>
                          <div className={styles.taskMeta}>
                            <Avatar name={request.employeeName} size={20} />
                            <span className={styles.taskAuthorName}>{request.employeeName.split(' ')[0]}</span>
                            {request.daysLeft !== undefined && (
                              <span className={styles.taskDepartment}>· Залишок: {request.daysLeft} з {request.daysTotal} днів</span>
                            )}
                          </div>
                          <div className={styles.taskCardActions}>
                            <Button
                              size="small"
                              icon={<Check size={16} />}
                              onClick={(e) => handleApproveTeamRequest(e, request)}
                              className={styles.btnApproveGhost}
                            >
                              Затвердити
                            </Button>
                            <Button
                              size="small"
                              icon={<X size={16} />}
                              onClick={(e) => handleRejectTeamRequest(e, request)}
                              className={styles.btnRejectGhost}
                            >
                              Відхилити
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
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
                            ? <Spinner size="tiny" />
                            : <Download size={16} />}
                          onClick={handleLoadAttachments}
                          disabled={attachmentsLoading}
                          className={styles.btnBrandOutline}
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
                    className={styles.btnApproveGhost}
                    style={{ padding: '10px 24px' }}
                  >
                    Затвердити
                  </Button>
                  <Button
                    icon={<X size={20} />}
                    onClick={handleOpenRejectModal}
                    className={styles.btnRejectGhost}
                    style={{ padding: '10px 24px' }}
                  >
                    Відхилити
                  </Button>
                </div>
              ) : (
                <div className={styles.detailFooterViewOnly}>
                  <Button
                    icon={<ExternalLink size={20} />}
                    className={styles.btnOpenSystem}
                  >
                    Відкрити в системі
                  </Button>
                </div>
              )}
            </aside>
          )}

          {/* Team Detail Panel */}
          {currentTeamRequest && (
            <aside className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <span className={`${styles.teamTypeBadge} ${
                  currentTeamRequest.type === 'vacation' ? styles.teamTypeBadgeVacation :
                  currentTeamRequest.type === 'sick' ? styles.teamTypeBadgeSick :
                  styles.teamTypeBadgeTrip
                }`}>
                  {currentTeamRequest.type === 'vacation' && <Sun size={12} />}
                  {currentTeamRequest.type === 'sick' && <Heart size={12} />}
                  {currentTeamRequest.type === 'business_trip' && <Plane size={12} />}
                  {teamRequestTypeLabels[currentTeamRequest.type]}
                </span>
                <Button appearance="subtle" icon={<X size={20} />} onClick={() => setCurrentTeamRequest(null)} />
              </div>

              <div className={styles.detailBody}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xxl }}>
                  <Avatar name={currentTeamRequest.employeeName} size={56} />
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{currentTeamRequest.employeeName}</div>
                    <div style={{ fontSize: '14px', color: tokens.colorNeutralForeground3 }}>{currentTeamRequest.employeePosition}</div>
                  </div>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detailField}>
                    <div className={styles.detailFieldLabel}>Початок</div>
                    <div className={styles.detailFieldValue}>{currentTeamRequest.periodStart}</div>
                  </div>
                  <div className={styles.detailField}>
                    <div className={styles.detailFieldLabel}>Кінець</div>
                    <div className={styles.detailFieldValue}>{currentTeamRequest.periodEnd}</div>
                  </div>
                  <div className={styles.detailField}>
                    <div className={styles.detailFieldLabel}>Тривалість</div>
                    <div className={styles.detailFieldValue}>{currentTeamRequest.duration} {currentTeamRequest.duration === 1 ? 'день' : currentTeamRequest.duration < 5 ? 'дні' : 'днів'}</div>
                  </div>
                  {currentTeamRequest.daysLeft !== undefined && (
                    <div className={styles.detailField}>
                      <div className={styles.detailFieldLabel}>Залишок днів</div>
                      <div className={styles.detailFieldValue}>{currentTeamRequest.daysLeft} з {currentTeamRequest.daysTotal}</div>
                    </div>
                  )}
                </div>

                {currentTeamRequest.comment && (
                  <div style={{ marginTop: spacing.lg }}>
                    <div className={styles.detailFieldLabel} style={{ marginBottom: spacing.sm }}>Коментар</div>
                    <div style={{ 
                      padding: spacing.lg, 
                      backgroundColor: tokens.colorNeutralBackground2, 
                      borderRadius: '8px',
                      fontStyle: 'italic',
                      color: tokens.colorNeutralForeground2,
                      lineHeight: '1.5'
                    }}>
                      "{currentTeamRequest.comment}"
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.detailFooter}>
                <Button
                  icon={<Check size={20} />}
                  onClick={(e) => handleApproveTeamRequest(e, currentTeamRequest)}
                  className={styles.btnApproveGhost}
                  style={{ padding: '10px 24px' }}
                >
                  Затвердити
                </Button>
                <Button
                  icon={<X size={20} />}
                  onClick={(e) => handleRejectTeamRequest(e, currentTeamRequest)}
                  className={styles.btnRejectGhost}
                  style={{ padding: '10px 24px' }}
                >
                  Відхилити
                </Button>
              </div>
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
                      className={styles.btnOpenSystem}
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
      <Dialog
        open={showRejectModal && !!currentTask}
        onOpenChange={(_e, data) => { if (!data.open) handleCloseRejectModal(); }}
      >
        <DialogSurface style={{ maxWidth: '480px' }}>
          <DialogBody>
            <DialogTitle
              action={
                <Button appearance="subtle" icon={<X size={20} />} onClick={handleCloseRejectModal} />
              }
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <AlertCircle size={20} style={{ color: '#DC2626' }} />
                </div>
                <div>
                  <div>Відхилення документа</div>
                  {currentTask && (
                    <Text size={200} style={{ color: tokens.colorNeutralForeground2, fontWeight: 400 }}>
                      {currentTask.type} {currentTask.number}
                    </Text>
                  )}
                </div>
              </div>
            </DialogTitle>
            <DialogContent>
              <div style={{ marginBottom: spacing.sm }}>
                <Text size={200} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }}>
                  Причина відхилення <span style={{ color: '#EF4444' }}>*</span>
                </Text>
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
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" style={{ borderRadius: '8px' }}>Скасувати</Button>
              </DialogTrigger>
              <Button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
                className={!rejectReason.trim() ? styles.btnRejectDisabled : styles.btnReject}
              >
                Відхилити документ
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Bulk Approve Modal */}
      <Dialog
        open={showBulkApproveModal}
        onOpenChange={(_e, data) => { if (!data.open) setShowBulkApproveModal(false); }}
      >
        <DialogSurface style={{ maxWidth: '440px' }}>
          <DialogBody>
            <DialogTitle>Масове затвердження</DialogTitle>
            <DialogContent>
              <Text style={{ color: tokens.colorNeutralForeground2 }}>
                Ви впевнені, що хочете затвердити {selectedTasks.length} документів?
              </Text>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" style={{ borderRadius: '8px' }}>Скасувати</Button>
              </DialogTrigger>
              <Button
                onClick={handleConfirmBulkApprove}
                className={styles.btnApprove}
              >
                Затвердити всі ({selectedTasks.length})
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Onboarding Modal */}
      <Dialog
        open={showOnboarding}
        modalType="alert"
      >
        <DialogSurface style={{ maxWidth: '500px', borderRadius: '20px', overflow: 'hidden' }}>
          <div className={styles.onboardingDecor} />
          <DialogBody style={{ padding: spacing.xxxl }}>
            <DialogContent style={{ textAlign: 'center' }}>
              {onboardingStep === 0 && (
                <>
                  <div className={styles.onboardingIcon}>
                    <Sparkles size={40} style={{ color: '#229FFF' }} />
                  </div>
                  <div className={styles.onboardingTitle}>
                    Вітаємо в «Погоджуй легко»! 🎉
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
                    color: colors.success, 
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
            </DialogContent>
            <DialogActions style={{ justifyContent: 'center' }}>
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
                  backgroundColor: colors.brand,
                  borderRadius: '8px',
                  minWidth: '120px',
                }}
              >
                {onboardingStep < 2 ? 'Далі' : 'Почати роботу'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

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
