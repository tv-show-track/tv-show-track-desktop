import Button from '../Button';

const Wrapper = Button.extend`
  padding: 3px 10px;
  font-size: 0.8em;
  color: #5f8aee;
  border-color: #5f8aee;

  &:hover {
    background-color: #5f8aee;
    color: white;
  }
`;

export default Wrapper;
