import { Post } from '@/atoms/postsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import { auth, firestore } from '@/firebase/clientApp';
import usePosts from '@/hooks/usePosts';
import { Stack, Select, Button, Flex, Text, Box } from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where, Firestore, doc, DocumentData, DocumentReference, limit } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import PostItem from './PostItem';
import PostLoader from './PostLoader';

type PostsProps = {
    subjectData: Subject;
    userId?: string;
    initialPosts?: Post[];
};

const Posts: React.FC<PostsProps> = ({ subjectData, userId, initialPosts }) => {
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(!initialPosts || initialPosts.length === 0);
    const [activeFilters, setActiveFilters] = useState<any>({
        grade: null,
        typeofquestion: null,
        criteria: null,
        difficulty: null,
        level: null,
        paper: null,
    });
    const { postStateValue, setPostStateValue, onVote, onDeletePost, onSelectPost } = usePosts(subjectData!);

    const [allFetchedPosts, setAllFetchedPosts] = useState<Post[]>(initialPosts || []);

    // Hydrate Recoil state
    useEffect(() => {
        if (initialPosts && initialPosts.length > 0) {
            setPostStateValue((prev) => ({
                ...prev,
                posts: initialPosts,
            }));
            setAllFetchedPosts(initialPosts);
        }
    }, [initialPosts, setPostStateValue]);

    const getPosts = async () => {
        if (!subjectData.id) return;
        setLoading(true);
        try {
            // Stage 1: Fast Initial Load (First 15 posts)
            // Skip if we already have initial posts from SSR
            if (!initialPosts || initialPosts.length === 0) {
                const initialQuery = query(
                    collection(firestore, "posts"),
                    where("subjectId", "==", subjectData.id),
                    orderBy("createdAt", "desc"),
                    limit(15)
                );
                const initialDocs = await getDocs(initialQuery);
                const initialPostsFetched = initialDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));

                setAllFetchedPosts(initialPostsFetched);
                setLoading(false);
            } else {
                setLoading(false);
            }

            // Stage 2: Background Load (Up to 100 posts to enable filtering)
            // We fetch the full list (including the first 15) to ensure consistency and simplicity in filtering
            const fullQuery = query(
                collection(firestore, "posts"),
                where("subjectId", "==", subjectData.id),
                orderBy("createdAt", "desc"),
                limit(100)
            );
            const fullDocs = await getDocs(fullQuery);
            const fullPosts = fullDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));

            setAllFetchedPosts(fullPosts);

        } catch (error: any) {
            console.log("getPosts error", error);
            setLoading(false); // Ensure loading is off on error
        }
    };

    // Removed getPostsByMaxVoting as it's no longer used in the new logic
    // Removed the old useEffect that depended on activeFilters for fetching

    const handleChangeTopFilter = (label: string, value: string) => {
        setActiveFilters((prevFilters: any) => {
            const updatedFilters: any = { ...prevFilters };
            if (updatedFilters[label] && updatedFilters[label].includes(value)) {
                updatedFilters[label] = updatedFilters[label].filter((val: string) => val !== value);
            } else {
                updatedFilters[label] = [... (updatedFilters[label] || []), value];
            }
            return updatedFilters;
        });
    };

    useEffect(() => {
        getPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectData]);

    // Instant Client-Side Filtering
    useEffect(() => {
        let filteredPosts = [...allFetchedPosts];

        const gradeFilters = activeFilters.grade || [];
        const levelFilters = activeFilters.level || [];
        const paperFilters = activeFilters.paper || [];
        const criteriaFilters = activeFilters.criteria || [];
        const typeFilters = activeFilters.typeofquestion || [];

        if (gradeFilters.length) {
            filteredPosts = filteredPosts.filter(p => p.grade && gradeFilters.includes(p.grade.value));
        }
        if (levelFilters.length) {
            filteredPosts = filteredPosts.filter(p => p.level && levelFilters.includes(p.level.value));
        }
        if (paperFilters.length) {
            filteredPosts = filteredPosts.filter(p => p.paper && paperFilters.includes(p.paper.value));
        }
        if (criteriaFilters.length) {
            filteredPosts = filteredPosts.filter(p => {
                if (!p.criteria) return false;
                const val = Array.isArray(p.criteria) ? p.criteria[0]?.value : p.criteria.value;
                return criteriaFilters.includes(val);
            });
        }
        if (typeFilters.length) {
            filteredPosts = filteredPosts.filter(p => p.typeOfQuestions && typeFilters.includes(p.typeOfQuestions.label));
        }

        setPostStateValue((prev) => ({
            ...prev,
            posts: filteredPosts,
        }));
    }, [allFetchedPosts, activeFilters, setPostStateValue]);

    return (

        <>
            {loading ? (
                <PostLoader />
            ) : (
                <Stack spacing={5}>
                    {/* Filters */}
                    <Box mb={4}>
                        <Stack spacing={2} align="center">
                            {subjectData.curriculumId === 'ib-dp' ? (
                                <>
                                    <Flex
                                        gap={2}
                                        wrap={{ base: "nowrap", md: "wrap" }}
                                        justify={{ base: "flex-start", md: "center" }}
                                        align="center"
                                        w="100%"
                                        overflowX={{ base: "auto", md: "visible" }}
                                        pb={{ base: 2, md: 0 }}
                                        css={{ "&::-webkit-scrollbar": { display: "none" } }}
                                    >
                                        <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase" mr={1} flexShrink={0}>Level:</Text>
                                        {['HL', 'SL'].map((level) => {
                                            const isActive = activeFilters.level?.includes(level);
                                            return (
                                                <Button
                                                    key={level}
                                                    size="xs"
                                                    onClick={() => handleChangeTopFilter('level', level)}
                                                    variant={isActive ? "solid" : "outline"}
                                                    colorScheme={isActive ? "purple" : "gray"}
                                                    bg={isActive ? "purple.600" : "transparent"}
                                                    color={isActive ? "white" : "gray.600"}
                                                    borderColor="gray.300"
                                                    _hover={{ bg: isActive ? "purple.500" : "gray.100" }}
                                                    borderRadius="full"
                                                    px={3}
                                                    fontSize="xs"
                                                    flexShrink={0}
                                                >
                                                    {level}
                                                </Button>
                                            )
                                        })}
                                    </Flex>

                                    <Flex
                                        gap={2}
                                        wrap={{ base: "nowrap", md: "wrap" }}
                                        justify={{ base: "flex-start", md: "center" }}
                                        align="center"
                                        w="100%"
                                        overflowX={{ base: "auto", md: "visible" }}
                                        pb={{ base: 2, md: 0 }}
                                        css={{ "&::-webkit-scrollbar": { display: "none" } }}
                                    >
                                        <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase" mr={1} flexShrink={0}>Paper:</Text>
                                        {['1', '2', '3'].map((paper) => {
                                            const isActive = activeFilters.paper?.includes(paper);
                                            return (
                                                <Button
                                                    key={paper}
                                                    size="xs"
                                                    onClick={() => handleChangeTopFilter('paper', paper)}
                                                    variant={isActive ? "solid" : "outline"}
                                                    colorScheme={isActive ? "pink" : "gray"}
                                                    bg={isActive ? "pink.600" : "transparent"}
                                                    color={isActive ? "white" : "gray.600"}
                                                    borderColor="gray.300"
                                                    _hover={{ bg: isActive ? "pink.500" : "gray.100" }}
                                                    borderRadius="full"
                                                    px={3}
                                                    fontSize="xs"
                                                    flexShrink={0}
                                                >
                                                    P{paper}
                                                </Button>
                                            )
                                        })}
                                    </Flex>
                                </>
                            ) : (
                                <>
                                    <Flex
                                        gap={2}
                                        wrap={{ base: "nowrap", md: "wrap" }}
                                        justify={{ base: "flex-start", md: "center" }}
                                        align="center"
                                        w="100%"
                                        overflowX={{ base: "auto", md: "visible" }}
                                        pb={{ base: 2, md: 0 }}
                                        css={{ "&::-webkit-scrollbar": { display: "none" } }}
                                    >
                                        <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase" mr={1} flexShrink={0}>Grade:</Text>
                                        {['1', '2', '3', '4', '5'].map((grade) => {
                                            const isActive = activeFilters.grade?.includes(grade);
                                            return (
                                                <Button
                                                    key={grade}
                                                    size="xs"
                                                    onClick={() => handleChangeTopFilter('grade', grade)}
                                                    variant={isActive ? "solid" : "outline"}
                                                    colorScheme={isActive ? "blackAlpha" : "gray"}
                                                    bg={isActive ? "gray.800" : "transparent"}
                                                    color={isActive ? "white" : "gray.600"}
                                                    borderColor="gray.300"
                                                    _hover={{ bg: isActive ? "gray.700" : "gray.100" }}
                                                    borderRadius="full"
                                                    px={3}
                                                    fontSize="xs"
                                                    flexShrink={0}
                                                >
                                                    MYP {grade}
                                                </Button>
                                            )
                                        })}
                                    </Flex>
                                    <Flex
                                        gap={2}
                                        wrap={{ base: "nowrap", md: "wrap" }}
                                        justify={{ base: "flex-start", md: "center" }}
                                        align="center"
                                        w="100%"
                                        overflowX={{ base: "auto", md: "visible" }}
                                        pb={{ base: 2, md: 0 }}
                                        css={{ "&::-webkit-scrollbar": { display: "none" } }}
                                    >
                                        <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase" mr={1} flexShrink={0}>Criteria:</Text>
                                        {['Criteria A', 'Criteria B', 'Criteria C', 'Criteria D'].map((criteria) => {
                                            const isActive = activeFilters.criteria?.includes(criteria);
                                            return (
                                                <Button
                                                    key={criteria}
                                                    size="xs"
                                                    onClick={() => handleChangeTopFilter('criteria', criteria)}
                                                    variant={isActive ? "solid" : "outline"}
                                                    colorScheme={isActive ? "teal" : "gray"}
                                                    bg={isActive ? "teal.600" : "transparent"}
                                                    color={isActive ? "white" : "gray.600"}
                                                    borderColor="gray.300"
                                                    _hover={{ bg: isActive ? "teal.500" : "gray.100" }}
                                                    borderRadius="full"
                                                    px={3}
                                                    fontSize="xs"
                                                    flexShrink={0}
                                                >
                                                    {criteria.replace('Criteria ', '')}
                                                </Button>
                                            )
                                        })}
                                    </Flex>
                                </>
                            )}

                            {/* Common Filters - Type */}
                            <Flex
                                gap={2}
                                wrap={{ base: "nowrap", md: "wrap" }}
                                justify={{ base: "flex-start", md: "center" }}
                                align="center"
                                w="100%"
                                overflowX={{ base: "auto", md: "visible" }}
                                pb={{ base: 2, md: 0 }}
                                css={{ "&::-webkit-scrollbar": { display: "none" } }}
                            >
                                <Text fontSize="xs" fontWeight="700" color="black" textTransform="uppercase" mr={1} flexShrink={0}>Type:</Text>
                                {[
                                    { label: 'Academic Question', value: 'Academic Question' },
                                    { label: 'General Doubt', value: 'General Doubt' },
                                    { label: 'Resource', value: 'Resource' }
                                ].map((type) => {
                                    const isActive = activeFilters.typeofquestion?.includes(type.value);
                                    return (
                                        <Button
                                            key={type.value}
                                            size="xs"
                                            onClick={() => handleChangeTopFilter('typeofquestion', type.value)}
                                            variant={isActive ? "solid" : "outline"}
                                            colorScheme={isActive ? "blue" : "gray"}
                                            bg={isActive ? "blue.600" : "white"}
                                            color={isActive ? "white" : "gray.600"}
                                            borderColor="gray.300"
                                            _hover={{ bg: isActive ? "blue.500" : "gray.100" }}
                                            borderRadius="full"
                                            px={3}
                                            fontSize="sm"
                                            fontWeight="medium"
                                            flexShrink={0}
                                        >
                                            {type.label}
                                        </Button>
                                    )
                                })}
                            </Flex>

                        </Stack>
                    </Box>


                    {postStateValue.posts.map((item: any, index: any) =>
                        <PostItem
                            post={item}
                            userIsCreator={user?.uid === item.creatorId}
                            userVoteValue={postStateValue.postVotes.find((vote: { postId: any; }) => vote.postId === item.id)?.voteValue}
                            onVote={onVote}
                            onSelectPost={onSelectPost}
                            onDeletePost={onDeletePost}
                            key={index}
                        />
                    )}
                </Stack>
            )}

        </>
    )
}
export default Posts;
