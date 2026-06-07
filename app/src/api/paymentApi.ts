// src/api/paymentApi.ts
import { paymentHttp } from './http';

export interface DepositResponse {
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

export interface WalletResponse {
  walletId: string;
  userId: string;
  balance: number;
  frozenBalance: number;
  totalBalance: number;
  updatedAt: string;
}

export interface TransactionResponse {
  transactionId: string;
  userId: string;
  type: string;
  status: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface TransactionHistoryResponse {
  transactions: TransactionResponse[];
  total: number;
  page: number;
  pageSize: number;
}

// Deposit APIs
export const initiateDeposit = (userId: string, amount: number): Promise<DepositResponse> => {
  return paymentHttp.post('/api/deposits/initiate', { amount }, {
    headers: { 'X-User-Id': userId },
  }).then(res => res.data);
};

export const confirmDeposit = (userId: string, depositId: string, transactionRefCode: string): Promise<DepositResponse> => {
  return paymentHttp.post(`/api/deposits/${depositId}/confirm`, { transactionRefCode }, {
    headers: { 'X-User-Id': userId },
  }).then(res => res.data);
};

export const getDeposit = (userId: string, depositId: string): Promise<DepositResponse> => {
  return paymentHttp.get(`/api/deposits/${depositId}`, {
    headers: { 'X-User-Id': userId },
  }).then(res => res.data);
};

// Wallet APIs
export const getWallet = (userId: string): Promise<WalletResponse> => {
  return paymentHttp.get(`/api/wallets/${userId}`).then(res => res.data);
};

// Transaction APIs
export const getTransactionHistory = (userId: string, page = 0, pageSize = 10): Promise<TransactionHistoryResponse> => {
  return paymentHttp.get('/api/transactions', {
    params: { page, pageSize },
    headers: { 'X-User-Id': userId },
  }).then(res => res.data);
};

export const getTransactionsByType = (userId: string, type: string, page = 0, pageSize = 10): Promise<TransactionHistoryResponse> => {
  return paymentHttp.get('/api/transactions/filter', {
    params: { type, page, pageSize },
    headers: { 'X-User-Id': userId },
  }).then(res => res.data);
};
