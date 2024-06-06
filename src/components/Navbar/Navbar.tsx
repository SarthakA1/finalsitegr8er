import React from 'react';
import { Flex, Image, Button } from '@chakra-ui/react';
import Searchinput from './Searchinput';
import RightContent from './RightContent/RightContent';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';
import Directory from './Directory/Directory';
import useDirectory from '@/hooks/useDirectory';
import { defaultMenuItem } from '@/atoms/directoryMenuAtom';

const navbar: React.FC = () => {
    const [user, loading, error] = useAuthState(auth);
    const { onSelectMenuItem } = useDirectory();

    return (
        <Flex bg='white' height='50px' padding='6px 10px' direction="row">
            <Flex align="center" cursor="pointer" onClick={() => onSelectMenuItem(defaultMenuItem)} >
                <a href="/">
                    <Image src="/images/gr8er.png" ml={.3} height="45px" display={{ base: 'unset', md: 'none' }} />
                    <Image src="/images/gr8er logo.png" ml={2} mt={2} height="37px" mb="1px" display={{ base: 'none', md: 'unset' }} />
                </a>
            </Flex>

            {user && (
                <Flex align="center">
                    <Directory />
                    
                </Flex>
            )}
            <Button ml={4} onClick={() => window.location.href = 'https://your-link.com'}>
                        Coming
                    </Button>
            <Searchinput />

            <Flex >
                <RightContent user={user} />
            </Flex>
        </Flex>
    );
};

export default navbar;
