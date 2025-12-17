
export enum UserRole {
  ADMIN = 'admin',
  AGENTE = 'agente'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
}

export interface Agent {
  id: string;
  agentNumber: string;
  firstName: string;
  lastName: string;
}

export enum ClientLevelName {
  PLATINO = 'Platino',
  ORO = 'Oro',
  PLATA = 'Plata',
  BRONCE = 'Bronce',
  NUEVO = 'Nuevo'
}

export interface LevelThreshold {
  name: ClientLevelName;
  minPoints: number;
}

export interface Customer {
  id: string;
  name: string;
  location: string;
  clientType: string;
  agentName: string;
  accountType: string;
  points: number;
  level: ClientLevelName;
}

export interface Reward {
  id: string;
  pointsRequired: number;
  description: string;
  isActive: boolean;
}

export enum OrderStatus {
  PENDIENTE = 'Pendiente',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado'
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  folio: string;
  date: string;
  amount: number;
  paymentPdf: string; 
  originalOrderPdf: string; 
  notes: string;
  status: OrderStatus;
  rejectionReason?: string;
  pointsAwarded?: number;
  agentId: string;
}

export interface AppConfig {
  pointRatio: number;
}
