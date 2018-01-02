import styled from 'styled-components';

const Title = styled.div`
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
    position: absolute;
    background: none;
    content: attr(data-text);
    left: 0;
    text-shadow: 20px 6px 6px rgba(0, 0, 0, 0.33);
    top: 0;
    z-index: -1;
  }
`;

export default Title;
