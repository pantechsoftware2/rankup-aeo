export interface AuditUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface PublicAuditUser {
  id: string;
  fullName: string;
  email: string;
}
