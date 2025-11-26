'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// User type depends on the login page
// /login = member
// /login/trainer = trainer
// /login/admin = admin
interface LoginFormProps {
    userType: 'member' | 'trainer' | 'admin';
    title: string;
    registerLink?: string;
}

export default function LoginForm({ userType, title, registerLink }: LoginFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        let errors: { [key: string]: string } = {};

        if (!formData.email) {
            errors.email = 'Email is required';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setLoading(true);

        try {
            const endpoint = `/api/${userType}/login`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store JWT token in localStorage
            localStorage.setItem('token', data.token);

            // Redirect based on user type
            if (userType === 'member') {
                router.push('/member/dashboard');
            } else if (userType === 'trainer') {
                router.push('/trainer/dashboard');
            } else if (userType === 'admin') {
                router.push('/admin/dashboard');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    };

    const inputClass = (field: string) =>
        `appearance-none rounded-none relative block w-full px-3 py-2 border ${fieldErrors[field]
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
        } placeholder-gray-500 text-gray-900 focus:outline-none focus:z-10 sm:text-sm`;

    return (
        <div className="w-full space-y-8">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {title}
                </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-800">{error}</div>
                    </div>
                )}

                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className={`${inputClass('email')} rounded-t-md`}
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {fieldErrors.email && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                        )}
                    </div>

                    <div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className={`${inputClass('password')} rounded-b-md`}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {fieldErrors.password && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
                        )}
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>

                {registerLink && (
                    <div className="mt-6 text-center">
                        <span className="text-gray-600 text-sm">
                            Don't have an account?{' '}
                            <Link href={registerLink} className="text-indigo-600 hover:underline font-medium">
                                Register here.
                            </Link>
                        </span>
                    </div>
                )}
            </form>
        </div>
    );
}