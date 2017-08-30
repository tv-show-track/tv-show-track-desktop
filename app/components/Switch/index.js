import styled from 'styled-components';

const Switch = styled.label`
  display: block;
  position: relative;
  margin-bottom: 10px;
  cursor: pointer;
  min-height: 16px;
  padding-left: 38px;
  text-transform: none;
  line-height: 16px;

  &.switch-align-right {
    padding-right: 38px;
    padding-left: 0;

    .indicator {
      right: 0;
      left: inherit;
    }
  }

  input {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: -1;

    &:checked ~ .indicator {
      box-shadow: none;
      background-color: #2BDE73;

      &::before {
        left: 14px;
        box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.2), 0 1px 1px rgba(16, 22, 26, 0.2);
      }
    }
  }

  .indicator {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    border: none;
    border-radius: 28px;
    box-shadow: none;
    background: rgba(167, 182, 194, 0.5);
    width: 28px;
    height: 16px;
    transition: background 100ms cubic-bezier(0.4, 1, 0.75, 0.9);

    &::before {
      position: relative;
      content: "";
      display: block;
      top: 2px;
      left: 2px;
      border-radius: 16px;
      box-shadow: 0 0 0 1px rgba(16, 22, 26, 0.2), 0 1px 1px rgba(16, 22, 26, 0.2);
      background: #ffffff;
      background-clip: padding-box;
      width: 12px;
      height: 12px;
      content: "";
      transition: left 100ms cubic-bezier(0.4, 1, 0.75, 0.9);
    }
  }
`;

export default Switch;
