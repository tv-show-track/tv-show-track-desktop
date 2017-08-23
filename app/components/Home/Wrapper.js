import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  display: flex;

  .settings {
    position: absolute;
    top: 10px;
    left: 10px;
  }

  .settings-warning {
    position: absolute;
    top: 10px;
    right: 10px;
    color: rgb(255, 198, 23);
  }
`;

export default Wrapper;
