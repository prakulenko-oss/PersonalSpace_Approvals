/* Мінімальні декларації File System Access API (Chrome/Edge). */
interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | BufferSource | Blob): Promise<void>;
  close(): Promise<void>;
}
interface FileSystemFileHandle {
  readonly name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
  queryPermission(opts?: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
  requestPermission(opts?: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
}
interface Window {
  showOpenFilePicker(opts?: {
    types?: { description?: string; accept: Record<string, string[]> }[];
    multiple?: boolean;
  }): Promise<FileSystemFileHandle[]>;
  showSaveFilePicker(opts?: {
    suggestedName?: string;
    types?: { description?: string; accept: Record<string, string[]> }[];
  }): Promise<FileSystemFileHandle>;
}
