import { Subject, subjectState } from '@/atoms/subjectsAtom';
import { Box, Button, Flex, Icon,Text, Image } from '@chakra-ui/react';
import React from 'react';
import { RiGroup2Fill } from 'react-icons/ri';
import useSubjectData from '@/hooks/useSubjectData';
import { IoIosCreate } from 'react-icons/io';

type HeaderProps = {
    subjectData: Subject;
};

const Header:React.FC<HeaderProps> = ({ subjectData }) => {

    const { subjectStateValue, onJoinOrLeaveSubject, loading } = useSubjectData();

    const isJoined = !!subjectStateValue.mySnippets.find((item) => item.subjectId === subjectData.id)
    
    return (
        <Flex direction='column' width='100%' height='146px'>
            <Box height='50%' bg="blue.400" ></Box>
        <Flex justify='center' bg="white" flexGrow={1}>
            <Flex width="95%" maxWidth='1000px' align='center'>
            {subjectData?.imageURL ? (
                        <Image
                          borderRadius="full"
                          boxSize="75px"
                          src={subjectData?.imageURL}
                          alt="Dan Abramov"
                          align='center'
                          mt={1}
                          mb={1}
                          
                        />
                      ) : (
                        <Icon
                          as={RiGroup2Fill}
                          mt={1}

                          fontSize={75}
                          color="brand.100"
                          mr={2}
                          mb={2}
                        />
                      )}
                <Flex padding="10px 16px">
                    <Flex direction='column' mr={6} justifyContent='center'>
                        <Text fontWeight={800} fontSize="22px">
                            {subjectData.id}
                        </Text>
                        <Text fontWeight={600} fontSize="13px" color='gray.400' ml={0}>
                            Subject Group
                        </Text>
                    </Flex>
                    <Button 
                    variant={isJoined ? "outline" : "solid"} 
                    height="30px" 
                    justifyContent='center'
                    pr={6} 
                    pl={6} 
                    mt={3}
                    isLoading={loading}
                    onClick={() => onJoinOrLeaveSubject(subjectData, isJoined)}>
                        {isJoined ? "Joined" : "Join"}
                    </Button>
                </Flex>
            </Flex>
        </Flex>   
        </Flex>
    )
}
export default Header;