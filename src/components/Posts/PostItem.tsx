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
import DocumentViewerModal from '@/components/Modal/DocumentViewerModal';

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

    // Viewer State
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerUrl, setViewerUrl] = useState('');

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
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="sm"
            _hover={{
                borderColor: "brand.300",
                boxShadow: "lg",
                transform: "translateY(-2px)"
            }}
            transition="all 0.3s ease"
            overflow="hidden"
            mb={4}
        >
            {deletePostMessage && <Box bg="green.50" p={2}><Text textAlign="center" color="green.600" fontSize="sm">{deletePostMessage}</Text></Box>}

            {/* HEADER SECTION */}
            <Flex p={5} pb={2} justify="space-between" align="flex-start" gap={4}>
                {/* Left: Avatar & Meta */}
                <Flex align="center" gap={3}>
                    <Image
                        src={getSketchAvatarUrl(post.creatorId || post.creatorDisplayName)}
                        boxSize="40px"
                        borderRadius="full"
                        border="1px solid"
                        borderColor="gray.100"
                        bg="gray.50"
                    />
                    <Flex direction="column">
                        <Flex align="center" gap={1}>
                            <Text fontSize="sm" fontWeight="700" color="gray.800">
                                {post.creatorDisplayName}
                            </Text>
                            {homePage && post.subjectId && (
                                <>
                                    <Text fontSize="xs" color="gray.400">•</Text>
                                    <Link href={`subject/${post.subjectId}`} onClick={(e) => e.stopPropagation()}>
                                        <Text fontSize="xs" fontWeight="600" color="brand.500" _hover={{ textDecoration: "underline" }}>
                                            {post.subjectId}
                                        </Text>
                                    </Link>
                                </>
                            )}
                        </Flex>
                        <Text fontSize="xs" color="gray.500">
                            {moment(new Date(post.createdAt?.seconds * 1000)).fromNow()}
                        </Text>
                    </Flex>
                </Flex>

                {/* Right: Tags */}
                <Flex gap={2} wrap="wrap" justify="flex-end" maxW="40%">
                    {post.typeOfQuestions && post.typeOfQuestions !== '' && (
                        <Badge
                            colorScheme="purple"
                            variant="subtle"
                            px={2.5}
                            py={0.5}
                            borderRadius="full"
                            fontSize="xs"
                            textTransform="capitalize"
                        >
                            {post.typeOfQuestions.value === 'General Question' ? 'General Doubt' : post.typeOfQuestions.value}
                        </Badge>
                    )}
                    {post.criteria && Array.isArray(post.criteria) && post.criteria.map((criterion: any, index: any) => (
                        criterion.value !== '' && (
                            <Badge
                                key={index}
                                colorScheme="gray"
                                variant="outline"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight={500}
                                color="gray.500"
                            >
                                {criterion.value}
                            </Badge>
                        )
                    ))}
                    {post.grade && post.grade.value && (
                        <Badge colorScheme="blue" variant="subtle" px={2} py={0.5} borderRadius="full" fontSize="xs">
                            MYP {post.grade.value}
                        </Badge>
                    )}
                </Flex>
            </Flex>

            {/* BODY SECTION */}
            <Flex
                direction="column"
                px={5}
                py={2}
                cursor={singlePostPage ? "unset" : "pointer"}
                onClick={() => onSelectPost && onSelectPost(post)}
            >
                <Text fontSize="xl" fontWeight="800" color="gray.800" mb={2} lineHeight="short">
                    {post.title}
                </Text>

                <Box
                    ref={contentRef}
                    fontSize="md"
                    color="gray.600"
                    lineHeight="1.6"
                    maxH={showFullBody ? 'none' : '300px'}
                    overflowY="hidden"
                    position="relative"
                    className="post-body"
                >
                    <div dangerouslySetInnerHTML={{ __html: post.body }} />
                    {!showFullBody && isLongContent && (
                        <Box
                            position="absolute"
                            bottom="0"
                            left="0"
                            w="100%"
                            h="100px"
                            bgGradient="linear(to-t, white 0%, transparent 100%)"
                        />
                    )}
                </Box>

                {isLongContent && (
                    <Button
                        onClick={(e) => { e.stopPropagation(); toggleBodyDisplay(); }}
                        variant="link"
                        size="sm"
                        colorScheme="brand"
                        fontWeight="600"
                        alignSelf="flex-start"
                        mt={1}
                        _hover={{ textDecoration: 'none', color: 'brand.600' }}
                    >
                        {showFullBody ? "Show Less" : "Read More"}
                    </Button>
                )}

                {/* ATTACHMENTS */}
                {post.imageURLs && (
                    <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3} mt={4} w="100%">
                        {post.imageURLs.map((imageURL: string, index: number) => {
                            const parts = imageURL.split('.');
                            const extension = parts[parts.length - 1].split('?')[0].toLowerCase();

                            const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension);
                            const isPdf = extension === 'pdf';

                            return (
                                <Flex
                                    key={index}
                                    direction="column"
                                    borderRadius="lg"
                                    overflow="hidden"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    _hover={{ transform: "translateY(-2px)", shadow: "md", borderColor: "gray.300" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isImage) {
                                            window.open(imageURL, '_blank');
                                        } else {
                                            setViewerUrl(imageURL);
                                            setIsViewerOpen(true);
                                        }
                                    }}
                                    h="120px"
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
                                        <Box w="100%" h="100%" position="relative" overflow="hidden">
                                            <iframe
                                                src={`https://docs.google.com/gview?url=${encodeURIComponent(imageURL)}&embedded=true`}
                                                style={{
                                                    width: '120%',
                                                    height: '180%',
                                                    marginTop: '-70px',
                                                    marginLeft: '-10%',
                                                    border: 'none',
                                                    overflow: 'hidden',
                                                    transform: 'scale(1.1)',
                                                    transformOrigin: 'top center',
                                                    pointerEvents: 'none'
                                                }}
                                                title="Preview"
                                                scrolling="no"
                                            />
                                            {/* Transparent Overlay */}
                                            <Box
                                                position="absolute"
                                                top="0"
                                                left="0"
                                                w="100%"
                                                h="100%"
                                                bg="transparent"
                                            />
                                            <Badge
                                                position="absolute"
                                                bottom="4px"
                                                right="4px"
                                                colorScheme={isPdf ? "red" : "blue"}
                                                fontSize="xs"
                                                boxShadow="sm"
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

            {/* ACTION FOOTER */}
            <Flex
                align="center"
                justify="space-between"
                px={5}
                py={3}
                mt={2}
                borderTop="1px solid"
                borderColor="gray.50"
                bg="gray.50"
            >
                {/* Voting */}
                <Flex
                    align="center"
                    bg="white"
                    borderRadius="full"
                    border="1px solid"
                    borderColor="gray.200"
                    px={1}
                    py={1}
                >
                    <Icon
                        as={userVoteValue === 1 ? AiFillLike : AiOutlineLike}
                        color={userVoteValue === 1 ? "brand.500" : "gray.400"}
                        fontSize={20}
                        p={1}
                        boxSize="28px"
                        borderRadius="full"
                        _hover={{ bg: "gray.100", color: "brand.500" }}
                        cursor="pointer"
                        onClick={(e) => { e.stopPropagation(); user ? onVote(post, 1, post.subjectId) : setAuthModalState({ open: true, view: "login" }) }}
                    />
                    <Text fontSize="sm" fontWeight="600" mx={2} color={post.voteStatus > 0 ? "brand.500" : (post.voteStatus < 0 ? "red.500" : "gray.600")}>
                        {post.voteStatus}
                    </Text>
                    <Icon
                        as={userVoteValue === -1 ? AiFillDislike : AiOutlineDislike}
                        color={userVoteValue === -1 ? "red.500" : "gray.400"}
                        fontSize={20}
                        p={1}
                        boxSize="28px"
                        borderRadius="full"
                        _hover={{ bg: "gray.100", color: "red.500" }}
                        cursor="pointer"
                        onClick={(e) => { e.stopPropagation(); user ? onVote(post, -1, post.subjectId) : setAuthModalState({ open: true, view: "login" }) }}
                    />
                </Flex>

                {/* Right Actions */}
                <Flex align="center" gap={4}>
                    <Flex
                        align="center"
                        gap={1.5}
                        cursor="pointer"
                        color="gray.500"
                        _hover={{ color: "brand.500" }}
                        onClick={(e) => { e.stopPropagation(); onSelectPost && onSelectPost(post) }}
                    >
                        <Icon as={MdOutlineComment} fontSize={20} />
                        <Text fontSize="sm" fontWeight="500">{post.numberOfAnswers}</Text>
                        <Text fontSize="xs" fontWeight="400" display={{ base: "none", sm: "block" }}>Comments</Text>
                    </Flex>

                    {userIsCreator && (
                        <Flex
                            align="center"
                            gap={1}
                            color="gray.400"
                            _hover={{ color: "red.500" }}
                            cursor="pointer"
                            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        >
                            <Icon as={AiOutlineDelete} fontSize={18} />
                            <Text fontSize="xs" display={{ base: "none", sm: "block" }}>Delete</Text>
                        </Flex>
                    )}
                </Flex>
            </Flex>

            {/* Modal */}
            <DocumentViewerModal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                url={viewerUrl}
                title={post.title}
            />
        </Flex>
    )
}
export default PostItem;
