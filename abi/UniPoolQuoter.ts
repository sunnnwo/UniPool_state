export const UniPoolQuoterAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "factory",
        "type": "address",
        "internalType": "contract IUniPoolFactory"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAmountIn",
    "inputs": [
      {
        "name": "tokenIn",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenOut",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amountOut",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "outputs": [
      {
        "name": "amountIn_",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAmountIn",
    "inputs": [
      {
        "name": "reserveIn",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "reserveOut",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "amountOut",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "feeLpBps",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "feePoolBps",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "outputs": [
      {
        "name": "amountIn_",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "getAmountOut",
    "inputs": [
      {
        "name": "reserveIn",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "reserveOut",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "amountIn",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "feeLpBps",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "feePoolBps",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "outputs": [
      {
        "name": "amountOut_",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "getAmountOut",
    "inputs": [
      {
        "name": "tokenIn",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenOut",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amountIn",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "outputs": [
      {
        "name": "amountOut_",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAmountsIn",
    "inputs": [
      {
        "name": "amountOut",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "path",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "outputs": [
      {
        "name": "amountsIn_",
        "type": "uint128[]",
        "internalType": "uint128[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAmountsOut",
    "inputs": [
      {
        "name": "amountIn",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "path",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "outputs": [
      {
        "name": "amountsOut_",
        "type": "uint128[]",
        "internalType": "uint128[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getFactory",
    "inputs": [],
    "outputs": [
      {
        "name": "factory_",
        "type": "address",
        "internalType": "contract IUniPoolFactory"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSwapInfo",
    "inputs": [
      {
        "name": "tokenIn",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenOut",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "swapInfo_",
        "type": "tuple",
        "internalType": "struct UniPoolPairSwap.SwapInfo",
        "components": [
          {
            "name": "reserveIn",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "reserveOut",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "feeLpBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "feePoolBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "pair",
            "type": "address",
            "internalType": "contract IUniPoolPair"
          },
          {
            "name": "isToken0Out",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "vr",
            "type": "tuple",
            "internalType": "struct VirtualReserves",
            "components": [
              {
                "name": "virtualReserve0In",
                "type": "uint128",
                "internalType": "uint128"
              },
              {
                "name": "virtualReserve0Out",
                "type": "uint128",
                "internalType": "uint128"
              },
              {
                "name": "virtualReserve1In",
                "type": "uint128",
                "internalType": "uint128"
              },
              {
                "name": "virtualReserve1Out",
                "type": "uint128",
                "internalType": "uint128"
              }
            ]
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "error",
    "name": "UniPoolPairFeeExceedsMax",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInvalidPath",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairPairNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolQuoterZeroAddress",
    "inputs": []
  }
] as const;
// 0x27709c0e: function getAmountOut(uint128,uint128,uint128,uint16,uint16)
// 0x3f0d9da5: error UniPoolPairFeeExceedsMax()
// 0x5740c89b: function getAmountIn(address,address,uint128)
// 0x5c09cc05: error UniPoolQuoterZeroAddress()
// 0x8747e0ab: function getAmountsOut(uint128,address[])
// 0x88cc58e4: function getFactory()
// 0x8e834f22: function getAmountIn(uint128,uint128,uint128,uint16,uint16)
// 0xae39ecfc: function getSwapInfo(address,address)
// 0xbdbb4856: function getAmountsIn(uint128,address[])
// 0xc6d0e71b: function getAmountOut(address,address,uint128)
// 0xdd65a0c7: error UniPoolPairPairNotFound()
// 0xea7cad4f: error UniPoolPairInvalidPath()
