type TabDescriptionProps = {
  title: string;
  type: "home" | "chat" | "map" | "routes" | "settings";
};

export default function TabDescription({ title, type }: TabDescriptionProps) {
  const descriptions = {
    home:
      "Explore Kazakhstan through practical travel experiences and discover hidden destinations.",
    chat:
      "Use a scenario-based travel assistant and build personalized journeys across Kazakhstan.",
    map:
      "Interactive map of Kazakhstan with destinations, routes, and hidden gems.",
    routes:
      "Generate optimized travel routes based on your budget, time, and interests.",
    settings:
      "Customize your MangystauTrails experience and preferences."
  };

  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>

      <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
        {descriptions[type]}
      </p>
    </div>
  );
}
