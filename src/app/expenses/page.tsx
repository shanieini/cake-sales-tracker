import type { Metadata } from "next";
import ExpenseTracker from "@/components/ExpenseTracker";
import { cakeStrings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `${cakeStrings.expensesTitle} · ${cakeStrings.title}`,
};

export default function ExpensesPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-[radial-gradient(circle_at_top,var(--primary-tint),var(--background)_55%)]">
      <ExpenseTracker />
    </div>
  );
}
