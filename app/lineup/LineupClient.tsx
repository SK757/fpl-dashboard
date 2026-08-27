'use client'; // This tells Next.js this file handles interactivity!

import { useState } from 'react';
import Link from 'next/link';

// Helper to format FPL stat names nicely
const statLabels: Record<string, string> = {
  minutes: 'Minutes',
  goals_scored: 'Goals',
  assists: 'Assists',
  clean_sheets: 'Clean Sheet',
  goals_conceded: 'Goals Conceded',
  own_goals: 'Own Goals',
  penalties_saved: 'Penalties Saved',
  penalties_missed: 'Penalties Missed',
  yellow_cards: 'Yellow Card',
  red_cards: 'Red Card',
  saves: 'Saves',
  defensive_contribution: 'Defensive Contribution',
  bonus: 'Bonus Points',
};

export default function LineupClient({ bootstrapData, picksData, liveData, currentGw, fixturesData }: any) {
  // State to track which player was clicked
  const [selectedPick, setSelectedPick] = useState<any | null>(null);

  const playerMap = new Map<number, { 
    id: number; 
    element_type: number; 
    code: number; 
    web_name: string;
    team: number;
    expected_goals: string;
    expected_assists: string;
    expected_goal_involvements: string;
  }>(
    (bootstrapData.elements || []).map((p: any) => [p.id, p])
  );

  // Map team IDs to short names
  const teamMap = new Map<number, string>(
    (bootstrapData.teams || []).map((t: any) => [t.id, t.short_name])
  );

  // Map element_type to position strings
  const positionMap: Record<number, string> = {
    1: 'GKP',
    2: 'DEF',
    3: 'MID',
    4: 'FWD'
  };

  // 1. Map team IDs to FULL names (e.g., Arsenal, Everton)
  const fullTeamNameMap = new Map<number, string>(
    (bootstrapData.teams || []).map((t: any) => [t.id, t.name])
  );

  // 2. Map Fixture IDs to the actual match details
  const fixtureMap = new Map<number, any>(
    (fixturesData || []).map((f: any) => [f.id, f])
  );
  
  // Updated LiveMap to tell TypeScript about the 'explain' breakdown data
  const liveMap = new Map<number, {
    stats: { total_points: number };
    explain: { fixture: number; stats: { identifier: string; points: number; value: number }[] }[];
  }>(
    (liveData?.elements || []).map((e: any) => [e.id, e])
  );

  const starters = picksData.picks.filter((p: any) => p.position <= 11);
  const bench = picksData.picks.filter((p: any) => p.position > 11);

  const groupedStarters = {
    gk: starters.filter((p: any) => playerMap.get(p.element)?.element_type === 1),
    def: starters.filter((p: any) => playerMap.get(p.element)?.element_type === 2),
    mid: starters.filter((p: any) => playerMap.get(p.element)?.element_type === 3),
    fwd: starters.filter((p: any) => playerMap.get(p.element)?.element_type === 4),
  };

  const PlayerCard = ({ pick, isBench = false }: { pick: any, isBench?: boolean }) => {
    const player = playerMap.get(pick.element);
    if (!player) return null;
    
    const liveStats = liveMap.get(pick.element);
    const basePoints = liveStats ? liveStats.stats.total_points : 0;
    const displayMultiplier = pick.multiplier > 0 ? pick.multiplier : 1; 
    const totalPoints = basePoints * displayMultiplier;

    const photoUrl = `https://resources.premierleague.com/premierleague25/photos/players/110x140/${player.code}.png`;
    
    return (
      <button 
        type="button"
        onClick={() => setSelectedPick(pick)}
        // 1. Added 'group' and 'touch-manipulation'
        // 2. Removed the active:scale-95 from the button itself so the hit-area NEVER shrinks
        className={`w-full group cursor-pointer touch-manipulation flex flex-col items-center justify-end flex-1 min-w-0 max-w-16.25 px-px ${isBench ? 'grayscale' : ''}`}
      >
        {/* Inner wrapper: This shrinks visually, but the button surrounding it stays full size! */}
        <div className="w-full flex flex-col items-center transition-transform group-active:scale-95">
          <div 
            style={{ backgroundImage: `url(${photoUrl})` }}        
            className="relative bg-no-repeat bg-contain bg-bottom w-12 h-12 sm:w-14 sm:h-14 flex items-start justify-center">
            {(pick.is_captain || pick.is_vice_captain) && (
              <div className="absolute top-0 right-0 bg-black/70 text-[#00ff87] text-[9px] font-black px-1 rounded-sm">
                {pick.is_captain ? "C" : "V"}
              </div>
            )}
          </div>
          
          <div className="w-full bg-[#37003c] text-white text-center rounded-sm overflow-hidden flex flex-col shadow-md">
            <div className="bg-[#37003c] px-0.5 py-0.5">
              <p className="text-[9px] font-bold truncate leading-tight">
                {player.web_name}
              </p>
            </div>
            <div className={`${isBench ? 'bg-gray-400' : 'bg-[#00ff87]'} text-[#37003c] text-[10px] font-black w-full border-t border-black/20`}>
              {totalPoints}
            </div>
          </div>
        </div>
      </button>
    );
  };

  // Variables for the currently open modal
  const selectedPlayer = selectedPick ? playerMap.get(selectedPick.element) : null;
  const selectedLive = selectedPick ? liveMap.get(selectedPick.element) : null;
  const explainList = selectedLive?.explain || [];

  return (
    // 1. Add a React Fragment to group the page and the modal side-by-side
    <>
      <div className="h-dvh overflow-hidden bg-[#00e5ff] p-2 max-w-175 mx-auto w-full min-w-[320px] flex flex-col gap-1.25 font-sans select-none text-black relative">
        
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between bg-white/50 p-2 rounded-[3px]">
          <Link href="/" className="font-bold text-black bg-white/60 px-3 py-1 rounded-[3px] text-sm hover:bg-white transition">
            &larr; Back
          </Link>
          <h1 className="text-lg sm:text-xl font-black tracking-tight">GW{currentGw?.id} Lineup</h1>
          <div className="w-16.5"></div>
        </div>

        {/* The Pitch (Starters) */}
        <div className="flex-1 bg-linear-to-b from-[#2e8b57] to-[#1e5c3a] rounded-[3px] border-2 border-white/40 pt-1 pb-2 flex flex-col justify-around relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 pointer-events-none opacity-30 flex flex-col justify-between">
             <div className="h-[20%] border-b-2 border-white mx-auto w-1/2 rounded-b-[40px]"></div>
             <div className="border-t-2 border-white w-full"></div>
             <div className="h-[20%] border-t-2 border-white mx-auto w-1/2 rounded-t-[40px]"></div>
          </div>

          <div className="flex justify-around w-full px-1 z-10">{groupedStarters.gk.map((pick: any) => <PlayerCard key={pick.element} pick={pick} />)}</div>
          <div className="flex justify-around w-full px-1 z-10">{groupedStarters.def.map((pick: any) => <PlayerCard key={pick.element} pick={pick} />)}</div>
          <div className="flex justify-around w-full px-1 z-10">{groupedStarters.mid.map((pick: any) => <PlayerCard key={pick.element} pick={pick} />)}</div>
          <div className="flex justify-around w-full px-1 z-10">{groupedStarters.fwd.map((pick: any) => <PlayerCard key={pick.element} pick={pick} />)}</div>
        </div>

        {/* The Bench */}
        <div className="shrink-0 bg-[#37003c] rounded-[3px] p-2">
          <h2 className="text-[#00ff87] text-[10px] font-bold mb-1 uppercase tracking-wide text-center">Bench</h2>
          <div className="flex justify-around w-full px-1">
            {bench.map((pick: any) => <PlayerCard key={pick.element} pick={pick} isBench={true} />)}
          </div>
        </div>

      </div> {/* <-- END OF MAIN CONTAINER */}

      {/* 2. MODAL OVERLAY - Now sitting completely outside the overflow-hidden container! */}
      {selectedPick && selectedPlayer && (
        <div 
          className="flex h-full justify-center left-0 absolute top-0 w-full"
          onClick={() => setSelectedPick(null)} 
        >
          <div 
            className="self-center animate-modal bg-[#37003c] text-white absolute transform box-content max-w-107.5 w-[90%] rounded-[3px] z-300 border border-white"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Modal Header */}
            <div className="bg-white text-[#37003c] p-[.65rem_.75rem]">
              <h1 style={{ fontSize: 'revert', fontWeight: 'revert' }} className="pr-10">{selectedPlayer.web_name}</h1>
              <button onClick={() => setSelectedPick(null)} className="bg-[#00e187] border-0 box-border cursor-pointer block h-7.5 right-3 outline-none absolute top-[.9rem] w-7.5 rounded-[3px] z-2">
                <span className="block -mt-3.5 text-[47px]">&times;</span>
              </button>
              <p className="text-[.8rem]">
                {teamMap.get(selectedPlayer.team)} - {positionMap[selectedPlayer.element_type]}
              </p>
            </div>

            {/* Stats Breakdown */}
            <div className="max-h-[79vh] overflow-y-auto">
              {explainList.length > 0 ? (
                explainList.map((explainItem, fixIdx) => {
                  const match = fixtureMap.get(explainItem.fixture);
                  const homeTeam = match ? fullTeamNameMap.get(match.team_h) : 'Unknown';
                  const awayTeam = match ? fullTeamNameMap.get(match.team_a) : 'Unknown';
                  
                  // Format Kickoff Date & Time
                  const matchDate = match ? new Date(match.kickoff_time) : new Date();
                  const timeString = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateString = matchDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

                  // Determine what to show in the center (Score OR Date/Time)
                  const hasStarted = match && (match.started || match.team_h_score !== null);
                  const scoreDisplay = hasStarted ? (
                    `${match.team_h_score} - ${match.team_a_score}`
                  ) : (
                    <>
                      {dateString}<br />{timeString}
                    </>
                  );
                  // const scoreDisplay = hasStarted ? (
                  //   <>
                  //     {dateString}<br />{timeString}
                  //   </>
                  // ) : (
                  //   `${match.team_h_score} - ${match.team_a_score}`
                  // );

                  return (
                    <div key={fixIdx}>
                      {/* Fixture */}
                      <div className="flex justify-between items-center font-normal h-[3.2rem]">
                        <span className="flex-1 text-right text-[.85rem]">{homeTeam}</span>
                        <span className={`text-center leading-tight mx-3 font-bold whitespace-nowrap ${hasStarted ? 'text-[#ebff00] text-[1.6rem]' : 'text-[#d0bcd3] text-[.8215rem] font-normal'}`}>
                        {/* <span className={`text-center leading-tight mx-3 font-bold whitespace-nowrap ${hasStarted ? 'text-[#d0bcd3] text-[.8215rem] font-normal' : 'text-[#ebff00] text-[1.6rem]'}`}> */}
                          {scoreDisplay}
                        </span>
                        <span className="flex-1 text-left text-[.85rem]">{awayTeam}</span>
                      </div>

                      {/* Details Table */}
                      <table className="w-full text-center">
                        <thead className="bg-[#5f3363] text-white">
                          <tr>
                            <th className="text-left font-bold py-2 px-3">Statistics</th>
                            <th className="font-bold py-2 px-3 w-[21%]">Value</th>
                            <th className="font-bold py-2 px-3 w-[21%]">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {explainItem.stats.map((stat, statIdx) => (
                            <tr key={statIdx} className="border-t border-[#5f3363] text-left bg-[#37003c]">
                              <td className="p-[.5rem_.33rem] pl-3 pt-[.7rem] text-[1.1rem]">
                                {statLabels[stat.identifier] || stat.identifier}
                              </td>
                              <td className="text-center text-[1.5rem] font-bold p-[.5rem_.33rem]">
                                {stat.value}
                              </td>
                              <td className="text-center text-[1.5rem] font-bold p-[.5rem_.33rem] text-[#ebff00]">
                                {stat.points}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 italic text-center py-4">No points recorded yet.</div>
              )}

              {/* Expected Stats Footer */} 
              <div className="text-center text-[.8rem] grid grid-cols-3 relative p-[.2rem_0] border-t border-[#7d7d7d]">
                <span className="text-[#a7a6a6]">xG</span>
                <span className="text-[#a7a6a6]">xA</span>
                <span className="text-[#a7a6a6]">xGI</span>
                <span>{selectedPlayer.expected_goals || '0.00'}</span>
                <span>{selectedPlayer.expected_assists || '0.00'}</span>
                <span>{selectedPlayer.expected_goal_involvements || '0.00'}</span>
              </div>
            </div>
          </div>
          <div
            className="bg-black/60 h-full w-full z-299 animate-bg-fade" 
            style={{transition: "background 300ms, transform 300ms, border-color 300ms"}}>
						
          </div>
        </div>
      )}
    </>
  );
}