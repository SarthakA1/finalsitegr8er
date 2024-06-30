import { Stack, Text } from "@chakra-ui/react";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import type { GetServerSideProps, NextPage } from "next";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import CreatePostLink from "../components/Subject/CreatePostLink";
import Recommendations from "../components/Subject/Recommendations";
import PostItem from "../components/Posts/PostItem";
import PostLoader from "../components/Posts/PostLoader";
import { auth, firestore } from "../firebase/clientApp";
import useSubjectData from "../hooks/useSubjectData";
import usePosts from "../hooks/usePosts";
import PageContent from "@/components/layout/PageContent";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";

interface Props {
  initialPosts: Post[];
}

const Home: NextPage<Props> = ({ initialPosts }) => {
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
          posts: posts,
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
      const posts = postDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts,
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
        postVotes: postVotes,
      }));
    } catch (error) {
      console.log("getUserPostVotes error", error);
    }
  };

  const getPostsByMaxVoting = async (voting: any) => {
    try {
      const difficultyQuery = query(
        collection(firestore, "diffculty_voting"),
        where("voting", "in", voting),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(difficultyQuery);
      const posts: { [postTitle: string]: number } = {};

      snapshot.forEach((doc) => {
        const post = doc.data();
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
  };

  const handleChangeTopFilter = (label: string, value: string) => {
    setActiveFilters((prevFilters) => {
      const updatedFilters: any = { ...prevFilters };
      if (
        updatedFilters[label] &&
        updatedFilters[label].includes(value)
      ) {
        updatedFilters[label] = updatedFilters[label].filter(
          (val: string) => val !== value
        );
      } else {
        updatedFilters[label] = [
          ...(updatedFilters[label] || []),
          value,
        ];
      }
      return updatedFilters;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gradeFilters = activeFilters.grade || [];
        const typeofquestionFilters =
          activeFilters.typeofquestion || [];
        const criteriaFilters = activeFilters.criteria || [];
        const difficultyFilters =
          activeFilters.difficulty || [];

        if (difficultyFilters.length > 0) {
          getPostsByMaxVoting(difficultyFilters).then(
            async (postTitles) => {
              console.log(
                `Posts with maximum ${difficultyFilters} voting:`,
                postTitles
              );
              if (postTitles.length > 0) {
                const postsQuery = query(
                  collection(firestore, "posts"),
                  ...(gradeFilters.length > 0
                    ? [
                        where(
                          "grade.value",
                          "in",
                          gradeFilters
                        ),
                      ]
                    : []),
                  ...(typeofquestionFilters.length > 0
                    ? [
                        where(
                          "typeOfQuestions.label",
                          "in",
                          typeofquestionFilters
                        ),
                      ]
                    : []),
                  ...(criteriaFilters.length > 0
                    ? [
                        where(
                          "criteria",
                          "array-contains-any",
                          criteriaFilters.map(
                            (val: any) => ({
                              label: val,
                              value: val,
                            })
                          )
                        ),
                      ]
                    : []),
                  ...(difficultyFilters.length > 0
                    ? [
                        where(
                          "title",
                          "in",
                          postTitles
                        ),
                      ]
                    : []),
                  orderBy("createdAt", "desc")
                );

                const postDocs = await getDocs(
                  postsQuery
                );

                // Store in post state
                const posts = postDocs.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                setPostStateValue((prev) => ({
                  ...prev,
                  posts: posts,
                }));
              } else {
                const posts: any = [];
                console.log("No postIds found.");
                setPostStateValue((prev) => ({
                  ...prev,
                  posts: posts,
                }));
              }
            }
          ).catch((error) => {
            console.error("Error:", error);
          });
        } else {
          // Check if any of the arrays are non-empty before including them in the query
          const postsQuery = query(
            collection(firestore, "posts"),
            ...(gradeFilters.length > 0
              ? [
                  where(
                    "grade.value",
                    "in",
                    gradeFilters
                  ),
                ]
              : []),
            ...(typeofquestionFilters.length > 0
              ? [
                  where(
                    "typeOfQuestions.label",
                    "in",
                    typeofquestionFilters
                  ),
                ]
              : []),
            ...(criteriaFilters.length > 0
              ? [
                  where(
                    "criteria",
                    "array-contains-any",
                    criteriaFilters.map(
                      (val: any) => ({
                        label: val,
                        value: val,
                      })
                    )
                  ),
                ]
              : []),
            orderBy("createdAt", "desc")
          );

          const postDocs = await getDocs(postsQuery);
          const posts = postDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPostStateValue((prev) => ({
            ...prev,
            posts: posts,
          }));
        }
      } catch (error: any) {
        console.error("Error fetching posts:", error.message);
      }
    };

    fetchData();
  }, [activeFilters, subjectStateValue.mySnippets.length]);

  useEffect(() => {
    if (!loadingUser && user) {
      getUserPostVotes();
    }
  }, [loadingUser, user]);

  useEffect(() => {
    if (!loadingUser) {
      if (subjectStateValue.mySnippets.length) {
        buildUserHomeFeed();
      } else {
        buildNoUserHomeFeed();
      }
    }
  }, [subjectStateValue, loadingUser]);

  return (
    <PageContent>
      <Head>
        <title>Home</title>
      </Head>

      <Analytics id="UA-XXXXX-Y" />

      <Stack spacing={4} mt={4}>
        {loading && <PostLoader />}

        {postStateValue.posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            user={user}
            onSelectPost={onSelectPost}
            onDeletePost={onDeletePost}
            onVote={onVote}
            isVoted={
              postStateValue.postVotes.some(
                (v) => v.postId === post.id
              ) || false
            }
          />
        ))}
      </Stack>

      <Stack spacing={4} mt={8}>
        <Text fontSize="lg">Create New Post:</Text>
        <CreatePostLink />
      </Stack>

      <Stack spacing={4} mt={8}>
        <Text fontSize="lg">Recommended for You:</Text>
        <Recommendations />
      </Stack>
    </PageContent>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const postQuery = query(
      collection(firestore, "posts"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const postDocs = await getDocs(postQuery);
    const initialPosts = postDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { props: { initialPosts } };
  } catch (error) {
    console.error("Error fetching initial posts:", error);
    return { props: { initialPosts: [] } };
  }
};

export default Home;
