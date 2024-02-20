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


const isBrowser = () => typeof window !== 'undefined'; //The approach recommended by Next.js

  function scrollToTop() {
      if (!isBrowser()) return;
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
 


  return (
    <>
  <Header subjectData={subjectData} />
  <PageContent>
    <>
     <About subjectData={subjectData}/>
      <button>
      className={`fixed bottom-0 right-0 bg-black rounded-s-full px-4 py-2 mr-6 mb-[71px] z-50 items-center text-xs flex gap-2`}
        onClick={scrollToTop}
      >
        BACK TO TOP
       
</button>
    </>
    <>

    <div> <CreatePostLink/> </div>
    <div>
      <Head>
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


