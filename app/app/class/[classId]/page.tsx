'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IoMdArrowRoundBack } from "react-icons/io";

interface ClassDetails {
    class_id: number;
    class_name: string;
    description: string;
    class_day: string;
    start_time: string;
    end_time: string;
    capacity: number;
    trainer_name: string;
    room_name: string;
    enrolled_count: number;
}

interface EnrolledMember {
    member_id: number;
    first_name: string;
    last_name: string;
    email: string;
    enrollment_date: string;
}

export default function ClassDetailPage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.classId as string;

    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
    const [enrolledMembers, setEnrolledMembers] = useState<EnrolledMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchClassDetails();
    }, [classId]);

    const fetchClassDetails = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`/api/class/${classId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch class details');
            }

            const data = await response.json();
            setClassDetails(data.class);
            setEnrolledMembers(data.enrolledMembers || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${hour12}:${minutes} ${period}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (error || !classDetails) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Class not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 cursor-pointer text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        <IoMdArrowRoundBack className="h-5 w-5 mr-1" />
                        Back
                    </button>

                    {/* Class Information */}
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{classDetails.class_name}</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Schedule</h3>
                                <p className="text-lg text-gray-900">
                                    {classDetails.class_day} • {formatTime(classDetails.start_time)} - {formatTime(classDetails.end_time)}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Capacity</h3>
                                <p className="text-lg text-gray-900">
                                    {classDetails.enrolled_count} / {classDetails.capacity} enrolled
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full"
                                        style={{ width: `${(classDetails.enrolled_count / classDetails.capacity) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Trainer</h3>
                                <p className="text-lg text-gray-900">{classDetails.trainer_name}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                                <p className="text-lg text-gray-900">{classDetails.room_name}</p>
                            </div>
                        </div>

                        {classDetails.description && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                                <p className="text-gray-900">{classDetails.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Enrolled Members */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Enrolled Members ({enrolledMembers.length})
                        </h2>

                        {enrolledMembers.length === 0 ? (
                            <p className="text-gray-500">No members enrolled yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Enrolled On
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {enrolledMembers.map((member) => (
                                            <tr key={member.member_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {member.first_name} {member.last_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{member.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(member.enrollment_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}