import Link from 'next/link';
import { BootstrapData, ManagerData, LeagueStandingsData } from '../types/fpl';
import LeagueTabs from '@/components/LeagueTabs';

const MY_MANAGER_ID = '3115828';

async function getFPLData(managerId: string) {
  try {
    const [bootstrapRes, managerRes] = await Promise.all([
      fetch('http://localhost:3000/api/fpl/bootstrap', { cache: 'no-store' }),
      fetch(`http://localhost:3000/api/fpl/manager/${managerId}`, { cache: 'no-store' }),
    ]);

    const bootstrapData: BootstrapData = await bootstrapRes.json();
    const managerData: ManagerData = await managerRes.json();

    let leaguesData: LeagueStandingsData[] = [];
    if (managerData?.leagues?.classic?.length) {
      const targetLeagueNames = ["The Navigators", "Backstreet Moyes", "Just for Fun", "Ex-Taskers Fantasy League"];
      
      const targetLeagues = managerData.leagues.classic.filter((l) => 
        targetLeagueNames.includes(l.name)
      );

      const leaguePromises = targetLeagues.map(async (l) => {
        const res = await fetch(`http://localhost:3000/api/fpl/league/${l.id}`, {
          cache: 'no-store',
        });
        return res.json();
      });

      leaguesData = await Promise.all(leaguePromises);
    }

    return { bootstrapData, managerData, leaguesData };
  } catch {
    return { 
      bootstrapData: { events: [], elements: [] }, 
      managerData: null, 
      leaguesData: [] 
    };
  }
}

export default async function Home() {
  const { bootstrapData, managerData, leaguesData } = await getFPLData(MY_MANAGER_ID);

  const isValidManager = managerData && !('error' in managerData) && managerData.name;
  // Get current gameweek info
  const currentGw = bootstrapData.events?.find((e) => e.is_current) || bootstrapData.events?.[0];
  // Get next gameweek info
  const nextGw = bootstrapData.events?.find((e) => e.is_next);
  // Get current gameweek
  const gwStarted = bootstrapData.events?.find((e) => e.is_current)
  // Get if current Gameweek is finished
  const gwFinished = bootstrapData.events?.find((e) => e.finished)
  // Get gameweek average score
  const averageScore = currentGw?.average_entry_score ?? 0;

  // Get highest scoring player for the gameweek
  const topElementId = currentGw?.top_element_info?.id;
  const topElementPoints = currentGw?.top_element_info?.points;
  const topPlayerObj = bootstrapData.elements?.find((el) => el.id === topElementId);
  const topPlayerName = topPlayerObj ? topPlayerObj.web_name : '-';

  const deadlineDate = nextGw
    ? new Date(nextGw.deadline_time).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    /* Main Container */
    <div className="h-dvh overflow-hidden bg-[#00e5ff] text-black p-4 max-w-150 w-screen min-w-[320px] flex flex-col gap-2">
      
      {/* Top Header */}
      <h1 className="shrink-0 text-4xl font-medium text-center tracking-tight py-1">
        FPL
      </h1>

      {/* Team Name Banner */}
      <div className="shrink-0 bg-white/50 rounded-[3px] p-4 text-center">
        <h2 className="text-2xl font-medium text-black">
          {isValidManager ? managerData.name : 'Team Name Unreachable'}
        </h2>
      </div>

      {/* Hero Score Card */}
      <div className="shrink-0 bg-white/50 rounded-[3px] px-4  text-center flex flex-col items-center justify-center">
        
        {/* Current Gameweek Banner */}
        <div className="bg-[#3b002c] px-4 py-1 rounded-b-[15px] self-center">
          <div className="bg-linear-to-r from-[#00ff87] to-[#02efff] bg-clip-text text-transparent text-xs font-black">
            {currentGw?.name || 'Gameweek'}
            {gwStarted ? //if gameweek has started (is_current gameweek === true)
              (!gwFinished //if gameweek is live (finished === false)
                ? (<> <span className="bg-linear-to-r from-[#00ff87] to-[#02efff] px-[.15rem] rounded-sm text-[#37003c]">Live</span></>) //then show the Live span with a space in front
                : null) // else show nothing
            : null} {/* else gameweek hasn't started (is_current gameweek === false) then show nothing */}
          </div>
        </div>

        {/* Score Container */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 w-full my-2">

          {/* Average Score */}
          <div className="bg-white/60 py-3 px-1.5 rounded-md flex flex-col items-center justify-center">
            <span className="text-3xl font-black leading-tight">
              {averageScore}
            </span>
            <span className="text-[0.8rem] tracking-tight">Average<br/>Score</span>
          </div>
          
          {/* Total Points */}
          <div className="bg-white/60 h-37.5 py-3 px-1.5 rounded-md flex flex-col items-center justify-center">
            <span className="text-[85px] sm:text-[100px] font-black text-black leading-none tracking-tight">
              {isValidManager ? 
                (managerData.summary_event_points ?? 0) 
              : 0}
            </span>
            <span className="text-sm font-bold">
              Lineup &rarr;
            </span>
          </div>

          {/* Highest Scorer */}
          <div className="bg-white/60 py-3 px-1.5 rounded-md flex flex-col truncate items-center justify-center">
            <span className="text-3xl font-black">
              {topElementPoints ? 
                `${topElementPoints}` : 0}
            </span>
            <span className="text-[0.8rem] font-extrabold text-black truncate max-w-full leading-tight mt-1">
              {topPlayerName}
            </span>
            <span className="text-[0.8rem] tracking-tight">Top Scorer</span>
          </div>
        </div>
        
        {/* Gameweek Deadline Banner */}
        <div className="bg-[#3b002c] px-4 py-1 rounded-t-[15px] leading-tight text-xs font-black self-center">
          <div className="bg-linear-to-r from-[#00ff87] to-[#02efff] bg-clip-text text-transparent">
            {nextGw?.name || 'Gameweek'} Deadline
          </div>
          <div className="bg-linear-to-r from-[#00ff87] to-[#02efff] bg-clip-text text-transparent">
            {deadlineDate}
          </div>
        </div>

      </div>

      {/* Navigation Buttons 2x2 Grid */}
      <div className="shrink-0 bg-white/50 grid grid-cols-2 gap-2 p-1">
        <Link 
          href="/compiler" 
          className="bg-white/60 hover:bg-white text-black font-bold text-center py-3 rounded-md"
        >
          Compiler
        </Link>
        <Link 
          href="/squad" 
          className="bg-white/60 hover:bg-white text-black font-bold text-center py-3 rounded-md"
        >
          Lineup
        </Link>
        <Link 
          href="/history" 
          className="bg-white/60 hover:bg-white text-black font-bold text-center py-3 rounded-md"
        >
          History
        </Link>
        <Link 
          href="/strength" 
          className="bg-white/60 hover:bg-white text-black font-bold text-center py-3 rounded-md"
        >
          Strength
        </Link>
      </div>

      {/* Mini-Leagues Standings Tables - fill the remaining screen space */}
      <div className="flex-1 min-h-0 flex flex-col">
        <LeagueTabs leaguesData={leaguesData} />
      </div>

    </div>
  );
}