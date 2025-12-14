import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  Image,
  Spinner,
} from "@chakra-ui/react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiCakeLine } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore, storage } from "../../firebase/clientApp";
import { Subject, subjectState } from "../../atoms/subjectsAtom";
import moment from "moment";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { FaReddit } from "react-icons/fa";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { IoIosCreate } from 'react-icons/io'

type AboutProps = {

  subjectData: Subject;
  pt?: number;
  onCreatePage?: boolean;
  loading?: boolean;




};

const About: React.FC<AboutProps> = ({
  subjectData,
  pt,
  onCreatePage,
  loading,
}) => {
  const [user] = useAuthState(auth); // will revisit how 'auth' state is passed
  const router = useRouter();
  const selectFileRef = useRef<HTMLInputElement>(null);
  const setSubjectStateValue = useSetRecoilState(subjectState);

  // April 24 - moved this logic to custom hook in tutorial build (useSelectFile)
  const [selectedFile, setSelectedFile] = useState<string>();

  // Added last!
  const [imageLoading, setImageLoading] = useState(false);

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedFile(readerEvent.target?.result as string);
      }
    };
  };

  const mySnippets = useRecoilValue(subjectState).mySnippets;

  const updateImage = async () => {
    if (!selectedFile) return;
    setImageLoading(true);
    try {
      const imageRef = ref(storage, `subjects/${subjectData.id}/image`);
      await uploadString(imageRef, selectedFile, "data_url");
      const downloadURL = await getDownloadURL(imageRef);
      await updateDoc(doc(firestore, "subjects", subjectData.id), {
        imageURL: downloadURL,
      });
      console.log("HERE IS DOWNLOAD URL", downloadURL);

      //   // April 24 - added state update
      //   setSubjectStateValue((prev) => ({
      //     ...prev,
      //     currentSubject: {
      //       ...prev.currentSubject,
      //       imageURL: downloadURL,
      //     },
      //   }));
    } catch (error: any) {
      console.log("updateImage error", error.message);
    }
    setImageLoading(false);
  };
  return (
    <Box pt={pt} position="sticky" top="14px">
      <Flex
        direction="column"
        bg="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(12px)"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.300"
        overflow="hidden"
        shadow="lg"
      >
        <Flex
          justify="space-between"
          align="center"
          p={4}
          color="white"
          bgGradient="linear(to-r, brand.500, brand.600)"
        >
          <Text fontSize="sm" fontWeight={700}>
            About Subject Group
          </Text>
        </Flex>
        <Flex direction="column" p={4}>
          {loading ? (
            <Stack mt={2}>
              <SkeletonCircle size="10" />
              <Skeleton height="10px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          ) : (
            <>
              <Stack spacing={3}>
                <Flex
                  direction="column"
                  align="center"
                  p={4}
                  bg="gray.50"
                  borderRadius="lg"
                >
                  <Text fontSize="2xl" fontWeight={700} color="brand.600">
                    {subjectData.numberOfMembers}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight={500}>Members</Text>
                </Flex>

                <Divider />

                {subjectData.curriculumId !== 'ib-dp' && (
                  <Text fontSize="sm" color="gray.700" lineHeight="1.6" textAlign="center">
                    {subjectData.subjectInfo}
                  </Text>
                )}

                {user && (
                  <Stack spacing={2} width="100%">
                    <Link href={`/subject/${subjectData.id}/submit`}>
                      <Button width="100%" size="md" colorScheme="brand" borderRadius="full">
                        Ask Something
                      </Button>
                    </Link>
                    <Link href={`/subject/${subjectData.id}/resource-submit`}>
                      <Button width="100%" size="md" variant="outline" colorScheme="green" borderRadius="full" _hover={{ bg: "green.50" }}>
                        Share a Resource
                      </Button>
                    </Link>
                  </Stack>
                )}
              </Stack>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};
export default About;
