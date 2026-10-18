'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';

const statDisplayOrder = [
  { key: 'goals_scored', label: 'Goals Scored' },
  { key: 'assists', label: 'Assists' },
  { key: 'yellow_cards', label: 'Yellow Cards' },
  { key: 'red_cards', label: 'Red Cards' },
  { key: 'saves', label: 'Saves' },
  { key: 'bonus', label: 'Bonus' },
  { key: 'bps', label: 'BPS' },
  { key: 'defensive_contribution', label: 'Defensive Contribution' },
];

function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (innerRef.current) setHeight(innerRef.current.scrollHeight);
  }, [open]);

  return (
    <div
      style={{ height: open ? height : 0 }}
      className="overflow-hidden transition-[height] duration-200 ease-linear"
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

export default function FixturesClient({ bootstrapData, fixturesData, currentGw }: any) {
  const [expandedFixtureId, setExpandedFixtureId] = useState<number | null>(null);

  // Maps for fast lookups
  const teamMap = new Map<number, string>(
    (bootstrapData.teams || []).map((t: any) => [t.id, t.name])
  );
  const playerMap = new Map<number, any>(
    (bootstrapData.elements || []).map((p: any) => [p.id, p])
  );

  // Group fixtures by formatted date (e.g., "Sat 18 Oct")
  const groupedFixtures: Record<string, any[]> = {};

  (fixturesData || []).forEach((fixture: any) => {
    const kickoff = new Date(fixture.kickoff_time);
    const dateStr = kickoff.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    if (!groupedFixtures[dateStr]) {
      groupedFixtures[dateStr] = [];
    }
    groupedFixtures[dateStr].push(fixture);
  });

  const toggleFixture = (id: number) => {
    setExpandedFixtureId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-2 max-w-175 w-screen min-w-[320px]">
      <div className="bg-white/50 rounded-[3px] px-2.5">
        {/* Page Header */}
        <div className="flex items-center justify-between py-1.5">
          <Link
            href="/"
            className="text-xs bg-white/60 hover:bg-whote text-black px-3 py-1 rounded-[3px] transition"
          >
            &larr; Home
          </Link>
          <h1 className="text-lg font-bold tracking-tight">
            Gameweek {currentGw?.id} Fixtures
          </h1>
          <div className="w-18"></div>
        </div>

        {/* Fixture Groups */}
        <div className="flex flex-col gap-4">
          {Object.entries(groupedFixtures).map(([dateLabel, fixtures]) => (
            <div key={dateLabel} className="flex flex-col">
              {/* Date Header */}
              <div className="text-[15.5px] font-semibold uppercase px-1 text-center">
                {dateLabel}
              </div>

              {/* Fixture Cards */}
              {fixtures.map((fixture) => {
                const homeTeam = teamMap.get(fixture.team_h) || 'Home Team';
                const awayTeam = teamMap.get(fixture.team_a) || 'Away Team';
                const isExpanded = expandedFixtureId === fixture.id;

                const hasStarted = fixture.started && fixture.team_h_score !== null;
                const hasFinished = fixture.finished_provisional;
                const kickoffDate = new Date(fixture.kickoff_time);
                const timeString = kickoffDate.toLocaleTimeString([], {
                  timeZone: 'Europe/London',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={fixture.id}
                    className="overflow-hidden transition border-b border-[#636363] last:border-0 leading-none relative"
                  >
                    {/* Clickable Fixture Header */}
                    <button
                      type="button"
                      onClick={() => toggleFixture(fixture.id)}
                      className="w-full p-3.75 flex items-center justify-between cursor-pointer transition"
                    >
                      {hasStarted && !hasFinished ? (
                        <span className="left-3.5 p-[0_.15rem] bg-white/60 rounded-sm text-[16px] text-[#37003c] font-normal absolute">Live</span>
                      ) : (
                        <span className="text-[16px] text-[#37003c] font-normal"></span>
                      )}
                      <span className="text-[15px] flex-1 text-right pr-3 truncate">{homeTeam}</span>

                      {/* Center Score / Time */}
                      <div className="min-w-18 px-2.5 text-center font-bold text-[23px] text-[#37003c] flex items-center justify-center">
                        {hasStarted ? (
                          `${fixture.team_h_score} - ${fixture.team_a_score}`
                        ) : (
                          <span className="text-[16px] text-[#37003c] font-normal">{timeString}</span>
                        )}
                      </div>

                      <span className="text-[15px] flex-1 text-left pl-3 truncate">{awayTeam}</span>

                      {hasStarted && !hasFinished ? (
                        <span className="right-3.5 p-[0_.15rem] bg-white/60 rounded-sm text-[16px] text-[#37003c] font-normal absolute">{fixture.minutes}'</span>
                      ) : (
                        <span className="text-[16px] text-[#37003c] font-normal"></span>
                      )}
                    </button>

                    {/* Dropdown Stats Section */}
                    <Collapse open={isExpanded}>
                      {hasStarted && fixture.stats?.length > 0 ? (
                        <div className="flex flex-col">
                          {statDisplayOrder.map(({ key, label }) => {
                            const statObj = fixture.stats.find((s: any) => s.identifier === key);
                            let homeStats: any[] = statObj?.h || [];
                            let awayStats: any[] = statObj?.a || [];

                            if (homeStats.length === 0 && awayStats.length === 0) {
                              return null; // Skip stats with no events
                            }

                            // Limit BPS to top 5 players sorted by value descending
                            if (key === 'bps') {
                              homeStats = [...homeStats].sort((a, b) => b.value - a.value).slice(0, 5);
                              awayStats = [...awayStats].sort((a, b) => b.value - a.value).slice(0, 5);
                            }

                            return (
                              <div key={key} className="flex flex-col items-center">
                                {/* Stat Label */}
                                <div className="text-[15px] font-medium">
                                  {label}
                                </div>

                                {/* Two-Column Player Event Row with Vertical Divider */}
                                <div className="divide-x divide-black grid grid-cols-2 grid-rows-[auto] w-full m-[5px_0_20px]">
                                  {/* Home Team Stats (Right-aligned text) */}
                                  <div className="text-right text-[15px] font-light pr-4.25">
                                    {homeStats.map((item, idx) => {
                                      const p = playerMap.get(item.element);
                                      const name = p ? p.web_name : `Player ${item.element}`;
                                      
                                      // Show value if >= 1 for specific stats, otherwise > 1
                                      const showValue = ['saves', 'bonus', 'bps', 'defensive_contribution'].includes(key)
                                        ? item.value >= 1
                                        : item.value > 1;

                                      return (
                                        <div key={idx} className="leading-4.75 m-0.5">
                                          {name}
                                          {showValue && (
                                            <strong className="text-black ml-[6.6px] text-[16px] bg-white/60 px-1 rounded-[3px]">
                                              {item.value}
                                            </strong>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Away Team Stats (Left-aligned text) */}
                                  <div className="text-left text-[15px] font-light pl-4.25">
                                    {awayStats.map((item, idx) => {
                                      const p = playerMap.get(item.element);
                                      const name = p ? p.web_name : `Player ${item.element}`;

                                      const showValue = ['saves', 'bonus', 'bps', 'defensive_contribution'].includes(key)
                                        ? item.value >= 1
                                        : item.value > 1;

                                      return (
                                        <div key={idx} className="leading-4.75 m-0.5">
                                          {showValue && (
                                            <strong className="text-black mr-[6.6px] text-[16px] bg-white/60 px-1 rounded-[3px]">
                                              {item.value}
                                            </strong>
                                          )}
                                          {name}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 italic py-2">
                          {hasStarted ? 'No match stats recorded yet.' : 'Match has not started.'}
                        </div>
                      )}
                    </Collapse>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}