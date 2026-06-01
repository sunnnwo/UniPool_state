// ═══════════════════════════════════════════════════════════════════════════════
// factory.ts — Factory 스마트 컨트랙트 ABI 정의
//
// ■ ABI(Application Binary Interface)란?
//   스마트 컨트랙트와 외부 세계(브라우저, 앱)가 소통하는 "설명서".
//   컨트랙트에 어떤 함수가 있고, 어떤 파라미터를 받고, 뭘 반환하는지 기술한 JSON.
//   ABI 없이는 컨트랙트 함수 이름/파라미터를 인코딩/디코딩할 수 없다.
//
//   비유: ABI = "이 기계를 쓰려면 레버 A를 누르고, B 슬롯에 넣어야 합니다"라는 매뉴얼.
//
// ■ stateMutability(상태 변경성)이란?
//   함수가 블록체인 상태를 바꾸는지 여부.
//   - 'view'  : 읽기만 함 → 가스비 없음, 즉시 응답.
//   - 'pure'  : 블록체인 데이터조차 안 읽음 → 항상 같은 값 반환 (상수).
//   - (없음)  : 쓰기 포함 → 트랜잭션 발생 → 가스비 필요, 수 초 대기.
//   이 파일의 모든 함수는 'view' 또는 'pure' → 가스비 없이 즉시 읽기 가능.
//
// ■ 솔리디티 숫자 타입이란?
//   uint8   : 0 ~ 255 (2^8 - 1)
//   uint16  : 0 ~ 65,535 (2^16 - 1)
//   uint32  : 0 ~ 4,294,967,295 (2^32 - 1)
//   uint128 : 0 ~ 2^128 - 1 (매우 큰 수)
//   uint256 : 0 ~ 2^256 - 1 (JavaScript number 한계 초과 → bigint 사용)
//   int16   : -32,768 ~ 32,767 (음수 가능 → tickBuffer에 사용)
//
// ■ tuple이란?
//   여러 필드를 묶은 구조체(struct). 솔리디티의 struct가 ABI에서 tuple로 표현됨.
//   viem은 tuple을 받으면 필드명이 있는 JavaScript 객체로 자동 변환한다.
//
// ■ as const란?
//   배열/객체를 "읽기 전용 리터럴 타입"으로 고정.
//   viem이 ABI 배열의 타입을 정확히 추론하는 데 필수.
// ═══════════════════════════════════════════════════════════════════════════════

