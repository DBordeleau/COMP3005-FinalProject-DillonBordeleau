'use client';

import { useState, useEffect } from 'react';
import LogHealthMetricModal from './LogHealthMetricModal';

interface HealthMetric {
    metric_id: number;
    recorded_date: string;
    weight: number | null;
    body_fat_percentage: number | null;
    heart_rate: number | null;
    blood_pressure: number | null;
    notes: string | null;
}

interface HealthMetricsSectionProps {
    memberId: number;
}

export default function HealthMetricsSection({ memberId }: HealthMetricsSectionProps) {
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLogModal, setShowLogModal] = useState(false);
    const [deletingMetricId, setDeletingMetricId] = useState<number | null>(null);

    useEffect(() => {
        fetchMetrics();
    }, [memberId]);

    const fetchMetrics = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) return;

            const response = await fetch('/api/member/health-metrics', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMetrics(data.metrics || []);
            }
        } catch (error) {
            console.error('Error fetching health metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMetric = async (metricId: number) => {
        if (!confirm('Are you sure you want to delete this health metric?')) return;

        setDeletingMetricId(metricId);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/member/health-metrics/${metricId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchMetrics();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete metric');
            }
        } catch (error) {
            console.error('Error deleting metric:', error);
            alert('Failed to delete metric');
        } finally {
            setDeletingMetricId(null);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const latestMetric = metrics.length > 0 ? metrics[0] : null;

    return (
        <>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Health Metrics</h2>
                    <button
                        onClick={() => setShowLogModal(true)}
                        className="inline-flex items-center cursor-pointer px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Log New Metric
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : metrics.length === 0 ? (
                    <p className="text-gray-500 text-sm">No health metrics recorded yet. Start tracking your progress!</p>
                ) : (
                    <div className="space-y-6">
                        {/* Latest Metrics Summary */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Latest Readings</h3>
                            {latestMetric && (
                                <p className="text-xs text-gray-500 mb-2">
                                    Recorded: {formatDateTime(latestMetric.recorded_date)}
                                </p>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                {latestMetric?.weight && (
                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Weight</p>
                                        <p className="text-lg font-bold text-gray-900">{latestMetric.weight} lbs</p>
                                    </div>
                                )}
                                {latestMetric?.body_fat_percentage && (
                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Body Fat</p>
                                        <p className="text-lg font-bold text-gray-900">{latestMetric.body_fat_percentage}%</p>
                                    </div>
                                )}
                                {latestMetric?.heart_rate && (
                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Heart Rate</p>
                                        <p className="text-lg font-bold text-gray-900">{latestMetric.heart_rate} bpm</p>
                                    </div>
                                )}
                                {latestMetric?.blood_pressure && (
                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Blood Pressure</p>
                                        <p className="text-lg font-bold text-gray-900">{latestMetric.blood_pressure} mmHg</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* History */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">History</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {metrics.map((metric) => (
                                    <div key={metric.metric_id} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-2">
                                                    {formatDateTime(metric.recorded_date)}
                                                </p>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    {metric.weight && (
                                                        <div>
                                                            <span className="text-gray-500">Weight:</span>{' '}
                                                            <span className="font-medium">{metric.weight} lbs</span>
                                                        </div>
                                                    )}
                                                    {metric.body_fat_percentage && (
                                                        <div>
                                                            <span className="text-gray-500">Body Fat:</span>{' '}
                                                            <span className="font-medium">{metric.body_fat_percentage}%</span>
                                                        </div>
                                                    )}
                                                    {metric.heart_rate && (
                                                        <div>
                                                            <span className="text-gray-500">Heart Rate:</span>{' '}
                                                            <span className="font-medium">{metric.heart_rate} bpm</span>
                                                        </div>
                                                    )}
                                                    {metric.blood_pressure && (
                                                        <div>
                                                            <span className="text-gray-500">BP:</span>{' '}
                                                            <span className="font-medium">{metric.blood_pressure} mmHg</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {metric.notes && (
                                                    <p className="text-xs text-gray-600 mt-2 italic">{metric.notes}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteMetric(metric.metric_id)}
                                                disabled={deletingMetricId === metric.metric_id}
                                                className="ml-2 text-xs text-red-600 hover:text-red-800 disabled:text-gray-400 cursor-pointer"
                                            >
                                                {deletingMetricId === metric.metric_id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showLogModal && (
                <LogHealthMetricModal
                    onClose={() => setShowLogModal(false)}
                    onSuccess={() => {
                        setShowLogModal(false);
                        fetchMetrics();
                    }}
                />
            )}
        </>
    );
}