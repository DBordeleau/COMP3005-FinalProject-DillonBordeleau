'use client';

import LoginForm from '@/app/components/LoginForm';
import Link from 'next/link';

export default function TrainerLoginPage() {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 sm:p-8 relative">
                <LoginForm
                    userType="trainer"
                    title="Trainer Login"
                />
                <div className="mt-2 text-center">
                    <span className="text-gray-600 text-sm">
                        <Link href="/login/" className="text-indigo-600 hover:underline font-medium">
                            Member login
                        </Link>
                        {' | '}
                    </span>
                    <span className="text-gray-600 text-sm">
                        <Link href="/login/admin" className="text-indigo-600 hover:underline font-medium">
                            Admin login
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
}