import { AuthModalState } from '@/atoms/authModalAtom';
import { Button } from '@chakra-ui/react';
import React from 'react';
import { useSetRecoilState } from 'recoil';

const AuthButtons: React.FC = () => {
  const setAuthModalState = useSetRecoilState(AuthModalState);
  return (
    <>
      <Button
        variant="outline"
        height="32px"
        width={{ base: "70px", md: "100px" }}
        onClick={() => setAuthModalState({ open: true, view: "login" })}
        mr={2}
        fontWeight={600}
      >
        Log In
      </Button>
      <Button
        height="32px"
        width={{ base: "70px", md: "100px" }}
        onClick={() => setAuthModalState({ open: true, view: "signup" })}
        fontWeight={600}
      >Sign Up
      </Button>

    </>
  );
}
export default AuthButtons;