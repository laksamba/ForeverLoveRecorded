const hre = require("hardhat");

async function main() {
  // Get the contract to deploy
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the Proposal contract
  const Proposal = await hre.ethers.getContractFactory("Proposal");
  const proposal = await Proposal.deploy();
  await proposal.waitForDeployment();

  console.log("Proposal contract deployed to:",await proposal.getAddress());
}

// Running the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  //Deploying contracts with the account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// Proposal contract deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
