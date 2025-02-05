import { Address, Connector, ConnectorData } from "@wagmi/core";
import { Chain } from "@wagmi/core/chains";
import pkg, { IWeb3Auth, SafeEventEmitterProvider, WALLET_ADAPTER_TYPE } from "@web3auth/base";
import type { IWeb3AuthModal, ModalConfig } from "@web3auth/modal";
import type { OpenloginLoginParams } from "@web3auth/openlogin-adapter";
import { Signer } from "ethers";
import type { Options } from "./interfaces";
export declare class Web3AuthConnector extends Connector<SafeEventEmitterProvider, Options, Signer> {
    ready: boolean;
    readonly id = "web3auth";
    readonly name = "Web3Auth";
    provider: SafeEventEmitterProvider | null;
    web3AuthInstance: IWeb3Auth | IWeb3AuthModal;
    initialChainId: number;
    loginParams: OpenloginLoginParams | null;
    modalConfig: Record<WALLET_ADAPTER_TYPE, ModalConfig> | null;
    constructor({ chains, options }: {
        chains?: Chain[];
        options: Options;
    });
    connect(): Promise<Required<ConnectorData>>;
    getAccount(): Promise<Address>;
    getProvider(): Promise<pkg.SafeEventEmitterProvider>;
    getSigner(): Promise<Signer>;
    isAuthorized(): Promise<boolean>;
    getChainId(): Promise<number>;
    switchChain(chainId: number): Promise<Chain>;
    disconnect(): Promise<void>;
    protected onAccountsChanged(accounts: string[]): void;
    protected isChainUnsupported(chainId: number): boolean;
    protected onChainChanged(chainId: string | number): void;
    protected onDisconnect(): void;
}
