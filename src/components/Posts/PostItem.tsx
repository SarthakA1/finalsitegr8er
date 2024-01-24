import { Post } from '@/atoms/postsAtom';
import { Flex, Icon, Stack, Text , Image, Link, textDecoration, SimpleGrid } from '@chakra-ui/react';
import React from 'react';
import { AiOutlineDelete, AiFillTags } from "react-icons/ai";
import { TfiCommentAlt } from "react-icons/tfi";
import { MdOutlineComment } from "react-icons/md";
import { AiFillLike, AiOutlineLike, AiFillDislike, AiOutlineDislike  } from "react-icons/ai";
import {
    IoCloseCircleOutline,
    IoCloseCircleSharp,
  IoArrowRedoOutline,
  IoArrowUpCircleOutline,
  IoArrowUpCircleSharp,
  IoBookmarkOutline,
} from "react-icons/io5";
import moment from 'moment';
import { RiGroup2Fill } from 'react-icons/ri';
import { BsDot } from 'react-icons/bs';

type PostItemProps = {
    post: Post;
    userIsCreator: boolean;
    userVoteValue?: number;
    onVote: (post: Post,
        vote: number,
        subjectId: string) => void;
    onDeletePost: (post: Post) => Promise<boolean>;
    onSelectPost?: (post: Post) => void;
    homePage?: boolean;
};

const PostItem:React.FC<PostItemProps> = ({
    post,
    userIsCreator,
    userVoteValue,
    onVote,
    onDeletePost,
    onSelectPost,
    homePage
}:any) => {
    const singlePostPage = !onSelectPost
    
    const criteria = post.criteria;

    const handleDelete = async () => {
        try {
            const success = await onDeletePost(post);
            if (!success) {
                throw new Error("Failed to delete post"); 
            }
            console.log("Post was Successfully Deleted")    
        } catch (error: any) {
           
        }
    }    
    return (
        <Flex 
            direction='column'
            border="1px solid" 
            borderColor={singlePostPage ? "gray.400" : "gray.400"}
            borderRadius={singlePostPage ? "4px 4px 0px 0px" : "4px"}
            _hover = 
            {{borderColor: singlePostPage ? "none" : "gray.500"}}
        >
            {/* <Flex 
                direction="row" 
                align="center" 
                bg="blue.100" 
                p={2}
            >  */}
                <Stack direction="row" spacing={0.6} className='post_list_main_section'>
                    {/* //Homepage check  */}
                    <Flex className={homePage ? 'post_list_subject_section' : 'post_list_subject_without_homepage_section'}>
                        {homePage && (
                            <>
                                {post.subjectImageURL ? (
                                    <Image src={post.subjectImageURL} mr={1} mt={1} borderRadius="full" boxSize="18px"/>
                                ) : (
                                    <Icon as ={RiGroup2Fill} fontSize="18pt" mr={1} color="blue.500"/>
                                )}
                                <Link href={`subject/${post.subjectId}`}>
                                    <Text fontWeight={700} mr={3}_hover={{textDecoration:"underline"}}
                                    onClick={(event) => event.stopPropagation()}
                                    >
                                        {`${post.subjectId}`}
                                    </Text>
                                </Link>
                            </>
                        )}
                        <Text className='post_list_left_text_section'> 
                            Asked by {" "}
                            <span style={{ color: "#2c75b9" }}>
                                {post.creatorDisplayName}
                            </span>
                            , {moment(new Date(post.createdAt?.seconds * 1000)).fromNow()}
                        </Text>
                    </Flex>
                    <Flex className={homePage ? 'post_list_header_section' : 'post_list_header_without_homepage_section'}>
                        <Text style={{textAlign: "right"}} className='post_list_right_text_section'>
                            {post.criteria && Array.isArray(post.criteria) && post.criteria.map((criterion:any, index:any) => (
                                <span key={index} style={{background: "#000000", color: "#fff", padding: "5px 10px 5px 10px", borderRadius: "15px", marginRight: "5px", fontSize: "12px"}}>
                                    {criterion.value}
                                </span>
                            ))}
                            {post.typeOfQuestions && (
                                <>
                                    <span style={{background: "#4299E1", color: "#fff", padding: "5px 10px 5px 10px", borderRadius: "15px", marginRight: "5px", fontSize: "12px"}}>
                                        {post.typeOfQuestions.value} {/* Display value */}
                                    </span>
                                </>
                            )}
                        </Text>
                    </Flex>
                </Stack>
            {/* </Flex> */}

            <Flex 
            direction="column" 
            align="left" 
            p={2}
            bg="white" 
            cursor={singlePostPage ? "unset" : "pointer"}
            onClick={() => onSelectPost && onSelectPost(post)} > 

           <Flex direction="row">
            <Text fontSize='13pt' fontWeight={600} mb={1}> {post.title} </Text>
            <Text ml={2} fontSize='13pt' color="#2596be" fontWeight={600} mb={1}> MYP  </Text>
            {post.grade && (
                <>
                    <Text ml={1} fontSize='13pt' color="#2596be" fontWeight={600} mb={1}>
                        {post.grade.value}
                    </Text>
                </>
            )}
            {/* 
            <Text ml={1} fontSize='13pt' color="#2596be" fontWeight={600} mb={1}> {post.grade} </Text> */}
            </Flex>
            <Text fontSize='11pt'> {post.body} </Text>
            {post.imageURL && (
                <Flex mt={4} justify="center" align="center">  
                <Image src={post.imageURL} maxHeight='350px' alt="post image"/>
                
                </Flex>
            )}
            {/* <Icon as={AiFillTags} mt={5} fontSize={20}/> */}


            </Flex>

           
            <Flex 
            direction="row" 
            bg="blue.100" 
            p={2}>
                <Flex align='center' justify='center'>
                <Icon as = {userVoteValue === 1 ? AiFillLike : AiOutlineLike} 
                color={userVoteValue === 1 ? "#9FB751" : "gray.500"} 
                fontSize={24}
                onClick={() => onVote(post, 1, post.subjectId)} 
                cursor="pointer"
                mr={0.5}/>
                <Text color="gray.500" fontSize='11pt'>{post.voteStatus}</Text>
                <Icon as = {userVoteValue === -1 ?  AiFillDislike : AiOutlineDislike} 
                color={userVoteValue === -1 ? "#EB4E45" :  "gray.500"} 
                fontSize={22.5}
                onClick={() => onVote(post, -1, post.subjectId)} 
                ml={0.5}
                cursor="pointer"
                />
               </Flex>
               <Flex>
                    <Flex  ml={5} align='center' justify='right' cursor="pointer">
                    <Icon 
                    as={MdOutlineComment} 
                    fontSize={22.5} 
                    color="gray.500"
                    onClick={() => onSelectPost && onSelectPost(post)} 
                    />
                    <Text color="gray.500" ml={1}> {post.numberOfAnswers}</Text>
                    </Flex>

                    {userIsCreator && (
                        <Flex
                        align='center'
                        p="8px 10px"
                        borderRadius={singlePostPage ? "0" : "10"}
                        _hover={{bg:"blue.200"}}
                        cursor="pointer"
                        ml={2}
                        onClick={handleDelete}
                        color="#ff0000"
                        >
                            <Icon as = {AiOutlineDelete}/>

                        </Flex>
                        )}
                </Flex>
            </Flex>    
        </Flex>
    
        )
}
export default PostItem;

