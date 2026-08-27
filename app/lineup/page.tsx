import Link from 'next/link';
import { BootstrapData, PicksData } from '../../types/fpl';
import LineupClient from './LineupClient'; // Import our new UI component

const MY_MANAGER_ID = '3115828';

async function getSquadData(managerId: string) {
  try {
    const bootstrapRes = await fetch('http://localhost:3000/api/fpl/bootstrap', { cache: 'no-store' });
    const bootstrapData: BootstrapData = await bootstrapRes.json();

    const currentGw = bootstrapData.events?.find((e) => e.is_current) || bootstrapData.events?.[0];
    const fixturesRes = await fetch(`https://fantasy.premierleague.com/api/fixtures/?event=${currentGw.id}`);
    const fixturesData = await fixturesRes.json();
    
    const gwId = currentGw?.id;

    let picksData: PicksData | null = null;
    let liveData: any = null;

    if (gwId) {
      const [picksRes, liveRes] = await Promise.all([
        fetch(`http://localhost:3000/api/fpl/picks/${managerId}/${gwId}`, { cache: 'no-store' }),
        fetch(`http://localhost:3000/api/fpl/live/${gwId}`, { cache: 'no-store' })
      ]);

      if (picksRes.ok) picksData = await picksRes.json();
      if (liveRes.ok) liveData = await liveRes.json();
    }

    return { bootstrapData, picksData, liveData, currentGw, fixturesData };
  } catch (error) {
    console.error("Failed to load squad data", error);
    return { bootstrapData: null, picksData: null, liveData: null, currentGw: null, fixturesData: null };
  }
}

export default async function SquadPage() {
  const data = await getSquadData(MY_MANAGER_ID);

  if (!data.bootstrapData || !data.picksData) {
    return (
      <div className="h-dvh bg-[#00e5ff] p-4 flex flex-col items-center justify-center font-bold text-black">
        <p>Could not load squad data.</p>
        <Link href="/" className="mt-4 bg-white px-4 py-2 rounded-md">&larr; Back Home</Link>
      </div>
    );
  }

  // Pass everything to the Client Component to render!
  return <LineupClient {...data} />;
}