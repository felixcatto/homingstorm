import { format } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = async (request: NextRequest) => {
  const ip = request.headers.get('x-forwarded-for') || '?';
  const date = `[${format(new Date(), 'dd.MM HH:MM:ss')}]`;
  console.log(`${date} ←${request.method}:${request.nextUrl.pathname} from ip ${ip}`);

  return NextResponse.next();
};

export const config = {
  matcher: ['/((?!_next|favicon.ico|css|img|font).*)'],
};
