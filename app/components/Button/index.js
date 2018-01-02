import styled from 'styled-components';

const Button = styled.button`
  padding: 6px 20px;
  border-radius: 20px;
  border: 1px solid white;
  color: white;
  font-size: 0.9em;

  &:hover {
    background-color: white;
    color: black;
    cursor: pointer;
  }
`;

export default Button;
