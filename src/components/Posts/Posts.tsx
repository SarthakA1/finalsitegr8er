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
    initialPosts: Post[];
};

const Posts: React.FC<PostsProps> = ({ subjectData, userId, initialPosts }) => {
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        grade: null,
        typeofquestion: null,
        criteria: null,
        difficulty: null,
    });
    const { postStateValue, setPostStateValue, onVote, onDeletePost, onSelectPost } = usePosts(subjectData!);

    useEffect(() => {
        setPostStateValue(prev => ({
            ...prev,
            posts: initialPosts,
        }));
    }, [initialPosts]);

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
        setActiveFilters((prevFilters) => {
            const updatedFilters: any = { ...prevFilters };
            if (updatedFilters[label] && updatedFilters[label].includes(value)) {
                updatedFilters[label] = updatedFilters[label].filter((val: string) => val !== value);
            } else {
                updatedFilters[label] = [...(updatedFilters[label] || []), value];
            }
            return updatedFilters;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const gradeFilters = activeFilters.grade || [];
                const typeofquestionFilters = activeFilters.typeofquestion || [];
                const criteriaFilters = activeFilters.criteria || [];
                const difficultyFilters = activeFilters.difficulty || [];
                if (difficultyFilters.length > 0) {
                    getPostsByMaxVoting(difficultyFilters)
                        .then(async (postTitles) => {
                            console.log(`Posts with maximum ${difficultyFilters} voting:`, postTitles);
                            if (postTitles.length > 0) {
                                const postsQuery = query(
                                    collection(firestore, 'posts'),
                                    where('subjectId', '==', subjectData.id),
                                    ...(gradeFilters.length > 0 ? [where('grade.value', 'in', gradeFilters)] : []),
                                    ...(typeofquestionFilters.length > 0 ? [where('typeOfQuestions.label', 'in', typeofquestionFilters)] : []),
                                    ...(criteriaFilters.length > 0 ? [where('criteria', 'array-contains-any', criteriaFilters.map((val: any) => ({ label: val, value: val })))] : []),
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
                        ...(gradeFilters.length > 0 ? [where('grade.value', 'in', gradeFilters)] : []),
                        ...(typeofquestionFilters.length > 0 ? [where('typeOfQuestions.label', 'in', typeofquestionFilters)] : []),
                        ...(criteriaFilters.length > 0 ? [where('criteria', 'array-contains-any', criteriaFilters.map((val: any) => ({ label: val, value: val })))] : []),
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

    return (
        <>
            {loading ? (
                <PostLoader />
            ) : (
                <Stack spacing={5}>
                    <div className='filter_main_section'>
                        <div className='filter_main_grade_section'>
                            <Text style={{ fontSize: "11.3px", fontWeight: "600" }}>MYP</Text>
                            <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('1') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '1')}>MYP 1</span>
                            <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('2') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '2')}>MYP 2</span>
                            <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('3') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '3')}>MYP 3</span>
                            <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('4') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '4')}>MYP 4</span>
                            <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('5') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '5')}>MYP 5</span>
                        </div>
                        <div className='filter_main_question_section'>
                            <Text style={{ fontSize: "11.3px", fontWeight: "600", marginTop: "4px" }}>Type</Text>
                            <span className={`filter_main_question_sub_section_background ${activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes('Academic Question') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'Academic Question')}>Academic Questions</span>
                            <span className={`filter_main_question_sub_section_without_background ${activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes('General Doubt') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'General Doubt')}>General Doubts</span>
                            <span className={`filter_main_question_sub_section_without_backgrouund_border ${activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes('Resource') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'Resource')}>Resources</span>
                        </div>
                        <div className='filter_main_assessment_section'>
                            <Text style={{ fontSize: "11.3px", fontWeight: "600", marginTop: "4px" }}>Assessment Criteria</Text>
                            <span className={`filter_main_assessment_sub_section ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('A') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'A')}>A</span>
                            <span className={`filter_main_assessment_sub_section ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('B') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'B')}>B</span>
                            <span className={`filter_main_assessment_sub_section ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('C') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'C')}>C</span>
                            <span className={`filter_main_assessment_sub_section ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('D') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'D')}>D</span>
                        </div>
                        <div className='filter_main_difficulty_section'>
                            <Text style={{ fontSize: "11.3px", fontWeight: "600", marginTop: "4px" }}>Difficulty</Text>
                            <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty && (activeFilters.difficulty as string[]).includes('Easy') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'Easy')}>Easy</span>
                            <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty && (activeFilters.difficulty as string[]).includes('Medium') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'Medium')}>Medium</span>
                            <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty && (activeFilters.difficulty as string[]).includes('Hard') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'Hard')}>Hard</span>
                        </div>
                    </div>
                    {postStateValue.posts.map((post) => (
                        <PostItem
                            key={post.id}
                            post={post}
                            userIsCreator={userId === post.creatorId}
                            userVoteValue={
                                postStateValue.postVotes.find((vote) => vote.postId === post.id)?.voteValue
                            }
                            onVote={onVote}
                            onDeletePost={onDeletePost}
                            onSelectPost={onSelectPost}
                            subjectData={subjectData}
                        />
                    ))}
                </Stack>
            )}
        </>
    );
};

export const getServerSideProps = async (context: any) => {
    const { subjectId } = context.params;
    let initialPosts: Post[] = [];

    try {
        const postsQuery = query(
            collection(firestore, 'posts'),
            where('subjectId', '==', subjectId),
            orderBy('pinPost', 'desc'),
            orderBy('createdAt', 'desc')
        );

        const postDocs = await getDocs(postsQuery);
        initialPosts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
    } catch (error: any) {
        console.log('Error fetching initial posts:', error.message);
    }

    return {
        props: {
            subjectData: { id: subjectId }, // Replace with actual subject data if available
            userId: null, // Replace with actual user ID if available
            initialPosts,
        },
    };
};

export default Posts;
