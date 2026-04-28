// Site Service - Domain-specific API abstraction
import BaseApiService from './base-api.service';
import { ApiResponse } from '../types';

interface SiteStats {
  totalUsers: number;
  totalQuizzes: number;
  totalContent: number;
  totalChats: number;
}

interface State {
  code: string;
  name: string;
}

interface StateInfo {
  name: string;
  registrationDeadline: string;
  idRequired: boolean;
  acceptedIds?: string[];
}

interface EligibilityFormData {
  age: string;
  citizenship: string;
  state: string;
  registrationStatus: string;
}

interface EligibilityResult {
  eligible: boolean;
  reasons?: string[];
  recommendations?: string[];
  nextSteps?: string[];
}

class SiteService extends BaseApiService {
  private readonly endpoint = '/site';
  private readonly eligibilityEndpoint = '/eligibility';

  async getStats(): Promise<ApiResponse<{ stats: SiteStats }>> {
    return this.get<{ stats: SiteStats }>(`${this.endpoint}/stats`);
  }

  async getSettings(): Promise<ApiResponse<{ settings: Record<string, unknown> }>> {
    return this.get<{ settings: Record<string, unknown> }>(`${this.endpoint}/settings`);
  }

  async getEligibilityStates(): Promise<ApiResponse<{ states: State[] }>> {
    return this.get<{ states: State[] }>(`${this.eligibilityEndpoint}/states`);
  }

  async getStateInfo(stateCode: string): Promise<ApiResponse<{ stateInfo: StateInfo }>> {
    return this.get<{ stateInfo: StateInfo }>(`${this.eligibilityEndpoint}/state/${stateCode}`);
  }

  async checkEligibility(formData: EligibilityFormData): Promise<ApiResponse<EligibilityResult>> {
    return this.post<EligibilityResult>(`${this.eligibilityEndpoint}/check`, formData);
  }
}

export const siteService = new SiteService();
export default siteService;
