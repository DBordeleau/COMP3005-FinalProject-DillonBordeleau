'use client';

import { useState, useEffect, FormEvent } from 'react';

interface BookTrainingSessionModalProps {
    onClose: () => void;
    onSuccess: () => void;
    existingSession?: {
        sessionId: number;
        sessionDate: string;
        startTime: string;
        endTime: string;
        trainerId: number;
        roomId: number;
    };
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

export default function BookTrainingSessionModal({ onClose, onSuccess, existingSession }: BookTrainingSessionModalProps) {
    const [formData, setFormData] = useState({
        sessionDate: existingSession?.sessionDate || '',
        startTime: existingSession?.startTime || '09:00',
        endTime: existingSession?.endTime || '10:00',
        trainerId: existingSession?.trainerId?.toString() || '',
        roomId: existingSession?.roomId?.toString() || ''
    });
    const [availableTrainers, setAvailableTrainers] = useState<Trainer[]>([]);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (formData.sessionDate && formData.startTime && formData.endTime) {
            fetchAvailableTrainers();
        }
    }, [formData.sessionDate, formData.startTime, formData.endTime]);

    useEffect(() => {
        if (formData.sessionDate && formData.startTime && formData.endTime && formData.trainerId) {
            fetchAvailableRooms();
        }
    }, [formData.sessionDate, formData.startTime, formData.endTime, formData.trainerId]);

    const fetchAvailableTrainers = async () => {
        try {
            const token = localStorage.getItem('token');
            const date = new Date(formData.sessionDate);
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

            const response = await fetch(
                `/api/admin/trainers/available?day=${dayOfWeek}&date=${formData.sessionDate}&startTime=${formData.startTime}&endTime=${formData.endTime}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.ok) {
                const data = await response.json();
                setAvailableTrainers(data.trainers || []);
            }
        } catch (error) {
            console.error('Error fetching available trainers:', error);
        }
    };

    const fetchAvailableRooms = async () => {
        try {
            const token = localStorage.getItem('token');
            const excludeParam = existingSession ? `&excludeSessionId=${existingSession.sessionId}` : '';

            const response = await fetch(
                `/api/member/rooms/available?date=${formData.sessionDate}&startTime=${formData.startTime}&endTime=${formData.endTime}${excludeParam}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.ok) {
                const data = await response.json();
                setAvailableRooms(data.rooms || []);
            }
        } catch (error) {
            console.error('Error fetching available rooms:', error);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.sessionDate || !formData.startTime || !formData.endTime || !formData.trainerId || !formData.roomId) {
            setError('All fields are required');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            setError('End time must be after start time');
            return;
        }

        const sessionDate = new Date(formData.sessionDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (sessionDate < today) {
            setError('Cannot book sessions in the past');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const url = '/api/member/training-sessions';
            const method = existingSession ? 'PUT' : 'POST';

            const body = existingSession
                ? { sessionId: existingSession.sessionId, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${existingSession ? 'reschedule' : 'book'} session`);
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
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {existingSession ? 'Reschedule Training Session' : 'Book Training Session'}
                    </h2>
                    <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
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
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            value={formData.sessionDate}
                            onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value, trainerId: '', roomId: '' })}
                            min={new Date().toISOString().split('T')[0]}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Time</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value, trainerId: '', roomId: '' })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Time</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value, trainerId: '', roomId: '' })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Trainer
                            {availableTrainers.length === 0 && formData.sessionDate && (
                                <span className="text-xs text-red-600 ml-2">
                                    (No trainers available at this time)
                                </span>
                            )}
                        </label>
                        <select
                            value={formData.trainerId}
                            onChange={(e) => setFormData({ ...formData, trainerId: e.target.value, roomId: '' })}
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
                        <label className="block text-sm font-medium text-gray-700">
                            Room
                            {availableRooms.length === 0 && formData.trainerId && (
                                <span className="text-xs text-red-600 ml-2">
                                    (No rooms available at this time)
                                </span>
                            )}
                        </label>
                        <select
                            value={formData.roomId}
                            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                            disabled={!formData.trainerId}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                        >
                            <option value="">Select a room</option>
                            {availableRooms.map(room => (
                                <option key={room.roomId} value={room.roomId}>
                                    {room.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 cursor-pointer border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.trainerId || !formData.roomId}
                            className="px-4 py-2 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                            {loading ? 'Processing...' : (existingSession ? 'Reschedule' : 'Book Session')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}