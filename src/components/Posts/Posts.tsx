import { Post } from '@/atoms/postsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import { auth, firestore } from '@/firebase/clientApp';
import usePosts from '@/hooks/usePosts';
import { Stack, Select, Button, Flex, Text } from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where, Firestore, doc, DocumentData, DocumentReference } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import PostItem from './PostItem';
import PostLoader from './PostLoader';

type PostsProps = {
    subjectData: Subject;
    userId?: string;
};

const Posts: React.FC<PostsProps> = ({ subjectData, userId }) => {
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const [activeFilters, setActiveFilters] = useState<any>({
        grade: null,
        typeofquestion: null,
        criteria: null,
        difficulty: null,
        level: null,
        paper: null,
    });
    const { postStateValue, setPostStateValue, onVote, onDeletePost, onSelectPost } = usePosts(subjectData!);

    const getPosts = async () => {
        try {
            // Get posts for the subject
            const postsQuery = query(
                collection(firestore, 'posts'),
                where('subjectId', '==', subjectData.id),
                orderBy('pinPost', 'desc'),  // Order by pinPost in descending order
                orderBy('createdAt', 'desc') // Then, order by createdAt in descending order
            );

            const postDocs = await getDocs(postsQuery);

            // Store in post state
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPostStateValue(prev => ({
                ...prev,
                posts: posts as Post[],
            }));
        } catch (error: any) {
            console.log('getPosts error', error.message);
        }
    };

    const getPostsByMaxVoting = async (voting: any) => {
        try {
            const difficultyQuery = query(
                collection(firestore, 'diffculty_voting'),
                where('voting', 'in', voting),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(difficultyQuery);
            const posts: { [postTitle: string]: number } = {}; // Use an object to store postId and its voting count

            snapshot.forEach((doc: any) => {
                const post = doc.data(); // Access document data using data() method
                const postTitle = post.postTitle;
                const votingCount = posts[postTitle] ? posts[postTitle] : 0;
                posts[postTitle] = votingCount + 1;
            });

            let maxVotingCount = 0;
            for (const postTitle in posts) {
                if (posts[postTitle] > maxVotingCount) {
                    maxVotingCount = posts[postTitle];
                }
            }

            const maxVotingPosts: string[] = [];
            for (const postTitle in posts) {
                if (posts[postTitle] === maxVotingCount) {
                    maxVotingPosts.push(postTitle);
                }
            }

            return maxVotingPosts;
        } catch (error) {
            console.error("Error getting posts:", error);
            return [];
        }

    }

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
        const fetchData = async () => {
            try {
                // const gradeFilters = activeFilters.grade || [];
                // const typeofquestionFilters = activeFilters.typeofquestion || [];
                // const criteriaFilters = activeFilters.criteria || [];
                const difficultyFilters = activeFilters.difficulty || [];
                if (difficultyFilters.length > 0) {
                    getPostsByMaxVoting(difficultyFilters)
                        .then(async (postTitles) => {
                            console.log(`Posts with maximum ${difficultyFilters} voting:`, postTitles);
                            if (postTitles.length > 0) {
                                const postsQuery = query(
                                    collection(firestore, 'posts'),
                                    where('subjectId', '==', subjectData.id),
                                    ...(activeFilters.grade && activeFilters.grade.length > 0 ? [where('grade.value', 'in', activeFilters.grade)] : []),
                                    ...(activeFilters.typeofquestion && activeFilters.typeofquestion.length > 0 ? [where('typeOfQuestions.label', 'in', activeFilters.typeofquestion)] : []),
                                    ...(activeFilters.criteria && activeFilters.criteria.length > 0 ? [where('criteria', 'array-contains-any', activeFilters.criteria.map((val: any) => ({ label: val, value: val })))] : []),
                                    ...(activeFilters.level && activeFilters.level.length > 0 ? [where('level.value', 'in', activeFilters.level)] : []),
                                    ...(activeFilters.paper && activeFilters.paper.length > 0 ? [where('paper.value', 'in', activeFilters.paper)] : []),
                                    where('title', 'in', postTitles),
                                    orderBy('pinPost', 'desc'),
                                    orderBy('createdAt', 'desc')
                                );

                                const postDocs = await getDocs(postsQuery);

                                // Store in post state
                                const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                                setPostStateValue(prev => ({
                                    ...prev,
                                    posts: posts as Post[],
                                }));
                            } else {
                                const posts: any = [];
                                console.log('No postIds found.');
                                setPostStateValue(prev => ({
                                    ...prev,
                                    posts: posts as Post[],
                                }));
                            }
                        })
                        .catch((error) => {
                            console.error("Error:", error);
                        });
                } else {
                    // Check if any of the arrays are non-empty before including them in the query
                    const postsQuery = query(
                        collection(firestore, 'posts'),
                        where('subjectId', '==', subjectData.id),
                        ...(activeFilters.grade && activeFilters.grade.length > 0 ? [where('grade.value', 'in', activeFilters.grade)] : []),
                        ...(activeFilters.typeofquestion && activeFilters.typeofquestion.length > 0 ? [where('typeOfQuestions.label', 'in', activeFilters.typeofquestion)] : []),
                        ...(activeFilters.criteria && activeFilters.criteria.length > 0 ? [where('criteria', 'array-contains-any', activeFilters.criteria.map((val: any) => ({ label: val, value: val })))] : []),
                        ...(activeFilters.level && activeFilters.level.length > 0 ? [where('level.value', 'in', activeFilters.level)] : []),
                        ...(activeFilters.paper && activeFilters.paper.length > 0 ? [where('paper.value', 'in', activeFilters.paper)] : []),
                        orderBy('pinPost', 'desc'),
                        orderBy('createdAt', 'desc')
                    );

                    const postDocs = await getDocs(postsQuery);
                    const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setPostStateValue(prev => ({ ...prev, posts: posts as Post[] }));
                }
                //console.log('Updated filters:', activeFilters);
                //console.log('Calling API with updated filters...');
            } catch (error: any) {
                console.log('Error fetching data:', error.message);
            }
        };
        fetchData();
    }, [activeFilters]);

    useEffect(() => {
        getPosts();
    }, [subjectData])
    return (

        <>
            {loading ? (
                <PostLoader />
            ) : (
                <Stack spacing={5}>
                    {/* Filters */}

                    <Stack
                        spacing={3}
                        p={3}
                        bg="rgba(255, 255, 255, 0.8)"
                        backdropFilter="blur(12px)"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        shadow="sm"
                    >
                        {subjectData.curriculumId === 'ib-dp' ? (
                            <>
                                <Flex align="center" wrap="wrap" gap={2}>
                                    <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mr={2}>Level:</Text>
                                    {['HL', 'SL'].map((level) => (
                                        <Button
                                            key={level}
                                            size="xs"
                                            variant={activeFilters.level && (activeFilters.level as string[]).includes(level) ? "solid" : "outline"}
                                            colorScheme="brand"
                                            onClick={() => handleChangeTopFilter('level', level)}
                                            borderRadius="full"
                                        >
                                            {level}
                                        </Button>
                                    ))}
                                </Flex>

                                <Flex align="center" wrap="wrap" gap={2}>
                                    <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mr={2}>Paper:</Text>
                                    {['1', '2', '3'].map((paper) => (
                                        <Button
                                            key={paper}
                                            size="xs"
                                            variant={activeFilters.paper && (activeFilters.paper as string[]).includes(paper) ? "solid" : "outline"}
                                            colorScheme="brand"
                                            onClick={() => handleChangeTopFilter('paper', paper)}
                                            borderRadius="full"
                                        >
                                            Paper {paper}
                                        </Button>
                                    ))}
                                </Flex>
                            </>
                        ) : (
                            <>
                                <Flex align="center" wrap="wrap" gap={2}>
                                    <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mr={2}>MYP Grade:</Text>
                                    {['1', '2', '3', '4', '5'].map((grade) => (
                                        <Button
                                            key={grade}
                                            size="xs"
                                            variant={activeFilters.grade && (activeFilters.grade as string[]).includes(grade) ? "solid" : "outline"}
                                            colorScheme="brand"
                                            onClick={() => handleChangeTopFilter('grade', grade)}
                                            borderRadius="full"
                                        >
                                            MYP {grade}
                                        </Button>
                                    ))}
                                </Flex>
                                <Flex align="center" wrap="wrap" gap={2}>
                                    <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mr={2}>Criteria:</Text>
                                    {['Criteria A', 'Criteria B', 'Criteria C', 'Criteria D'].map((criteria) => (
                                        <Button
                                            key={criteria}
                                            size="xs"
                                            variant={activeFilters.criteria && (activeFilters.criteria as string[]).includes(criteria) ? "solid" : "outline"}
                                            colorScheme="gray"
                                            onClick={() => handleChangeTopFilter('criteria', criteria)}
                                            borderRadius="full"
                                        >
                                            {criteria}
                                        </Button>
                                    ))}
                                </Flex>
                            </>
                        )}


                        <Flex align="center" wrap="wrap" gap={2}>
                            <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" mr={2}>Type:</Text>
                            {['Academic Question', 'General Doubt', 'Resource'].map((typeLabel, idx) => {
                                const typeValue = ['Academic Question', 'General Doubt', 'Resource'][idx];
                                return (
                                    <Button
                                        key={typeValue}
                                        size="xs"
                                        variant={activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes(typeValue) ? "solid" : "outline"}
                                        colorScheme={typeValue === 'Resource' ? "green" : typeValue === 'General Doubt' ? "orange" : "blue"}
                                        onClick={() => handleChangeTopFilter('typeofquestion', typeValue)}
                                        borderRadius="full"
                                    >
                                        {typeLabel}
                                    </Button>
                                );
                            })}
                        </Flex>
                    </Stack>


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
