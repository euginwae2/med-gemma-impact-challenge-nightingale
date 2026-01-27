import { Link } from 'react-router-dom';
import { 
  Clock, 
  Activity, 
  DollarSign, 
  FileText, 
  AlertCircle, 
  CheckCircle2,
  Plus,
  ArrowRight
} from 'lucide-react';

export function HomePage() {
  const quickActions = [
    { title: 'My Health Timeline', icon: Clock, path: '/timeline', color: 'bg-blue-50 text-blue-600' },
    { title: 'Start Check-In', icon: Activity, path: '/check-in', color: 'bg-green-50 text-green-600' },
    { title: 'Costs & Coverage', icon: DollarSign, path: '/costs', color: 'bg-purple-50 text-purple-600' },
  ];

  const tasks = [
    { id: 1, title: 'Prior Authorization Needed for MRI', type: 'urgent', date: 'Due in 2 days', status: 'pending' },
    { id: 2, title: 'Follow-up Appointment with Dr. Smith', type: 'reminder', date: 'Jan 25, 2026', status: 'scheduled' },
    { id: 3, title: 'Lab Results Available', type: 'info', date: 'Today', status: 'new' },
    { id: 4, title: 'Medication Refill Due', type: 'reminder', date: 'In 5 days', status: 'pending' },
  ];

  const alerts = [
    { id: 1, title: 'Upcoming Appointment', message: 'Annual check-up on January 25, 2026 at 10:00 AM', type: 'info' },
    { id: 2, title: 'Coverage Change', message: 'Your insurance plan has been updated. Review changes.', type: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">Your health companion is here to help you navigate your care journey.</p>
      </div>

      {/* Quick Access Cards */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="bg-surface rounded-xl p-6 border border-border hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-foreground">{action.title}</h4>
                <ArrowRight className="w-5 h-5 text-muted-foreground mt-2" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Unified Inbox & Task List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Tasks & To-Do</h3>
          <button className="text-primary text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-surface rounded-xl p-4 border border-border flex items-start justify-between hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3 flex-1">
                {task.status === 'new' ? (
                  <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                ) : task.status === 'scheduled' ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{task.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{task.date}</p>
                </div>
              </div>
              <button className="text-primary text-sm font-medium hover:underline">View</button>
            </div>
          ))}
        </div>
      </section>

      {/* Proactive Alerts */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">Important Alerts</h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl p-4 border ${
                alert.type === 'warning' 
                  ? 'bg-warning/10 border-warning/30' 
                  : 'bg-primary/10 border-primary/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {alert.type === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                ) : (
                  <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Button */}
      <Link
        to="/check-in"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </Link>
    </div>
  );
}
