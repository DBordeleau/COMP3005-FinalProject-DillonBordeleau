'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/app/components/DashboardHeader';
import TrainerUpcomingSessions from '@/app/components/TrainerUpcomingSessions';
import MemberLookup from '@/app/components/MemberLookup';

interface TrainerDashboardData {
    trainer_id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export default function TrainerDashboard() {
    const router = useRouter();
    const [trainerData, setTrainerData] = useState<TrainerDashboardData | null>(null);
    const [memberSearchTrigger, setMemberSearchTrigger] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/trainer-login');
                return;
            }

            const response = await fetch('/api/trainer/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/trainer-login');
                    return;
                }
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setTrainerData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleMemberClick = (memberName: string) => {
        // Add timestamp to force re-trigger even if same name
        setMemberSearchTrigger(`${memberName}|${Date.now()}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error || !trainerData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">{error || 'Failed to load dashboard'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                firstName={trainerData.first_name}
                lastName={trainerData.last_name}
                userType="trainer"
            />

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="space-y-6">
                        {/* Upcoming Sessions */}
                        <TrainerUpcomingSessions trainerId={trainerData.trainer_id} onMemberClick={handleMemberClick} />

                        {/* Member Lookup */}
                        <MemberLookup externalSearchTrigger={memberSearchTrigger} />
                    </div>
                </div>
            </main>
        </div>
    );
}