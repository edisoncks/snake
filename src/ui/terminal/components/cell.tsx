import { Box, BoxProps, Text } from "ink";
import React from "react";
import { SPRITES } from "../constants.js";

type CellProps = {
  content: string;
  width: number;
  height: number;
} & BoxProps;

const colors = {
  [SPRITES.apple]: "red",
  [SPRITES.snake]: "green",
  [SPRITES.void]: "white",
  [SPRITES.wall]: "white",
};

export const Cell = ({
  content,
  width,
  height,
  ...props
}: CellProps): React.JSX.Element => {
  return (
    <Box
      width={width}
      height={height}
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <Text color={colors[content] ?? "white"}>{content}</Text>
    </Box>
  );
};
