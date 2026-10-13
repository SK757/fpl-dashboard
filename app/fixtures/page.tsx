import Link from 'next/link';
import FixturesClient from './FixturesClient';

export const dynamic = 'force-dynamic';

async function getFixturesData() {
  try {
    const bootstrapRes = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
      cache: 'no-store',
    });
    const bootstrapData = await bootstrapRes.json();

    const currentGw =
      bootstrapData.events?.find((e: any) => e.is_current) || bootstrapData.events?.[0];

    const fixturesRes = await fetch(
      `https://fantasy.premierleague.com/api/fixtures/?event=${currentGw.id}`,
      { cache: 'no-store' }
    );
    const fixturesData = await fixturesRes.json();

    return { bootstrapData, fixturesData, currentGw };
  } catch (error) {
    console.error('Failed to load fixtures data', error);
    return { bootstrapData: null, fixturesData: null, currentGw: null };
  }
}

export default async function FixturesPage() {
  const data = await getFixturesData();

  if (!data.bootstrapData || !data.fixturesData) {
    return (
      <div className="h-dvh bg-[#00e5ff] p-4 flex flex-col items-center justify-center font-bold text-black">
        <p>Could not load fixtures data.</p>
        <Link href="/" className="mt-4 bg-white px-4 py-2 rounded-md">
          &larr; Back Home
        </Link>
      </div>
    );
  }

  return <FixturesClient {...data} />;
}