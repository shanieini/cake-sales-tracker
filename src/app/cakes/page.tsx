import type { Metadata } from "next";
import CakeTypesPage from "@/components/CakeTypesPage";
import { cakeStrings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${cakeStrings.cakesPageTitle} · ${cakeStrings.title}`,
};

export default function CakesPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-[radial-gradient(circle_at_top,var(--primary-tint),var(--background)_55%)]">
      <CakeTypesPage />
    </div>
  );
}
