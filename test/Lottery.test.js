const assert = require('assert');
const ganache = require('ganache-cli');

const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({from: accounts[0], gas: '1000000'});
});

describe('Test Lottery Contract', () => {
  it('Deploy a contract', () => {
    assert.ok(lottery.options.address);
  });
  it('Allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('.02', 'ether')
    });
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    }); 
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('Allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('.02', 'ether')
    });
 
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    }); 
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('Require a minimum amount of ether', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0 //Wei
      });
      // If the line above goes wrong and
      // try-catch does not catch it.
      // the following assert will stil
      // find it.
      assert(false);
    } catch (err) {
      assert(err);
    }
  })

  it('Only mange can call pickWinner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('Sends money to the winner and resets the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({
      from: accounts[0] 
    });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;
    //?console.log('difference is: ', web3.utils.fromWei(toString(difference), 'Ether'), ' Ether');
    //Since the winner also pays some Gas. What he gets back
    // is less than 2 ether. Here we think it should be more 1.8 ether.
    assert(difference > web3.utils.toWei('1.8', 'ether'));
  });
});
