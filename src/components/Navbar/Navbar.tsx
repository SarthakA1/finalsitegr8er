import React from 'react';
import { Flex, Image, Button, Box } from '@chakra-ui/react';
import Searchinput from './Searchinput';
import RightContent from './RightContent/RightContent';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';
import Directory from './Directory/Directory';
import useDirectory from '@/hooks/useDirectory';
import { defaultMenuItem } from '@/atoms/directoryMenuAtom';
import router from 'next/router';

const redirectToCodeofHonor = () => {
    router.push('/');
};

const navbar: React.FC = () => {
    const [user, loading, error] = useAuthState(auth);
    const { onSelectMenuItem } = useDirectory();




    return (
        <Flex
            bg='rgba(255, 255, 255, 0.8)'
            backdropFilter="blur(12px)"
            height='60px'
            padding='6px 12px'
            direction="row"
            position="sticky"
            top="0"
            zIndex="999"
            borderBottom="1px solid"
            borderColor="whiteAlpha.300"
            shadow="sm"
            align="center"
        >
            <Flex align="center" cursor="pointer" onClick={() => onSelectMenuItem(defaultMenuItem)} mr={4}>
                <a onClick={redirectToCodeofHonor}>
                    <Image src="/images/gr8er.png" ml={.3} height="45px" display={{ base: 'unset', md: 'none' }} />
                    <Image src="/images/gr8er logo.png" ml={2} mt={2} height="37px" mb="1px" display={{ base: 'none', md: 'unset' }} />
                </a>
            </Flex>


            {user && (
                <Flex align="center">
                    <Directory />

                </Flex>
            )}


            <Searchinput />


            {/*                 <Button 
    height="35px"
    width= "150px"
    onClick={() => window.open('https://forms.gle/VqLu2seSNzi1JneZ9', '_blank')}
    mr={3} 
    mt={0.5}>
    Peer Tutoring
</Button> */}


            <Flex >
                <RightContent user={user} />
            </Flex>
        </Flex>
    );
};

export default navbar;
