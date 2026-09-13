'use client'; // This tells Next.js this file handles interactivity!

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

export default function LineupClient({ bootstrapData, picksData, liveData, currentGw, fixturesData, historyData }: any) {
  // State to track which player was clicked
  const [selectedPick, setSelectedPick] = useState<any | null>(null);

  // Inject root font size for Lineup page only and clean up on unmount
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.id = 'lineup-root-font';
    styleTag.innerHTML = `
      @media (max-width: 404px) and (max-height: 632px) { 
        html { 
          font-size: 16px !important; 
        }
      }
      @media (min-width: 405px) and (max-width: 499px), (min-height: 633px) and (max-height: 663px) {
        html { 
          font-size: 17px !important;
        }
      }
      @media (min-width: 500px) and (min-height: 664px) { 
        html { 
          font-size: 20px !important; 
        }
      }
    `;
    document.head.appendChild(styleTag);

    // Remove the style rules when leaving this page
    return () => {
      const existing = document.getElementById('lineup-root-font');
      if (existing) existing.remove();
    };
  }, []);

  const playerMap = new Map<number, { 
    id: number; 
    element_type: number; 
    code: number; 
    web_name: string;
    team: number;
    now_cost: number;
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
    stats: { total_points: number, minutes:number };
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

  const getTeamShortName = (teamId: number) => teamMap.get(teamId) || '???';
  
  const calculateGamesRemaining = () => {
    let remaining = 0;
    const activePicks = picksData.picks.filter((pick: any) => pick.multiplier > 0);

    activePicks.forEach((pick: any) => {
      const liveStats = liveMap.get(pick.element);
      const fixtures = liveStats?.explain || [];

      fixtures.forEach((f: any) => {
        const match = fixtureMap.get(f.fixture);
        // If the match exists, has NOT started and is NOT finished, it's a game left to play
        if (match && !match.started && !match.finished_provisional) {
          remaining += 1;
        }
      });
    });

    return remaining;
  };
  const gamesLeft = calculateGamesRemaining();

  const calculateLivePoints = () => {
    let totalLivePoints = 0;

    picksData.picks.forEach((pick: any) => {
      // Get the player's live stats from the map
      const liveStats = liveMap.get(pick.element);
      
      // Get their current base points, default to 0 if not found
      const basePoints = liveStats ? liveStats.stats.total_points : 0;
      
      // Multiply by their multiplier (1 for normal, 2 for captain, 0 for bench)
      totalLivePoints += basePoints * pick.multiplier;
    });
    
    return totalLivePoints;
  };
  const livePoints = calculateLivePoints();

  const PlayerCard = ({ pick, isBench = false }: { pick: any, isBench?: boolean }) => {
    const [imgError, setImgError] = useState(false);

    const player = playerMap.get(pick.element);
    if (!player) return null;
    
    const liveStats = liveMap.get(pick.element);
    const basePoints = liveStats ? liveStats.stats.total_points : 0;
    const minutes = liveStats ? liveStats.stats.minutes : 0;
    const displayMultiplier = pick.multiplier > 0 ? pick.multiplier : 1; 
    const totalPoints = basePoints * displayMultiplier;

    // Check fixtures to see what is played vs unplayed
    const fixtures = liveStats?.explain || [];
    let playedCount = 0;
    let isCurrentlyPlaying = false;
    const unplayedFixtures: string[] = [];

    fixtures.forEach((f: any) => {
      const match = fixtureMap.get(f.fixture);
      if (!match) return;

      if (match.started) {
        playedCount++;
        if (!match.finished_provisional) {
          isCurrentlyPlaying = true;
        }
      } else {
        // Figure out opponent and H/A
        const isHome = match.team_h === player.team;
        const opponentId = isHome ? match.team_a : match.team_h;
        const oppName = teamMap.get(opponentId) || '???'; 
        unplayedFixtures.push(`${oppName} (${isHome ? 'H' : 'a'})`);
      }
    });
    const allFixturesFinished = fixtures.length > 0 && playedCount === fixtures.length;
    const didNotPlay = allFixturesFinished && minutes === 0;

    const photoUrl = `https://resources.premierleague.com/premierleague25/photos/players/110x140/${player.code}.png`;
    const fallbackUrl = "https://resources.premierleague.com/premierleague/photos/players/110x140/Photo-Missing.png";
    
    // PLAYERCARD
    return (
      <div className="grid grid-rows-[3.125rem_.9rem_auto] min-h-22 relative text-center z-1">
        <div className="h-11.25 w-11.25 m-[0_auto_.39rem] relative">
          <div className={`${isBench ? 'grayscale' : 'filter-none'} border border-black bg-white rounded-[100%] overflow-hidden h-11.25 w-11.25 relative`}>
            <Image
              src={imgError ? fallbackUrl : photoUrl}
              onError={() => setImgError(true)}
              alt={player.web_name}
              fill
              sizes="(max-width: 404px) 45px, (max-width: 499px) 47.8125px, 56.25px"
              style={{ left: '-1px' }}
              className={`object-contain object-bottom scale-[1.5] origin-bottom ${
                imgError ? 'translate-y-7' : 'translate-y-5'
              }`}
            />
          </div>
          {isCurrentlyPlaying && (
            <div className="absolute top-0 left-0 z-10 bg-black/70 text-[#00ff87] text-[9px] w-[5.5px] h-[10.5px] box-content px-[4.25px] font-black rounded-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#00ff87] rounded-full animate-pulse-two"></div>
            </div>
          )}
          {(pick.is_captain || pick.is_vice_captain) && (
            <div className="absolute top-0 right-0 z-10 bg-black/70 text-[#00ff87] text-[9px] w-[5.5px] h-[10.5px] box-content px-[4.25px] font-black rounded-sm">
              {pick.is_captain ? "C" : "V"}
            </div>
          )}
        </div>
        <div className="box-border block font-semibold text-[.6875rem] overflow-hidden p-[0_5px] text-ellipsis text-nowrap w-full">
          {player.web_name}
        </div>
        <div className="flex text-[1.125rem] tabular-nums font-semibold justify-center items-center">
          {didNotPlay ? (
            <span className="tracking-tighter">
              DNP
            </span>
          ) : playedCount === 0 && unplayedFixtures.length > 0 ? (
            // CASE 1: Hasn't played any games yet -> e.g. "ARS (a)"
            <span className="text-[11px] font-bold tracking-tight text-gray-700 whitespace-nowrap">
              {unplayedFixtures.join(', ')}
            </span>
          ): playedCount > 0 && unplayedFixtures.length > 0 ? (
            // CASE 2: DGW partially played -> e.g. "10, ARS (a)"
            <span className="text-[13px] font-bold whitespace-nowrap">
              {totalPoints}
              <span className="text-gray-600 font-semibold text-[10px] ml-1">
                , {unplayedFixtures.join(', ')}
              </span>
            </span>
          ) : (
            // CASE 3: All games finished, or Blank GW -> e.g. "10"
            <span className="text-[1.125rem] font-semibold">
              {totalPoints}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSelectedPick(pick)}
          className="bg-transparent border-0 cursor-pointer h-full left-0 m-[-3px_0_0] outline-none absolute text-indent-[-999rem] top-0 w-full"
        ></button>
      </div>
    );
  };

  // Variables for the currently open modal
  const selectedPlayer = selectedPick ? playerMap.get(selectedPick.element) : null;
  const selectedLive = selectedPick ? liveMap.get(selectedPick.element) : null;
  const explainList = selectedLive?.explain || [];

  const playerHistoryObj = selectedPlayer ? historyData?.[selectedPlayer.id] : null;
  const last5Fixtures = (playerHistoryObj?.history || []).slice(-5);
  const next5Fixtures = (playerHistoryObj?.upcoming || []).slice(0, 5);

  return (
    // 1. Add a React Fragment to group the page and the modal side-by-side
    <>
      <div className="min-h-dvh bg-[#00e5ff] p-1 max-w-175 mx-auto w-full min-w-[320px] flex flex-col gap-1.25 select-none text-black relative">
        
        

        {/* The Pitch */}
        <div className="flex-1 w-full max-w-3xl mx-auto relative flex flex-col">
          <div className="flex-1 w-full flex flex-col justify-around relative py-2 items-center">
              <div className="gw-info left-4 shadow-[-2px_2px_0_black]">
                <span className="text-[calc(13px+.5vw)]">
                  To Play<br/>                
                </span>
                <span className="italic text-[6vmin] font-medium">
                  <b>{gamesLeft}</b>
                </span>
              </div>
              {groupedStarters.gk.map((pick: any) => <PlayerCard key={pick.element} pick={pick} />)}
              <div className="gw-info right-4 shadow-[2px_2px_0_black]">
                <span className="text-[calc(13px+.5vw)]">
                  Points<br/>                
                </span>
                <span className="italic text-[6vmin] font-medium">
                  <b>{livePoints}</b>
                </span>
              </div>
            <div className="player-grid-row">{groupedStarters.def.map((pick: any) => <PlayerCard key={pick.element} pick={pick} />)}</div>
            <div className="player-grid-row">{groupedStarters.mid.map((pick: any) => <PlayerCard key={pick.element} pick={pick} />)}</div>
            <div className="player-grid-row">{groupedStarters.fwd.map((pick: any) => <PlayerCard key={pick.element} pick={pick} />)}</div>
            <div className="player-grid-row mt-2 pt-4 border-t border-black/20 w-full relative justify-center">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00e5ff] px-2 text-[10px] font-bold uppercase tracking-widest text-black/50">
                Bench
              </span>
              {bench.map((pick: any) => <PlayerCard key={pick.element} pick={pick} isBench={true} />)}
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between bg-white/50 p-1 rounded-[3px]">
          <Link href="/" className="font-bold text-black bg-white/60 px-3 py-1 rounded-[3px] text-sm hover:bg-white transition">
            &larr; Back
          </Link>
          <h1 className="text-lg sm:text-xl font-black tracking-tight">GW{currentGw?.id} Lineup</h1>
          <div className="w-16.5"></div>
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
                <span className="flex justify-center leading-0 text-[47px]">&times;</span>
              </button>
              <p className="text-[.8rem]">
                {teamMap.get(selectedPlayer.team)} - {positionMap[selectedPlayer.element_type]}
              </p>
              <span className="right-[17%] absolute top-[1.3rem]">£{(selectedPlayer.now_cost / 10)}</span>
            </div>

            {/* Modal Stats */}
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
                  
                  // Determine what to show in the top-right (Match Minute OR nothing)
                  const hasFinished = match && match.finished_provisional;
                  const matchMinute = hasStarted && !hasFinished ? (
                    `${match.minutes}'`
                  ) : (
                    ''
                  );
                  
                  return (
                    <div key={fixIdx}>
                      {/* Fixture */}
                      <div className="flex justify-between items-center font-normal h-[3.2rem]">
                        <span className="flex-1 text-right text-[.85rem]">{homeTeam}</span>
                        <span className={`text-center leading-tight mx-3 font-bold whitespace-nowrap ${hasStarted ? 'text-[#ebff00] text-[1.6rem]' : 'text-[#d0bcd3] text-[.8215rem] font-normal'}`}>
                          {scoreDisplay}
                        </span>
                        <span className="flex-1 text-left text-[.85rem]">{awayTeam}</span>
                        <span className="text-[#d0bcd3] absolute right-[.7rem] text-[.85rem]">{matchMinute}</span>
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
                              <td className="p-[.5rem_.33rem] pl-3 text-[1.1rem]">
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
              
              {/* Fixtures Block (Last 5 & Next 5) */}
              <div className="flex w-full border-t border-[#7d7d7d] pt-1">
                
                {/* Last 5 Matches */}
                <div className="w-1/2 border-r border-[#7d7d7d] p-[0_.5rem]">
                  <h3 className="text-[#a7a6a6] text-[9px] uppercase tracking-widest font-bold mb-1 text-center">Last 5</h3>
                  <div className="flex flex-col gap-1 mb-1">
                    {last5Fixtures.map((m: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[11px] bg-white/10 px-1.5 py-1 rounded-[3px]">
                        <span className="font-bold flex items-center gap-1">
                          <span className="text-[#a7a6a6] font-normal text-[9px]">{m.round}</span>
                          <span>{getTeamShortName(m.opponent_team)}</span>
                          <span className="text-[#a7a6a6] font-normal text-[9px]">({m.was_home ? 'H' : 'A'})</span>
                        </span>
                        <span className={`font-black ${m.total_points >= 4 ? 'text-[#00ff87]' : 'text-white'}`}>
                          {m.total_points}
                        </span>
                      </div>
                    ))}
                    {last5Fixtures.length === 0 && <span className="text-[#a7a6a6] text-[10px] italic text-center">No data</span>}
                  </div>
                </div>

                {/* Next 5 Matches */}
                <div className="w-1/2 p-[0_.5rem]">
                  <h3 className="text-[#a7a6a6] text-[9px] uppercase tracking-widest font-bold mb-1 text-center">Next 5</h3>
                  <div className="flex flex-col gap-1 mb-1">
                    {next5Fixtures.map((m: any, i: number) => {
                      const isHome = m.is_home;
                      const oppId = isHome ? m.team_a : m.team_h;
                      
                      // FPL FDR Colors
                      let fdrBg = 'bg-[#e7e7e7] text-[#37003c]'; // Default FDR 3 (Grey)
                      if (m.difficulty === 1) fdrBg = 'bg-[#375523] text-white'; // Easy (Green)
                      else if (m.difficulty === 2) fdrBg = 'bg-[#01fc7a] text-[#37003c]'; // Hard (Red)
                      else if (m.difficulty === 4) fdrBg = 'bg-[#ff1b54] text-white'; // Hard (Red)
                      else if (m.difficulty === 5) fdrBg = 'bg-[#80072d] text-white'; // Very Hard (Dark Red)

                      return (
                        <div key={i} className="flex justify-between items-center text-[11px] bg-white/10 px-1.5 py-1 rounded-[3px]">
                          <span className="font-bold flex items-center gap-1">
                            <span className="text-[#a7a6a6] font-normal text-[9px]">{m.event}</span>
                            <span>{getTeamShortName(oppId)}</span>
                            <span className="text-[#a7a6a6] font-normal text-[9px]">({isHome ? 'H' : 'A'})</span>
                          </span>
                          <span className={`font-bold px-1 rounded-xs text-[9px] flex items-center ${fdrBg}`}>
                            FDR {m.difficulty}
                          </span>
                        </div>
                      );
                    })}
                    {next5Fixtures.length === 0 && <span className="text-[#a7a6a6] text-[10px] italic text-center">No data</span>}
                  </div>
                </div>

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