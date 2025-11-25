import Image from "next/image";
import GameSearch from "@/components/game-search";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-4xl">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-2">Welcome to GamesLedger</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your personal game tracking companion.
          </p>
        </div>

        <GameSearch />
      </main>
    </div>
  );
}
