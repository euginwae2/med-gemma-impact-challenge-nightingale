import { useState } from 'react';
import { 
  MessageSquare, 
  Mic, 
  Image as ImageIcon, 
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4;
type RiskLevel = 'low' | 'medium' | 'high' | null;

export function CheckInPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [symptoms, setSymptoms] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(null);

  const steps = [
    { number: 1, title: 'Symptoms' },
    { number: 2, title: 'Audio' },
    { number: 3, title: 'Photos' },
    { number: 4, title: 'Review' },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      // Simulate AI assessment
      setRiskLevel('low');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return 'bg-success/10 border-success text-success';
      case 'medium':
        return 'bg-warning/10 border-warning text-warning';
      case 'high':
        return 'bg-error/10 border-error text-error';
      default:
        return '';
    }
  };

  const getRiskIcon = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return <CheckCircle2 className="w-6 h-6" />;
      case 'medium':
        return <AlertTriangle className="w-6 h-6" />;
      case 'high':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Health Check-In</h2>
        <p className="text-muted-foreground">
          Share your symptoms and get AI-powered risk assessment
        </p>
      </div>

      {/* Stepper */}
      <div className="bg-surface rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    currentStep >= step.number
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground border-2 border-border'
                  }`}
                >
                  {currentStep > step.number ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                </div>
                <span className="text-xs mt-2 text-muted-foreground font-medium">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    currentStep > step.number ? 'bg-primary' : 'bg-border'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-2 block">
                  How are you feeling today?
                </span>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms in detail..."
                  className="w-full min-h-[200px] p-4 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </label>
              <button className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <Mic className="w-5 h-5" />
                <span className="text-sm font-medium">Use Voice Input</span>
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Record Audio (Optional)</h3>
                <p className="text-muted-foreground mb-6">
                  Describe your symptoms verbally for respiratory monitoring
                </p>
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity">
                  Start Recording
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Upload Photos (Optional)</h3>
                <p className="text-muted-foreground mb-4">
                  Upload images of any visible symptoms or concerns
                </p>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity">
                  Choose Files
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && !riskLevel && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground mb-4">Review Your Check-In</h3>
              <div className="bg-background rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Symptoms:</span>
                  <p className="text-foreground mt-1">{symptoms || 'No symptoms described'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Audio:</span>
                  <p className="text-foreground mt-1">Not recorded</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Photos:</span>
                  <p className="text-foreground mt-1">No photos uploaded</p>
                </div>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  Our AI will analyze your check-in and provide a risk assessment with clear next-step recommendations.
                </p>
              </div>
            </div>
          )}

          {riskLevel && (
            <div className="space-y-6">
              {/* Risk Assessment */}
              <div className={`rounded-xl p-6 border-2 ${getRiskColor(riskLevel)}`}>
                <div className="flex items-center gap-3 mb-4">
                  {getRiskIcon(riskLevel)}
                  <h3 className="text-xl font-bold">Risk Assessment: {riskLevel.toUpperCase()}</h3>
                </div>
                <p className="mb-4">
                  Based on your symptoms, our AI assessment indicates a low risk. Your symptoms appear mild and manageable.
                </p>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-bold text-foreground mb-3">Recommended Next Steps:</h4>
                <div className="space-y-3">
                  <div className="bg-surface rounded-lg p-4 border border-border">
                    <h5 className="font-medium text-foreground mb-1">Monitor Symptoms</h5>
                    <p className="text-sm text-muted-foreground">
                      Continue to monitor your symptoms. If they worsen, schedule an appointment.
                    </p>
                  </div>
                  <div className="bg-surface rounded-lg p-4 border border-border">
                    <h5 className="font-medium text-foreground mb-1">Rest and Hydration</h5>
                    <p className="text-sm text-muted-foreground">
                      Get plenty of rest and stay hydrated to support your recovery.
                    </p>
                  </div>
                  <div className="bg-surface rounded-lg p-4 border border-border">
                    <h5 className="font-medium text-foreground mb-1">Follow-up Check-in</h5>
                    <p className="text-sm text-muted-foreground">
                      Complete another check-in in 24-48 hours to track your progress.
                    </p>
                  </div>
                </div>
              </div>

              {/* Insurance Info */}
              <div className="bg-warning/10 rounded-lg p-4 border border-warning/30">
                <h5 className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4 text-warning" />
                  Insurance Coverage Note
                </h5>
                <p className="text-sm text-muted-foreground">
                  If you decide to see a doctor, this visit may require prior authorization depending on your plan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || !!riskLevel}
            className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-background rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          {!riskLevel && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {currentStep === 4 ? 'Submit & Analyze' : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          {riskLevel && (
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Save & Share with Provider
            </button>
          )}
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Previous Check-Ins</h3>
        <div className="space-y-3">
          <div className="bg-surface rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">General wellness check</h4>
                <p className="text-sm text-muted-foreground mt-1">Jan 10, 2026 • Risk: Low</p>
              </div>
              <button className="text-primary text-sm font-medium hover:underline">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
