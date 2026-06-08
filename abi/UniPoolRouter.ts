export const UniPoolRouterAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "permit2",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "weth",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "unipoolFactory",
        "type": "address",
        "internalType": "contract IUniPoolFactory"
      },
      {
        "name": "morpho",
        "type": "address",
        "internalType": "contract IMorpho"
      },
      {
        "name": "enso",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "execute",
    "inputs": [
      {
        "name": "commands",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "inputs",
        "type": "bytes[]",
        "internalType": "bytes[]"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "execute",
    "inputs": [
      {
        "name": "commands",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "inputs",
        "type": "bytes[]",
        "internalType": "bytes[]"
      },
      {
        "name": "deadline",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
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
    "name": "InvalidCommandType",
    "inputs": [
      {
        "name": "commandType",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "MorphoLeverageSameToken",
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
    "name": "RouterExecutionFailed",
    "inputs": [
      {
        "name": "commandIndex",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "message",
        "type": "bytes",
        "internalType": "bytes"
      }
    ]
  },
  {
    "type": "error",
    "name": "RouterInvalidEthSender",
    "inputs": []
  },
  {
    "type": "error",
    "name": "RouterLengthMismatch",
    "inputs": []
  },
  {
    "type": "error",
    "name": "RouterTransactionDeadlinePassed",
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
    "name": "SliceOutOfBounds",
    "inputs": []
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
// 0x24856bc3: function execute(bytes,bytes[])
// 0x2feb241d: error UniPoolModuleInvalidPair()
// 0x30646921: error UniPoolModuleExcessiveInputAmount()
// 0x31f57072: function onMorphoFlashLoan(uint256,bytes)
// 0x329c0c83: error RouterExecutionFailed(uint256 commandIndex, bytes message)
// 0x347ebdfb: error MorphoUnexpectedCallback()
// 0x3593564c: function execute(bytes,bytes[],uint256)
// 0x3b6c7794: error MorphoLeverageSameToken()
// 0x3b7a9cbc: error MorphoOnlyMorpho()
// 0x3b99b53d: error SliceOutOfBounds()
// 0x3f0d9da5: error UniPoolPairFeeExceedsMax()
// 0x418370f7: error EnsoModuleZeroAddress()
// 0x41a6c181: error BytesLibToAddressOutOfBounds()
// 0x5274afe7: error SafeERC20FailedOperation(address token)
// 0x571fccc51b12ddec7c9292ccf9509f05f39a61c364a5d57fe2bdbbd93585d612: event RouterTradeAction(address,address,uint8,uint256[],uint256,uint256,bool)
// 0x648fb3b1: error BytesLibSliceOverflow()
// 0x66991f5c: error UniPoolModuleSpreadTooHigh()
// 0x675cae38: error InsufficientToken()
// 0x6a12f104: error InsufficientETH()
// 0x6f5ffb7e: error ContractLocked()
// 0x73189559: function uniPoolPairRepayCallback(address,uint256,address,bytes)
// 0x820289a8: error RouterTransactionDeadlinePassed()
// 0x89e198ea: error UniPoolModuleInvalidPath()
// 0x8e9d5f18: error RouterLengthMismatch()
// 0xae60e0f3: error UniPoolModuleZeroAddress()
// 0xb172b18f: error UniPoolModuleInvalidAmount()
// 0xbc9e7d3f: error MorphoZeroAddress()
// 0xcd230015: error RouterInvalidEthSender()
// 0xd76a1e9e: error InvalidCommandType(uint256 commandType)
// 0xd9c17a9f: error UniPoolModuleInsufficientOutputAmount()
// 0xdd65a0c7: error UniPoolPairPairNotFound()
// 0xe2841018: error UniPoolModuleSlippageTooHigh()
// 0xe7002877: error FromAddressIsNotOwner()
// 0xe7c92885: function uniPoolMintCallback((address,address,uint256,uint256,bytes))
// 0xf64d8bb3: error BytesLibOutOfBounds()
// 0xfb4b342b: function uniPoolPairBorrowCallback(address,uint256,address,uint256,address,bytes)
