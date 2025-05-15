import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  > img {
    width: 56px;
  }

  > p {
    font-weight: 500;
    font-size: 20px;
    line-height: 25px;
    white-space: pre-wrap;

    color: #6A6A6A;
    text-align: center;

    max-width: 522px;
  }

  > * + * {
    margin-top: 24px;
  }
`
