import { SearchIcon } from '@chakra-ui/icons';
import { Flex, Input, InputGroup, InputRightElement, Image, Link, Box, Text, Stack, Spinner } from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/clientApp';
import { User } from 'firebase/auth';
import React, { useState } from 'react';
import Notification from './Notifications/Notification';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilValue } from 'recoil';
import { curriculumState } from '@/atoms/curriculumAtom';

type SearchinputProps = {
    user?: User | null;
};

type Post = {
    id?: string;
    subjectId: string;
    creatorId: string;
    creatorDisplayName: string;
    title: string;
    body: string;
    numberOfAnswers: number;
    voteStatus: number;
    imageURL?: string;
    subjectImageURL?: string;
    grade: string;
    typeOfQuestions: {
        label: string;
        value: string;
    };
    criteria: string;
    curriculumId?: string; // Added for filtering
}

const Searchinput: React.FC<SearchinputProps> = ({ user }) => {
    const [searchInputValue, setSearchInputValue] = useState('');
    const [resourcePostData, setResourcePostData] = useState<Post[]>([]);
    const [questionPostData, setQuestionPostData] = useState<Post[]>([]);
    const [users] = useAuthState(auth);

    const [loading, setLoading] = useState(false);
    const curriculum = useRecoilValue(curriculumState);

    const handleChange = async (e: any) => {
        const value = e.target.value;
        setSearchInputValue(value);

        if (value === '') {
            setResourcePostData([]);
            setQuestionPostData([]);
            return;
        }

        setLoading(true);
        try {
            // Fetch posts to search client-side
            // We fetch a batch of recent posts to search through their titles AND bodies.
            // Note: For a production app with thousands of posts, use a dedicated search service (Algolia/Typesense).
            // For this scale, client-side filtering allows checking 'body' content which Firestore queries can't do easily.
            const postsQuery = query(
                collection(firestore, 'posts'),
                orderBy('createdAt', 'desc')
                // Removed limit for now to ensure we find deep results, or cap at 100 for performance
                // limit(100) 
            );

            const postDocs = await getDocs(postsQuery);
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const newPosts = posts as Post[];

            // 1. Filter by Curriculum (Strict)
            // If the post has no curriculumId, we exclude it to be safe, or include if we want loose matching.
            // User requested: "if were in ib myp it should only search for ib myp posts"
            const currentCurriculumId = curriculum.curriculumId;

            const curriculumPosts = newPosts.filter(post => {
                // Check if post belongs to this curriculum
                // Validating 'curriculumId' field. 
                // If old posts don't have it, they won't show. This matches the request for strictness.
                return post.curriculumId === currentCurriculumId;
            });

            // 2. Filter by Search Term (Title OR Body)
            const lowerValue = value.toLowerCase();
            const searchResults = curriculumPosts.filter(post =>
                (post.title && post.title.toLowerCase().includes(lowerValue)) ||
                (post.body && post.body.toLowerCase().includes(lowerValue))
            );

            const filterResourcePosts = searchResults.filter(post => post.typeOfQuestions.value === 'Resource');
            const filterQuestionsPosts = searchResults.filter(post => post.typeOfQuestions.value === 'Academic Question' || post.typeOfQuestions.value === 'General Question');

            setResourcePostData(filterResourcePosts as Post[]);
            setQuestionPostData(filterQuestionsPosts as Post[]);
        } catch (error: any) {
            console.log('getPosts error', error.message);
        }
        setLoading(false);
    };

    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    const closeMenu = () => {
        setIsOpen(false);
    };
    const handleMenuItemClick = () => {
        closeMenu();
    };

    return (
        <Flex flexGrow={1} maxWidth={{ base: "100%", md: user ? "auto" : "600px" }} mr={{ base: 0, md: 3 }} ml={{ base: 2, md: 1 }} direction="row" align="center">
            <InputGroup size="sm" width="100%">
                <Input placeholder='Search GR8ER'
                    fontSize='10pt'
                    _placeholder={{ color: "gray.400" }}
                    _hover={{
                        bg: "white",
                        borderColor: "gray.300",
                    }}
                    _focus={{
                        outline: "none",
                        bg: "white",
                        borderColor: "brand.500",
                        boxShadow: "0 0 0 1px #4682B4",
                    }}
                    value={searchInputValue}
                    onChange={handleChange}
                    height="34px"
                    bg="gray.50"
                    borderRadius="full"
                    border="1px solid"
                    borderColor="gray.200"
                />
                <InputRightElement pointerEvents='none' height="34px">
                    <SearchIcon color='gray.300' mb="0px" />
                </InputRightElement>
            </InputGroup>
            {searchInputValue && (
                <Box
                    position="absolute"
                    top="45px"
                    left="0"
                    right="0"
                    bg="white"
                    zIndex="9999"
                    borderRadius="md"
                    boxShadow="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    overflow="hidden"
                    maxHeight="400px"
                    overflowY="auto"
                >
                    {loading ? (
                        <Flex justify="center" align="center" p={4}>
                            <Spinner size="sm" color="brand.500" />
                        </Flex>
                    ) : (
                        <>
                            <Box p={3}>
                                <Text fontSize="xs" fontWeight="700" color="gray.500" mb={2} textTransform="uppercase">Resources</Text>
                                <Stack spacing={1}>
                                    {resourcePostData.length > 0 ? (
                                        resourcePostData.map((resourcePost: any, index: any) => (
                                            <Link key={index} href={`/subject/${resourcePost.subjectId}/answers/${resourcePost.id}`} _hover={{ textDecoration: 'none' }}>
                                                <Box p={2} _hover={{ bg: "brand.50" }} borderRadius="md" cursor="pointer" transition="all 0.2s">
                                                    <Text fontSize="sm" fontWeight="500" color="gray.700">{resourcePost.title}</Text>
                                                </Box>
                                            </Link>
                                        ))
                                    ) : (
                                        <Text fontSize="sm" color="gray.400" p={2}>No Resources Found</Text>
                                    )}
                                </Stack>
                            </Box>
                            <Box height="1px" bg="gray.100" mx={3} />
                            <Box p={3}>
                                <Text fontSize="xs" fontWeight="700" color="gray.500" mb={2} textTransform="uppercase">Academic Questions & Doubts</Text>
                                <Stack spacing={1}>
                                    {questionPostData.length > 0 ? (
                                        questionPostData.map((questionPost: any, index: any) => (
                                            <Link key={index} href={`/subject/${questionPost.subjectId}/answers/${questionPost.id}`} _hover={{ textDecoration: 'none' }}>
                                                <Box p={2} _hover={{ bg: "brand.50" }} borderRadius="md" cursor="pointer" transition="all 0.2s">
                                                    <Text fontSize="sm" fontWeight="500" color="gray.700">{questionPost.title}</Text>
                                                </Box>
                                            </Link>
                                        ))
                                    ) : (
                                        <Text fontSize="sm" color="gray.400" p={2}>No Questions Found</Text>
                                    )}
                                </Stack>
                            </Box>
                        </>
                    )}
                </Box>
            )}
            <Flex alignItems="center" cursor="pointer" justifyContent="right">
                <Link href="https://www.youtube.com/@GR8ERIB/channels" rel="noopener noreferrer" target="_blank" display={{ base: 'none', md: 'block' }}>
                    <a>
                        <Image src="/images/youtubeblack.png" width='25px' mb="1px" />
                    </a>
                </Link>
                <Link href="https://www.instagram.com/gr8er_" rel="noopener noreferrer" target="_blank" ml={1} display={{ base: 'none', md: 'block' }}>
                    <a>
                        <Image src="/images/instagramblack.png" width='25px' mb="1px" />
                    </a>
                </Link>
                {users ? <Notification /> : ''}
            </Flex>
        </Flex>
    );
}

export default Searchinput;
