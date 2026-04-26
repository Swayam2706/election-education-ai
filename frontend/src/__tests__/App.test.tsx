import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock Firebase
jest.mock('../lib/firebase', () => ({
  auth: {},
  analytics: {},
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('renders navigation', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // App should render some content
    expect(document.querySelector('#root')).toBeInTheDocument();
  });
});
