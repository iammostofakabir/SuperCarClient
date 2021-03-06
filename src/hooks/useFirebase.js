import {
    createUserWithEmailAndPassword, getAuth,
    GoogleAuthProvider,
    onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup,
    signOut, updateProfile
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import swal from "sweetalert";
import initAuthentication from "../config/firebase";

// initialize firebase
initAuthentication();

const useFirebase = () => {
  const [user, setUser] = useState({});
  const history = useHistory();
  const auth = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const currentUser = auth.currentUser;

  //on State Change
  useEffect(() => {
    const unsubscribed = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser({});
      }
      setIsLoading(false);
    });
    return () => unsubscribed;
  }, [auth]);

  //sign up functionality
  const signUpUser = ({ email, name, password, photoURL }) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((res) => {
        setUser(res.user);
        saveUser(email, name, photoURL, "POST");
        updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: photoURL,
        }).then(() => {
          swal(
            "Welcome!",
            `Let's Explore Your Favorite Super Car Lamborghini ${res.user.displayName}`,
            "success"
          );
          history.push("/");
        });
      })
      .catch((err) => swal("Something went wrong!", `${err.message}`, "error"));
  };

  //sign in functionality
  const signInUser = ({ email, password }) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((res) => {
        setUser(res.user);
        swal(
          "Sign In Successful!",
          `Welcome Back ${res.user.displayName}`,
          "success"
        );
        history.push("/");
      })
      .catch((err) => swal("Something Went Wrong!", `${err.message}`, "Error"));
  };

  //google sign in
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    const googleProvider = new GoogleAuthProvider();
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        setUser(user);
        saveUser(user.email, user.displayName, user.photoURL, "PUT");
        // console.log(user);
        swal("Welcome!", "Account Has Been Created!", "success");
        history.push("/");
      })
      .catch((error) => {
        swal("Something Went Wrong!", `${error.message}`, "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // admin data load
  useEffect(() => {
    fetch(`https://limitless-temple-11896.herokuapp.com/user/${user.email}`)
      .then((res) => res.json())
      .then((data) => setAdmin(data.admin));
  }, [user.email]);

  //Sign out
  const signOutUser = () => {
    setIsLoading(true);
    signOut(auth)
      .then(() => {
        setUser({});
        swal("Logout Successful!", "You Are Logged Out!", "success");
        history.push("/register");
      })
      .catch((err) => {
        swal("Something Went Wrong!", `${err.message}`, "error");
      })
      .finally(() => setIsLoading(false));
  };
  //   console.log(user);
  // save user
  const saveUser = (email, displayName, photoURL, method) => {
    const user = { email, displayName, photoURL };
    fetch("https://limitless-temple-11896.herokuapp.com/user/", {
      method: method,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    }).then();
  };

  return {
    currentUser,
    user,
    admin,
    signUpUser,
    signInUser,
    handleGoogleSignIn,
    signOutUser,
    isLoading,
  };
};

export default useFirebase;
