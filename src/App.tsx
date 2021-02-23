import * as React from "react";
import { ChakraProvider, Box, Grid, theme } from "@chakra-ui/react";

import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { UserProvider } from "./auth";
import { Main } from "./pages/Main";

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <Box textAlign="center" fontSize="xl">
          <Grid minH="100vh" p={3}>
            <ColorModeSwitcher justifySelf="flex-end" />
            <Main />
          </Grid>
        </Box>
      </UserProvider>
    </ChakraProvider>
  );
};
