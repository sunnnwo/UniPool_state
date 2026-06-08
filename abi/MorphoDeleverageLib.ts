export const MorphoDeleverageLibAbi = [
  {
    "type": "event",
    "name": "RouterTradeAction",
    "inputs": [
      {
        "name": "pair",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "actionType",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum IUniPoolRouter.RouterTradeActionType"
      },
      {
        "name": "loanIds",
        "type": "uint256[]",
        "indexed": false,
        "internalType": "uint256[]"
      },
      {
        "name": "amountIn",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amountOut",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "isZeroForOne",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "EnsoLibSwapFailed",
    "inputs": [
      {
        "name": "returnData",
        "type": "bytes",
        "internalType": "bytes"
      }
    ]
  },
  {
    "type": "error",
    "name": "MorphoDeleverageEmptyRepays",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoDeleverageInsufficientBorrowed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoDeleverageInvalidPair",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoDeleverageRepayFailed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoDeleverageRepaysNotOrdered",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoDeleverageSameToken",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoDeleverageWrongCaller",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoDeleverageWrongPermit2Recipient",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoDeleverageWrongRepayDigest",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoDeleverageZeroFlashAmount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SafeERC20FailedOperation",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "address"
      }
    ]
  }
] as const;
// 0x03f798d1: error MorphoDeleverageInvalidPair()
// 0x1bcf2d31: error MorphoDeleverageInsufficientBorrowed()
// 0x2a666235: error MorphoDeleverageSameToken()
// 0x5274afe7: error SafeERC20FailedOperation(address token)
// 0x571fccc51b12ddec7c9292ccf9509f05f39a61c364a5d57fe2bdbbd93585d612: event RouterTradeAction(address,address,uint8,uint256[],uint256,uint256,bool)
// 0x579749f9: error MorphoDeleverageWrongRepayDigest()
// 0x770aff81: error MorphoDeleverageWrongPermit2Recipient()
// 0xc8578f12: error MorphoDeleverageEmptyRepays()
// 0xcae534d9: error EnsoLibSwapFailed(bytes returnData)
// 0xed6c37c9: error MorphoDeleverageWrongCaller()
// 0xf0a455ef: error MorphoDeleverageRepaysNotOrdered()
// 0xf0c58ddf: error MorphoDeleverageRepayFailed()
// 0xf7f2104f: error MorphoDeleverageZeroFlashAmount()
