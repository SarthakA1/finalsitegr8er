import { Post } from '@/atoms/postsAtom';
import { Flex, Icon, Stack, Text , Image, Link, textDecoration, SimpleGrid, Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { AiOutlineDelete, AiFillTags } from "react-icons/ai";
import { TfiCommentAlt } from "react-icons/tfi";
import { collection, Timestamp, writeBatch, doc, serverTimestamp, getDocs, orderBy, query, where } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/clientApp';
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
import { useAuthState } from 'react-firebase-hooks/auth';
import StaticEquationText from '../common/StaticEquationText';
import { useRouter } from 'next/router';
import { useSetRecoilState } from 'recoil';
import { AuthModalState } from '@/atoms/authModalAtom';

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
export type DifficultyVoting = {
    id: string;
    creatorId: string;
    subjectId: string;
    postId: string;
    postTitle: string;
    voting: string;
    createdAt: Timestamp;
}
const PostItem:React.FC<PostItemProps> = ({
    post,
    userIsCreator,
    userVoteValue,
    onVote,
    onDeletePost,
    onSelectPost,
    homePage
}:any) => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const singlePostPage = !onSelectPost
    
    const criteria = post.criteria;

    const [highestPercentage, setHighestPercentage] = useState('');
    const [highestPercentageName, setHighestPercentageName] = useState('');

    const [deletePostMessage, setDeletePostMessage] = useState('');

    const [fileImageUrl, setFileImageUrl] = useState('');
    const setAuthModalState = useSetRecoilState(AuthModalState);

    const handleDelete = async () => {
        try {
            const success = await onDeletePost(post);
            if (!success) {
                throw new Error("Failed to delete post"); 
            }
            //console.log("Post was Successfully Deleted"); 
            setDeletePostMessage('Post was Successfully Deleted');   
            setTimeout(function() {
                setDeletePostMessage('');
                router.push('/');
            }, 3000);
        } catch (error: any) {
           
        }
    }  
    const handleClickVoting = async (value:any) => {
        const votingQuery = query(
            collection(firestore, 'diffculty_voting'),
            where('creatorId', '==', user?.uid),
            where('postId', '==', post.id),
            orderBy('createdAt', 'desc')
        );
        const votingDocs = await getDocs(votingQuery);

        // Store in post state
        const voting = votingDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalVoting = voting.length;
        const batch = writeBatch(firestore);
        if(voting.length > 0){
            const diffcultyVotingDocRef = doc(firestore, 'diffculty_voting', voting[0].id!);
            batch.update(diffcultyVotingDocRef, {
                voting: value
            })
        } else {
            const diffcultyVotingDocRef = doc(collection(firestore, 'diffculty_voting'))
            const newDifficultyVoting: DifficultyVoting = {
                id: diffcultyVotingDocRef.id,
                creatorId: user?.uid || '',
                subjectId: post.subjectId,
                postId: post.id,
                postTitle: post.title,
                voting: value,
                createdAt: serverTimestamp() as Timestamp,
            }
            batch.set(diffcultyVotingDocRef, newDifficultyVoting);
            newDifficultyVoting.createdAt = {seconds:Date.now() / 1000} as Timestamp
        }
        await batch.commit();
    } 
    const fetchVotingData = async () => {
        const votingQuery = query(
            collection(firestore, 'diffculty_voting'),
            where('postId', '==', post.id),
        );
        const votingDocs = await getDocs(votingQuery);
        const allVoting = votingDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const easyVotingQuery = query(
            collection(firestore, 'diffculty_voting'),
            where('postId', '==', post.id),
            where('voting', '==', 'easy'),
        );
        const easyVotingDocs = await getDocs(easyVotingQuery);
        const easyVoting = easyVotingDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const mediumVotingQuery = query(
            collection(firestore, 'diffculty_voting'),
            where('postId', '==', post.id),
            where('voting', '==', 'medium'),
        );
        const mediumVotingDocs = await getDocs(mediumVotingQuery);
        const mediumVoting = mediumVotingDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const hardVotingQuery = query(
            collection(firestore, 'diffculty_voting'),
            where('postId', '==', post.id),
            where('voting', '==', 'hard'),
        );
        const hardVotingDocs = await getDocs(hardVotingQuery);
        const hardVoting = hardVotingDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const Easy_percentage = ((easyVoting.length / allVoting.length) * 100).toFixed(2);
        const Medium_percentage = ((mediumVoting.length / allVoting.length) * 100).toFixed(2);
        const Hard_percentage = ((hardVoting.length / allVoting.length) * 100).toFixed(2);

        const highestPercentage = Math.max(
            parseFloat(Easy_percentage),
            parseFloat(Medium_percentage),
            parseFloat(Hard_percentage)
        );



        const highestPercentageAsString = highestPercentage.toFixed(2);

        let highestPercentageOption = '';

        if (parseFloat(highestPercentageAsString) === parseFloat(Easy_percentage)) {
            highestPercentageOption = 'Easy';
        } else if (parseFloat(highestPercentageAsString) === parseFloat(Medium_percentage)) {
            highestPercentageOption = 'Medium';
        } else if (parseFloat(highestPercentageAsString) === parseFloat(Hard_percentage)) {
            highestPercentageOption = 'Hard';
        } else {
            highestPercentageOption = '';
        }

        if(highestPercentage + '%' !== 'NaN%'){
            setHighestPercentage(highestPercentage + '%');
            setHighestPercentageName(highestPercentageOption);
        } else {
            setHighestPercentage('Not');
            setHighestPercentageName(highestPercentageOption);
        }
    } 
    const getFileExtension = (url:any) => {
        return fetch(url)
        .then((response: any) => response.json())
        .then((data: any) => {
            if (data['contentType']) {
                return data['contentType'];
            } else {
                return 'unknown';
            }
        })
        .catch((error: any) => {
            console.error('Error fetching data:', error);
            return 'unknown'; // Handle error and return a default value
        });
    }
    useEffect(() => {
        fetchVotingData();
    }, [])
    return (
        <Flex 
            direction='column'
            border="1px solid" 
            borderColor={singlePostPage ? "gray.400" : "gray.400"}
            borderRadius={singlePostPage ? "4px 4px 0px 0px" : "4px"}
            _hover = 
            {{borderColor: singlePostPage ? "none" : "gray.500"}}
        >
            {deletePostMessage ? <Text style={{textAlign: "center", padding:"10px", color:"green"}}>{deletePostMessage}</Text> : ''}
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
                                    <Text fontWeight={700} fontSize={16} mr={3}_hover={{textDecoration:"underline"}}
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
                                criterion.value !== ''
                                    ?
                                        <span key={index} style={{background: "#000000", color: "#fff", padding: "5px 10px 5px 10px", borderRadius: "15px", marginRight: "5px", fontSize: "12px"}}>
                                            {criterion.value}
                                        </span>
                                    :
                                        ''
                            ))}
                            {post.typeOfQuestions && (
                                <>
                                    {post.typeOfQuestions !== ''
                                        ?
                                            <span style={{background: "#4299E1", color: "#fff", padding: "5px 10px 5px 10px", borderRadius: "15px", marginRight: "5px", fontSize: "12px"}}>
                                                {post.typeOfQuestions.value === 'General Question' ? 'General Doubt' : post.typeOfQuestions.value} {/* Display value */}
                                            </span>
                                        :
                                            ''
                                    }
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
                <Text ml={1} fontSize='13pt' color="#2596be" fontWeight={600} mb={1}>MYP  </Text>
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
            {/* <StaticEquationText bodyValue={post.body}/> */}
          <div style={{ maxWidth: '100%', overflow: 'auto' }}>
  <div 
    dangerouslySetInnerHTML={{ __html: post.body }} 
    style={{
      maxWidth: '100%', // Limit the maximum width
      overflowWrap: 'break-word', // Enable word wrapping
    }} 
  />
</div>


            {/* <Text fontSize='11pt'> {post.body} </Text> */}
            {/* {post.imageURL && (
                <Flex mt={4} justify="center" align="center">  
                <Image src={post.imageURL} maxHeight='350px' alt="post image"/>
                
                </Flex>
            )} */}
           {post.imageURLs && (
    post.imageURLs.length > 1 ? (
        <ul style={{ listStyle: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {post.imageURLs.map((imageURL: any) => {
                const parts = imageURL.split('.');
                const extension = parts[parts.length - 1];
                const orgExtension = extension.split('?');
                return (
                    <li style={{ listStyle: 'none' }}>
                        {orgExtension[0] === 'png' || orgExtension[0] === 'jpg' || orgExtension[0] === 'jpeg' ? (
                            router.pathname == '/' ? (
                                <Image src={imageURL} align='center' maxHeight='400px' maxWidth='400px' alt="post image" />
                            ) : (
                                <a href={imageURL} target='_blank'>
                                    <Image src={imageURL} align='center' maxHeight='400px' style={{ width: '90px', height: '120px' }} alt="post image" />
                                </a>
                            )
                        ) : orgExtension[0] === 'pdf' ? (
                            <a href={imageURL} target='_blank'>
                                <Image src="/images/pdf.png" align='center' maxHeight='350px' alt="post image" style={{ width: '90px', height: '120px' }} />
                            </a>
                        ) : (
                            <a href={imageURL} target='_blank'>
                                <Image src="/images/docs.png" align='center' maxHeight='350px' alt="post image" style={{ width: '90px', height: '120px' }} />
                            </a>
                        )}
                    </li>
                );
            })}
        </ul>
    ) : (
        <ul style={{ listStyle: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '0 auto', maxWidth: '200px' }}>
            {post.imageURLs.map((imageURL: any) => {
                const parts = imageURL.split('.');
                const extension = parts[parts.length - 1];
                const orgExtension = extension.split('?');
                return (
                    <li style={{ listStyle: 'none' }}>
                        {orgExtension[0] === 'png' || orgExtension[0] === 'jpg' || orgExtension[0] === 'jpeg' ? (
                            router.pathname == '/' ? (
                                <Image src={imageURL} align='center' maxHeight='400px' maxWidth='400px' alt="post image" />
                            ) : (
                                <a href={imageURL} target='_blank'>
                                    <Image src={imageURL} align='center' maxHeight='400px' style={{ width: '90px', height: '120px' }} alt="post image" />
                                </a>
                            )
                        ) : orgExtension[0] === 'pdf' ? (
                            <a href={imageURL} target='_blank'>
                                <Image src="/images/pdf.png" align='center' maxHeight='400px' style={{ width: '90px', height: '120px' }} alt="post image" />
                            </a>
                        ) : (
                            <a href={imageURL} target='_blank'>
                                <Image src="/images/docs.png" align='center' maxHeight='400px' alt="post image" />
                            </a>
                        )}
                    </li>
                );
            })}
        </ul>
    )
)}


            {/* <Icon as={AiFillTags} mt={5} fontSize={20}/> */}


            </Flex>

           
            <Flex 
            direction="row" 
            bg="blue.100" 
            p={2}>
                
                    {user
                        ?
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
                        :
                            <Flex align='center' justify='center'>
                                <Icon as = {AiOutlineLike} color="gray.500" fontSize={24} cursor="pointer" mr={0.5} onClick={() => setAuthModalState({ open:true, view: "login"})}/>
                                <Text color="gray.500" fontSize='11pt'>{post.voteStatus}</Text>
                                <Icon as = {AiOutlineDislike} 
                                color="gray.500" 
                                fontSize={22.5}
                                onClick={() => setAuthModalState({ open:true, view: "login"})} 
                                ml={0.5}
                                cursor="pointer"
                                />
                            </Flex>
                    }
               <Flex>
                    {post.typeOfQuestions && (
                        post.typeOfQuestions.value == 'Academic Question'
                        ?
                            <Flex  ml={5} align='center' justify='right' cursor="pointer">
                                <Text>{highestPercentage} voted {highestPercentageName}</Text>
                                <ul className='flexBar'>
                                    <li> <span style={{fontSize:'12px',color:'#fff'}}>Vote Difficulty</span></li>
                                    <li><Button onClick={() => handleClickVoting('easy')} className='green'>Easy</Button></li>
                                    <li><Button onClick={() => handleClickVoting('medium')}  className='yellow'>Medium</Button></li>
                                    <li><Button onClick={() => handleClickVoting('hard')}  className='red'>Hard</Button></li>
                                </ul>
                            </Flex>
                        :
                            ''
                    )}
                    
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
