import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const params = await context.params;
    const inquiryId = parseInt(params.id);

    // Validate status
    const validStatuses = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED', 'SPAM'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update inquiry status
    const updatedInquiry = await prisma.clientInquiry.update({
      where: { id: inquiryId },
      data: { status }
    });

    // Log activity
    await prisma.adminActivity.create({
      data: {
        adminId: (session.user as any).id,
        action: 'UPDATE',
        resource: 'inquiry',
        resourceId: inquiryId,
        description: `Updated inquiry #${inquiryId} status to ${status}`
      }
    });

    return NextResponse.json({ success: true, inquiry: updatedInquiry });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry status' },
      { status: 500 }
    );
  }
}
