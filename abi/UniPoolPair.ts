export const UniPoolPairAbi = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "DOMAIN_SEPARATOR",
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
    "name": "INTEREST_MULTIPLIER_DECIMALS",
    "inputs": [],
    "outputs": [
      {
        "name": "decimals_",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "LOAN_TRANSFER_TYPEHASH",
    "inputs": [],
    "outputs": [
      {
        "name": "typehash_",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "MINIMUM_LIQUIDITY",
    "inputs": [],
    "outputs": [
      {
        "name": "liq_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "RAY_DECIMALS",
    "inputs": [],
    "outputs": [
      {
        "name": "decimals_",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "REPAY_TYPEHASH",
    "inputs": [],
    "outputs": [
      {
        "name": "typehash_",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "borrow",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "internalType": "struct BorrowMultipleParams",
        "components": [
          {
            "name": "isToken0",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "loanParams",
            "type": "tuple[]",
            "internalType": "struct LoanParams[]",
            "components": [
              {
                "name": "amountOut",
                "type": "uint128",
                "internalType": "uint128"
              },
              {
                "name": "liquidationTick",
                "type": "int16",
                "internalType": "int16"
              },
              {
                "name": "maxCollateralIn",
                "type": "uint128",
                "internalType": "uint128"
              }
            ]
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "isFlashLoan",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "minAmountOut",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "callbackData",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      }
    ],
    "outputs": [
      {
        "name": "loanIds_",
        "type": "uint256[]",
        "internalType": "LoanId[]"
      },
      {
        "name": "firstUserIndex_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "collateral_",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "borrow",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "internalType": "struct BorrowParams",
        "components": [
          {
            "name": "isToken0",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "loanParams",
            "type": "tuple",
            "internalType": "struct LoanParams",
            "components": [
              {
                "name": "amountOut",
                "type": "uint128",
                "internalType": "uint128"
              },
              {
                "name": "liquidationTick",
                "type": "int16",
                "internalType": "int16"
              },
              {
                "name": "maxCollateralIn",
                "type": "uint128",
                "internalType": "uint128"
              }
            ]
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "callbackData",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      }
    ],
    "outputs": [
      {
        "name": "loanId_",
        "type": "uint256",
        "internalType": "LoanId"
      },
      {
        "name": "userIndex_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "collateral_",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "burn",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "amount0_",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "amount1_",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "calcPriceAtTick",
    "inputs": [
      {
        "name": "tick",
        "type": "int16",
        "internalType": "int16"
      },
      {
        "name": "interestMultiplier",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "collatYieldAccumulator",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "roundUp",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [
      {
        "name": "price_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "calcTickAtPrice",
    "inputs": [
      {
        "name": "price",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "interestMultiplier",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "collatYieldAccumulator",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "roundUp",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [
      {
        "name": "tick_",
        "type": "int16",
        "internalType": "int16"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "calcVariableInterestRate0",
    "inputs": [],
    "outputs": [
      {
        "name": "rate_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calcVariableInterestRate1",
    "inputs": [],
    "outputs": [
      {
        "name": "rate_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "countActiveUserLoans",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "count_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "countUserLoans",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "count_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "distributeProtocolFees",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "eip712Domain",
    "inputs": [],
    "outputs": [
      {
        "name": "fields",
        "type": "bytes1",
        "internalType": "bytes1"
      },
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "version",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "chainId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "verifyingContract",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "salt",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "extensions",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAccumulatedPoolFees",
    "inputs": [],
    "outputs": [
      {
        "name": "feePoolToken0_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "feePoolToken1_",
        "type": "uint256",
        "internalType": "uint256"
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
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getInterestMultiplier0",
    "inputs": [],
    "outputs": [
      {
        "name": "multiplier_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getInterestMultiplier1",
    "inputs": [],
    "outputs": [
      {
        "name": "multiplier_",
        "type": "uint256",
        "internalType": "uint256"
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
        "name": "paramsToken0_",
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
        "name": "paramsToken1_",
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
    "name": "getLastUpdateTimestamp",
    "inputs": [],
    "outputs": [
      {
        "name": "timestamp_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLastYieldAccumulator",
    "inputs": [],
    "outputs": [
      {
        "name": "yieldAcc0_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "yieldAcc1_",
        "type": "uint256",
        "internalType": "uint256"
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
    "name": "getLoan",
    "inputs": [
      {
        "name": "loanId",
        "type": "uint256",
        "internalType": "LoanId"
      }
    ],
    "outputs": [
      {
        "name": "loan_",
        "type": "tuple",
        "internalType": "struct LoanInfo",
        "components": [
          {
            "name": "isToken0",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "tick",
            "type": "int16",
            "internalType": "int16"
          },
          {
            "name": "tickVersion",
            "type": "uint232",
            "internalType": "uint232"
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "delegationNonce",
            "type": "uint96",
            "internalType": "uint96"
          },
          {
            "name": "amount",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "collateral",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "entryMultiplier",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLoanFeesBps",
    "inputs": [],
    "outputs": [
      {
        "name": "loanFee0_",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "loanFee1_",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLowestTick0",
    "inputs": [],
    "outputs": [
      {
        "name": "tick_",
        "type": "int16",
        "internalType": "int16"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getLowestTick1",
    "inputs": [],
    "outputs": [
      {
        "name": "tick_",
        "type": "int16",
        "internalType": "int16"
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
    "name": "getNextLoanId",
    "inputs": [],
    "outputs": [
      {
        "name": "id_",
        "type": "uint256",
        "internalType": "LoanId"
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
    "name": "getReserves",
    "inputs": [],
    "outputs": [
      {
        "name": "reserve0_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "reserve1_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getReservesAndFees",
    "inputs": [],
    "outputs": [
      {
        "name": "reserve0_",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "reserve1_",
        "type": "uint128",
        "internalType": "uint128"
      },
      {
        "name": "virtualReserves_",
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
      },
      {
        "name": "feeLpBps_",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "feePoolBps_",
        "type": "uint16",
        "internalType": "uint16"
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
        "name": "toleranceBps_",
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
    "name": "getTickData0",
    "inputs": [
      {
        "name": "tickNumber",
        "type": "int16",
        "internalType": "int16"
      },
      {
        "name": "tickVersion",
        "type": "uint232",
        "internalType": "uint232"
      }
    ],
    "outputs": [
      {
        "name": "data_",
        "type": "tuple",
        "internalType": "struct TickData",
        "components": [
          {
            "name": "loans",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "amount",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "collateral",
            "type": "uint128",
            "internalType": "uint128"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTickData1",
    "inputs": [
      {
        "name": "tickNumber",
        "type": "int16",
        "internalType": "int16"
      },
      {
        "name": "tickVersion",
        "type": "uint232",
        "internalType": "uint232"
      }
    ],
    "outputs": [
      {
        "name": "data_",
        "type": "tuple",
        "internalType": "struct TickData",
        "components": [
          {
            "name": "loans",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "amount",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "collateral",
            "type": "uint128",
            "internalType": "uint128"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTickVersion",
    "inputs": [
      {
        "name": "tick",
        "type": "int16",
        "internalType": "int16"
      },
      {
        "name": "isToken0",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [
      {
        "name": "version_",
        "type": "uint232",
        "internalType": "uint232"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTokens",
    "inputs": [],
    "outputs": [
      {
        "name": "token0_",
        "type": "address",
        "internalType": "contract IERC20"
      },
      {
        "name": "token1_",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalBorrowed0",
    "inputs": [],
    "outputs": [
      {
        "name": "borrowed_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalBorrowed1",
    "inputs": [],
    "outputs": [
      {
        "name": "borrowed_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalLoans",
    "inputs": [],
    "outputs": [
      {
        "name": "totalLoans0_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "totalLoans1_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserLoan",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "index",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "loan_",
        "type": "tuple",
        "internalType": "struct LoanInfo",
        "components": [
          {
            "name": "isToken0",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "tick",
            "type": "int16",
            "internalType": "int16"
          },
          {
            "name": "tickVersion",
            "type": "uint232",
            "internalType": "uint232"
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "delegationNonce",
            "type": "uint96",
            "internalType": "uint96"
          },
          {
            "name": "amount",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "collateral",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "entryMultiplier",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "loanId_",
        "type": "uint256",
        "internalType": "LoanId"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVirtualReserves",
    "inputs": [],
    "outputs": [
      {
        "name": "reserves_",
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
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "initialize",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "internalType": "struct InitPairParams",
        "components": [
          {
            "name": "token0",
            "type": "address",
            "internalType": "contract IERC20"
          },
          {
            "name": "token1",
            "type": "address",
            "internalType": "contract IERC20"
          },
          {
            "name": "factory",
            "type": "address",
            "internalType": "contract IUniPoolFactory"
          },
          {
            "name": "vault",
            "type": "address",
            "internalType": "contract IUniPoolVault"
          },
          {
            "name": "aave",
            "type": "address",
            "internalType": "contract IPool"
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
            "name": "burnFeeBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "loanFeeBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "feeCollector",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "interestProtocolFeeBps",
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
          },
          {
            "name": "borrowLimitBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "liquidationPenaltyBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "swapPriceToleranceBps",
            "type": "uint16",
            "internalType": "uint16"
          },
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
            "name": "priceDecay",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "tickBuffer",
            "type": "int16",
            "internalType": "int16"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "liquidate",
    "inputs": [],
    "outputs": [
      {
        "name": "result_",
        "type": "tuple",
        "internalType": "struct LiquidationResult",
        "components": [
          {
            "name": "liquidatedTicks0",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "liquidatedTicks1",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalPositions0",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalPositions1",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalAmount0",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "totalAmount1",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "totalCollateral0",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "totalCollateral1",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "reserve0",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "reserve1",
            "type": "uint128",
            "internalType": "uint128"
          }
        ]
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "liquidate",
    "inputs": [
      {
        "name": "iter",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "result_",
        "type": "tuple",
        "internalType": "struct LiquidationResult",
        "components": [
          {
            "name": "liquidatedTicks0",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "liquidatedTicks1",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalPositions0",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalPositions1",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalAmount0",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "totalAmount1",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "totalCollateral0",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "totalCollateral1",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "reserve0",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "reserve1",
            "type": "uint128",
            "internalType": "uint128"
          }
        ]
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "mint",
    "inputs": [
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
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
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
    "name": "name",
    "inputs": [],
    "outputs": [
      {
        "name": "name_",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "nonces",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "nonce_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "permit",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "deadline",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "v",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "r",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "s",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "previewInterestMultiplier0",
    "inputs": [
      {
        "name": "timestamp",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "multiplier_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "previewInterestMultiplier1",
    "inputs": [
      {
        "name": "timestamp",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "multiplier_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "previewReserves",
    "inputs": [
      {
        "name": "timestamp",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "reserve0_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "reserve1_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "vr_",
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
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "previewYieldAccumulator",
    "inputs": [
      {
        "name": "isToken0",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [
      {
        "name": "yieldAcc_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "repay",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "internalType": "struct RepayParams",
        "components": [
          {
            "name": "loanId",
            "type": "uint256",
            "internalType": "LoanId"
          },
          {
            "name": "userIndex",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "amount",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "maxSwapInput",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "deadline",
            "type": "uint40",
            "internalType": "uint40"
          },
          {
            "name": "delegationSignature",
            "type": "bytes",
            "internalType": "bytes"
          },
          {
            "name": "callbackData",
            "type": "bytes",
            "internalType": "bytes"
          }
        ]
      }
    ],
    "outputs": [
      {
        "name": "success_",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "remainingAmount_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
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
        "name": "isToken0",
        "type": "bool",
        "internalType": "bool"
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
        "name": "loanFeeBps",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "isToken0",
        "type": "bool",
        "internalType": "bool"
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
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "skim",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "swap",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "internalType": "struct SwapParams",
        "components": [
          {
            "name": "amountIn",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "amountOut",
            "type": "uint128",
            "internalType": "uint128"
          },
          {
            "name": "isToken0Out",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "to",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "callBackData",
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
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "name": "symbol_",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferLoan",
    "inputs": [
      {
        "name": "loanId",
        "type": "uint256",
        "internalType": "LoanId"
      },
      {
        "name": "userIndex",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "deadline",
        "type": "uint40",
        "internalType": "uint40"
      },
      {
        "name": "delegationSignature",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "uniPoolVaultCallback",
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
    "name": "updateState",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
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
    "name": "Burn",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount0",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "EIP712DomainChanged",
    "inputs": [],
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
        "name": "token",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
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
    "name": "LiquidatedTick",
    "inputs": [
      {
        "name": "tick",
        "type": "int16",
        "indexed": true,
        "internalType": "int16"
      },
      {
        "name": "oldTickVersion",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "borrowedToken",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "borrowedTokenAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "collateralAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "yieldAccumulator",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "interestMultiplier",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
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
    "name": "Loan",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "token",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "loanId",
        "type": "uint256",
        "indexed": false,
        "internalType": "LoanId"
      },
      {
        "name": "userIndex",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "collateral",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "yieldAccumulator",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "interestMultiplier",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LoanFeeUpdated",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
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
    "name": "LoanOwnershipTransferred",
    "inputs": [
      {
        "name": "loanId",
        "type": "uint256",
        "indexed": true,
        "internalType": "LoanId"
      },
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "LoanRepaid",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "loanId",
        "type": "uint256",
        "indexed": true,
        "internalType": "LoanId"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amountWithInterests",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "remainingAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "autoswap",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      },
      {
        "name": "yieldAccumulator",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "interestMultiplier",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
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
    "name": "Mint",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount0",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MultiLoans",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "isLeverage",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      },
      {
        "name": "loanIds",
        "type": "uint256[]",
        "indexed": false,
        "internalType": "LoanId[]"
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
    "name": "ReservesUpdated",
    "inputs": [
      {
        "name": "reserve0",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      },
      {
        "name": "reserve1",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      },
      {
        "name": "virtualReserve0In",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      },
      {
        "name": "virtualReserve0Out",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      },
      {
        "name": "virtualReserve1In",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      },
      {
        "name": "virtualReserve1Out",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      },
      {
        "name": "totalSupply",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Swap",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
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
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "isZeroForOne",
        "type": "bool",
        "indexed": true,
        "internalType": "bool"
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
    "name": "TickDataUpdated",
    "inputs": [
      {
        "name": "tickId",
        "type": "uint256",
        "indexed": false,
        "internalType": "TickId"
      },
      {
        "name": "loans",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amount",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      },
      {
        "name": "collateral",
        "type": "uint128",
        "indexed": false,
        "internalType": "uint128"
      },
      {
        "name": "isToken0",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "ECDSAInvalidSignature",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ECDSAInvalidSignatureLength",
    "inputs": [
      {
        "name": "length",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ECDSAInvalidSignatureS",
    "inputs": [
      {
        "name": "s",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InsufficientAllowance",
    "inputs": [
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "allowance",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "needed",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InsufficientBalance",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "balance",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "needed",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidApprover",
    "inputs": [
      {
        "name": "approver",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidReceiver",
    "inputs": [
      {
        "name": "receiver",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidSender",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC20InvalidSpender",
    "inputs": [
      {
        "name": "spender",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC2612ExpiredSignature",
    "inputs": [
      {
        "name": "deadline",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "ERC2612InvalidSigner",
    "inputs": [
      {
        "name": "signer",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "InvalidAccountNonce",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "currentNonce",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
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
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairBorrowCostBelowSwap",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairCollateralOverflow",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairCollateralSlippageExceeded",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairDeadline",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairEmptyLoanParams",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairExceedMaxSwapInput",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairExceedsMaxBorrowable",
    "inputs": [
      {
        "name": "isToken0",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "tick",
        "type": "int16",
        "internalType": "int16"
      },
      {
        "name": "desiredAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "availableAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "UniPoolPairExceedsMaxTotalBorrow",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairExcessiveSpread",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairFeeExceedsMax",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInsufficientBurnedLiquidity",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInsufficientCollateral",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInsufficientInput",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInsufficientLoanFee",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInsufficientMintedLiquidity",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInsufficientOutput",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInsufficientPayment",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInsufficientSwapLiquidity",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInvalidAmount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInvalidK",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInvalidLoanIndex",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInvalidPath",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInvalidTick",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInvalidTo",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairInvalidToken",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairLoanLiquidated",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairMintNotProportional",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairPairNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairPriceTooSmall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairStateBorrowedExceedsMax",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairTimestampTooOld",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairUnauthorized",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolPairZeroAddress",
    "inputs": []
  }
] as const;
// 0x0258195a: error UniPoolPairBorrowCostBelowSwap()
// 0x0382ccdc: function getReservesAndFees()
// 0x04766290767cac0282bc7fade77e1abd133cc62fc003fa39f534a8c2cda5c14b: event LoanOwnershipTransferred(uint256,address,address)
// 0x047d0774: error UniPoolPairInvalidAmount()
// 0x06ead90b49d7da9cafc5068da4cc8798f6c6c9d1cdb357769485fa93fe6d62a2: event TickBufferUpdated(int16)
// 0x06fdde03: function name()
// 0x08241cad: function setMaxBorrowPerTickAndRange(uint32,uint32)
// 0x0902f1ac: function getReserves()
// 0x095ea7b3: function approve(address,uint256)
// 0x0a6387c9ea3628b88a633bb4f3b151770f70085117a15f9bf3787cda53f13d31: event EIP712DomainChanged()
// 0x0e48c478: function initialize((address,address,address,address,address,uint16,uint16,uint16,uint16,address,uint16,uint16,uint32,uint32,uint32,uint16,uint16,uint16,uint32,uint32,uint128,int16))
// 0x0f9b0962: function setTickBuffer(int16)
// 0x0fefa0ad: function calcVariableInterestRate0()
// 0x11caf1633d9ab6944028cc992d9a05626900c0054f75081b0ce33762d8f44dfb: event InterestRatesUpdated(address,uint16,uint16,uint32,uint32,uint32)
// 0x1281f602: function getTickVersion(int16,bool)
// 0x12fde4b7: function getFeeCollector()
// 0x1322bd45ae49e58dea9d98a513ea13cd3f7a9966ceef413e91570721d3f10229: event PriceDecayUpdated(uint128)
// 0x14f5178a: error UniPoolPairExceedMaxSwapInput()
// 0x16d637ad: function previewYieldAccumulator(bool)
// 0x17f67980: function getLiquidationPenaltyBps()
// 0x18160ddd: function totalSupply()
// 0x1948cc2b3d79328f352fe43d6e8937cc618001afe2404c0a3efbebb338665104: event MultiLoans(address,bool,uint256[])
// 0x1c0a90fc: error UniPoolPairInsufficientPayment()
// 0x1d8557d7: function updateState()
// 0x204a7d23: error UniPoolPairInvalidToken()
// 0x208612b4: error UniPoolPairCollateralOverflow()
// 0x2246e8e1: function getTickData0(int16,uint232)
// 0x22a3eb98: function previewInterestMultiplier0(uint256)
// 0x23b872dd: function transferFrom(address,address,uint256)
// 0x24ca3a9e: function getInterestMultiplier0()
// 0x28a07025: function liquidate()
// 0x2943f183: error UniPoolPairDeadline()
// 0x2959e24b: function getInterestParamsBps()
// 0x2b2c0eb4: function getAccumulatedPoolFees()
// 0x2d3f6793: error UniPoolPairCollateralSlippageExceeded()
// 0x2f00e3cdd69a77be7ed215ec7b2a36784dd158f921fca79ac29deffa353fe6ee: event Mint(address,address,uint256,uint256)
// 0x2f8e1f81: function previewReserves(uint256)
// 0x313ce567: function decimals()
// 0x31ca6a9c: error UniPoolPairStateBorrowedExceedsMax()
// 0x33501cd2: error UniPoolPairTimestampTooOld()
// 0x33f4aa2f: error UniPoolPairInvalidLoanIndex()
// 0x35291cdf: function getLoanFeesBps()
// 0x3644e515: function DOMAIN_SEPARATOR()
// 0x367af6d2: error UniPoolPairInvalidTo()
// 0x3693672b: function countUserLoans(address)
// 0x386de90b: function swap((uint128,uint128,bool,address,bytes))
// 0x38be6cac: function setPriceDecay(uint128)
// 0x3abd7cd8: function previewInterestMultiplier1(uint256)
// 0x3d98f56b: function INTEREST_MULTIPLIER_DECIMALS()
// 0x3ee5aeb5: error ReentrancyGuardReentrantCall()
// 0x3f0d9da5: error UniPoolPairFeeExceedsMax()
// 0x415f1240: function liquidate(uint256)
// 0x41f86750: function mint(uint128,uint128,address,bytes)
// 0x4562ed7f8ca73a98165ad6fee33e340a8fa97fd9e3065b89a8ed4bb23d1524dd: event BorrowLimitBpsUpdated(uint16)
// 0x4578cf1c: function setInterestRates((uint16,uint16,uint32,uint32,uint32),bool,bool)
// 0x46454aa4: function distributeProtocolFees()
// 0x47e619eb: function getLowestTick1()
// 0x4b800e46: error ERC2612InvalidSigner(address signer, address owner)
// 0x4daf0fd9: function getTotalBorrowed1()
// 0x4ffdb564: function RAY_DECIMALS()
// 0x504006ca: function getLoan(uint256)
// 0x50da2de5: function getLastYieldAccumulator()
// 0x513e084f: function getLowestTick0()
// 0x534c6bcb: function setFees(uint16,uint16,uint16)
// 0x5c125da9: error UniPoolPairInsufficientCollateral()
// 0x5d16ad41baeb009cd23eb8f6c7cde5c2e0cd5acf4a33926ab488875c37c37f38: event FeeCollectorUpdated(address,address)
// 0x5d624aa9c148153ab3446c1b154f660ee7701e549fe9b62dab7171b1c80e6fa2: event Burn(address,address,uint256,uint256)
// 0x5d971fd3a91a8fad33980746bfab51464fe69a711a202c0ad7e988e04494bf44: event ReservesUpdated(uint128,uint128,uint128,uint128,uint128,uint128,uint256)
// 0x5f2ba911: error UniPoolPairPriceTooSmall()
// 0x6146dd6f: function getNextLoanId()
// 0x62791302: error ERC2612ExpiredSignature(uint256 deadline)
// 0x63dba681: function getFeesBps()
// 0x6e961c99: function transferLoan(uint256,uint256,address,uint40,bytes)
// 0x6f1d7ddd9b74662ce11787ae267cb9ec3bc518ba39bd2a1cdc06d0838cf45b1c: event LoanFeeUpdated(address,uint16)
// 0x70a08231: function balanceOf(address)
// 0x752d88c0: error InvalidAccountNonce(address account, uint256 currentNonce)
// 0x79459659: function LOAN_TRANSFER_TYPEHASH()
// 0x7ca99152: function borrow((bool,(uint128,int16,uint128)[],address,address,bool,uint128,bytes))
// 0x7d61c16b: function repay((uint256,uint256,uint128,uint128,uint40,bytes,bytes))
// 0x7da065a1: error UniPoolPairInsufficientBurnedLiquidity()
// 0x7ecebe00: function nonces(address)
// 0x7ef29a2d: error UniPoolPairInvalidK()
// 0x7f8f6184: function getVirtualReserves()
// 0x833be5d5: function getTotalLoans()
// 0x83c6e1fa: function getTickData1(int16,uint232)
// 0x84b0196e: function eip712Domain()
// 0x8558e2f4abc1c429b5bc2443de25c89a7903572e98f392f4439fa3cc2f9ea68c: event Loan(address,address,address,uint256,uint256,uint256,uint256,uint256,uint256)
// 0x88cc58e4: function getFactory()
// 0x89afcb44: function burn(address)
// 0x8bc9413adae9d69fefc33dcbfdbaa694552fd1778dd97dd440bf5be14e9cc949: event MaxBorrowPerTickAndRangeUpdated(uint32,uint32)
// 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925: event Approval(address,address,uint256)
// 0x8ded28b2870e3514e95114c8aa6b52a66430c9b0a1dc9d7492f9a779e31573c4: event LoanRepaid(address,uint256,uint256,uint256,uint256,bool,uint256,uint256)
// 0x8e6ee7cc: function getMaxBorrowPerTickAndRange()
// 0x94280d62: error ERC20InvalidSpender(address spender)
// 0x95d89b41: function symbol()
// 0x96c6fd1e: error ERC20InvalidSender(address sender)
// 0x975a8259: error UniPoolPairInsufficientLoanFee()
// 0x9909b2f0: function calcTickAtPrice(uint256,uint256,uint256,bool)
// 0x99b7a479: error UniPoolPairInvalidTick()
// 0x9a260b26: error UniPoolPairInsufficientInput()
// 0xa16b4b52: error UniPoolPairExceedsMaxTotalBorrow()
// 0xa42dce80: function setFeeCollector(address)
// 0xa51bfae73fb664dea2299105df9b845d7e7c20d9037d0e9e53f1ff5e3b623184: event LiquidatedTick(int16,uint256,address,uint256,uint256,uint256,uint256)
// 0xa64c3e80: error UniPoolPairInsufficientMintedLiquidity()
// 0xa9059cbb: function transfer(address,uint256)
// 0xaa6ca808: function getTokens()
// 0xb3962d19: function calcPriceAtTick(int16,uint256,uint256,bool)
// 0xb3ef341b591e573ddca7176a74bb92c8e453cce6d6885fcd6a544c2385d3811f: event FeesUpdated(uint16,uint16,uint16)
// 0xb56053da: error UniPoolPairLoanLiquidated()
// 0xb6b49d9f: function calcVariableInterestRate1()
// 0xb7054736: error UniPoolPairMintNotProportional()
// 0xba9a7a56: function MINIMUM_LIQUIDITY()
// 0xba9ab7c1: error UniPoolPairUnauthorized()
// 0xbc25cf77: function skim(address)
// 0xc49ea3ccf1787729dfaf0f2295233e7604a8467bc8a9b6d7ea460ce2309b3414: event SwapPriceToleranceBpsUpdated(uint16)
// 0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2: event Initialized(uint64)
// 0xc8beb16b: function uniPoolVaultCallback(address,uint256,bytes)
// 0xcb8acb4a: function setSwapPriceToleranceBps(uint16)
// 0xcdd64623: function getBorrowLimitBps()
// 0xd20590c7: function getTickBuffer()
// 0xd36ef540: function setLoanFeeBps(uint16,bool)
// 0xd4afeb4c: function REPAY_TYPEHASH()
// 0xd505accf: function permit(address,address,uint256,uint256,uint8,bytes32,bytes32)
// 0xd599b73320046368adf17d7d3bb9d9e598ff5d8c558980ae91e3bf68e0330ea6: event LiquidationPenaltyBpsUpdated(uint16)
// 0xd5c05940: function getUserLoan(address,uint256)
// 0xd78bce0c: error ECDSAInvalidSignatureS(bytes32 s)
// 0xd7e6bcf8: error NotInitializing()
// 0xd936b614: function getPriceDecay()
// 0xd97f1bf6: function getTotalBorrowed0()
// 0xdbad2ddd1b3cac36de15036b12f92d5f32b447fc9cd0c1a72467d15bc04dc812: event Swap(address,uint256,uint256,address,bool)
// 0xdca9e934: error UniPoolPairInsufficientSwapLiquidity()
// 0xdd62ed3e: function allowance(address,address)
// 0xdd65a0c7: error UniPoolPairPairNotFound()
// 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef: event Transfer(address,address,uint256)
// 0xddf48278: function getSwapPriceToleranceBps()
// 0xdf929841: function borrow((bool,(uint128,int16,uint128),address,address,bytes))
// 0xdfde5b3e: error UniPoolPairExcessiveSpread()
// 0xe1e46882: function getLastUpdateTimestamp()
// 0xe1fb3cd4: error UniPoolPairEmptyLoanParams()
// 0xe2367b21: function countActiveUserLoans(address)
// 0xe450d38c: error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)
// 0xe602df05: error ERC20InvalidApprover(address approver)
// 0xe6402844: error UniPoolPairZeroAddress()
// 0xe9552f2d: function setBorrowLimitBps(uint16,bool)
// 0xea7cad4f: error UniPoolPairInvalidPath()
// 0xec442f05: error ERC20InvalidReceiver(address receiver)
// 0xeee7f885: function setLiquidationPenaltyBps(uint16)
// 0xf56f7be8a3be7a7223fe58b2c0184f50b4cdba5c0e982ddd07ffffa93f9ab856: event TickDataUpdated(uint256,uint256,uint128,uint128,bool)
// 0xf645eedf: error ECDSAInvalidSignature()
// 0xf6747d88: error UniPoolPairInsufficientOutput()
// 0xf6ea8ca6: error UniPoolPairExceedsMaxBorrowable(bool isToken0, int16 tick, uint256 desiredAmount, uint256 availableAmount)
// 0xf92ee8a9: error InvalidInitialization()
// 0xfb8f41b2: error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)
// 0xfce698f7: error ECDSAInvalidSignatureLength(uint256 length)
// 0xfe4bd091: function getInterestMultiplier1()
