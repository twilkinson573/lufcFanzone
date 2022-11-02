import React from "react";

import { ethers } from "ethers";

import { Network, Alchemy } from "alchemy-sdk";

import TokenArtifact from "../compiledArtifacts/FanToken.json";
import NftArtifact from "../compiledArtifacts/PlayerCardNFT.json";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";
import { MintNft } from "./MintNft";

const NETWORK_ID = process.env.REACT_APP_CHAIN_ID;

const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      tokenData: undefined,
      nftData: undefined,
      selectedAddress: undefined,
      balance: undefined,
      nftBalance: undefined,
      userNfts: undefined,

      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (!this.state.tokenData || !this.state.nftData || !this.state.balance || !this.state.nftBalance) {
      return <Loading />;
    }

    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
               Leeds United Fanzone ⚪️🔵🟡
            </h1>
            <br/>
            <p>
              Welcome <b>{this.state.selectedAddress}!</b>
            </p>
            <p>You have{" "}
              <b>
                {this.state.balance.toString()} {this.state.tokenData.name} (${this.state.tokenData.symbol})
              </b>
            </p>
            <p>
              You also have{" "}
              <b>
                {this.state.nftBalance.toString()} {this.state.nftData.name} (${this.state.nftData.symbol}) Collectible NFTs
              </b>
            </p>
            <br/>
            <hr/>
            <h4>Get Tokens:</h4>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-12">
            {/* 
              Sending a transaction isn't an immediate action. You have to wait
              for it to be mined.
              If we are waiting for one, we show a message here.
            */}
            {this.state.txBeingSent && (
              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
            )}

            {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {this.state.balance.eq(0) && (
              <NoTokensMessage 
                mintTokens={() => this._mintTokens()} 
              />
            )}

            {this.state.balance.gt(0) && (
              <MintNft 
                mintNft={() => this._mintNft()}
                userNfts={this.state.userNfts} 
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
    });
    
    // We reset the dapp state if the network is changed
    window.ethereum.on("chainChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    this.setState({
      selectedAddress: userAddress,
    });

    this._initializeEthers();
    this._getTokenData();
    this._getNftData();
    this._getNfts(this.state.selectedAddress);
    this._startPollingData();
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // Then, we initialize the contracts using that provider and the token & nft's
    // artifacts.
    this._token = new ethers.Contract(
      process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );

    this._nft = new ethers.Contract(
      process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
      NftArtifact.abi,
      this._provider.getSigner(0)
    );

  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval1 = setInterval(() => this._updateBalance(), 1000);
    this._pollDataInterval2 = setInterval(() => this._updateNftBalance(), 1000);

    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
    this._updateNftBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval1);
    clearInterval(this._pollDataInterval2);
    this._pollDataInterval1 = undefined;
    this._pollDataInterval2 = undefined;
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();

    this.setState({ tokenData: { name, symbol } });
  }

  async _getNftData() {
    const name = await this._nft.name();
    const symbol = await this._nft.symbol();

    this.setState({ nftData: { name, symbol } });
  }

  async _updateBalance() {
    const balance = await this._token.balanceOf(this.state.selectedAddress);
    this.setState({ balance });
  }

  async _updateNftBalance() {
    const nftBalance = await this._nft.balanceOf(this.state.selectedAddress);
    this.setState({ nftBalance });
  }

  async _getNfts(userAddress) {
    const settings = {
      apiKey: process.env.REACT_ATPP_ALCHEMY_API_URL,
      network: Network.MATIC_MUMBAI,
    };
    
    const alchemy = new Alchemy(settings);
    // const nftsForOwner = await alchemy.nft.getNftsForOwner(userAddress);
    const userNfts = await (await alchemy.nft.getNftsForOwner("0xD82012324C8a3c2D5721B2444b7ee3d989e65589")).ownedNfts;
    this.setState({ userNfts });
  }

  async _mintTokens() {
    try {
      this._dismissTransactionError();
      const tx = await this._token.mint();
      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      await this._updateBalance();
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  async _mintNft() {
    try {
      this._dismissTransactionError();
      const tx = await this._nft.mint();
      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      await this._updateNftBalance();
      await this._getNfts(this.state.selectedAddress);
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545 
  _checkNetwork() {
    if (window.ethereum.networkVersion === NETWORK_ID) {
      return true;
    }

    this.setState({ 
      networkError: 'Please connect Metamask to Localhost:8545'
    });

    return false;
  }
}
