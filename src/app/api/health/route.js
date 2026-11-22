import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AgroCast AI API',
    region: 'Andhra Pradesh',
    supportedLanguages: ['te', 'en'],
    defaultLanguage: 'te',
    integrations: {
      openMeteo: 'online',
      geminiAI: process.env.GEMINI_API_KEY?.trim() ? 'configured' : 'not-configured',
      supabase: isSupabaseConfigured ? 'configured' : 'local-mode',
    },
  });
}
