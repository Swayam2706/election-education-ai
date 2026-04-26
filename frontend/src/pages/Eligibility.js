import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, MapPin, Calendar, User, FileText } from 'lucide-react';
import { apiService } from '../services/api.service';
import { AnimatedContainer } from '../animations/motion-components/AnimatedContainer';
import { ScrollReveal } from '../animations/scroll-effects/ScrollAnimations';

const FormField = ({ label, children, required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-foreground">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const ResultCard = ({ type, title, items }) => {
  const getIcon = () => {
    switch (type) {
      case 'eligible':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'ineligible':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <FileText className="w-6 h-6 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'eligible':
        return 'border-green-200 bg-green-50';
      case 'ineligible':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className={`card p-6 border-l-4 ${getColors()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function Eligibility() {
  const [formData, setFormData] = useState({
    age: '',
    citizenship: '',
    state: '',
    registrationStatus: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stateInfo, setStateInfo] = useState(null);
  const [states, setStates] = useState([]);

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (formData.state) {
      loadStateInfo(formData.state);
    }
  }, [formData.state]);

  const loadStates = async () => {
    try {
      const response = await apiService.get('/eligibility/states');
      setStates(response.data?.states || []);
    } catch (error) {
      console.error('Failed to load states:', error);
    }
  };

  const loadStateInfo = async (stateCode) => {
    try {
      const response = await apiService.get(`/eligibility/state/${stateCode}`);
      setStateInfo(response.data?.stateInfo || response.stateInfo || null);
    } catch (error) {
      console.error('Failed to load state info:', error);
      setStateInfo(null);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setResult(null); // Clear previous results
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.age || !formData.citizenship || !formData.state || !formData.registrationStatus) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.post('/eligibility/check', formData);
      setResult(response.data);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
      setResult({
        eligible: false,
        reasons: ['Unable to check eligibility. Please try again.'],
        recommendations: []
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.age && formData.citizenship && formData.state && formData.registrationStatus;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatedContainer>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Indian Voter Eligibility Check</h1>
            <p className="text-xl text-muted-foreground">
              Check if you're eligible to vote in India and get personalized recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <ScrollReveal>
              <div className="card p-8">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Your Information</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FormField label="Age" required>
                    <input
                      type="number"
                      min="16"
                      max="120"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="input w-full"
                      placeholder="Enter your age"
                      required
                    />
                  </FormField>

                  <FormField label="Citizenship Status" required>
                    <select
                      value={formData.citizenship}
                      onChange={(e) => handleInputChange('citizenship', e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="">Select citizenship status</option>
                      <option value="citizen">Indian Citizen</option>
                      <option value="non-citizen">Non-Citizen</option>
                    </select>
                  </FormField>

                  <FormField label="State / Union Territory" required>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="">Select your state</option>
                      {states.map(state => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Voter Registration Status" required>
                    <select
                      value={formData.registrationStatus}
                      onChange={(e) => handleInputChange('registrationStatus', e.target.value)}
                      className="input w-full"
                      required
                    >
                      <option value="">Select registration status</option>
                      <option value="registered">Registered to vote</option>
                      <option value="not-registered">Not registered</option>
                      <option value="unsure">Not sure</option>
                    </select>
                  </FormField>

                  <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Check Eligibility
                  </button>
                </form>
              </div>
            </ScrollReveal>

            {/* Results */}
            <div className="space-y-6">
              {/* State Information */}
              {stateInfo && (
                <ScrollReveal delay={0.2}>
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {stateInfo.name} Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span><strong>Registration:</strong> {stateInfo.registrationDeadline}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span><strong>ID Required:</strong> {stateInfo.idRequired ? 'Yes (Voter ID or other photo ID)' : 'No'}</span>
                      </div>
                      {stateInfo.acceptedIds && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="font-semibold text-blue-900 mb-2">Accepted Photo IDs:</p>
                          <ul className="text-xs text-blue-800 space-y-1">
                            {stateInfo.acceptedIds.slice(0, 5).map((id, idx) => (
                              <li key={idx}>• {id}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Eligibility Results */}
              {result && (
                <ScrollReveal delay={0.4}>
                  <div className="space-y-4">
                    {result.eligible ? (
                      <ResultCard
                        type="eligible"
                        title="You are eligible to vote!"
                        items={['All eligibility requirements are met', 'You can participate in elections']}
                      />
                    ) : (
                      <ResultCard
                        type="ineligible"
                        title="Eligibility Issues Found"
                        items={result.reasons || []}
                      />
                    )}

                    {result.recommendations && result.recommendations.length > 0 && (
                      <ResultCard
                        type="info"
                        title="Recommendations"
                        items={result.recommendations}
                      />
                    )}

                    {result.nextSteps && result.nextSteps.length > 0 && (
                      <ResultCard
                        type="warning"
                        title="Next Steps"
                        items={result.nextSteps}
                      />
                    )}
                  </div>
                </ScrollReveal>
              )}

              {/* Help Text */}
              {!result && (
                <ScrollReveal delay={0.2}>
                  <div className="card p-6 border-blue-200 bg-blue-50">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Fill out the form to check your voter eligibility in India. We'll analyze your information
                      against Indian electoral requirements to determine if you can vote and provide
                      personalized recommendations.
                    </p>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>• Minimum age: 18 years (as of January 1st)</p>
                      <p>• Must be an Indian citizen</p>
                      <p>• Must be registered in electoral roll</p>
                      <p>• Register at nvsp.in or through Voter Helpline App</p>
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </div>
  );
}