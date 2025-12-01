import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { HealthMetric } from '@/models/HealthMetric';

// Fetches health metrics for the logged in member
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const dataSource = await getDataSource();

        const metrics = await dataSource.query(
            `SELECT 
                metric_id,
                recorded_date,
                weight,
                body_fat_percentage,
                heart_rate,
                blood_pressure,
                notes
            FROM health_metrics
            WHERE member_id = $1
            ORDER BY recorded_date DESC`,
            [user.memberId]
        );

        return NextResponse.json({ metrics }, { status: 200 });

    } catch (error) {
        console.error('Error fetching health metrics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Logs a new health metric for the logged in member
export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { weight, bodyFatPercentage, heartRate, bloodPressure, notes } = body;

        // At least one metric must be provided, if they are all null return an error
        if (!weight && !bodyFatPercentage && !heartRate && !bloodPressure) {
            return NextResponse.json(
                { error: 'At least one health metric is required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const metricRepository = dataSource.getRepository(HealthMetric);

        const metric = metricRepository.create({
            memberId: user.memberId,
            weight: weight || null,
            bodyFatPercentage: bodyFatPercentage || null,
            heartRate: heartRate || null,
            bloodPressure: bloodPressure || null,
            notes: notes || null
        });

        await metricRepository.save(metric);

        return NextResponse.json(
            { message: 'Health metric logged successfully', metric },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error logging health metric:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Deletes a specific health metric for the logged in member
export async function DELETE(request: NextRequest) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const metricId = searchParams.get('metricId');

        if (!metricId) {
            return NextResponse.json(
                { error: 'Metric ID is required' },
                { status: 400 }
            );
        }

        const dataSource = await getDataSource();
        const metricRepository = dataSource.getRepository(HealthMetric);

        const metric = await metricRepository.findOne({
            where: {
                metricId: parseInt(metricId),
                memberId: user.memberId
            }
        });

        if (!metric) {
            return NextResponse.json(
                { error: 'Metric not found' },
                { status: 404 }
            );
        }

        await metricRepository.remove(metric);

        return NextResponse.json(
            { message: 'Metric deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting health metric:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}