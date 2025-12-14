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
      <Flex gap={3} w="100%">
        <Flex
          align="center"
          justify="center"
          flex={1}
          p={3}
          height="50px"
          borderRadius="xl"
          bg="gray.50"
          border="1px solid"
          borderColor="gray.200"
          cursor="pointer"
          _hover={{ bg: "white", borderColor: "brand.500", shadow: "md", transform: "translateY(-1px)" }}
          transition="all 0.2s"
          onClick={onClick}
        >
          <Icon as={TfiCommentAlt} fontSize={20} mr={2} color="brand.500" />
          <Text fontSize="md" fontWeight="600" color="gray.700">Ask Anything</Text>
        </Flex>
        <Flex
          align="center"
          justify="center"
          flex={1}
          p={3}
          height="50px"
          borderRadius="xl"
          bg="gray.50"
          border="1px solid"
          borderColor="gray.200"
          cursor="pointer"
          _hover={{ bg: "white", borderColor: "green.500", shadow: "md", transform: "translateY(-1px)" }}
          transition="all 0.2s"
          onClick={onClickResource}
        >
          <Icon as={IoImageOutline} fontSize={22} mr={2} color="green.500" />
          <Text fontSize="md" fontWeight="600" color="gray.700">Share a Resource</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CreatePostLink;
