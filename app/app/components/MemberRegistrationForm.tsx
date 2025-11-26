'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const initialFormData = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: ''
};

export default function MemberRegistrationForm() {
    const router = useRouter();
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    const requiredFields = [
        'email',
        'password',
        'confirmPassword',
        'firstName',
        'lastName',
        'dateOfBirth',
        'gender'
    ];

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        let errors: { [key: string]: string } = {};

        // Check for empty required fields
        requiredFields.forEach(field => {
            if (!formData[field as keyof typeof formData]) {
                errors[field] = 'This field is required';
            }
        });

        // Password match check
        if (
            formData.password &&
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword
        ) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/member/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    dateOfBirth: formData.dateOfBirth,
                    gender: formData.gender
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Redirect to login on successful registration
            router.push('/login');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    };

    const inputClass = (field: string) =>
        `appearance-none rounded-none relative block w-full px-3 py-2 border ${fieldErrors[field]
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
        } placeholder-gray-500 text-gray-900 sm:text-sm`;

    return (
        <div className="w-full space-y-8">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Member Registration
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
                            required
                            className={inputClass('email')}
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
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            className={inputClass('firstName')}
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        {fieldErrors.firstName && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>
                        )}
                    </div>

                    <div>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            className={inputClass('lastName')}
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                        {fieldErrors.lastName && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="dateOfBirth" className="block text-sm text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            required
                            className={inputClass('dateOfBirth')}
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                        />
                        {fieldErrors.dateOfBirth && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.dateOfBirth}</p>
                        )}
                    </div>

                    <div>
                        <select
                            id="gender"
                            name="gender"
                            required
                            className={inputClass('gender')}
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        {fieldErrors.gender && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.gender}</p>
                        )}
                    </div>

                    <div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className={inputClass('password')}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {fieldErrors.password && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
                        )}
                    </div>

                    <div>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className={inputClass('confirmPassword')}
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {fieldErrors.confirmPassword && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                        )}
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </div>
                <div className="mt-6 text-center">
                    <span className="text-gray-600 text-sm">
                        Already registered?{' '}
                        <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                            Click here to login.
                        </Link>
                    </span>
                </div>
            </form>
        </div>
    );
}