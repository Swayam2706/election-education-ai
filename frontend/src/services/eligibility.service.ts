import { apiService } from './api.service';

export interface EligibilityCheck {
  age: number;
  country: string;
  citizenship: string;
  residency: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  nextSteps: string[];
}

export const eligibilityService = {
  async checkEligibility(data: EligibilityCheck) {
    const response = await apiService.post('/eligibility/check', data);
    return response;
  },

  async getStates() {
    const response = await apiService.get('/eligibility/states');
    return response;
  },

  async getStateInfo(stateCode: string) {
    const response = await apiService.get(`/eligibility/state/${stateCode}`);
    return response;
  },

  async getStateRequirements(stateCode: string) {
    const response = await apiService.get(`/eligibility/requirements/${stateCode}`);
    return response;
  }
};
