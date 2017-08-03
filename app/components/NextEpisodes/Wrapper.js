import styled from 'styled-components';

const Wrapper = styled.div`
  flex: 1;
  width: 100%;
  max-height: 60vh;
  display: flex;
  flex-direction: column;

  .next-episodes {
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
  }
`;

export default Wrapper;
