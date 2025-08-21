import React from 'react';
import {render, screen} from '@testing-library/react-native';
import App from '../App';

// Mock pour useColorScheme
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

describe('App Component', () => {
  test('renders Hello World text', () => {
    render(<App />);
    
    const welcomeText = screen.getByTestId('welcome-text');
    expect(welcomeText).toBeTruthy();
    expect(welcomeText.props.children).toBe('Hello World!');
  });

  test('renders welcome subtitle', () => {
    render(<App />);
    
    const subtitleText = screen.getByTestId('subtitle-text');
    expect(subtitleText).toBeTruthy();
    expect(subtitleText.props.children).toBe('Welcome to React Native');
  });

  test('renders info text about the app', () => {
    render(<App />);
    
    const infoTexts = screen.getAllByText(/This is a simple React Native app/i);
    expect(infoTexts.length).toBeGreaterThan(0);
  });

  test('renders CI/CD info text', () => {
    render(<App />);
    
    const cicdText = screen.getByText(/Built for CI\/CD with GitHub Actions/i);
    expect(cicdText).toBeTruthy();
  });

  test('app component matches snapshot', () => {
    const tree = render(<App />);
    expect(tree).toMatchSnapshot();
  });
});
