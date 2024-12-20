import { ChevronDownIcon } from '@chakra-ui/icons';
import { Menu, MenuButton, Button, MenuList, MenuItem, Icon, Flex, Image } from '@chakra-ui/react';
import { signOut, User } from 'firebase/auth';
import React from 'react';
import { FaUserCircle } from "react-icons/fa";
import { FaPersonBooth } from "react-icons/fa";
import { BsChevronDown } from "react-icons/bs";
import { VscAccount } from "react-icons/vsc";
import { TbLogout } from "react-icons/tb";
import { FaStar } from "react-icons/fa";
import { auth } from '@/firebase/clientApp';
import { Text } from "@chakra-ui/react";
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { subjectState } from '@/atoms/subjectsAtom';
import { AuthModalState } from '@/atoms/authModalAtom';
import router from 'next/router';


type UserMenuProps = {
    user?: User | null;
};

const UserMenu:React.FC<UserMenuProps> = ({ user }) => {
    const resetSubjectState = useResetRecoilState(subjectState)
    const setAuthModalState = useSetRecoilState(AuthModalState);

    const logoutt = async () => {
        await signOut(auth);
        resetSubjectState();
        //clear community state
    };

    const redirectToCodeofHonor = () => {
        router.push('/codeofhonor');
    };

    const redirectToFounder = () => {
        router.push('/founder');
    };

    

    return (
        <Menu>
             <MenuButton cursor="pointer" padding="0px 6px" borderRadius={4} _hover={{ outline: "1px solid", outlineColor: "gray.200" }}>
                <Flex align="center">
                      {user?.photoURL ? (
                <Image src={user.photoURL} height="28px" borderRadius={50}></Image>
            ) : (
                <Icon fontSize={24} as={FaUserCircle}  mr={1} color="brand.100"/>
                
            )}
                       
                       <Text mr={2} ml={1} display={{ base: 'none', md: 'unset' }}> 
                            {user?.displayName || user?.email?.split("@")[0]}
                         </Text>
                         <Icon fontSize={11} as={BsChevronDown} mt={0.5} mr={1} color="brand.100"/>
                </Flex>
            </MenuButton>
                         
  <MenuList>
    
    {/* <MenuItem
    fontSize="10pt"
    fontWeight={700}
    _hover={{ bg: "blue.500", color:"white"}}
    onClick={redirectToLandingPage}
    >
    <Flex align="center">
        <Icon fontSize={20} mr={2} as={FaStar} />
        About GR8ER
    </Flex>
    </MenuItem> */}
    <MenuItem
    fontSize="10pt"
    fontWeight={700}
    _hover={{ bg: "blue.500", color:"white"}}
    onClick={redirectToCodeofHonor}
    >
    <Flex align="center">
        <Icon fontSize={20} mr={2} as={FaStar} />
        Code of Honor
    </Flex>
    </MenuItem>

    <MenuItem
    fontSize="10pt"
    fontWeight={700}
    _hover={{ bg: "blue.500", color:"white"}}
    onClick={redirectToFounder}
    >
    <Flex align="center">
        <Icon fontSize={20} mr={2} as={FaPersonBooth} />
        Meet the Founder
    </Flex>
    </MenuItem>
   
    <MenuItem
    fontSize="10pt"
    fontWeight={700}
    _hover={{ bg: "blue.500", color:"white"}}
    onClick={logoutt}
    >
    <Flex align="center">
        <Icon fontSize={20} mr={2} as={TbLogout} />
        Log Out
    </Flex>
    </MenuItem>

  </MenuList>
</Menu>
    )
}
export default UserMenu;
