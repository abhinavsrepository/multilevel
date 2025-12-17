import 'transaction_model.dart';

/// Wallet model representing user's wallet and balance information
class WalletModel {
  /// Current wallet balance
  final double balance;

  /// Total earnings accumulated
  final double totalEarnings;

  /// Total amount withdrawn
  final double totalWithdrawals;

  /// Amount in pending withdrawal requests
  final double pendingWithdrawals;

  /// Available balance that can be withdrawn
  final double availableBalance;

  /// Balance that is locked/reserved
  final double lockedBalance;

  /// Last transaction details
  final TransactionModel? lastTransaction;

  const WalletModel({
    required this.balance,
    required this.totalEarnings,
    required this.totalWithdrawals,
    required this.pendingWithdrawals,
    required this.availableBalance,
    required this.lockedBalance,
    this.lastTransaction,
  });

  /// Creates a WalletModel instance from a JSON map
  factory WalletModel.fromJson(Map<String, dynamic> json) {
    return WalletModel(
      balance: (json['balance'] as num).toDouble(),
      totalEarnings: (json['totalEarnings'] as num).toDouble(),
      totalWithdrawals: (json['totalWithdrawals'] as num).toDouble(),
      pendingWithdrawals: (json['pendingWithdrawals'] as num).toDouble(),
      availableBalance: (json['availableBalance'] as num).toDouble(),
      lockedBalance: (json['lockedBalance'] as num).toDouble(),
      lastTransaction: json['lastTransaction'] != null
          ? TransactionModel.fromJson(json['lastTransaction'] as Map<String, dynamic>)
          : null,
    );
  }

  /// Converts the WalletModel instance to a JSON map
  Map<String, dynamic> toJson() {
    return {
      'balance': balance,
      'totalEarnings': totalEarnings,
      'totalWithdrawals': totalWithdrawals,
      'pendingWithdrawals': pendingWithdrawals,
      'availableBalance': availableBalance,
      'lockedBalance': lockedBalance,
      'lastTransaction': lastTransaction?.toJson(),
    };
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is WalletModel &&
        other.balance == balance &&
        other.totalEarnings == totalEarnings &&
        other.totalWithdrawals == totalWithdrawals &&
        other.pendingWithdrawals == pendingWithdrawals &&
        other.availableBalance == availableBalance &&
        other.lockedBalance == lockedBalance &&
        other.lastTransaction == lastTransaction;
  }

  @override
  int get hashCode {
    return Object.hash(
      balance,
      totalEarnings,
      totalWithdrawals,
      pendingWithdrawals,
      availableBalance,
      lockedBalance,
      lastTransaction,
    );
  }
}
