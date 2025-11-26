'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/app/lib/formatTime';

interface RegisterGroupClassModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface GroupClass {
    class_id: number;
    class_name: string;
    description: string;
    class_day: string;
    start_time: string;
    end_time: string;
    trainer_name: string;
    room_name: string;
    capacity: number;
    enrolled_count: number;
    is_enrolled: boolean;
}

export default function ClassRegistrationModal({ onClose, onSuccess }: RegisterGroupClassModalProps) {
    const [classes, setClasses] = useState<GroupClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingClassId, setProcessingClassId] = useState<number | null>(null);
    const [classErrors, setClassErrors] = useState<Record<number, string>>({});

    useEffect(() => {
        fetchAvailableClasses();
    }, []);

    const fetchAvailableClasses = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch('/api/member/group-classes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setClasses(data.classes || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (classId: number) => {
        setClassErrors(prev => ({ ...prev, [classId]: '' }));
        setProcessingClassId(classId);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch('/api/member/group-classes/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ classId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to register for class');
            }

            // Refresh the class list to show updated enrollment status
            await fetchAvailableClasses();
            onSuccess();
        } catch (err) {
            setClassErrors(prev => ({
                ...prev,
                [classId]: err instanceof Error ? err.message : 'An error occurred'
            }));
        } finally {
            setProcessingClassId(null);
        }
    };

    const handleUnenroll = async (classId: number) => {
        setClassErrors(prev => ({ ...prev, [classId]: '' }));
        setProcessingClassId(classId);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/member/group-classes/enroll/${classId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to unenroll from class');
            }

            await fetchAvailableClasses();
            onSuccess();
        } catch (err) {
            setClassErrors(prev => ({
                ...prev,
                [classId]: err instanceof Error ? err.message : 'An error occurred'
            }));
        } finally {
            setProcessingClassId(null);
        }
    };

    // Specifies the order classes should appear in the registration modal. 
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Available Group Classes</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading classes...</div>
                ) : classes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No classes available</div>
                ) : (
                    <div className="space-y-4">
                        {classes
                            .sort((a, b) => {
                                const dayCompare = dayOrder.indexOf(a.class_day) - dayOrder.indexOf(b.class_day);
                                if (dayCompare !== 0) return dayCompare;
                                return a.start_time.localeCompare(b.start_time);
                            })
                            .map((classItem) => {
                                const isFull = classItem.enrolled_count >= classItem.capacity;
                                const isEnrolled = classItem.is_enrolled;

                                return (
                                    <div
                                        key={classItem.class_id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {classItem.class_name}
                                                    </h3>
                                                    {isEnrolled && (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                            Enrolled
                                                        </span>
                                                    )}
                                                    {isFull && !isEnrolled && (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                            Full
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{classItem.description}</p>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Schedule:</span> {classItem.class_day} • {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Trainer:</span> {classItem.trainer_name}
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Location:</span> {classItem.room_name}
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Capacity:</span> {classItem.enrolled_count}/{classItem.capacity}
                                                    </p>
                                                </div>
                                                {classErrors[classItem.class_id] && (
                                                    <div className="mt-3 rounded-md bg-red-50 p-3">
                                                        <p className="text-sm text-red-800">{classErrors[classItem.class_id]}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                {isEnrolled ? (
                                                    <button
                                                        onClick={() => handleUnenroll(classItem.class_id)}
                                                        disabled={processingClassId === classItem.class_id}
                                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                                                    >
                                                        {processingClassId === classItem.class_id ? 'Processing...' : 'Withdraw'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRegister(classItem.class_id)}
                                                        disabled={processingClassId === classItem.class_id}
                                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                                                    >
                                                        {processingClassId === classItem.class_id ? 'Processing...' : 'Register'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}