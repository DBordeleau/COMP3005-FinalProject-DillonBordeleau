'use client';

import { useEffect, useState } from 'react';
import CreateClassModal from './CreateClassModal';
import { formatTime } from '@/app/lib/formatTime';

interface GroupClass {
    class_id: number;
    class_name: string;
    class_day: string;
    start_time: string;
    end_time: string;
    capacity: number;
    description: string;
    trainer_name: string;
    trainer_id: number;
    room_name: string;
    room_id: number;
}

interface ClassListProps {
    refreshTrigger: number;
    onRefresh: () => void;
}

export default function ClassList({ refreshTrigger, onRefresh }: ClassListProps) {
    const [classes, setClasses] = useState<GroupClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState<any>(null);

    useEffect(() => {
        fetchClasses();
    }, [refreshTrigger]);

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/classes', {
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

    const handleEdit = (classItem: GroupClass) => {
        // Transform the class data to match CreateClassModal's expected format
        setEditingClass({
            classId: classItem.class_id,
            className: classItem.class_name,
            description: classItem.description,
            classDay: classItem.class_day,
            startTime: classItem.start_time,
            endTime: classItem.end_time,
            capacity: classItem.capacity,
            trainerId: classItem.trainer_id,
            roomId: classItem.room_id
        });
        setShowModal(true);
    };

    const handleDelete = async (classId: number) => {
        if (!confirm('Are you sure you want to delete this class?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/classes/${classId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to delete class');
            }

            await fetchClasses();
            onRefresh();
        } catch (error) {
            console.error('Error deleting class:', error);
            alert('Error deleting class');
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingClass(null);
    };

    const handleModalSuccess = () => {
        setShowModal(false);
        setEditingClass(null);
        fetchClasses();
        onRefresh();
    };

    if (loading) {
        return <div className="text-center py-4">Loading classes...</div>;
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Group Classes</h2>
            </div>

            {classes.length === 0 ? (
                <p className="text-gray-500">No classes created yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {classes.map((classItem) => (
                                <tr key={classItem.class_id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => window.location.href = `/class/${classItem.class_id}`}
                                            className="text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                                        >
                                            {classItem.class_name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{classItem.class_day}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{classItem.trainer_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{classItem.room_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{classItem.capacity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleEdit(classItem)}
                                            className="cursor-pointer text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(classItem.class_id)}
                                            className="cursor-pointer text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Use CreateClassModal for editing */}
            {showModal && (
                <CreateClassModal
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                    groupClass={editingClass}
                />
            )}
        </div>
    );
}