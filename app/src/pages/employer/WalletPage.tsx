// src/pages/employer/WalletPage.tsx
import React, { useState, useEffect } from 'react';
import { getWallet, initiateDeposit, confirmDeposit, getTransactionHistory } from '../../api/paymentApi';
import type { Wallet, Deposit, Transaction } from '../../types/payment';
import './WalletPage.css';

const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deposit flow states
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [currentDeposit, setCurrentDeposit] = useState<Deposit | null>(null);
  const [refCode, setRefCode] = useState<string>('');
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositStep, setDepositStep] = useState<'form' | 'qr' | 'confirm'>('form');

  const userId = localStorage.getItem('userId') || '';

  // Load wallet data
  useEffect(() => {
    if (!userId) {
      setError('Vui lòng đăng nhập để xem ví');
      return;
    }
    loadWalletData();
  }, [userId]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const walletData = await getWallet(userId);
      setWallet(walletData);

      const historyData = await getTransactionHistory(userId, 0, 10);
      setTransactions(historyData.transactions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Initiate deposit
  const handleInitiateDeposit = async () => {
    if (depositAmount <= 0) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }
    if (depositAmount > 100_000_000) {
      setError('Số tiền vượt quá giới hạn (max 100M)');
      return;
    }

    try {
      setLoading(true);
      const deposit = await initiateDeposit(userId, depositAmount);
      setCurrentDeposit(deposit);
      setDepositStep('qr');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khởi tạo nạp tiền');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm deposit
  const handleConfirmDeposit = async () => {
    if (!currentDeposit) return;
    if (!refCode) {
      setError('Vui lòng nhập mã xác nhận');
      return;
    }

    try {
      setLoading(true);
      const result = await confirmDeposit(userId, currentDeposit.depositId, refCode);
      setCurrentDeposit(result);
      setDepositStep('confirm');
      
      // Reload wallet
      await loadWalletData();
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setShowDepositForm(false);
        setDepositAmount(0);
        setRefCode('');
        setDepositStep('form');
        setCurrentDeposit(null);
      }, 2000);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xác nhận nạp tiền');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeposit = () => {
    setShowDepositForm(false);
    setDepositAmount(0);
    setRefCode('');
    setDepositStep('form');
    setCurrentDeposit(null);
    setError(null);
  };

  if (loading && !wallet) {
    return <div className="wallet-page">Đang tải...</div>;
  }

  return (
    <div className="wallet-page">
      <div className="wallet-container">
        <h1>Ví Của Tôi</h1>

        {error && <div className="error-message">{error}</div>}

        {/* Wallet Balance Card */}
        {wallet && (
          <div className="wallet-card">
            <div className="balance-section">
              <div className="balance-item">
                <label>Số dư khả dụng</label>
                <div className="amount">{wallet.balance.toLocaleString('vi-VN')}₫</div>
              </div>
              <div className="balance-item">
                <label>Tiền bị khoá</label>
                <div className="amount frozen">{wallet.frozenBalance.toLocaleString('vi-VN')}₫</div>
              </div>
              <div className="balance-item">
                <label>Tổng cộng</label>
                <div className="amount total">{wallet.totalBalance.toLocaleString('vi-VN')}₫</div>
              </div>
            </div>

            <div className="wallet-actions">
              <button 
                className="btn-primary"
                onClick={() => setShowDepositForm(true)}
              >
                + Nạp Tiền
              </button>
              <button className="btn-secondary">
                Rút Tiền
              </button>
            </div>
          </div>
        )}

        {/* Deposit Modal */}
        {showDepositForm && (
          <div className="modal-overlay" onClick={handleCloseDeposit}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={handleCloseDeposit}>×</button>

              {depositStep === 'form' && (
                <div className="deposit-form">
                  <h2>Nạp Tiền Vào Ví</h2>
                  <div className="form-group">
                    <label>Số tiền (VND)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={e => setDepositAmount(Number(e.target.value))}
                      placeholder="Nhập số tiền"
                      min="1"
                      max="100000000"
                      disabled={loading}
                    />
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={handleInitiateDeposit}
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                  </button>
                </div>
              )}

              {depositStep === 'qr' && currentDeposit && (
                <div className="deposit-qr">
                  <h2>Quét Mã QR Để Thanh Toán</h2>
                  <div className="qr-display">
                    <img src={currentDeposit.qrCodeUrl} alt="QR Code" className="qr-code" />
                  </div>
                  <p className="qr-info">
                    <strong>Số tiền:</strong> {currentDeposit.amount.toLocaleString('vi-VN')}₫
                  </p>
                  <p className="qr-info">
                    <strong>Hết hạn lúc:</strong> {new Date(currentDeposit.expiresAt).toLocaleTimeString('vi-VN')}
                  </p>

                  <div className="form-group">
                    <label>Mã xác nhận từ QR (mock)</label>
                    <input
                      type="text"
                      value={refCode}
                      onChange={e => setRefCode(e.target.value)}
                      placeholder="Nhập mã ref code (VD: REF_12345)"
                      disabled={loading}
                    />
                    <small>Trong thực tế, đây sẽ là callback từ payment gateway</small>
                  </div>

                  <button 
                    className="btn-primary"
                    onClick={handleConfirmDeposit}
                    disabled={loading || !refCode}
                  >
                    {loading ? 'Đang xác nhận...' : 'Xác Nhận Thanh Toán'}
                  </button>
                </div>
              )}

              {depositStep === 'confirm' && currentDeposit?.status === 'COMPLETED' && (
                <div className="deposit-success">
                  <div className="success-icon">✓</div>
                  <h2>Nạp Tiền Thành Công!</h2>
                  <p>
                    Đã nạp <strong>{currentDeposit.amount.toLocaleString('vi-VN')}₫</strong> vào ví
                  </p>
                  <p className="timestamp">
                    Thời gian: {new Date(currentDeposit.completedAt || '').toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="transaction-history">
          <h2>Lịch Sử Giao Dịch</h2>
          {transactions.length === 0 ? (
            <p className="no-data">Chưa có giao dịch nào</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Loại giao dịch</th>
                  <th>Trạng thái</th>
                  <th>Số tiền</th>
                  <th>Mô tả</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.transactionId}>
                    <td><span className="badge">{tx.type}</span></td>
                    <td>
                      <span className={`status ${tx.status.toLowerCase()}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="amount">
                      {tx.type === 'DEPOSIT' ? '+' : ''}{tx.amount.toLocaleString('vi-VN')}₫
                    </td>
                    <td>{tx.description}</td>
                    <td>{new Date(tx.createdAt).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
