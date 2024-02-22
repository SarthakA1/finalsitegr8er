import { AuthModalState } from '@/atoms/authModalAtom';
import { auth, firestore } from '@/firebase/clientApp';
import { Box, Flex, Icon, Spinner, Stack, Text, Image } from '@chakra-ui/react';
import { Timestamp } from 'firebase/firestore';
import moment from 'moment';
import React, {useState, useEffect} from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaUserCircle } from "react-icons/fa";
import { AiFillLike, AiOutlineLike, AiFillDislike, AiOutlineDislike } from "react-icons/ai";
import { useSetRecoilState } from 'recoil';
import { AnswerReply } from '@/atoms/answersReplyAtom';
import AnswersReply from "../Reply/AnswersReply";
import useAnswersReply from '@/hooks/useAnswersReply';
import { User } from 'firebase/auth';
import usePosts from '@/hooks/usePosts';
import {query, collection, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';

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
    answerReply: AnswerReply;
    userIsCreator: boolean;
    userVoteValue?: number;
    //onDeleteAnswer: (answer: Answer) => void;
    onAnswerReplyVote: (answerReply: AnswerReply,
      vote: number,
      subjectId: string) => void;
    onDeleteAnswerReply: (answerReply: AnswerReply) => Promise<boolean>;
    userId: string;
};



const AnswerReplyItem:React.FC<AnswerItemProps> = ({ answerReply, userIsCreator, userVoteValue, onAnswerReplyVote, onDeleteAnswerReply, userId }) => {
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetRecoilState(AuthModalState);
  const { postStateValue, setPostStateValue } = usePosts();
  const [replyForm, setReplyForm] = useState(false);
  const [subAnswer, setSubAnswer] = useState<AnswerReply[]>([]);
  const { answerReplyStateValue, setAnswerReplyStateValue} = useAnswersReply();
  const router = useRouter();
  const handleDelete = async () => {
    try {
        const success = await onDeleteAnswerReply(answerReply);
        if (!success) {
            throw new Error("Failed to delete post"); 
        }
        console.log("Answer was Successfully Deleted")    
    } catch (error: any) {
       
    }
  } 
  const handleReply = async () => {
    setReplyForm(true);
  } 
  const getPostSubAnswers = async (postId:any) => {
    try {
        const subAnswersQuery = query(
            collection(firestore, "answers_reply"), 
            where('postId', '==', postId), 
            where('parentReplyId', '==', answerReply.id),
        );
        const subAnswerDocs = await getDocs(subAnswersQuery);
        const subAnswers = subAnswerDocs.docs.map((doc) => ({ 
            id: doc.id, 
            ...doc.data(),
        }));
        // console.log(subAnswers);
        // console.log(answer.id);
        setSubAnswer(subAnswers as AnswerReply[]);
        setAnswerReplyStateValue((prev:any)  => ({
            ...prev,
            answersReply: subAnswers as AnswerReply[],
        }))
    } catch (error) {
        console.log('getPostAnswers error', error)
    }
  }
  useEffect(() => {
    const { pid } = router.query;
    if(pid){
      getPostSubAnswers(pid as string);
    }
  }, [router.query, postStateValue.selectedPost]);
    return (
      <Flex id='text-box-section' className='textbox-sec'>
        <Box mr={2}>
        {user?.photoURL? (
              <Icon as={FaUserCircle} fontSize={30} color="gray.900" />
                // <Image src={user.photoURL} height="35px" borderRadius={50} mt={1} minWidth={35}></Image>
            ) : (
              <Icon as={FaUserCircle} fontSize={30} color="gray.900" />
            )}
        </Box>
        <Stack spacing={1} className='sadasd'>
          <Stack direction="row" align="center" fontSize="8pt">
            <Text fontWeight={700}> {answerReply.creatorDisplayText} </Text>
            <Text color="gray.600">
              {moment(new Date(answerReply.createdAt.seconds * 1000)).fromNow()}
            </Text>
            {/* {loadingDelete && <Spinner size="sm" />} */}
          </Stack>
          <Text fontSize="10pt">{answerReply.text}</Text>
          <Stack direction="row" align="center" cursor="pointer" color="gray.500">
            {userId === answerReply.creatorId && (
              <>
                <Text
                  fontSize="9pt"
                  _hover={{ color: "blue.500" }}
                  onClick={handleDelete}>
                  Delete
                </Text>
              </>
            )}
            <Text
              fontSize="9pt"
              _hover={{ color: "blue.500" }}
              onClick={handleReply}>
              Reply
            </Text>
            {/* {userId !== answerReply.creatorId && (
              <>
                <Text
                  fontSize="9pt"
                  _hover={{ color: "blue.500" }}
                  onClick={handleReply}>
                  Reply
                </Text>
              </>
            )} */}
            {user
              ?
                <Flex align='center' justify='center'>
                  <Icon as = {userVoteValue === 1 ? AiFillLike : AiOutlineLike} 
                  color={userVoteValue === 1 ? "#9FB751" : "gray.500"} 
                  fontSize={24}
                  onClick={() => onAnswerReplyVote(answerReply, 1, answerReply.subjectId)} 
                  cursor="pointer"
                  mr={0.5}/>
                  <Text color="gray.500" fontSize='11pt'>{answerReply.voteStatus}</Text>
                  <Icon as = {userVoteValue === -1 ?  AiFillDislike : AiOutlineDislike} 
                  color={userVoteValue === -1 ? "#EB4E45" :  "gray.500"} 
                  fontSize={22.5}
                  onClick={() => onAnswerReplyVote(answerReply, -1, answerReply.subjectId)} 
                  ml={0.5}
                  cursor="pointer"
                  />
                </Flex> 
              :
                <Flex align='center' justify='center'>
                <Icon as = {AiOutlineLike} 
                color="gray.500"
                fontSize={24}
                onClick={() => setAuthModalState({ open:true, view: "login"})} 
                cursor="pointer"
                mr={0.5}/>
                <Text color="gray.500" fontSize='11pt'>{answerReply.voteStatus}</Text>
                <Icon as = {AiOutlineDislike} 
                color="gray.500"
                fontSize={22.5}
                onClick={() => setAuthModalState({ open:true, view: "login"})} 
                ml={0.5}
                cursor="pointer"
                />
                </Flex>
            }
          </Stack>
          {subAnswer.length > 0 ? (
            subAnswer.filter((item: any) => item.answerId === answerReply.id)
              .map((item: any, index: any) => (
                <AnswerReplyItem 
                  answerReply={item} 
                  userIsCreator={userId === item.creatorId} 
                  userVoteValue={answerReplyStateValue.answerReplyVotes.find((vote: { answerId: any; }) => vote.answerId === item.id)?.voteValue}
                  onAnswerReplyVote={onAnswerReplyVote}
                  onDeleteAnswerReply={onDeleteAnswerReply}
                  userId={userId}
                />
              ))
          ) : (
            ''
          )}
          {replyForm && <AnswersReply user={user as User} selectedPost={postStateValue.selectedPost} subjectId={postStateValue.selectedPost?.subjectId as string} answerId={answerReply?.id as string}/>}
        </Stack>
      </Flex>
    );
  }
export default AnswerReplyItem;
