import { AnswerReply, AnswerReplyState, AnswerReplyVote } from '@/atoms/answersReplyAtom';
import { Post, PostState } from '@/atoms/postsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import { auth, firestore, storage } from '@/firebase/clientApp';
import { collection, deleteDoc, doc, writeBatch, increment } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useSetRecoilState } from 'recoil';

const useAnswersReply = () => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingDeleteId, setLoadingDeleteId] = useState("");
    const [answerStateValue, setAnswerStateValue] = useRecoilState(AnswerReplyState);
    const setPostState = useSetRecoilState(PostState);

    const onVote = async (answer: AnswerReply, vote: number, subjectId: string) => {


        try {
            const { voteStatus } = answer;
            const existingVote = answerStateValue.answerReplyVotes.find(vote => vote.answerId === answer.id)
            const batch = writeBatch(firestore)
            const updatedAnswer = { ...answer }
            const updatedAnswers = [ ...answerStateValue.answersReply ]
            let updatedAnswerVotes = [ ...answerStateValue.answerReplyVotes ];
            let voteChange = vote;

            if (!existingVote) {
                const answerVoteRef = doc(
                    collection(firestore, 'users',`${user!.uid}/answersReplyVotes`)
                    )
                    const newVote: AnswerReplyVote = {
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
                    const voteIdx = answerStateValue.answerReplyVotes.findIndex((vote) => vote.id === existingVote.id)
                    updatedAnswerVotes[voteIdx] = {
                        ...existingVote,
                        voteValue: vote
                    }
                    batch.update(answerVoteRef, {
                        voteValue: vote
                    })
                }
            }
            const answerRef = doc(firestore, 'answers_reply', answer.id!);
            batch.update(answerRef, {voteStatus: voteStatus + voteChange})
            await batch.commit();
            const answerIdx = answerStateValue.answersReply.findIndex(item => item.id === answer.id);
            updatedAnswers [answerIdx] = updatedAnswer;
            setAnswerStateValue(prev => ({
                ...prev,
                answersReply: updatedAnswers,
                answerReplyVotes: updatedAnswerVotes
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

    const onSelectAnswer = (answer: AnswerReply) => {
        setAnswerStateValue((prev) => ({
            ...prev,
            selectedPost: answer,
        }))
        router.push(`/subject/${answer.subjectId}/answers-reply/${answer.postId}`)
    };



    const onDeleteAnswer = async (answer: AnswerReply): Promise<boolean> => {
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

            setAnswerStateValue((prev) => ({
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
        answerStateValue,
        setAnswerStateValue,
        onVote,
        onSelectAnswer,
        onDeleteAnswer,
    }
}
export default useAnswersReply;

function deletedoc(answerDocRef: any) {
    throw new Error('Function not implemented.');
}
