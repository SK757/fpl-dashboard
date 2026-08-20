export interface PlayerElement {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number;
  total_points: number;
  now_cost: number;
  points_per_game: string;
  event_points: number;
  ep_this: string;
  ep_next: string;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  cost_change_start: string;
  selected_by_percent: string;
  minutes: number;
  news: string;
  transfers_in_event: number;
  transfers_out_event: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  clearances_blocks_interceptions: number;
  recoveries: number;
  tackles: number;
  defensive_contribution: number;
  defensive_contribution_per_90: string;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  form: string;
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
}

export interface FPLPosition {
  id: number;
  singular_name_short: string;
}

export interface GameweekEvent {
  id: number;
  name: string;
  deadline_time: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
  average_entry_score?: number;
  highest_score?: number;
  top_element_info?: {
    id: number;
    points: number;
  } | null;
}

export interface BootstrapData {
  events: GameweekEvent[];
  elements?: PlayerElement[];
  teams?: FPLTeam[];
  element_types?: FPLPosition[];
}

export interface MiniLeague {
  id: number;
  name: string;
  entry_rank: number;
  entry_last_rank: number;
}

export interface ManagerData {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_event_points: number;
  summary_overall_rank: number;
  leagues: {
    classic: MiniLeague[];
  };
}

export interface NewEntryResult {
  entry: number;
  entry_name: string;
  joined_time: string;
  player_first_name: string;
  player_last_name: string;
}

export interface LeagueStandingResult {
  id: number;
  event_total: number;
  player_name: string;
  rank: number;
  entry_name: string;
  total: number;
}

export interface LeagueStandingsData {
  league: {
    id: number;
    name: string;
  };
  new_entries?: {
    results: NewEntryResult[];
  };
  standings: {
    results: LeagueStandingResult[];
  };
}