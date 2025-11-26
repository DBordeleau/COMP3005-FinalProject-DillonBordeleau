'use client';

import { useEffect, useState } from 'react';
import BookTrainingSessionModal from './BookTrainingSessionModal';
import ClassRegistrationModal from './ClassRegistrationModal';
import { formatTime } from '@/app/lib/formatTime';

interface TrainingSession {
    session_id: number;
    session_date: string;
    start_time: string;
    end_time: string;
    trainer_name: string;
    room_id: number;
    trainer_id: number;
    room_name: string;
}

interface GroupClass {
    class_id: number;
    class_name: string;
    class_day: string;
    start_time: string;
    end_time: string;
    trainer_name: string;
}

interface UpcomingSessionsProps {
    memberId: number;
}

export default function UpcomingSessionsList({ memberId }: UpcomingSessionsProps) {
    const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
    const [groupClasses, setGroupClasses] = useState<GroupClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [editingSession, setEditingSession] = useState<any>(null);
    const [cancellingSessionId, setCancellingSessionId] = useState<number | null>(null);
    const [withdrawingClassId, setWithdrawingClassId] = useState<number | null>(null);

    useEffect(() => {
        fetchUpcomingSessions();
    }, [memberId]);

    const fetchUpcomingSessions = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) return;

            const response = await fetch('/api/member/upcoming-sessions', {
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

    const handleCancelSession = async (sessionId: number) => {
        if (!confirm('Are you sure you want to cancel this training session?')) return;

        setCancellingSessionId(sessionId);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/member/training-sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchUpcomingSessions();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to cancel session');
            }
        } catch (error) {
            console.error('Error cancelling session:', error);
            alert('Failed to cancel session');
        } finally {
            setCancellingSessionId(null);
        }
    };

    const handleWithdrawFromClass = async (classId: number) => {
        if (!confirm('Are you sure you want to withdraw from this class?')) return;

        setWithdrawingClassId(classId);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/member/group-classes/enroll/${classId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchUpcomingSessions();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to withdraw from class');
            }
        } catch (error) {
            console.error('Error withdrawing from class:', error);
            alert('Failed to withdraw from class');
        } finally {
            setWithdrawingClassId(null);
        }
    };

    const handleReschedule = (session: TrainingSession) => {
        const formattedDate = new Date(session.session_date).toISOString().split('T')[0];

        setEditingSession({
            sessionId: session.session_id,
            sessionDate: formattedDate,
            startTime: session.start_time,
            endTime: session.end_time,
            trainerId: session.trainer_id,
            roomId: session.room_id
        });
        setShowBookModal(true);
    };

    const handleModalSuccess = () => {
        setShowBookModal(false);
        setShowRegisterModal(false);
        setEditingSession(null);
        fetchUpcomingSessions();
    };

    return (
        <>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Upcoming Sessions & Classes</h2>
                    <div className="space-x-3">
                        <button
                            onClick={() => {
                                setEditingSession(null);
                                setShowBookModal(true);
                            }}
                            className="inline-flex items-center cursor-pointer px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Book Training Session
                        </button>
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="inline-flex items-center cursor-pointer px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            Register for Group Class
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Training Sessions */}
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
                                                    <p className="text-sm text-gray-500">Trainer: {session.trainer_name}</p>
                                                    <p className="text-sm text-gray-500">Room: {session.room_name}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleReschedule(session)}
                                                        className="px-3 py-1 cursor-pointer text-sm border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelSession(session.session_id)}
                                                        disabled={cancellingSessionId === session.session_id}
                                                        className="px-3 py-1 cursor-pointer text-sm border border-red-600 text-red-600 rounded-md hover:bg-red-50 disabled:bg-gray-100"
                                                    >
                                                        {cancellingSessionId === session.session_id ? 'Cancelling...' : 'Cancel'}
                                                    </button>
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
                                <p className="text-gray-500 text-sm">No group classes enrolled</p>
                            ) : (
                                <div className="space-y-2">
                                    {groupClasses.map((classItem) => (
                                        <div key={classItem.class_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">{classItem.class_name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {classItem.class_day} • {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Trainer: {classItem.trainer_name}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleWithdrawFromClass(classItem.class_id)}
                                                    disabled={withdrawingClassId === classItem.class_id}
                                                    className="px-3 py-1 cursor-pointer text-sm border border-red-600 text-red-600 rounded-md hover:bg-red-50 disabled:bg-gray-100"
                                                >
                                                    {withdrawingClassId === classItem.class_id ? 'Withdrawing...' : 'Withdraw'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showBookModal && (
                <BookTrainingSessionModal
                    onClose={() => {
                        setShowBookModal(false);
                        setEditingSession(null);
                    }}
                    onSuccess={handleModalSuccess}
                    existingSession={editingSession}
                />
            )}

            {showRegisterModal && (
                <ClassRegistrationModal
                    onClose={() => setShowRegisterModal(false)}
                    onSuccess={handleModalSuccess}
                />
            )}
        </>
    );
}