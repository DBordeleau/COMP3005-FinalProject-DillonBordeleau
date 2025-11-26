'use client';

import { useEffect, useState } from 'react';

interface DaySchedule {
    schedule_id?: number;
    day: string;
    start_time: string;
    end_time: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityManager() {
    const [schedules, setSchedules] = useState<DaySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/trainer/availability', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSchedules(data.schedules || []);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSchedule = () => {
        setSchedules([...schedules, { day: 'Monday', start_time: '09:00', end_time: '17:00' }]);
    };

    const removeSchedule = (index: number) => {
        setSchedules(schedules.filter((_, i) => i !== index));
    };

    const updateSchedule = (index: number, field: keyof DaySchedule, value: string) => {
        const updated = [...schedules];
        updated[index] = { ...updated[index], [field]: value };
        setSchedules(updated);
    };

    const handleSave = async () => {
        setError('');
        setMessage('');
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/trainer/availability', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ schedules })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save availability');
            }

            setMessage('Availability updated successfully!');
            await fetchAvailability();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-4">Loading availability...</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Weekly Availability</h2>
            <p className="text-sm text-gray-600 mb-6">
                Set your weekly availability for personal training sessions and group classes.
            </p>

            {message && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-800">{message}</div>
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-800">{error}</div>
                </div>
            )}

            <div className="space-y-4">
                {schedules.map((schedule, index) => (
                    <div key={index} className="flex items-center space-x-4 border border-gray-200 rounded-lg p-4">
                        <select
                            value={schedule.day}
                            onChange={(e) => updateSchedule(index, 'day', e.target.value)}
                            className="border cursor-pointer border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {DAYS.map((day) => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>

                        <input
                            type="time"
                            value={schedule.start_time}
                            onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                            className="border cursor-pointer border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />

                        <span className="text-gray-500">to</span>

                        <input
                            type="time"
                            value={schedule.end_time}
                            onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
                            className="border cursor-pointer border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />

                        <button
                            onClick={() => removeSchedule(index)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))}

                <button
                    onClick={addSchedule}
                    className="w-full border-2 border-dashed cursor-pointer border-gray-300 rounded-lg p-4 text-gray-600 hover:border-indigo-500 hover:text-indigo-500"
                >
                    + Add Time Slot
                </button>
            </div>

            <div className="mt-6">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-2 px-4 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    {saving ? 'Saving...' : 'Save Availability'}
                </button>
            </div>
        </div>
    );
}