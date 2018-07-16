const {rinkeby_credentials} = require('./config');
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile');

const provider = new HDWalletProvider(
  rinkeby_credentials.RINKEBY_KEY,
  rinkeby_credentials.INFURA_LINK
);

const web3 = new Web3(provider);
// Create function deploy() to use async/await.
// async/await can only be used inside a function.
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Attempting to deploy from account; ', accounts[0]);
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({from: accounts[0], gas: '1000000'});

  console.log(interface);
  console.log('Contract deployed to: ', result.options.address);
};
deploy();

