import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    CheckSquare,
    FileText,
    Bell,
    User,
    LogOut,
    Menu,
    X,
    CreditCard
} from 'lucide-react';



export function DashboardLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const sidebarLinks = [
        { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/properties', icon: <Building2 size={20} />, label: 'Properties' },
        { to: '/bookings', icon: <CheckSquare size={20} />, label: 'My Bookings' },
        { to: '/payments', icon: <CreditCard size={20} />, label: 'Payments' },
        { to: '/documents', icon: <FileText size={20} />, label: 'Documents' },
        { to: '/support', icon: <User size={20} />, label: 'Support' },
    ];

    const handleLogout = () => {
        // TODO: Implement actual logout logic
        alert('Logging out...');
    };

    return (
        <div className="flex" style={{ height: '100vh', overflow: 'hidden' }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: '260px',
                    backgroundColor: 'hsl(var(--surface))',
                    borderRight: '1px solid hsl(var(--border))',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 20,
                }}
                className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
            >
                <div className="p-4" style={{ borderBottom: '1px solid hsl(var(--border))', height: '64px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'hsl(var(--primary))' }}>RealEstate<span style={{ color: 'hsl(var(--text-main))' }}>Portal</span></span>
                </div>

                <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sidebarLinks.map((link) => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) =>
                                        isActive ? 'nav-link active' : 'nav-link'
                                    }
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-sm)',
                                        color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                                        backgroundColor: isActive ? 'hsl(var(--primary-light))' : 'transparent',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        transition: 'all 0.2s ease'
                                    })}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.icon}
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: 'transparent',
                            color: 'hsl(var(--danger))',
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <header
                    style={{
                        height: '64px',
                        backgroundColor: 'hsl(var(--surface))',
                        borderBottom: '1px solid hsl(var(--border))',
                        padding: '0 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <button
                        className="mobile-toggle"
                        onClick={toggleMobileMenu}
                        style={{ display: 'none', background: 'transparent', border: 'none' }} // Visible only on mobile via CSS
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Overview</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', background: 'hsl(var(--background))', cursor: 'pointer', position: 'relative' }}>
                            <Bell size={20} />
                            <span style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'hsl(var(--danger))'
                            }} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsl(var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                JD
                            </div>
                            <div style={{ display: 'none', flexDirection: 'column' }} className="user-info-desktop">
                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>John Doe</span>
                                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Customer</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: 'hsl(var(--background))' }}>
                    <Outlet />
                </main>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -260px;
            top: 0;
            bottom: 0;
            transition: left 0.3s ease;
          }
          .sidebar.mobile-open {
            left: 0;
          }
          .mobile-toggle {
            display: block !important;
          }
          .user-info-desktop {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
            .user-info-desktop {
                display: flex !important;
            }
        }
      `}</style>
        </div>
    );
}
