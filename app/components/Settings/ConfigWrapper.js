import styled from 'styled-components';

const ConfigWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  & > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

export default ConfigWrapper;
