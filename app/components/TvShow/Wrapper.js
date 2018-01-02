import styled from 'styled-components';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-image: url(${props => props.bgImage});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  h2 {
    text-align: center;
  }
`;

export default Wrapper;
