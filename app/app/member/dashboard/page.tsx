'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/app/components/DashboardHeader';
import UpcomingSessions from '@/app/components/UpcomingSessionsList';
import FitnessGoalsSection from '@/app/components/FitnessGoalsSection';
import HealthMetricsSection from '@/app/components/HealthMetricSection';
import { GiStairsGoal } from "react-icons/gi";
import { SiGoogleclassroom } from "react-icons/si";
import { CiCalendar } from "react-icons/ci";

interface MemberDashboardData {
    member_id: number;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    latest_weight: number | null;
    latest_body_fat: number | null;
    latest_heart_rate: number | null;
    latest_metric_date: string | null;
    active_goals_count: number;
    total_classes_enrolled: number;
    upcoming_sessions_count: number;
}

export default function MemberDashboard() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<MemberDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/member/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/login');
                    return;
                }
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">{error || 'Failed to load dashboard'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                firstName={dashboardData.first_name}
                lastName={dashboardData.last_name}
                userType="member"
            />

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Dashboard Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <GiStairsGoal className="h-12 w-12 text-black" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-md text-center font-bold text-gray-800 truncate">Active Goals</dt>
                                            <dd className="text-3xl text-center font-semibold text-gray-900">{dashboardData.active_goals_count}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <SiGoogleclassroom className="h-12 w-12 text-black" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-md text-center font-bold text-gray-800 truncate">Total Classes</dt>
                                            <dd className="text-3xl text-center font-semibold text-gray-900">{dashboardData.total_classes_enrolled}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="shrink-0">
                                        <CiCalendar className="h-12 w-12 text-black" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-md text-center font-bold text-gray-800 truncate">Upcoming Sessions</dt>
                                            <dd className="text-3xl text-center font-semibold text-gray-900">{dashboardData.upcoming_sessions_count}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Sessions and Classes */}
                    <UpcomingSessions memberId={dashboardData.member_id} />

                    {/* Fitness Goals and Health Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        <FitnessGoalsSection memberId={dashboardData.member_id} />
                        <HealthMetricsSection memberId={dashboardData.member_id} />
                    </div>
                </div>
            </main>
        </div>
    );
}