import { Box, Flex, Icon, Spinner, Stack, Text } from '@chakra-ui/react';
import { Timestamp } from 'firebase/firestore';
import moment from 'moment';
import React from 'react';
import { FaUserCircle } from "react-icons/fa";

export type Answer = {
    id: string;
    creatorId: string;
    creatorDisplayText: string;
    subjectId: string;
    postId: string;
    postTitle: string;
    text: string;
    createdAt: Timestamp;

}

type AnswerItemProps = {
    answer: Answer;
    onDeleteAnswer: (answer: Answer) => void;
    loadingDelete: boolean;
    userId: string;
};



const AnswerItem:React.FC<AnswerItemProps> = ({ answer, onDeleteAnswer, loadingDelete, userId }) => {
    
    return (
      <Flex>
        <Box mr={2}>
          <Icon as={FaUserCircle} fontSize={30} color="gray.900" />
        </Box>
        <Stack spacing={1}>
          <Stack direction="row" align="center" fontSize="8pt">
            <Text fontWeight={700}> {answer.creatorDisplayText} </Text>
            <Text color="gray.600">
              {moment(new Date(answer.createdAt.seconds * 1000)).fromNow()}
            </Text>
            {loadingDelete && <Spinner size="sm" />}
        </Stack>
        <Text fontSize="10pt">{answer.text}</Text>
        <Stack direction="row" align="center" cursor="pointer" color="gray.500">
          {userId === answer.creatorId && (
            <>
              <Text
                fontSize="9pt"
                _hover={{ color: "blue.500" }}
                onClick={() => onDeleteAnswer(answer)}>
                Delete
              </Text>
            </>
          )}
            
          </Stack>
        </Stack>
      </Flex>
    );
            }
export default AnswerItem;