'use client';

import MemberRegistrationForm from '../components/MemberRegistrationForm';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl border border-gray-300 w-full max-w-md mx-4 p-6 sm:p-8 relative">
                <MemberRegistrationForm />
            </div>
        </div>
    );
}