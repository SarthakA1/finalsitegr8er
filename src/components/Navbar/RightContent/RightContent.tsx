import { Button, Flex, Menu } from '@chakra-ui/react';
import React from 'react';
import AuthButtons from './AuthButtons';
import AuthModal from '@/components/Modal/Auth/AuthModal';
import { signOut, User } from 'firebase/auth';
import { auth } from '@/firebase/clientApp';
import UserMenu from './UserMenu';
import Icons from './Icons';

type RightContentProps = {
    user?: User | null;
};

const RightContent:React.FC<RightContentProps> = ({ user }) => {
    return (
        <>
        <AuthModal/>
        <Flex justify='center' align='center'>
            {user ? (
                <UserMenu user={user} />
            ) : (
                <Flex   >
                <AuthButtons />
                </Flex>
                
            )}
            
        </Flex>
        </>
    );
};
export default RightContent;