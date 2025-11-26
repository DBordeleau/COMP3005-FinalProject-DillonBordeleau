'use client';

import { useState, FormEvent } from 'react';

interface LogHealthMetricModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function LogHealthMetricModal({ onClose, onSuccess }: LogHealthMetricModalProps) {
    const [formData, setFormData] = useState({
        weight: '',
        bodyFatPercentage: '',
        heartRate: '',
        bloodPressure: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // At least one metric must be provided
        if (!formData.weight && !formData.bodyFatPercentage && !formData.heartRate && !formData.bloodPressure) {
            setError('Please provide at least one health metric');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Only send non-empty values
            const payload: any = {};
            if (formData.weight) payload.weight = parseFloat(formData.weight);
            if (formData.bodyFatPercentage) payload.bodyFatPercentage = parseFloat(formData.bodyFatPercentage);
            if (formData.heartRate) payload.heartRate = parseFloat(formData.heartRate);
            if (formData.bloodPressure) payload.bloodPressure = parseFloat(formData.bloodPressure);
            if (formData.notes) payload.notes = formData.notes;

            const response = await fetch('/api/member/health-metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to log health metric');
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
                    <h2 className="text-2xl font-bold text-gray-900">Log Health Metrics</h2>
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
                        <label className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            placeholder="e.g., 150"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Body Fat Percentage (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={formData.bodyFatPercentage}
                            onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
                            placeholder="e.g., 18.5"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resting Heart Rate (bpm)</label>
                        <input
                            type="number"
                            step="1"
                            min="0"
                            value={formData.heartRate}
                            onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                            placeholder="e.g., 72"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Pressure (systolic)</label>
                        <input
                            type="number"
                            step="1"
                            min="0"
                            value={formData.bloodPressure}
                            onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                            placeholder="e.g., 120"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Any additional notes..."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                            {loading ? 'Logging...' : 'Log Metrics'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}