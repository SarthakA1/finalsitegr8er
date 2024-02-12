import { Stack, Select } from "@chakra-ui/react";
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
import Head from 'next/head'
import { Analytics } from '@vercel/analytics/react';

 

const Home: NextPage = () => {
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





  const buildUserHomeFeed = async () => {
    setLoading(true);
    try {
      if (subjectStateValue.mySnippets.length) {
        // get posts from users' subjects
        const mySubjectIds = subjectStateValue.mySnippets.map(
          (snippet) => snippet.subjectId
        );
        //console.log('mySubjectIds', mySubjectIds)
        const postQuery = query(
          collection(firestore, "posts"),
          where("subjectId", "in", mySubjectIds),
          limit(20),
          orderBy('pinPost', 'desc'),
          orderBy('createdAt', 'desc')
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
        limit(10)
      );

      const postDocs = await getDocs(postQuery);
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }));

      // setPostState
    } catch (error) {
      console.log("buildNoUserHomeFeed error", error);
    }
    setLoading(false);
  };

  const getUserPostVotes = async () => {
    try {
      const postIds = postStateValue.posts.map((post) => post.id);
      const postVotesQuery = query(
        collection(firestore, `users/${user?.uid}/postVotes`),
        where("postId", "in", postIds)
      );
      const postVoteDocs = await getDocs(postVotesQuery);
      const postVotes = postVoteDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[],
      }));
    } catch (error) {
      console.log("getUserPostVotes error", error);
    }
  };
  const getPostsByMaxVoting = async (voting:any) => {
    try {
        console.log(voting);
        const difficultyQuery = query(
            collection(firestore, 'diffculty_voting'),
            where('voting', '==', voting),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(difficultyQuery);
        console.log(snapshot);
        const posts: { [postTitle: string]: number } = {}; // Use an object to store postId and its voting count
    
        snapshot.forEach((doc) => {
            const post = doc.data(); // Access document data using data() method
            const postTitle = post.postTitle;
            const votingCount = posts[postTitle] ? posts[postTitle] : 0;
            posts[postTitle] = votingCount + 1;
        });
    
        let maxVotingCount = 0;
        for (const postTitle in posts) {
            if (posts[postTitle] > maxVotingCount) {
                maxVotingCount = posts[postTitle];
            }
        }
    
        const maxVotingPosts: string[] = [];
        for (const postTitle in posts) {
            if (posts[postTitle] === maxVotingCount) {
                maxVotingPosts.push(postTitle);
            }
        }
    
        return maxVotingPosts;
    } catch (error) {
        console.error("Error getting posts:", error);
        return [];
    } 
  }
  const handleChangeTopFilter = async (label:any, value:any) => {
    const selectedTopFilterValue = value;
    const selectedTopFilterLabel = label;
    const mySubjectIds = subjectStateValue.mySnippets.map((snippet) => snippet.subjectId);
    setActiveFilters((prevFilters) => ({
      ...prevFilters,
      [selectedTopFilterLabel]: selectedTopFilterValue,
    }));
    if(selectedTopFilterLabel == 'grade'){
        try {
            const postsQuery = query(
                collection(firestore, 'posts'),
                where("subjectId", "in", mySubjectIds),
                where('grade.value', '==', selectedTopFilterValue),
                orderBy('pinPost', 'desc'),  // Order by pinPost in descending order
                orderBy('createdAt', 'desc') // Then, order by createdAt in descending order
            );
    
            const postDocs = await getDocs(postsQuery);
    
            // Store in post state
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPostStateValue(prev => ({
                ...prev,
                posts: posts as Post[],
            }));
        } catch(error: any){
            console.log('getPosts error', error.message);
        }
    } else if(selectedTopFilterLabel == 'typeofquestion') {
        try {
            const postsQuery = query(
                collection(firestore, 'posts'),
                where("subjectId", "in", mySubjectIds),
                where('typeOfQuestions.label', '==', selectedTopFilterValue),  // Search based on label
                where('typeOfQuestions.value', '==', selectedTopFilterValue), 
                orderBy('pinPost', 'desc'),  // Order by pinPost in descending order
                orderBy('createdAt', 'desc') // Then, order by createdAt in descending order
            );
    
            const postDocs = await getDocs(postsQuery);
    
            // Store in post state
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPostStateValue(prev => ({
                ...prev,
                posts: posts as Post[],
            }));
        } catch(error: any) {
            console.log('getPosts error', error.message);
        }
    } else if(selectedTopFilterLabel == 'criteria'){
        try {
            const postsQuery = query(
                collection(firestore, 'posts'),
                where("subjectId", "in", mySubjectIds),
                where('criteria', 'array-contains', { label: selectedTopFilterValue, value: selectedTopFilterValue }),
                orderBy('pinPost', 'desc'),  // Order by pinPost in descending order
                orderBy('createdAt', 'desc') // Then, order by createdAt in descending order
            );
    
            const postDocs = await getDocs(postsQuery);
    
            // Store in post state
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPostStateValue(prev => ({
                ...prev,
                posts: posts as Post[],
            }));
        } catch(error: any){
            console.log('getPosts error', error.message);
        }
    } else if(selectedTopFilterLabel == 'difficulty'){
        try {
          getPostsByMaxVoting(selectedTopFilterValue)
          .then(async (postTitles) => {
              console.log(`Posts with maximum ${selectedTopFilterValue} voting:`, postTitles);
              if (postTitles.length > 0) {
                  const postsQuery = query(
                      collection(firestore, 'posts'),
                      where('title', 'in', postTitles),
                      orderBy('pinPost', 'desc'),  // Order by pinPost in descending order
                      orderBy('createdAt', 'desc') // Then, order by createdAt in descending order
                  );
          
                  const postDocs = await getDocs(postsQuery);
          
                  // Store in post state
                  const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  setPostStateValue(prev => ({
                      ...prev,
                      posts: posts as Post[],
                  }));
              } else {
                  const posts:any = [];
                  console.log('No postIds found.');
                  setPostStateValue(prev => ({
                      ...prev,
                      posts: posts as Post[],
                  }));
              }
          })
          .catch((error) => {
              console.error("Error:", error);
          });
        } catch(error: any){
            console.log('getPosts error', error.message);
        }
    } else {
        try {
            const postsQuery = query(
                collection(firestore, 'posts'),
                where("subjectId", "in", mySubjectIds),
                orderBy('pinPost', 'desc'),  // Order by pinPost in descending order
                orderBy('createdAt', 'desc') // Then, order by createdAt in descending order
            );
    
            const postDocs = await getDocs(postsQuery);
    
            // Store in post state
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPostStateValue(prev => ({
                ...prev,
                posts: posts as Post[],
            }));
        } catch(error: any){
            console.log('getPosts error', error.message);
        }
    }
  }
  // const handleChangeFilter = async(e:any) => {
  //   const selectedFilterValue = e.target.value;
  //   if(selectedFilterValue){
  //     if(selectedFilterValue!== 'General Question' && selectedFilterValue!== 'Academic Question'){
  //       setLoading(true);
  //       try {
  //         if (subjectStateValue.mySnippets.length) {
  //           // get posts from users' subjects
  //           const mySubjectIds = subjectStateValue.mySnippets.map(
  //             (snippet) => snippet.subjectId
  //           );
  //           //console.log('mySubjectIds', mySubjectIds)
  //           const postQuery = query(
  //             collection(firestore, "posts"),
  //             where("subjectId", "in", mySubjectIds),
  //             where('criteria', 'array-contains', { label: e.target.value, value: e.target.value }),
  //             limit(20),
  //             orderBy('pinPost', 'desc'),
  //             orderBy('createdAt', 'desc')
  //           );
  //           const postDocs = await getDocs(postQuery);
  //           const posts = postDocs.docs.map((doc) => ({
  //             id: doc.id,
  //             ...doc.data(),
  //           }));
  //           setPostStateValue((prev) => ({
  //             ...prev,
  //             posts: posts as Post[],
  //           }));
  //         } else {
  //           buildNoUserHomeFeed();
  //         }
  //       } catch (error) {
  //         console.log("buildUserHomeFeed error", error);
  //       }
  //       setLoading(false);
  //     } else {
  //       setLoading(true);
  //       try {
  //         if (subjectStateValue.mySnippets.length) {
  //           // get posts from users' subjects
  //           const mySubjectIds = subjectStateValue.mySnippets.map(
  //             (snippet) => snippet.subjectId
  //           );
  //           //console.log('mySubjectIds', mySubjectIds)
  //           const postQuery = query(
  //             collection(firestore, "posts"),
  //             where("subjectId", "in", mySubjectIds),
  //             where('typeOfQuestions.label', '==', e.target.value),  // Search based on label
  //             where('typeOfQuestions.value', '==', e.target.value), 
  //             limit(20),
  //             orderBy('pinPost', 'desc'),
  //             orderBy('createdAt', 'desc')
  //           );
  //           const postDocs = await getDocs(postQuery);
  //           const posts = postDocs.docs.map((doc) => ({
  //             id: doc.id,
  //             ...doc.data(),
  //           }));
  //           setPostStateValue((prev) => ({
  //             ...prev,
  //             posts: posts as Post[],
  //           }));
  //         } else {
  //           buildNoUserHomeFeed();
  //         }
  //       } catch (error) {
  //         console.log("buildUserHomeFeed error", error);
  //       }
  //       setLoading(false);
  //     } 
  //   } else {
  //     setLoading(true);
  //     try {
  //       if (subjectStateValue.mySnippets.length) {
  //         // get posts from users' subjects
  //         const mySubjectIds = subjectStateValue.mySnippets.map(
  //           (snippet) => snippet.subjectId
  //         );
  //         //console.log('mySubjectIds', mySubjectIds)
  //         const postQuery = query(
  //           collection(firestore, "posts"),
  //           where("subjectId", "in", mySubjectIds),
  //           limit(20),
  //           orderBy('pinPost', 'desc'),
  //           orderBy('createdAt', 'desc')
  //         );
  //         const postDocs = await getDocs(postQuery);
  //         const posts = postDocs.docs.map((doc) => ({
  //           id: doc.id,
  //           ...doc.data(),
  //         }));
  //         setPostStateValue((prev) => ({
  //           ...prev,
  //           posts: posts as Post[],
  //         }));
  //       } else {
  //         buildNoUserHomeFeed();
  //       }
  //     } catch (error) {
  //       console.log("buildUserHomeFeed error", error);
  //     }
  //     setLoading(false);
  //   }
  // }

  // useEffects
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
        <CreatePostLink />
        <Analytics />
        
        
        <div>
      <Head>
        <title>GR8ER</title>
      </Head>
      
    </div>
        {loading ? (
          <PostLoader />
        ) : (
          <Stack>
            <div className='filter_main_section'>
                <div className='filter_main_grade_section'>
                    <span className={`filter_main_grade_sub_section ${activeFilters.grade === '1' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '1')}>MYP 1</span>
                    <span className={`filter_main_grade_sub_section ${activeFilters.grade === '2' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '2')}>MYP 2</span>
                    <span className={`filter_main_grade_sub_section ${activeFilters.grade === '3' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '3')}>MYP 3</span>
                    <span className={`filter_main_grade_sub_section ${activeFilters.grade === '4' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '4')}>MYP 4</span>
                    <span className={`filter_main_grade_sub_section ${activeFilters.grade === '5' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '5')}>MYP 5</span>
                </div>
                <div className='filter_main_question_section'>
                    <span className={`filter_main_question_sub_section_background ${activeFilters.typeofquestion === 'Academic Question' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'Academic Question')}>Academic Question</span>
                    <span className={`filter_main_question_sub_section_without_background ${activeFilters.typeofquestion === 'General Doubts' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'General Doubts')}>General Doubts</span>
                    <span className={`filter_main_question_sub_section_without_backgrouund_border ${activeFilters.typeofquestion === 'Resources' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'Resources')}>Resources</span>
                </div>
                <div className='filter_main_criteria_section'>
                    <span className={`filter_main_criteria_sub_section_background ${activeFilters.criteria === 'Criteria A' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria A')}>Criteria A</span>
                    <span className={`filter_main_criteria_sub_section_without_background ${activeFilters.criteria === 'Criteria B' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria B')}>Criteria B</span>
                    <span className={`filter_main_criteria_sub_section_without_background ${activeFilters.criteria === 'Criteria C' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria C')}>Criteria C</span>
                    <span className={`filter_main_criteria_sub_section_without_backgrouund_border ${activeFilters.criteria === 'Criteria D' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria D')}>Criteria D</span>
                </div>
                <div className='filter_main_difficulty_section'>
                    <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty === 'easy' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'easy')}>Easy</span>
                    <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty === 'medium' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'medium')}>Medium</span>
                    <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty === 'hard' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'hard')}>Hard</span>
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
            {postStateValue.posts.map((post) => (
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
