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
import { IoIosCreate  } from 'react-icons/io'

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
    // April 24 - removed reload
    // window.location.reload();

    setImageLoading(false);
  };

  return (
    <Box pt={pt} position="sticky" top="14px">
      <Flex
        justify="space-between"
        align="center"
        p={3}
        color="white"
        bg="blue.400"
        borderRadius="4px 4px 0px 0px"
      >
        <Text fontSize="10pt" fontWeight={700}>
          About Subject Group
        </Text>
      </Flex>
      <Flex direction="column" p={3} bg="white" borderRadius="0px 0px 4px 4px">
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
            
              
            <Stack spacing={2} maxWidth="300px" align="center">
              <Flex width="100%" p={2} fontWeight={600} fontSize="10pt">
                <Flex direction="column" flexGrow={1} align='center'>
                  <Text >
                  {subjectData.numberOfMembers}
                  </Text>
                  <Text>Member(s)</Text>
                </Flex>
                
              </Flex>
              <Divider />
              <Flex align="center" width="100%" p={1} fontWeight={500} fontSize="10pt">
                   
                    <Text mt={1} textAlign="center">
                   {subjectData.subjectInfo}
                  </Text>
                  </Flex>

              {user && (
                <Link href={`${router.query.subject}/submit`}>
                  <Button mt={2} mb={3} height="30px" width="250px">
                    Ask Anything!
                  </Button>
                </Link>
              )}
              {/* !!!ADDED AT THE VERY END!!! INITIALLY DOES NOT EXIST */}
             
                <>
                  {/* <Divider /> */}
                  {/* <Stack fontSize="10pt" spacing={1}>
                    <Text fontWeight={600}>Admin</Text>
                    <Flex align="center" justify="space-between">
                      <Text
                        color="blue.500"
                        cursor="pointer"
                        _hover={{ textDecoration: "underline" }}
                        onClick={() => selectFileRef.current?.click()}
                      >
                        Change Image
                      </Text>
                      {subjectData?.imageURL || selectedFile ? (
                        <Image
                          borderRadius="full"
                          boxSize="40px"
                          src={selectedFile || subjectData?.imageURL}
                          alt="Dan Abramov"
                        />
                      ) : (
                        <Icon
                          as={IoIosCreate}
                          fontSize={30}
                          color="brand.100"
                          mr={2}
                          mb={2}
                        />
                      )}
                    </Flex>
                    {selectedFile &&
                      (imageLoading ? (
                        <Spinner />
                      ) : (
                        <Text cursor="pointer" onClick={updateImage}>
                          Save Changes
                        </Text>
                      ))}
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/x-png,image/gif,image/jpeg"
                      hidden
                      ref={selectFileRef}
                      onChange={onSelectImage}
                    />
                  </Stack> */}
                </>
              
            </Stack>
          </>
        )}
      </Flex>
    </Box>
  );
};
export default About;