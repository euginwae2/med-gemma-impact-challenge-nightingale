import { useState } from 'react';
import { 
  FileText, 
  TestTube, 
  Stethoscope, 
  DollarSign, 
  Filter, 
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

type EventType = 'lab' | 'visit' | 'document' | 'insurance';
type FilterType = 'all' | EventType;

interface TimelineEvent {
  id: number;
  type: EventType;
  title: string;
  date: string;
  description: string;
  status?: 'urgent' | 'completed' | 'info';
}

export function TimelinePage() {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const events: TimelineEvent[] = [
    {
      id: 1,
      type: 'lab',
      title: 'Lab Results - Complete Blood Count',
      date: 'Jan 16, 2026',
      description: 'All values within normal range. Hemoglobin: 14.2 g/dL',
      status: 'completed'
    },
    {
      id: 2,
      type: 'visit',
      title: 'Doctor Visit - Annual Physical',
      date: 'Jan 10, 2026',
      description: 'Annual physical examination with Dr. Sarah Johnson. Blood pressure: 120/80',
      status: 'completed'
    },
    {
      id: 3,
      type: 'insurance',
      title: 'Insurance EOB - Annual Physical',
      date: 'Jan 5, 2026',
      description: 'Explanation of Benefits received. Covered amount: $150. Your responsibility: $25 copay',
      status: 'info'
    },
    {
      id: 4,
      type: 'document',
      title: 'Prior Authorization Needed',
      date: 'Jan 3, 2026',
      description: 'MRI scan requires prior authorization. Estimated processing time: 3-5 business days',
      status: 'urgent'
    },
    {
      id: 5,
      type: 'lab',
      title: 'Lab Results - Lipid Panel',
      date: 'Dec 20, 2025',
      description: 'Cholesterol levels reviewed. Total cholesterol: 185 mg/dL',
      status: 'completed'
    },
  ];

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.type === filter);

  const getIcon = (type: EventType) => {
    switch (type) {
      case 'lab':
        return <TestTube className="w-5 h-5" />;
      case 'visit':
        return <Stethoscope className="w-5 h-5" />;
      case 'insurance':
        return <DollarSign className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-error" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'info':
        return <Info className="w-4 h-4 text-primary" />;
      default:
        return null;
    }
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Labs', value: 'lab' },
    { label: 'Visits', value: 'visit' },
    { label: 'Documents', value: 'document' },
    { label: 'Insurance', value: 'insurance' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">My Health Timeline</h2>
        <p className="text-muted-foreground">
          A longitudinal view of your care journey with AI-highlighted critical events
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface text-foreground border border-border hover:bg-background'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

        {/* Events */}
        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="relative pl-16">
              {/* Icon Circle */}
              <div className="absolute left-0 w-12 h-12 rounded-full bg-surface border-2 border-primary flex items-center justify-center text-primary shadow-sm">
                {getIcon(event.type)}
              </div>

              {/* Event Card */}
              <div className="bg-surface rounded-xl p-5 border border-border hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-foreground">{event.title}</h3>
                      {event.status && getStatusIcon(event.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{event.date}</p>
                    <p className="text-foreground">{event.description}</p>
                  </div>
                  <button className="text-primary text-sm font-medium hover:underline flex-shrink-0">
                    Explain This
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
