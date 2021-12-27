import React from "react";
import { render } from '@testing-library/react-native';

import { Profile } from '../../screens/Profile';

describe('Profile', () => {
  test('check if show correctly user input name placeholder', () => {
    const { getByPlaceholderText } = render(<Profile />);
  
    const inputName = getByPlaceholderText('Nome');
  
    expect(inputName).toBeTruthy();
  });
  
  test('verifica se os dados do usuário foi carregado', () => {
    const { getByTestId } = render(<Profile />);
  
    const inputName = getByTestId('input-name');
    const inputSurname = getByTestId('input-surname');
  
    expect(inputName.props.value).toEqual('Mateus');
    expect(inputSurname.props.value).toEqual('Araújo');
  });
  
  test('Verifica se o titulo renderizou corretamente', () => {
    const { getByTestId } = render(<Profile />);
    const textTitle = getByTestId('title');
  
    expect(textTitle.props.children).toContain('Perfil');
  });
});

