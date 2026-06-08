export const SweepModuleAbi = [
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
    "name": "SweepModuleInsufficientETH",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SweepModuleInsufficientToken",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SweepModuleZeroAddress",
    "inputs": []
  }
] as const;
// 0x2e272566: error SweepModuleZeroAddress()
// 0x5274afe7: error SafeERC20FailedOperation(address token)
// 0x913ecd6f: error SweepModuleInsufficientToken()
// 0xbde16eee: error SweepModuleInsufficientETH()
