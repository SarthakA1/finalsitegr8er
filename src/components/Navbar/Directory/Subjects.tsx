
import { subjectState } from '@/atoms/subjectsAtom';
import CreateSubjectModal from '@/components/Modal/CreateSubjectModal';
import { auth } from '@/firebase/clientApp';
import { Box, Flex, Icon, MenuItem, MenuList, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaUserCircle } from 'react-icons/fa';
import { GrAdd } from 'react-icons/gr';
import { IoIosCreate } from 'react-icons/io';
import { RiGroup2Fill } from 'react-icons/ri';
import { useRecoilState, useRecoilValue } from 'recoil';
import MenuListItem from './MenuListItem';

type subjectsProps = {
    
};

const subjects:React.FC<subjectsProps> = () => {
    const [open, setOpen] = useState(false);
    const mySnippets = useRecoilValue(subjectState).mySnippets;

    const [user] = useAuthState(auth);
    return (
        <>
        <CreateSubjectModal open={open} handleClose={() => setOpen(false)} userId={user?.uid!}/>
        <Box mt={3} mb={3} >
            <Text pl={3} mb={1} fontSize="10pt" fontWeight={500} color="gray.500"> MY SUBJECT GROUPS </Text>
        </Box>
        {/* <MenuItem
        onClick={() => setOpen(true)}
        >
        <Flex fontSize="10pt" align="center">
            <Icon fontSize={20} mr={2} as={GrAdd}/>
            Create Subject
        </Flex>
        </MenuItem> */}
        {mySnippets.map(snippet => (
            <MenuListItem key={snippet.subjectId} 
            icon={RiGroup2Fill} 
            displayText={`${snippet.subjectId}`} 
            link={`/subject/${snippet.subjectId}`} iconColor="blue.500" imageURL={snippet.imageURL}/>
            
        ))}
        </>
    )
}
export default subjects;