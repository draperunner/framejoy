import React, { createContext, useContext, useState, useEffect } from "react";
import firebase from "firebase/app";

import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWEPtFzrjR-oT0M8r4PPQyYh_h3zJd2wQ",
  authDomain: "frame-joy.firebaseapp.com",
  projectId: "frame-joy",
  storageBucket: "frame-joy.appspot.com",
  messagingSenderId: "135638107642",
  appId: "1:135638107642:web:1f751682fdd3994f7bd043",
};

firebase.initializeApp(firebaseConfig);

function useAnonymousLogin() {
  const [user, setUser] = useState<firebase.User | null | undefined>();

  useEffect(() => {
    return firebase.auth().onAuthStateChanged((user) => {
      setUser(user);

      if (!user) {
        firebase.auth().signInAnonymously().catch(console.error);
        return;
      }
    });
  }, []);

  return {
    user,
  };
}

const UserContext = createContext<firebase.User | null | undefined>(null);

export const UserProvider: React.FC = (props) => {
  const { user } = useAnonymousLogin();

  return <UserContext.Provider value={user} {...props} />;
};

export const useUser = () => useContext(UserContext);
