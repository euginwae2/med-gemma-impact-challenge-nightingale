import { Mic, Calendar, Activity } from "lucide-react";
import { Button } from "@/components/core/primitives/Button";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-h2 font-bold text-gray-900">
            Good Morning, Sarah
          </h1>
          <p className="text-gray-500">Here is your daily health snapshot.</p>
        </div>
        <div className="flex gap-3">
          {/* CORRECT USAGE: Passing element <Mic /> not function Mic */}
          <Button variant="secondary" icon={<Mic size={18} />}>
            New Check-In
          </Button>
          <Button variant="primary" icon={<Calendar size={18} />}>
            Schedule
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Health Score",
            value: "85",
            trend: "Stable",
            color: "text-green-600",
          },
          {
            label: "Next Visit",
            value: "Oct 24",
            trend: "Cardiology",
            color: "text-blue-600",
          },
          {
            label: "Active Meds",
            value: "4",
            trend: "1 Refill Due",
            color: "text-orange-600",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-gray-100 shadow-1 bg-white"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
              <Activity className="text-gray-300" size={20} />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className={`text-sm font-medium ${stat.color}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Proactive Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 items-start">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
          <Calendar size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-amber-900">
            Appointment Action Required
          </h3>
          <p className="text-amber-800 text-sm mt-1">
            Please upload your updated insurance card before your visit on Oct
            24.
          </p>
        </div>
      </div>
    </div>
  );
}
