import styled from 'styled-components';

const Wrapper = styled.div`
  flex: 1;
  width: 100%;
  max-height: 60vh;
  display: flex;
  flex-direction: column;

  .next-episodes {
    position: relative;
    flex: 1;
    overflow-y: auto;
    background-color: rgb(28, 31, 35);
    border-top: 1px solid rgb(28, 31, 35);

    .next-episode {
      text-align: center;
      padding: 4px 0;
      font-size: 14px;
      background: linear-gradient(rgb(29, 35, 45), rgb(28, 31, 35));
    }

    .connect-first {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 70%;
      text-align: center;
      font-size: 0.85em;
    }
  }
`;

export default Wrapper;
