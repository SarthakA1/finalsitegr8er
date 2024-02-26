import React, { useRef, useState } from 'react';
import { Input, Button, Flex, Text, Icon, Alert, AlertDescription, AlertIcon, AlertTitle } from '@chakra-ui/react';
import { IoDocumentText, IoImageOutline } from 'react-icons/io5';
import TabItem from './TabItem';
import TextInputs from './PostForm/TextInputs';
import FileUpload from './PostForm/FileUpload';
import { Post } from '@/atoms/postsAtom';
import { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { addDoc, collection, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '@/firebase/clientApp';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import useSelectFile from '@/hooks/useSelectFile';

type NewPostFormProps = {
  subjectImageURL?: string;
  user: User;
};

const formTabs: TabItem[] = [
    {
        title: 'Question',
        icon: IoDocumentText
    },
    {
        title: 'Attachment',
        icon: IoImageOutline
    },
];

export type TabItem = {
    title: string;
    icon: typeof Icon.arguments;
};

const NewPostForm: React.FC<NewPostFormProps> = ({ 
  user,
  subjectImageURL,
}) => {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
    const [textInputs, setTextInputs] = useState({
        grade: { value: '', label: '' },
        title: '',
        body: '',
        typeOfQuestions: { value: '', label: '' },
        criteria: { value: '', label: '' }
    });
    const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
    const selectFileRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleCreatePost = async () => {
        const { subjectId } = router.query;
        const newPost: Post = {
            subjectId: subjectId as string,
            subjectImageURL: subjectImageURL || '',
            creatorId: user.uid,
            creatorDisplayName: user.displayName || user.email!.split('@')[0],
            title: textInputs.title,
            body: textInputs.body,
            grade: textInputs.grade,
            criteria: textInputs.criteria,
            typeOfQuestions: textInputs.typeOfQuestions,
            numberOfAnswers: 0,
            voteStatus: 0, 
            pinPost: false,
            createdAt: serverTimestamp() as Timestamp,
        };

        setLoading(true);
        try {
            const postDocRef = await addDoc(collection(firestore, 'posts'), newPost);
                
            if (selectedFile && selectedFile.length > 0) {
                const fileURLs = [];
                
                for (const file of selectedFile) {
                    const extension = file.name.split('.').pop()?.toLowerCase();
                    if (extension === 'pptx' || extension === 'xlsx') {
                        const fileRef = ref(storage, `posts/${postDocRef.id}/${Date.now()}_${file.name}`);
                        await uploadBytes(fileRef, file);
                        const downloadURL = await getDownloadURL(fileRef);
                        fileURLs.push(downloadURL);
                    }
                }
                
                await updateDoc(postDocRef, {
                    fileURLs: fileURLs
                });
            }
            
            router.push('/subject/' + subjectId);
        } catch (error: any) {
            console.log('handleCreatePost error', error.message);
            setError(true);  
        }
        setLoading(false);
    };

    const onTextChange = ({
        target: { name, value },
    }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTextInputs((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Flex direction="column" bg="white" borderRadius={4} mt={2} width="80%">
            <Flex>
                {formTabs.map((item: any, index) => (
                    <TabItem
                        key={item.title}
                        item={item}
                        selected={item.title === selectedTab}
                        setSelectedTab={setSelectedTab}
                    />
                ))}
            </Flex>
            <Flex p={4}>
                {selectedTab === 'Question' && (
                    <TextInputs
                        textInputs={textInputs}
                        onChange={onTextChange}
                        handleCreatePost={handleCreatePost}
                        loading={loading}
                    />
                )}
                {selectedTab === 'Attachment' && (
                    <FileUpload 
                        selectedFile={selectedFile} 
                        onSelectFile={onSelectFile} 
                        setSelectedTab={setSelectedTab} 
                        selectFileRef={selectFileRef}
                        setSelectedFile={setSelectedFile}
                    />
                )}
            </Flex>
            { error && (
                <Alert status='error'>
                    <AlertIcon />
                    <AlertTitle>The Question could not be Posted!</AlertTitle>
                </Alert>
            )}
        </Flex>
    );
};

export default NewPostForm;
