import CakeTracker from "@/components/CakeTracker";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-[radial-gradient(circle_at_top,var(--primary-tint),var(--background)_55%)]">
      <CakeTracker />
    </div>
  );
}
