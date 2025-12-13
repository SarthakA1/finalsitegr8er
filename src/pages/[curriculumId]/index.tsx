
import { Stack, Select, Text, Flex, Box, Button, Wrap, Skeleton, Icon } from "@chakra-ui/react";
import { IoArrowUpCircleOutline } from "react-icons/io5";
import useContentLibrary from "@/hooks/useContentLibrary";
import ContentLibraryBanner from "@/components/ContentLibrary/ContentLibraryBanner";
import ConstructionModal from "@/components/Modal/ConstructionModal";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where,
    Timestamp
} from "firebase/firestore";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import React from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { Post, PostVote } from "../../atoms/postsAtom";
import CreatePostLink from "../../components/Subject/CreatePostLink";
import Recommendations from "../../components/Subject/Recommendations";
import PostItem from "../../components/Posts/PostItem";
import PostLoader from "../../components/Posts/PostLoader";
import { auth, firestore } from "../../firebase/clientApp";
import useSubjectData from "../../hooks/useSubjectData";
import usePosts from "../../hooks/usePosts";
import PageContent from "@/components/layout/PageContent";
import Head from 'next/head'
import { Image } from "@chakra-ui/react";
import { useRecoilState } from 'recoil';
import { curriculumState } from '@/atoms/curriculumAtom';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';

import { Analytics } from '@vercel/analytics/react';
import GoogleAd from "@/components/Ads/GoogleAd";

