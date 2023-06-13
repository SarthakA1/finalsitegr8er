import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaReddit } from "react-icons/fa";
import { RiGroup2Fill } from "react-icons/ri";
import { Subject } from "../../atoms/subjectsAtom";
import { firestore } from "../../firebase/clientApp";
import useSubjectData from "../../hooks/useSubjectData";

const Recommendations: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const { subjectStateValue, onJoinOrLeaveSubject } = useSubjectData();

  const getSubjectRecommendations = async () => {
    setLoading(true);
    try {
      const subjectQuery = query(
        collection(firestore, "subjects"),
        orderBy("numberOfMembers", "desc"),
        limit(20)
      );
      const subjectDocs = await getDocs(subjectQuery);
      const subjects = subjectDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubjects(subjects as Subject[]);
    } catch (error) {
      console.log("getSubjectsRecommendations error", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getSubjectRecommendations();
  }, []);

  return (
    <Flex
      direction="column"
      bg="white"
      borderRadius={4}
      border="1px solid"
      borderColor="gray.300"
    >
      <Flex
        align="flex-end"
      
        p="6px 10px"
        height="100px"
        borderRadius="4px 4px 0px 0px"
        bgImage="/images/iblmao.png"
        
        
        backgroundSize="cover"
        
      >
        <Text
        color="white"
        fontWeight={700}

        >

        
        Top Subject Groups
        </Text>
      </Flex>
      <Flex direction="column">
        {loading ? (
          <Stack mt={2} p={3}>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
          </Stack>
        ) : (
          <>
            {subjects.map((item, index) => {
              const isJoined = !!subjectStateValue.mySnippets.find(
                (snippet) => snippet.subjectId === item.id
              );
              return (
                <Link key={item.id} href={`/subject/${item.id}`}>
                  <Flex
                    position="relative"
                    align="center"
                    fontSize="10pt"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    p="10px 12px"
                  >
                    <Flex width="80%" align="center">
                      <Flex width="15%">
                        <Text>{index + 1}</Text>
                      </Flex>
                      <Flex align="center" width="80%">
                        {item.imageURL ? (
                          <Image
                            src={item.imageURL}
                            borderRadius="full"
                            boxSize="28px"
                            mr={2}
                          />
                        ) : (
                          <Icon
                            as={RiGroup2Fill}
                            fontSize={30}
                            color="brand.100"
                            mr={2}
                          />
                        )}
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {`${item.id}`}
                        </span>
                      </Flex>
                    </Flex>
                    <Box position="absolute" right="10px">
                      <Button
                        height="22px"
                        fontSize="8pt"
                        variant={isJoined ? "outline" : "solid"}
                        onClick={(event) => {
                          event.stopPropagation();
                          onJoinOrLeaveSubject(item, isJoined);
                        }}
                      >
                        {isJoined ? "Joined" : "Join"}
                      </Button>
                    </Box>
                  </Flex>
                </Link>
              );
            })}

          </>
        )}
      </Flex>
    </Flex>
  );
};
export default Recommendations;