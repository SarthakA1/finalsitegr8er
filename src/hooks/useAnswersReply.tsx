import { AnswerReply, AnswerReplyState, AnswerReplyVote } from '@/atoms/answersReplyAtom';
import { Post, PostState } from '@/atoms/postsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import { auth, firestore, storage } from '@/firebase/clientApp';
import { collection, deleteDoc, doc, writeBatch, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useSetRecoilState } from 'recoil';

export type Notifications = {
    id: string;
    notifyBy: string | undefined;
    notifyTo: string;
    notification: string;
    isRead: number;
    notificationType: string;
    createdAt: Timestamp;

}
const useAnswersReply = () => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingDeleteId, setLoadingDeleteId] = useState("");
    const [answerReplyStateValue, setAnswerReplyStateValue] = useRecoilState(AnswerReplyState);
    const setPostState = useSetRecoilState(PostState);

    const onAnswerReplyVote = async (answerReply: AnswerReply, vote: number, subjectId: string) => {


        try {
            const { voteStatus } = answerReply;
            const existingVote = answerReplyStateValue.answerReplyVotes.find(vote => vote.answerId === answerReply.id)
            const batch = writeBatch(firestore)
            const updatedAnswer = { ...answerReply }
            const updatedAnswers = [ ...answerReplyStateValue.answersReply ]
            let updatedAnswerVotes = [ ...answerReplyStateValue.answerReplyVotes ];
            let voteChange = vote;

            if (!existingVote) {
                const answerVoteRef = doc(
                    collection(firestore, 'users',`${user!.uid}/answersReplyVotes`)
                    )
                    const newVote: AnswerReplyVote = {
                        id: answerVoteRef.id,
                        postId: answerReply.postId!,
                        answerId: answerReply.id!,
                        subjectId,
                        voteValue: vote
                    }
                    batch.set(answerVoteRef, newVote)
                    await batch.commit
                    updatedAnswer.voteStatus = voteStatus + vote;
                    updatedAnswerVotes = [...updatedAnswerVotes, newVote]

                    const notificationDocRef = doc(collection(firestore, 'notifications'))
                    if(user?.uid !== answerReply?.creatorId){
                        const newNotification: Notifications = {
                            id: notificationDocRef.id,
                            notifyBy: user?.displayName! || user?.email!.split("@")[0],
                            notifyTo: answerReply?.creatorDisplayText!,
                            notification: user?.displayName! || user?.email!.split("@")[0]+' liked your reply <a href="/subject/'+answerReply?.subjectId+'/answers/'+answerReply?.postId+'">'+answerReply?.text+'</a>',
                            isRead: 0,
                            notificationType: 'like-dislike-post',
                            createdAt: serverTimestamp() as Timestamp,
                        }
                        batch.set(notificationDocRef, newNotification);
                    }
            }
    
            else {
                const answerVoteRef = doc(firestore,  'users', `${user!.uid}/answerReplyVotes/${existingVote.id}`)
                if (existingVote.voteValue === vote) {
                    updatedAnswer.voteStatus = voteStatus - vote;
                    updatedAnswerVotes = updatedAnswerVotes.filter(vote => vote.id !== existingVote.id)
                    batch.delete(answerVoteRef);
                    voteChange *= -1;
                } else {
                    updatedAnswer.voteStatus = voteStatus + 2 * vote;
                    const voteIdx = answerReplyStateValue.answerReplyVotes.findIndex((vote) => vote.id === existingVote.id)
                    updatedAnswerVotes[voteIdx] = {
                        ...existingVote,
                        voteValue: vote
                    }
                    batch.update(answerVoteRef, {
                        voteValue: vote
                    })
                }
                const notificationDocRef = doc(collection(firestore, 'notifications'))
                if(user?.uid !== answerReply?.creatorId){
                    const newNotification: Notifications = {
                        id: notificationDocRef.id,
                        notifyBy: user?.displayName! || user?.email!.split("@")[0],
                        notifyTo: answerReply?.creatorDisplayText!,
                        notification: user?.displayName! || user?.email!.split("@")[0]+' disliked your reply <a href="/subject/'+answerReply?.subjectId+'/answers/'+answerReply?.postId+'">'+answerReply?.text+'</a>',
                        isRead: 0,
                        notificationType: 'like-dislike-post',
                        createdAt: serverTimestamp() as Timestamp,
                    }
                    batch.set(notificationDocRef, newNotification);
                }
            }
            const answerRef = doc(firestore, 'answers_reply', answerReply.id!);
            batch.update(answerRef, {voteStatus: voteStatus + voteChange})
            await batch.commit();
            const answerIdx = answerReplyStateValue.answersReply.findIndex(item => item.id === answerReply.id);
            updatedAnswers [answerIdx] = updatedAnswer;
            setAnswerReplyStateValue(prev => ({
                ...prev,
                answersReply: updatedAnswers,
                answerReplyVotes: updatedAnswerVotes
            }))
            if (answerReplyStateValue.selectedPost) {
                setAnswerReplyStateValue((prev) => ({
                ...prev, 
                selectedPost: updatedAnswer,
                }));
            }
        } catch (error) {
            console.log('onVote error', error)
        }
    };

    const onSelectAnswerReply = (answer: AnswerReply) => {
        setAnswerReplyStateValue((prev) => ({
            ...prev,
            selectedPost: answer,
        }))
        router.push(`/subject/${answer.subjectId}/answers-reply/${answer.postId}`)
    };



    const onDeleteAnswerReply = async (answer: AnswerReply): Promise<boolean> => {
        setLoadingDeleteId(answer.id!)
        try {
            const batch = writeBatch(firestore);
            const answerreplyDocRef = doc(firestore, 'answers_reply', answer.id!);
            batch.delete(answerreplyDocRef);

            const postDocRef= doc(firestore, 'posts', answer?.postId!)
            batch.update(postDocRef, {
                numberOfAnswers: increment(-1)
            })

            await batch.commit()

            setPostState(prev => ({
                ...prev,
                selectedPost: {
                    ...prev.selectedPost,
                    numberOfAnswers: prev.selectedPost?.numberOfAnswers! -1
                } as Post
            }))

            setAnswerReplyStateValue((prev) => ({
                ...prev,
                answers: prev.answersReply.filter(item => item.id !== answer.id),
            }))
            return true;
        } catch (error) {
            return false;
        }
        setLoadingDeleteId('')
    };
    
    return {
        answerReplyStateValue,
        setAnswerReplyStateValue,
        onAnswerReplyVote,
        onSelectAnswerReply,
        onDeleteAnswerReply,
    }
}
export default useAnswersReply;

function deletedoc(answerDocRef: any) {
    throw new Error('Function not implemented.');
}
