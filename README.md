# Hardhat Boilerplate

Boilerplate environment for Hardhat & React projects


## Quick start

Setup your environment from the project root folder:

```sh
npm install
```

Once installed, run Hardhat's testing network:

```sh
npx hardhat node
```

Then in a new terminal window, deploy your contracts from the root folder:

```sh
npx hardhat run scripts/deploy.js --network localhost
```

Finally, we can run the frontend with:

```sh
cd frontend
npm install
npm start
```

Open [http://localhost:3000/](http://localhost:3000/) to view the running dApp. You will
need to have [Metamask](https://metamask.io) installed and listening to
`localhost 8545`.

