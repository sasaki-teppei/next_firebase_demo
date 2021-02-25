import firebase from "firebase/app";
import { User } from "../models/User";
import { atom, useRecoilState } from "recoil";
import { useEffect } from "react";

//ブラウザ上である時 : process.browser

//atom : データを入れる箱を用意 : keyで名前つけ → どこからでも呼び出せる
//default: null → 未ログイン状態
const userState = atom<User>({
  key: "user",
  default: null,
});

export function useAuthentification() {
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    if (user !== null) {
      return;
    }

    //console.log("start useEffect");

    firebase
      .auth()
      //認証処理の開始
      .signInAnonymously()
      .catch(function (err) {
        console.error(err);
      });

    //ログインユーザー情報がある場合 : setUserで情報を保持
    firebase.auth().onAuthStateChanged(function (firebaseUser) {
      if (firebaseUser) {
        //console.log("User", firebaseUser);
        const loginUser: User = {
          uid: firebaseUser.uid,
          //isAnonymous : 匿名かどうか : true
          isAnonymous: firebaseUser.isAnonymous,
          name: "",
        };
        setUser(loginUser);
        createUserIfNotFound(loginUser);
      } else {
        //user is signed out
        setUser(null);
      }
    });
  }, []);

  return { user };
}

async function createUserIfNotFound(user: User) {
  const userRef = firebase.firestore().collection("users").doc(user.uid);
  const doc = await userRef.get();
  if (doc.exists) {
    return;
  }

  await userRef.set({
    name: "taro" + new Date().getTime(),
  });
}
