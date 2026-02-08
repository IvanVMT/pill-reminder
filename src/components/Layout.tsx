import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

export const Layout: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Today' },
        { path: '/add', icon: PlusCircle, label: 'Add' },
        { path: '/history', icon: Calendar, label: 'History' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 pb-20 p-4 max-w-md mx-auto w-full">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 pb-safe">
                <div className="max-w-md mx-auto flex justify-between items-center">
                    {navItems.map(({ path, icon: Icon, label }) => (
                        <Link
                            key={path}
                            to={path}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors",
                                location.pathname === path
                                    ? "text-blue-600 font-medium"
                                    : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Icon size={24} />
                            <span className="text-xs">{label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
};
