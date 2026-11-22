import { NextResponse } from 'next/server';
import { getSupabaseRequestContext } from './server';

export async function requireSupabaseUser() {
  const context = await getSupabaseRequestContext();
  if (!context.supabase) {
    return {
      ...context,
      response: NextResponse.json(
        { error: 'Supabase is not configured on this server.' },
        { status: 503 }
      ),
    };
  }
  if (
    context.error &&
    !context.user &&
    context.error.name !== 'AuthSessionMissingError' &&
    context.error.status !== 401
  ) {
    console.error('Could not verify Supabase session:', context.error.message);
    return {
      ...context,
      response: NextResponse.json(
        { error: 'The current session could not be verified. Please sign in again.' },
        { status: 503 }
      ),
    };
  }
  if (!context.user) {
    return {
      ...context,
      response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
    };
  }
  return context;
}

export function databaseUnavailableResponse(error, operation) {
  console.error(`Supabase ${operation} failed:`, error?.message || 'Unknown database error');
  return NextResponse.json(
    { error: 'Supabase could not complete this request. Check the database setup and try again.' },
    { status: 503 }
  );
}
