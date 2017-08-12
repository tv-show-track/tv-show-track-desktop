import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

  .title {
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h2 {
      font-size: 2em;
      letter-spacing: 1px;
      background: -webkit-linear-gradient( 135deg, #FEB692 0%, #EA5455 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .back {
    position: absolute;
    top: 10px;
    left: 10px;
  }
`;

export default Wrapper;
