

import { Post, PostState, PostVote } from '@/atoms/postsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import { auth, firestore, storage } from '@/firebase/clientApp';
import { collection, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';

type usePostsProps = {
    
};

const usePosts = (subjectData?: Subject) => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [postStateValue, setPostStateValue] = useRecoilState(PostState);

    const onVote = async (post: Post, vote: number, subjectId: string) => {


        try {
            const { voteStatus } = post;
            const existingVote = postStateValue.postVotes.find(vote => vote.postId === post.id)
            const batch = writeBatch(firestore)
            const updatedPost = { ...post }
            const updatedPosts = [ ...postStateValue.posts ]
            let updatedPostVotes = [ ...postStateValue.postVotes ];
            let voteChange = vote;

            if (!existingVote) {
                const postVoteRef = doc(
                    collection(firestore, 'users',`${user!.uid}/postVotes`)
                    )

                    const newVote: PostVote = {
                        id: postVoteRef.id,
                        postId: post.id!,
                        subjectId,
                        voteValue: vote
                    }

                    batch.set(postVoteRef, newVote)

                    await batch.commit

                    updatedPost.voteStatus = voteStatus + vote;
                    updatedPostVotes = [...updatedPostVotes, newVote]

            }
    
            else {
                const postVoteRef = doc(firestore,  'users', `${user!.uid}/postVotes/${existingVote.id}`)


                if (existingVote.voteValue === vote) {
                    updatedPost.voteStatus = voteStatus - vote;
                    updatedPostVotes = updatedPostVotes.filter(vote => vote.id !== existingVote.id)


                    batch.delete(postVoteRef);
                    voteChange *= -1;

                }

                else {
                    updatedPost.voteStatus = voteStatus + 2 * vote;
                    const voteIdx = postStateValue.postVotes.findIndex((vote) => vote.id === existingVote.id)

                    updatedPostVotes[voteIdx] = {
                        ...existingVote,
                        voteValue: vote
                    }


                    batch.update(postVoteRef, {
                        voteValue: vote
                    })
                }
            }

            const postRef = doc(firestore, 'posts', post.id!);
            batch.update(postRef, {voteStatus: voteStatus + voteChange})

            await batch.commit();

            const postIdx = postStateValue.posts.findIndex(item => item.id === post.id);
            updatedPosts [postIdx] = updatedPost;
            setPostStateValue(prev => ({
                ...prev,
                posts: updatedPosts,
                postVotes: updatedPostVotes
            }))

            if (postStateValue.selectedPost) {
                setPostStateValue((prev) => ({
                ...prev, 
                selectedPost: updatedPost,
                }));
            }


        } catch (error) {
            console.log('onVote error', error)
            
        }

       

    };

    const onSelectPost = (post: Post) => {
        setPostStateValue((prev) => ({
            ...prev,
            selectedPost: post,
        }))
        router.push(`/subject/${post.subjectId}/answers/${post.id}`)
    };



    const onDeletePost = async (post: Post): Promise<boolean> => {


        try {
            //checking if image exists and deleting from storage of database
            if (post.imageURL) {
                const imageRef = ref(storage, `posts/${post.id}/image`)
                await deleteObject(imageRef);
            }


            //deleting post itself from firestore database
            const postDocRef = doc(firestore, "posts", post.id!)
            await deleteDoc(postDocRef);

            //update recoil state and UI
            setPostStateValue((prev) => ({
                ...prev,
                posts: prev.posts.filter(item => item.id !== post.id),
            }))

            
        return true;
            
        } catch (error) {
        return false;
            
        }
    };
    
    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost,
    }
}
export default usePosts;

function deletedoc(postDocRef: any) {
    throw new Error('Function not implemented.');
}

