import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gw: string }> }
) {
  const { gw } = await params;

  try {
    const response = await fetch(
      `https://fantasy.premierleague.com/api/event/${gw}/live/`,
      {
        headers: {
          'User-Agent': 'FPL-App/1.0',
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch live data for GW${gw}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching live data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}