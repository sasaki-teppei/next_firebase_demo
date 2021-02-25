import { useState, useEffect, useRef } from "react";
import firebase from "firebase/app";
import { Question } from "../../models/Question";
import Layout from "../../components/Layout";
import { useAuthentification } from "../../hooks/authentification";
import dayjs from "dayjs";

export default function QuestionReceived() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPagenationFinisehed, setIsPagenationFinished] = useState<boolean>(
    false
  );

  const { user } = useAuthentification();
  const scrollContainerRef = useRef(null);

  //クエリ共通化
  function createBaseQuery() {
    return firebase
      .firestore()
      .collection("questions")
      .where("receiverUid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(2);
  }

  function appendQuestions(
    snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
  ) {
    const gotQuestions = snapshot.docs.map((doc) => {
      const question = doc.data() as Question;
      question.id = doc.id;
      return question;
    });
    setQuestions(questions.concat(gotQuestions));
  }

  //最初の読み込み
  async function loadQuestions() {
    const snapshot = await createBaseQuery().get();

    if (snapshot.empty) {
      setIsPagenationFinished(true);
      return;
    }

    appendQuestions(snapshot);
  }

  //追加分の読み込み
  async function loadNextQuestions() {
    if (questions.length === 0) {
      return;
    }

    const lastQuestion = questions[questions.length - 1];
    const snapshot = await createBaseQuery()
      .startAfter(lastQuestion.createdAt)
      .get();

    if (snapshot.empty) {
      return;
    }

    appendQuestions(snapshot);
  }

  useEffect(() => {
    if (!process.browser) {
      return;
    }
    if (user === null) {
      return;
    }

    // async function loadQuestions() {
    //   const snapshot = await firebase
    //     .firestore()
    //     .collection("questions")
    //     .where("receiverUid", "==", user.uid)
    //     .orderBy("createdAt", "desc")
    //     .get();

    //   console.log(snapshot.docs);

    //   if (snapshot.empty) {
    //     return;
    //   }

    //   const gotQuestions = snapshot.docs.map((doc) => {
    //     const question = doc.data() as Question;
    //     question.id = doc.id;
    //     return question;
    //   });
    //   setQuestions(gotQuestions);
    // }
    loadQuestions();
  }, [process.browser, user]);

  function onScroll() {
    if (isPagenationFinisehed) {
      return;
    }

    const container = scrollContainerRef.current;
    if (container === null) {
      return;
    }

    const rect = container.getBoundingClientRect();
    if (rect.top + rect.height > window.innerHeight) {
      return;
    }

    loadNextQuestions();
  }

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [questions, scrollContainerRef.current, isPagenationFinisehed]);

  return (
    <Layout>
      <h1 className="h4">受け取った質問一覧</h1>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6" ref={scrollContainerRef}>
          {questions.map((question) => (
            <div className="card my-3" key={question.id}>
              <div className="card-body">
                <div className="text-truncate">{question.body}</div>
              </div>
              <div className="text-muted text-end">
                <small>
                  {dayjs(question.createdAt.toDate()).format(
                    "YYYY/MM/DD HH:mm"
                  )}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
