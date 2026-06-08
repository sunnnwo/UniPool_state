export enum WadRayMathRounding {
  Floor,
  Ceil
};

export enum VmSafeCallerMode {
  None,
  Broadcast,
  RecurrentBroadcast,
  Prank,
  RecurrentPrank
};

export enum VmSafeAccountAccessKind {
  Call,
  DelegateCall,
  CallCode,
  StaticCall,
  Create,
  SelfDestruct,
  Resume,
  Balance,
  Extcodesize,
  Extcodehash,
  Extcodecopy
};

export enum VmSafeForgeContext {
  TestGroup,
  Test,
  Coverage,
  Snapshot,
  ScriptGroup,
  ScriptDryRun,
  ScriptBroadcast,
  ScriptResume,
  Unknown
};

export enum VmSafeBroadcastTxType {
  Call,
  Create,
  Create2
};

export enum TickMathRounding {
  Up,
  Down
};

export enum StdCheatsSafeAddressType {
  Payable,
  NonPayable,
  ZeroAddress,
  Precompile,
  ForgeAddress
};

export enum MorphoModuleMorphoMacroType {
  NONE,
  LEVERAGE,
  DELEVERAGE
};

export enum MathRounding {
  Floor,
  Ceil,
  Trunc,
  Expand
};

export enum LegacyTickMathRounding {
  Up,
  Down
};

export enum IUniPoolRouterRouterTradeActionType {
  OPEN,
  CLOSE
};

export enum IUniPoolModulePaymentType {
  None,
  Transfer,
  TransferFrom,
  Permit2
};

export enum ECDSARecoverError {
  NoError,
  InvalidSignature,
  InvalidSignatureLength,
  InvalidSignatureS
};

export enum DataTypesInterestRateMode {
  NONE,
  __DEPRECATED,
  VARIABLE
};
