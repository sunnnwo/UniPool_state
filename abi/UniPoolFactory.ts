export const UniPoolFactoryAbi = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "UPGRADE_INTERFACE_VERSION",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "acceptOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createPair",
    "inputs": [
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
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "amount1",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "pair_",
        "type": "address",
        "internalType": "contract IUniPoolPair"
      },
      {
        "name": "lpAmount_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAavePool",
    "inputs": [],
    "outputs": [
      {
        "name": "aavePool_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllPairsLength",
    "inputs": [],
    "outputs": [
      {
        "name": "length_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getBeaconAddress",
    "inputs": [],
    "outputs": [
      {
        "name": "beaconAddress_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getBorrowLimitBps",
    "inputs": [],
    "outputs": [
      {
        "name": "borrowLimitBps_",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getFeeCollector",
    "inputs": [],
    "outputs": [
      {
        "name": "feeCollector_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getFeesBps",
    "inputs": [],
    "outputs": [
      {
        "name": "feeLpBps_",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "feePoolBps_",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "burnFeeBps_",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "loanFeeBps_",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getInterestParamsBps",
    "inputs": [],
    "outputs": [
      {
        "name": "params_",
        "type": "tuple",
        "internalType": "struct InterestParams",
        "components": [
          {
            "name": "protocolFeeBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "optimalPointBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "interestRateBaseBps",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "interestRateOptimalBps",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "interestRateAddBps",
            "type": "uint32",
            "internalType": "uint32"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLiquidationPenaltyBps",
    "inputs": [],
    "outputs": [
      {
        "name": "liquidationPenaltyBps_",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMaxBorrowPerTickAndRange",
    "inputs": [],
    "outputs": [
      {
        "name": "maxBorrowPerTickBps_",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "maxBorrowPerTickRangeBps_",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPair",
    "inputs": [
      {
        "name": "token0",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "token1",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "pair_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPairAtIndex",
    "inputs": [
      {
        "name": "index",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "pair_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPriceDecay",
    "inputs": [],
    "outputs": [
      {
        "name": "priceDecay_",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSwapPriceToleranceBps",
    "inputs": [],
    "outputs": [
      {
        "name": "swapPriceToleranceBps_",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTickBuffer",
    "inputs": [],
    "outputs": [
      {
        "name": "tickBuffer_",
        "type": "int16",
        "internalType": "int16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVault",
    "inputs": [],
    "outputs": [
      {
        "name": "vault_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "initialize",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "beaconAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "feeCollector",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "aavePool",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "initializeV2",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pendingOwner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "proxiableUUID",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setBorrowLimitBps",
    "inputs": [
      {
        "name": "borrowLimitBps",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "pairs",
        "type": "address[]",
        "internalType": "contract IUniPoolPair[]"
      },
      {
        "name": "updateStateBefore",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setFeeCollector",
    "inputs": [
      {
        "name": "newFeeCollector",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "pairs",
        "type": "address[]",
        "internalType": "contract IUniPoolPair[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setFees",
    "inputs": [
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
        "name": "burnFeeBps",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "pairs",
        "type": "address[]",
        "internalType": "contract IUniPoolPair[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setInterestRates",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "internalType": "struct InterestParams",
        "components": [
          {
            "name": "protocolFeeBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "optimalPointBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "interestRateBaseBps",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "interestRateOptimalBps",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "interestRateAddBps",
            "type": "uint32",
            "internalType": "uint32"
          }
        ]
      },
      {
        "name": "tokens",
        "type": "tuple[]",
        "internalType": "struct PairToken[]",
        "components": [
          {
            "name": "pair",
            "type": "address",
            "internalType": "contract IUniPoolPair"
          },
          {
            "name": "isToken0",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      },
      {
        "name": "updateStateBefore",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setLiquidationPenaltyBps",
    "inputs": [
      {
        "name": "liquidationPenaltyBps",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "pairs",
        "type": "address[]",
        "internalType": "contract IUniPoolPair[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setLoanFeeBps",
    "inputs": [
      {
        "name": "newLoanFee",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "tokens",
        "type": "tuple[]",
        "internalType": "struct PairToken[]",
        "components": [
          {
            "name": "pair",
            "type": "address",
            "internalType": "contract IUniPoolPair"
          },
          {
            "name": "isToken0",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setMaxBorrowPerTickAndRange",
    "inputs": [
      {
        "name": "maxBorrowPerTickBps",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "maxBorrowPerTickRangeBps",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "pairs",
        "type": "address[]",
        "internalType": "contract IUniPoolPair[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setPriceDecay",
    "inputs": [
      {
        "name": "priceDecay",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "pairs",
        "type": "address[]",
        "internalType": "contract IUniPoolPair[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setSwapPriceToleranceBps",
    "inputs": [
      {
        "name": "swapPriceToleranceBps",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "pairs",
        "type": "address[]",
        "internalType": "contract IUniPoolPair[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setTickBuffer",
    "inputs": [
      {
        "name": "tickBuffer",
        "type": "int16",
        "internalType": "int16"
      },
      {
        "name": "pairs",
        "type": "address[]",
        "internalType": "contract IUniPoolPair[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setVault",
    "inputs": [
      {
        "name": "vault",
        "type": "address",
        "internalType": "contract IUniPoolVault"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "upgradeToAndCall",
    "inputs": [
      {
        "name": "newImplementation",
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
    "stateMutability": "payable"
  },
  {
    "type": "event",
    "name": "BorrowLimitBpsUpdated",
    "inputs": [
      {
        "name": "newBorrowLimitBps",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FeeCollectorUpdated",
    "inputs": [
      {
        "name": "previousFeeCollector",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newFeeCollector",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FeesUpdated",
    "inputs": [
      {
        "name": "feeLpBps",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      },
      {
        "name": "feePoolBps",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      },
      {
        "name": "burnFeeBps",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Initialized",
    "inputs": [
      {
        "name": "version",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "InterestRatesUpdated",
    "inputs": [
      {
        "name": "protocolFeeBps",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      },
      {
        "name": "optimalPointBps",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      },
      {
        "name": "interestRateBaseBps",
        "type": "uint32",
        "indexed": false,
        "internalType": "uint32"
      },
      {
        "name": "interestRateOptimalBps",
        "type": "uint32",
        "indexed": false,
        "internalType": "uint32"
      },
      {
        "name": "interestRateAddBps",
        "type": "uint32",
        "indexed": false,
        "internalType": "uint32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LiquidationPenaltyBpsUpdated",
    "inputs": [
      {
        "name": "newLiquidationPenaltyBps",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LoanFeeUpdated",
    "inputs": [
      {
        "name": "loanFeeBps",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MaxBorrowPerTickAndRangeUpdated",
    "inputs": [
      {
        "name": "newMaxBorrowPerTickBps",
        "type": "uint32",
        "indexed": false,
        "internalType": "uint32"
      },
      {
        "name": "newMaxBorrowPerTickRangeBps",
        "type": "uint32",
        "indexed": false,
        "internalType": "uint32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferStarted",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PairCreated",
    "inputs": [
      {
        "name": "token0",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "token1",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "pair",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "totalPairs",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PriceDecayUpdated",
    "inputs": [
      {
        "name": "newPriceDecay",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SwapPriceToleranceBpsUpdated",
    "inputs": [
      {
        "name": "newSwapPriceToleranceBps",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TickBufferUpdated",
    "inputs": [
      {
        "name": "newTickBuffer",
        "type": "int16",
        "indexed": false,
        "internalType": "int16"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Upgraded",
    "inputs": [
      {
        "name": "implementation",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AddressEmptyCode",
    "inputs": [
      {
        "name": "target",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC1967InvalidImplementation",
    "inputs": [
      {
        "name": "implementation",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC1967NonPayable",
    "inputs": []
  },
  {
    "type": "error",
    "name": "FailedCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidInitialization",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotInitializing",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
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
    "name": "UUPSUnauthorizedCallContext",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UUPSUnsupportedProxiableUUID",
    "inputs": [
      {
        "name": "slot",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ]
  },
  {
    "type": "error",
    "name": "UniPoolExceedMaxBps",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolExceedMaxFeesBps",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolExceedMaxInterest",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolFactoryIdenticalAddresses",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolFactoryInvalidAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolFactoryInvalidPriceDecay",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolFactoryInvalidSwapPriceTolerance",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolFactoryInvalidTickBuffer",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolFactoryInvalidVaultAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolFactoryPairAlreadyExists",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolFactorySwapFeeExceedsPenalty",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolFactoryVaultAlreadyInitialized",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolFactoryVaultNotInitialized",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolMaxPenaltyExceeded",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolZeroOptimalPoint",
    "inputs": []
  }
] as const;
// 0x009d4d7a: function getBeaconAddress()
// 0x036decef: error UniPoolFactoryIdenticalAddresses()
// 0x05f15463: function setLiquidationPenaltyBps(uint16,address[])
// 0x06ead90b49d7da9cafc5068da4cc8798f6c6c9d1cdb357769485fa93fe6d62a2: event TickBufferUpdated(int16)
// 0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9: event PairCreated(address,address,address,uint256)
// 0x118cdaa7: error OwnableUnauthorizedAccount(address account)
// 0x12fde4b7: function getFeeCollector()
// 0x1322bd45ae49e58dea9d98a513ea13cd3f7a9966ceef413e91570721d3f10229: event PriceDecayUpdated(uint128)
// 0x13561b55: function getAavePool()
// 0x17f67980: function getLiquidationPenaltyBps()
// 0x1e4fbdf7: error OwnableInvalidOwner(address owner)
// 0x2959e24b: function getInterestParamsBps()
// 0x309578a7b3b4fe4aadb5be571fa9b79755a6f87643023869664b90f41ba51930: event InterestRatesUpdated(uint16,uint16,uint32,uint32,uint32)
// 0x319f8db8: error UniPoolZeroOptimalPoint()
// 0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700: event OwnershipTransferStarted(address,address)
// 0x3eb44a54: error UniPoolFactoryInvalidTickBuffer()
// 0x4562ed7f8ca73a98165ad6fee33e340a8fa97fd9e3065b89a8ed4bb23d1524dd: event BorrowLimitBpsUpdated(uint16)
// 0x45e88f53: function setLoanFeeBps(uint16,(address,bool)[])
// 0x4c9c8ce3: error ERC1967InvalidImplementation(address implementation)
// 0x4f1ef286: function upgradeToAndCall(address,bytes)
// 0x5274afe7: error SafeERC20FailedOperation(address token)
// 0x52d1902d: function proxiableUUID()
// 0x5cd8a76b: function initializeV2()
// 0x5d16ad41baeb009cd23eb8f6c7cde5c2e0cd5acf4a33926ab488875c37c37f38: event FeeCollectorUpdated(address,address)
// 0x63dba681: function getFeesBps()
// 0x63f60693: function setFeeCollector(address,address[])
// 0x6817031b: function setVault(address)
// 0x6a4e8b39: function getPairAtIndex(uint256)
// 0x715018a6: function renounceOwnership()
// 0x7489ffec: function setInterestRates((uint16,uint16,uint32,uint32,uint32),(address,bool)[],bool)
// 0x75a9d507: function setTickBuffer(int16,address[])
// 0x79ba5097: function acceptOwnership()
// 0x7a7db0e3: error UniPoolFactorySwapFeeExceedsPenalty()
// 0x8bc9413adae9d69fefc33dcbfdbaa694552fd1778dd97dd440bf5be14e9cc949: event MaxBorrowPerTickAndRangeUpdated(uint32,uint32)
// 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0: event OwnershipTransferred(address,address)
// 0x8c1f6fb9: error UniPoolFactoryInvalidSwapPriceTolerance()
// 0x8d928af8: function getVault()
// 0x8da5cb5b: function owner()
// 0x8e6ee7cc: function getMaxBorrowPerTickAndRange()
// 0x973039ef: function setSwapPriceToleranceBps(uint16,address[])
// 0x9996b315: error AddressEmptyCode(address target)
// 0x9b92f923: function getAllPairsLength()
// 0xa44ba0b7: error UniPoolFactoryPairAlreadyExists()
// 0xa579ae8b: function setFees(uint16,uint16,uint16,address[])
// 0xaa1d49a4: error UUPSUnsupportedProxiableUUID(bytes32 slot)
// 0xad3cb1cc: function UPGRADE_INTERFACE_VERSION()
// 0xb17c93d4: error UniPoolExceedMaxFeesBps()
// 0xb398979f: error ERC1967NonPayable()
// 0xb3ef341b591e573ddca7176a74bb92c8e453cce6d6885fcd6a544c2385d3811f: event FeesUpdated(uint16,uint16,uint16)
// 0xbc0edb4f: function createPair(address,address,uint128,uint128,address)
// 0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b: event Upgraded(address)
// 0xbd070096: error UniPoolExceedMaxBps()
// 0xc49ea3ccf1787729dfaf0f2295233e7604a8467bc8a9b6d7ea460ce2309b3414: event SwapPriceToleranceBpsUpdated(uint16)
// 0xc79b7c7a: error UniPoolMaxPenaltyExceeded()
// 0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2: event Initialized(uint64)
// 0xcdd64623: function getBorrowLimitBps()
// 0xd07d3176: function setBorrowLimitBps(uint16,address[],bool)
// 0xd20590c7: function getTickBuffer()
// 0xd513b472c730aefdd8c2b343a5259cb2772d9cd7f749afa761cbbb93921f4f8a: event LoanFeeUpdated(uint16)
// 0xd599b73320046368adf17d7d3bb9d9e598ff5d8c558980ae91e3bf68e0330ea6: event LiquidationPenaltyBpsUpdated(uint16)
// 0xd6bda275: error FailedCall()
// 0xd7e6bcf8: error NotInitializing()
// 0xd936b614: function getPriceDecay()
// 0xddf48278: function getSwapPriceToleranceBps()
// 0xdfb3b1db: function setMaxBorrowPerTickAndRange(uint32,uint32,address[])
// 0xe07c8dba: error UUPSUnauthorizedCallContext()
// 0xe30c3978: function pendingOwner()
// 0xe6a43905: function getPair(address,address)
// 0xe6c6dbc9: error UniPoolExceedMaxInterest()
// 0xe9c60126: function setPriceDecay(uint128,address[])
// 0xf132ac21: error UniPoolFactoryVaultAlreadyInitialized()
// 0xf2fde38b: function transferOwnership(address)
// 0xf801e747: error UniPoolFactoryInvalidVaultAddress()
// 0xf84d2d56: error UniPoolFactoryInvalidPriceDecay()
// 0xf875ed2c: error UniPoolFactoryInvalidAddress()
// 0xf8c8765e: function initialize(address,address,address,address)
// 0xf92ee8a9: error InvalidInitialization()
// 0xffa77acf: error UniPoolFactoryVaultNotInitialized()
