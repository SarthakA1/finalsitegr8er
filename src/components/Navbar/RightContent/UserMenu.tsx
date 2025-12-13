import { ChevronDownIcon } from '@chakra-ui/icons';
import { Menu, MenuButton, Button, MenuList, MenuItem, Icon, Flex, Image, Box, useColorMode, Switch } from '@chakra-ui/react';
import { signOut, User } from 'firebase/auth';
import React from 'react';
import { FaUserCircle } from "react-icons/fa";
import { FaPersonBooth } from "react-icons/fa";
import { BsChevronDown } from "react-icons/bs";
import { VscAccount } from "react-icons/vsc";
import { TbLogout } from "react-icons/tb";
import { IoSwapHorizontal, IoLibrary, IoShieldCheckmark } from "react-icons/io5";
import { auth } from '@/firebase/clientApp';
import { Text } from "@chakra-ui/react";
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { subjectState } from '@/atoms/subjectsAtom';
import { AuthModalState } from '@/atoms/authModalAtom';
import { curriculumState } from '@/atoms/curriculumAtom';
import { useRecoilState } from 'recoil';
import router from 'next/router';
import { getSketchAvatarUrl } from '@/utils/avatar';


type UserMenuProps = {
    user?: User | null;
};

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
    // const { colorMode, toggleColorMode } = useColorMode(); // Dark mode removed
    const resetSubjectState = useResetRecoilState(subjectState)
    const setAuthModalState = useSetRecoilState(AuthModalState);
    const [curriculum, setCurriculum] = useRecoilState(curriculumState);

    const toggleCurriculum = () => {
        const newId = curriculum.curriculumId === 'ib-myp' ? 'ib-dp' : 'ib-myp';
        setCurriculum({ curriculumId: newId });
        // Force reload to ensure subjects update correctly as requested
        window.location.href = `/${newId}`;
    };

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
                        <Image src={user.photoURL} height="28px" borderRadius={50} mr={1} />
                    ) : (
                        <Image
                            src={getSketchAvatarUrl(user?.uid || 'user')}
                            height="28px"
                            width="28px"
                            borderRadius={50}
                            mr={1}
                            border="1px solid"
                            borderColor="gray.200"
                            bg="gray.100"
                        />
                    )}

                    <Text mr={2} ml={1} display={{ base: 'none', md: 'unset' }}>
                        {user?.displayName || user?.email?.split("@")[0]}
                    </Text>
                    <Icon fontSize={11} as={BsChevronDown} mt={0.5} mr={1} color="brand.100" />
                </Flex>
            </MenuButton>

            <MenuList>
                <MenuItem
                    fontSize="10pt"
                    fontWeight={700}
                    _hover={{ bg: "brand.50", color: "brand.600" }}
                    onClick={toggleCurriculum}
                    pt={2}
                    pb={2}
                >
                    <Flex align="center">
                        <Icon fontSize={20} mr={3} as={IoSwapHorizontal} color="brand.500" />
                        <Text fontWeight={800}>
                            Switch to {curriculum.curriculumId === 'ib-myp' ? 'IB DP' : 'IB MYP'}
                        </Text>
                    </Flex>
                </MenuItem>
                <Box height="1px" bg="gray.100" my={1} mx={2} />

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
                    _hover={{ bg: "blue.500", color: "white" }}
                    onClick={() => router.push('/my-resources')}
                >
                    <Flex align="center">
                        <Icon fontSize={20} mr={3} as={IoLibrary} />
                        My Resources
                    </Flex>
                </MenuItem>

                <MenuItem
                    fontSize="10pt"
                    fontWeight={700}
                    _hover={{ bg: "blue.500", color: "white" }}
                    onClick={redirectToCodeofHonor}
                >
                    <Flex align="center">
                        <Icon fontSize={20} mr={3} as={IoShieldCheckmark} />
                        Code of Honor
                    </Flex>
                </MenuItem>

                <Box height="1px" bg="gray.100" my={1} mx={2} />

                <MenuItem
                    fontSize="10pt"
                    fontWeight={700}
                    _hover={{ bg: "blue.500", color: "white" }}
                    onClick={logoutt}
                >
                    <Flex align="center">
                        <Icon fontSize={20} mr={3} as={TbLogout} />
                        Log Out
                    </Flex>
                </MenuItem>

            </MenuList>
        </Menu>
    )
}
export default UserMenu;
