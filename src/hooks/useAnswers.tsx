import { Answer, AnswerState, AnswerVote } from '@/atoms/answersAtom';
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
const useAnswers = () => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingDeleteId, setLoadingDeleteId] = useState("");
    const [answerStateValue, setAnswerStateValue] = useRecoilState(AnswerState);
    const setPostState = useSetRecoilState(PostState);

    const onVote = async (answer: Answer, vote: number, subjectId: string) => {


        try {
            const { voteStatus } = answer;
            const existingVote = answerStateValue.answerVotes.find(vote => vote.answerId === answer.id)
            const batch = writeBatch(firestore)
            const updatedAnswer = { ...answer }
            const updatedAnswers = [ ...answerStateValue.answers ]
            let updatedAnswerVotes = [ ...answerStateValue.answerVotes ];
            let voteChange = vote;

            if (!existingVote) {
                const answerVoteRef = doc(
                    collection(firestore, 'users',`${user!.uid}/answersVotes`)
                    )
                    const newVote: AnswerVote = {
                        id: answerVoteRef.id,
                        postId: answer.postId!,
                        answerId: answer.id!,
                        subjectId,
                        voteValue: vote
                    }
                    batch.set(answerVoteRef, newVote)
                    await batch.commit
                    updatedAnswer.voteStatus = voteStatus + vote;
                    updatedAnswerVotes = [...updatedAnswerVotes, newVote]

                const notificationDocRef = doc(collection(firestore, 'notifications'))
                if(user?.uid !== answer?.creatorId){
                    const newNotification: Notifications = {
                        id: notificationDocRef.id,
                        notifyBy: user?.displayName! || user?.email!.split("@")[0],
                        notifyTo: answer?.creatorDisplayText!,
                        notification: user?.displayName! || user?.email!.split("@")[0]+' liked your comments <a href="/subject/'+answer?.subjectId+'/answers/'+answer?.postId+'">'+answer?.text+'</a>',
                        isRead: 0,
                        notificationType: 'like-dislike-post',
                        createdAt: serverTimestamp() as Timestamp,
                    }
                    batch.set(notificationDocRef, newNotification);
                }
            }
    
            else {
                const answerVoteRef = doc(firestore,  'users', `${user!.uid}/answerVotes/${existingVote.id}`)
                if (existingVote.voteValue === vote) {
                    updatedAnswer.voteStatus = voteStatus - vote;
                    updatedAnswerVotes = updatedAnswerVotes.filter(vote => vote.id !== existingVote.id)
                    batch.delete(answerVoteRef);
                    voteChange *= -1;
                } else {
                    updatedAnswer.voteStatus = voteStatus + 2 * vote;
                    const voteIdx = answerStateValue.answerVotes.findIndex((vote) => vote.id === existingVote.id)
                    updatedAnswerVotes[voteIdx] = {
                        ...existingVote,
                        voteValue: vote
                    }
                    batch.update(answerVoteRef, {
                        voteValue: vote
                    })
                }
                const notificationDocRef = doc(collection(firestore, 'notifications'))
                if(user?.uid !== answer?.creatorId){
                    const newNotification: Notifications = {
                        id: notificationDocRef.id,
                        notifyBy: user?.displayName! || user?.email!.split("@")[0],
                        notifyTo: answer?.creatorDisplayText!,
                        notification: user?.displayName! || user?.email!.split("@")[0]+' disliked your comments <a href="/subject/'+answer?.subjectId+'/answers/'+answer?.postId+'">'+answer?.text+'</a>',
                        isRead: 0,
                        notificationType: 'like-dislike-post',
                        createdAt: serverTimestamp() as Timestamp,
                    }
                    batch.set(notificationDocRef, newNotification);
                }
            }
            const answerRef = doc(firestore, 'answers', answer.id!);
            batch.update(answerRef, {voteStatus: voteStatus + voteChange})
            await batch.commit();
            const answerIdx = answerStateValue.answers.findIndex(item => item.id === answer.id);
            updatedAnswers [answerIdx] = updatedAnswer;
            setAnswerStateValue(prev => ({
                ...prev,
                answers: updatedAnswers,
                answerVotes: updatedAnswerVotes
            }))
            if (answerStateValue.selectedPost) {
                setAnswerStateValue((prev) => ({
                ...prev, 
                selectedPost: updatedAnswer,
                }));
            }
        } catch (error) {
            console.log('onVote error', error)
        }
    };

    const onSelectAnswer = (answer: Answer) => {
        setAnswerStateValue((prev) => ({
            ...prev,
            selectedPost: answer,
        }))
        router.push(`/subject/${answer.subjectId}/answers/${answer.postId}`)
    };



    const onDeleteAnswer = async (answer: Answer): Promise<boolean> => {
        setLoadingDeleteId(answer.id!)
        try {
            const batch = writeBatch(firestore);
            const answerDocRef = doc(firestore, 'answers', answer.id!);
            batch.delete(answerDocRef);

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

            setAnswerStateValue((prev) => ({
                ...prev,
                answers: prev.answers.filter(item => item.id !== answer.id),
            }))
            return true;
        } catch (error) {
            return false;
        }
        setLoadingDeleteId('')
    };
    
    return {
        answerStateValue,
        setAnswerStateValue,
        onVote,
        onSelectAnswer,
        onDeleteAnswer,
    }
}
export default useAnswers;

function deletedoc(answerDocRef: any) {
    throw new Error('Function not implemented.');
}
