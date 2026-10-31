import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('ekrupsy_session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie);
    return NextResponse.json({
      authenticated: true,
      user: session.user,
      pelanggan: session.pelanggan || null,
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
}
