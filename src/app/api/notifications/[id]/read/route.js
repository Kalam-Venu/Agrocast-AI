import { NextResponse } from 'next/server';
import { notificationService } from '@/services/notifications/notificationService';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const result = await notificationService.markAsRead(id);
    return NextResponse.json({ success: true, notification: result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
