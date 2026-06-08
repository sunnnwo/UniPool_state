export const UniPoolVaultAbi = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "MIN_COLLATERAL",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint128",
        "internalType": "uint128"
      }
    ],
    "stateMutability": "view"
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
    "name": "calcLoanHash",
    "inputs": [
      {
        "name": "loanId",
        "type": "uint256",
        "internalType": "LoanId"
      },
      {
        "name": "pair",
        "type": "address",
        "internalType": "contract IUniPoolPair"
      }
    ],
    "outputs": [
      {
        "name": "loanHash_",
        "type": "bytes32",
        "internalType": "LoanHash"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "calcTickHash",
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
      },
      {
        "name": "asset",
        "type": "address",
        "internalType": "contract IERC20"
      },
      {
        "name": "pair",
        "type": "address",
        "internalType": "contract IUniPoolPair"
      }
    ],
    "outputs": [
      {
        "name": "tickHash_",
        "type": "bytes32",
        "internalType": "TickHash"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "deposit",
    "inputs": [
      {
        "name": "loanId",
        "type": "uint256",
        "internalType": "LoanId"
      },
      {
        "name": "loan",
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
        "name": "asset",
        "type": "address",
        "internalType": "contract IERC20"
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
    "name": "deposit",
    "inputs": [
      {
        "name": "loanIds",
        "type": "uint256[]",
        "internalType": "LoanId[]"
      },
      {
        "name": "loans",
        "type": "tuple[]",
        "internalType": "struct LoanInfo[]",
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
        "name": "asset",
        "type": "address",
        "internalType": "contract IERC20"
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
    "name": "getAavePool",
    "inputs": [],
    "outputs": [
      {
        "name": "pool_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAaveTokenSupport",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "outputs": [
      {
        "name": "aaveStatus_",
        "type": "tuple",
        "internalType": "struct AaveAssetSupport",
        "components": [
          {
            "name": "supported",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "frozen",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "paused",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "migrateAsset",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAssetData",
    "inputs": [
      {
        "name": "asset",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "outputs": [
      {
        "name": "data_",
        "type": "tuple",
        "internalType": "struct AssetData",
        "components": [
          {
            "name": "totalBalance",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalShares",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "isIdle",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "forceIdle",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAssetStatus",
    "inputs": [
      {
        "name": "asset",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "outputs": [
      {
        "name": "isIdle_",
        "type": "bool",
        "internalType": "bool"
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
    "name": "getLoanShares",
    "inputs": [
      {
        "name": "loanId",
        "type": "uint256",
        "internalType": "LoanId"
      },
      {
        "name": "pair",
        "type": "address",
        "internalType": "contract IUniPoolPair"
      }
    ],
    "outputs": [
      {
        "name": "shares_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTickShares",
    "inputs": [
      {
        "name": "tickHash",
        "type": "bytes32",
        "internalType": "TickHash"
      }
    ],
    "outputs": [
      {
        "name": "shares_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getYieldAccumulator",
    "inputs": [
      {
        "name": "asset",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "outputs": [
      {
        "name": "yieldAccumulator_",
        "type": "uint256",
        "internalType": "uint256"
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
        "name": "factory",
        "type": "address",
        "internalType": "contract IUniPoolFactory"
      },
      {
        "name": "aavePool",
        "type": "address",
        "internalType": "contract IPool"
      }
    ],
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
    "name": "previewWithdrawTick",
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
      },
      {
        "name": "pair",
        "type": "address",
        "internalType": "contract IUniPoolPair"
      },
      {
        "name": "asset",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "outputs": [
      {
        "name": "amount_",
        "type": "uint256",
        "internalType": "uint256"
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
    "name": "setForceIdle",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "contract IERC20"
      },
      {
        "name": "forceIdle",
        "type": "bool",
        "internalType": "bool"
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
    "type": "function",
    "name": "withdraw",
    "inputs": [
      {
        "name": "loanId",
        "type": "uint256",
        "internalType": "LoanId"
      },
      {
        "name": "loan",
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
        "name": "asset",
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
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawTick",
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
      },
      {
        "name": "asset",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "DepositCollateral",
    "inputs": [
      {
        "name": "pair",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "asset",
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
        "name": "collateral",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ForceAssetIdle",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "forceIdle",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
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
    "name": "MigratedCollateral",
    "inputs": [
      {
        "name": "asset",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "toAave",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
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
    "name": "TickCollateralLiquidated",
    "inputs": [
      {
        "name": "pair",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "asset",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "liquidatedCollateral",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "tickNumber",
        "type": "int16",
        "indexed": false,
        "internalType": "int16"
      },
      {
        "name": "tickVersion",
        "type": "uint232",
        "indexed": false,
        "internalType": "uint232"
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
    "type": "event",
    "name": "WithdrawCollateral",
    "inputs": [
      {
        "name": "pair",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "asset",
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
        "name": "to",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "collateral",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
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
    "name": "ReentrancyGuardReentrantCall",
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
    "name": "UniPoolVaultAssetIsFrozen",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultAssetIsPaused",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultEmptyTickCollateral",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultExistingStatus",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultInvalidAmountReceived",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultInvalidLoan",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultInvalidPair",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultInvalidTick",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultLoanAlreadyExists",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultNoLiquidityIndex",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultUnderMinDeposit",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultUnderMinWithdrawal",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UniPoolVaultZeroShares",
    "inputs": []
  }
] as const;
// 0x0a34cfaf: error UniPoolVaultEmptyTickCollateral()
// 0x0bc9a2a4: function withdrawTick(int16,uint232,address)
// 0x118cdaa7: error OwnableUnauthorizedAccount(address account)
// 0x11d98dc5: error UniPoolVaultInvalidPair()
// 0x13561b55: function getAavePool()
// 0x1652e7b7: function getAssetData(address)
// 0x1c1fd858: function calcLoanHash(uint256,address)
// 0x1e4fbdf7: error OwnableInvalidOwner(address owner)
// 0x2544cc6b: function deposit(uint256,(bool,int16,uint232,address,uint96,uint128,uint128,uint256),address,bytes)
// 0x28045490: function previewWithdrawTick(int16,uint232,address,address)
// 0x2a50e729: function withdraw(uint256,(bool,int16,uint232,address,uint96,uint128,uint128,uint256),address,uint256,address)
// 0x2dcec770: function getAssetStatus(address)
// 0x34a28087: error UniPoolVaultZeroShares()
// 0x36910efe: error UniPoolVaultLoanAlreadyExists()
// 0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700: event OwnershipTransferStarted(address,address)
// 0x3ee5aeb5: error ReentrancyGuardReentrantCall()
// 0x48095b325c91d8b0d519c661ccc0884da94d9e4110d933b1683a638048bb1e78: event WithdrawCollateral(address,address,uint256,address,uint256)
// 0x4ab81bce16593ca528aff58022cc29dd44b9f9519eb3db5b8b86a323a4c0889b: event MigratedCollateral(address,bool,uint256)
// 0x4c3095ba: error UniPoolVaultAssetIsPaused()
// 0x4c9c8ce3: error ERC1967InvalidImplementation(address implementation)
// 0x4f1ef286: function upgradeToAndCall(address,bytes)
// 0x5274afe7: error SafeERC20FailedOperation(address token)
// 0x52d1902d: function proxiableUUID()
// 0x540a2aaf: error UniPoolVaultInvalidLoan()
// 0x6e88cb7b: error UniPoolVaultExistingStatus()
// 0x715018a6: function renounceOwnership()
// 0x768df1ee: function calcTickHash(int16,uint232,address,address)
// 0x79ba5097: function acceptOwnership()
// 0x7e211def: function getAaveTokenSupport(address)
// 0x83507dbe: error UniPoolVaultUnderMinDeposit()
// 0x83723a07: function deposit(uint256[],(bool,int16,uint232,address,uint96,uint128,uint128,uint256)[],address,bytes)
// 0x83a07859: function setForceIdle(address,bool)
// 0x88cc58e4: function getFactory()
// 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0: event OwnershipTransferred(address,address)
// 0x8da5cb5b: function owner()
// 0x955c4cd1: function getLoanShares(uint256,address)
// 0x9996b315: error AddressEmptyCode(address target)
// 0x9c34ec21: error UniPoolVaultInvalidAmountReceived()
// 0xa89e8aa7: function getTickShares(bytes32)
// 0xaa1d49a4: error UUPSUnsupportedProxiableUUID(bytes32 slot)
// 0xac10d219b7928ad8d4e8185923b71b7e015ebf3f46ca669bab618fbb27d9a07f: event DepositCollateral(address,address,uint256,uint256)
// 0xad3cb1cc: function UPGRADE_INTERFACE_VERSION()
// 0xb398979f: error ERC1967NonPayable()
// 0xbc6e42b7: error UniPoolVaultUnderMinWithdrawal()
// 0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b: event Upgraded(address)
// 0xc0c53b8b: function initialize(address,address,address)
// 0xc1686054: function getYieldAccumulator(address)
// 0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2: event Initialized(uint64)
// 0xc8101724: error UniPoolVaultInvalidTick()
// 0xd6bda275: error FailedCall()
// 0xd7e6bcf8: error NotInitializing()
// 0xdb82a45d7533da361945d73252d571a465c0481b38db8df87e097895d6043859: event ForceAssetIdle(address,bool)
// 0xe07c8dba: error UUPSUnauthorizedCallContext()
// 0xe30c3978: function pendingOwner()
// 0xf2fde38b: function transferOwnership(address)
// 0xf92ee8a9: error InvalidInitialization()
// 0xfa779648: function MIN_COLLATERAL()
// 0xfd089e60: error UniPoolVaultNoLiquidityIndex()
// 0xfe0892c4: error UniPoolVaultAssetIsFrozen()
// 0xfec322d70eeb99f0d0770c23ecdb0b402fff07d36f9e5369fd855c19a0cfc659: event TickCollateralLiquidated(address,address,uint256,int16,uint232)
