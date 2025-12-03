import { AuthModalState } from "@/atoms/authModalAtom";
import { auth } from "@/firebase/clientApp";
import useDirectory from "@/hooks/useDirectory";
import { Flex, Icon, Input, Image, SimpleGrid, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsLink45Deg } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";
import { TfiCommentAlt } from "react-icons/tfi";
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
      direction="column"
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.200"
      p={4}
      mb={4}
      shadow="sm"
      _hover={{ shadow: "md", borderColor: "gray.300" }}
      transition="all 0.2s"
    >
      <Flex align="center" mb={3}>
        {user?.photoURL ? (
          <Image src={user.photoURL} height="40px" width="40px" borderRadius="full" mr={3} />
        ) : (
          <Icon as={FaUserCircle} fontSize={40} color="gray.300" mr={3} />
        )}
        <Input
          placeholder="Ask a question or share your thoughts..."
          fontSize="sm"
          _placeholder={{ color: "gray.400" }}
          _hover={{
            borderColor: "brand.300",
          }}
          _focus={{
            outline: "none",
            borderColor: "brand.500",
            boxShadow: "0 0 0 1px #4682B4",
          }}
          bg="gray.50"
          borderColor="gray.200"
          height="40px"
          borderRadius="full"
          onClick={onClick}
          cursor="pointer"
        />
      </Flex>
      <Flex gap={2}>
        <Flex
          align="center"
          justify="center"
          flex={1}
          p={2}
          borderRadius="lg"
          bg="gray.50"
          cursor="pointer"
          _hover={{ bg: "brand.50", color: "brand.600" }}
          transition="all 0.2s"
          onClick={onClick}
        >
          <Icon as={TfiCommentAlt} fontSize={18} mr={2} />
          <Text fontSize="sm" fontWeight="500">Ask Question</Text>
        </Flex>
        <Flex
          align="center"
          justify="center"
          flex={1}
          p={2}
          borderRadius="lg"
          bg="gray.50"
          cursor="pointer"
          _hover={{ bg: "green.50", color: "green.600" }}
          transition="all 0.2s"
          onClick={onClickResource}
        >
          <Icon as={IoImageOutline} fontSize={18} mr={2} />
          <Text fontSize="sm" fontWeight="500">Share Resource</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CreatePostLink;
