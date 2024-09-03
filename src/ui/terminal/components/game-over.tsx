import { Box, BoxProps, Text, TextProps } from "ink";
import React from "react";

type GameOverProps = {
  color?: TextProps["color"];
} & BoxProps;

export const GameOver = ({
  color,
  ...props
}: GameOverProps): React.JSX.Element => {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <Text color={color}>Game over!</Text>
    </Box>
  );
};
