import React, { useState, useEffect, useContext } from 'react';
import { TokenContext } from './context/TokenContext';
import './Airdrop.css';

function Airdrop() {
  const { airdrops } = useContext(TokenContext);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [xProfile, setXProfile] = useState('');
  const [tasks, setTasks] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const shortenName = (name) => (name && name.length > 10 ? `${name.slice(0, 10)}...` : name || '');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log('Airdrop.js: Fetching tasks...');
        const response = await fetch(`${API_BASE_URL}/api/tasks`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch tasks');
        setTasks(data);
        console.log('Airdrop.js: Tasks fetched:', data);
      } catch (err) {
        console.error('Airdrop.js: Error fetching tasks:', err.message);
        setTasks([]);
      }
    };
    fetchTasks();

    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleConnectWallet = () => {
    if (user) {
      alert('Already connected!');
      return;
    }
    setShowModal(true);
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (!walletAddress || !xProfile) {
      alert('Please enter both wallet address and X profile link');
      return;
    }

    try {
      console.log('Airdrop.js: Submitting profile:', { walletAddress, xProfile });
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress, x_profile: xProfile }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to register');

      sessionStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setShowModal(false);
      alert(response.status === 201 ? 'Registered successfully' : 'Logged in successfully');
    } catch (error) {
      console.error('Airdrop.js: Error submitting profile:', error.message);
      alert('Failed to register: ' + error.message);
    }
  };

  const handleBoost = async (airdropId) => {
    if (!user) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      console.log('Airdrop.js: Boosting airdrop:', airdropId);
      const response = await fetch(`${API_BASE_URL}/api/boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to boost');

      setUser({ ...user, points: data.points });
      alert('Boost successful! +1 point');
    } catch (error) {
      console.error('Airdrop.js: Error boosting:', error.message);
      alert('Failed to boost: ' + error.message);
    }
  };

  const handleTaskComplete = async (taskId, taskPoints) => {
    if (!user) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      console.log('Airdrop.js: Completing task:', taskId);
      const response = await fetch(`${API_BASE_URL}/api/tasks/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, task_id: taskId, task_points: taskPoints }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to complete task');

      setUser({ ...user, points: data.points, completed_tasks: data.completed_tasks });
      alert(`Task completed! +${taskPoints} points`);
    } catch (error) {
      console.error('Airdrop.js: Error completing task:', error.message);
      alert('Failed to complete task: ' + error.message);
    }
  };

  return (
    <div className="Iphone13142 font-poppins">
      <div className="BoostForAirdrop" style={{ left: 125, top: 44, position: 'absolute' }}>
        BOOST FOR AIRDROP
      </div>
      <button
        className="Top1boosted"
        style={{ left: 115, top: 94, position: 'absolute' }}
        onClick={handleConnectWallet}
      >
        <div className="ConnectWallet" style={{ left: 8, top: 9, position: 'relative' }}>
          {user ? 'Connected' : 'Connect Wallet'}
        </div>
      </button>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enter Your Details</h2>
            <form onSubmit={handleSubmitProfile}>
              <div>
                <label>Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div>
                <label>X Profile Link</label>
                <input
                  type="text"
                  value={xProfile}
                  onChange={(e) => setXProfile(e.target.value)}
                  placeholder="https://x.com/username"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="submit">Submit</button>
                <button type="button" className="cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div
        className="CompleteAllTasksAndGainPointsToEarnRewardsForBoosting"
        style={{ left: 66, top: 184, position: 'absolute' }}
      >
        Complete all tasks and gain points to earn rewards for boosting!
      </div>
      {airdrops.length === 0 && (
        <div style={{ left: 47, top: 217, position: 'absolute', color: 'black', fontSize: 14, fontFamily: 'Poppins' }}>
          No airdrops available.
        </div>
      )}
      {airdrops.map((airdrop, index) => (
        <div key={airdrop.id} style={{ position: 'relative' }}>
          <div
            style={{
              width: 296,
              height: 57,
              left: 47,
              top: 217 + index * 80,
              position: 'absolute',
              background: '#2F2828',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: 10,
            }}
          />
          <div
            style={{
              width: 46,
              height: 40,
              left: 58,
              top: 224 + index * 80,
              position: 'absolute',
              background: '#D9D9D9',
              borderRadius: 5,
            }}
          />
          <div
            style={{
              width: 56,
              height: 39,
              left: 279,
              top: 224 + index * 80,
              position: 'absolute',
              background: 'black',
              borderRadius: 5,
            }}
          />
          <button
            style={{
              left: 285,
              top: 240 + index * 80,
              position: 'absolute',
              color: '#FDD800',
              fontSize: 12,
              fontFamily: "'Luckiest Guy'",
              fontWeight: 400,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => handleBoost(airdrop.id)}
          >
            Boost
          </button>
          <img
            style={{ width: 15, height: 15, left: 317, top: 236 + index * 80, position: 'absolute' }}
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEASURBVHgBtZE9SwNBEIZnL9n1vOqKFCGg2QiCBIsgYmVro50/QOys/A3qrxGsFO0sbBSLhBQhkCKEfEECaXJcIMdyd/smkCaEHJcc5Cln3mcYZoh2yfg1K6N6BsVgcXGXSFbl81OmUUgkp7z+J5T62FpG7eIBWklhXVWiMmxd0fsnKTInf+GgE/oj/5FbhtTKbJm3k6/lXHqdzA9KT6Q6OSMDMm39HjjAHk0KsWtjWCwy8u8DNXV0CsB8fOCmX9gNdSmOcf24NPxZ/DbsHbbVL2/Ttrito0u/mQWqdj4qE3ntfS6uA9d9ZmdO/LqreNXcNyUBDVtiYOYpCcCb2CQ3A1bbW8nFxlq5AAAAAElFTkSuQmCC"
            alt="Thunderbolt"
          />
          <div
            style={{
              width: 88,
              left: 113,
              top: 231 + index * 80,
              position: 'absolute',
              fontSize: 8,
              fontFamily: 'Poppins',
              fontWeight: 700,
            }}
          >
            <span style={{ color: 'white' }}>{shortenName(airdrop.name)} (</span>
            <a href={airdrop.telegramLink || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#1DFF38' }}>
              ${airdrop.ticker}
            </a>
            <span style={{ color: 'white' }}>)</span>
          </div>
          <div
            style={{
              width: 86,
              left: 115,
              top: 244 + index * 80,
              position: 'absolute',
              color: 'white',
              fontSize: 8,
              fontFamily: 'Poppins',
              fontWeight: 700,
            }}
          >
            Status: {airdrop.status}
          </div>
          <div
            style={{
              left: 116,
              top: 256 + index * 80,
              position: 'absolute',
              color: 'white',
              fontSize: 8,
              fontFamily: 'Poppins',
              fontWeight: 700,
            }}
          >
            Chain: {airdrop.chain}
          </div>
        </div>
      ))}
      <div className="ShowMore" style={{ left: 168, top: 849, position: 'absolute' }}>
        Show More >
      </div>
      <div className="SocialsTasks" style={{ left: 142, top: 937, position: 'absolute' }}>
        SOCIALS TASKS
      </div>
      {tasks.length === 0 ? (
        <div style={{ left: 60, top: 978, position: 'absolute', color: 'black', fontSize: 14, fontFamily: 'Poppins' }}>
          No tasks available.
        </div>
      ) : (
        tasks.map((task, index) => (
          <div key={task.id} style={{ position: 'relative' }}>
            <div
              style={{
                width: 322,
                height: 52,
                left: 46,
                top: 978 + index * 70,
                position: 'absolute',
                background: '#DDB120',
                borderRadius: 10,
              }}
            />
            <a
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTaskComplete(task.id, task.points)}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  left: 60,
                  top: 997 + index * 70,
                  position: 'absolute',
                  color: 'black',
                  fontSize: 18,
                  fontFamily: "'Luckiest Guy'",
                  fontWeight: 400,
                }}
              >
                {task.description}
              </div>
            </a>
          </div>
        ))
      )}
    </div>
  );
}

export default Airdrop;