import { NextResponse } from 'next/server';
import { advisorService } from '@/services/advisor/advisorService';

export async function GET() {
  try {
    const conversations = await advisorService.getConversations('farmer-demo-ap-01');
    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, language = 'te' } = body;
    const conv = await advisorService.createConversation('farmer-demo-ap-01', title, language);
    return NextResponse.json({ conversation: conv }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
