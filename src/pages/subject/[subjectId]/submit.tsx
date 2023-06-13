import { subjectState } from '@/atoms/subjectsAtom';
import NewPostForm from '@/components/Posts/NewPostForm';
import { auth } from '@/firebase/clientApp';
import useSubjectData from '@/hooks/useSubjectData';
import { Box, Flex, Text } from '@chakra-ui/react';
import router from 'next/router';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';
import PageContentLayout from '../../../components/layout/PageContent';




const SubmitPostPage:React.FC = () => {
  
  const [user] = useAuthState(auth);
  const { subjectStateValue } = useSubjectData();
  const setSubjectStateValue = useRecoilState(subjectState);
  
     return (
        
        <>
        <Box p="14px 0px" ml={7} mt={2}>
          <Text fontWeight={600} align='center'>Ask Anything!</Text>
        </Box>
        <Flex justify='center'>
      {user && <NewPostForm 
             user={user}
             subjectImageURL={subjectStateValue.currentSubject?.imageURL}  />}
        </Flex>
        </>
        
    )
}
export default SubmitPostPage;