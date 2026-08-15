import type { Metadata } from "next";
import SalesReportPage from "@/components/SalesReportPage";
import { cakeStrings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${cakeStrings.reportTitle} · ${cakeStrings.title}`,
};

export default function ReportPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-[radial-gradient(circle_at_top,var(--primary-tint),var(--background)_55%)]">
      <SalesReportPage />
    </div>
  );
}
