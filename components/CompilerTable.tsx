"use client";

import { useState, useMemo } from "react";
import { PlayerElement, FPLTeam, FPLPosition } from "../types/fpl";

interface CompilerTableProps {
  players: PlayerElement[];
  teams: FPLTeam[];
  positions: FPLPosition[];
}

type SortKey = keyof PlayerElement | "price" | null;

const BASIC_COLUMNS = [
  "total_points",
  "now_cost",
  "points_per_game",
  "event_points",
  "ep_next",
  "goals_scored",
  "assists",
  "clean_sheets",
  "ict_index",
  "defensive_contribution",
];

export default function CompilerTable({ players, teams, positions }: CompilerTableProps) {
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState<number | "ALL">("ALL");
  const [hideTransferred, setHideTransferred] = useState(true);
  const [isCoreViewOnly, setIsCoreViewOnly] = useState(true);
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

  const isVisible = (colId: string) => !isCoreViewOnly || BASIC_COLUMNS.includes(colId);

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
      const matchesStatus = hideTransferred ? p.status !== "u" : true;
      return matchesSearch && matchesPos && matchesStatus;
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
  }, [players, search, posFilter, sortConfig, hideTransferred]);

  // Reusable header component with sort arrows
  const Th = ({ label, sortKey }: { label: string; sortKey: keyof PlayerElement }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="bg-[#00e5ff] p-2 text-xs font-black uppercase tracking-tight cursor-pointer hover:brightness-105 transition border-r border-b border-black/20 whitespace-nowrap"
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
      
      {/* Controls: Toggle, Search, Position, Transferred */}
      <div className="shrink-0 flex flex-wrap gap-2">
        <button
          onClick={() => setIsCoreViewOnly(!isCoreViewOnly)}
          className="bg-white/60 hover:bg-white/80 font-bold px-4 py-2 rounded-md outline-none cursor-pointer transition flex items-center gap-2"
        >
          {isCoreViewOnly ? "Show Advanced" : "Show Basic"}
        </button>
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
          className="bg-white/60 hover:bg-white/80 font-bold px-3 py-2 rounded-md outline-none cursor-pointer focus:ring-2 focus:ring-black/20 appearance-none"
        >
          <option value="ALL">All Pos</option>
          {positions.map((pos) => (
            <option key={pos.id} value={pos.id}>{pos.singular_name_short}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 bg-white/60 text-black font-bold px-3 py-2 rounded-md cursor-pointer hover:bg-white/80 transition select-none focus-within:ring-2 focus-within:ring-black/20">
          <input
            type="checkbox"
            checked={hideTransferred}
            onChange={(e) => setHideTransferred(e.target.checked)}
            className="w-4 h-4 cursor-pointer accent-black"
          />
          <span className="text-xs uppercase tracking-tight">Hide Loaned/Left</span>
        </label>
      </div>

      {/* Horizontally Scrollable Table Container */}
      <div className="flex-1 min-h-0 overflow-auto rounded-md border border-black/20 bg-white/40 scrollbar-thin">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead className="sticky top-0 z-20 bg-[#00e5ff] shadow-sm">
            <tr>
              {/* Sticky Identity Column */}
              <th className="sticky left-0 z-30 bg-[#00e5ff] p-2 text-xs font-black uppercase tracking-tight border-b border-r border-black/20">
                Player
              </th>
              {isVisible("total_points") && <Th label="Total Pts" sortKey="total_points" />}
              {isVisible("now_cost") && <Th label="Price" sortKey="now_cost" />}
              {isVisible("points_per_game") && <Th label="PPG" sortKey="points_per_game" />}
              {isVisible("event_points") && <Th label="GW Pts" sortKey="event_points" />}
              {isVisible("ep_this") && <Th label="EX This GW" sortKey="ep_this" />}
              {isVisible("ep_next") && <Th label="EX Next GW" sortKey="ep_next" />}
              {isVisible("goals_scored") && <Th label="G" sortKey="goals_scored" />}
              {isVisible("assists") && <Th label="A" sortKey="assists" />}
              {isVisible("clean_sheets") && <Th label="CS" sortKey="clean_sheets" />}
              {isVisible("cost_change_start") && <Th label="Price Change" sortKey="cost_change_start" />}
              {isVisible("selected_by_percent") && <Th label="Sel %" sortKey="selected_by_percent" />}
              {isVisible("minutes") && <Th label="Mins" sortKey="minutes" />}
              {isVisible("news") && (
                <th className="bg-[#00e5ff] p-2 text-xs font-black uppercase tracking-tight hover:brightness-105 transition border-r border-b border-black/20 whitespace-nowrap">
                  <div className="flex items-center justify-center">News</div>
                </th>
              )}
              {isVisible("transfers_in_event") && <Th label="Tr In" sortKey="transfers_in_event" />}
              {isVisible("transfers_out_event") && <Th label="Tr Out" sortKey="transfers_out_event" />}
              {isVisible("goals_conceded") && <Th label="GC" sortKey="goals_conceded" />}
              {isVisible("own_goals") && <Th label="OG" sortKey="own_goals" />}
              {isVisible("penalties_saved") && <Th label="Pens Saved" sortKey="penalties_saved" />}
              {isVisible("penalties_missed") && <Th label="Pens Missed" sortKey="penalties_missed" />}
              {isVisible("yellow_cards") && <Th label="YC" sortKey="yellow_cards" />}
              {isVisible("red_cards") && <Th label="RC" sortKey="red_cards" />}
              {isVisible("saves") && <Th label="Saves" sortKey="saves" />}
              {isVisible("bonus") && <Th label="Bonus" sortKey="bonus" />}
              {isVisible("bps") && <Th label="BPS" sortKey="bps" />}
              {isVisible("influence") && <Th label="Influence" sortKey="influence" />}
              {isVisible("creativity") && <Th label="Creativity" sortKey="creativity" />}
              {isVisible("threat") && <Th label="Threat" sortKey="threat" />}
              {isVisible("ict_index") && <Th label="ICT" sortKey="ict_index" />}
              {isVisible("clearances_blocks_interceptions") && <Th label="Clr/Blk/Int" sortKey="clearances_blocks_interceptions" />}
              {isVisible("recoveries") && <Th label="Recov" sortKey="recoveries" />}
              {isVisible("tackles") && <Th label="Tackles" sortKey="tackles" />}
              {isVisible("defensive_contribution") && <Th label="DEFCON" sortKey="defensive_contribution" />}
              {isVisible("defensive_contribution_per_90") && <Th label="Def/90" sortKey="defensive_contribution_per_90" />}
              {isVisible("expected_goals") && <Th label="xG" sortKey="expected_goals" />}
              {isVisible("expected_assists") && <Th label="xA" sortKey="expected_assists" />}
              {isVisible("expected_goal_involvements") && <Th label="xGI" sortKey="expected_goal_involvements" />}
              {isVisible("form") && <Th label="Form" sortKey="form" />}
            </tr>
          </thead>
          <tbody>
            
            {filteredAndSortedPlayers.map((p) => {
              
              const isRuledOut = p.chance_of_playing_next_round === 0 && p.chance_of_playing_next_round !== null;
              return (
                <tr key={p.id} className={`[&>td]:border-b [&>td]:border-white transition text-center 
                  ${isRuledOut ? "bg-[#c0020d] hover:bg-[#c0020d] text-white"
                    : p.chance_of_playing_next_round === 25 ? "bg-[#d44401] hover:bg-[#d44401] text-white"
                    : p.chance_of_playing_next_round === 50 ? "bg-[#ffab1b] hover:bg-[#ffab1b] text-black"
                    : p.chance_of_playing_next_round === 75 ? "bg-[#ffe65b] hover:bg-[#ffe65b] text-black"
                    : "hover:bg-white/30"}`}>
                      
                  {/* Sticky Identity Column */}
                  <td className={`sticky left-0 z-10 p-2 leading-tight
                    ${isRuledOut ? "bg-[#c0020d] hover:bg-[#c0020d] text-white"
                      : p.chance_of_playing_next_round === 25 ? "bg-[#d44401] hover:bg-[#d44401] text-white"
                      : p.chance_of_playing_next_round === 50 ? "bg-[#ffab1b] hover:bg-[#ffab1b] text-black"
                      : p.chance_of_playing_next_round === 75 ? "bg-[#ffe65b] hover:bg-[#ffe65b] text-black"
                      : "bg-[#94F3FF]"}`}>
                    <div className="text-[1rem] font-extrabold max-w-30 sm:max-w-50">
                      {p.web_name}
                    </div>
                    <div className="text-[10px] font-bold uppercase">
                      {teamMap[p.team]} • {posMap[p.element_type]}
                    </div>
                  </td>
                  {isVisible("total_points") && <td className="p-2 font-black whitespace-nowrap">{p.total_points}</td>}
                  {isVisible("now_cost") && <td className="p-2 font-bold whitespace-nowrap">£{(p.now_cost / 10).toFixed(1)}</td>}
                  {isVisible("points_per_game") && <td className="p-2 font-semibold whitespace-nowrap">{p.points_per_game}</td>}
                  {isVisible("event_points") && <td className="p-2 font-bold whitespace-nowrap">{p.event_points}</td>}
                  {isVisible("ep_this") && <td className="p-2 font-semibold whitespace-nowrap">{p.ep_this}</td>}
                  {isVisible("ep_next") && <td className="p-2 font-semibold whitespace-nowrap">{p.ep_next}</td>}
                  {isVisible("goals_scored") && <td className="p-2 font-semibold whitespace-nowrap">{p.goals_scored}</td>}
                  {isVisible("assists") && <td className="p-2 font-semibold whitespace-nowrap">{p.assists}</td>}
                  {isVisible("clean_sheets") && <td className="p-2 font-semibold whitespace-nowrap">{p.clean_sheets}</td>}
                  {isVisible("cost_change_start") && (
                    <td className="p-2 font-bold whitespace-nowrap">
                      {Number(p.cost_change_start) > 0 ? "+" : ""}
                      {Number(p.cost_change_start) < 0 ? "-" : ""}
                      £{(Math.abs(Number(p.cost_change_start)) / 10).toFixed(1)}
                    </td>
                  )}
                  {isVisible("selected_by_percent") && <td className="p-2 font-semibold whitespace-nowrap">{p.selected_by_percent}%</td>}
                  {isVisible("minutes") && <td className="p-2 font-semibold whitespace-nowrap">{p.minutes}</td>}
                  
                  {/* News*/}
                  {isVisible("news") && <td className="p-2 font-semibold max-w-37.5 leading-[1.15]">{p.news}</td>}
                  {isVisible("transfers_in_event") && <td className="p-2 font-semibold whitespace-nowrap">{p.transfers_in_event.toLocaleString()}</td>}
                  {isVisible("transfers_out_event") && <td className="p-2 font-semibold whitespace-nowrap">{p.transfers_out_event.toLocaleString()}</td>}
                  {isVisible("goals_conceded") && <td className="p-2 font-semibold whitespace-nowrap">{p.goals_conceded}</td>}
                  {isVisible("own_goals") && <td className="p-2 font-semibold whitespace-nowrap">{p.own_goals}</td>}
                  {isVisible("penalties_saved") && <td className="p-2 font-semibold whitespace-nowrap">{p.penalties_saved}</td>}
                  {isVisible("penalties_missed") && <td className="p-2 font-semibold whitespace-nowrap">{p.penalties_missed}</td>}
                  {isVisible("yellow_cards") && <td className="p-2 font-semibold whitespace-nowrap">{p.yellow_cards}</td>}
                  {isVisible("red_cards") && <td className="p-2 font-semibold whitespace-nowrap">{p.red_cards}</td>}
                  {isVisible("saves") && <td className="p-2 font-semibold whitespace-nowrap">{p.saves}</td>}
                  
                  {isVisible("bonus") && <td className="p-2 font-semibold whitespace-nowrap">{p.bonus}</td>}
                  {isVisible("bps") && <td className="p-2 font-semibold whitespace-nowrap">{p.bps}</td>}
                  {isVisible("influence") && <td className="p-2 font-semibold whitespace-nowrap">{p.influence}</td>}
                  {isVisible("creativity") && <td className="p-2 font-semibold whitespace-nowrap">{p.creativity}</td>}
                  {isVisible("threat") && <td className="p-2 font-semibold whitespace-nowrap">{p.threat}</td>}
                  {isVisible("ict_index") && <td className="p-2 font-semibold whitespace-nowrap">{p.ict_index}</td>}
                  {isVisible("clearances_blocks_interceptions") && <td className="p-2 font-semibold whitespace-nowrap">{p.clearances_blocks_interceptions}</td>}
                  {isVisible("recoveries") && <td className="p-2 font-semibold whitespace-nowrap">{p.recoveries}</td>}
                  {isVisible("tackles") && <td className="p-2 font-semibold whitespace-nowrap">{p.tackles}</td>}
                  {isVisible("defensive_contribution") && <td className="p-2 font-semibold whitespace-nowrap">{p.defensive_contribution}</td>}
                  {isVisible("defensive_contribution_per_90") && <td className="p-2 font-semibold whitespace-nowrap">{p.defensive_contribution_per_90}</td>}
                  {isVisible("expected_goals") && <td className="p-2 font-semibold whitespace-nowrap">{p.expected_goals}</td>}
                  {isVisible("expected_assists") && <td className="p-2 font-semibold whitespace-nowrap">{p.expected_assists}</td>}
                  {isVisible("expected_goal_involvements") && <td className="p-2 font-semibold whitespace-nowrap">{p.expected_goal_involvements}</td>}
                  {isVisible("form") && <td className="p-2 font-semibold whitespace-nowrap">{p.form}</td>}
                </tr>
              );
            })}
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