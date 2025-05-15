import React from 'react';
import { Skeleton, TableRow, TableCell } from "@mui/material";

const TableRowsSkeletonLoading = ({ columns = 1, rows = 5 }) => {
  return (
    <>
      {Array(rows)
        .fill(0)
        .map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array(columns)
              .fill(0)
              .map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton animation="wave" />
                </TableCell>
              ))}
          </TableRow>
        ))}
    </>
  );
};

export default TableRowsSkeletonLoading;