import { SearchIcon } from '@chakra-ui/icons';
import { Flex, Input, InputGroup, InputRightElement, Image, Link, Box, Text, Stack, Spinner, Badge, Icon } from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where, limit } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/clientApp';
import { User } from 'firebase/auth';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilValue } from 'recoil';
import { curriculumState } from '@/atoms/curriculumAtom';
import { ContentItem } from '@/hooks/useContentLibrary';
import { FaBook } from 'react-icons/fa';

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
    curriculumId?: string;
}

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

const Searchinput: React.FC<SearchinputProps> = ({ user }) => {
    const [searchInputValue, setSearchInputValue] = useState('');

    // Cache for raw data
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [allLibraryItems, setAllLibraryItems] = useState<ContentItem[]>([]);
    const [dataFetched, setDataFetched] = useState(false);

    // Filtered Results
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [filteredLibrary, setFilteredLibrary] = useState<ContentItem[]>([]);

    const [users] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const curriculum = useRecoilValue(curriculumState);

    // 1. Fetch ALL data once (or when curriculum changes) to enable INSTANT filtering
    useEffect(() => {
        const fetchSearchData = async () => {
            console.log("SearchInput: Starting pre-fetch...");
            try {
                // Fetch Posts 
                // Removed orderBy to prevent index errors (missing index)
                const postsQuery = query(
                    collection(firestore, 'posts'),
                    limit(500)
                );

                // Fetch Library
                const libQuery = query(
                    collection(firestore, 'content_library')
                );

                const [postDocs, libDocs] = await Promise.all([
                    getDocs(postsQuery),
                    getDocs(libQuery)
                ]);

                const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
                const libraryItems = libDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContentItem[];

                console.log(`SearchInput: Fetched ${posts.length} posts and ${libraryItems.length} library items.`);

                setAllPosts(posts);
                setAllLibraryItems(libraryItems);
                setDataFetched(true);
            } catch (error) {
                console.error("Error pre-fetching search data:", error);
            }
        };

        fetchSearchData();
    }, []);

    // 2. Instant Filtering
    const handleSearch = (value: string) => {
        setSearchInputValue(value);

        if (value.trim() === '') {
            setFilteredPosts([]);
            setFilteredLibrary([]);
            return;
        }

        const lowerValue = value.toLowerCase();
        const currentCurriculumId = curriculum.curriculumId;

        // -- Filter Library --
        const matchingLibrary = allLibraryItems.filter(item => {
            // RELAXED Exclusion Logic
            // Instead of requiring strict match (which fails on typos/"IB-DP"),
            // we only exclude items that explicitly belong to the OTHER program.
            const p = item.program ? String(item.program).toLowerCase() : '';

            // If we are in DP, exclude MYP items. Allow everything else (DP, empty, etc.)
            if (currentCurriculumId === 'ib-dp' && p.includes('myp')) return false;

            // If we are in MYP, exclude DP items.
            if (currentCurriculumId === 'ib-myp' && p.includes('dp')) return false;

            // Search Logic: Title + Subject (User requested "use only title")
            // We include subject because "Math" might be the subject, not in the title "IA 1"
            const matches = (str?: string | number) => str ? String(str).toLowerCase().includes(lowerValue) : false;

            return (
                matches(item.title) ||
                matches(item.subject)
            );
        });

        // -- Filter Posts --
        const matchingPosts = allPosts.filter(post => {
            // RELAXED Curriculum Filtering
            if (post.curriculumId && post.curriculumId !== currentCurriculumId) {
                return false;
            }

            // Safe Title/Body check
            const titleMatch = post.title ? post.title.toLowerCase().includes(lowerValue) : false;
            const bodyMatch = post.body ? post.body.toLowerCase().includes(lowerValue) : false;

            return titleMatch || bodyMatch;
        });

        setFilteredLibrary(matchingLibrary);
        setFilteredPosts(matchingPosts);
    }

    return (
        <Flex flexGrow={1} maxWidth={{ base: "100%", md: user ? "auto" : "600px" }} mr={{ base: 0, md: 3 }} ml={{ base: 2, md: 1 }} direction="row" align="center" position="relative">
            <InputGroup size="sm" width="100%">
                <Input placeholder='Search Posts & Coursework...'
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
                    onChange={(e) => handleSearch(e.target.value)}
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

            {/* Search Results Dropdown */}
            {searchInputValue && (
                <Box
                    position="absolute"
                    top="45px"
                    left="0"
                    right="0"
                    bg="white"
                    zIndex="9999"
                    borderRadius="lg"
                    boxShadow="2xl"
                    border="1px solid"
                    borderColor="gray.100"
                    overflow="hidden"
                    maxHeight="500px"
                    overflowY="auto"
                >
                    {!dataFetched ? (
                        <Flex justify="center" align="center" p={6}>
                            <Spinner size="sm" color="brand.500" />
                            <Text ml={2} fontSize="xs" color="gray.500">Initializing Search...</Text>
                        </Flex>
                    ) : (
                        <>
                            {/* --- SECTION 1: COURSEWORK (Library) --- */}
                            {(filteredLibrary.length > 0) ? (
                                <Box p={3} bg="purple.50" borderBottom="1px solid" borderColor="purple.100">
                                    <Flex align="center" mb={2} gap={2}>
                                        <Icon as={FaBook} color="purple.500" boxSize={3} />
                                        <Text fontSize="xs" fontWeight="800" color="purple.600" textTransform="uppercase">Coursework</Text>
                                    </Flex>
                                    <Stack spacing={2}>
                                        {filteredLibrary.map((item) => (
                                            <Link key={item.id} href={`/content-library`} _hover={{ textDecoration: 'none' }}>
                                                <Flex p={2} bg="white" borderRadius="md" cursor="pointer" align="center" boxShadow="sm" _hover={{ bg: "purple.50", transform: "translateY(-1px)", boxShadow: "md" }} transition="all 0.2s">
                                                    <Box flexGrow={1}>
                                                        <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>{item.title}</Text>
                                                        <Text fontSize="xs" color="gray.500" noOfLines={1}>{item.subject} • {item.resourceType}</Text>
                                                    </Box>
                                                    {item.score && (
                                                        <Badge colorScheme="purple" fontSize="10px" variant="solid" bg="purple.400">{item.score}</Badge>
                                                    )}
                                                </Flex>
                                            </Link>
                                        ))}
                                    </Stack>
                                </Box>
                            ) : (
                                <Box p={3} bg="purple.50" borderBottom="1px solid" borderColor="purple.100">
                                    <Text fontSize="xs" fontWeight="700" color="purple.400" textTransform="uppercase" mb={1}>Coursework</Text>
                                    <Text fontSize="xs" color="gray.500" fontStyle="italic">No coursework found.</Text>
                                </Box>
                            )}

                            {/* --- SECTION 2: COMMUNITY POSTS --- */}
                            <Box p={3}>
                                <Text fontSize="xs" fontWeight="700" color="gray.500" mb={2} textTransform="uppercase">Community Posts</Text>
                                <Stack spacing={1}>
                                    {filteredPosts.length > 0 ? (
                                        filteredPosts.map((post: any, index: any) => (
                                            <Link key={index} href={`/subject/${post.subjectId}/answers/${post.id}`} _hover={{ textDecoration: 'none' }}>
                                                <Box p={2} _hover={{ bg: "brand.50" }} borderRadius="md" cursor="pointer" transition="all 0.2s">
                                                    <Text fontSize="sm" fontWeight="500" color="gray.700" noOfLines={1}>{post.title}</Text>
                                                    <Flex gap={2} mt={1}>
                                                        <Badge fontSize="10px" colorScheme={post.typeOfQuestions?.value === 'Resource' ? 'green' : 'blue'}>
                                                            {post.typeOfQuestions?.value || 'General'}
                                                        </Badge>
                                                        <Text fontSize="10px" color="gray.400">{post.subjectId}</Text>
                                                    </Flex>
                                                </Box>
                                            </Link>
                                        ))
                                    ) : (
                                        <Text fontSize="sm" color="gray.400" p={2} fontStyle="italic">No posts found matching &quot;{searchInputValue}&quot;</Text>
                                    )}
                                </Stack>
                            </Box>
                        </>
                    )}
                </Box>
            )}
        </Flex>
    );
}

export default Searchinput;
