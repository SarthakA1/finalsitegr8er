import { Post } from '@/atoms/postsAtom';
import PageContentLayout from '@/components/layout/PageContent';
import PageContent from '@/components/layout/PageContent';
import Answers from '@/components/Posts/Answers/Answers';
import PostItem from '@/components/Posts/PostItem';
import PostLoader from '@/components/Posts/PostLoader';
import About from '@/components/Subject/About';
import { auth, firestore } from '@/firebase/clientApp';
import usePosts from '@/hooks/usePosts';
import useSubjectData from '@/hooks/useSubjectData';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';


const PostPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const { postStateValue, setPostStateValue, onDeletePost, onVote } =
    usePosts();
  const router = useRouter();
  const { subjectStateValue } = useSubjectData();

  const fetchPost = async (postId: string) => {
    try {
      const postDocRef = doc(firestore, "posts", postId);
      const postDoc = await getDoc(postDocRef);
      setPostStateValue((prev) => ({
        ...prev,
        selectedPost: { id: postDoc.id, ...postDoc.data() } as Post,
      }));
    } catch (error) {
      console.log("fetchPost error", error);
    }
  };

  useEffect(() => {
    const { pid } = router.query;

    if (pid && !postStateValue.selectedPost) {
      fetchPost(pid as string);
    }
  }, [router.query, postStateValue.selectedPost]);

  return (
    <PageContent>
      <>
        {postStateValue.selectedPost && (
          <PostItem
            post={postStateValue.selectedPost}
            onVote={onVote}
            onDeletePost={onDeletePost}
            userVoteValue={
              postStateValue.postVotes.find(
                (item) => item.postId === postStateValue.selectedPost?.id
              )?.voteValue
            }
            userIsCreator={user?.uid === postStateValue.selectedPost?.creatorId}
          />
        )}

        <div>
          <Head>
            <title>{postStateValue.selectedPost?.title || postStateValue.selectedPost?.subjectId} </title>
          </Head>
        </div>

        <Answers
          user={user as User}
          selectedPost={postStateValue.selectedPost}
          subjectId={postStateValue.selectedPost?.subjectId as string}
        />
      </>
      <>
        {subjectStateValue.currentSubject && (
          <About subjectData={subjectStateValue.currentSubject} />
        )}
      </>
    </PageContent>
  );
}
export default PostPage;
