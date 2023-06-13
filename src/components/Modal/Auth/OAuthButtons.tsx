import { Flex, Button, Image, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { useSignInWithGoogle} from 'react-firebase-hooks/auth';
import { auth, firestore } from '../../../firebase/clientApp'; 




const OAuthButtons:React.FC = () => {
    const [SignInWithGoogle, userCred, loading, error] = useSignInWithGoogle(auth)
    
    const createUserDocument = async(user: User) => {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, JSON.parse(JSON.stringify(user)));
    }

    useEffect (() => {
        if (userCred) {
            createUserDocument(userCred.user)
        }
    }, [userCred]);
    
    return (
    <Flex direction="column" width="100%" mb={1}>
        <Button mb={2} isLoading={loading} onClick={() => SignInWithGoogle()}>
            <Image src="/images/googlelogo.png" height="18px" mr={2}/>
            Continue with Google
        </Button>
    
        {error && <Text> {error.message} </Text>}
    </Flex>
        );
}
export default OAuthButtons;