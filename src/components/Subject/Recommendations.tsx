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
        limit(40)
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
      shadow="sm"
    >
      <Flex
        align="flex-end"
        color="white"
        p="6px 10px"
        height="70px"
        borderRadius="4px 4px 0px 0px"
        bgGradient="linear(to-r, brand.500, brand.600)"
        fontWeight={700}
        backgroundSize="cover"
      >
        Top Subject Groups
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
                <Flex
                  key={item.id}
                  onClick={() => {
                    window.location.href = `/subject/${item.id}`;
                  }}
                  position="relative"
                  align="center"
                  fontSize="10pt"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  p="10px 12px"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  transition="all 0.2s"
                >
                  <Flex width="80%" align="center">
                    <Flex width="15%">
                      <Text fontWeight={600} color="gray.500">{index + 1}</Text>
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
                          color="brand.500"
                          mr={2}
                        />
                      )}
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: 600,
                          color: "#2D3748"
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
                      colorScheme={isJoined ? "gray" : "brand"}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click event from propagating
                        onJoinOrLeaveSubject(item, isJoined);
                      }}
                    >
                      {isJoined ? "Joined" : "Join"}
                    </Button>
                  </Box>
                </Flex>
              );
            })}
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Recommendations;
