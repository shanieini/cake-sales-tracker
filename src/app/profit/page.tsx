import type { Metadata } from "next";
import ProfitPage from "@/components/ProfitPage";
import { cakeStrings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${cakeStrings.profitPageTitle} · ${cakeStrings.title}`,
};

export default function Profit() {
  return (
    <div className="flex flex-1 flex-col items-center bg-[radial-gradient(circle_at_top,var(--primary-tint),var(--background)_55%)]">
      <ProfitPage />
    </div>
  );
}
