import React, { useRef, useState } from 'react';
import { Flex, Text, Alert, AlertIcon, AlertTitle } from '@chakra-ui/react';
import { IoDocumentText, IoImageOutline } from 'react-icons/io5';
import TabItem from './TabItem';
import TextInputs from './PostForm/TextInputs';
import ImageUpload from './PostForm/ImageUpload';
import { Post } from '@/atoms/postsAtom';
import { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { addDoc, collection, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '@/firebase/clientApp';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import useSelectFile from '@/hooks/useSelectFile';

type NewPostFormProps = {
  subjectImageURL?: string;
  user: User;
};

type TabItem = {
  title: string;
  icon: any;
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

const NewPostForm: React.FC<NewPostFormProps> = ({ user, subjectImageURL }) => {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
    const [textInputs, setTextInputs] = useState({
        grade: { value: "", label: "" },
        title: "",
        body: "",
        typeOfQuestions: { value: "", label: "" },
        criteria: { value: "", label: "" }
    });
    const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
    const selectFileRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleCreatePost = async () => {
        const { subjectId } = router.query;

        const newPost: Post = {
          subjectId: subjectId as string,
          subjectImageURL: subjectImageURL || "",
          creatorId: user.uid,
          creatorDisplayName: user.displayName! || user.email!.split('@')[0],
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
              const imageURLs = [];
              
              for (const fileUrl of selectedFile) {
                const matchResult = fileUrl.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/);
                if (matchResult) {
                  const extension = matchResult[0].split("/");
                  let extensionName = '';
                  if(extension[1] == 'msword'){
                    extensionName = '.doc';
                  } else if(extension[1] == 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    extensionName = '.docx';
                  } else if(extension[1] == 'vnd.openxmlformats-officedocument.wordprocessingml.template') {
                    extensionName = '.dotx';
                  } else if(extension[1] == 'vnd.ms-excel') {
                    extensionName = '.xls';
                  } else if(extension[1] == 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
                    extensionName = '.xlsx';
                  } else {
                    extensionName = '.'+extension[1];
                  }
                  const imageRef = ref(storage, `posts/${postDocRef.id}/${Date.now()}${extensionName}`);
                  await uploadString(imageRef, fileUrl, 'data_url');
                  const downloadURL = await getDownloadURL(imageRef);
                  imageURLs.push(downloadURL);
                }
              }
            
              await updateDoc(postDocRef, {
                imageURLs: imageURLs
              });
            }
            router.push('/subject/'+subjectId);
        } catch (error: any) {
            console.log('handleCreatePost error', error.message);
            setError(true);
        }
        setLoading(false);
    };

    const onTextChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setTextInputs(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onCriteriaChange = (selectedOptions: any) => {
        setTextInputs(prev => ({
            ...prev,
            criteria: selectedOptions
        }));
    };

    return (
        <Flex direction="column" bg="white" borderRadius={4} mt={2} width="80%">
            <Flex>
                {formTabs.map((item, index) => (
                    <TabItem
                        key={item.title}
                        item={item}
                        selected={item.title === selectedTab}
                        setSelectedTab={setSelectedTab}
                    />
                ))}
            </Flex>
            <Flex p={4}>
                {selectedTab === "Question" && (
                    <TextInputs
                        textInputs={textInputs}
                        onChange={onTextChange}
                        onCriteriaChange={onCriteriaChange}
                        handleCreatePost={handleCreatePost}
                        loading={loading}
                    />
                )}
                {selectedTab === "Attachment" && (
                    <ImageUpload
                        selectedFile={selectedFile}
                        onSelectImage={onSelectFile}
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

