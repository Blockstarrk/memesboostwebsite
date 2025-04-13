import React, { useEffect, useState, useContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { TokenContext } from './context/TokenContext';
import Admin from './Admin';
import Airdrop from './Airdrop';
import './App.css';

import thunderbolt from './assets/thunderbolt.png';
import thunderboltsmall from './assets/thunderboltsmall.png';
import telegram from './assets/telegram.png';
import xlogo from './assets/xlogo.png';
let thunderboltairdrop;
try {
  thunderboltairdrop = require('./assets/thunderboltairdrop.png');
} catch (e) {
  console.warn('thunderboltairdrop.png not found');
}

const loadAds = () => {
  try {
    const context = require.context('./assets/ads', false, /\.(png|gif)$/);
    return context.keys().map((key) => context(key)).filter(Boolean);
  } catch (e) {
    return [];
  }
};

function MainApp() {
  const { tokens, communities, airdrops } = useContext(TokenContext);
  const [ads, setAds] = useState(loadAds());
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    console.log('App.js State - Tokens:', tokens);
    console.log('App.js State - Communities:', communities);
    console.log('App.js State - Airdrops:', airdrops);
  }, [tokens, communities, airdrops]);

  useEffect(() => {
    if (ads.length > 0) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  useEffect(() => {
    setAds(loadAds());
  }, []);

  const shortenName = (name) => name && name.length > 10 ? `${name.slice(0, 10)}...` : name || '';

  return (
    <div className="iphone-13-14 font-poppins" style={{ width: 390, height: 3448, position: 'relative', background: '#232020', overflow: 'visible' }}>
      <div style={{ width: 130, height: 26, left: 41, top: 49, position: 'absolute', color: 'white', fontSize: 20, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>MEMES BOOST</div>
      {thunderbolt && <img style={{ width: 30, height: 30, left: 11, top: 41, position: 'absolute', zIndex: 200 }} src={thunderbolt} alt="Thunderbolt" />}
      <div style={{ left: 70, top: 68, position: 'absolute', color: 'white', fontSize: 10, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>by coincoast</div>
      <div style={{ width: 102, height: 48, left: 271, top: 36, position: 'absolute', background: 'linear-gradient(180deg, #F1B00C 0%, #FDD800 100%)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10 }} />
      <a href="https://t.me/coincoast" target="_blank" rel="noopener noreferrer">
        {telegram && <img style={{ width: 41, height: 41, left: 325, top: 40, position: 'absolute', zIndex: 200, cursor: 'pointer' }} src={telegram} alt="Telegram" />}
      </a>
      <a href="https://x.com/coincoast" target="_blank" rel="noopener noreferrer">
        {xlogo && <img style={{ width: 39, height: 37, left: 278, top: 42, position: 'absolute', borderRadius: 110, zIndex: 200, cursor: 'pointer' }} src={xlogo} alt="X Logo" />}
      </a>
      <div style={{ width: 114, height: 62, left: 265, top: 29, position: 'absolute', background: 'rgba(217, 217, 217, 0.12)', borderRadius: 15 }} />
      <div style={{ width: 57, height: 0, left: 322, top: 34, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', borderTop: '1px solid black' }} />

      <div style={{ width: 283, height: 161, left: 56, top: 128, position: 'absolute', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 5, overflow: 'hidden' }}>
        {ads.length > 0 && <img src={ads[currentAdIndex]} alt={`Ad ${currentAdIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 5 }} />}
      </div>
      {[175, 195, 215].map((left, index) => (
        <div key={`indicator-${index}`} style={{ width: 6, height: 6, left, top: 302, position: 'absolute', background: currentAdIndex === index ? '#FDD800' : '#D9D9D9', borderRadius: 9999 }} />
      ))}

      <a href="https://t.me/coincoastbot" target="_blank" rel="noopener noreferrer">
        <div style={{ width: 129, height: 62, left: 136, top: 327, position: 'absolute', background: 'linear-gradient(180deg, #AF1616 0%, #E73838 100%)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10, cursor: 'pointer' }} />
        <div style={{ left: 151, top: 340, position: 'absolute', color: '#F0F0F0', fontSize: 18, fontFamily: "'Luckiest Guy'", fontWeight: 400, lineHeight: '21.26px' }}>
          Subscribe<br />To Bot Ping
        </div>
      </a>
      <a href="https://forms.gle/your-token-ads-form" target="_blank" rel="noopener noreferrer">
        <div style={{ width: 98, height: 43, left: 153, top: 400, position: 'absolute', background: 'linear-gradient(180deg, #F1B30B 0%, #B4A00E 100%)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10, cursor: 'pointer' }} />
        <div style={{ width: 79, left: 166, top: 415, position: 'absolute', color: 'black', fontSize: 15, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>TOKEN ADS</div>
      </a>

      <div style={{ width: 201, height: 18, left: 107, top: 493, position: 'absolute', color: 'white', fontSize: 18, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>TOP 10 BOOSTED TOKENS</div>
      {tokens.length === 0 && (
        <div style={{ left: 48, top: 520, position: 'absolute', color: 'white', fontSize: 14, fontFamily: 'Poppins' }}>No tokens added yet.</div>
      )}
      {tokens.map((token, index) => (
        <div key={token.id} style={{ position: 'relative' }}>
          <div style={{ width: 16, height: 19, left: 26 + (index < 2 ? 1 : 0), top: 555 + index * 60, position: 'absolute', color: 'white', fontSize: 10, fontFamily: index < 7 ? 'Inter' : 'Poppins', fontWeight: 700 }}>{token.position}</div>
          <div style={{ width: 320, height: 42, left: 48, top: 542 + index * 60, position: 'absolute', background: '#2F2828', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10 }} />
          <div style={{ width: 250, left: 61, top: 556 + index * 60, position: 'absolute', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}>
            <span style={{ color: 'white' }}>{shortenName(token.name)} (</span>
            <a href={token.telegramLink || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#1DFF38' }}>${token.ticker}</a>
            <span style={{ color: 'white' }}>) . Mcap </span>
            <span style={{ color: '#1DFF38' }}>{token.mcap || 'N/A'}</span>
            <span style={{ color: 'white' }}> . Liq </span>
            <span style={{ color: '#1DFF38' }}>{token.liq || 'N/A'}</span>
            <span style={{ color: 'white' }}> . Vol </span>
            <span style={{ color: '#1DFF38' }}>{token.vol || 'N/A'}</span>
          </div>
          {thunderboltsmall && <img style={{ width: 11, height: 11, left: 326, top: 556 + index * 60, position: 'absolute', zIndex: 200 }} src={thunderboltsmall} alt="Thunderbolt Small" />}
          <div style={{ width: 23, left: 337, top: 555 + index * 60, position: 'absolute', color: '#FDD800', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}>{token.boosts}</div>
        </div>
      ))}
      <div style={{ width: 390, height: 0, left: 0, top: 1183, position: 'absolute', borderTop: '1px solid white' }} />

      <div style={{ width: 236, height: 12, left: 77, top: 1235, position: 'absolute', color: 'white', fontSize: 18, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>TOP TRENDING COMMUNITIES</div>
      <div style={{ width: 93, height: 29, left: 260, top: 1280, position: 'absolute', opacity: 0.1, background: '#D9D9D9', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 5 }} />
      {['30M', '1h', '12H', '1D'].map((label, index) => (
        <div key={label} style={{ left: 339 - index * 25, top: 1289, position: 'absolute', color: 'white', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}>{label}</div>
      ))}
      {communities.length === 0 && (
        <div style={{ left: 46, top: 1310, position: 'absolute', color: 'white', fontSize: 14, fontFamily: 'Poppins' }}>No communities added yet.</div>
      )}
      {communities.map((community, index) => (
        <div key={community.id} style={{ position: 'relative' }}>
          <div style={{ width: 16, height: 19, left: 24 + (index < 2 ? 1 : 0), top: 1344 + index * 60, position: 'absolute', color: 'white', fontSize: 10, fontFamily: index < 7 ? 'Inter' : 'Poppins', fontWeight: 700 }}>{community.position}</div>
          <div style={{ width: 320, height: 42, left: 46, top: 1331 + index * 60, position: 'absolute', background: '#2F2828', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10 }} />
          <div style={{ width: 250, left: 59, top: 1345 + index * 60, position: 'absolute', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}>
            <span style={{ color: 'white' }}>{shortenName(community.name)} (</span>
            <a href={community.telegramLink || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#1DFF38' }}>${community.ticker}</a>
            <span style={{ color: 'white' }}>) . Mcap </span>
            <span style={{ color: '#1DFF38' }}>{community.mcap || 'N/A'}</span>
            <span style={{ color: 'white' }}> . Liq </span>
            <span style={{ color: '#1DFF38' }}>{community.liq || 'N/A'}</span>
            <span style={{ color: 'white' }}> . Vol </span>
            <span style={{ color: '#1DFF38' }}>{community.vol || 'N/A'}</span>
          </div>
          {thunderboltsmall && <img style={{ width: 11, height: 11, left: 324, top: 1345 + index * 60, position: 'absolute', zIndex: 200 }} src={thunderboltsmall} alt="Thunderbolt Small" />}
          <div style={{ width: 23, left: 335, top: 1344 + index * 60, position: 'absolute', color: '#FDD800', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}>{community.boosts}</div>
        </div>
      ))}
      <div style={{ width: 390, height: 0, left: 1, top: 1965, position: 'absolute', borderTop: '1px solid white' }} />

      <div style={{ width: 165, height: 12, left: 123, top: 1989, position: 'absolute', color: 'white', fontSize: 18, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>BOOST FOR AIRDROP</div>
      <div style={{ width: 172, height: 48, left: 113, top: 2039, position: 'absolute', background: 'linear-gradient(180deg, #F1B00C 0%, #FDD800 100%)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10 }} />
      <div style={{ left: 121, top: 2048, position: 'absolute', color: 'black', fontSize: 20, fontFamily: 'Poppins', fontWeight: 700 }}>Connect Wallet</div>
      <div style={{ left: 64, top: 2129, position: 'absolute', color: 'white', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}>Complete all tasks and gain points to earn rewards for boosting!</div>
      {airdrops.length === 0 && (
        <div style={{ left: 33, top: 2162, position: 'absolute', color: 'white', fontSize: 14, fontFamily: 'Poppins' }}>No airdrops added yet.</div>
      )}
      {airdrops.map((airdrop, index) => (
        <div key={airdrop.id} style={{ position: 'relative' }}>
          <div style={{ width: 320, height: 57, left: 33, top: 2162 + index * 80, position: 'absolute', background: '#2F2828', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10 }} />
          <div style={{ width: 46, height: 40, left: 44, top: 2169 + index * 80, position: 'absolute', background: '#D9D9D9', borderRadius: 5 }} />
          <div style={{ width: 56, height: 39, left: 265, top: 2169 + index * 80, position: 'absolute', background: 'black', borderRadius: 5 }} />
          <div style={{ left: 271, top: 2185 + index * 80, position: 'absolute', color: '#FDD800', fontSize: 12, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>Boost</div>
          {thunderboltairdrop && <img style={{ width: 15, height: 15, left: 303, top: 2181 + index * 80, position: 'absolute', zIndex: 200 }} src={thunderboltairdrop} alt="Thunderbolt Airdrop" />}
          <div style={{ width: 100, left: 99, top: 2176 + index * 80, position: 'absolute', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}>
            <span style={{ color: 'white' }}>{shortenName(airdrop.name)} (</span>
            <a href={airdrop.telegramLink || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#1DFF38' }}>${airdrop.ticker}</a>
            <span style={{ color: 'white' }}>)</span>
          </div>
          <div style={{ width: 86, left: 101, top: 2189 + index * 80, position: 'absolute', color: 'white', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}>Status: {airdrop.status}</div>
          <div style={{ left: 102, top: 2201 + index * 80, position: 'absolute', color: 'white', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}>Chain: {airdrop.chain}</div>
        </div>
      ))}
      <div style={{ left: 186, top: 1932, position: 'absolute', color: 'white', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}>Show More ></div>
      <Link to="/airdrop">
        <div style={{ width: 180, height: 12, left: 112, top: 2485, position: 'absolute', color: 'white', fontSize: 18, fontFamily: "'Luckiest Guy'", fontWeight: 400, cursor: 'pointer' }}>GO TO AIRDROP PAGE</div>
        <div style={{ left: 105, top: 2504, position: 'absolute', color: 'white', fontSize: 18, fontFamily: "'Luckiest Guy'", fontWeight: 400, cursor: 'pointer' }}>TO EARN MORE POINTS</div>
      </Link>
      <div style={{ width: 390, height: 0, left: 1, top: 2565, position: 'absolute', borderTop: '1px solid white' }} />

      <div style={{ width: 95, height: 27, left: 148, top: 2607, position: 'absolute', color: 'white', fontSize: 30, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>ABOUT</div>
      <div style={{ width: 317, left: 36, top: 2652, position: 'absolute', textAlign: 'center', fontSize: 18 }}>
        <span style={{ color: 'white', fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>MEMES BOOST</span>
        <span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 600 }}> by </span>
        <span style={{ color: '#FDD800', fontFamily: 'Poppins', fontWeight: 600 }}>coincoast</span>
        <span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 600 }}>
          {' '}is a telegram bot built to allow communities boost their token for<br />free! , you boost by voting and rank up the token trends top list for active communities!
        </span>
      </div>

      <div style={{ left: 173, top: 2897, position: 'absolute', color: 'white', fontSize: 30, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>FAQ</div>
      <div style={{ left: 46, top: 2937, position: 'absolute', fontSize: 15 }}>
        <span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 700 }}>Do we have the memes boost on discord?</span>
        <span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 400 }}><br />Answer: not yet, but soon.</span>
      </div>
      <div style={{ left: 46, top: 3004, position: 'absolute', fontSize: 15 }}>
        <span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 700 }}>How much is the pricing for token ads?</span>
        <span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 400 }}><br />Answer: fill up the token ads form and<br />see the price list</span>
      </div>
      <div style={{ left: 46, top: 3099, position: 'absolute', fontSize: 15 }}>
        <span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 700 }}>Are we launching a token?</span>
        <span style={{ color: 'white', fontFamily: 'Poppins', fontWeight: 400 }}><br />Answer: yes, and will be announced<br />on our main page and main telegram community</span>
      </div>

      <a href="https://forms.gle/your-token-ads-form" target="_blank" rel="noopener noreferrer">
        <div style={{ width: 195, height: 48, left: 103, top: 3229, position: 'absolute', background: 'linear-gradient(180deg, #F1B00C 0%, #FDD800 100%)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10, cursor: 'pointer' }} />
        <div style={{ left: 112, top: 3248, position: 'absolute', color: 'black', fontSize: 15, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>Advertise YOUR TOKEN</div>
      </a>
      <div style={{ width: 102, height: 48, left: 152, top: 3293, position: 'absolute', background: 'linear-gradient(180deg, #F1B00C 0%, #FDD800 100%)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10 }} />
      <a href="https://x.com/coincoast" target="_blank" rel="noopener noreferrer">
        {xlogo && <img style={{ width: 39, height: 37, left: 159, top: 3299, position: 'absolute', borderRadius: 110, zIndex: 200, cursor: 'pointer' }} src={xlogo} alt="X Logo Footer" />}
      </a>
      <a href="https://t.me/coincoast" target="_blank" rel="noopener noreferrer">
        {telegram && <img style={{ width: 41, height: 41, left: 206, top: 3297, position: 'absolute', zIndex: 200, cursor: 'pointer' }} src={telegram} alt="Telegram Footer" />}
      </a>
      <div style={{ width: 114, height: 62, left: 146, top: 3286, position: 'absolute', background: 'rgba(217, 217, 217, 0.12)', borderRadius: 15 }} />
      <div style={{ width: 57, height: 0, left: 203, top: 3291, position: 'absolute', transform: 'rotate(90deg)', transformOrigin: 'top left', borderTop: '1px solid black' }} />
      <div style={{ width: 18, height: 23, left: 114, top: 3389, position: 'absolute', color: 'white', fontSize: 30, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>©</div>
      <div style={{ left: 132, top: 3389, position: 'absolute', color: '#F7D718', fontSize: 30, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}>Coincoast</div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/airdrop" element={<Airdrop />} />
    </Routes>
  );
}

export default App;