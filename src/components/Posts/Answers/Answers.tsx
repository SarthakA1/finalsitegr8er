import { Answer, AnswerState } from '@/atoms/answersAtom';
import { Post, PostState } from '@/atoms/postsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import { auth, firestore } from '@/firebase/clientApp';
import { Box, Flex, SkeletonCircle, SkeletonText, Stack, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import { collection, doc, Firestore, getDocs, increment, orderBy, query, serverTimestamp, Timestamp, where, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import AnswerInput from './AnswerInput';
import AnswerItem from './AnswerItem';
import CommentItem from './AnswerItem';
import { useAuthState } from 'react-firebase-hooks/auth';
import useAnswers from '@/hooks/useAnswers';



type AnswersProps = {
    user: User;
    selectedPost: Post | null;
    subjectId: string;
};

export type Notifications = {
    id: string;
    notifyBy: string;
    notifyTo: string;
    notification: string;
    isRead: number;
    notificationType: string;
    createdAt: Timestamp;

}



const Answers:React.FC<AnswersProps> = ({ user, selectedPost, subjectId }) => {
    const [users] = useAuthState(auth);
    const [answerText, setAnswerText] = useState("");
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [loadingDeleteId, setLoadingDeleteId] = useState("");
    const setPostState = useSetRecoilState(PostState);
    const { answerStateValue, setAnswerStateValue, onVote, onDeleteAnswer } = useAnswers();
    


    const onCreateAnswer = async (answerText: string) => {
        setCreateLoading(true);
        try {
            const batch = writeBatch(firestore);

            const answerDocRef = doc(collection(firestore, 'answers'))
            const notificationDocRef = doc(collection(firestore, 'notifications'))

            const newAnswer: Answer ={
                id: answerDocRef.id,
                creatorId: user.uid,
                creatorDisplayText: user?.displayName! || user?.email!.split("@")[0],
                subjectId,
                postId: selectedPost?.id!,
                postTitle: selectedPost?.title!,
                text: answerText,
                voteStatus: 0,
                createdAt: serverTimestamp() as Timestamp,
                
            }

            batch.set(answerDocRef, newAnswer);

            newAnswer.createdAt = {seconds:Date.now() / 1000} as Timestamp
            if(user.uid !== selectedPost?.creatorId){
                const newNotification: Notifications = {
                    id: notificationDocRef.id,
                    notifyBy: user?.displayName! || user?.email!.split("@")[0],
                    notifyById: user?.uid!,
                    notifyTo: selectedPost?.creatorDisplayName!,
                    notification: user?.displayName! || user?.email!.split("@")[0]+' added a comment on your post <a href="'+process.env.NEXT_PUBLIC_BASE_URL+'/subject/'+selectedPost?.subjectId+'/answers/'+selectedPost?.id+'">'+selectedPost?.title+'</a>',
                    isRead: 0,
                    notificationType: 'commentPost',
                    createdAt: serverTimestamp() as Timestamp,
                }
                batch.set(notificationDocRef, newNotification);
            }
            const postDocRef = doc(firestore, 'posts', selectedPost?.id!);
            batch.update(postDocRef, {
                numberOfAnswers: increment(1)
            })

            await batch.commit();


            setAnswerText("")
            //setAnswers(prev => [newAnswer, ...prev])
            setAnswerStateValue(prev  => ({
                ...prev,
                answers: [newAnswer, ...prev.answers] as Answer[],
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
    // const onDeleteAnswer = async (answer: Answer) => {
    //     setLoadingDeleteId(answer.id)
    //     try {
    //         const batch = writeBatch(firestore);
    //         const answerDocRef = doc(firestore, 'answers', answer.id);
    //         batch.delete(answerDocRef);

    //         const postDocRef= doc(firestore, 'posts', selectedPost?.id!)
    //         batch.update(postDocRef, {
    //             numberOfAnswers: increment(-1)
    //         })

    //         await batch.commit()

    //         setPostState(prev => ({
    //             ...prev,
    //             selectedPost: {
    //                 ...prev.selectedPost,
    //                 numberOfAnswers: prev.selectedPost?.numberOfAnswers! -1
    //             } as Post
    //         }))

    //         setAnswers(prev=> prev.filter(item => item.id !== answer.id))
            
    //     } catch (error) {
    //         console.log('onDeleteComment error', error)
    //     }
    //     setLoadingDeleteId('')
    // }

    const getPostAnswers = async () => {
        
        try {
            const answersQuery = query(
                collection(firestore, "answers"), 
                where('postId', '==', selectedPost?.id), 
                orderBy('createdAt', 'desc'));
            const answerDocs = await getDocs(answersQuery);
            const answers = answerDocs.docs.map((doc) => ({ 
                id: doc.id, 
                ...doc.data(),
            }));
            //setAnswers(answers as Answer[]);
            setAnswerStateValue(prev  => ({
                ...prev,
                answers: answers as Answer[],
            }))
        } catch (error) {
            console.log('getPostAnswers error', error)
        }
        setFetchLoading(false);
    }

    useEffect(() => {
        if (!selectedPost) return;
        getPostAnswers();
    }, [selectedPost])
    return (
        <Box bg='white' borderRadius='0px 0px 4px 4px' p={2} border="1px solid" 
        borderColor="gray.400" >
            <Flex direction='column' pl={10} pr={2} mb={6} fontSize="10pt" width="100%">
                {!fetchLoading && <AnswerInput answerText={answerText} setAnswerText={setAnswerText} user={user} createLoading={createLoading} onCreateAnswer={onCreateAnswer}/>}
            </Flex>
            
            <Stack spacing={2} p={2}>
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
                        {answerStateValue.answers.length === 0 ? (
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
                                {answerStateValue.answers.map((item: any, index:any) =>
                                    <AnswerItem
                                    //key={answer.id}
                                    answer={item}
                                    userIsCreator={user?.uid === item.creatorId}
                                    userVoteValue={answerStateValue.answerVotes.find((vote: { answerId: any; }) => vote.answerId === item.id)?.voteValue}
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
            </Stack>
        </Box>
    )
}
export default Answers;
