/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { auth } from 'firebase';
import { createAssertWithPropsToMatchSnapshot } from '../../test-utils';
import AuthenticateContainer from './AuthenticateContainer';

jest.mock('firebase');

describe('AuthenticateContainer', () => {
  const defaultProps = {
    isAuthenticated: false,
    match: {
      isExact: true,
      path: '',
      url: '',
    },
  };
  const assertWithPropsToMatchSnapshot =
    createAssertWithPropsToMatchSnapshot(AuthenticateContainer.WrappedComponent, defaultProps);
  it('should render', () => {
    assertWithPropsToMatchSnapshot();
  });

  it('should render a Redirect when authenticated non-anonymously', () => {
    assertWithPropsToMatchSnapshot({
      isAuthenticated: true,
      isAnonymous: false,
    });
  });

  describe('updateFormByKey', () => {
    it('should return a function', () => {
      const inst = shallow(<AuthenticateContainer.WrappedComponent {...defaultProps} />).instance();
      const res = inst.updateFormByKey('key');
      expect(typeof res).toBe('function');
    });

    it('should return a function that calls setState with the key and target', () => {
      const key = 'key';
      const value = 'val';
      const inst = shallow(<AuthenticateContainer.WrappedComponent {...defaultProps} />).instance();
      inst.setState = jest.fn();
      const res = inst.updateFormByKey(key);
      res({ target: { value } });
      expect(inst.setState).toHaveBeenCalledWith({ key: value });
    });
  });

  describe('signIn', () => {
    it('should call setState with { error: false, loading: true } and a callback', () => {
      const inst = shallow(<AuthenticateContainer.WrappedComponent {...defaultProps} />).instance();
      inst.setState = jest.fn();
      inst.signIn();
      expect(inst.setState.mock.calls[0][0]).toEqual({ error: false, loading: true });
      expect(typeof inst.setState.mock.calls[0][1]).toBe('function');
    });

    describe('callback', () => {
      it('should call Auth.signIn, Auth.currentAuthenticatedUser, props.login, then set loading false', () => {
        const login = jest.fn();
        const wrapper =
          shallow(<AuthenticateContainer.WrappedComponent {...defaultProps} login={login} />);
        const inst = wrapper.instance();
        wrapper.setState({ email: 'user', password: 'password' });
        inst.setState = jest.fn();
        inst.signIn();
        const callback = inst.setState.mock.calls[0][1];
        callback();
        expect(auth().signInWithEmailAndPassword).toHaveBeenCalledWith('user', 'password');
      });
    });
  });
});
