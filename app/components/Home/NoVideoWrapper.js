import styled from 'styled-components';

const NoVideoWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;

  h2, h3 {
    text-align: center;
  }

  h2 {
    position: relative;
    font-size: 2.6rem;
    letter-spacing: -0.1em;
    padding: 0 20px;
    word-spacing: 5px;
    ${''/* background: -webkit-linear-gradient(135deg, #ABDCFF 0%, #0396FF 100%); */}
    background: -webkit-linear-gradient( 135deg, #FEB692 0%, #EA5455 100%);
    background: -webkit-linear-gradient( 135deg, #43CBFF 0%, #9708CC 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    &::after {
      background: none;
      content: attr(data-text);
      left: 0;
      position: absolute;
      text-shadow: 20px 6px 6px rgba(0, 0, 0, 0.33);
      top: 0;
      z-index: -1;
    }
  }

  h3 {
    margin: 10px;
    font-weight: 100;
    font-size: 1em;
    letter-spacing: 2px;
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
