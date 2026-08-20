import Link from "next/link";
import { BootstrapData } from "../../types/fpl";
import CompilerTable from "@/components/CompilerTable";

async function getCompilerData(): Promise<BootstrapData | null> {
  try {
    const res = await fetch("http://localhost:3000/api/fpl/bootstrap", {
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return null;
  }
}

export default async function CompilerPage() {
  const data = await getCompilerData();

  const players = data?.elements || [];
  const teams = data?.teams || [];
  const positions = data?.element_types || [];

  return (
    <div className="h-dvh overflow-hidden bg-[#00e5ff] text-black py-4 px-2 w-screen max-w-379 min-w-[320px] flex flex-col gap-3">
      
      {/* Top Header with Back Button */}
      <div className="shrink-0 flex items-center justify-between">
        <Link 
          href="/" 
          className="bg-white/50 hover:bg-white/80 transition text-black font-extrabold text-xs px-3 py-2 rounded-md"
        >
          &larr; Back
        </Link>
        <h1 className="text-3xl font-medium tracking-tight pr-4">
          Compiler
        </h1>
        <div className="w-10" /> {/* Empty div to balance flex spacing */}
      </div>

      {/* Main Content Area */}
      {players.length > 0 ? (
        <div className="flex-1 min-h-0 flex flex-col">
          <CompilerTable players={players} teams={teams} positions={positions} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white/50 rounded-md font-bold text-black/60">
          Failed to load player data.
        </div>
      )}

    </div>
  );
}