import React from "react";

export function NoTokensMessage({ mintTokens }) {
  return (
    <div>
      <p>You currently don't have any $LUFT! Mint your first token for free here:</p>
      <button
        className="btn btn-success"
        type="button"
        onClick={mintTokens}
      >
        Mint 1 $LUFT
      </button>
    </div>
  );
}
