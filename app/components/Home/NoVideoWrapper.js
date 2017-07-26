import styled from 'styled-components';

const NoVideoWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;

  h2, h3 {
    text-align: center;
  }

  h3 {
    margin: 10px;
    font-weight: 100;
    font-size: 1em;
    letter-spacing: 2px;
  }

  p {
    margin-bottom: 0;
  }

  .red {
    color: #ff6161;
    font-weight: bold;
  }

  .title {
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

export default NoVideoWrapper;
