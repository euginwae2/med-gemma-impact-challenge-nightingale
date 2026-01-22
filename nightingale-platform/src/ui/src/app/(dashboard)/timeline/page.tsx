import { Filter } from "lucide-react";
import { Button } from "@/components/core/primitives/Button";

export default function TimelinePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-h2 font-bold text-gray-900">My Health Timeline</h1>
        <Button variant="secondary" size="sm" icon={<Filter size={16} />}>
          Filter
        </Button>
      </div>

      <div className="relative border-l-2 border-gray-200 pl-8 space-y-10">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="relative">
            {/* Timeline Node */}
            <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-primary-500 shadow-sm" />

            {/* Event Card */}
            <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-1 hover:shadow-2 transition-shadow">
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Oct 12, 2023
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">
                Annual Physical Exam
              </h3>
              <p className="text-gray-600 text-sm mt-2">
                Dr. Emily Smith • General Practice
              </p>

              <div className="mt-4 flex gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  Visit Summary
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  Labs Normal
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
