"use client"

import { useState } from "react"

const ProposalPage = ({ contract, userAddress }) => {
  const [recipient, setRecipient] = useState("")
  const [proposalStatus, setProposalStatus] = useState(null)
  const [nftUrl, setNftUrl] = useState(null)

  const propose = async () => {
    try {
      const transaction = await contract.propose(recipient)
      await transaction.wait()
      alert("Proposal Sent!")
    } catch (error) {
      console.error(error)
      alert("Error sending proposal")
    }
  }

  const acceptProposal = async () => {
    try {
      const transaction = await contract.acceptProposal(userAddress)
      await transaction.wait()

      const tokenId = await contract.tokenIdCounter()
      const tokenURI = await contract.tokenURI(tokenId)

      setProposalStatus("Accepted")
      setNftUrl(tokenURI)
    } catch (error) {
      console.error(error)
      alert("Error accepting proposal")
    }
  }

  const checkProposalStatus = async () => {
    const status = await contract.isProposalAccepted(userAddress)
    setProposalStatus(status ? "Accepted" : "Pending")
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Proposal on the Blockchain</h1>

      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Recipient Address:
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient's Address"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
        <button
          onClick={propose}
          className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Send Proposal
        </button>
      </div>

      <div className="mb-6">
        <button
          onClick={checkProposalStatus}
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Check Proposal Status
        </button>
        {proposalStatus && (
          <p className="mt-2 text-center text-lg font-semibold text-gray-700">Status: {proposalStatus}</p>
        )}
      </div>

      {proposalStatus === "Accepted" && nftUrl && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Proposal Accepted!</h2>
          <p className="text-center mb-4">Your NFT certificate:</p>
          <img
            src={nftUrl || "/placeholder.svg"}
            alt="NFT Certificate"
            className="mx-auto max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  )
}

export default ProposalPage

