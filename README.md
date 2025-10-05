# Decentralised Voting platform for Elections Using Ethereum - Blockchain

## Tools Required:

- NPM: https://nodejs.org
- Truffle: https://github.com/trufflesuite/truffle
- Ganache: http://truffleframework.com/ganache/
- Metamask: https://metamask.io/


## Steps to run the project:

### Step 1. Clone the project

### Step 1. Install dependencies
```
$ npm install
```
### Step 2. Start Ganache
Open the Ganache GUI client that you downloaded and installed. This will start your local blockchain instance. 


### Step 3. Compile & Deploy Election Smart Contract
`$ truffle migrate --reset`
Migration of the election smart contract is necessary each time Ganache is restarted.

### Step 4. Configure Metamask

- Unlock Metamask
- Connect metamask to your local Etherum blockchain provided by Ganache.
- Import an account provided by ganache.

### Step 5. Run the Front End Application

`$ npm run dev`
Visit this URL in your browser: http://localhost:3000

