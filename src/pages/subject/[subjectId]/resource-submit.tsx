import { subjectState } from '@/atoms/subjectsAtom';
import NewShareResourcePostForm from '@/components/Posts/NewShareResourcePostForm';
import { auth } from '@/firebase/clientApp';
import useSubjectData from '@/hooks/useSubjectData';
import { Box, Flex, Text } from '@chakra-ui/react';
import router from 'next/router';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState } from 'recoil';
import PageContentLayout from '../../../components/layout/PageContent';




const SubmitShareResourcePostPage:React.FC = () => {
  
  const [user] = useAuthState(auth);
  const { subjectStateValue } = useSubjectData();
  const setSubjectStateValue = useRecoilState(subjectState);
  
     return (
        
        <>
        <Box p="14px 0px" ml={7} mt={2}>
          <Text fontWeight={600} align='center'>Share A Resource!</Text>
        </Box>
        <Flex justify='center'>
      {user && <NewShareResourcePostForm 
             user={user}
             subjectImageURL={subjectStateValue.currentSubject?.imageURL}  />}
        </Flex>
        </>
        
    )
}
export default SubmitShareResourcePostPage;