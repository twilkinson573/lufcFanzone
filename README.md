# LUFC Fanzone Hardhat Boilerplate

A Playground for ERC20 & ERC721 experimentation

Uses hackathon boilerplate environment for Hardhat & React projects


## Quick start

Setup your environment from the project root folder:

```sh
npm install
```

You'll need to create 2 `.env` files to store secrets and fill in the appropriate values:
```sh
touch .env
touch frontend/.env
````

Then run Hardhat's testing network:

```sh
npx hardhat node
```

Then in a new terminal window, deploy your contracts from the root folder:

```sh
npx hardhat run scripts/deploy.js --network localhost
```

You can also attach a console to interact with the local chain:

```sh
npx hardhat console --network localhost
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

