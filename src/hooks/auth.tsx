import React, { 
  createContext, 
  ReactNode, 
  useContext, 
  useState,
  useEffect
} from 'react';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;
const { USER_STORAGE } = process.env;

interface AuthProviderProps{
  children: ReactNode
}

interface User{
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthContextData{
  user: User;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  userStorageLoading: boolean;
}

interface AuthorizationResponse{
  params: {
    access_token: string;
  };
  type: string;
}

const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps){
  const [user, setUser] = useState<User>({} as User);
  const [userStorageLoading, setUserStorageLoading] = useState(true);
  const userStorageKey = '@gofinances:user_data';

  async function signInWithGoogle() {
    try {
      
      const RESPONSE_TYPE = 'token';
      const SCOPE = encodeURI('profile email');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

      const { type, params} = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse;
      
      if (type === 'success') {
        const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${params.access_token}`);
        const userInfo = await response.json();

        setUser({
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.given_name,
          photo: userInfo.picture,
        });

        AsyncStorage.setItem(userStorageKey, JSON.stringify(user));
      }


    } catch (error) {
      throw new Error(error as string);
    }
  }

  async function  signOut() {
    setUser({} as User);
    await AsyncStorage.removeItem(userStorageKey);
  }

  useEffect(()=>{
    async function loadUserStorageData() {
      const userStoraged = await AsyncStorage.getItem(userStorageKey);

      if (userStoraged) {
        const userLogged = JSON.parse(userStoraged) as User;
        setUser(userLogged);
      }

      setUserStorageLoading(false);
    }

    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut, userStorageLoading}}>
      { children }
    </AuthContext.Provider>
  )
}

function useAuth() {
  const contex = useContext(AuthContext);

  return contex;
}

export { AuthProvider, useAuth }
