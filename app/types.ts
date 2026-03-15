export interface Module {
  id: string;
  title: string;
  order: number;
  formLink: string;
  passingScore: number;
}

export interface Session {
  id: string;
  title: string;
  link: string;
  material?: string;
  moduleId: string;
  locked: boolean;
}

export interface UserData {
  name: string;
  email: string;
  municipio: string;
  finca?: string;
  cluster: string;
  telefono?: string;
  progress: number;
  role?: "admin" | "user";
  status?: "pending" | "active";
  moduleScores?: Record<number, number>;
  createdAt?: Date;
}

export interface ProgressEntry {
  userId: string;
  sessionId: string;
}

export interface Evaluation {
  userId: string;
  moduleId: string;
  score: number;
  passed: boolean;
}

export interface Certificate {
  certificateId: string;
  name: string;
  userId?: string;
  issuedAt?: Date;
}
