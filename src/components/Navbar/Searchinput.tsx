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
            const postsQuery = query(
                collection(firestore, 'posts'),
                where('title', '>=', value),
                where('title', '<=', value + '\uf8ff'),
                orderBy('title')
            );
            const postDocs = await getDocs(postsQuery);
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const newPosts = posts as Post[];

            // Filter by curriculum
            // Check if post.curriculumId matches current curriculum.
            // If post.curriculumId is undefined, we might check if we can infer it or just exclude it if strict.
            // User asked for strict separation.
            const curriculumPosts = newPosts.filter(post =>
                post.curriculumId === curriculum.curriculumId
            );

            const filterResourcePosts = curriculumPosts.filter(post => post.typeOfQuestions.value === 'Resource');
            const filterQuestionsPosts = curriculumPosts.filter(post => post.typeOfQuestions.value === 'Academic Question' || post.typeOfQuestions.value === 'General Question');

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
        <Flex flexGrow={1} maxWidth={user ? "auto" : "auto"} mr={3} ml={1} direction="row" justifyContent="right">
            <InputGroup>
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
                    height="36px"
                    bg="gray.50"
                    borderRadius="full"
                    border="1px solid"
                    borderColor="gray.200"
                />
                <InputRightElement pointerEvents='none'>
                    <SearchIcon color='gray.300' mb="5px" />
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
