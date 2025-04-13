import React, { useState, useContext, useEffect } from 'react';
import { TokenContext } from './context/TokenContext';
import { supabase } from './supabaseConfig';
import './Admin.css';

const formatNumber = (num) => {
  if (!num) return 'N/A';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

function Admin() {
  const { tokens, setTokens, communities, setCommunities, airdrops, setAirdrops } = useContext(TokenContext);
  const [adminForm, setAdminForm] = useState({
    contractAddress: '',
    name: '',
    ticker: '',
    position: '',
    section: 'tokens',
    boosts: '',
    status: '',
    chain: '',
    telegramLink: '',
  });
  const [taskForm, setTaskForm] = useState({
    description: '',
    link: '',
    points: '',
  });
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }
      setTasks(data);
    };

    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      setUsers(data);
    };

    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTokenData = async (contractAddress) => {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`);
      const data = await response.json();
      const pair = data.pairs && data.pairs[0];
      if (pair) {
        return {
          name: pair.baseToken.name || 'Unknown',
          ticker: pair.baseToken.symbol || 'N/A',
          mcap: formatNumber(pair.fdv),
          liq: formatNumber(pair.liquidity?.usd),
          vol: formatNumber(pair.volume?.h24),
        };
      }
      return null;
    } catch (e) {
      console.error(`Error fetching ${contractAddress}:`, e);
      return null;
    }
  };

  const handleAddToken = async (e) => {
    e.preventDefault();
    const { contractAddress, name, ticker, position, section, boosts, status, chain, telegramLink } = adminForm;

    if (!position || !boosts || !telegramLink) {
      alert('Please fill in Position, Boosts, and Telegram Link');
      return;
    }

    let newToken;
    if (section === 'airdrops') {
      if (!name || !ticker || !status || !chain) {
        alert('Please fill in Name, Ticker, Status, and Chain for airdrops');
        return;
      }
      newToken = {
        id: Date.now(),
        position: Number(position),
        boosts: Number(boosts),
        name,
        ticker,
        status,
        chain,
        telegramLink,
      };
    } else {
      if (!contractAddress) {
        alert('Please fill in Contract Address for tokens or communities');
        return;
      }
      const tokenInfo = await fetchTokenData(contractAddress);
      if (!tokenInfo) {
        alert('Failed to fetch token data. Check contract address.');
        return;
      }
      newToken = {
        id: Date.now(),
        contractAddress,
        position: Number(position),
        boosts: Number(boosts),
        telegramLink,
        ...tokenInfo,
      };
    }

    if (section === 'tokens') {
      setTokens((prev) => [...prev, newToken].sort((a, b) => a.position - b.position));
    } else if (section === 'communities') {
      setCommunities((prev) => [...prev, newToken].sort((a, b) => a.position - b.position));
    } else if (section === 'airdrops') {
      setAirdrops((prev) => [...prev, newToken].sort((a, b) => a.position - b.position));
    }

    setAdminForm({ contractAddress: '', name: '', ticker: '', position: '', section: 'tokens', boosts: '', status: '', chain: '', telegramLink: '' });
  };

  const handleDeleteToken = (id, section) => {
    if (section === 'tokens') {
      setTokens((prev) => prev.filter((token) => token.id !== id));
    } else if (section === 'communities') {
      setCommunities((prev) => prev.filter((community) => community.id !== id));
    } else if (section === 'airdrops') {
      setAirdrops((prev) => prev.filter((airdrop) => airdrop.id !== id));
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const { description, link, points } = taskForm;

    if (!description || !link || !points) {
      alert('Please fill in all task fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ description, link, points: Number(points), is_active: true })
        .select('*')
        .single();
      if (error) throw error;
      setTasks((prev) => [...prev, data]);
      setTaskForm({ description: '', link: '', points: '' });
      alert('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task: ' + error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      alert('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task: ' + error.message);
    }
  };

  const handleToggleTaskStatus = async (taskId, isActive) => {
    try {
      const { error } = await supabase.from('tasks').update({ is_active: !isActive }).eq('id', taskId);
      if (error) throw error;
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, is_active: !isActive } : task))
      );
      alert(`Task ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling task status:', error);
      alert('Failed to toggle task status: ' + error.message);
    }
  };

  const shortenName = (name) => (name && name.length > 10 ? `${name.slice(0, 10)}...` : name || '');

  return (
    <div className="admin-page font-poppins max-w-4xl mx-auto p-5 bg-[#232020] text-white min-h-screen">
      <h1 className="text-3xl font-luckiest text-[#fdd800] text-center mb-5">Memes Boost Admin Panel</h1>
      <h2 className="text-2xl font-luckiest text-[#fdd800] mt-8 mb-3">Add Token/Community/Airdrop</h2>
      <form onSubmit={handleAddToken} className="admin-form bg-[#2f2828] p-5 rounded-lg shadow-md mb-5 space-y-4">
        {adminForm.section !== 'airdrops' && (
          <div className="flex items-center gap-2">
            <label className="w-24 text-white font-semibold">Contract Address:</label>
            <input
              type="text"
              value={adminForm.contractAddress}
              onChange={(e) => setAdminForm({ ...adminForm, contractAddress: e.target.value })}
              placeholder="0x..."
              className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
            />
          </div>
        )}
        {adminForm.section === 'airdrops' && (
          <>
            <div className="flex items-center gap-2">
              <label className="w-24 text-white font-semibold">Name:</label>
              <input
                type="text"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                placeholder="Token Name"
                className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-white font-semibold">Ticker:</label>
              <input
                type="text"
                value={adminForm.ticker}
                onChange={(e) => setAdminForm({ ...adminForm, ticker: e.target.value })}
                placeholder="TICKER"
                className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
              />
            </div>
          </>
        )}
        <div className="flex items-center gap-2">
          <label className="w-24 text-white font-semibold">Position:</label>
          <input
            type="number"
            value={adminForm.position}
            onChange={(e) => setAdminForm({ ...adminForm, position: e.target.value })}
            min="1"
            className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-white font-semibold">Section:</label>
          <select
            value={adminForm.section}
            onChange={(e) => setAdminForm({ ...adminForm, section: e.target.value })}
            className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
          >
            <option value="tokens">Tokens</option>
            <option value="communities">Communities</option>
            <option value="airdrops">Airdrops</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-white font-semibold">Boosts:</label>
          <input
            type="number"
            value={adminForm.boosts}
            onChange={(e) => setAdminForm({ ...adminForm, boosts: e.target.value })}
            min="0"
            className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-white font-semibold">Telegram Link:</label>
          <input
            type="text"
            value={adminForm.telegramLink}
            onChange={(e) => setAdminForm({ ...adminForm, telegramLink: e.target.value })}
            placeholder="https://t.me/..."
            className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
          />
        </div>
        {adminForm.section === 'airdrops' && (
          <>
            <div className="flex items-center gap-2">
              <label className="w-24 text-white font-semibold">Status:</label>
              <input
                type="text"
                value={adminForm.status}
                onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value })}
                placeholder="Pre Launch"
                className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-white font-semibold">Chain:</label>
              <input
                type="text"
                value={adminForm.chain}
                onChange={(e) => setAdminForm({ ...adminForm, chain: e.target.value })}
                placeholder="ETH"
                className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
              />
            </div>
          </>
        )}
        <button type="submit" className="bg-gradient-to-b from-[#f1b00c] to-[#fdd800] text-black font-semibold py-2 px-4 rounded-md hover:from-[#fdd800] hover:to-[#f1b00c] self-end">Add Token</button>
      </form>

      <h2 className="text-2xl font-luckiest text-[#fdd800] mt-8 mb-3">Manage Social Tasks</h2>
      <form onSubmit={handleAddTask} className="admin-form bg-[#2f2828] p-5 rounded-lg shadow-md mb-5 space-y-4">
        <div className="flex items-center gap-2">
          <label className="w-24 text-white font-semibold">Description:</label>
          <input
            type="text"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="Follow @coincoast"
            className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-white font-semibold">Link:</label>
          <input
            type="text"
            value={taskForm.link}
            onChange={(e) => setTaskForm({ ...taskForm, link: e.target.value })}
            placeholder="https://x.com/coincoast"
            className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-white font-semibold">Points:</label>
          <input
            type="number"
            value={taskForm.points}
            onChange={(e) => setTaskForm({ ...taskForm, points: e.target.value })}
            min="1"
            className="p-2 rounded-md bg-[#d9d9d9] text-black w-48"
          />
        </div>
        <button type="submit" className="bg-gradient-to-b from-[#f1b00c] to-[#fdd800] text-black font-semibold py-2 px-4 rounded-md hover:from-[#fdd800] hover:to-[#f1b00c] self-end">Add Task</button>
      </form>

      <h2 className="text-2xl font-luckiest text-[#fdd800] mt-8 mb-3">Current Tasks</h2>
      <div className="overflow-x-auto">
        <table className="admin-table w-full bg-[#2f2828] rounded-lg">
          <thead>
            <tr className="bg-[#fdd800] text-black font-semibold">
              <th className="p-2">ID</th>
              <th className="p-2">Description</th>
              <th className="p-2">Link</th>
              <th className="p-2">Points</th>
              <th className="p-2">Active</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-[#d9d9d9]">
                <td className="p-2">{task.id}</td>
                <td className="p-2">{task.description}</td>
                <td className="p-2"><a href={task.link} target="_blank" rel="noopener noreferrer">{task.link}</a></td>
                <td className="p-2">{task.points}</td>
                <td className="p-2">{task.is_active ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleToggleTaskStatus(task.id, task.is_active)}
                    className="bg-[#f1b00c] text-black py-1 px-2 rounded-md hover:bg-[#fdd800] mr-2"
                  >
                    {task.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-[#e73838] text-white py-1 px-2 rounded-md hover:bg-[#af1616]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-luckiest text-[#fdd800] mt-8 mb-3">Registered Users</h2>
      <div className="overflow-x-auto">
        <table className="admin-table w-full bg-[#2f2828] rounded-lg">
          <thead>
            <tr className="bg-[#fdd800] text-black font-semibold">
              <th className="p-2">ID</th>
              <th className="p-2">Wallet Address</th>
              <th className="p-2">X Profile</th>
              <th className="p-2">Points</th>
              <th className="p-2">Last Boost</th>
              <th className="p-2">Completed Tasks</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[#d9d9d9]">
                <td className="p-2">{user.id}</td>
                <td className="p-2">{user.wallet_address}</td>
                <td className="p-2"><a href={user.x_profile} target="_blank" rel="noopener noreferrer">{user.x_profile}</a></td>
                <td className="p-2">{user.points || 0}</td>
                <td className="p-2">{user.last_boost_time ? new Date(user.last_boost_time).toLocaleString() : '-'}</td>
                <td className="p-2">{user.completed_tasks.length ? user.completed_tasks.join(', ') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;