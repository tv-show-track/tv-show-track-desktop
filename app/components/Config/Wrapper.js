import styled from 'styled-components';

const Wrapper = styled.div`
  .trakt-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    ul {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 10px;
      padding: 0;
    }

    li {
      display: flex;
      align-items: center;

      a {
        margin-left: 6px;
      }

      &.code-wrapper {
        flex-direction: column;
      }

      &:not(:last-child) {
        margin-bottom: 10px;
      }

      .code {
        font-size: 20px;
        margin: 4px 0;
        color: #0d6ffb;
        background-color: white;
        padding: 4px 10px;
        letter-spacing: 2px;
      }

      i {
        font-size: 0.8em;
      }
    }
  }
`;

export default Wrapper;
