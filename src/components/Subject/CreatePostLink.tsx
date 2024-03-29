import { AuthModalState } from "@/atoms/authModalAtom";
import { auth } from "@/firebase/clientApp";
import useDirectory from "@/hooks/useDirectory";
import { Flex, Icon, Input, Image, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsLink45Deg } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";
import { useRecoilState, useSetRecoilState } from "recoil";
import AuthModal from "../Modal/Auth/AuthModal";

const CreatePostLink: React.FC = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetRecoilState(AuthModalState);
  const { toggleMenuOpen } = useDirectory();

  const onClick = () => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }
    const { subjectId } = router.query;

    if (subjectId) {
      router.push(`/subject/${subjectId}/submit`);
      return;
    }

    toggleMenuOpen();
  };

  // Open directory menu to select community to post to
  const onClickResource = () => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }
    const { subjectId } = router.query;
    if (subjectId) {
      router.push(`/subject/${subjectId}/resource-submit`);
      return;
    }
    toggleMenuOpen();
  };

  return (
   <Flex
  justify="space-between"
  align="center"
  bg="white"
  height="56px"
  borderRadius={4}
  border="1px solid"
  borderColor="gray.300"
  p={2}
  mb={4}
>
  {user?.photoURL ? (
    <Image src={user.photoURL} height="35px" borderRadius={50} mr={2} ml={4} />
  ) : (
    <Icon as={FaUserCircle} fontSize={36} color="gray.300" mr={2} ml={4} />
  )}
  <SimpleGrid columns={2} flex="1" gap={2} maxWidth="calc(100% - 72px)"> {/* Adjusted maxWidth */}
    <Input
      placeholder="Ask Anything!"
      fontSize="10pt"
      _placeholder={{ color: "gray.500" }}
      _hover={{
        bg: "white",
        border: "1px solid",
        borderColor: "blue.500",
      }}
      _focus={{
        outline: "none",
        bg: "white",
        border: "1px solid",
        borderColor: "blue.500",
      }}
      bg="gray.50"
      borderColor="gray.200"
      height="36px"
      borderRadius={4}
      onClick={onClick}
    />
    <Input
      placeholder="Share a Resource"
      fontSize="10pt"
      _placeholder={{ color: "gray.500" }}
      _hover={{
        bg: "white",
        border: "1px solid",
        borderColor: "blue.500",
      }}
      _focus={{
        outline: "none",
        bg: "white",
        border: "1px solid",
        borderColor: "blue.500",
      }}
      bg="gray.50"
      borderColor="gray.200"
      height="36px"
      borderRadius={4}
      onClick={onClickResource}
    />
  </SimpleGrid>
  {/* 
  <Icon
    as={IoImageOutline}
    fontSize={24}
    mr={4}
    color="gray.400"
    cursor="pointer"
    onClick={onClick}
  />
  <Icon as={BsLink45Deg} fontSize={24} color="gray.400" cursor="pointer" onClick={onClick}/> 
  */}
</Flex>

  );
};

export default CreatePostLink;
