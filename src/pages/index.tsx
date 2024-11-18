import { Stack, Select, Text, Flex, Box } from "@chakra-ui/react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Post, PostVote } from "../atoms/postsAtom";
import CreatePostLink from "../components/Subject/CreatePostLink";
import Recommendations from "../components/Subject/Recommendations";
import PostItem from "../components/Posts/PostItem";
import PostLoader from "../components/Posts/PostLoader";
import { auth, firestore } from "../firebase/clientApp";
import useSubjectData from "../hooks/useSubjectData";
import usePosts from "../hooks/usePosts";
import PageContent from "@/components/layout/PageContent";
import Head from "next/head";
import { Image } from "@chakra-ui/react";
import { Analytics, logEvent } from "@firebase/analytics"; // Ensure analytics import

const Home: NextPage = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [user, loadingUser] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const {
    postStateValue,
    setPostStateValue,
    onSelectPost,
    onDeletePost,
    onVote,
  } = usePosts();
  const [activeFilters, setActiveFilters] = useState({
    grade: null,
    typeofquestion: null,
    criteria: null,
    difficulty: null,
  });
  const { subjectStateValue } = useSubjectData();

  const isBrowser = () => typeof window !== "undefined";

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Log the click event for Sparkl image
  const handleSparklImageClick = () => {
    if (typeof window !== "undefined" && window.analytics) {
      logEvent(window.analytics, "sparkl_image_click");
    }
    window.open("https://www.sparkl.me/register", "_blank");
  };

  const buildUserHomeFeed = async () => {
    setLoading(true);
    try {
      if (subjectStateValue.mySnippets.length) {
        const mySubjectIds = subjectStateValue.mySnippets.map(
          (snippet) => snippet.subjectId
        );
        const postQuery = query(
          collection(firestore, "posts"),
          where("subjectId", "in", mySubjectIds),
          limit(50),
          orderBy("createdAt", "desc")
        );
        const postDocs = await getDocs(postQuery);
        const posts = postDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPostStateValue((prev) => ({
          ...prev,
          posts: posts as Post[],
        }));
      } else {
        buildNoUserHomeFeed();
      }
    } catch (error) {
      console.log("buildUserHomeFeed error", error);
    }
    setLoading(false);
  };

  const buildNoUserHomeFeed = async () => {
    setLoading(true);
    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        limit(50)
      );

      const postDocs = await getDocs(postQuery);
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }));
    } catch (error) {
      console.log("buildNoUserHomeFeed error", error);
    }
    setLoading(false);
  };

  const getUserPostVotes = async () => {
    try {
      const postIds = postStateValue.posts.map((post) => post.id);
      let postVotes: any = [];
      const limit = 10;
      while (postIds.length) {
        const postVotesQuery = query(
          collection(firestore, `users/${user?.uid}/postVotes`),
          where("postId", "in", postIds.slice(0, limit))
        );
        const postVoteDocs = await getDocs(postVotesQuery);
        const postVotesData = postVoteDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        postVotes.push(...postVotesData);
        postIds.splice(0, limit);
      }
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[],
      }));
    } catch (error) {
      console.log("getUserPostVotes error", error);
    }
  };

  // ... Additional unchanged code ...

  useEffect(() => {
    if (subjectStateValue.snippetsFetched) buildUserHomeFeed();
  }, [subjectStateValue.snippetsFetched]);

  useEffect(() => {
    if (!user && !loadingUser) buildNoUserHomeFeed();
  }, [user, loadingUser]);

  useEffect(() => {
    if (user && postStateValue.posts.length) getUserPostVotes();

    return () => {
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
      }));
    };
  }, [user, postStateValue.posts]);

  return (
    <PageContent>
      <Stack spacing={5}>
        <Recommendations />
      </Stack>
      <>
        <button className="back_to_top" onClick={scrollToTop}>
          BACK TO TOP
        </button>
        <CreatePostLink />
        <Analytics />
        <div>
          <Head>
            <script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6442166008118008"
              crossOrigin="anonymous"
            ></script>
            <title>GR8ER</title>
          </Head>
        </div>
        {loading ? (
          <PostLoader />
        ) : (
          <Stack>
            <Box display={{ base: "none", lg: "block" }} maxWidth="100%" marginBottom="8px">
              <Image
                onClick={handleSparklImageClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                src="/images/finalsparkl.png"
                width="100%"
                borderRadius="md"
                style={{ cursor: "pointer" }}
              />
            </Box>
            <div className='filter_main_section'>
              <div className='filter_main_grade_section'>
                  <Text style={{fontSize: "12px", fontWeight: "600"}}>MYP</Text>
                  <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('1') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '1')}>MYP 1</span>
                  <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('2') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '2')}>MYP 2</span>
                  <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('3') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '3')}>MYP 3</span>
                  <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('4') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '4')}>MYP 4</span>
                  <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('5') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '5')}>MYP 5</span>
              </div>
              <div className='filter_main_question_section'>
                  <Text style={{fontSize: "12px", fontWeight: "600", marginTop: "4px"}}>Type</Text>
                  <span className={`filter_main_question_sub_section_background ${activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes('Academic Question') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'Academic Question')}>Academic Questions</span>
                  <span className={`filter_main_question_sub_section_without_background ${activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes('General Doubt') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'General Doubt')}>General Doubts</span>
                  <span className={`filter_main_question_sub_section_without_backgrouund_border ${activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes('Resource') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'Resource')}>Resources</span>
              </div>
              <div className='filter_main_criteria_section'>
                  <Text style={{fontSize: "12px", fontWeight: "600", marginTop: "4px"}}>Criteria</Text>
                  <span className={`filter_main_criteria_sub_section_background ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('Criteria A') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria A')}>Criteria A</span>
                  <span className={`filter_main_criteria_sub_section_without_background ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('Criteria B') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria B')}>Criteria B</span>
                  <span className={`filter_main_criteria_sub_section_without_background ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('Criteria C') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria C')}>Criteria C</span>
                  <span className={`filter_main_criteria_sub_section_without_backgrouund_border ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('Criteria D') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria D')}>Criteria D</span>
              </div>
              <div className='filter_main_difficulty_section'>
                  <Text style={{fontSize: "12px", fontWeight: "600"}}>Difficulty (Academic Questions)</Text>
                  <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty && (activeFilters.difficulty as string[]).includes('easy') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'easy')}>Easy</span>
                  <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty && (activeFilters.difficulty as string[]).includes('medium') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'medium')}>Medium</span>
                  <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty && (activeFilters.difficulty as string[]).includes('hard') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'hard')}>Hard</span>
              </div>
          </div>
          
            {/* <Select placeholder='Sort By Tags' onChange={handleChangeFilter}>
                <option value='Criteria A'>Criteria A</option>
                <option value='Criteria B'>Criteria B</option>
                <option value='Criteria C'>Criteria C</option>
                <option value='Criteria D'>Criteria D</option>
                <option value='Academic Question'>Academic Question</option>
                <option value='General Question'>General Question</option>
            </Select> */}
            {postStateValue.posts.slice(0, 100).map((post) => (
           
          
         
           <PostItem
             key={post.id}
             post={post}
             onSelectPost={onSelectPost}
             onDeletePost={onDeletePost}
             onVote={onVote}
             userVoteValue={
               postStateValue.postVotes.find(
                 (item) => item.postId === post.id
               )?.voteValue
             }
             userIsCreator={user?.uid === post.creatorId}
             homePage
           />
       
))}

          </Stack>
        )}
      </>
    </PageContent>

    
  );
};

export default Home;


