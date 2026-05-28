// ─── Vault ABI ────────────────────────────────────────────────────────────────
// 실제 온체인 검증 완료 (Arbitrum Vault: 0xabD8DC06559634e59F6698c33A5E65e90e917b91)
//
// ── tuple 검증 ────────────────────────────────────────────────────────────────
// getAssetData:       128바이트 = 32×4 → tuple 하나, 4개 필드
//   [0] yieldAccumulator     (uint256) — 현재 누적 수익 배율
//   [1] lastYieldAccumulator (uint256) — 이전 누적 수익 배율
//   [2] 1 (bool)             — isActive: 이 자산이 활성 상태인지
//   [3] 1 (bool)             — isSupported: 이 자산이 지원되는지
//
// getAaveTokenSupport: 128바이트 = 32×4 → tuple 하나, 4개 필드
//   검증 결과: WETH, USDT 모두 전부 0 → 이 Vault는 Aave 미사용
//   필드 구조는 ABI 기준으로 정의만 해둠

export const VAULT_ABI = [
	// ─── 인자 없는 함수 ──────────────────────────────────────────────────────────
	{
		// 32바이트 → address
		type: 'function',
		name: 'getFactory',
		inputs: [],
		outputs: [{ name: 'factory_', type: 'address' }],
		stateMutability: 'view'
	},
	{
		// 32바이트 → address
		type: 'function',
		name: 'getAavePool',
		inputs: [],
		outputs: [{ name: 'aavePool_', type: 'address' }],
		stateMutability: 'view'
	},

	// ─── 토큰 주소를 인자로 받는 함수 ────────────────────────────────────────────
	// 아래 4개는 모두 Pair의 token0 또는 token1 주소를 인자로 넘김
	{
		// 128바이트 = 32×4 → tuple 하나 (4개 필드)
		// ┌─ 검증: WETH → [5867..., 5862..., 1, 1] / USDT → [73754..., 73648..., 1, 1]
		// yieldAccumulator:     현재 누적 수익 배율 (RAY 단위 아님, 절대값)
		// lastYieldAccumulator: 직전 업데이트 시점의 누적값 → 두 값의 차이로 기간 수익 계산
		// isActive:   이 자산이 현재 활성화된 상태인지 (bool)
		// isSupported: 이 Vault에서 지원하는 자산인지 (bool)
		type: 'function',
		name: 'getAssetData',
		inputs: [{ name: 'asset', type: 'address' }],
		outputs: [
			{
				name: 'data_',
				type: 'tuple',
				components: [
					{ name: 'yieldAccumulator', type: 'uint256' },
					{ name: 'lastYieldAccumulator', type: 'uint256' },
					{ name: 'isActive', type: 'bool' },
					{ name: 'isSupported', type: 'bool' }
				]
			}
		],
		stateMutability: 'view'
	},
	{
		// 32바이트 → bool
		// true: 이 자산이 현재 유휴(idle) 상태 — Aave에 예치되지 않고 Vault에 그냥 있음
		// false: Aave에 예치되어 수익을 내는 중
		type: 'function',
		name: 'getAssetStatus',
		inputs: [{ name: 'asset', type: 'address' }],
		outputs: [{ name: 'isIdle_', type: 'bool' }],
		stateMutability: 'view'
	},
	{
		// 128바이트 = 32×4 → tuple 하나 (4개 필드)
		// ┌─ 검증: WETH, USDT 모두 전부 0 → 이 Vault는 Aave 미사용
		// isSupported:    이 토큰이 Aave에서 지원되는지
		// aToken:         Aave에서 이 토큰에 대응하는 aToken 주소 (예치 시 받는 이자 토큰)
		// currentBalance: Aave에 예치된 현재 잔액
		// targetBalance:  목표 예치 잔액
		type: 'function',
		name: 'getAaveTokenSupport',
		inputs: [{ name: 'asset', type: 'address' }],
		outputs: [
			{
				name: 'support_',
				type: 'tuple',
				components: [
					{ name: 'isSupported', type: 'bool' },
					{ name: 'aToken', type: 'address' },
					{ name: 'currentBalance', type: 'uint256' },
					{ name: 'targetBalance', type: 'uint256' }
				]
			}
		],
		stateMutability: 'view'
	},
	{
		// 32바이트 → uint256
		// 이 토큰의 누적 수익값 — getAssetData의 yieldAccumulator와 동일한 값
		// 브리프에 별도 함수로 나와 있어서 분리해둠
		type: 'function',
		name: 'getYieldAccumulator',
		inputs: [{ name: 'asset', type: 'address' }],
		outputs: [{ name: 'accumulator_', type: 'uint256' }],
		stateMutability: 'view'
	}
] as const;
