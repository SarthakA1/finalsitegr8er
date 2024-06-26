import { Subject, subjectState } from '@/atoms/subjectsAtom';
import PageContent from '@/components/layout/PageContent';
import Posts from '@/components/Posts/Posts';
import About from '@/components/Subject/About';
import CreatePostLink from '@/components/Subject/CreatePostLink';
import Header from '@/components/Subject/Header';
import NotFound from '@/components/Subject/NotFound';
import { firestore } from '@/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { stringify } from 'querystring';
import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import safeJsonStringify from 'safe-json-stringify';

type SubjectPageProps = {
  subjectData: Subject;
};

const isBrowser = () => typeof window !== 'undefined'; //The approach recommended by Next.js

  function scrollToTop() {
      if (!isBrowser()) return;
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

const SubjectPage: React.FC<SubjectPageProps> = ({ subjectData }) => {
  const [subjectStateValue, setSubjectStateValue] = useRecoilState(subjectState);

  if (!subjectData) {
    return <NotFound />;
  }

  useEffect(() => {
    setSubjectStateValue((prev) => ({
      ...prev,
      currentSubject: subjectData,
    }))
  }, [subjectData]);



  return (
    <>
  <Header subjectData={subjectData} />
  <PageContent>
    <>
     <About subjectData={subjectData}/>
     
    </>
    <>
    <button
        className={`back_to_top`}
        onClick={scrollToTop}
      >
        BACK TO TOP
       
</button>

    <div> <CreatePostLink/> </div>
    <div>
      <Head>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6442166008118008"
     crossOrigin="anonymous"></script>
        <title>{subjectData.id}</title>
      </Head>
      
    </div>
    <Posts subjectData ={subjectData}/>
    </>

  </PageContent>
  
  
  </>

  )
  

};

export default SubjectPage;
 

export async function getServerSideProps(context: GetServerSidePropsContext) {

  try {
    const subjectDocRef = doc(
      firestore,
      "subjects",
      context.query.subjectId as string
    );
    const subjectDoc = await getDoc(subjectDocRef);

    return {
      props: {
        subjectData: subjectDoc.exists()
          ? JSON.parse(
            safeJsonStringify({ id: subjectDoc.id, ...subjectDoc.data() }) 
          )
          : "",
      },
    };
  } catch (error) {
    return { props: {} }
  }

  
}


