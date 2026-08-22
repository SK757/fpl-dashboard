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
  // Check if the current gameweek is ongoing (started but not yet finished)
  const isLive = currentGw ? !currentGw.finished : false;
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
    <div className="h-dvh overflow-hidden bg-[#00e5ff] p-2 max-w-175 w-screen min-w-[320px] flex flex-col gap-1.25 leading-[1.15]">
      
      {/* Top Header */}
      <h1 className="shrink-0 text-4xl font-bold text-center tracking-tight py-[.3rem] m-[-8px_0_-8px]">
        FPL
      </h1>

      {/* Team Name Banner */}
      <div className="shrink-0 bg-white/50 rounded-[3px] p-[.3rem] text-center">
        <h2 className="text-[calc(20px+1vw)] font-bold">
          {isValidManager ? managerData.name : 'Team Name Unreachable'}
        </h2>
      </div>

      {/* Hero Score Card */}
      <div className="shrink-0 bg-white/50 rounded-[3px] text-center flex flex-col items-center justify-center">
        
        {/* Current Gameweek Banner */}
        <div className="rounded-b-[15px] flex flex-row margin-0 p-[.2rem_.9rem] b-[#3b002c] bg-[#37003c] leading-[1.18] text-center text-[calc(10px+0.5vw)] font-bold">
          <span className="bg-linear-to-r from-[#00ff87] to-[#02efff] bg-clip-text text-transparent">
            {currentGw?.name || 'Gameweek'}
          </span>
          {isLive && (
            <p className="bg-linear-to-r from-[#00ff87] to-[#02efff] px-[.15rem] rounded-sm text-[#37003c] ml-0.75">
              Live
            </p>
          )}
        </div>

        {/* Score Container */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-2.5 w-full my-2 items-center px-2.5">

          {/* Average Score */}
          <div className="bg-white/60 h-[75%] py-3 px-1.5 rounded-md flex flex-col items-center justify-center">
            <span className="text-3xl font-black">
              {averageScore}
            </span>
            <span className="text-[0.8rem] tracking-tight">Average<br/>Score</span>
          </div>
          
          {/* Total Points (Clickable Link to Lineup) */}
          <Link 
            href="/lineup"
            className="bg-white/60 h-37.5 py-3 px-1.5 rounded-md flex flex-col items-center justify-center hover:bg-white/80 transition cursor-pointer"
          >
            <span className="text-[85px] sm:text-[100px] font-black text-black leading-[.9em]">
              {isValidManager ? (managerData.summary_event_points ?? 0) : 0}
            </span>
            <span className="text-sm font-bold">
              Lineup &rarr;
            </span>
          </Link>

          {/* Highest Scorer */}
          <div className="bg-white/60 h-[75%] py-3 px-1.5 rounded-md flex flex-col truncate items-center justify-center">
            <span className="text-3xl font-black">
              {topElementPoints ? 
                `${topElementPoints}` : 0}
            </span>
            <span className="text-[0.8rem] font-extrabold text-black truncate max-w-full mt-1">
              {topPlayerName}
            </span>
            <span className="text-[0.8rem] tracking-tight">Top Scorer</span>
          </div>
        </div>
        
        {/* Gameweek Deadline Banner */}
        <div className="bg-[#37003c] px-4 py-1 rounded-t-[15px] text-[calc(10px+0.5vw)] font-black self-center">
          <span className="bg-linear-to-r from-[#00ff87] to-[#02efff] bg-clip-text text-transparent">
            {nextGw?.name || 'Gameweek'} Deadline
            <br />
            {deadlineDate}
          </span>
        </div>

      </div>

      {/* Navigation Buttons 2x2 Grid */}
      <div className="shrink-0 bg-white/50 grid grid-cols-2 gap-2 p-1 rounded-[3px]">
        <Link 
          href="/compiler" 
          className="bg-white/60 hover:bg-white text-black font-bold text-center py-3 rounded-md"
        >
          Compiler
        </Link>
        <Link 
          href="/lineup" 
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