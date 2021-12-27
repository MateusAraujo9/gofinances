import React from "react";
import { render, fireEvent } from '@testing-library/react-native';
import { Register } from ".";
import { ThemeProvider } from 'styled-components/native';
import theme from '../../global/styles/theme';

const Provider: React.FC = ({children}) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn()
  }
})

describe('Register Screen', () => {
  test('Deve abrir o modal category ao clicar no botão de categoria', () => {
    const { getByTestId } = render(
      <Register />,
      {
        wrapper: Provider
      }
    );

    const categoryModal = getByTestId('modal-category');
    const buttonCategory = getByTestId('button-category');
    fireEvent.press(buttonCategory);

    expect(categoryModal.props.visible).toBeTruthy();
  });
});