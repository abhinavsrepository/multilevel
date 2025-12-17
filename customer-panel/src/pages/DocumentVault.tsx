import { FileText, Download, Filter, Search } from 'lucide-react';

interface Document {
    id: string;
    name: string;
    type: 'Agreement' | 'Receipt' | 'KYC' | 'Other';
    date: string;
    size: string;
    property: string;
}

export function DocumentVault() {
    const documents: Document[] = [
        { id: '1', name: 'Sale_Agreement_BK2024001.pdf', type: 'Agreement', date: '2024-01-15', size: '2.4 MB', property: 'Luxury Villa with Sea View' },
        { id: '2', name: 'Payment_Receipt_Feb24.pdf', type: 'Receipt', date: '2024-02-15', size: '150 KB', property: 'Luxury Villa with Sea View' },
        { id: '3', name: 'KYC_Documents_Signed.pdf', type: 'KYC', date: '2024-01-14', size: '3.1 MB', property: 'Global' },
        { id: '4', name: 'Payment_Receipt_Mar24.pdf', type: 'Receipt', date: '2024-03-15', size: '150 KB', property: 'Luxury Villa with Sea View' },
        { id: '5', name: 'Site_Plan_Approved.png', type: 'Other', date: '2024-01-10', size: '1.2 MB', property: 'Luxury Villa with Sea View' },
    ];

    return (
        <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="flex items-center justify-between">
                <h2 style={{ fontSize: '1.5rem' }}>Document Vault</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ border: '1px solid hsl(var(--border))', gap: '0.5rem' }}>
                        <Filter size={18} /> Filter
                    </button>
                    <button className="btn btn-primary" style={{ gap: '0.5rem' }}>
                        Upload Document
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} style={{ color: 'hsl(var(--text-secondary))' }} />
                <input
                    type="text"
                    placeholder="Search documents by name or type..."
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem' }}
                />
            </div>

            {/* Document Grid/List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border))' }}>
                            <th style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '0.875rem' }}>Document Name</th>
                            <th style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '0.875rem' }}>Type</th>
                            <th style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '0.875rem' }}>Linked Property</th>
                            <th style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '0.875rem' }}>Date Added</th>
                            <th style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '0.875rem' }}>Size</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '0.875rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map(doc => (
                            <tr key={doc.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                                    <FileText size={20} style={{ color: 'hsl(var(--primary))' }} />
                                    {doc.name}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.125rem 0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'hsl(var(--background))',
                                        fontSize: '0.75rem',
                                        border: '1px solid hsl(var(--border))'
                                    }}>
                                        {doc.type}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>{doc.property}</td>
                                <td style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>{doc.date}</td>
                                <td style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>{doc.size}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button className="btn" style={{ padding: '0.5rem', color: 'hsl(var(--text-secondary))' }} title="Download">
                                        <Download size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
