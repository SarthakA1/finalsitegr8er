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
import { getDownloadURL, ref, uploadString, uploadBytes } from 'firebase/storage';
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
        grade: {value: "", label: ""},
        title: "",
        body: "",
        typeOfQuestions: {value: "", label: ""},
        criteria: {value: "", label: ""}
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
          criteria: textInputs.criteria,
          typeOfQuestions: textInputs.typeOfQuestions,
          numberOfAnswers: 0,
          voteStatus: 0, 
          pinPost: false,
          createdAt: serverTimestamp() as Timestamp,
          
        }
    
        setLoading(true)
        try {
                //store the question in firestore database
                const postDocRef = await addDoc(collection(firestore, 'posts'), newPost);
                
                if (selectedFile && selectedFile.length > 0) {
                  const imageURLs = []; // Array to store all image URLs
                
                  // Iterate over each file URL in the array
                  for (const fileUrl of selectedFile) {
                    const matchResult = fileUrl.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/);
                    if (matchResult) {
                      const extension = matchResult[0].split("/"); // Split the matched URL path after the slash
                      // Store image in storage and get download URL
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
                        extensionName = extension[1];
                      }
                      const imageRef = ref(storage, `posts/${postDocRef.id}/${Date.now()}${extensionName}`);
                      await uploadString(imageRef, fileUrl, 'data_url');
                      const downloadURL = await getDownloadURL(imageRef);
                      // Add download URL to the array
                      imageURLs.push(downloadURL);
                    }
                  }
                
                  // Update question doc with all the imageURLs
                  await updateDoc(postDocRef, {
                    imageURLs: imageURLs
                  });
                }
                router.push('/subject/'+subjectId);
                //router.back();
        } catch (error: any) {
            console.log('handleCreatePost error', error.message)
            setError(true);
            
        }
        setLoading(false);

         //redirect user back to subject group or homepage using router
       
    }

    const redirectToShareResource = () => {
      router.push('/path/to/NewShareResourcePostForm.tsx');
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
            {formTabs.map((item:any, index) => (
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
            {selectedTab === "Attachment" && (
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
                 <Flex justify="center" mt={4}>
                <Button onClick={redirectToShareResource} variant="outline" colorScheme="blue">Or share anything!</Button>
            </Flex>
    </Flex>

    
 )
}
export default NewPostForm;
