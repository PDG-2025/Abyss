import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

test('App se charge sans crash', () => {
  const { getByText } = render(<App />);
  expect(getByText('Hello World')).toBeTruthy();
});

