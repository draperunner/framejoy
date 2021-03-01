import * as React from "react";
import { ChakraProvider, Box, theme, Flex, Link, Fade } from "@chakra-ui/react";

import { UserProvider } from "./auth";
import { Main } from "./pages/Main";

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <Box textAlign="center" fontSize="xl" padding={8}>
          <Flex
            flexDirection="row"
            justifyContent="space-between"
            padding="10px"
          >
            <Fade in={window.location.pathname !== "/"}>
              <Link href="/" justifySelf="flex-start">
                Framejoy
              </Link>
            </Fade>
          </Flex>
          <Main />
        </Box>
      </UserProvider>
    </ChakraProvider>
  );
};
