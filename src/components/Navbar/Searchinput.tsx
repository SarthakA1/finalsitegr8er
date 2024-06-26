import { SearchIcon } from '@chakra-ui/icons';
import { Flex, Input, InputGroup, InputRightElement, Image, Link } from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/clientApp';
import { User } from 'firebase/auth';
import React, { useState } from 'react';
import Notification from './Notifications/Notification';
import { useAuthState } from 'react-firebase-hooks/auth';

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
    criteria: string,
}

const Searchinput: React.FC<SearchinputProps> = ({ user }) => {
    const [searchInputValue, setSearchInputValue] = useState('');
    const [resourcePostData, setResourcePostData] = useState<Post[]>([]);
    const [questionPostData, setQuestionPostData] = useState<Post[]>([]);
    const [users] = useAuthState(auth);

    const handleChange = async (e: any) => {
        const value = e.target.value;
        try {
            setSearchInputValue(value);
            const postsQuery = query(
                collection(firestore, 'posts'),
                where('title', '>=', e.target.value),
                where('title', '<=', e.target.value + '\uf8ff'),
                orderBy('title')
            );
            const postDocs = await getDocs(postsQuery);
            const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const newPosts = posts as Post[];

            if (newPosts.length > 0) {
                const filterResourcePosts = newPosts.filter(post => post.typeOfQuestions.value === 'Resource');
                const filterQuestionsPosts = newPosts.filter(post => post.typeOfQuestions.value === 'Academic Question' || post.typeOfQuestions.value === 'General Question');
                setResourcePostData(filterResourcePosts as Post[]);
                setQuestionPostData(filterQuestionsPosts as Post[]);
            }
        } catch (error: any) {
            console.log('getPosts error', error.message);
        }
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
                    _placeholder={{ color: "gray.500" }}
                    _hover={{
                        bg: "white",
                        border: "1px solid",
                        borderColor: "blue.500",
                    }}
                    _focus={{
                        outline: "none",
                        border: "1px solid",
                        borderColor: "blue.500",
                    }}
                    value={searchInputValue}
                    onChange={handleChange}
                    height="36px"
                    bg="gray.100"
                    borderRadius="50px"
                />
                <InputRightElement pointerEvents='none'>
                    <SearchIcon color='gray.300' mb="5px" />
                </InputRightElement>
            </InputGroup>
            {searchInputValue && (
                <div className="company_jobs_search">
                    <div id="search-results" className="companysas">
                        <p className="title_heading text-start">Resources</p>
                        <ul className="list-unstyled" id="company" style={{ height: resourcePostData.length >= 3 ? '150px' : 'auto' }}>
                            {resourcePostData.length > 0 ? (
                                resourcePostData.map((resourcePost: any, index: any) => (
                                    <a key={index} target="_blank" href={`/subject/${resourcePost.subjectId}/answers/${resourcePost.id}`} className="search_result_para">
                                        <li>{resourcePost.title}</li>
                                    </a>
                                ))
                            ) : (
                                <li className="search_result_para">
                                    No Resources Found
                                </li>
                            )}
                        </ul>
                    </div>
                    <hr></hr>
                    <div id="search-results" className="josas">
                        <p className="title_heading text-start">Academic Questions and General Doubts</p>
                        <ul className="list-unstyled" id="company" style={{ height: questionPostData.length >= 3 ? '150px' : 'auto' }}>
                            {questionPostData.length > 0 ? (
                                questionPostData.map((questionPost: any, index: any) => (
                                    <a key={index} target="_blank" href={`/subject/${questionPost.subjectId}/answers/${questionPost.id}`} className="search_result_para">
                                        <li>{questionPost.title}</li>
                                    </a>
                                ))
                            ) : (
                                <li className="search_result_para">
                                    No Questions and Doubts Found
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
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
