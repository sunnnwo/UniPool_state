export const MorphoLeverageLibAbi = [
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
    "name": "MorphoLeverageInsufficientCollateral",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoLeverageInvalidPair",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoLeverageSameToken",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoLeverageUnexpectedAmount",
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
// 0x28c63fa1: error MorphoLeverageInvalidPair()
// 0x3b6c7794: error MorphoLeverageSameToken()
// 0x5274afe7: error SafeERC20FailedOperation(address token)
// 0x571fccc51b12ddec7c9292ccf9509f05f39a61c364a5d57fe2bdbbd93585d612: event RouterTradeAction(address,address,uint8,uint256[],uint256,uint256,bool)
// 0x644d889e: error MorphoLeverageInsufficientCollateral()
// 0x8233e5a4: error MorphoLeverageUnexpectedAmount()
// 0xcae534d9: error EnsoLibSwapFailed(bytes returnData)
