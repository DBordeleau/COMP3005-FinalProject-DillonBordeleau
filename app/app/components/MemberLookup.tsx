'use client';

import { useState, useEffect, useRef } from 'react';

interface MemberData {
    member_id: number;
    first_name: string;
    last_name: string;
    email: string;
    latest_goal: {
        name: string;
        target_value: string;
        target_date: string;
        status: string;
    } | null;
    latest_metric: {
        weight: number;
        body_fat_percentage: number;
        heart_rate: number;
        blood_pressure: number;
        recorded_date: string;
    } | null;
}

interface MemberLookupProps {
    externalSearchTrigger?: string;
}

export default function MemberLookup({ externalSearchTrigger }: MemberLookupProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [memberData, setMemberData] = useState<MemberData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (externalSearchTrigger) {
            // Split timestamp if present
            const [name] = externalSearchTrigger.split('|');
            setSearchTerm(name);
            performSearch(name);
            // Scroll to this section with a slight delay
            setTimeout(() => {
                sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [externalSearchTrigger]);

    const performSearch = async (name: string) => {
        setError('');
        setLoading(true);
        setMemberData(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/trainer/member-lookup?name=${encodeURIComponent(name)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to find member');
            }

            setMemberData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchTerm.trim()) {
            setError('Please enter a member name');
            return;
        }

        await performSearch(searchTerm);
    };

    return (
        <div ref={sectionRef} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Member Lookup</h2>

            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex space-x-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by member name..."
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 cursor-pointer text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-800">{error}</div>
                </div>
            )}

            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Loading member data...</p>
                </div>
            )}

            {!loading && memberData && (
                <div className="space-y-6">
                    {/* Member Info */}
                    <div className="border-b pb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {memberData.first_name} {memberData.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{memberData.email}</p>
                    </div>

                    {/* Latest Fitness Goal */}
                    <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Latest Fitness Goal</h4>
                        {memberData.latest_goal ? (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-medium text-gray-900">{memberData.latest_goal.name}</p>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${memberData.latest_goal.status === 'In Progress'
                                        ? 'bg-blue-100 text-blue-800'
                                        : memberData.latest_goal.status === 'Achieved'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {memberData.latest_goal.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">Target: {memberData.latest_goal.target_value}</p>
                                <p className="text-sm text-gray-500">
                                    Due: {new Date(memberData.latest_goal.target_date).toLocaleDateString()}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No fitness goals recorded</p>
                        )}
                    </div>

                    {/* Latest Health Metric */}
                    <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-3">Latest Health Metrics</h4>
                        {memberData.latest_metric ? (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {memberData.latest_metric.weight && (
                                        <div>
                                            <p className="text-xs text-gray-500">Weight</p>
                                            <p className="text-lg font-semibold">{memberData.latest_metric.weight} kg</p>
                                        </div>
                                    )}
                                    {memberData.latest_metric.body_fat_percentage && (
                                        <div>
                                            <p className="text-xs text-gray-500">Body Fat %</p>
                                            <p className="text-lg font-semibold">{memberData.latest_metric.body_fat_percentage}%</p>
                                        </div>
                                    )}
                                    {memberData.latest_metric.heart_rate && (
                                        <div>
                                            <p className="text-xs text-gray-500">Heart Rate</p>
                                            <p className="text-lg font-semibold">{memberData.latest_metric.heart_rate} bpm</p>
                                        </div>
                                    )}
                                    {memberData.latest_metric.blood_pressure && (
                                        <div>
                                            <p className="text-xs text-gray-500">Blood Pressure</p>
                                            <p className="text-lg font-semibold">{memberData.latest_metric.blood_pressure}</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    Recorded: {new Date(memberData.latest_metric.recorded_date).toLocaleDateString()}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No health metrics recorded</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}