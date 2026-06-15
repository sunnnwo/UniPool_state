import { isAddress } from 'viem';
import type { ChainKey } from './chains';
import { UniPoolFactoryAbi } from '../../abi/UniPoolFactory';
import { UniPoolPairAbi } from '../../abi/UniPoolPair';
import { UniPoolVaultAbi } from '../../abi/UniPoolVault';

export type SafeConfig = { chainId: string; address: `0x${string}`; url: string };

export const SAFE_BY_CHAIN: Partial<Record<ChainKey, SafeConfig>> = {
	ethereum: {
		chainId: '1',
		address: '0x1E3e1128F6bC2264a19D7a065982696d356879c5',
		url: 'https://app.safe.global/home?safe=eth:0x1E3e1128F6bC2264a19D7a065982696d356879c5'
	},
	arbitrum: {
		chainId: '42161',
		address: '0xc6b1e7F76DfC2eEE534200a0182F136775789142',
		url: 'https://app.safe.global/home?safe=arb1:0xc6b1e7F76DfC2eEE534200a0182F136775789142'
	},
	base: {
		chainId: '8453',
		address: '0xf0a20057518FAf9cDA82fA82D795a4F4770e1951',
		url: 'https://app.safe.global/home?safe=base:0xf0a20057518FAf9cDA82fA82D795a4F4770e1951'
	},
	bsc: {
		chainId: '56',
		address: '0x44b6A0e4CEB9ded60fEE3AcB6D8405241DE0b325',
		url: 'https://app.safe.global/home?safe=bnb:0x44b6A0e4CEB9ded60fEE3AcB6D8405241DE0b325'
	}
};

export type EditFieldType = 'address' | 'address[]' | 'bool' | 'uint16' | 'uint32' | 'uint128' | 'int16';

export type EditField = {
	key: string;
	label: string;
	type: EditFieldType;
	value: string;
};

export type ContractKind = 'factory' | 'pair' | 'vault';

export type EditDraft = {
	chainKey: ChainKey;
	chainName: string;
	targetLabel: string;
	targetAddress: `0x${string}`;
	contractKind: ContractKind;
	functionName: string;
	title: string;
	fields: EditField[];
	buildArgs: (values: Record<string, unknown>) => readonly unknown[];
};

export type SafeTransaction = {
	to: `0x${string}`;
	value: string;
	data: '';
	contractMethod: {
		contractName: string;
		inputs: readonly unknown[];
		name: string;
		payable: boolean;
	};
	contractInputsValues: Record<string, string>;
};

const ABI_BY_KIND = {
	factory: UniPoolFactoryAbi,
	pair: UniPoolPairAbi,
	vault: UniPoolVaultAbi
} as const;

const CONTRACT_NAME_BY_KIND: Record<ContractKind, string> = {
	factory: 'UniPoolFactory',
	pair: 'UniPoolPair',
	vault: 'UniPoolVault'
};

const LIMITS = {
	uint16: { min: 0n, max: 65_535n },
	uint32: { min: 0n, max: 4_294_967_295n },
	uint128: { min: 0n, max: 340_282_366_920_938_463_463_374_607_431_768_211_455n },
	int16: { min: -32_768n, max: 32_767n }
} as const;

export function parseEditValues(fields: EditField[], rawValues: Record<string, string>) {
	const parsed: Record<string, unknown> = {};

	for (const field of fields) {
		const raw = rawValues[field.key]?.trim() ?? '';
		if (!raw) return { error: `${field.label} is required.`, values: parsed };

		if (field.type === 'address') {
			if (!isAddress(raw)) return { error: `${field.label} must be a valid address.`, values: parsed };
			parsed[field.key] = raw as `0x${string}`;
			continue;
		}

		if (field.type === 'address[]') {
			const addresses = raw
				.split(/[\s,]+/)
				.map((address) => address.trim())
				.filter(Boolean);
			const invalid = addresses.find((address) => !isAddress(address));
			if (invalid) return { error: `${field.label} contains an invalid address: ${invalid}.`, values: parsed };
			parsed[field.key] = addresses as `0x${string}`[];
			continue;
		}

		if (field.type === 'bool') {
			const normalized = raw.toLowerCase();
			if (normalized !== 'true' && normalized !== 'false') {
				return { error: `${field.label} must be true or false.`, values: parsed };
			}
			parsed[field.key] = normalized === 'true';
			continue;
		}

		if (!/^-?\d+$/.test(raw)) return { error: `${field.label} must be an integer.`, values: parsed };
		const value = BigInt(raw);
		const limit = LIMITS[field.type];
		if (value < limit.min || value > limit.max) {
			return { error: `${field.label} must be between ${limit.min} and ${limit.max}.`, values: parsed };
		}
		parsed[field.key] = field.type === 'uint128' ? value : Number(value);
	}

	return { values: parsed };
}

type AbiInput = {
	name?: string;
};

function formatSafeInputValue(value: unknown): string {
	if (typeof value === 'bigint') return value.toString();
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (Array.isArray(value)) return `[${value.map(formatSafeInputValue).join(',')}]`;
	if (value && typeof value === 'object') {
		return JSON.stringify(value, (_, nestedValue) =>
			typeof nestedValue === 'bigint' ? nestedValue.toString() : nestedValue
		);
	}
	return '';
}

function buildContractInputsValues(inputs: readonly AbiInput[], args: readonly unknown[]) {
	return Object.fromEntries(
		inputs.map((input, index) => [input.name || String(index), formatSafeInputValue(args[index])])
	);
}

export function buildSafeTransaction(draft: EditDraft, values: Record<string, unknown>): SafeTransaction {
	const abi = ABI_BY_KIND[draft.contractKind];
	const args = draft.buildArgs(values);
	const method = abi.find(
		(item) => item.type === 'function' && item.name === draft.functionName
	);
	const inputs = method?.type === 'function' ? method.inputs : [];

	return {
		to: draft.targetAddress,
		value: '0',
		data: '',
		contractMethod: {
			contractName: CONTRACT_NAME_BY_KIND[draft.contractKind],
			inputs,
			name: draft.functionName,
			payable: method?.type === 'function' ? method.stateMutability === 'payable' : false
		},
		contractInputsValues: buildContractInputsValues(inputs, args)
	};
}

export function buildSafeJson(chainKey: ChainKey, transactions: SafeTransaction[]) {
	const safe = SAFE_BY_CHAIN[chainKey];
	if (!safe) throw new Error(`Safe is not configured for ${chainKey}.`);
	return {
		chainId: safe.chainId,
		createdAt: Date.now(),
		meta: {
			name: 'Transactions Batch',
			createdFromSafeAddress: safe.address
		},
		transactions
	};
}

export const editIconLabel = 'Edit setting';
