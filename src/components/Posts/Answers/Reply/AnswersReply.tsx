import { AnswerReply, AnswerReplyState } from '@/atoms/answersReplyAtom';
import { Post, PostState } from '@/atoms/postsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import { auth, firestore } from '@/firebase/clientApp';
import { Box, Flex, SkeletonCircle, SkeletonText, Stack, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import { collection, doc, Firestore, getDocs, increment, orderBy, query, serverTimestamp, Timestamp, where, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import AnswerReplyInput from './AnswerReplyInput';
import AnswerReplyItem from './AnswerReplyItem';
import CommentReplyItem from './AnswerReplyItem';
import { useAuthState } from 'react-firebase-hooks/auth';
import useAnswersReply from '@/hooks/useAnswersReply';



type AnswersReplyProps = {
    user: User;
    selectedPost: Post | null;
    subjectId: string;
    answerId: string;
};

export type Notifications = {
    id?: string;
    notifyBy?: string;
    notifyTo?: string;
    notification: string;
    isRead: number;
    notificationType: string;
    createdAt: Timestamp;

}



const AnswersReply:React.FC<AnswersReplyProps> = ({ user, selectedPost, subjectId, answerId }) => {
    const [users] = useAuthState(auth);
    const [answerText, setAnswerText] = useState("");
    const [answers, setAnswers] = useState<AnswerReply[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [loadingDeleteId, setLoadingDeleteId] = useState("");
    const setPostState = useSetRecoilState(PostState);
    const { answerReplyStateValue, setAnswerReplyStateValue, onAnswerReplyVote, onDeleteAnswerReply } = useAnswersReply();
    


    const onCreateAnswerReply = async (answerText: string) => {
        setCreateLoading(true);
        try {
            const batch = writeBatch(firestore);

            const answerDocRef = doc(collection(firestore, 'answers_reply'))
            const notificationDocRef = doc(collection(firestore, 'notifications'))

            const newAnswer: AnswerReply ={
                id: answerDocRef.id,
                creatorId: users?.uid,
                creatorDisplayText: users?.displayName! || users?.email!.split("@")[0],
                subjectId,
                postId: selectedPost?.id!,
                answerId: answerId,
                postTitle: selectedPost?.title!,
                text: answerText,
                parentReplyId: answerId,
                voteStatus: 0, 
                createdAt: serverTimestamp() as Timestamp,

            }

            batch.set(answerDocRef, newAnswer);

            newAnswer.createdAt = {seconds:Date.now() / 1000} as Timestamp
            //if(user.uid !== selectedPost?.creatorId){
                const newNotification: Notifications = {
                    id: notificationDocRef.id,
                    notifyBy: users?.displayName! || users?.email!.split("@")[0],
                    notifyTo: selectedPost?.creatorDisplayName!,
                    notification: (users?.displayName! || users?.email!.split("@")[0]) + ' has replied to a comment saying <a href="/subject/'+selectedPost?.subjectId+'/answers/'+selectedPost?.id+'">'+newAnswer.text+'</a>',
                    isRead: 0,
                    notificationType: 'replyPost',
                    createdAt: serverTimestamp() as Timestamp,
                }
                batch.set(notificationDocRef, newNotification);
            //}
            const postDocRef = doc(firestore, 'posts', selectedPost?.id!);
            batch.update(postDocRef, {
                numberOfAnswers: increment(1)
            })

            await batch.commit();


            setAnswerText("")
            //setAnswers(prev => [newAnswer, ...prev])
            setAnswerReplyStateValue(prev  => ({
                ...prev,
                answersReply: [newAnswer, ...prev.answersReply] as AnswerReply[],
            }))
            setPostState(prev => ({
                ...prev,
                selectedPost: {
                    ...prev.selectedPost, numberOfAnswers: prev.selectedPost?.numberOfAnswers! + 1
                } as Post
            }))

           
            


        } catch (error) {
            console.log('onCreateAnswer error', error)
        }
        setCreateLoading(false);
    }

    const getPostAnswersReply = async () => {
        
        try {
            const answersReplyQuery = query(
                collection(firestore, "answers_reply"), 
                where('postId', '==', selectedPost?.id), 
                where('answerId', '==', answerId), 
                orderBy('createdAt', 'desc'));
            const answerReplyDocs = await getDocs(answersReplyQuery);
            const answersReply = answerReplyDocs.docs.map((doc) => ({ 
                id: doc.id, 
                ...doc.data(),
            }));
            //setAnswers(answers as Answer[]);
            setAnswerReplyStateValue(prev  => ({
                ...prev,
                answersReply: answersReply as AnswerReply[],
            }))
            setFetchLoading(false);
        } catch (error) {
            console.log('getPostAnswersReply error', error)
        }
        setFetchLoading(false);
    }

    useEffect(() => {
        if (!selectedPost) return;
        getPostAnswersReply();
    }, [selectedPost])
    return (
        <Box bg='white' borderRadius='0px 0px 4px 4px'>
            <Flex direction='column' pr={2} mb={6} fontSize="10pt" width="100%">
                {!fetchLoading && <AnswerReplyInput answerText={answerText} setAnswerText={setAnswerText} user={user} createLoading={createLoading} onCreateAnswerReply={onCreateAnswerReply}/>}
            </Flex>
            
            {/* <Stack spacing={2} p={2}>
                {fetchLoading ? (
                    <>
                     {[0, 1, 2].map((item) => (
                       <Box key={item} padding="6" bg="white">
                         <SkeletonCircle size="10" />
                         <SkeletonText mt="4" noOfLines={2} spacing="4" />
                       </Box>
                     ))}
                   </>
                ) : (
                    <>
                        {answerStateValue.answersReply.length === 0 ? (
                            <Flex
                            direction='column'
                            justify='center'
                            align="center"
                            borderTop="1px solid"
                            borderColor="gray.100"
                            p={20}>
                                <Text fontWeight={700} opacity={0.3}> No Answers Yet</Text>
                            </Flex>
                        ) : (
                            <>
                                {answerStateValue.answersReply.map((item: any, index:any) =>
                                    <AnswerReplyItem
                                    //key={answer.id}
                                    answer={item}
                                    userIsCreator={user?.uid === item.creatorId}
                                    userVoteValue={answerStateValue.answerReplyVotes.find((vote: { answerId: any; }) => vote.answerId === item.id)?.voteValue}
                                    onVote={onVote}
                                    onDeleteAnswer={onDeleteAnswer}
                                    loadingDelete={loadingDeleteId === item.id}
                                    userId={user?.uid}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </Stack> */}
        </Box>
    )
}
export default AnswersReply;
