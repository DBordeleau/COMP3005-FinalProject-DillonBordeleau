import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/data-source';
import { getUserFromRequest } from '@/app/lib/jwt';
import { HealthMetric } from '@/models/HealthMetric';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ metricId: string }> }
) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.userType !== 'member') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { metricId } = await params;
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