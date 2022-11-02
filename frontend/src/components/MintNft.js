import React from "react";

export function MintNft({ mintNft, userNfts }) {
  return (
    <div>
      <p>Fantastic! Now that you are an $LUFC holder you have the access to mint an LUFC PlayerCard NFT 🎉</p>
      <button
        className="btn btn-success"
        type="button"
        onClick={mintNft}
      >
        Mint my PlayerCard NFT
      </button>

      
      {userNfts && userNfts.length > 0 && 
        <div>
          <h4>Your PlayerCards</h4>
          <ul>
            {userNfts.map(nft => (
              <li key={nft.title}>
                <img src={nft.media[0].gateway} alt={nft.title} />
                <p>{nft.title}</p>
              </li>
            ))}
          </ul>
        </div>
      }
    </div>
  )
}
