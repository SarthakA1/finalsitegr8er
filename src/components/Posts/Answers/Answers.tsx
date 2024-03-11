import AuthButtons from '@/components/Navbar/RightContent/AuthButtons';
import { Box, Flex, SkeletonCircle, SkeletonText, Stack, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import { collection, doc, getDocs, increment, orderBy, query, serverTimestamp, Timestamp, where, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import AnswerInput from './AnswerInput';
import AnswerItem from './AnswerItem';
import { useAuthState } from 'react-firebase-hooks/auth';
import useAnswers from '@/hooks/useAnswers';

type AnswersProps = {
    user: User;
    selectedPost: Post | null;
    subjectId: string;
};

const Answers: React.FC<AnswersProps> = ({ user, selectedPost, subjectId }) => {
    const [users] = useAuthState(auth);
    const [answerText, setAnswerText] = useState("");
    const [fetchLoading, setFetchLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [loadingDeleteId, setLoadingDeleteId] = useState("");
    const setPostState = useSetRecoilState(PostState);
    const { answerStateValue, setAnswerStateValue, onVote, onDeleteAnswer } = useAnswers();

    const onCreateAnswer = async (answerText: string) => {
        // Check if the answer text is empty or only contains whitespace
        if (!answerText.trim()) {
            // Return early if the answer is empty
            return;
        }

        setCreateLoading(true);
        try {
            // Your code to create the answer...
        } catch (error) {
            console.log('onCreateAnswer error', error)
        }
        setCreateLoading(false);
    }

    const getPostAnswers = async () => {
        try {
            // Your code to fetch answers...
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
        <Box bg='white' borderRadius='0px 0px 4px 4px' p={2} border="1px solid" borderColor="gray.400" >
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
                                <Text fontWeight={700} opacity={0.3}>No Answers Yet</Text>
                            </Flex>
                        ) : (
                            <>
                                {answerStateValue.answers.map((item: any, index:any) =>
                                    <AnswerItem
                                    key={index} // Assuming index can be used as a key here
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
