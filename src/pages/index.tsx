
import { Stack, Select, Text, Flex, Box, Button, Wrap, Skeleton } from "@chakra-ui/react";
import useContentLibrary from "@/hooks/useContentLibrary";
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
import { Image } from "@chakra-ui/react";

import { Analytics } from '@vercel/analytics/react';



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
  const { contentItems, loading: contentLoading } = useContentLibrary();

  const isBrowser = () => typeof window !== 'undefined'; //The approach recommended by Next.js

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }





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
          limit(50),
          //orderBy('pinPost', 'desc'),
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
        orderBy("createdAt", "desc"),
        limit(50)
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
      let postVotes: any = []
      const limit = 10
      while (postIds.length) {
        const postVotesQuery = query(
          collection(firestore, `users/${user?.uid}/postVotes`),
          where('postId', 'in', postIds.slice(0, limit))
        );
        const postVoteDocs = await getDocs(postVotesQuery);
        const postVotesData = postVoteDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        postVotes.push(...postVotesData)
        postIds.splice(0, limit)
      }
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[],
      }));

      // console.log(postStateValue.posts);
      // const postIds = postStateValue.posts.map((post) => post.id);
      // console.log(postIds);
      // const postVotesQuery = query(
      //   collection(firestore, `users/${user?.uid}/postVotes`),
      //   where("postId", "in", postIds)
      // );
      // const postVoteDocs = await getDocs(postVotesQuery);
      // const postVotes = postVoteDocs.docs.map((doc) => ({
      //   id: doc.id,
      //   ...doc.data(),
      // }));

      // setPostStateValue((prev) => ({
      //   ...prev,
      //   postVotes: postVotes as PostVote[],
      // }));
    } catch (error) {
      console.log("getUserPostVotes error", error);
    }
  };
  const getPostsByMaxVoting = async (voting: any) => {
    try {
      console.log(voting);
      const difficultyQuery = query(
        collection(firestore, 'diffculty_voting'),
        where('voting', 'in', voting),
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
  const handleChangeTopFilter = (label: string, value: string) => {
    setActiveFilters((prevFilters) => {
      const updatedFilters: any = { ...prevFilters };
      if (updatedFilters[label] && updatedFilters[label].includes(value)) {
        updatedFilters[label] = updatedFilters[label].filter((val: string) => val !== value);
      } else {
        updatedFilters[label] = [... (updatedFilters[label] || []), value];
      }
      return updatedFilters;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gradeFilters = activeFilters.grade || [];
        const typeofquestionFilters = activeFilters.typeofquestion || [];
        const criteriaFilters = activeFilters.criteria || [];
        const difficultyFilters = activeFilters.difficulty || [];
        if (difficultyFilters.length > 0) {
          getPostsByMaxVoting(difficultyFilters)
            .then(async (postTitles) => {
              console.log(`Posts with maximum ${difficultyFilters} voting:`, postTitles);
              if (postTitles.length > 0) {
                const postsQuery = query(
                  collection(firestore, 'posts'),
                  ...(gradeFilters.length > 0 ? [where('grade.value', 'in', gradeFilters)] : []),
                  ...(typeofquestionFilters.length > 0 ? [where('typeOfQuestions.label', 'in', typeofquestionFilters)] : []),
                  ...(criteriaFilters.length > 0 ? [where('criteria', 'array-contains-any', criteriaFilters.map((val: any) => ({ label: val, value: val })))] : []),
                  ...(difficultyFilters.length > 0 ? [where('title', 'in', postTitles)] : []),
                  orderBy('createdAt', 'desc')
                );

                const postDocs = await getDocs(postsQuery);

                // Store in post state
                const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPostStateValue(prev => ({
                  ...prev,
                  posts: posts as Post[],
                }));
              } else {
                const posts: any = [];
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
        } else {
          // Check if any of the arrays are non-empty before including them in the query
          const postsQuery = query(
            collection(firestore, 'posts'),
            ...(gradeFilters.length > 0 ? [where('grade.value', 'in', gradeFilters)] : []),
            ...(typeofquestionFilters.length > 0 ? [where('typeOfQuestions.label', 'in', typeofquestionFilters)] : []),
            ...(criteriaFilters.length > 0 ? [where('criteria', 'array-contains-any', criteriaFilters.map((val: any) => ({ label: val, value: val })))] : []),
            orderBy('createdAt', 'desc')
          );

          const postDocs = await getDocs(postsQuery);
          const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPostStateValue(prev => ({ ...prev, posts: posts as Post[] }));
        }
        //console.log('Updated filters:', activeFilters);
        //console.log('Calling API with updated filters...');
      } catch (error: any) {
        console.log('Error fetching data:', error.message);
      }
    };
    fetchData();
  }, [activeFilters]);

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
        <button
          className={`back_to_top`}
          onClick={scrollToTop}
        >
          BACK TO TOP

        </button>
        <CreatePostLink />
        <Analytics />


        <div>
          <Head>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6442166008118008"
              crossOrigin="anonymous"></script>
            <title>GR8ER</title>

          </Head>

        </div>
        {loading ? (
          <PostLoader />
        ) : (

          <Stack spacing={4}>
            <Box
              display={{ base: "none", lg: "block" }} // Visible only on large screens and above
              maxWidth="100%" // Same width as the PostItem's parent container
              marginBottom="8px" // Space between the image and the PostItem
            >
              <Image
                onClick={() => window.open('https://www.sparkl.me/register', '_blank')}
                onMouseEnter={() => setIsHovered(true)} // Handle hover start
                onMouseLeave={() => setIsHovered(false)} // Handle hover end
                src="/images/finalsparkl.png" // Replace with the actual image URL
                width="100%"
                borderRadius="md" // Optional: Adds rounded corners
                style={{
                  cursor: 'pointer', // Change cursor to pointer on hover
                }}
              />
            </Box>

            {/* Content Library */}
            <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" shadow="sm">
              <Flex align="center" justify="space-between" mb={2}>
                <Text fontSize="md" fontWeight="700" color="gray.700">Content Library</Text>
                <Button size="xs" variant="ghost" colorScheme="brand">View All</Button>
              </Flex>
              <Stack spacing={3}>
                {contentLoading ? (
                  <Stack>
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                  </Stack>
                ) : (
                  <>
                    {contentItems.length > 0 ? (
                      contentItems.map((item, index) => (
                        <Flex
                          key={item.id}
                          align="center"
                          p={2}
                          _hover={{ bg: "gray.50" }}
                          borderRadius="md"
                          cursor="pointer"
                          transition="all 0.2s"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <Image src="/images/pdf.png" height="24px" width="24px" mr={3} alt="PDF" />
                          <Text fontSize="sm" fontWeight="500" color="gray.600" noOfLines={1}>{item.title}</Text>
                        </Flex>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">No content available.</Text>
                    )}
                  </>
                )}
              </Stack>
            </Box>

            {/* Filters */}
            <Stack spacing={3} p={2} bg="white" borderRadius="md">
              <Flex align="center" wrap="wrap" gap={2}>
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mr={2}>MYP Grade:</Text>
                {['1', '2', '3', '4', '5'].map((grade) => (
                  <Button
                    key={grade}
                    size="xs"
                    variant={activeFilters.grade && (activeFilters.grade as string[]).includes(grade) ? "solid" : "outline"}
                    colorScheme="brand"
                    onClick={() => handleChangeTopFilter('grade', grade)}
                    borderRadius="full"
                  >
                    MYP {grade}
                  </Button>
                ))}
              </Flex>

              <Flex align="center" wrap="wrap" gap={2}>
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mr={2}>Type:</Text>
                {[
                  { label: 'Academic Questions', value: 'Academic Question' },
                  { label: 'General Doubts', value: 'General Doubt' },
                  { label: 'Resources', value: 'Resource' }
                ].map((type) => (
                  <Button
                    key={type.value}
                    size="xs"
                    variant={activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes(type.value) ? "solid" : "outline"}
                    colorScheme={type.value === 'Resource' ? "green" : type.value === 'General Doubt' ? "orange" : "blue"}
                    onClick={() => handleChangeTopFilter('typeofquestion', type.value)}
                    borderRadius="full"
                  >
                    {type.label}
                  </Button>
                ))}
              </Flex>

              <Flex align="center" wrap="wrap" gap={2}>
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mr={2}>Criteria:</Text>
                {['Criteria A', 'Criteria B', 'Criteria C', 'Criteria D'].map((criteria) => (
                  <Button
                    key={criteria}
                    size="xs"
                    variant={activeFilters.criteria && (activeFilters.criteria as string[]).includes(criteria) ? "solid" : "outline"}
                    colorScheme="gray"
                    onClick={() => handleChangeTopFilter('criteria', criteria)}
                    borderRadius="full"
                  >
                    {criteria}
                  </Button>
                ))}
              </Flex>
            </Stack>

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
