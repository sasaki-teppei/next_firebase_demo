import Head from "next/head";
import Link from "next/link";
import { useAuthentification } from "../hooks/authentification";

export default function Home() {
  const { user } = useAuthentification();

  return (
    <div>
      <Head>
        <title>Page2</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <p>{user?.uid || "未ログイン"}</p>
      <Link href="/">
        <a>Go back</a>
      </Link>
    </div>
  );
}
