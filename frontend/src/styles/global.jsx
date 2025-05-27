import { styled } from '@mui/material/styles';

export const Row = styled('div')(({ 
  theme,
  display = 'grid',
  marginTop = '0px',
  margin,
  gap = '32px',
  justifyContent = 'space-between',
  alignItems,
  width,
  gridColumn,
  columns
}) => ({
  display: display,
  marginTop: marginTop,
  margin: margin,
  gap: gap ? `${gap}px` : '32px',
  justifyContent: justifyContent,
  alignItems: alignItems,
  width: width,
  gridColumn: gridColumn,
  gridTemplateColumns: columns ? `${columns} !important` : '1fr 1fr',
  
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    flexDirection: 'column',
    gap: gap ? `${gap}px` : '32px'
  }
}));