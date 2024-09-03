import { Box, BoxProps } from "ink";
import React from "react";
import { Cell } from "./cell.js";

type CellsColumnProps = {
  columnIndex: number;
  cells: string[];
  width: number;
  height: number;
} & BoxProps;

export const CellsColumn = ({
  columnIndex,
  cells,
  width,
  height,
  ...props
}: CellsColumnProps): React.JSX.Element => {
  return (
    <Box
      width={width}
      height={height}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      {cells.map((cell, rowIndex) => (
        <Cell
          key={`col_${columnIndex}_row_${rowIndex}`}
          width={width}
          height={Math.round(height / cell.length)}
          content={cell}
        />
      ))}
    </Box>
  );
};
