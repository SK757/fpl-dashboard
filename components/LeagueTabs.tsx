"use client";

import { useState } from 'react';
import { LeagueStandingsData } from '../types/fpl';

// Helper function to capitalize names
function formatName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function LeagueTabs({ leaguesData }: { leaguesData: LeagueStandingsData[] }) {
  // Find specific leagues by their exact names
  const navigators = leaguesData.find((l) => l.league?.name === "The Navigators");
  const moneyLeague = leaguesData.find((l) => l.league?.name === "Backstreet Moyes");
  const taskers = leaguesData.find((l) => l.league?.name === "Just for Fun");
  const exTaskers = leaguesData.find((l) => l.league?.name === "Ex-Taskers Fantasy League");

  // Group the right-side leagues and set the default active one
  const rightLeagues = [moneyLeague, taskers, exTaskers].filter((l) => l !== undefined) as LeagueStandingsData[];
  const [activeRightId, setActiveRightId] = useState<number | undefined>(rightLeagues[0]?.league?.id);

  const activeRightLeague = rightLeagues.find((l) => l.league.id === activeRightId);

  // Reusable rendering function for the scrollable list
  const renderLeagueStandings = (leagueData?: LeagueStandingsData) => {
    if (!leagueData) return <p className="text-xs text-center text-black/60 py-2">League not found.</p>;
    // 1. Get existing standings
    const standingsList = leagueData.standings?.results || [];
    // 2. Map new entries so they match the standard display format
    const newEntriesList = (leagueData.new_entries?.results || []).map((entry) => ({
      id: entry.entry,
      player_name: `${entry.player_first_name} ${entry.player_last_name}`,
      entry_name: entry.entry_name,
      total: 'New',
      event_total: 0,
      rank: 0,
    }));
    
    // 3. Combine both lists
    const combinedResults = [...standingsList, ...newEntriesList];

    return (
      // 1. flex-1 min-h-0 forces the list to take exactly the available height
      <div className="space-y-1 text-sm font-medium flex-1 overflow-y-auto min-h-0 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {combinedResults.length > 0 ? (
          combinedResults.map((row) => (
            <div key={row.id} className="flex justify-between items-center border-b border-black/20 pb-1 pt-0.5 last:border-0">
              {/* Player Name */}
              <span className="truncate pr-2 font-medium">
                {formatName(row.player_name)}
              </span>
              {/* Player Score */}
              <span className="bg-white/60 text-xs font-bold px-2 py-0.5 rounded-[3px] min-w-11.25 text-center">
                {row.total}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-center text-black/60 py-2">No members found.</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 h-full min-h-0 grid grid-cols-2 gap-2">
      
      {/* LEFT COLUMN: The Navigators (Always Visible) */}
      <div className="bg-white/50 rounded-[3px] p-3 flex flex-col min-h-0">
        <h3 className="shrink-0 text-base font-semibold text-center text-black py-1.25 truncate">
          {navigators?.league?.name || 'The Navigators'}
        </h3>
        {renderLeagueStandings(navigators)}
      </div>

      {/* RIGHT COLUMN: Toggleable Leagues */}
      <div className="bg-white/50 rounded-[3px] p-3 flex flex-col min-h-0">
        
        {/* Toggle Buttons */}
        <div className="shrink-0 flex gap-1 py-1 justify-center">
          {rightLeagues.map((l) => (
            <button
              key={l.league.id}
              onClick={() => setActiveRightId(l.league.id)}
              className={`px-2 py-1 text-xs font-semibold rounded border flex-1 transition-colors ${
                activeRightId === l.league.id
                  ? 'bg-black text-[#00e5ff] border-black'
                  : 'bg-[#eafbff] text-black border-black/20 hover:bg-white'
              }`}
            >
              {/* Shortens names so buttons fit side-by-side nicely */}
              {l.league.name === 'Ex-Taskers Fantasy League' 
                ? 'Ex-Taskers' 
                : l.league.name === 'Just for Fun' 
                  ? 'Taskers' 
                  : 'Money'}
            </button>
          ))}
        </div>
        
        {/* Render the actively selected league */}
        {renderLeagueStandings(activeRightLeague)}
      </div>
      
    </div>
  );
}