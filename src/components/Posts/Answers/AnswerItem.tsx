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
import { Answer } from '@/atoms/answersAtom';
import { AnswerReply } from '@/atoms/answersReplyAtom';
import AnswersReply from "./Reply/AnswersReply";
import AnswerReplyItem from "./Reply/AnswerReplyItem";
import { User } from 'firebase/auth';
import usePosts from '@/hooks/usePosts';
import { useRouter } from 'next/router';
import useSubjectData from '@/hooks/useSubjectData';
import { doc, getDoc, query, collection, where, orderBy, getDocs, } from 'firebase/firestore';
import { Post } from '@/atoms/postsAtom';
import useAnswersReply from '@/hooks/useAnswersReply';

// export type AnswerReply = {
//     id: string;
//     creatorId: string;
//     creatorDisplayText: string;
//     subjectId: string;
//     postId: string;
//     answerId: string;
//     postTitle: string;
//     text: string;
//     parentReplyId: string,
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



const AnswerItem:React.FC<AnswerItemProps> = ({ answer, userIsCreator, userVoteValue, onVote, onDeleteAnswer, loadingDelete, userId }) => {
  const [user] = useAuthState(auth);
  const [replyForm, setReplyForm] = useState(false);
  const setAuthModalState = useSetRecoilState(AuthModalState);
  const { postStateValue, setPostStateValue } = usePosts();
  const router = useRouter();
  const { subjectStateValue } = useSubjectData();
  const [subAnswer, setSubAnswer] = useState<AnswerReply[]>([]);
  const { answerReplyStateValue, setAnswerReplyStateValue, onAnswerReplyVote, onDeleteAnswerReply } = useAnswersReply();
  const handleDelete = async () => {
    try {
        const success = await onDeleteAnswer(answer);
        if (!success) {
            throw new Error("Failed to delete post"); 
        }
        console.log("Answer was Successfully Deleted");    
    } catch (error: any) {
       
    }
  }  
  const handleReply = async () => {
    setReplyForm(true);
  }
  const fetchPost = async (postId: string) => {
    try {
      const postDocRef = doc(firestore, "posts", postId);
      const postDoc = await getDoc(postDocRef);
      setPostStateValue((prev) => ({
        ...prev,
        selectedPost: { id: postDoc.id, ...postDoc.data() } as Post,
      }));
    } catch (error) {
      console.log("fetchPost error", error);
    }
  };
  const getPostSubAnswers = async (postId:any) => {
    try {
        const subAnswersQuery = query(
            collection(firestore, "answers_reply"), 
            where('postId', '==', postId), 
            where('parentReplyId', '==', answer.id),
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
            answersReply: subAnswers as Answer[],
        }))
    } catch (error) {
        console.log('getPostAnswers error', error)
    }
}
  useEffect(() => {
    const { pid } = router.query;
    if (pid && !postStateValue.selectedPost) {
      fetchPost(pid as string);
    }
    if(pid){
      getPostSubAnswers(pid as string);
    }
  }, [router.query, postStateValue.selectedPost]);
    return (
      <Flex className='main-custom-answer-section abcd'>
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
            <Text
              fontSize="9pt"
              _hover={{ color: "blue.500" }}
              onClick={handleReply}>
              Reply
            </Text>
            {/* {userId === answer.creatorId && (
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
              :
                <Flex align='center' justify='center'>
                  <Icon as = {AiOutlineLike} 
                  color="gray.500" 
                  fontSize={24}
                  onClick={() => setAuthModalState({ open:true, view: "login"})} 
                  cursor="pointer"
                  mr={0.5}/>
                  <Text color="gray.500" fontSize='11pt'>{answer.voteStatus}</Text>
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
          {replyForm && <AnswersReply user={user as User} selectedPost={postStateValue.selectedPost} subjectId={postStateValue.selectedPost?.subjectId as string} answerId={answer?.id as string}/>}
          {subAnswer.length > 0 ? (
            subAnswer.filter((item: any) => item.answerId === answer.id)
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
        </Stack>
      </Flex>
    );
            }
export default AnswerItem;
