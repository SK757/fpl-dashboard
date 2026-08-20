"use client";

import { useState, useMemo } from "react";
import { PlayerElement, FPLTeam, FPLPosition } from "../types/fpl";

interface CompilerTableProps {
  players: PlayerElement[];
  teams: FPLTeam[];
  positions: FPLPosition[];
}

type SortKey = keyof PlayerElement | "price" | null;

export default function CompilerTable({ players, teams, positions }: CompilerTableProps) {
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState<number | "ALL">("ALL");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });

  // Helper maps for quick lookups
  const teamMap = useMemo(() => {
    const map: Record<number, string> = {};
    teams.forEach((t) => (map[t.id] = t.short_name));
    return map;
  }, [teams]);

  const posMap = useMemo(() => {
    const map: Record<number, string> = {};
    positions.forEach((p) => (map[p.id] = p.singular_name_short));
    return map;
  }, [positions]);

  // Handle sorting logic
  const handleSort = (key: SortKey) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort the players array
  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players.filter((p) => {
      const matchesSearch = p.web_name.toLowerCase().includes(search.toLowerCase());
      const matchesPos = posFilter === "ALL" || p.element_type === posFilter;
      return matchesSearch && matchesPos;
    });
    
    if (sortConfig.key !== null) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof PlayerElement];
        let bValue: any = b[sortConfig.key as keyof PlayerElement];

        // Convert string numbers (like "0.50" for xG) to actual numbers for accurate sorting
        if (typeof aValue === "string" && !isNaN(Number(aValue))) aValue = Number(aValue);
        if (typeof bValue === "string" && !isNaN(Number(bValue))) bValue = Number(bValue);

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [players, search, posFilter, sortConfig]);

  // Reusable header component with sort arrows
  const Th = ({ label, sortKey }: { label: string; sortKey: keyof PlayerElement | "price" }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="p-2 text-left text-xs font-black uppercase tracking-tight cursor-pointer hover:bg-white/40 transition border-b border-black/20 whitespace-nowrap"
    >
      <div className="flex items-center gap-1 justify-center">
        {label}
        {sortConfig.key === sortKey && (
          <span className="text-[10px]">{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
        )}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2 w-full">
      
      {/* Controls: Search and Filter */}
      <div className="shrink-0 flex gap-2">
        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white/60 text-black placeholder-black/50 font-bold px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-black/20"
          suppressHydrationWarning={true}
          spellCheck={false}
          autoComplete="off"
        />
        <select
          value={posFilter}
          onChange={(e) => setPosFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
          className="bg-white/60 text-black font-bold px-3 py-2 rounded-md outline-none cursor-pointer focus:ring-2 focus:ring-black/20 appearance-none"
        >
          <option value="ALL">All Pos</option>
          {positions.map((pos) => (
            <option key={pos.id} value={pos.id}>{pos.singular_name_short}</option>
          ))}
        </select>
      </div>

      {/* Horizontally Scrollable Table Container */}
      <div className="flex-1 min-h-0 overflow-auto rounded-md border border-black/20 bg-white/40 scrollbar-thin">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20 bg-[#00e5ff] shadow-sm">
            <tr>
              {/* Sticky Identity Column */}
              <th className="sticky left-0 z-30 bg-[#00e5ff] p-2 text-left text-xs font-black uppercase tracking-tight border-b border-black/20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Player
              </th>
              
              <Th label="Total Pts" sortKey="total_points" />
              <Th label="Cost" sortKey="now_cost" />
              <Th label="PPG" sortKey="points_per_game" />
              <Th label="Event Pts" sortKey="event_points" />
              <Th label="EP This" sortKey="ep_this" />
              <Th label="EP Next" sortKey="ep_next" />
              <Th label="G" sortKey="goals_scored" />
              <Th label="A" sortKey="assists" />
              <Th label="CS" sortKey="clean_sheets" />
              <Th label="Cost Chg" sortKey="cost_change_start" />
              <Th label="Sel %" sortKey="selected_by_percent" />
              <Th label="Mins" sortKey="minutes" />
              
              <th className="p-2 text-xs font-black uppercase tracking-tight border-b border-black/20 whitespace-nowrap">
                <div className="flex items-center justify-center">News</div>
              </th>
              <Th label="Tr In (GW)" sortKey="transfers_in_event" />
              <Th label="Tr Out (GW)" sortKey="transfers_out_event" />
              <Th label="GC" sortKey="goals_conceded" />
              <Th label="OG" sortKey="own_goals" />
              <Th label="Pen Saved" sortKey="penalties_saved" />
              <Th label="Pen Missed" sortKey="penalties_missed" />
              <Th label="YC" sortKey="yellow_cards" />
              <Th label="RC" sortKey="red_cards" />
              <Th label="Saves" sortKey="saves" />
              
              <Th label="Bonus" sortKey="bonus" />
              <Th label="BPS" sortKey="bps" />
              <Th label="Influence" sortKey="influence" />
              <Th label="Creativity" sortKey="creativity" />
              <Th label="Threat" sortKey="threat" />
              <Th label="ICT" sortKey="ict_index" />
              <Th label="CBI" sortKey="clearances_blocks_interceptions" />
              <Th label="Recov" sortKey="recoveries" />
              <Th label="Tackles" sortKey="tackles" />
              <Th label="Def Contrib" sortKey="defensive_contribution" />
              <Th label="Def/90" sortKey="defensive_contribution_per_90" />
              <Th label="xG" sortKey="expected_goals" />
              <Th label="xA" sortKey="expected_assists" />
              <Th label="xGI" sortKey="expected_goal_involvements" />
              <Th label="Form" sortKey="form" />
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPlayers.map((p) => (
              <tr key={p.id} className="border-b border-black/10 hover:bg-white/30 transition text-center">
                
                {/* Sticky Identity Column */}
                <td className="sticky left-0 z-10 bg-[#7df1ff] p-2 border-r border-black/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] leading-tight">
                  <div className="text-[1rem] font-extrabold text-black max-w-30 sm:max-w-50">
                    {p.web_name}
                  </div>
                  <div className="text-[10px] font-bold text-black/60 uppercase">
                    {teamMap[p.team]} • {posMap[p.element_type]}
                  </div>
                </td>
                
                <td className="p-2 font-black text-black whitespace-nowrap">{p.total_points}</td>
                <td className="p-2 font-bold whitespace-nowrap">£{(p.now_cost / 10).toFixed(1)}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.points_per_game}</td>
                <td className="p-2 font-bold whitespace-nowrap">{p.event_points}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.ep_this}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.ep_next}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.goals_scored}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.assists}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.clean_sheets}</td>
                <td className="p-2 font-bold whitespace-nowrap">
                  {Number(p.cost_change_start) < 0 ? "-" : ""}£{(Number(p.cost_change_start) / 10).toFixed(1)}
                </td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.selected_by_percent}%</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.minutes}</td>
                
                {/* News*/}
                <td className="p-2 font-semibold max-w-37.5 leading-[1.15]">
                  {p.news}
                </td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.transfers_in_event.toLocaleString()}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.transfers_out_event.toLocaleString()}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.goals_conceded}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.own_goals}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.penalties_saved}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.penalties_missed}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.yellow_cards}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.red_cards}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.saves}</td>
                
                <td className="p-2 font-semibold whitespace-nowrap">{p.bonus}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.bps}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.influence}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.creativity}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.threat}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.ict_index}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.clearances_blocks_interceptions}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.recoveries}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.tackles}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.defensive_contribution}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.defensive_contribution_per_90}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.expected_goals}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.expected_assists}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.expected_goal_involvements}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{p.form}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedPlayers.length === 0 && (
          <div className="p-4 text-center font-bold text-black/50">
            No players found matching your criteria.
          </div>
        )}
      </div>
      
    </div>
  );
}