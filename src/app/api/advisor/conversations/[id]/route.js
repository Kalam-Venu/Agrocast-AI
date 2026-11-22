import { NextResponse } from 'next/server';
import { advisorService } from '@/services/advisor/advisorService';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const conv = await advisorService.getConversationById(id);
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    return NextResponse.json({ conversation: conv });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await advisorService.deleteConversation(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
