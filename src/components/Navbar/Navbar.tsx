import React from 'react';
import { Flex, Image, Button, Box } from '@chakra-ui/react';
import Searchinput from './Searchinput';
import RightContent from './RightContent/RightContent';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';
import Directory from './Directory/Directory';
import useDirectory from '@/hooks/useDirectory';
import { defaultMenuItem } from '@/atoms/directoryMenuAtom';

const Navbar: React.FC = () => {
    const [user, loading, error] = useAuthState(auth);
    const { onSelectMenuItem } = useDirectory();

    return (
        <Flex bg='white' height='50px' padding='6px 10px' width="100%" align="center" justify="space-between">
            <Flex align="center" cursor="pointer" onClick={() => onSelectMenuItem(defaultMenuItem)}>
                <a href="/">
                    <Image src="/images/gr8er.png" ml={.3} height="45px" display={{ base: 'unset', md: 'none' }} />
                    <Image src="/images/gr8er logo.png" ml={2} mt={2} height="37px" mb="1px" display={{ base: 'none', md: 'unset' }} />
                </a>
            </Flex>

            {user && (
                <Flex align="center" display={{ base: 'none', md: 'flex' }}>
                    <Directory />
                </Flex>
            )}

            <Box display={{ base: 'flex', sm: 'flex' }} flex="1" justifyContent={{ base: 'flex-start', sm: 'center' }} maxWidth={{ base: '100px', sm: 'auto' }}>
                <Searchinput />
            </Box>

            <Button 
                height="35px"
                width="150px"
                onClick={() => window.location.href = 'https://www.gr8er.live/'}
                mr={3}
                mt={0.5}>
                Coming soon!
            </Button>

            <Flex>
                <RightContent user={user} />
            </Flex>
        </Flex>
    );
};

export default Navbar;
