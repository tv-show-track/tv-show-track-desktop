import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .react-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .react-tabs__tab-list {
      display: flex;
      margin-top: 0;
      padding: 0;
      border-bottom: 1px solid #232c39;

      .react-tabs__tab {
        padding: 4px 10px;

        &:hover {
          cursor: pointer;
        }

        &.react-tabs__tab--selected {
          border-bottom: 2px solid white;
        }
      }
    }

    .react-tabs__tab-panel {
      flex: initial;

      &.react-tabs__tab-panel--selected {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    }
  }

  .general {
    flex: 1;
  }

  .vlc {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  i {
    font-size: 1em;
    text-align: center;
    margin: 20px;
    margin-top: 10px;
  }
`;

export default Wrapper;
