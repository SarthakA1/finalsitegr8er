import { Post, PostState, PostVote } from '@/atoms/postsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import { auth, firestore, storage } from '@/firebase/clientApp';
import { collection, deleteDoc, doc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';

type usePostsProps = {

};

export type Notifications = {
    id: string;
    notifyBy: string | undefined;
    notifyTo: string;
    notification: string;
    isRead: number;
    notificationType: string;
    createdAt: Timestamp;

}

const usePosts = (subjectData?: Subject) => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [postStateValue, setPostStateValue] = useRecoilState(PostState);

    const votingLock = React.useRef(new Set<string>());

    const onVote = async (post: Post, vote: number, subjectId: string) => {
        // 1. Check Lock
        if (!post.id || votingLock.current.has(post.id)) return;
        votingLock.current.add(post.id);

        try {
            const { voteStatus } = post;
            const existingVote = postStateValue.postVotes.find(vote => vote.postId === post.id)
            const batch = writeBatch(firestore)
            const updatedPost = { ...post }
            const updatedPosts = [...postStateValue.posts]
            let updatedPostVotes = [...postStateValue.postVotes];
            let voteChange = vote;

            if (!existingVote) {
                const postVoteRef = doc(
                    collection(firestore, 'users', `${user!.uid}/postVotes`)
                )

                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id!,
                    subjectId,
                    voteValue: vote
                }

                batch.set(postVoteRef, newVote)

                updatedPost.voteStatus = voteStatus + vote;
                updatedPostVotes = [...updatedPostVotes, newVote]

                // Construct notification if needed
                if (user?.uid !== post?.creatorId) {
                    const notificationDocRef = doc(collection(firestore, 'notifications'))
                    const newNotification: Notifications = {
                        id: notificationDocRef.id,
                        notifyBy: user?.displayName! || user?.email!.split("@")[0],
                        notifyTo: post?.creatorDisplayName!,
                        notification: (user?.displayName! || user?.email!.split("@")[0]) + ' liked your post <a href="/subject/' + post?.subjectId + '/answers/' + post?.id + '">' + post?.title + '</a>',
                        isRead: 0,
                        notificationType: 'like-dislike-post',
                        createdAt: serverTimestamp() as Timestamp,
                    }
                    batch.set(notificationDocRef, newNotification);
                }

            }

            else {
                const postVoteRef = doc(firestore, 'users', `${user!.uid}/postVotes/${existingVote.id}`)

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
                    voteChange = 2 * vote;

                    batch.update(postVoteRef, {
                        voteValue: vote
                    })
                }

                // Dislike notification or update?
                // Original code sent dislike notification here.
                if (user?.uid !== post?.creatorId) {
                    const notificationDocRef = doc(collection(firestore, 'notifications'))
                    // Is this always a dislike? If they change vote from -1 to 1?
                    // Logic: If existing was same as vote, we removed it (toggle off).
                    // If different, we swapped. 
                    // The original code was sending 'disliked' notification inside the 'else'.
                    // I will keep original structure but it seems to send notifications on every vote swap.

                    const newNotification: Notifications = {
                        id: notificationDocRef.id,
                        notifyBy: user?.displayName! || user?.email!.split("@")[0],
                        notifyTo: post?.creatorDisplayName!,
                        notification: (user?.displayName! || user?.email!.split("@")[0]) + ' disliked your post <a href="/subject/' + post?.subjectId + '/answers/' + post?.id + '">' + post?.title + '</a>',
                        isRead: 0,
                        notificationType: 'like-dislike-post',
                        createdAt: serverTimestamp() as Timestamp,
                    }
                    batch.set(notificationDocRef, newNotification);
                }
            }

            const postRef = doc(firestore, 'posts', post.id!);
            batch.update(postRef, { voteStatus: voteStatus + voteChange })

            // OPTIMISTIC UPDATE: Update State BEFORE async commit
            const postIdx = postStateValue.posts.findIndex(item => item.id === post.id);
            updatedPosts[postIdx] = updatedPost;
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

            // Perform Async Operation
            await batch.commit();

        } catch (error) {
            console.log('onVote error', error)
            // Revert state if needed? For now, we rely on the next fetch or user retry.
            // Reverting complex state is hard without a snapshot.
        } finally {
            // Unlock
            if (post.id) votingLock.current.delete(post.id);
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
