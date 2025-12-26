
export enum SourceType {
  CAMERA = 'camera',
  EMAIL = 'email_import',
  UPLOAD = 'manual_upload',
  SCAN = 'scan',
  NOTE = 'note'
}

export enum EventType {
  RECEIPT = 'receipt',
  ESSAY = 'essay',
  NOTE = 'note',
  QUOTE = 'quote',
  IDENTITY = 'identity',
  CORRESPONDENCE = 'correspondence',
  MEDIA = 'media',
  OTHER = 'other'
}

export enum EventStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  ARCHIVED = 'archived'
}

export interface FileRecord {
  id: string;
  original_filename: string;
  hash: string;
  size: number;
  mime_type: string;
  storage_path: string;
  expires_at?: number; // For temporary mobile storage
}

export interface CitadelEvent {
  id: string;
  created_at: number;
  source: SourceType;
  event_type: EventType;
  title: string;
  summary: string;
  user_answers: Record<string, string>;
  tags: string[];
  files: FileRecord[];
  entities: {
    people: string[];
    orgs: string[];
    places: string[];
  };
  status: EventStatus;
  is_mobile_capture?: boolean;
  transferred_to_desktop?: boolean;
}

export interface AppState {
  isSetup: boolean;
  rootPath: string | null;
  apiKey: string | null;
  events: CitadelEvent[];
  selectedEventId: string | null;
  isMobileView: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
