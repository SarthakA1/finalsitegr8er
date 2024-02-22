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
    const [activeFilters, setActiveFilters] = useState({
        grade: null,
        typeofquestion: null,
        criteria: null,
        difficulty: null,
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

    const getPostsByMaxVoting = async (voting:any) => {
        try {
            const difficultyQuery = query(
                collection(firestore, 'diffculty_voting'),
                where('voting', 'in', voting),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(difficultyQuery);
            const posts: { [postTitle: string]: number } = {}; // Use an object to store postId and its voting count
        
            snapshot.forEach((doc:any) => {
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
            const updatedFilters:any = { ... prevFilters };
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
                const gradeFilters = activeFilters.grade || [];
                const typeofquestionFilters = activeFilters.typeofquestion || [];
                const criteriaFilters = activeFilters.criteria || [];
                const difficultyFilters = activeFilters.difficulty || [];
                if(difficultyFilters.length > 0){
                    getPostsByMaxVoting(difficultyFilters)
                    .then(async (postTitles) => {
                        console.log(`Posts with maximum ${difficultyFilters} voting:`, postTitles);
                        if (postTitles.length > 0) {
                            const postsQuery = query(
                                collection(firestore, 'posts'),
                                where('subjectId', '==', subjectData.id),
                                ...(gradeFilters.length > 0 ? [where('grade.value', 'in', gradeFilters)] : []),
                                ...(typeofquestionFilters.length > 0 ? [where('typeOfQuestions.label', 'in', typeofquestionFilters)] : []),
                                ...(criteriaFilters.length > 0 ? [where('criteria', 'array-contains-any', criteriaFilters.map((val:any) => ({ label: val, value: val })))] : []),
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
                            const posts:any = [];
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
                        ...(criteriaFilters.length > 0 ? [where('criteria', 'array-contains-any', criteriaFilters.map((val:any) => ({ label: val, value: val })))] : []),
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
        { loading ? (
            <PostLoader />
        ) : ( 
            <Stack spacing={5}>
                <div className='filter_main_section'>
                    <div className='filter_main_grade_section'>
                        <Text style={{fontSize: "12px", fontWeight: "600"}}>MYP</Text>
                        <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('1') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '1')}>MYP 1</span>
                        <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('2') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '2')}>MYP 2</span>
                        <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('3') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '3')}>MYP 3</span>
                        <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('4') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '4')}>MYP 4</span>
                        <span className={`filter_main_grade_sub_section ${activeFilters.grade && (activeFilters.grade as string[]).includes('5') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '5')}>MYP 5</span>
                    </div>
                    <div className='filter_main_question_section'>
                        <Text style={{fontSize: "12px", fontWeight: "600"}}>Type</Text>
                        <span className={`filter_main_question_sub_section_background ${activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes('Academic Question') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'Academic Question')}>Academic Question</span>
                        <span className={`filter_main_question_sub_section_without_background ${activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes('General Question') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'General Question')}>General Doubts</span>
                        <span className={`filter_main_question_sub_section_without_backgrouund_border ${activeFilters.typeofquestion && (activeFilters.typeofquestion as string[]).includes('Resource') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'Resource')}>Resources</span>
                    </div>
                    <div className='filter_main_criteria_section'>
                        <Text style={{fontSize: "12px", fontWeight: "600"}}>Criteria</Text>
                        <span className={`filter_main_criteria_sub_section_background ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('Criteria A') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria A')}>Criteria A</span>
                        <span className={`filter_main_criteria_sub_section_without_background ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('Criteria B') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria B')}>Criteria B</span>
                        <span className={`filter_main_criteria_sub_section_without_background ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('Criteria C') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria C')}>Criteria C</span>
                        <span className={`filter_main_criteria_sub_section_without_backgrouund_border ${activeFilters.criteria && (activeFilters.criteria as string[]).includes('Criteria D') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria D')}>Criteria D</span>
                    </div>
                    <div className='filter_main_difficulty_section'>
                        <Text style={{fontSize: "12px", fontWeight: "600"}}>Difficulty(Academic Questions)</Text>
                        <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty && (activeFilters.difficulty as string[]).includes('easy') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'easy')}>Easy</span>
                        <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty && (activeFilters.difficulty as string[]).includes('medium') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'medium')}>Medium</span>
                        <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty && (activeFilters.difficulty as string[]).includes('hard') ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'hard')}>Hard</span>
                    </div>
                </div>
                {/* <Select placeholder='Sort By Tags' onChange={handleChangeFilter}>
                    <option value='Criteria A'>Criteria A</option>
                    <option value='Criteria B'>Criteria B</option>
                    <option value='Criteria C'>Criteria C</option>
                    <option value='Criteria D'>Criteria D</option>
                    <option value='Academic Question'>Academic Question</option>
                    <option value='General Question'>General Question</option>
                </Select> */}
                {postStateValue.posts.map((item: any, index:any) => 
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
