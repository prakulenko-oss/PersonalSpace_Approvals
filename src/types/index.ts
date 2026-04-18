// ── APPROVALS ────────────────────────────────────────────────────────────

export interface Attachment {
  name: string;
  size: string;
}

export interface Task {
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

export interface ArchivedTask extends Task {
  status: 'approved' | 'rejected';
  processedAt: string;
  processedDate: 'today' | 'yesterday' | '2days';
  rejectReason?: string;
}

export interface TeamRequest {
  id: number;
  type: 'vacation' | 'sick' | 'business_trip';
  employeeName: string;
  employeePosition: string;
  periodStart: string;
  periodEnd: string;
  duration: number;
  daysLeft?: number;
  daysTotal?: number;
  comment?: string;
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────

export interface CalDay {
  d: number;
  other?: boolean;
  today?: boolean;
  holiday?: boolean;
}

export interface NavTile {
  label: string;
  icon: string; // lucide icon name — використовуємо компонент напряму в даних
  dev?: boolean;
  sub?: string;
  route?: string;
}

export interface CompanyEvent {
  date: string;
  name: string;
  tag: string;
}

export interface Vacancy {
  title: string;
  loc: string;
  hot?: boolean;
}
