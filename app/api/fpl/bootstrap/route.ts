import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
      // Revalidates data every 60 seconds so it stays fresh without spamming the FPL servers
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch FPL bootstrap data: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in bootstrap proxy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global FPL data' },
      { status: 500 }
    );
  }
}