import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  User,
  signInAnonymously,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWEPtFzrjR-oT0M8r4PPQyYh_h3zJd2wQ",
  authDomain: "frame-joy.firebaseapp.com",
  projectId: "frame-joy",
  storageBucket: "frame-joy.appspot.com",
  messagingSenderId: "135638107642",
  appId: "1:135638107642:web:1f751682fdd3994f7bd043",
};

initializeApp(firebaseConfig);

const auth = getAuth();

if (window.location.hostname === "localhost") {
  console.log("Using auth emulator");
  connectAuthEmulator(auth, "http://localhost:9099");
}

function useAnonymousLogin() {
  const [user, setUser] = useState<User | null | undefined>();

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setUser(user);

      if (!user) {
        signInAnonymously(auth).catch(console.error);
        return;
      }
    });
  }, []);

  return {
    user,
  };
}

const UserContext = createContext<User | null | undefined>(null);

export const UserProvider: React.FC = (props) => {
  const { user } = useAnonymousLogin();

  return <UserContext.Provider value={user} {...props} />;
};

export const useUser = () => useContext(UserContext);
