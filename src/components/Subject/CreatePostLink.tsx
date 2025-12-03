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
      height="60px"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
      p={3}
      mb={4}
      shadow="sm"
      _hover={{ shadow: "md", borderColor: "gray.300" }}
      transition="all 0.2s"
    >
      {user?.photoURL ? (
        <Image src={user.photoURL} height="36px" width="36px" borderRadius="full" mr={3} ml={1} objectFit="cover" border="1px solid" borderColor="gray.100" />
      ) : (
        <Icon as={FaUserCircle} fontSize={36} color="gray.300" mr={3} ml={1} />
      )}
      <SimpleGrid columns={2} flex="1" gap={3} maxWidth="calc(100% - 60px)">
        <Input
          placeholder="Ask Anything!"
          fontSize="sm"
          _placeholder={{ color: "gray.400", fontWeight: "500" }}
          _hover={{
            bg: "gray.50",
            borderColor: "gray.300",
          }}
          _focus={{
            outline: "none",
            bg: "white",
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px #4682B4",
          }}
          bg="gray.50"
          borderColor="gray.100"
          height="40px"
          borderRadius="full"
          onClick={onClick}
        />
        <Input
          placeholder="Share a Resource"
          fontSize="sm"
          _placeholder={{ color: "gray.400", fontWeight: "500" }}
          _hover={{
            bg: "gray.50",
            borderColor: "gray.300",
          }}
          _focus={{
            outline: "none",
            bg: "white",
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px #4682B4",
          }}
          bg="gray.50"
          borderColor="gray.100"
          height="40px"
          borderRadius="full"
          onClick={onClickResource}
        />
      </SimpleGrid>
    </Flex>

  );
};

export default CreatePostLink;
