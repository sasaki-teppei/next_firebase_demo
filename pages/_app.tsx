import "../styles/globals.scss";
import "../lib/firebase";
// npm i recoil : 取得したuserLogin情報をアプリで保持しておくためのlibrary
import { RecoilRoot } from "recoil";
import dayjs from "dayjs";
import "dayjs/locale/ja";

dayjs.locale("ja");

function MyApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  );
}

export default MyApp;
