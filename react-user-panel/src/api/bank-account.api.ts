import { apiGet, apiPost, apiPut, apiDelete } from './config/axiosConfig';
import { ApiResponse } from '@/types';
import { BankAccount } from '@/types/user.types';

/**
 * Get all bank accounts
 */
export const getBankAccounts = async (): Promise<ApiResponse<BankAccount[]>> => {
    return apiGet<ApiResponse<BankAccount[]>>('/bank-accounts');
};

/**
 * Add a new bank account
 */
export const addBankAccount = async (data: Partial<BankAccount>): Promise<ApiResponse<BankAccount>> => {
    return apiPost<ApiResponse<BankAccount>>('/bank-accounts', data);
};

/**
 * Update a bank account
 */
export const updateBankAccount = async (id: number, data: Partial<BankAccount>): Promise<ApiResponse<BankAccount>> => {
    return apiPut<ApiResponse<BankAccount>>(`/bank-accounts/${id}`, data);
};

/**
 * Delete a bank account
 */
export const deleteBankAccount = async (id: number): Promise<ApiResponse<void>> => {
    return apiDelete<ApiResponse<void>>(`/bank-accounts/${id}`);
};

/**
 * Set a bank account as primary
 */
export const setPrimaryAccount = async (id: number): Promise<ApiResponse<BankAccount>> => {
    return apiPut<ApiResponse<BankAccount>>(`/bank-accounts/${id}/set-primary`, {});
};
