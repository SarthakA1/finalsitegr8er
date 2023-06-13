import { Button, Flex, Input } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Text } from '@chakra-ui/react';
import { useSetRecoilState } from 'recoil';
import { AuthModalState } from '@/atoms/authModalAtom';
import { auth } from '../../../firebase/clientApp';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { FIREBASE_ERRORS } from '@/firebase/errors';


type LoginProps = {};

const Login:React.FC<LoginProps> = () => {
    const setAuthModalState = useSetRecoilState(AuthModalState);
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
    });
    const [
        signInWithEmailAndPassword,
        user,
        loading,
        error,
      ] = useSignInWithEmailAndPassword(auth);

   

const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    signInWithEmailAndPassword(loginForm.email, loginForm.password);
};


const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // update form state
    setLoginForm(prev => ({
        ...prev,
        [event.target.name]: event.target.value,
    }))
};
    
    function toggleView(arg0: string): void {
        throw new Error('Function not implemented.');
    }

    return (
        <form onSubmit={onSubmit}>
           <Input 
           required
           name="email" 
           placeholder='email' 
           type="email" 
           mb={2} 
           onChange={onChange}
           fontSize="10pt"
           _placeholder={{ color: 'gray.500' }}
           _hover={{
            bg:"white",
            border:"1px solid",
            borderColor:"#4682B4"
        }}
        _focus={{
            outline:"none",
            bg:"white",
            border:"1px solid",
            borderColor:"#4682B4"
        }}
        bg="gray.50"
           />
           <Input 
           required
           name="password" 
           placeholder='password' 
           type="password" 
           mb={2}
           onChange={onChange}
           fontSize="10pt"
           _placeholder={{ color: 'gray.500' }}
           _hover={{
            bg:"white",
            border:"1px solid",
            borderColor:"#4682B4"
        }}
        _focus={{
            outline:"none",
            bg:"white",
            border:"1px solid",
            borderColor:"#4682B4"
        }}
        bg="gray.50"
           />
           <Text 
           textAlign="center" 
           color="red" 
           fontSize="10pt">
           </Text>
           <Button width="100%" height="36px" mt={2} mb={2} type="submit" isLoading={loading}>
            Log In
           </Button>
            <Flex justifyContent="center" mb={2}>
                <Text fontSize="9pt" mr={1}>
                      Forgot your password?
                </Text>
                <Text
                 fontSize="9pt"
                 color="blue.500"
                 cursor="pointer"
                 onClick={() => 
                    setAuthModalState((prev) => ({
                    ...prev,
                    view: "resetPassword",
                    }))
                }
                >
                    Reset
                </Text>
            </Flex>

           <Flex fontSize='9pt' justifyContent='center'>
            <Text mr={1}> New here? </Text>
            <Text 
            textColor="#4682B4" 
            fontWeight={700} 
            cursor="pointer"
            onClick={() => setAuthModalState(prev => ({
                ...prev,
                view: "signup",
            }))} > SIGN UP </Text>
           </Flex>
        </form>
    )
}
export default Login;