import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import { AuthProvider } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboard.service';

jest.mock('../../services/dashboard.service');

const MockedDashboard = () => (
  <BrowserRouter>
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  </BrowserRouter>
);

describe('Dashboard Page', () => {
  beforeEach(() => {
    (dashboardService.getStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        stats: {
          quizzesCompleted: 5,
          articlesRead: 10,
          chatMessages: 20,
          totalScore: 85,
        },
      },
    });
    
    (dashboardService.getUserProgress as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        recentQuizzes: [],
        recentContent: [],
      },
    });
  });

  it('renders dashboard', async () => {
    render(<MockedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  it('displays user stats', async () => {
    render(<MockedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/5/)).toBeInTheDocument();
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    render(<MockedDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
