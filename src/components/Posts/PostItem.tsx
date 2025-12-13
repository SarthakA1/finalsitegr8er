import { Post } from '@/atoms/postsAtom';
import { Flex, Icon, Stack, Text, Image, Link, textDecoration, SimpleGrid, Button, Badge, Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { AiOutlineDelete, AiFillTags } from "react-icons/ai";
import { TfiCommentAlt } from "react-icons/tfi";
import { collection, Timestamp, writeBatch, doc, serverTimestamp, getDocs, orderBy, query, where } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/clientApp';
import { MdOutlineComment } from "react-icons/md";
import { AiFillLike, AiOutlineLike, AiFillDislike, AiOutlineDislike } from "react-icons/ai";
import { FaFilePdf, FaFileWord, FaFilePowerpoint } from "react-icons/fa";
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
import { getSketchAvatarUrl } from '@/utils/avatar';

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
const PostItem: React.FC<PostItemProps> = ({
    post,
    userIsCreator,
    userVoteValue,
    onVote,
    onDeletePost,
    onSelectPost,
    homePage
}: any) => {
    const [showFullBody, setShowFullBody] = useState(false);
    const [isLongContent, setIsLongContent] = useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Check content height to determine if "Read More" is needed
    useEffect(() => {
        if (contentRef.current) {
            // If scrollHeight > 400 (our max height), showing the button is necessary
            setIsLongContent(contentRef.current.scrollHeight > 400);
        }
    }, [post.body]);

    const toggleBodyDisplay = () => {

        setShowFullBody(!showFullBody);
    };
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
            setTimeout(function () {
                setDeletePostMessage('');
                router.push('/');
            }, 3000);
        } catch (error: any) {

        }
    }
    const handleClickVoting = async (value: any) => {
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
        if (voting.length > 0) {
            console.log(voting[0].id);
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
            newDifficultyVoting.createdAt = { seconds: Date.now() / 1000 } as Timestamp
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

        if (highestPercentage + '%' !== 'NaN%') {
            setHighestPercentage(highestPercentage + '%');
            setHighestPercentageName(highestPercentageOption);
        } else {
            setHighestPercentage('Not');
            setHighestPercentageName(highestPercentageOption);
        }
    }
    useEffect(() => {
        if (post.id) {
            fetchVotingData();
        }
    }, [post.id])
    return (
        <Flex
            direction='column'
            border="1px solid"
            borderColor={singlePostPage ? "whiteAlpha.300" : "whiteAlpha.300"}
            borderRadius={singlePostPage ? "4px 4px 0px 0px" : "xl"}
            bg="rgba(255, 255, 255, 0.8)"
            backdropFilter="blur(12px)"
            shadow={singlePostPage ? "none" : "sm"}
            _hover=
            {{ borderColor: singlePostPage ? "none" : "brand.500", shadow: singlePostPage ? "none" : "xl", transform: singlePostPage ? "none" : "translateY(-4px)" }}
            transition="all 0.3s"
        >
            {deletePostMessage ? <Text style={{ textAlign: "center", padding: "10px", color: "green" }}>{deletePostMessage}</Text> : ''}
            {/* <Flex 
                direction="row" 
                align="center" 
                bg="blue.100" 
                p={2}
            >  */}
            <Flex direction="column" p={3} gap={2}>
                <Flex
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    direction={{ base: "column", md: "row" }}
                    gap={2}
                >
                    <Flex align="center" gap={2} mb={{ base: 2, md: 0 }}>
                        {homePage && (
                            <>
                                {post.subjectImageURL ? (
                                    <Image src={post.subjectImageURL} borderRadius="full" boxSize="24px" />
                                ) : (
                                    <Icon as={RiGroup2Fill} fontSize="24px" color="brand.500" />
                                )}
                                <Link href={`subject/${post.subjectId}`}>
                                    <Text fontWeight={700} fontSize="sm" color="brand.600" _hover={{ textDecoration: "underline" }}
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        {post.subjectId}
                                    </Text>
                                </Link>
                            </>
                        )}
                        <Flex align="center">
                            <Image
                                src={getSketchAvatarUrl(post.creatorId || post.creatorDisplayName)}
                                boxSize="20px"
                                borderRadius="full"
                                mr={2}
                                border="1px solid"
                                borderColor="gray.200"
                            />
                            <Text fontSize="xs" color="gray.600">
                                {post.typeOfQuestions && post.typeOfQuestions.value === 'Resource' ? 'Shared by ' : 'Asked by '}
                                <Text as="span" color="brand.600" fontWeight="600">{post.creatorDisplayName}</Text>
                                {' • '}{moment(new Date(post.createdAt?.seconds * 1000)).fromNow()}
                            </Text>
                        </Flex>
                    </Flex>
                    <Flex gap={1.5} wrap="wrap" justify={{ base: "flex-start", md: "flex-end" }} align="center">
                        {post.criteria && Array.isArray(post.criteria) && post.criteria.map((criterion: any, index: any) => (
                            criterion.value !== '' && (
                                <Badge
                                    key={index}
                                    colorScheme="gray"
                                    px={{ base: 2, md: 3 }}
                                    py={{ base: 0.5, md: 1 }}
                                    borderRadius="full"
                                    fontSize={{ base: "10px", md: "xs" }}
                                    fontWeight={600}
                                    whiteSpace="nowrap"
                                >
                                    {criterion.value}
                                </Badge>
                            )
                        ))}
                        {post.typeOfQuestions && post.typeOfQuestions !== '' && (
                            <Badge
                                colorScheme="blue"
                                px={{ base: 2, md: 3 }}
                                py={{ base: 0.5, md: 1 }}
                                borderRadius="full"
                                fontSize={{ base: "10px", md: "xs" }}
                                fontWeight={600}
                                whiteSpace="nowrap"
                            >
                                {post.typeOfQuestions.value === 'General Question' ? 'General Doubt' : post.typeOfQuestions.value}
                            </Badge>
                        )}
                    </Flex>
                </Flex>
            </Flex>
            {/* </Flex> */}

            <Flex
                direction="column"
                align="left"
                p={2}
                bg="white"
                cursor={singlePostPage ? "unset" : "pointer"}
                onClick={() => onSelectPost && onSelectPost(post)} >


                <Flex direction="row" align="center" mb={3} gap={2}>
                    <Text fontSize='lg' fontWeight={700} color="gray.900" lineHeight="1.4"> {post.title} </Text>
                    <Badge colorScheme="gray" px={2} py={1} borderRadius="md" fontSize="10px" fontWeight={600}>MYP {post.grade?.value}</Badge>
                </Flex>

                {/* Content Body with Height Ref */}
                <div
                    ref={contentRef}
                    style={{
                        maxHeight: showFullBody ? 'none' : '400px',
                        overflowY: 'hidden',
                        position: 'relative'
                    }}
                >
                    <div dangerouslySetInnerHTML={{ __html: post.body }} />
                    {/* Gradient Overlay for collapsed state */}
                    {!showFullBody && isLongContent && (
                        <Box
                            position="absolute"
                            bottom="0"
                            left="0"
                            w="100%"
                            h="80px"
                            bgGradient="linear(to-t, white 0%, transparent 100%)"
                        />
                    )}
                </div>

                {/* Intelligent Read More Button */}
                {(isLongContent) && (
                    <Button
                        onClick={(e) => { e.stopPropagation(); toggleBodyDisplay(); }}
                        variant="ghost"
                        size="sm"
                        colorScheme="brand"
                        mt={2}
                    >
                        {showFullBody ? "Show Less" : "Read More"}
                    </Button>
                )}

                {post.imageURLs && (
                    <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3} mt={6} w="100%">
                        {post.imageURLs.map((imageURL: string, index: number) => {
                            const parts = imageURL.split('.');
                            const extension = parts[parts.length - 1].split('?')[0].toLowerCase();

                            const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension);
                            const isPdf = extension === 'pdf';
                            const isWord = ['doc', 'docx'].includes(extension);

                            // For non-images, we also try to show a visual using Google Docs Viewer
                            // But for PPT/Word sometimes it's shaky. For PDF it works well.

                            return (
                                <Flex
                                    key={index}
                                    direction="column"
                                    borderRadius="lg"
                                    overflow="hidden"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(imageURL, '_blank');
                                    }}
                                    h="140px"
                                    position="relative"
                                    bg="gray.50"
                                >
                                    {isImage ? (
                                        <Image
                                            src={imageURL}
                                            alt="attachment"
                                            h="100%"
                                            w="100%"
                                            objectFit="cover"
                                        />
                                    ) : (
                                        <Box w="100%" h="100%" position="relative">
                                            {/* Visual Preview Iframe (Click-through blocked by overlay) */}
                                            <iframe
                                                src={`https://docs.google.com/gview?url=${encodeURIComponent(imageURL)}&embedded=true`}
                                                style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden', transform: 'scale(1.0)', transformOrigin: 'top left', pointerEvents: 'none' }}
                                                title="Preview"
                                                scrolling="no"
                                            />
                                            {/* Transparent Overlay for Click Action */}
                                            <Box
                                                position="absolute"
                                                top="0"
                                                left="0"
                                                w="100%"
                                                h="100%"
                                                bg="transparent"
                                                role="button"
                                                aria-label="Open document"
                                            />
                                            {/* File Type Badge */}
                                            <Badge
                                                position="absolute"
                                                bottom="4px"
                                                right="4px"
                                                colorScheme={isPdf ? "red" : "blue"}
                                                fontSize="xs"
                                            >
                                                {extension.toUpperCase()}
                                            </Badge>
                                        </Box>
                                    )}
                                </Flex>
                            );
                        })}
                    </SimpleGrid>
                )}
            </Flex>


            <Flex
                direction="row"
                bg="blue.100"
                p={2}>

                {user
                    ?
                    <Flex align='center' justify='center'>
                        <Icon as={userVoteValue === 1 ? AiFillLike : AiOutlineLike}
                            color={userVoteValue === 1 ? "#9FB751" : "gray.500"}
                            fontSize={24}
                            onClick={() => onVote(post, 1, post.subjectId)}
                            cursor="pointer"
                            mr={0.5} />
                        <Text color="gray.500" fontSize='11pt'>{post.voteStatus}</Text>
                        <Icon as={userVoteValue === -1 ? AiFillDislike : AiOutlineDislike}
                            color={userVoteValue === -1 ? "#EB4E45" : "gray.500"}
                            fontSize={22.5}
                            onClick={() => onVote(post, -1, post.subjectId)}
                            ml={0.5}
                            cursor="pointer"
                        />
                    </Flex>
                    :
                    <Flex align='center' justify='center'>
                        <Icon as={AiOutlineLike} color="gray.500" fontSize={24} cursor="pointer" mr={0.5} onClick={() => setAuthModalState({ open: true, view: "login" })} />
                        <Text color="gray.500" fontSize='11pt'>{post.voteStatus}</Text>
                        <Icon as={AiOutlineDislike}
                            color="gray.500"
                            fontSize={22.5}
                            onClick={() => setAuthModalState({ open: true, view: "login" })}
                            ml={0.5}
                            cursor="pointer"
                        />
                    </Flex>
                }
                <Flex>
                    {post.typeOfQuestions && (
                        post.typeOfQuestions.value == 'Academic Question'
                            ?
                            <Flex ml={5} align='center' justify='right' cursor="pointer">


                            </Flex>
                            :
                            ''
                    )}

                    <Flex ml={5} align='center' justify='right' cursor="pointer">
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
                            _hover={{ bg: "blue.200" }}
                            cursor="pointer"
                            ml={2}
                            onClick={handleDelete}
                            color="#ff0000"
                        >
                            <Icon as={AiOutlineDelete} />

                        </Flex>
                    )}
                </Flex>
            </Flex>
        </Flex>

    )
}
export default PostItem;
