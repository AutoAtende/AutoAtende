import styled, { createGlobalStyle } from 'styled-components'

export const Row = styled.div`
  display: ${({ display }) => display || 'grid'};
  margin-top: ${({ marginTop }) => marginTop || '0px'};
  margin: ${({ margin }) => margin};
  gap: ${({ gap }) => (gap ? gap + 'px' : '32px')};
  justify-content: ${({ justifyContent }) => justifyContent || 'space-between'};
  align-items: ${({ alignItems }) => alignItems};
  width: ${({ width }) => width};
  grid-column: ${({ gridColumn }) => gridColumn};
  grid-template-columns: ${({ columns }) =>
    `${columns} !important` || '1fr 1fr'};
  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: ${({ gap }) => (gap ? gap + 'px' : '32px')};
  }
`