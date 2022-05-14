import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  ScaleFade,
  SimpleGrid,
  Skeleton,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { FileRejection, useDropzone } from "react-dropzone";

import firebase from "firebase/app";
import "firebase/storage";
import "firebase/functions";

const functions = firebase.app().functions("europe-west1");

if (window.location.hostname === "localhost") {
  console.log("Using functions emulator");
  functions.useEmulator("localhost", 5001);
}

const frameImage = functions.httpsCallable("frameImage", {});

function distribute<T>(array: T[], desiredArrayCount: number): T[][] {
  const distribution: T[][] = new Array(desiredArrayCount)
    .fill([])
    .map(() => []);
  array.forEach((item, index) => {
    const i = index % desiredArrayCount;
    distribution[i].push(item);
  });

  return distribution;
}

function fileToBase64(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onabort = () => reject("Aborted");
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const Main: React.FC = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [framedFiles, setFramedFiles] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const { onCopy } = useClipboard(selectedImage);

  const toast = useToast();

  const errorToast = useCallback(
    (message: string) =>
      toast({
        position: "bottom",
        title: message,
        status: "error",
        duration: 7000,
        isClosable: true,
      }),
    [toast]
  );

  useEffect(() => {
    // Reset copied state when another image is selected
    setCopied(false);
  }, [selectedImage]);

  useEffect(() => {
    if (selectedImage && !copied) {
      setCopied(true);
      onCopy();
      toast({
        position: "bottom",
        title: "Image URL copied!",
        status: "success",
        duration: 1000,
      });
    }
  }, [selectedImage, copied, onCopy]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setSubmitted(true);

      try {
        const fileData = await fileToBase64(file);
        const result = await frameImage({
          data: fileData,
        });

        setFramedFiles(result.data);
      } catch (error) {
        errorToast("Something went wrong.");
      }
    },
    [errorToast]
  );

  const onDropRejected = useCallback(
    async (fileRejections: FileRejection[]) => {
      fileRejections
        .flatMap((r) => r.errors)
        .map((error) => error.code)
        .filter((code, i, arr) => arr.indexOf(code) === i)
        .forEach((code) => {
          switch (code) {
            case "file-too-large": {
              return errorToast(
                "The file is too large. Please use an image less than 3 MB in size."
              );
            }
            case "file-invalid-type": {
              return errorToast(
                "Invalid file type. Supported types are JPEG, PNG and WEBP."
              );
            }
            case "too-many-files": {
              return errorToast(
                "Too many files provided. Only one is supported."
              );
            }
            default:
              errorToast("Someting went wrong.");
          }
        });
    },
    [errorToast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/jpeg, image/png, image/webp",
    onDrop,
    onDropRejected,
    maxSize: 3 * 10e5, // 3 MB,
    maxFiles: 1,
  });

  return (
    <VStack spacing={8}>
      <ScaleFade in={framedFiles.length > 0} unmountOnExit>
        <Heading as="h1" marginBottom="2rem">
          Enjoy! 💁‍♂️
        </Heading>
        <SimpleGrid columns={[1, null, 2, 3]} templateRows="masonry">
          {distribute(framedFiles, 3).map((group, i) => (
            <Box key={i}>
              {group.map((url) => (
                <Container key={url} marginBottom="2rem">
                  <Image
                    src={url}
                    alt="Framed image"
                    borderRadius="md"
                    cursor="pointer"
                    border="0.25rem solid transparent"
                    _hover={{ borderColor: "blue.500" }}
                    onClick={() => setSelectedImage(url)}
                  />
                </Container>
              ))}
            </Box>
          ))}
        </SimpleGrid>
      </ScaleFade>
      <ScaleFade in={!framedFiles.length && submitted} unmountOnExit>
        <Heading as="h1" marginBottom="2rem">
          Cutting and glueing ... ✂️
        </Heading>
        <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing="1rem">
          <Container minWidth="sm">
            <Skeleton height="245px" />
          </Container>
          <Container minWidth="sm">
            <Skeleton height="460px" />
          </Container>
          <Container minWidth="sm">
            <Skeleton height="245px" />
          </Container>
        </SimpleGrid>
      </ScaleFade>
      <ScaleFade in={!framedFiles.length && !submitted} unmountOnExit>
        <Box
          {...getRootProps()}
          borderRadius="xl"
          borderStyle="dashed"
          backgroundColor={isDragActive ? "blue.50" : "transparent"}
          borderColor="blue.500"
          borderWidth="thick"
          padding={16}
        >
          <Container>
            <Heading as="h1" marginBottom="2rem">
              Framejoy
            </Heading>
            <input {...getInputProps()} />
            <Image
              src="/front-image.webp"
              alt="Your image plus a frame equals awesome combo!"
            />
            <Text textAlign="center" color="blue.600" marginTop={8}>
              Drop an image or click here to see it framed!
            </Text>
            <Box marginTop={4}>
              <Text textAlign="center" fontSize="small">
                Generated images are stored for one day. Your uploaded image is
                not stored at all.
              </Text>
            </Box>
          </Container>
        </Box>
      </ScaleFade>
    </VStack>
  );
};
