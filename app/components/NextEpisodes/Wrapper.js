import styled from 'styled-components';

const Wrapper = styled.div`
  flex: 1;
  width: 100%;
  max-height: 50vh;
  display: flex;
  flex-direction: column;

  .next-episodes {
    flex: 1;
    padding: 8px 0;
    overflow-y: auto;
    background-color: rgb(29, 35, 45);

    .next-episode {
      text-align: center;
      padding: 2px 0;
      font-size: 14px;
    }
  }
`;

export default Wrapper;
