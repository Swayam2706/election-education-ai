/**
 * Eligibility Service
 * Handles voter eligibility checking
 */

import BaseApiService from './base-api.service';
import { ApiResponse } from '../types';

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

/**
 * Eligibility Service Class
 * Extends BaseApiService for voter eligibility operations
 */
class EligibilityService extends BaseApiService {
  /**
   * Check voter eligibility
   * @param data - Eligibility check data
   * @returns Promise with eligibility result
   */
  async checkEligibility(data: EligibilityCheck): Promise<ApiResponse<EligibilityResult>> {
    return this.post<EligibilityResult>('/eligibility/check', data);
  }

  /**
   * Get list of states
   * @returns Promise with states list
   */
  async getStates(): Promise<ApiResponse<{ states: Array<{ code: string; name: string }> }>> {
    return this.get('/eligibility/states');
  }

  /**
   * Get state-specific information
   * @param stateCode - State code
   * @returns Promise with state info
   */
  async getStateInfo(stateCode: string): Promise<ApiResponse<unknown>> {
    return this.get(`/eligibility/state/${stateCode}`);
  }

  /**
   * Get state voting requirements
   * @param stateCode - State code
   * @returns Promise with requirements
   */
  async getStateRequirements(stateCode: string): Promise<ApiResponse<unknown>> {
    return this.get(`/eligibility/requirements/${stateCode}`);
  }
}

export default new EligibilityService();
