export const HealthScoreProgress = ({ score }: { score: number }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-surface-variant/20"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 0.5s ease",
          }}
          className="text-primary"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-h2 font-bold text-text">{score}</span>
        <span className="text-caption uppercase tracking-wider">Index</span>
      </div>
    </div>
  );
};
