import React from "react";

export function MintNft({ mintNft }) {
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
    </div>
  );
}
