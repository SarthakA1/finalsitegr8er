import React from 'react';
import { Flex } from '@chakra-ui/react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { AuthModalState } from '@/atoms/authModalAtom';
import Login from './Auth/login';
import SignUp from './Auth/SignUp';

type AuthInputsProps = {
    
};

const AuthInputs:React.FC<AuthInputsProps> = () => {
    const modalState = useRecoilValue(AuthModalState);
    
    return (
        <Flex
        direction="column"
        align="center"
        width="100%"
        mt={4}>
            {modalState.view === "login" && <Login />}
            {modalState.view === "signup" && <SignUp />}
        </Flex>
    )
}
export default AuthInputs;