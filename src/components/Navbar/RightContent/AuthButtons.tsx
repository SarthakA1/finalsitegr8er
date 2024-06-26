import { AuthModalState } from '@/atoms/authModalAtom';
import { Button } from '@chakra-ui/react';
import React from 'react';
import { useSetRecoilState } from 'recoil';

const AuthButtons:React.FC = () => {
   const setAuthModalState = useSetRecoilState(AuthModalState);
     return (
        <>
        <Button 
        variant="outline"
        height="33px"
        
        width= {{ base: "70px", md:"110px"}}
        onClick={() => setAuthModalState({ open:true, view: "login"})}
        mr={2} >
         Log In
         </Button>
        <Button 
        height="33px"
    
        width= {{ base: "70px", md:"110px"}}
        onClick={() => setAuthModalState({ open:true, view: "signup"})}
     
      >Sign Up
      </Button>
       
        </>
     );
}
export default AuthButtons;