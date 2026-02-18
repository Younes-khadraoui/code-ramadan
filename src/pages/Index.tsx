import { useState } from "react";
import ChallengeTable from "@/components/ChallengeTable";

const tabs = [
  { key: "meli" as const, label: "Meli" },
  { key: "younes" as const, label: "Younes" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<"meli" | "younes">("meli");

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-full mx-auto">
        <h1 className="text-lg font-semibold text-foreground/80 mb-4 font-mono tracking-tight">
          🌙 Ramadan 30-Day Challenge
        </h1>

        <div className="flex gap-1 mb-4">
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            const colorClass =
              t.key === "meli"
                ? isActive
                  ? "bg-tab-meli text-background"
                  : "text-tab-meli hover:bg-tab-meli-soft"
                : isActive
                ? "bg-tab-younes text-background"
                : "text-tab-younes hover:bg-tab-younes-soft";
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${colorClass}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <ChallengeTable tab={activeTab} />
      </div>
    </div>
  );
};

export default Index;
