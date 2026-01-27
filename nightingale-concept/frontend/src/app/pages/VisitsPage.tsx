import { Calendar, Clock, MapPin, User, FileText, DollarSign, Plus, Video } from 'lucide-react';

export function VisitsPage() {
  const upcomingVisits = [
    {
      id: 1,
      type: 'Annual Physical',
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Primary Care',
      date: 'January 25, 2026',
      time: '10:00 AM',
      location: 'Main Street Medical Center',
      visitType: 'In-person',
      estimatedCost: '$25 copay',
    },
    {
      id: 2,
      type: 'Follow-up - Physical Therapy',
      doctor: 'Dr. Michael Chen',
      specialty: 'Physical Therapy',
      date: 'January 28, 2026',
      time: '2:30 PM',
      location: 'Wellness Therapy Center',
      visitType: 'In-person',
      estimatedCost: '$40 copay',
    },
  ];

  const pastVisits = [
    {
      id: 1,
      type: 'Annual Physical',
      doctor: 'Dr. Sarah Johnson',
      date: 'January 10, 2026',
      summary: 'Routine annual physical examination. All vital signs normal.',
      hasSummary: true,
    },
    {
      id: 2,
      type: 'Lab Work',
      doctor: 'Medical Laboratory',
      date: 'January 16, 2026',
      summary: 'Complete blood count and lipid panel. Results within normal range.',
      hasSummary: true,
    },
  ];

  const prepQuestions = [
    'What are my current blood pressure readings?',
    'Should I be concerned about my cholesterol levels?',
    'Are there any lifestyle changes I should consider?',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Visits & Appointments</h2>
        <p className="text-muted-foreground">
          Manage your appointments and access visit summaries
        </p>
      </div>

      {/* Upcoming Appointments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Upcoming Appointments</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Schedule Visit
          </button>
        </div>
        <div className="space-y-4">
          {upcomingVisits.map((visit) => (
            <div key={visit.id} className="bg-surface rounded-xl p-6 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-foreground text-lg mb-1">{visit.type}</h4>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {visit.doctor} • {visit.specialty}
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1">
                  {visit.visitType === 'Virtual' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  {visit.visitType}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{visit.date}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{visit.time}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span>{visit.estimatedCost}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{visit.location}</span>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Prepare for Visit
                </button>
                <button className="px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-background transition-colors">
                  Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pre-Visit Preparation */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-3">Prepare for Your Visit</h3>
        <p className="text-muted-foreground mb-4">
          Get ready for your upcoming appointment with Dr. Johnson
        </p>
        
        <div className="space-y-3">
          <div className="bg-surface rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Suggested Questions
            </h4>
            <ul className="space-y-2">
              {prepQuestions.map((question, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {question}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Recent Records</h4>
            <p className="text-sm text-muted-foreground">
              Your recent lab results and previous visit notes are ready for review
            </p>
          </div>

          <div className="bg-surface rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Estimated Cost
            </h4>
            <p className="text-sm text-muted-foreground">
              Your copay: <span className="font-bold text-foreground">$25</span> • No prior authorization required
            </p>
          </div>
        </div>
      </section>

      {/* Past Visits */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">Past Visits & Summaries</h3>
        <div className="space-y-3">
          {pastVisits.map((visit) => (
            <div key={visit.id} className="bg-surface rounded-xl p-5 border border-border hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-foreground">{visit.type}</h4>
                    {visit.hasSummary && (
                      <span className="px-2 py-0.5 bg-success/10 text-success rounded-full text-xs font-medium">
                        Summary Available
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{visit.doctor} • {visit.date}</p>
                  <p className="text-foreground">{visit.summary}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-primary border border-primary rounded-lg font-medium hover:bg-primary/10 transition-colors text-sm">
                    View Full Summary
                  </button>
                  <button className="px-4 py-2 text-primary border border-primary rounded-lg font-medium hover:bg-primary/10 transition-colors text-sm">
                    Explain This
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Medication Instructions */}
      <section className="bg-surface rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Active Medications & Instructions</h3>
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 bg-background rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Lisinopril 10mg</h4>
              <p className="text-sm text-muted-foreground mt-1">Take once daily in the morning</p>
              <p className="text-sm text-muted-foreground mt-1">Refill due: February 1, 2026</p>
            </div>
            <button className="text-primary text-sm font-medium hover:underline">Set Reminder</button>
          </div>
          <div className="flex items-start justify-between p-4 bg-background rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Vitamin D3 1000 IU</h4>
              <p className="text-sm text-muted-foreground mt-1">Take once daily with food</p>
              <p className="text-sm text-muted-foreground mt-1">Over-the-counter supplement</p>
            </div>
            <button className="text-primary text-sm font-medium hover:underline">Set Reminder</button>
          </div>
        </div>
      </section>
    </div>
  );
}
