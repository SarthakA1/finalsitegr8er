import React, { useRef, useState } from 'react';
import { Input, Button, Flex, Text, Icon, Alert, AlertDescription, AlertIcon, AlertTitle } from '@chakra-ui/react';
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

const formTabs: TabItem[] = [
    {
        title: 'Question',
        icon: IoDocumentText
    },
    {
        title: 'Image',
        icon: IoImageOutline
    },
]

export type TabItem = {
    title: string;
    icon: typeof Icon.arguments
}



const NewPostForm:React.FC<NewPostFormProps> = ({ 
  user,
  subjectImageURL,

}) => {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState(formTabs[0].title)
    const [textInputs, setTextInputs] = useState({
        grade: "",
        title: "",
        body: ""
    });
    const {selectedFile, setSelectedFile, onSelectFile} = useSelectFile()
    // const [selectedFile, setSelectedFile] = useState<string>()
    const selectFileRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    const handleCreatePost = async () => {
        const { subjectId } = router.query;
        //create new question object => type post
        const newPost: Post = {
          subjectId: subjectId as string,
          subjectImageURL: subjectImageURL || "",
          creatorId: user.uid,
          creatorDisplayName: user.displayName! || user.email!.split('@')[0],
          title: textInputs.title,
          body: textInputs.body,
          grade: textInputs.grade,
          numberOfAnswers: 0,
          voteStatus: 0,
          createdAt: serverTimestamp() as Timestamp,
          
        }
       
       
    
        setLoading(true)
        try {
                //store the question in firestore database
            const postDocRef = await addDoc(collection(firestore, 'posts'), newPost)

             //check if user has decided to include image or tag in the question
             if (selectedFile) {
                 //if image is there, store in storage => get download URL (return imageURL)
                const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
                await uploadString(imageRef, selectedFile, 'data_url');
                const downloadURL = await getDownloadURL(imageRef);

                //update question doc
                await updateDoc(postDocRef, {
                    imageURL: downloadURL
                })}
                router.back();
        } catch (error: any) {
            console.log('handleCreatePost error', error.message)
            setError(true);
            
        }
        setLoading(false);

         //redirect user back to subject group or homepage using router
       
    }


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
            {formTabs.map((item, index) => (
              <TabItem
                key={item.title}
                item={item}
                selected={item.title === selectedTab}
                setSelectedTab={setSelectedTab}
              />
            ))}
          </Flex>
          <Flex p={4} >
            {selectedTab === "Question" && (
              <TextInputs
                textInputs={textInputs}
                onChange={onTextChange}
                handleCreatePost={handleCreatePost}
                loading={loading}
              />
            )}
            {selectedTab === "Image" && (
                <ImageUpload 
                selectedFile={selectedFile} 
                onSelectImage={onSelectFile} 
                setSelectedTab={setSelectedTab} 
                selectFileRef={selectFileRef}
                setSelectedFile={setSelectedFile}/>
            )}

                </Flex>
                { error && (
                    <Alert status='error'>
                    <AlertIcon />
                    <AlertTitle>The Question could not be Posted!</AlertTitle>
                  </Alert>

                )}
    </Flex>
 )
}
export default NewPostForm;