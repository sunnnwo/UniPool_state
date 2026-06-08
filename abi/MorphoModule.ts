export const MorphoModuleAbi = [
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
  }
] as const;
// 0x31f57072: function onMorphoFlashLoan(uint256,bytes)
// 0x347ebdfb: error MorphoUnexpectedCallback()
// 0x3b7a9cbc: error MorphoOnlyMorpho()
// 0xbc9e7d3f: error MorphoZeroAddress()
