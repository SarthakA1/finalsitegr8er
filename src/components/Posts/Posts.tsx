import { Post } from '@/atoms/postsAtom';
import { Subject } from '@/atoms/subjectsAtom';
import { auth, firestore } from '@/firebase/clientApp';
import usePosts from '@/hooks/usePosts';
import { Stack, Select, Button, Flex } from '@chakra-ui/react';
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
            console.log(voting);
            const difficultyQuery = query(
                collection(firestore, 'diffculty_voting'),
                where('voting', '==', voting),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(difficultyQuery);
            console.log(snapshot);
            const posts: { [postTitle: string]: number } = {}; // Use an object to store postId and its voting count
        
            snapshot.forEach((doc) => {
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

    const handleChangeTopFilter = async (label:any, value:any) => {
        const selectedTopFilterValue = value;
        const selectedTopFilterLabel = label;
        setActiveFilters((prevFilters) => ({
            ...prevFilters,
            [selectedTopFilterLabel]: selectedTopFilterValue,
        }));
        if(selectedTopFilterLabel == 'grade'){
            try {
                const postsQuery = query(
                    collection(firestore, 'posts'),
                    where('subjectId', '==', subjectData.id),
                    where('grade.value', '==', selectedTopFilterValue),
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
            } catch(error: any){
                console.log('getPosts error', error.message);
            }
        } else if(selectedTopFilterLabel == 'typeofquestion') {
            try {
                const postsQuery = query(
                    collection(firestore, 'posts'),
                    where('subjectId', '==', subjectData.id),
                    where('typeOfQuestions.label', '==', selectedTopFilterValue),  // Search based on label
                    where('typeOfQuestions.value', '==', selectedTopFilterValue), 
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
            } catch(error: any) {
                console.log('getPosts error', error.message);
            }
        } else if(selectedTopFilterLabel == 'criteria'){
            try {
                const postsQuery = query(
                    collection(firestore, 'posts'),
                    where('subjectId', '==', subjectData.id),
                    where('criteria', 'array-contains', { label: selectedTopFilterValue, value: selectedTopFilterValue }),
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
            } catch(error: any){
                console.log('getPosts error', error.message);
            }
        } else if(selectedTopFilterLabel == 'difficulty'){
            try {
                getPostsByMaxVoting(selectedTopFilterValue)
                .then(async (postTitles) => {
                    console.log(`Posts with maximum ${selectedTopFilterValue} voting:`, postTitles);
                    if (postTitles.length > 0) {
                        const postsQuery = query(
                            collection(firestore, 'posts'),
                            where('title', 'in', postTitles),
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
            } catch(error: any){
                console.log('getPosts error', error.message);
            }
        } else {
            try {
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
            } catch(error: any){
                console.log('getPosts error', error.message);
            }
        }
    }

    // const handleChangeFilter = async(e:any) => {
    //     const selectedFilterValue = e.target.value;
    //     if(selectedFilterValue){
    //         if(selectedFilterValue!== 'General Question' && selectedFilterValue!== 'Academic Question'){
    //             try {
    //                 // Get posts for the subject
    //                 const postsQuery = query(
    //                     collection(firestore, 'posts'),
    //                     where('subjectId', '==', subjectData.id),
    //                     where('criteria', 'array-contains', { label: e.target.value, value: e.target.value }),
    //                     orderBy('pinPost', 'desc'),  // Order by pinPost in descending order
    //                     orderBy('createdAt', 'desc') // Then, order by createdAt in descending order
    //                 );
            
    //                 const postDocs = await getDocs(postsQuery);
            
    //                 // Store in post state
    //                 const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //                 setPostStateValue(prev => ({
    //                     ...prev,
    //                     posts: posts as Post[],
    //                 }));
    //             } catch (error: any) {
    //                 console.log('getPosts error', error.message);
    //             }
    //         } else {
    //             try {
    //                 // Get posts for the subject
    //                 const postsQuery = query(
    //                     collection(firestore, 'posts'),
    //                     where('subjectId', '==', subjectData.id),
    //                     where('typeOfQuestions.label', '==', e.target.value),  // Search based on label
    //                     where('typeOfQuestions.value', '==', e.target.value), 
    //                     orderBy('pinPost', 'desc'),  // Order by pinPost in descending order
    //                     orderBy('createdAt', 'desc') // Then, order by createdAt in descending order
    //                 );
            
    //                 const postDocs = await getDocs(postsQuery);
            
    //                 // Store in post state
    //                 const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //                 setPostStateValue(prev => ({
    //                     ...prev,
    //                     posts: posts as Post[],
    //                 }));
    //             } catch (error: any) {
    //                 console.log('getPosts error', error.message);
    //             }
    //         } 
    //     } else {
    //         try {
    //             // Get posts for the subject
    //             const postsQuery = query(
    //                 collection(firestore, 'posts'),
    //                 where('subjectId', '==', subjectData.id),
    //                 orderBy('pinPost', 'desc'),  // Order by pinPost in descending order
    //                 orderBy('createdAt', 'desc') // Then, order by createdAt in descending order
    //             );
        
    //             const postDocs = await getDocs(postsQuery);
        
    //             // Store in post state
    //             const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //             setPostStateValue(prev => ({
    //                 ...prev,
    //                 posts: posts as Post[],
    //             }));
    //         } catch (error: any) {
    //             console.log('getPosts error', error.message);
    //         }
    //     }
    // }

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
                        <span className={`filter_main_grade_sub_section ${activeFilters.grade === '1' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '1')}>MYP 1</span>
                        <span className={`filter_main_grade_sub_section ${activeFilters.grade === '2' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '2')}>MYP 2</span>
                        <span className={`filter_main_grade_sub_section ${activeFilters.grade === '3' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '3')}>MYP 3</span>
                        <span className={`filter_main_grade_sub_section ${activeFilters.grade === '4' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '4')}>MYP 4</span>
                        <span className={`filter_main_grade_sub_section ${activeFilters.grade === '5' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('grade', '5')}>MYP 5</span>
                    </div>
                    <div className='filter_main_question_section'>
                        <span className={`filter_main_question_sub_section_background ${activeFilters.typeofquestion === 'Academic Question' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'Academic Question')}>Academic Question</span>
                        <span className={`filter_main_question_sub_section_without_background ${activeFilters.typeofquestion === 'General Doubts' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'General Doubts')}>General Doubts</span>
                        <span className={`filter_main_question_sub_section_without_backgrouund_border ${activeFilters.typeofquestion === 'Resources' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('typeofquestion', 'Resources')}>Resources</span>
                    </div>
                    <div className='filter_main_criteria_section'>
                        <span className={`filter_main_criteria_sub_section_background ${activeFilters.criteria === 'Criteria A' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria A')}>Criteria A</span>
                        <span className={`filter_main_criteria_sub_section_without_background ${activeFilters.criteria === 'Criteria B' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria B')}>Criteria B</span>
                        <span className={`filter_main_criteria_sub_section_without_background ${activeFilters.criteria === 'Criteria C' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria C')}>Criteria C</span>
                        <span className={`filter_main_criteria_sub_section_without_backgrouund_border ${activeFilters.criteria === 'Criteria D' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('criteria', 'Criteria D')}>Criteria D</span>
                    </div>
                    <div className='filter_main_difficulty_section'>
                        <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty === 'easy' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'easy')}>Easy</span>
                        <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty === 'medium' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'medium')}>Medium</span>
                        <span className={`filter_main_difficulty_sub_section ${activeFilters.difficulty === 'hard' ? 'active' : ''}`} onClick={() => handleChangeTopFilter('difficulty', 'hard')}>Hard</span>
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