import { NextResponse } from 'next/server';
import { notificationService } from '@/services/notifications/notificationService';

export async function GET() {
  try {
    const notifications = await notificationService.getNotifications('farmer-demo-ap-01');
    return NextResponse.json({ notifications, count: notifications.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
