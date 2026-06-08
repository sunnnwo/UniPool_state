export const EnsoLibAbi = [
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
// 0x5274afe7: error SafeERC20FailedOperation(address token)
// 0xcae534d9: error EnsoLibSwapFailed(bytes returnData)
