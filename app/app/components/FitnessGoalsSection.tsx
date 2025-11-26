'use client';

import { useEffect, useState } from 'react';
import CreateGoalModal from './CreateGoalModal';

interface FitnessGoal {
    goal_id: number;
    name: string;
    target_value: string;
    target_date: string;
    status: string;
}

interface FitnessGoalsSectionProps {
    memberId: number;
}

export default function FitnessGoalsSection({ memberId }: FitnessGoalsSectionProps) {
    const [goals, setGoals] = useState<FitnessGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);

    useEffect(() => {
        fetchGoals();
    }, [memberId]);

    const fetchGoals = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) return;

            const response = await fetch('/api/member/fitness-goals', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGoals(data.goals || []);
            }
        } catch (error) {
            console.error('Error fetching fitness goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (goalId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/member/fitness-goals/${goalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                await fetchGoals();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update goal status');
            }
        } catch (error) {
            console.error('Error updating goal status:', error);
            alert('Failed to update goal status');
        }
    };

    const handleDeleteGoal = async (goalId: number) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        setDeletingGoalId(goalId);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/member/fitness-goals/${goalId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchGoals();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete goal');
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
            alert('Failed to delete goal');
        } finally {
            setDeletingGoalId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Achieved':
                return 'bg-green-100 text-green-800';
            case 'Failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Fitness Goals</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center cursor-pointer px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Create New Goal
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : goals.length === 0 ? (
                    <p className="text-gray-500 text-sm">No fitness goals yet. Start by creating your first goal!</p>
                ) : (
                    <div className="space-y-3">
                        {goals.map((goal) => (
                            <div key={goal.goal_id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{goal.name}</p>
                                        <p className="text-sm text-gray-600 mt-1">Target: {goal.target_value}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Due: {new Date(goal.target_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(goal.status)}`}>
                                            {goal.status}
                                        </span>
                                    </div>
                                </div>
                                {goal.status === 'In Progress' && (
                                    <div className="mt-3 flex space-x-2">
                                        <button
                                            onClick={() => handleUpdateStatus(goal.goal_id, 'Achieved')}
                                            className="px-3 py-1 cursor-pointer text-xs border border-green-600 text-green-600 rounded-md hover:bg-green-50"
                                        >
                                            Mark Achieved
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(goal.goal_id, 'Failed')}
                                            className="px-3 py-1 cursor-pointer text-xs border border-orange-600 text-orange-600 rounded-md hover:bg-orange-50"
                                        >
                                            Mark Failed
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.goal_id)}
                                            disabled={deletingGoalId === goal.goal_id}
                                            className="px-3 py-1 cursor-pointer text-xs border border-red-600 text-red-600 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                                        >
                                            {deletingGoalId === goal.goal_id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                )}
                                {goal.status !== 'In Progress' && (
                                    <div className="mt-3">
                                        <button
                                            onClick={() => handleDeleteGoal(goal.goal_id)}
                                            disabled={deletingGoalId === goal.goal_id}
                                            className="px-3 py-1 cursor-pointer text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                                        >
                                            {deletingGoalId === goal.goal_id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateGoalModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchGoals();
                    }}
                />
            )}
        </>
    );
}