// src/types/payment.ts

export interface Wallet {
  walletId: string;
  userId: string;
  balance: number;
  frozenBalance: number;
  totalBalance: number;
  updatedAt: string;
}

export interface Deposit {
  depositId: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  qrCodeUrl: string;
  qrCodeData: string;
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
}

export interface Transaction {
  transactionId: string;
  userId: string;
  type: string;
  status: string;
  amount: number;
  description: string;
  createdAt: string;
}
