import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function CostsPage() {
  const monthlyData = [
    { month: 'Jul', amount: 150 },
    { month: 'Aug', amount: 230 },
    { month: 'Sep', amount: 180 },
    { month: 'Oct', amount: 290 },
    { month: 'Nov', amount: 210 },
    { month: 'Dec', amount: 175 },
    { month: 'Jan', amount: 250 },
  ];

  const coverageData = [
    { name: 'Deductible Met', value: 800, color: '#34A853' },
    { name: 'Remaining', value: 1200, color: '#E8F0FE' },
  ];

  const claims = [
    { id: 1, service: 'Annual Physical', date: 'Jan 10, 2026', status: 'approved', amount: '$150', responsibility: '$25' },
    { id: 2, service: 'Lab Work - CBC', date: 'Jan 16, 2026', status: 'approved', amount: '$85', responsibility: '$0' },
    { id: 3, service: 'MRI Scan', date: 'Jan 20, 2026', status: 'pending', amount: '$1,200', responsibility: 'TBD' },
    { id: 4, service: 'Physical Therapy', date: 'Dec 15, 2025', status: 'approved', amount: '$120', responsibility: '$40' },
  ];

  const priorAuths = [
    { id: 1, service: 'MRI Scan - Lower Back', status: 'pending', submitted: 'Jan 18, 2026', expected: '3-5 business days' },
    { id: 2, service: 'Specialist Referral - Orthopedics', status: 'approved', submitted: 'Dec 20, 2025', approved: 'Jan 5, 2026' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Costs & Coverage</h2>
        <p className="text-muted-foreground">
          Track your healthcare spending, coverage, and insurance status
        </p>
      </div>

      {/* Cost Transparency Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Year-to-Date Spending</span>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">$1,280</p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="text-success flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              12% less than last year
            </span>
          </p>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Deductible Progress</span>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <p className="text-3xl font-bold text-foreground">$800</p>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">$800 of $2,000</span>
              <span className="text-foreground font-medium">40%</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Estimated Annual</span>
            <DollarSign className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">$3,200</p>
          <p className="text-sm text-muted-foreground mt-1">Based on current usage</p>
        </div>
      </div>

      {/* Spending Chart */}
      <div className="bg-surface rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-6">Monthly Out-of-Pocket Spending</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DADCE0" />
            <XAxis dataKey="month" stroke="#5F6368" />
            <YAxis stroke="#5F6368" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #DADCE0', borderRadius: '8px' }}
              formatter={(value) => [`$${value}`, 'Amount']}
            />
            <Line type="monotone" dataKey="amount" stroke="#1A73E8" strokeWidth={3} dot={{ fill: '#1A73E8', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Coverage Summary & Prior Auth Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coverage Visualization */}
        <div className="bg-surface rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Deductible Status</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={coverageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {coverageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {coverageData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">${item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prior Authorization Status */}
        <div className="bg-surface rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Prior Authorization Status</h3>
          <div className="space-y-3">
            {priorAuths.map((auth) => (
              <div key={auth.id} className="p-4 bg-background rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground text-sm">{auth.service}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      auth.status === 'approved'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {auth.status === 'approved' ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted: {auth.submitted}
                </p>
                {auth.status === 'pending' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected: {auth.expected}
                  </p>
                )}
              </div>
            ))}
          </div>
          <button className="w-full mt-4 px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors">
            View All Authorizations
          </button>
        </div>
      </div>

      {/* Claims Tracker */}
      <div className="bg-surface rounded-xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Claims</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Service</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Your Cost</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="border-b border-border hover:bg-background transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground">{claim.service}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{claim.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        claim.status === 'approved'
                          ? 'bg-success/10 text-success'
                          : claim.status === 'pending'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-error/10 text-error'
                      }`}
                    >
                      {claim.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                      {claim.status === 'pending' && <Clock className="w-3 h-3" />}
                      {claim.status === 'denied' && <AlertCircle className="w-3 h-3" />}
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-foreground">{claim.amount}</td>
                  <td className="py-3 px-4 text-sm text-right font-bold text-primary">{claim.responsibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Savings Recommendations */}
      <div className="bg-primary/10 rounded-xl p-6 border border-primary/30">
        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Cost-Saving Opportunities
        </h3>
        <ul className="space-y-2">
          <li className="text-foreground flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <span>Consider generic alternatives for prescribed medications to save up to 30%</span>
          </li>
          <li className="text-foreground flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <span>Use in-network providers for your upcoming MRI to save approximately $400</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
