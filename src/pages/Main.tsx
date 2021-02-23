import React, { useState, useCallback } from "react";
import {
  Box,
  Center,
  Container,
  Heading,
  Progress,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";

import firebase from "firebase/app";
import "firebase/storage";
import { useUser } from "../auth";

export const Main: React.FC = () => {
  const user = useUser();
  const [progress, setProgress] = useState<number>(0);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const storageRef = firebase.storage().ref();
      const uploadTask = storageRef
        .child(`content/${user?.uid}/${file.name}`)
        .put(file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setProgress(progress);
        },
        (error) => {
          console.error(error);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            console.log("File available at", downloadURL);
          });
        }
      );
    },
    [user]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <VStack spacing={8}>
      <Heading as="h1">FrameJoy</Heading>
      {progress > 0 ? (
        <Container>
          <Progress
            value={progress}
            hasStripe
            size="lg"
            isAnimated
            colorScheme="teal"
          />
        </Container>
      ) : (
        <Box
          {...getRootProps()}
          borderRadius="xl"
          borderStyle="dashed"
          borderColor="teal.100"
          borderWidth="thick"
        >
          <Center h="sm" w="lg">
            <input {...getInputProps()} />
            <Text>Drop the files here ...</Text>
          </Center>
        </Box>
      )}
    </VStack>
  );
};
