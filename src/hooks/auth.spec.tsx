import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import fetchMock from 'jest-fetch-mock'
import { mocked } from 'jest-mock';
import { startAsync } from 'expo-auth-session';
import { AuthProvider, useAuth } from './auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('expo-auth-session');

fetchMock.enableMocks();

describe('Auth Hook', () => {

  beforeEach(async () => {
      const userCollectionKey = '@gofinances:user'
      await AsyncStorage.removeItem(userCollectionKey);
  });

  test('Deve possibilitar fazer login com uma conta google existente', async () => {
    
    const googleMocked = mocked(startAsync as any);
    googleMocked.mockReturnValueOnce({
      type: 'success',
      params: {
        access_token: 'any_token',
      }
    });

    fetchMock.mockResponseOnce(JSON.stringify({
      id: 'any_id',
      email: 'mateusdeamorimaraujo@gmail.com',
      given_name: 'Mateus teste 1',
      picture: 'any_photo.png'
    }));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    
    await act(() => result.current.signInWithGoogle());
    
    expect(result.current.user.email).toBe('mateusdeamorimaraujo@gmail.com');

  });

  test('Não deve conectar caso o usuário cancele o login com google', async () => {
    
    const googleMocked = mocked(startAsync as any);
    googleMocked.mockReturnValueOnce({
      type: 'cancel'
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    
    await act(() => result.current.signInWithGoogle());
    
    expect(result.current.user).not.toHaveProperty('id');

  });
});