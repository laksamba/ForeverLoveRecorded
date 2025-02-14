// App.jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ProposalContract from '../../blockchain/artifacts/contracts/Proposal.sol/Proposal.json';

export default function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [receiverAddress, setReceiverAddress] = useState('');
  const [nftURI, setNftURI] = useState('');

  // Contract Address & ABI
  const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const contractABI = ProposalContract.abi;

  // Connect Wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        setProvider(provider);
        setAccount(accounts[0]);
        setContract(contract);
        
        // Load initial data
        fetchProposals(contract);
        fetchNFTs(contract, accounts[0]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Fetch All Proposals
  const fetchProposals = async (contract) => {
    const count = await contract.proposalCount();
    const proposalsArray = [];
    
    for (let i = 0; i < count; i++) {
      const proposal = await contract.proposals(i);
      console.log("proposal ",proposal);
      
      proposalsArray.push({
        id: i,
        proposer: proposal.proposer,
        receiver: proposal.receiver,
        accepted: proposal.accepted,
        nftURI: proposal.nftURI
      });
    }
    
    setProposals(proposalsArray);
  };

  // Fetch User's NFTs
  const fetchNFTs = async (contract, address) => {
    const balance = await contract.balanceOf(address);
    const nftsArray = [];
    
    for (let i = 0; i < balance; i++) {
      const tokenId = await contract.tokenOfOwnerByIndex(address, i);
      const tokenURI = await contract.tokenURI(tokenId);
      nftsArray.push({ tokenId: tokenId.toString(), uri: tokenURI });
    }
    
    setNfts(nftsArray);
  };

  // Create Proposal
  const createProposal = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.makeProposal(receiverAddress, nftURI);
      await tx.wait();
      fetchProposals(contract);
      setReceiverAddress('');
      setNftURI('');
    } catch (error) {
      console.error(error);
    }
  };

  // Accept Proposal
  const acceptProposal = async (proposalId) => {
    try {
      const tx = await contract.acceptProposal(proposalId);
      await tx.wait();
      fetchProposals(contract);
      fetchNFTs(contract, account);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold">Proposal DApp</h1>
            {!account ? (
              <button 
                onClick={connectWallet}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Connect Wallet
              </button>
            ) : (
              <span className="text-gray-600">{account.slice(0, 6)}...{account.slice(-4)}</span>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Create Proposal Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Proposal</h2>
          <form onSubmit={createProposal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Receiver Address</label>
              <input
                type="text"
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">NFT URI</label>
              <input
                type="text"
                value={nftURI}
                onChange={(e) => setNftURI(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Create Proposal
            </button>
          </form>
        </div>

        {/* Proposals List */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">All Proposals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="border p-4 rounded-lg">
                <div className="mb-2">
                  <span className="font-semibold">Proposal ID:</span> {proposal.id}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">From:</span> {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">To:</span> {proposal.receiver.slice(0, 6)}...{proposal.receiver.slice(-4)}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Status:</span> 
                  <span className={`ml-2 ${proposal.accepted ? 'text-green-500' : 'text-yellow-500'}`}>
                    {proposal.accepted ? 'Accepted' : 'Pending'}
                  </span>
                </div>
                {!proposal.accepted && account.toLowerCase() === proposal.receiver.toLowerCase() && (
                  <button
                    onClick={() => acceptProposal(proposal.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Accept
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* User's NFTs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">My NFTs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <div key={nft.tokenId} className="border p-4 rounded-lg">
                <div className="mb-2">
                  <span className="font-semibold">Token ID:</span> {nft.tokenId}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">URI:</span> 
                  <a href={nft.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 ml-2">
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}