const CurriculumFeed: NextPage<{ initialPosts: Post[], curriculumId: string }> = ({ initialPosts, curriculumId }) => {
    const router = useRouter();
    // Use RecoilState to update it if URL changes
    const [curriculum, setCurriculum] = useRecoilState(curriculumState);

    const [loading, setLoading] = useState(false);
    const [user, loadingUser] = useAuthState(auth);

    const {
        postStateValue,
        setPostStateValue,
        onSelectPost,
        onDeletePost,
        onVote,
    } = usePosts();

    const [activeFilters, setActiveFilters] = useState<{
        grade: string[] | null;
        typeofquestion: string[] | null;
        criteria: string[] | null;
        difficulty: string[] | null;
        level: string[] | null;
        paper: string[] | null;
    }>({
        grade: null,
        typeofquestion: null,
        criteria: null,
        difficulty: null,
        level: null, // DP
        paper: null, // DP
    });

    const { subjectStateValue } = useSubjectData();
    const { contentItems, loading: contentLoading } = useContentLibrary();
    const [showTopBtn, setShowTopBtn] = useState(false);

    // Construction Modal State for IB DP
    const [isConstructionModalOpen, setConstructionModalOpen] = useState(false);

    // Sync URL to Global State
    useEffect(() => {
        if (curriculumId && (curriculumId === 'ib-myp' || curriculumId === 'ib-dp')) {
            if (curriculum.curriculumId !== curriculumId) {
                setCurriculum({ curriculumId: curriculumId as 'ib-myp' | 'ib-dp' });
            }
            // Trigger construction modal if IB DP
            if (curriculumId === 'ib-dp') {
                // Check if we already showed it this session? For now, always show on mount effectively.
                setConstructionModalOpen(true);
            }
        }
    }, [curriculumId, curriculum.curriculumId, setCurriculum]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowTopBtn(true);
            } else {
                setShowTopBtn(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const goToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const isBrowser = () => typeof window !== 'undefined';

    const hydratePosts = (posts: any[]): Post[] => {
        if (!posts) return [];
        return posts.map(p => ({
            ...p,
            createdAt: typeof p.createdAt?.toDate === 'function'
                ? p.createdAt
                : new Timestamp(p.createdAt?.seconds || 0, p.createdAt?.nanoseconds || 0)
        }));
    }

    const [allFetchedPosts, setAllFetchedPosts] = useState<Post[]>(hydratePosts(initialPosts) || []);

    // Initial setState for posts (Hydration)
    useEffect(() => {
        if (initialPosts && initialPosts.length > 0) {
            const hydrated = hydratePosts(initialPosts);
            setPostStateValue((prev) => ({
                ...prev,
                posts: hydrated,
            }));
            // Also ensure local state is hydrated if it wasn't caught by useState (e.g. if prop updates later)
            setAllFetchedPosts(hydrated);
        }
    }, [initialPosts, setPostStateValue]);


    // Background Fetch Function - Only fetches larger set for filtering
    const fetchBackgroundPosts = async () => {
        try {
            // We do NOT set loading true here to avoid blocking UI or showing spinner on top of content
            // Stage 2: Background Load (100 posts)
            // Fetch significantly more posts to handle client-side filtering effectively
            const fullQuery = query(
                collection(firestore, "posts"),
                orderBy("createdAt", "desc"),
                limit(100)
            );
            const fullDocs = await getDocs(fullQuery);
            let fullPosts = fullDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));

            // Client-Side Filter for Full Batch
            if (curriculumId) {
                fullPosts = fullPosts.filter(p => (p.curriculumId || 'ib-myp') === curriculumId);
            }

            // Apply User Feed Logic
            if (user && subjectStateValue.mySnippets.length > 0) {
                const currentCurriculumId = (curriculumId as string) || 'ib-myp';
                const snippetSubjectIds = subjectStateValue.mySnippets
                    .filter(s => (s.curriculumId || 'ib-myp') === currentCurriculumId)
                    .map(s => s.subjectId);

                if (snippetSubjectIds.length > 0) {
                    const myPosts = fullPosts.filter(p => snippetSubjectIds.includes(p.subjectId));
                    if (myPosts.length > 0) {
                        fullPosts = myPosts;
                    }
                }
            }

            setAllFetchedPosts(fullPosts);

            // Get votes for these posts
            if (user && fullPosts.length > 0) {
                getUserPostVotes(fullPosts);
            }

        } catch (error: any) {
            console.log("fetchBackgroundPosts error", error);
        }
    };

    // Background Fetch Effect
    useEffect(() => {
        if (!curriculumId) return;
        // Trigger background fetch after mount
        fetchBackgroundPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [curriculumId, user]);

    // Instant Client-Side Filtering Effect
    useEffect(() => {
        // If we have no active filters, we show everything we have (initial or full)
        // But we must apply the activeFilters logic if present
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


    useEffect(() => {
        if (!user && !loadingUser) {
            // buildNoUserHomeFeed(); // Replaced by fetchPosts
        }
    }, [user, loadingUser]);

    const getUserPostVotes = async (currentPosts: Post[]) => {
        if (!user || !currentPosts.length) return;
        try {
            const postIds = currentPosts.map((post) => post.id);
            let postVotes: any = []
            const limit = 10
            while (postIds.length) {
                const postVotesQuery = query(
                    collection(firestore, `users/${user?.uid}/postVotes`),
                    where('postId', 'in', postIds.slice(0, limit))
                );
                const postVoteDocs = await getDocs(postVotesQuery);
                const postVotesData = postVoteDocs.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                postVotes.push(...postVotesData)
                postIds.splice(0, limit)
            }
            setPostStateValue((prev) => ({
                ...prev,
                postVotes: postVotes as PostVote[],
            }));
        } catch (error) {
            console.log("getUserPostVotes error", error);
        }
    };

    const handleChangeTopFilter = (label: string, value: string) => {
        setActiveFilters((prevFilters) => {
            const updatedFilters: any = { ...prevFilters };
            if (updatedFilters[label] && updatedFilters[label].includes(value)) {
                updatedFilters[label] = updatedFilters[label].filter((val: string) => val !== value);
            } else {
                updatedFilters[label] = [... (updatedFilters[label] || []), value];
            }
            return updatedFilters;
        });
    };

    // Removed the Effect that called fetchPosts, replaced by background fetch effect

    return (
        <PageContent>
            <>
                <CreatePostLink />
                <ConstructionModal
                    isOpen={isConstructionModalOpen}
                    onClose={() => {
                        setConstructionModalOpen(false);
                        setCurriculum({ curriculumId: 'ib-myp' });
                        router.push('/ib-myp');
                    }}
                />
                <Analytics />
                <Box>
                    <Head>
                        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6442166008118008"
                            crossOrigin="anonymous"></script>
                        <title>GR8ER - {curriculumId === 'ib-dp' ? 'IB DP' : 'IB MYP'}</title>
                    </Head>
                </Box>
                {loading ? (
                    <PostLoader />
                ) : (
                    <Stack spacing={4}>
                        {/* Content Library Banner - Top Priority */}
                        <ContentLibraryBanner />

                        {/* Filters */}
                        {/* Filters */}
                        <Box mb={4} width="100%" mt={6} bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl" p={5} boxShadow="sm">
                            <Flex
                                wrap="wrap"
                                align="center"
                                justify="flex-start"
                                w="100%"
                                gap={2}
                            >
                                {curriculumId === 'ib-dp' ? (
                                    <>
                                        {/* Level */}
                                        <Flex align="center" gap={1}>
                                            <Text fontSize="xs" fontWeight="700" color="black" textTransform="uppercase" mr={1} flexShrink={0}>Level:</Text>
                                            {['HL', 'SL'].map((level) => {
                                                const isActive = activeFilters.level?.includes(level);
                                                return (
                                                    <Button
                                                        key={level}
                                                        size="xs"
                                                        onClick={() => handleChangeTopFilter('level', level)}
                                                        variant={isActive ? "solid" : "subtle"}
                                                        colorScheme="purple"
                                                        bg={isActive ? "purple.600" : "purple.50"}
                                                        color={isActive ? "white" : "purple.700"}
                                                        _hover={{ bg: isActive ? "purple.500" : "purple.100" }}
                                                        borderRadius="full"
                                                        px={3}
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                        flexShrink={0}
                                                        boxShadow={isActive ? "sm" : "none"}
                                                    >
                                                        {level}
                                                    </Button>
                                                )
                                            })}
                                        </Flex>

                                        <Box width="1px" height="15px" bg="gray.300" mx={1} display={{ base: "none", md: "block" }} flexShrink={0} />

                                        {/* Paper */}
                                        <Flex align="center" gap={1}>
                                            <Text fontSize="xs" fontWeight="700" color="black" textTransform="uppercase" mr={1} flexShrink={0}>Paper:</Text>
                                            {['1', '2', '3'].map((paper) => {
                                                const isActive = activeFilters.paper?.includes(paper);
                                                return (
                                                    <Button
                                                        key={paper}
                                                        size="xs"
                                                        onClick={() => handleChangeTopFilter('paper', paper)}
                                                        variant={isActive ? "solid" : "subtle"}
                                                        colorScheme="pink"
                                                        bg={isActive ? "pink.500" : "pink.50"}
                                                        color={isActive ? "white" : "pink.600"}
                                                        _hover={{ bg: isActive ? "pink.400" : "pink.100" }}
                                                        borderRadius="full"
                                                        px={3}
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                        flexShrink={0}
                                                        boxShadow={isActive ? "sm" : "none"}
                                                    >
                                                        P{paper}
                                                    </Button>
                                                )
                                            })}
                                        </Flex>
                                    </>
                                ) : (
                                    <>
                                        {/* Grade */}
                                        <Flex align="center" gap={1}>
                                            <Text fontSize="xs" fontWeight="700" color="black" textTransform="uppercase" mr={1} flexShrink={0}>Grade:</Text>
                                            {['1', '2', '3', '4', '5'].map((grade) => {
                                                const isActive = activeFilters.grade?.includes(grade);
                                                return (
                                                    <Button
                                                        key={grade}
                                                        size="xs"
                                                        onClick={() => handleChangeTopFilter('grade', grade)}
                                                        variant={isActive ? "solid" : "subtle"}
                                                        colorScheme="cyan"
                                                        bg={isActive ? "cyan.500" : "cyan.50"}
                                                        color={isActive ? "white" : "cyan.700"}
                                                        _hover={{ bg: isActive ? "cyan.600" : "cyan.100" }}
                                                        borderRadius="full"
                                                        px={3}
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                        flexShrink={0}
                                                        boxShadow={isActive ? "sm" : "none"}
                                                    >
                                                        MYP {grade}
                                                    </Button>
                                                )
                                            })}
                                        </Flex>

                                        <Box width="1px" height="15px" bg="gray.300" mx={1} display={{ base: "none", md: "block" }} flexShrink={0} />

                                        {/* Criteria */}
                                        <Flex align="center" gap={1}>
                                            <Text fontSize="xs" fontWeight="700" color="black" textTransform="uppercase" mr={1} flexShrink={0}>Criteria:</Text>
                                            {['Criteria A', 'Criteria B', 'Criteria C', 'Criteria D'].map((criteria) => {
                                                const isActive = activeFilters.criteria?.includes(criteria);
                                                return (
                                                    <Button
                                                        key={criteria}
                                                        size="xs"
                                                        onClick={() => handleChangeTopFilter('criteria', criteria)}
                                                        variant={isActive ? "solid" : "subtle"}
                                                        colorScheme="orange"
                                                        bg={isActive ? "orange.400" : "orange.50"}
                                                        color={isActive ? "white" : "orange.700"}
                                                        _hover={{ bg: isActive ? "orange.500" : "orange.100" }}
                                                        borderRadius="full"
                                                        px={3}
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                        flexShrink={0}
                                                        boxShadow={isActive ? "sm" : "none"}
                                                    >
                                                        {criteria.replace('Criteria ', '')}
                                                    </Button>
                                                )
                                            })}
                                        </Flex>
                                    </>
                                )}

                                <Box width="1px" height="15px" bg="gray.300" mx={1} display={{ base: "none", md: "block" }} flexShrink={0} />

                                {/* Type */}
                                <Flex align="center" gap={1}>
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
                                                variant={isActive ? "solid" : "subtle"}
                                                colorScheme="teal"
                                                bg={isActive ? "teal.500" : "teal.50"}
                                                color={isActive ? "white" : "teal.600"}
                                                _hover={{ bg: isActive ? "teal.600" : "teal.100" }}
                                                borderRadius="full"
                                                px={3}
                                                fontSize="xs"
                                                fontWeight="bold"
                                                flexShrink={0}
                                                boxShadow={isActive ? "sm" : "none"}
                                            >
                                                {type.label}
                                            </Button>
                                        )
                                    })}
                                </Flex>
                            </Flex>
                        </Box>

                        {postStateValue.posts.slice(0, 100).map((post, index) => (
                            <React.Fragment key={post.id}>
                                <PostItem
                                    post={post}
                                    onSelectPost={onSelectPost}
                                    onDeletePost={onDeletePost}
                                    onVote={onVote}
                                    userVoteValue={
                                        postStateValue.postVotes.find(
                                            (item) => item.postId === post.id
                                        )?.voteValue
                                    }
                                    userIsCreator={user?.uid === post.creatorId}
                                    homePage
                                />
                                {/* Insert Ad every 10 posts */}
                                {(index + 1) % 10 === 0 && (
                                    <Box my={4} borderRadius="md" overflow="hidden" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                        <GoogleAd
                                            slot="3619019024"
                                            format="fluid"
                                            layoutKey="-gw-3+1f-3d+2z"
                                        />
                                    </Box>
                                )}
                            </React.Fragment>
                        ))}

                        {postStateValue.posts.length === 0 && !loading && (
                            <Flex justify="center" p={10}>
                                <Text color="gray.500">No posts specifically for {curriculumId === 'ib-dp' ? 'IB DP' : 'IB MYP'} yet.</Text>
                            </Flex>
                        )}
                    </Stack>
                )
                }
            </>
            <>
                <Stack spacing={5}>
                    <Recommendations />
                </Stack>
                {showTopBtn && (
                    <Box
                        onClick={goToTop}
                        position="fixed"
                        bottom="40px"
                        right="40px"
                        zIndex={999}
                        bg="brand.500"
                        width="50px"
                        height="50px"
                        borderRadius="full"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        cursor="pointer"
                        boxShadow="lg"
                        transition="all 0.3s"
                        _hover={{ transform: "translateY(-4px)", bg: "brand.600", boxShadow: "xl" }}
                    >
                        <Icon as={IoArrowUpCircleOutline} color="white" fontSize="30px" />
                    </Box>
                )}
            </>
        </PageContent >
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const { curriculumId } = context.params as { curriculumId: string };
        // Fetch slightly more to account for client-side filtering mismatches if necessary
        // But here we can filter!
        // Constraint: legacy posts may not have curriculumId.

        const postsQuery = query(
            collection(firestore, "posts"),
            orderBy("createdAt", "desc"),
            limit(50) // Fetch 50 most recent
        );
        const postDocs = await getDocs(postsQuery);
        let posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));

        // Filter: Match curriculumId OR (if MYP, allow legacy undefined)
        // If curriculumId is 'ib-dp', strict match.
        // If 'ib-myp', match 'ib-myp' or undefined.

        if (curriculumId === 'ib-dp') {
            posts = posts.filter(p => p.curriculumId === 'ib-dp');
        } else {
            // MYP
            posts = posts.filter(p => !p.curriculumId || p.curriculumId === 'ib-myp');
        }

        // Take top 15
        const initialPosts = posts.slice(0, 15).map(post => ({
            ...post,
            createdAt: JSON.parse(JSON.stringify(post.createdAt || null)), // Serialize timestamp
        }));

        return {
            props: {
                initialPosts,
                curriculumId
            }
        }
    } catch (error) {
        console.log('getServerSideProps error', error);
        return {
            props: {
                initialPosts: [],
                curriculumId: (context.params?.curriculumId as string) || 'ib-myp' // Ensure curriculumId is always passed
            }
        }
    }
}

export default CurriculumFeed;
