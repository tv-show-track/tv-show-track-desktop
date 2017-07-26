import styled from 'styled-components';

const ProgressionBar = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 8px;
  background-color: #171717;

  &::after {
    position: absolute;
    content: '';
    bottom: 0;
    left: 0;
    height: 8px;
    width: ${props => props.pc}%;
    background-color: #ff6161;
  }
`;

export default ProgressionBar;
