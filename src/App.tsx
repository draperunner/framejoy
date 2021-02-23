import * as React from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  Grid,
  theme,
  VStack,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

export const App = () => {
  const onDrop = React.useCallback((acceptedFiles) => {
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            <Heading as="h1">FrameJoy</Heading>
            <Box
              {...getRootProps()}
              borderRadius="xl"
              borderStyle="solid"
              borderColor="teal.100"
              borderWidth="thick"
              padding={20}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
              )}
            </Box>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
};
