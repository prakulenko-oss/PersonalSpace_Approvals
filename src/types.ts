export type UnitId = 'fin' | 'auto' | 'ops' | 'td';
export type StreamId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7';
export type SupportId = 'it_full' | 'it_partner' | 'business' | 'vendor' | 'sunset';
export type SystemStatus = 'active' | 'sunset';
export type FuncId = 'fadm' | 'fsup' | 'fdev';
export type ExecType = 'itdom' | 'partner' | 'business';
/** Спецстан клітинки; 'norm' — звичайний (вміст визначає заповненість). */
export type CellSt = 'norm' | 'vacant' | 'na';
/** Видимий стан клітинки. */
export type DispState = 'filled' | 'vacant' | 'na' | 'unset';

export interface Role { id: string; name: string; short: string; func: FuncId }
export interface Exec { id: string; name: string; type: ExecType; note: string }

export interface Person {
  id: string;
  name: string;
  unit: UnitId;
  grade: string;
  type: string;
  flag: string;
  title: string;
  lead?: boolean;
}

export interface System {
  id: string;
  name: string;
  unit: UnitId;
  stream: StreamId;
  sox: boolean;
  saas: boolean;
  support: SupportId;
  partner: string;
  status: SystemStatus;
  note: string;
  ord: number;
  contractEnd: string;
  contractUrl: string;
  contractCap: string;
  caseText: string;  // захищений кейс: погоджений склад
  caseUrl: string;   // посилання на кейс
}

export interface Cell {
  st: CellSt;
  p: string[];   // люди домену
  x: string[];   // виконавці з довідника
  n: string;     // нотатка
  b?: string;    // резервна людина (backup)
}

export interface AppState {
  rev: number;
  roles: Role[];
  execs: Exec[];
  people: Person[];
  systems: System[];
  cells: Record<string, Cell>;
}

export type NavId = 'overview' | 'map' | 'm2' | 'm3' | 'systems' | 'people' | 'execs' | 'roles' | 'settings';
export type MapView = 'matrix' | 'board';
export type Problem = '' | 'vacant' | 'unset' | 'po' | 'nobackup';
export interface MatrixPreset { unit?: UnitId | ''; problem?: Problem; query?: string }

export type ModalState =
  | { kind: 'cell'; sysId: string; roleId: string }
  | { kind: 'system'; sysId: string | null }
  | { kind: 'person'; perId: string | null }
  | { kind: 'exec'; xid: string | null }
  | { kind: 'role'; roleId: string | null }
  | { kind: 'rolePick'; subjKind: 'person' | 'exec'; id: string; sysId: string; fromKey: string | null }
  | { kind: 'colFill'; roleId: string; sysIds: string[] }
  | { kind: 'import' }
  | { kind: 'feedReport'; title: string; lines: string[] }
  | null;

export interface Sel { kind: 'person' | 'exec'; id: string; from: string | null }

export interface Assignment { sysId: string; roleId: string }

export type DataSource =
  | { mode: 'local' }
  | { mode: 'file'; name: string; pending: boolean };
