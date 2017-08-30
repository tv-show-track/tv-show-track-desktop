import styled from 'styled-components';

const Wrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 160px;
  display: flex;
  flex-direction: column;

  .next-episodes {
    position: relative;
    flex: 1;
    overflow-y: auto;
    background-color: rgb(28, 31, 35);
    border-top: 1px solid rgb(28, 31, 35);
    border-bottom: 1px solid rgb(28, 31, 35);

    .next-episode {
      display: flex;
      min-height: 30px;
      max-height: 30px;
      padding: 4px 10px;
      font-size: 14px;
      background: linear-gradient(rgb(29, 35, 45), rgb(28, 31, 35));

      .episode-title {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        -webkit-user-select: text;

        & > div {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
        }
      }


      .set-episode-as-viewed {
        width: 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
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
