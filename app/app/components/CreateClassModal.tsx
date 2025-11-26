'use client';

import { useState, useEffect, FormEvent } from 'react';

interface CreateClassModalProps {
    onClose: () => void;
    onSuccess: () => void;
    groupClass?: any;
}

interface Trainer {
    trainerId: number;
    firstName: string;
    lastName: string;
}

interface Room {
    roomId: number;
    name: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CreateClassModal({ onClose, onSuccess, groupClass }: CreateClassModalProps) {
    const [formData, setFormData] = useState({
        className: groupClass?.className || '',
        description: groupClass?.description || '',
        classDay: groupClass?.classDay || 'Monday',
        startTime: groupClass?.startTime || '09:00',
        endTime: groupClass?.endTime || '10:00',
        capacity: groupClass?.capacity || 20,
        trainerId: groupClass?.trainerId ? String(groupClass.trainerId) : '',
        roomId: groupClass?.roomId ? String(groupClass.roomId) : ''
    });
    const [availableTrainers, setAvailableTrainers] = useState<Trainer[]>([]);
    const [allTrainers, setAllTrainers] = useState<Trainer[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRooms();
        fetchAllTrainers();
    }, []);

    useEffect(() => {
        if (formData.classDay && formData.startTime && formData.endTime) {
            if (groupClass) {
                // When editing, show all trainers
                setAvailableTrainers(allTrainers);
            } else {
                // When creating, fetch available trainers
                fetchAvailableTrainers();
            }
        }
    }, [formData.classDay, formData.startTime, formData.endTime, allTrainers, groupClass]);

    const fetchAllTrainers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/trainers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const trainers = (data.trainers || []).map((t: any) => ({
                    trainerId: t.trainer_id,
                    firstName: t.first_name,
                    lastName: t.last_name
                }));
                setAllTrainers(trainers);
                if (groupClass) {
                    setAvailableTrainers(trainers);
                }
            }
        } catch (error) {
            console.error('Error fetching all trainers:', error);
        }
    };

    const fetchAvailableTrainers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `/api/admin/trainers/available?day=${formData.classDay}&startTime=${formData.startTime}&endTime=${formData.endTime}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setAvailableTrainers(data.trainers || []);
            }
        } catch (error) {
            console.error('Error fetching available trainers:', error);
            setAvailableTrainers([]);
        }
    };

    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/rooms', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const rooms = (data.rooms || [])
                    .filter((r: any) => r.room_id !== undefined && r.room_id !== null)
                    .map((r: any) => ({
                        roomId: r.room_id,  // Changed from r.roomId to r.room_id
                        name: r.name
                    }));
                setRooms(rooms);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.className || !formData.classDay || !formData.startTime ||
            !formData.endTime || !formData.trainerId || !formData.roomId) {
            setError('All fields are required');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            setError('End time must be after start time');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Check room availability
            const roomResponse = await fetch(
                `/api/admin/rooms/check-availability?roomId=${formData.roomId}&day=${formData.classDay}&startTime=${formData.startTime}&endTime=${formData.endTime}${groupClass ? `&excludeClassId=${groupClass.classId}` : ''}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (!roomResponse.ok) {
                const data = await roomResponse.json();
                throw new Error(data.error || 'Room not available');
            }

            const url = groupClass ? `/api/admin/classes/${groupClass.classId}` : '/api/admin/classes';
            const method = groupClass ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to ${groupClass ? 'update' : 'create'} class`);
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {groupClass ? 'Edit Group Class' : 'Create Group Class'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-800">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Class Name</label>
                        <input
                            type="text"
                            value={formData.className}
                            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                            placeholder="e.g., Yoga, Spin, CrossFit"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Day</label>
                            <select
                                value={formData.classDay}
                                onChange={(e) => setFormData({ ...formData, classDay: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                {DAYS.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Capacity</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Time</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Time</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Trainer
                            {!groupClass && availableTrainers.length === 0 && formData.classDay && formData.startTime && formData.endTime && (
                                <span className="text-xs text-red-600 ml-2">
                                    (No trainers available at this time)
                                </span>
                            )}
                        </label>
                        <select
                            value={formData.trainerId}
                            onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select a trainer</option>
                            {availableTrainers.map(trainer => (
                                <option key={trainer.trainerId} value={trainer.trainerId}>
                                    {trainer.firstName} {trainer.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Room</label>
                        <select
                            value={formData.roomId}
                            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select a room</option>
                            {rooms
                                .filter(room => room.roomId !== undefined && room.roomId !== null)
                                .map(room => (
                                    <option key={room.roomId} value={room.roomId}>
                                        {room.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.trainerId}
                            className="cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
                        >
                            {loading ? (groupClass ? 'Updating...' : 'Creating...') : (groupClass ? 'Update Class' : 'Create Class')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}