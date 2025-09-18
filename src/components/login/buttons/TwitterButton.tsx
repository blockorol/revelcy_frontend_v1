import React from 'react';
import GreenButton from '@components/login/buttons/GreenButton';

export default function TwitterButton() { 
    const loginX = async() => {}

    return (
      <GreenButton
        buttonText='Continue with Twitter'
        onClick={loginX}
        icon="x-logo"
      />
  );
}
