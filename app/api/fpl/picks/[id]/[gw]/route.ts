import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  // 1. Change params to a Promise type
  { params }: { params: Promise<{ id: string; gw: string }> }
) {
  // 2. Await the params before destructuring
  const { id, gw } = await params;

  try {
    const response = await fetch(
      `https://fantasy.premierleague.com/api/entry/${id}/event/${gw}/picks/`,
      {
        headers: {
          'User-Agent': 'FPL-App/1.0',
        },
        next: { revalidate: 60 }, 
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch picks for GW${gw}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching FPL picks:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}