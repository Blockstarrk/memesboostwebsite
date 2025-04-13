import React, { createContext, useState, useEffect } from 'react';

export const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('tokens');
    return saved ? JSON.parse(saved) : [];
  });
  const [communities, setCommunities] = useState(() => {
    const saved = localStorage.getItem('communities');
    return saved ? JSON.parse(saved) : [];
  });
  const [airdrops, setAirdrops] = useState(() => {
    const saved = localStorage.getItem('airdrops');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tokens', JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem('communities', JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem('airdrops', JSON.stringify(airdrops));
  }, [airdrops]);

  return (
    <TokenContext.Provider value={{ tokens, setTokens, communities, setCommunities, airdrops, setAirdrops }}>
      {children}
    </TokenContext.Provider>
  );
};