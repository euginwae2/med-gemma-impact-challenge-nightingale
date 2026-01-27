import { 
  User, 
  Bell, 
  Shield, 
  Link as LinkIcon, 
  HelpCircle, 
  ChevronRight,
  Database,
  FileText,
  Lock
} from 'lucide-react';

export function SettingsPage() {
  const dataSources = [
    { name: 'Health Insurance Portal', status: 'Connected', lastSync: '2 hours ago' },
    { name: 'Primary Care EHR', status: 'Connected', lastSync: '1 day ago' },
    { name: 'Lab Results System', status: 'Not Connected', lastSync: 'Never' },
  ];

  const notificationSettings = [
    { title: 'Appointment Reminders', enabled: true },
    { title: 'Medication Reminders', enabled: true },
    { title: 'Prior Authorization Updates', enabled: true },
    { title: 'Lab Results Available', enabled: true },
    { title: 'Insurance Changes', enabled: false },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Settings & Preferences</h2>
        <p className="text-muted-foreground">
          Manage your account, privacy, and data connections
        </p>
      </div>

      {/* Profile Section */}
      <section className="bg-surface rounded-xl p-6 border border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">John Doe</h3>
            <p className="text-muted-foreground">john.doe@email.com</p>
          </div>
          <button className="px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-background transition-colors">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p className="font-medium text-foreground">January 15, 1975</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Insurance ID</p>
            <p className="font-medium text-foreground">ABC123456789</p>
          </div>
        </div>
      </section>

      {/* Data Sources & Connections */}
      <section className="bg-surface rounded-xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Data Sources & Connections</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Manage connections to your health records and insurance systems
        </p>
        <div className="space-y-3">
          {dataSources.map((source, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{source.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {source.status === 'Connected' ? `Last synced: ${source.lastSync}` : 'Not connected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    source.status === 'Connected'
                      ? 'bg-success/10 text-success'
                      : 'bg-muted-foreground/10 text-muted-foreground'
                  }`}
                >
                  {source.status}
                </span>
                <button className="text-primary hover:underline text-sm font-medium">
                  {source.status === 'Connected' ? 'Manage' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="bg-surface rounded-xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Notification Preferences</h3>
        </div>
        <div className="space-y-3">
          {notificationSettings.map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-3">
              <span className="text-foreground">{setting.title}</span>
              <button
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  setting.enabled ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-surface rounded-full transition-transform ${
                    setting.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Consent Management */}
      <section className="bg-surface rounded-xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Privacy & Consent</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
            <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Data Sharing Consent</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Control who can access your health information
              </p>
              <button className="text-primary text-sm font-medium hover:underline">
                Manage Permissions
              </button>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
            <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Audio Recording Consent</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Manage consent for visit recordings and transcriptions
              </p>
              <button className="text-primary text-sm font-medium hover:underline">
                Review Consent
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Help & Support */}
      <section className="bg-surface rounded-xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Help & Support</h3>
        </div>
        <div className="space-y-2">
          {[
            'Frequently Asked Questions',
            'Medical Terminology Glossary',
            'Insurance Coverage Guide',
            'Contact Support',
            'Privacy Policy',
            'Terms of Service',
          ].map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-3 hover:bg-background rounded-lg transition-colors text-left"
            >
              <span className="text-foreground">{item}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      {/* App Information */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-1">Nightingale Health Companion</p>
        <p className="text-xs text-muted-foreground">Version 1.0.0 • © 2026 Nightingale</p>
      </div>
    </div>
  );
}
