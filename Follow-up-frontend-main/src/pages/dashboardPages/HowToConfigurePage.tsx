import HowItWorksSection from "@/components/landing/HowItWorksSection";

export default function HowToConfigurePage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-gray-50/50 p-6 md:p-10">
      <HowItWorksSection id="how-to-configure" showSetupAndTracking linksEnabled />
    </div>
  );
}
