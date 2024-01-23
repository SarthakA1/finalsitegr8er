import { AuthModalState } from '@/atoms/authModalAtom';
import { auth } from '@/firebase/clientApp';
import { Box, Flex, Icon, Spinner, Stack, Text, Image } from '@chakra-ui/react';
import { Timestamp } from 'firebase/firestore';
import moment from 'moment';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaUserCircle } from "react-icons/fa";
import { AiFillLike, AiOutlineLike, AiFillDislike, AiOutlineDislike } from "react-icons/ai";
import { useSetRecoilState } from 'recoil';
import { Answer } from '@/atoms/answersAtom';

// export type Answer = {
//     id: string;
//     creatorId: string;
//     creatorDisplayText: string;
//     subjectId: string;
//     postId: string;
//     postTitle: string;
//     text: string;
//     voteStatus: string;
//     createdAt: Timestamp;

// }

type AnswerItemProps = {
    answer: Answer;
    userIsCreator: boolean;
    userVoteValue?: number;
    //onDeleteAnswer: (answer: Answer) => void;
    onVote: (answer: Answer,
      vote: number,
      subjectId: string) => void;
    onDeleteAnswer: (answer: Answer) => Promise<boolean>;
    loadingDelete: boolean;
    userId: string;
};



const AnswerReplyItem:React.FC<AnswerItemProps> = ({ answer, userIsCreator, userVoteValue, onVote, onDeleteAnswer, loadingDelete, userId }) => {
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetRecoilState(AuthModalState);
  const handleDelete = async () => {
    try {
        const success = await onDeleteAnswer(answer);
        if (!success) {
            throw new Error("Failed to delete post"); 
        }
        console.log("Answer was Successfully Deleted")    
    } catch (error: any) {
       
    }
  }  
    return (
      <Flex>
        <Box mr={2}>
        {user?.photoURL? (
              <Icon as={FaUserCircle} fontSize={30} color="gray.900" />
                // <Image src={user.photoURL} height="35px" borderRadius={50} mt={1} minWidth={35}></Image>
            ) : (
              <Icon as={FaUserCircle} fontSize={30} color="gray.900" />
            )}
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
                  onClick={handleDelete}>
                  Delete
                </Text>
              </>
            )}
            {userId === answer.creatorId && (
              <>
                <Text
                  fontSize="9pt"
                  _hover={{ color: "blue.500" }}
                  onClick={handleDelete}>
                  Reply
                </Text>
              </>
            )}
            <Flex align='center' justify='center'>
              <Icon as = {userVoteValue === 1 ? AiFillLike : AiOutlineLike} 
              color={userVoteValue === 1 ? "#9FB751" : "gray.500"} 
              fontSize={24}
              onClick={() => onVote(answer, 1, answer.subjectId)} 
              cursor="pointer"
              mr={0.5}/>
              <Text color="gray.500" fontSize='11pt'>{answer.voteStatus}</Text>
              <Icon as = {userVoteValue === -1 ?  AiFillDislike : AiOutlineDislike} 
              color={userVoteValue === -1 ? "#EB4E45" :  "gray.500"} 
              fontSize={22.5}
              onClick={() => onVote(answer, -1, answer.subjectId)} 
              ml={0.5}
              cursor="pointer"
              />
            </Flex> 
          </Stack>
        </Stack>
      </Flex>
    );
  }
export default AnswerReplyItem;