export const FACTORY_ABI = [
  // ─── 페어(Pair) 목록 관련 ────────────────────────────────────────────────

  {
    // 이 Factory가 지금까지 생성한 Pair(유동성 풀) 총 개수를 반환.
    // 반환 타입: uint256 → JavaScript에서 bigint.
    // 사용처: fetchAllPairs에서 인덱스 0~(length-1)까지 getPairAtIndex를 호출하는 루프 상한값.
    type: 'function',
    name: 'getAllPairsLength',
    inputs: [],
    outputs: [{ name: 'length_', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    // 인덱스로 특정 Pair의 컨트랙트 주소를 조회.
    // index: 0 ~ (getAllPairsLength - 1) 범위.
    // 반환: address (0x로 시작하는 42자리 16진수 문자열)
    //
    // 사용 흐름:
    //   1. getAllPairsLength → 총 2개
    //   2. getPairAtIndex(0) → 0xPair1주소
    //   3. getPairAtIndex(1) → 0xPair2주소
    type: 'function',
    name: 'getPairAtIndex',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [{ name: 'pair_', type: 'address' }],
    stateMutability: 'view'
  },

  // ─── 핵심 주소(address) 조회 ──────────────────────────────────────────────

  {
    // 유휴 자금을 Aave에 예치하는 Vault 컨트랙트 주소.
    // Pair 풀에서 당장 쓰이지 않는 토큰을 Aave에 보내 이자를 버는 금고.
    // 반환값을 fetchVaultData의 vaultAddress 인자로 넘긴다.
    type: 'function',
    name: 'getVault',
    inputs: [],
    outputs: [{ name: 'vault_', type: 'address' }],
    stateMutability: 'view'
  },
  {
    // Aave 대출 풀 컨트랙트 주소.
    // Vault가 토큰을 예치/인출할 때 사용하는 Aave V3 Pool 컨트랙트.
    // Aave V3 Arbitrum: 0x794a61358D6845594F94dc1DB02A252b5b4814aD (실측값)
    type: 'function',
    name: 'getAavePool',
    inputs: [],
    outputs: [{ name: 'aavePool_', type: 'address' }],
    stateMutability: 'view'
  },
  {
    // Beacon Proxy 패턴에서 "현재 구현체(implementation)" 주소를 가리키는 Beacon 컨트랙트 주소.
    //
    // Beacon Proxy 패턴 동작 방식:
    //   [Pair 컨트랙트] → getBeaconAddress() 조회 → [Beacon] → [구현체]
    //   프로토콜 팀이 구현체를 업그레이드하면:
    //     Beacon.setImplementation(새주소) → 모든 Pair가 동시에 새 버전 사용
    //   → Pair 하나하나를 업그레이드할 필요 없음 (가스비/시간 절약).
    type: 'function',
    name: 'getBeaconAddress',
    inputs: [],
    outputs: [{ name: 'beacon_', type: 'address' }],
    stateMutability: 'view'
  },
  {
    // 프로토콜 수수료(feePool)가 쌓이는 수취 주소.
    // 스왑 시 발생한 Pool Fee가 이 주소로 전송된다.
    // 3개 체인 모두 동일 주소(0x1D13...502a)를 사용 중 (실측값).
    type: 'function',
    name: 'getFeeCollector',
    inputs: [],
    outputs: [{ name: 'feeCollector_', type: 'address' }],
    stateMutability: 'view'
  },

  // ─── 수수료(Fee) 파라미터 ─────────────────────────────────────────────────

  {
    // 스왑(토큰 교환) 시 부과되는 수수료 구조를 반환.
    // 세 값을 동시에 반환 → viem multicall에서 배열 [feeLp, feePool, burnFee]로 받음.
    //
    // feeLpBps_  : LP(Liquidity Provider, 유동성 공급자)에게 돌아가는 수수료.
    //              풀에 유동성을 제공한 대가로 받는 이자 개념.
    //              실측값: 425 bps = 4.25%
    //
    // feePoolBps_: 프로토콜 운영을 위해 feeCollector 주소로 전송되는 수수료.
    //              실측값: 75 bps = 0.75%
    //
    // burnFeeBps_: 스왑 시 LP 토큰의 일부를 소각(burn, 영구 삭제)하는 수수료.
    //              소각 → LP 토큰 총 공급량 감소 → 남은 토큰 가치 상승.
    //              실측값: 10 bps = 0.10%
    //
    // 총 스왑 수수료 = 4.25% + 0.75% + 0.10% = 5.10%
    type: 'function',
    name: 'getFeesBps',
    inputs: [],
    outputs: [
      { name: 'feeLpBps_', type: 'uint16' },
      { name: 'feePoolBps_', type: 'uint16' },
      { name: 'burnFeeBps_', type: 'uint16' }
    ],
    stateMutability: 'view'
  },

  // ─── 이자율 모델(IRM) 파라미터 ────────────────────────────────────────────

  {
    // Kinked IRM(꺾임 이자율 모델) 파라미터를 tuple로 반환.
    //
    // ※ Factory vs Pair 차이:
    //   Factory: tuple 1개 반환 (모든 Pair의 기본값)
    //   Pair:    tuple 2개 반환 (token0용 / token1용 각각 따로)
    //
    // 실측값: [1500, 9000, 0, 1500, 18500]
    //
    // protocolFeeBps     (uint16): 이자 수익의 프로토콜 몫 → 1500 = 15.00%
    //   예) 대출자가 100원 이자 납부 → 15원은 프로토콜, 85원은 LP에게
    //
    // optimalPointBps    (uint16): 이자율 곡선 꺾임점 → 9000 = 90%
    //   사용률(=빌려간양/총예치량)이 90% 미만: 완만한 이자율 증가
    //   사용률이 90% 초과: 이자율 급등 → 과도한 대출 억제
    //
    // interestRateBaseBps  (uint32): 사용률 0%일 때 기본 연이자율 → 0 = 0.00%
    //   아무도 안 빌려가는 상태의 이자율. 대부분 0으로 설정.
    //
    // interestRateOptimalBps (uint32): 꺾임점(90%) 사용률에서의 연이자율 → 1500 = 15.00%
    //   적정 수준의 유동성 활용 시 대출자가 내는 목표 이자율.
    //
    // interestRateAddBps   (uint32): 꺾임점 초과 시 추가 이자율 → 18500 = 185.00%
    //   사용률이 90%를 넘으면 이 이자율이 급격히 더해짐 → 강한 억제 효과.
    //
    //  이자율(%)
    //  200%  │                                      ╱ (90% 초과 시 +185%/기울기)
    //   15%  │                         ●────────╱  ← optimalPoint (90%)
    //    0%  │─────────────────────────           ← baseRate (0%)
    //        └───────────────────────────────────── 사용률 (0% ~ 100%)
    //
    // 반환 구조: 단일 named tuple → viem이 필드명 있는 객체로 변환
    type: 'function',
    name: 'getInterestParamsBps',
    inputs: [],
    outputs: [
      {
        name: 'params_',
        type: 'tuple',
        components: [
          { name: 'protocolFeeBps', type: 'uint16' },
          { name: 'optimalPointBps', type: 'uint16' },
          // uint32: 이자율이 100% 넘을 수 있어서 uint16(최대 65535=655.35%) 이내지만
          //         더 명확하게 구분하기 위해 uint32 사용.
          { name: 'interestRateBaseBps', type: 'uint32' },
          { name: 'interestRateOptimalBps', type: 'uint32' },
          { name: 'interestRateAddBps', type: 'uint32' }
        ]
      }
    ],
    stateMutability: 'view'
  },

  // ─── 대출(Borrow) / 청산(Liquidation) 파라미터 ──────────────────────────

  {
    // 담보(collateral) 가치 대비 최대 대출 가능 비율 (LTV, Loan-to-Value).
    // 실측값: 8500 = 85.00%
    //
    // 예) 담보로 100 USDC를 맡기면 최대 85 USDC까지 빌릴 수 있음.
    //
    // LTV가 높을수록:
    //   장점: 더 많이 빌릴 수 있음 (레버리지 효과 높음)
    //   단점: 가격 변동 시 청산 위험 증가
    type: 'function',
    name: 'getBorrowLimitBps',
    inputs: [],
    outputs: [{ name: 'borrowLimitBps_', type: 'uint16' }],
    stateMutability: 'view'
  },
  {
    // 청산(liquidation) 발생 시 청산자(liquidator)에게 주는 보상 비율.
    // 실측값: 1500 = 15.00%
    //
    // 청산이란?
    //   대출 포지션의 담보 가치가 빌린 금액 이하로 떨어지면
    //   누구든 그 포지션을 강제로 청산할 수 있음.
    //   청산자는 담보를 시장가보다 15% 싸게 사는 혜택을 받음.
    //   → 이 혜택이 있어야 청산자가 청산을 적극적으로 실행 → 프로토콜 안정성 유지.
    type: 'function',
    name: 'getLiquidationPenaltyBps',
    inputs: [],
    outputs: [{ name: 'liquidationPenaltyBps_', type: 'uint16' }],
    stateMutability: 'view'
  },
  {
    // 대출 집중도 제한 파라미터 두 가지를 함께 반환.
    //
    // maxBorrowPerTickBps_     (uint32): 하나의 틱(tick) 구간에서 허용하는 최대 대출 비율
    //   실측값: 20000 = 200.00%
    //   틱(tick): 가격 범위를 이산적(discrete, 끊어진) 단계로 나눈 단위 (Uniswap v3 방식).
    //   특정 가격 구간에 대출이 과도하게 집중되면, 그 가격대를 지나는 청산이 한꺼번에 터질 위험.
    //   → 이 한도로 집중 위험(concentration risk) 방지.
    //
    // maxBorrowPerTickRangeBps_ (uint32): 연속된 틱들로 이루어진 범위 전체에서의 최대 대출 비율
    //   실측값: 5250 = 52.50%
    //   더 넓은 가격 구간에서도 과도한 대출을 막음.
    type: 'function',
    name: 'getMaxBorrowPerTickAndRange',
    inputs: [],
    outputs: [
      { name: 'maxBorrowPerTickBps_', type: 'uint32' },
      { name: 'maxBorrowPerTickRangeBps_', type: 'uint32' }
    ],
    stateMutability: 'view'
  },

  // ─── 가격 / 틱 파라미터 ───────────────────────────────────────────────────

  {
    // 가상 가격(virtual price)이 실제 시장가로 수렴하는 속도.
    //
    // UniPool의 비대칭 가격(Asymmetric Price) 모델:
    //   - 일반 AMM(Uniswap v2 등): 살 때와 팔 때 가격이 다르지 않음.
    //   - UniPool: Virtual Reserve를 통해 매수가 ≠ 매도가 (스프레드 발생).
    //   - priceDecay: 거래가 없으면 이 속도로 시간이 지날수록 매수/매도가가 시장가로 수렴.
    //
    // 반환 타입: uint128 → JavaScript bigint (큰 수 처리 필요)
    // 화면에는 .toString()으로 그대로 표시 (단위 의미 불명확 → 원시값 표시).
    type: 'function',
    name: 'getPriceDecay',
    inputs: [],
    outputs: [{ name: 'priceDecay_', type: 'uint128' }],
    stateMutability: 'view'
  },
  {
    // 스왑 실행 시 허용하는 최대 슬리피지(slippage) 한도.
    //
    // 슬리피지란?
    //   사용자가 예상한 체결 가격과 실제 체결 가격의 차이.
    //   유동성이 부족하거나 큰 금액을 한 번에 스왑하면 슬리피지 증가.
    //   이 값을 초과하면 트랜잭션이 자동으로 실패(revert) → 사용자 보호.
    //
    // 예) 0.5% 슬리피지 허용 → 1 ETH → 예상 2000 USDC, 최소 1990 USDC는 보장.
    type: 'function',
    name: 'getSwapPriceToleranceBps',
    inputs: [],
    outputs: [{ name: 'toleranceBps_', type: 'uint16' }],
    stateMutability: 'view'
  },
  {
    // 청산 계산 시 가격 구간(tick)에 추가하는 여유 버퍼(buffer).
    //
    // 왜 필요한가?
    //   가격이 급격히 움직이면 계산 시점과 실제 청산 시점의 가격이 다를 수 있음.
    //   이 버퍼(여유 틱 수)를 추가해 즉각 청산을 방지 → 포지션에 약간의 안전마진 제공.
    //
    // 반환 타입: int16 (부호 있는 정수 → 음수 가능)
    type: 'function',
    name: 'getTickBuffer',
    inputs: [],
    outputs: [{ name: 'tickBuffer_', type: 'int16' }],
    stateMutability: 'view'
  }
] as const; // as const: viem이 ABI를 읽기 전용 리터럴 타입으로 처리하기 위해 필수.
