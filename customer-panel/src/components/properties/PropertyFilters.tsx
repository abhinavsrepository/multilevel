import { Filter } from 'lucide-react';

interface FilterState {
    minPrice: number;
    maxPrice: number;
    location: string[];
    status: string[];
}

interface PropertyFiltersProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
}

export function PropertyFilters({ filters, onFilterChange }: PropertyFiltersProps) {
    const locations = ['Downtown', 'Suburbs', 'Lakeview', 'Hillside'];
    const statuses = ['Available', 'Reserved', 'Sold'];

    const handleChange = (key: keyof FilterState, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const handleCheckboxChange = (group: 'location' | 'status', value: string) => {
        const current = filters[group];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        handleChange(group, updated);
    };

    return (
        <div className="card" style={{ position: 'sticky', top: '1rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                <h3 className="flex items-center" style={{ gap: '0.5rem' }}><Filter size={20} /> Filters</h3>
                <button
                    className="btn"
                    style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', padding: 0 }}
                    onClick={() => onFilterChange({ minPrice: 0, maxPrice: 1000000, location: [], status: [] })}
                >
                    Reset
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Price Range */}
                <div>
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Price Range</h4>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => handleChange('minPrice', Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius-sm)'
                            }}
                        />
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius-sm)'
                            }}
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Location</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {locations.map(loc => (
                            <label key={loc} className="flex items-center" style={{ gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={filters.location.includes(loc)}
                                    onChange={() => handleCheckboxChange('location', loc)}
                                />
                                {loc}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Availability</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {statuses.map(status => (
                            <label key={status} className="flex items-center" style={{ gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={filters.status.includes(status)}
                                    onChange={() => handleCheckboxChange('status', status)}
                                />
                                {status}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
