'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
    firstName: string;
    lastName: string;
    userType: 'member' | 'trainer' | 'admin';
}

export default function DashboardHeader({ firstName, lastName, userType }: DashboardHeaderProps) {
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        // Clear token and redirect to appropriate login page
        localStorage.removeItem('token');

        if (userType === 'admin') {
            router.push('/login/admin');
        } else if (userType === 'trainer') {
            router.push('/login/trainer');
        } else {
            router.push('/login');
        }
    };

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {userType === 'admin' ? 'Admin Panel' : 'Dashboard'}
                    </h1>

                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center cursor-pointer space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                        >
                            <span className="text-sm font-medium">
                                Welcome, {firstName}
                            </span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                {userType !== 'admin' && (
                                    <Link
                                        href={`/${userType}/profile`}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Edit Profile
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="block w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}