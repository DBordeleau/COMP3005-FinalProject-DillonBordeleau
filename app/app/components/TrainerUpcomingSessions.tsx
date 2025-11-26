'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatTime } from '@/app/lib/formatTime';

interface TrainingSession {
    session_id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    member_name: string;
    member_id: number;
    room_name: string;
}

interface GroupClass {
    class_id: number;
    class_name: string;
    class_day: string;
    start_time: string;
    end_time: string;
    room_name: string;
}

interface TrainerUpcomingSessionsProps {
    trainerId: number;
    onMemberClick?: (memberName: string) => void;
}

export default function TrainerUpcomingSessions({ trainerId, onMemberClick }: TrainerUpcomingSessionsProps) {
    const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
    const [groupClasses, setGroupClasses] = useState<GroupClass[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchUpcomingSessions();
    }, [trainerId]);

    const fetchUpcomingSessions = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) return;

            const response = await fetch('/api/trainer/sessions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTrainingSessions(data.trainingSessions || []);
                setGroupClasses(data.groupClasses || []);
            }
        } catch (error) {
            console.error('Error fetching upcoming sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassClick = (classId: number) => {
        router.push(`/class/${classId}`);
    };

    const handleMemberClick = (memberName: string) => {
        if (onMemberClick) {
            onMemberClick(memberName);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Schedule</h2>

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                <div className="space-y-6">
                    {/* Personal Training Sessions */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Training Sessions</h3>
                        {trainingSessions.length === 0 ? (
                            <p className="text-gray-500 text-sm">No upcoming training sessions</p>
                        ) : (
                            <div className="space-y-2">
                                {trainingSessions.map((session) => (
                                    <div key={session.session_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {new Date(session.session_date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Client:{' '}
                                                    <button
                                                        onClick={() => handleMemberClick(session.member_name)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                    >
                                                        {session.member_name}
                                                    </button>
                                                </p>
                                                <p className="text-sm text-gray-500">Room: {session.room_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Group Classes */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Group Classes</h3>
                        {groupClasses.length === 0 ? (
                            <p className="text-gray-500 text-sm">No group classes assigned</p>
                        ) : (
                            <div className="space-y-2">
                                {groupClasses.map((classItem) => (
                                    <div
                                        key={classItem.class_id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleClassClick(classItem.class_id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                                                    {classItem.class_name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {classItem.class_day} • {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                                                </p>
                                                <p className="text-sm text-gray-500">Room: {classItem.room_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}