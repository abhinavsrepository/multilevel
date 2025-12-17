import { MapPin, Heart, ArrowLeftRight, BedDouble, Ruler } from 'lucide-react';

export interface Property {
    id: string;
    title: string;
    location: string;
    price: string;
    area: string;
    imageUrl: string;
    status: 'Available' | 'Reserved' | 'Sold';
    beds?: number;
}

interface PropertyCardProps {
    property: Property;
    onCompare: (id: string) => void;
    onFavorite: (id: string) => void;
}

export function PropertyCard({ property, onCompare, onFavorite }: PropertyCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'hsl(var(--success))';
            case 'Reserved': return 'hsl(var(--warning))';
            case 'Sold': return 'hsl(var(--danger))';
            default: return 'hsl(var(--text-secondary))';
        }
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '200px', backgroundColor: '#e2e8f0' }}>
                <img
                    src={property.imageUrl}
                    alt={property.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Property+Image';
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: getStatusColor(property.status),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {property.status}
                </div>
                <button
                    onClick={() => onFavorite(property.id)}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <Heart size={18} className="text-danger" />
                </button>
            </div>

            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>{property.price}</span>
                </div>

                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', lineHeight: 1.4 }}>{property.title}</h3>

                <div className="flex items-center gap-4" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    <span className="flex items-center" style={{ gap: '0.25rem' }}><MapPin size={16} /> {property.location}</span>
                </div>

                <div className="flex items-center justify-between" style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid hsl(var(--border))',
                    marginTop: 'auto',
                    color: 'hsl(var(--text-secondary))',
                    fontSize: '0.875rem'
                }}>
                    <div className="flex items-center gap-4">
                        {property.beds && <span className="flex items-center" style={{ gap: '0.25rem' }}><BedDouble size={16} /> {property.beds} Beds</span>}
                        <span className="flex items-center" style={{ gap: '0.25rem' }}><Ruler size={16} /> {property.area}</span>
                    </div>

                    <button
                        onClick={() => onCompare(property.id)}
                        className="btn"
                        style={{
                            padding: '0.25rem 0.5rem',
                            border: '1px solid hsl(var(--border))',
                            fontSize: '0.75rem',
                            gap: '0.25rem'
                        }}
                    >
                        <ArrowLeftRight size={14} /> Compare
                    </button>
                </div>
            </div>
        </div>
    );
}
