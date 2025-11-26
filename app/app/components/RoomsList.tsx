'use client';

import { useEffect, useState } from 'react';
import CreateRoomModal from './CreateRoomModal';

interface Room {
    roomId: number;
    name: string;
    roomType: string;
}

interface RoomsListProps {
    refreshTrigger: number;
    onRefresh: () => void;
}

export default function RoomsList({ refreshTrigger, onRefresh }: RoomsListProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    useEffect(() => {
        fetchRooms();
    }, [refreshTrigger]);

    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch('/api/admin/rooms', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const mappedRooms = (data.rooms || []).map((r: any) => ({
                    roomId: r.room_id,
                    name: r.name,
                    roomType: r.room_type
                }));
                setRooms(mappedRooms);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (roomId: number) => {
        if (!confirm('Are you sure you want to delete this room?')) return;

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/admin/rooms/${roomId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                onRefresh();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete room');
            }
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Error deleting room');
        }
    };

    const formatRoomType = (roomType: string) => {
        if (!roomType || roomType === 'unknown') return 'Unknown';
        return roomType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rooms</h2>

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : rooms.length === 0 ? (
                <p className="text-gray-500 text-md">No rooms created yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                        <div key={room.roomId} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900">{room.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{formatRoomType(room.roomType)}</p>
                            <div className="mt-3 flex space-x-2">
                                <button
                                    onClick={() => setEditingRoom(room)}
                                    className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(room.roomId)}
                                    className="cursor-pointer text-sm text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingRoom && (
                <CreateRoomModal
                    room={editingRoom}
                    onClose={() => setEditingRoom(null)}
                    onSuccess={() => {
                        setEditingRoom(null);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}