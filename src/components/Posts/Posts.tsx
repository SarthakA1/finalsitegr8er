import { Post } from '@/atoms/postsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import { auth, firestore } from '@/firebase/clientApp';
import usePosts from '@/hooks/usePosts';
import { Stack } from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import PostItem from './PostItem';
import PostLoader from './PostLoader';

type PostsProps = {
    subjectData: Subject;
    userId?: string;


};

const Posts: React.FC<PostsProps> = ({ subjectData, userId }) => {
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const { postStateValue, setPostStateValue, onVote, onDeletePost, onSelectPost } = usePosts(subjectData!);

    const getPosts = async () => {
        try {
            //get posts for the subject
            const postsQuery = query(
                collection(firestore, 'posts'),
                where('subjectId', '==', subjectData.id),
                orderBy('createdAt', 'desc')
            )
            const postDocs = await getDocs(postsQuery);

            //store in post state
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setPostStateValue(prev  => ({
                ...prev,
                posts: posts as Post[],
            }))
        } catch (error: any) {
            console.log('getPosts error', error.message)
        }
    };

    useEffect(() => {
        getPosts();
    }, [subjectData])

    return (
        <>
        { loading ? (
            <PostLoader />
        ) : ( 
        <Stack spacing={5}>
        {postStateValue.posts.map((item: any) => 
        <PostItem 
        post={item} 
        userIsCreator={user?.uid === item.creatorId}
        userVoteValue={postStateValue.postVotes.find((vote: { postId: any; }) => vote.postId === item.id)?.voteValue}
        onVote={onVote}
        onSelectPost={onSelectPost}
        onDeletePost={onDeletePost}
        />
        )}
        </Stack>
        )}
        
        </>
        )
}
export default Posts;