// Admin dashboard where admins can create trainer accounts, rooms and classes

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/app/components/DashboardHeader';
import CreateTrainerModal from '@/app/components/CreateTrainerModal';
import CreateRoomModal from '@/app/components/CreateRoomModal';
import CreateClassModal from '@/app/components/CreateClassModal';
import RoomsList from '@/app/components/RoomsList';
import ClassList from '@/app/components/ClassList';
import { FaPlus } from "react-icons/fa";

interface AdminDashboardData {
    admin_id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateTrainer, setShowCreateTrainer] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showCreateClass, setShowCreateClass] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/login/admin');
                return;
            }

            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/login/admin');
                    return;
                }
                throw new Error('Failed to fetch admin data');
            }

            const data = await response.json();
            setAdminData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error || !adminData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">{error || 'Failed to load dashboard'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                firstName={adminData.first_name}
                lastName={adminData.last_name}
                userType="admin"
            />

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Action Buttons */}
                    <div className="mb-8 flex flex-wrap gap-4">
                        <button
                            onClick={() => setShowCreateTrainer(true)}
                            className="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <FaPlus className="h-5 w-5 mr-2" />
                            Create Trainer Account
                        </button>

                        <button
                            onClick={() => setShowCreateRoom(true)}
                            className="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            <FaPlus className="h-5 w-5 mr-2" />
                            Create Room
                        </button>

                        <button
                            onClick={() => setShowCreateClass(true)}
                            className="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                            <FaPlus className="h-5 w-5 mr-2" />
                            Create Group Class
                        </button>
                    </div>

                    {/* Rooms List */}
                    <div className="mb-8">
                        <RoomsList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
                    </div>

                    {/* Class List */}
                    <div>
                        <ClassList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showCreateTrainer && (
                <CreateTrainerModal
                    onClose={() => setShowCreateTrainer(false)}
                    onSuccess={() => {
                        setShowCreateTrainer(false);
                        handleRefresh();
                    }}
                />
            )}

            {showCreateRoom && (
                <CreateRoomModal
                    onClose={() => setShowCreateRoom(false)}
                    onSuccess={() => {
                        setShowCreateRoom(false);
                        handleRefresh();
                    }}
                />
            )}

            {showCreateClass && (
                <CreateClassModal
                    onClose={() => setShowCreateClass(false)}
                    onSuccess={() => {
                        setShowCreateClass(false);
                        handleRefresh();
                    }}
                />
            )}
        </div>
    );
}