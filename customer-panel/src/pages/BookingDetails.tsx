import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';

interface EMISchedule {
    id: string;
    dueDate: string;
    amount: string;
    status: 'Paid' | 'Upcoming' | 'Overdue';
    paidDate?: string;
}

export function BookingDetails() {
    const [activeTab, setActiveTab] = useState<'schedule' | 'history'>('schedule');

    // Mock Data
    const bookingInfo = {
        id: 'BK-2024-001',
        property: 'Luxury Villa with Sea View',
        bookingDate: '2024-01-15',
        totalAmount: '$450,000',
        paidAmount: '$45,200',
        nextDue: '2024-12-15',
        status: 'Confirmed'
    };

    const emiSchedule: EMISchedule[] = [
        { id: '1', dueDate: '2024-02-15', amount: '$5,000', status: 'Paid', paidDate: '2024-02-14' },
        { id: '2', dueDate: '2024-03-15', amount: '$5,000', status: 'Paid', paidDate: '2024-03-15' },
        { id: '3', dueDate: '2024-04-15', amount: '$5,000', status: 'Paid', paidDate: '2024-04-10' },
        { id: '4', dueDate: '2024-12-15', amount: '$5,000', status: 'Upcoming' },
        { id: '5', dueDate: '2025-01-15', amount: '$5,000', status: 'Upcoming' },
        { id: '6', dueDate: '2025-02-15', amount: '$5,000', status: 'Upcoming' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid':
                return <span className="flex items-center" style={{ gap: '0.25rem', color: 'hsl(var(--success))', fontWeight: 500 }}><CheckCircle size={16} /> Paid</span>;
            case 'Upcoming':
                return <span className="flex items-center" style={{ gap: '0.25rem', color: 'hsl(var(--warning))', fontWeight: 500 }}><Clock size={16} /> Upcoming</span>;
            case 'Overdue':
                return <span className="flex items-center" style={{ gap: '0.25rem', color: 'hsl(var(--danger))', fontWeight: 500 }}><AlertCircle size={16} /> Overdue</span>;
            default:
                return status;
        }
    };

    return (
        <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="flex items-center justify-between">
                <h2 style={{ fontSize: '1.5rem' }}>My Booking</h2>
                <span style={{
                    backgroundColor: 'hsl(var(--primary-light))',
                    color: 'hsl(var(--primary))',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600
                }}>
                    {bookingInfo.id}
                </span>
            </div>

            {/* Booking Summary Card */}
            <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                    <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Property</span>
                    <h3 style={{ fontSize: '1.125rem' }}>{bookingInfo.property}</h3>
                </div>
                <div>
                    <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Total Value</span>
                    <h3 style={{ fontSize: '1.125rem' }}>{bookingInfo.totalAmount}</h3>
                </div>
                <div>
                    <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Paid Amount</span>
                    <h3 style={{ fontSize: '1.125rem', color: 'hsl(var(--success))' }}>{bookingInfo.paidAmount}</h3>
                </div>
                <div>
                    <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Next Payment</span>
                    <h3 style={{ fontSize: '1.125rem', color: 'hsl(var(--warning))' }}>{bookingInfo.nextDue}</h3>
                </div>
            </div>

            {/* EMI Schedule */}
            <div className="card">
                <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '1rem' }}>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('schedule')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontWeight: activeTab === 'schedule' ? 600 : 400,
                                color: activeTab === 'schedule' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                                borderBottom: activeTab === 'schedule' ? '2px solid hsl(var(--primary))' : 'none',
                                paddingBottom: '0.25rem'
                            }}
                        >
                            EMI Schedule
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontWeight: activeTab === 'history' ? 600 : 400,
                                color: activeTab === 'history' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                                borderBottom: activeTab === 'history' ? '2px solid hsl(var(--primary))' : 'none',
                                paddingBottom: '0.25rem'
                            }}
                        >
                            Payment History
                        </button>
                    </div>
                    <button className="btn" style={{ gap: '0.5rem', fontSize: '0.875rem' }}>
                        <Download size={16} /> Download Statement
                    </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                            <th style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '0.875rem' }}>Due Date</th>
                            <th style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '0.875rem' }}>Amount</th>
                            <th style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '0.875rem' }}>Status</th>
                            <th style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '0.875rem' }}>Paid Date</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emiSchedule.map((emi) => (
                            <tr key={emi.id} style={{ borderBottom: '1px solid hsl(var(--background))' }}>
                                <td style={{ padding: '1rem' }}>{emi.dueDate}</td>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{emi.amount}</td>
                                <td style={{ padding: '1rem' }}>{getStatusBadge(emi.status)}</td>
                                <td style={{ padding: '1rem', color: 'hsl(var(--text-secondary))' }}>{emi.paidDate || '-'}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {emi.status !== 'Paid' && (
                                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Pay Now</button>
                                    )}
                                    {emi.status === 'Paid' && (
                                        <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', border: '1px solid hsl(var(--border))' }}>Receipt</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
