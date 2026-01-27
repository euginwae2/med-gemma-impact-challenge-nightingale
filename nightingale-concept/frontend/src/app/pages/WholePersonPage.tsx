import { Home, Utensils, Car, Heart, TrendingUp, MapPin, Phone, Calendar } from 'lucide-react';

export function WholePersonPage() {
  const healthScore = 78;
  
  const factors = [
    { 
      icon: Home, 
      title: 'Housing Stability', 
      status: 'Stable', 
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    { 
      icon: Utensils, 
      title: 'Food Security', 
      status: 'Needs Support', 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    { 
      icon: Car, 
      title: 'Transportation', 
      status: 'Limited Access', 
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    { 
      icon: Heart, 
      title: 'Social Connection', 
      status: 'Good', 
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
  ];

  const resources = [
    {
      id: 1,
      title: 'Community Food Bank',
      category: 'Food Security',
      description: 'Free groceries available Monday-Friday, 9AM-5PM',
      distance: '1.2 miles',
      phone: '(555) 123-4567',
      available: true,
    },
    {
      id: 2,
      title: 'Free Medical Transportation Service',
      category: 'Transportation',
      description: 'Door-to-door rides for medical appointments',
      distance: 'Service Area',
      phone: '(555) 234-5678',
      available: true,
    },
    {
      id: 3,
      title: 'Senior Wellness Center',
      category: 'Social Connection',
      description: 'Group activities, fitness classes, and social events',
      distance: '2.5 miles',
      phone: '(555) 345-6789',
      available: true,
    },
  ];

  const healthGoals = [
    { title: 'Increase daily steps to 8,000', progress: 65, current: 5200, target: 8000 },
    { title: 'Improve sleep quality', progress: 80, current: '7.2 hrs avg', target: '8 hrs' },
    { title: 'Reduce stress levels', progress: 45, current: 'Moderate', target: 'Low' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Whole Person Health</h2>
        <p className="text-muted-foreground">
          Your complete health picture including social and environmental factors
        </p>
      </div>

      {/* Health Score */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Overall Wellness Score</h3>
          <TrendingUp className="w-6 h-6 text-success" />
        </div>
        <div className="flex items-end gap-4">
          <div className="relative">
            <svg className="w-32 h-32" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#E8F0FE"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#34A853"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 50 * (healthScore / 100)}, ${2 * Math.PI * 50}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <text
                x="60"
                y="65"
                textAnchor="middle"
                className="text-3xl font-bold fill-foreground"
              >
                {healthScore}
              </text>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-foreground mb-2">
              Your wellness score is <span className="font-bold text-success">Good</span> and improving!
            </p>
            <p className="text-sm text-muted-foreground">
              Based on your clinical health, lifestyle factors, and social determinants
            </p>
          </div>
        </div>
      </div>

      {/* Social Determinants of Health */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">Social Determinants of Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factors.map((factor) => {
            const Icon = factor.icon;
            return (
              <div key={factor.title} className="bg-surface rounded-xl p-5 border border-border">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${factor.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${factor.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">{factor.title}</h4>
                    <p className={`text-sm font-medium ${factor.color}`}>{factor.status}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Health Goals */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-4">Health Goals & Progress</h3>
        <div className="space-y-4">
          {healthGoals.map((goal, index) => (
            <div key={index} className="bg-surface rounded-xl p-5 border border-border">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-foreground">{goal.title}</h4>
                <span className="text-sm font-bold text-primary">{goal.progress}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Current: {goal.current}</span>
                <span>Target: {goal.target}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Resources */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Recommended Community Resources</h3>
          <button className="text-primary text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-surface rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-foreground">{resource.title}</h4>
                    {resource.available && (
                      <span className="px-2 py-0.5 bg-success/10 text-success rounded-full text-xs font-medium">
                        Available
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{resource.category}</p>
                  <p className="text-foreground mb-3">{resource.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{resource.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{resource.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </button>
                <button className="px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-background transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wellness Tips */}
      <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-secondary" />
          Personalized Wellness Tips
        </h3>
        <ul className="space-y-2">
          <li className="text-foreground flex items-start gap-2">
            <span className="text-secondary">•</span>
            <span>Consider joining the Senior Wellness Center to improve social connections and physical activity</span>
          </li>
          <li className="text-foreground flex items-start gap-2">
            <span className="text-secondary">•</span>
            <span>Utilize the food bank services to ensure consistent access to nutritious meals</span>
          </li>
          <li className="text-foreground flex items-start gap-2">
            <span className="text-secondary">•</span>
            <span>Schedule regular transportation for medical appointments to maintain continuity of care</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
