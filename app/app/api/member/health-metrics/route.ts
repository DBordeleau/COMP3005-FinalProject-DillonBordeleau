import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { HealthMetric } from '@/models/HealthMetric';

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
            ORDER BY recorded_date DESC
            LIMIT 20`,
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

        // At least one metric must be provided
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