export const DispatcherAbi = [
  {
    "type": "function",
    "name": "onMorphoFlashLoan",
    "inputs": [
      {
        "name": "assets",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [
      {
        "name": "interfaceId",
        "type": "bytes4",
        "internalType": "bytes4"
      }
    ],
    "outputs": [
      {
        "name": "supports_",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "uniPoolMintCallback",
    "inputs": [
      {
        "name": "callbackData",
        "type": "tuple",
        "internalType": "struct IUniPoolMintCallback.MintCallbackData",
        "components": [
          {
            "name": "token0",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "token1",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "amount0",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "amount1",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "data",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "uniPoolPairBorrowCallback",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "contract IERC20"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "loanFee",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "feeTo",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "uniPoolPairRepayCallback",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "contract IERC20"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "uniPoolSwapCallback",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "contract IERC20"
      },
      {
        "name": "amount",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "error",
    "name": "BytesLibOutOfBounds",
    "inputs": []
  },
  {
    "type": "error",
    "name": "BytesLibSliceOverflow",
    "inputs": []
  },
  {
    "type": "error",
    "name": "BytesLibToAddressOutOfBounds",
    "inputs": []
  },
  {
    "type": "error",
    "name": "BytesLibToAddressOverflow",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ContractLocked",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EnsoModuleZeroAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "FromAddressIsNotOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientETH",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientToken",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoOnlyMorpho",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoUnexpectedCallback",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MorphoZeroAddress",
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
  },
  {
    "type": "error",
    "name": "UniPoolModuleExcessiveInputAmount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolModuleInsufficientOutputAmount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolModuleInvalidAmount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolModuleInvalidPair",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolModuleInvalidPath",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolModuleInvalidPayer",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolModuleInvalidPaymentType",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolModuleSlippageTooHigh",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolModuleSpreadTooHigh",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolModuleZeroAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairFeeExceedsMax",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairPairNotFound",
    "inputs": []
  }
] as const;
// 0x01ffc9a7: function supportsInterface(bytes4)
// 0x087ea009: error UniPoolModuleInvalidPaymentType()
// 0x10068d7e: function uniPoolSwapCallback(address,uint128,bytes)
// 0x123e27be: error UniPoolModuleInvalidPayer()
// 0x1b0c9077: error BytesLibToAddressOverflow()
// 0x2feb241d: error UniPoolModuleInvalidPair()
// 0x30646921: error UniPoolModuleExcessiveInputAmount()
// 0x31f57072: function onMorphoFlashLoan(uint256,bytes)
// 0x347ebdfb: error MorphoUnexpectedCallback()
// 0x3b7a9cbc: error MorphoOnlyMorpho()
// 0x3f0d9da5: error UniPoolPairFeeExceedsMax()
// 0x418370f7: error EnsoModuleZeroAddress()
// 0x41a6c181: error BytesLibToAddressOutOfBounds()
// 0x5274afe7: error SafeERC20FailedOperation(address token)
// 0x648fb3b1: error BytesLibSliceOverflow()
// 0x66991f5c: error UniPoolModuleSpreadTooHigh()
// 0x675cae38: error InsufficientToken()
// 0x6a12f104: error InsufficientETH()
// 0x6f5ffb7e: error ContractLocked()
// 0x73189559: function uniPoolPairRepayCallback(address,uint256,address,bytes)
// 0x89e198ea: error UniPoolModuleInvalidPath()
// 0xae60e0f3: error UniPoolModuleZeroAddress()
// 0xb172b18f: error UniPoolModuleInvalidAmount()
// 0xbc9e7d3f: error MorphoZeroAddress()
// 0xd9c17a9f: error UniPoolModuleInsufficientOutputAmount()
// 0xdd65a0c7: error UniPoolPairPairNotFound()
// 0xe2841018: error UniPoolModuleSlippageTooHigh()
// 0xe7002877: error FromAddressIsNotOwner()
// 0xe7c92885: function uniPoolMintCallback((address,address,uint256,uint256,bytes))
// 0xf64d8bb3: error BytesLibOutOfBounds()
// 0xfb4b342b: function uniPoolPairBorrowCallback(address,uint256,address,uint256,address,bytes)
