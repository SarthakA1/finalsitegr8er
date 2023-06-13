import { Post, PostState } from '@/atoms/postsAtom';
import { firestore } from '@/firebase/clientApp';
import { Box, Flex, SkeletonCircle, SkeletonText, Stack, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import { collection, doc, Firestore, getDocs, increment, orderBy, query, serverTimestamp, Timestamp, where, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import AnswerInput from './AnswerInput';
import AnswerItem, { Answer } from './AnswerItem';
import CommentItem from './AnswerItem';



type AnswersProps = {
    user: User;
    selectedPost: Post | null;
    subjectId: string;
};



const Answers:React.FC<AnswersProps> = ({ user, selectedPost, subjectId }) => {
    const [answerText, setAnswerText] = useState("");
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [loadingDeleteId, setLoadingDeleteId] = useState("");
    const setPostState = useSetRecoilState(PostState);
    


    const onCreateAnswer = async (answerText: string) => {
        setCreateLoading(true);
        try {
            const batch = writeBatch(firestore);

            const answerDocRef = doc(collection(firestore, 'answers'))


            const newAnswer: Answer ={
                id: answerDocRef.id,
                creatorId: user.uid,
                creatorDisplayText: user?.displayName! || user?.email!.split("@")[0],
                subjectId,
                postId: selectedPost?.id!,
                postTitle: selectedPost?.title!,
                text: answerText,
                createdAt: serverTimestamp() as Timestamp,
                
            }

            batch.set(answerDocRef, newAnswer);

            newAnswer.createdAt = {seconds:Date.now() / 1000} as Timestamp

            const postDocRef = doc(firestore, 'posts', selectedPost?.id!);
            batch.update(postDocRef, {
                numberOfAnswers: increment(1)
            })

            await batch.commit();


            setAnswerText("")
            setAnswers(prev => [newAnswer, ...prev])

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
    const onDeleteAnswer = async (answer: Answer) => {
        setLoadingDeleteId(answer.id)
        try {
            const batch = writeBatch(firestore);
            const answerDocRef = doc(firestore, 'answers', answer.id)
            batch.delete(answerDocRef);

            const postDocRef= doc(firestore, 'posts', selectedPost?.id!)
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

            setAnswers(prev=> prev.filter(item => item.id !== answer.id))
            
        } catch (error) {
            console.log('onDeleteComment error', error)
        }
        setLoadingDeleteId('')
    }

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
            setAnswers(answers as Answer[]);
            
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
                    {answers.length === 0 ? (
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
                    {answers.map((answer) => (
                    <AnswerItem
                    key={answer.id}
                    answer = {answer}
                    onDeleteAnswer = {onDeleteAnswer}
                    loadingDelete = {loadingDeleteId === answer.id}
                    userId={user?.uid}
                    />
                ))}
                    </>
                    )}
                    </>
                    
                )}
                
            </Stack>
        </Box>
    )
}
export default Answers;