import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil',
  });

  response.cookies.set({
    name: 'ekrupsy_session',
    value: '',
    path: '/',
    maxAge: 0,
  });

  return response;
}
