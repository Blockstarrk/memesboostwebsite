import React, { useState, useEffect, useContext } from 'react';
import { TokenContext } from './context/TokenContext';
import { supabase } from './supabaseConfig';
import './Airdrop.css';

function Airdrop() {
  const { airdrops } = useContext(TokenContext);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [xProfile, setXProfile] = useState('');
  const [tasks, setTasks] = useState([]);
  const shortenName = (name) => (name && name.length > 10 ? `${name.slice(0, 10)}...` : name || '');

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase.from('tasks').select('*').eq('is_active', true);
      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }
      setTasks(data);
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
      const { count } = await supabase.from('users').select('*', { count: 'exact' });
      if (count >= 222) {
        alert('User limit of 222 reached');
        setShowModal(false);
        return;
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('id, wallet_address, x_profile')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        sessionStorage.setItem('user', JSON.stringify(existingUser));
        setUser(existingUser);
        setShowModal(false);
        alert('Logged in successfully');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress, x_profile: xProfile })
        .select('id, wallet_address, x_profile')
        .single();

      if (error) throw error;

      sessionStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setShowModal(false);
      alert('Registered successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to register: ' + error.message);
    }
  };

  const handleBoost = async (airdropId) => {
    if (!user) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('points, last_boost_time')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const now = new Date();
      const lastBoostTime = userData.last_boost_time ? new Date(userData.last_boost_time) : null;

      if (lastBoostTime && now - lastBoostTime < 24 * 60 * 60 * 1000) {
        alert('You can only boost once per day.');
        return;
      }

      await supabase
        .from('users')
        .update({ points: userData.points + 1, last_boost_time: now.toISOString() })
        .eq('id', user.id);

      setUser({ ...user, points: userData.points + 1 });
      alert('Boost successful! +1 point');
    } catch (error) {
      console.error('Error boosting:', error);
      alert('Failed to boost: ' + error.message);
    }
  };

  const handleTaskComplete = async (taskId, taskPoints) => {
    if (!user) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('completed_tasks, points')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (userData.completed_tasks.includes(taskId)) {
        alert('Task already completed.');
        return;
      }

      await supabase
        .from('users')
        .update({
          points: userData.points + taskPoints,
          completed_tasks: [...userData.completed_tasks, taskId],
        })
        .eq('id', user.id);

      setUser({
        ...user,
        points: userData.points + taskPoints,
        completed_tasks: [...userData.completed_tasks, taskId],
      });
      alert(`Task completed! +${taskPoints} points`);
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task: ' + error.message);
    }
  };

  return (
    <div
      className="Iphone13142 font-poppins"
      style={{ width: 390, height: 1653, position: 'relative', background: '#FDD800', overflow: 'hidden' }}
    >
      <div
        style={{ width: 165, height: 12, left: 125, top: 44, position: 'absolute', color: 'black', fontSize: 18, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}
      >
        BOOST FOR AIRDROP
      </div>
      <button
        style={{
          width: 172,
          height: 48,
          left: 115,
          top: 94,
          position: 'absolute',
          background: 'linear-gradient(180deg, #F1B00C 0%, #FDD800 100%)',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={handleConnectWallet}
      >
        <div
          style={{ left: 8, top: 9, position: 'relative', color: 'black', fontSize: 20, fontFamily: 'Poppins', fontWeight: 700 }}
        >
          {user ? 'Connected' : 'Connect Wallet'}
        </div>
      </button>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 10, width: 300 }}>
            <h2 style={{ color: '#000', fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Enter Your Details</h2>
            <form onSubmit={handleSubmitProfile}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ color: '#000', fontFamily: 'Poppins', fontSize: 14, display: 'block', marginBottom: 5 }}>Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #ccc', fontFamily: 'Poppins' }}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ color: '#000', fontFamily: 'Poppins', fontSize: 14, display: 'block', marginBottom: 5 }}>X Profile Link</label>
                <input
                  type="text"
                  value={xProfile}
                  onChange={(e) => setXProfile(e.target.value)}
                  placeholder="https://x.com/username"
                  style={{ width: '100%', padding: 8, borderRadius: 5, border: '1px solid #ccc', fontFamily: 'Poppins' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(180deg, #F1B00C 0%, #FDD800 100%)',
                    color: '#000',
                    fontFamily: 'Poppins',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: 5,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#e73838',
                    color: '#fff',
                    fontFamily: 'Poppins',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: 5,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div
        style={{ left: 66, top: 184, position: 'absolute', color: 'black', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}
      >
        Complete all tasks and gain points to earn rewards for boosting!
      </div>
      {airdrops.length === 0 && (
        <div style={{ left: 47, top: 217, position: 'absolute', color: 'black', fontSize: 14, fontFamily: 'Poppins' }}>No airdrops added yet.</div>
      )}
      {airdrops.map((airdrop, index) => (
        <div key={airdrop.id} style={{ position: 'relative' }}>
          <div
            style={{ width: 296, height: 57, left: 47, top: 217 + index * 80, position: 'absolute', background: '#2F2828', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 10 }}
          />
          <div
            style={{ width: 46, height: 40, left: 58, top: 224 + index * 80, position: 'absolute', background: '#D9D9D9', borderRadius: 5 }}
          />
          <div
            style={{ width: 56, height: 39, left: 279, top: 224 + index * 80, position: 'absolute', background: 'black', borderRadius: 5 }}
          />
          <button
            style={{ left: 285, top: 240 + index * 80, position: 'absolute', color: '#FDD800', fontSize: 12, fontFamily: "'Luckiest Guy'", fontWeight: 400, background: 'transparent', border: 'none', cursor: 'pointer' }}
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
            style={{ width: 88, left: 113, top: 231 + index * 80, position: 'absolute', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}
          >
            <span style={{ color: 'white' }}>{shortenName(airdrop.name)} (</span>
            <a href={airdrop.telegramLink || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#1DFF38' }}>${airdrop.ticker}</a>
            <span style={{ color: 'white' }}>)</span>
          </div>
          <div
            style={{ width: 86, left: 115, top: 244 + index * 80, position: 'absolute', color: 'white', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}
          >
            Status: {airdrop.status}
          </div>
          <div
            style={{ left: 116, top: 256 + index * 80, position: 'absolute', color: 'white', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}
          >
            Chain: {airdrop.chain}
          </div>
        </div>
      ))}
      <div
        style={{ left: 168, top: 849, position: 'absolute', color: 'black', fontSize: 8, fontFamily: 'Poppins', fontWeight: 700 }}
      >
        Show More >
      </div>
      <div
        style={{ left: 142, top: 937, position: 'absolute', color: 'black', fontSize: 18, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}
      >
        SOCIALS TASKS
      </div>
      {tasks.map((task, index) => (
        <div key={task.id} style={{ position: 'relative' }}>
          <div
            style={{ width: 322, height: 52, left: 46, top: 978 + index * 70, position: 'absolute', background: '#DDB120', borderRadius: 10 }}
          />
          <a
            href={task.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleTaskComplete(task.id, task.points)}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{ left: 60, top: 997 + index * 70, position: 'absolute', color: 'black', fontSize: 18, fontFamily: "'Luckiest Guy'", fontWeight: 400 }}
            >
              {task.description}
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}

export default Airdrop;