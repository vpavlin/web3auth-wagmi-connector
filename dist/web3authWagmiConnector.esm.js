import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Connector, UserRejectedRequestError, normalizeChainId } from '@wagmi/core';
import pkg from '@web3auth/base';
import { providers, utils } from 'ethers';
import log from 'loglevel';

const {
  ADAPTER_STATUS,
  WALLET_ADAPTERS,
  CHAIN_NAMESPACES
} = pkg;
const IS_SERVER = typeof window === "undefined";
function isIWeb3AuthModal(obj) {
  return typeof obj.initModal !== "undefined";
}
class Web3AuthConnector extends Connector {
  constructor(_ref) {
    let {
      chains,
      options
    } = _ref;
    super({
      chains,
      options
    });
    _defineProperty(this, "ready", !IS_SERVER);
    _defineProperty(this, "id", "web3auth");
    _defineProperty(this, "name", "Web3Auth");
    _defineProperty(this, "provider", null);
    _defineProperty(this, "web3AuthInstance", void 0);
    _defineProperty(this, "initialChainId", void 0);
    _defineProperty(this, "loginParams", void 0);
    _defineProperty(this, "modalConfig", void 0);
    this.web3AuthInstance = options.web3AuthInstance;
    this.loginParams = options.loginParams || null;
    this.modalConfig = options.modalConfig || null;
    this.initialChainId = chains[0].id;
  }
  async connect() {
    try {
      this.emit("message", {
        type: "connecting"
      });
      if (this.web3AuthInstance.status === ADAPTER_STATUS.NOT_READY) {
        if (isIWeb3AuthModal(this.web3AuthInstance)) {
          await this.web3AuthInstance.initModal({
            modalConfig: this.modalConfig
          });
        } else if (this.loginParams) {
          await this.web3AuthInstance.init();
        } else {
          log.error("please provide a valid loginParams when not using @web3auth/modal");
          throw new UserRejectedRequestError("please provide a valid loginParams when not using @web3auth/modal");
        }
      }
      let {
        provider
      } = this.web3AuthInstance;
      if (!provider) {
        if (isIWeb3AuthModal(this.web3AuthInstance)) {
          provider = await this.web3AuthInstance.connect();
        } else if (this.loginParams) {
          provider = await this.web3AuthInstance.connectTo(WALLET_ADAPTERS.OPENLOGIN, this.loginParams);
        } else {
          log.error("please provide a valid loginParams when not using @web3auth/modal");
          throw new UserRejectedRequestError("please provide a valid loginParams when not using @web3auth/modal");
        }
      }
      const signer = await this.getSigner();
      const account = await signer.getAddress();
      provider.on("accountsChanged", this.onAccountsChanged.bind(this));
      provider.on("chainChanged", this.onChainChanged.bind(this));
      const chainId = await this.getChainId();
      const unsupported = this.isChainUnsupported(chainId);
      return {
        account,
        chain: {
          id: chainId,
          unsupported
        },
        provider
      };
    } catch (error) {
      log.error("error while connecting", error);
      throw new UserRejectedRequestError("Something went wrong");
    }
  }
  async getAccount() {
    const provider = new providers.Web3Provider(await this.getProvider());
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    return account;
  }
  async getProvider() {
    if (this.provider) {
      return this.provider;
    }
    this.provider = this.web3AuthInstance.provider;
    return this.provider;
  }
  async getSigner() {
    const provider = new providers.Web3Provider(await this.getProvider());
    const signer = provider.getSigner();
    return signer;
  }
  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!(account && this.provider);
    } catch {
      return false;
    }
  }
  async getChainId() {
    try {
      if (this.provider) {
        const chainId = await this.provider.request({
          method: "eth_chainId"
        });
        if (chainId) {
          return normalizeChainId(chainId);
        }
      }
      if (this.initialChainId) {
        return this.initialChainId;
      }
      throw new Error("Chain ID is not defined");
    } catch (error) {
      log.error("error", error);
      throw error;
    }
  }
  async switchChain(chainId) {
    try {
      var _chain$blockExplorers, _chain$blockExplorers2, _chain$nativeCurrency, _chain$nativeCurrency2;
      const chain = this.chains.find(x => x.id === chainId);
      if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);
      const provider = await this.getProvider();
      if (!provider) throw new Error("Please login first");
      await this.web3AuthInstance.addChain({
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: `0x${chain.id.toString(16)}`,
        rpcTarget: chain.rpcUrls.default.http[0],
        displayName: chain.name,
        blockExplorer: (_chain$blockExplorers = chain.blockExplorers) === null || _chain$blockExplorers === void 0 ? void 0 : (_chain$blockExplorers2 = _chain$blockExplorers.default) === null || _chain$blockExplorers2 === void 0 ? void 0 : _chain$blockExplorers2.url,
        ticker: ((_chain$nativeCurrency = chain.nativeCurrency) === null || _chain$nativeCurrency === void 0 ? void 0 : _chain$nativeCurrency.symbol) || "ETH",
        tickerName: ((_chain$nativeCurrency2 = chain.nativeCurrency) === null || _chain$nativeCurrency2 === void 0 ? void 0 : _chain$nativeCurrency2.name) || "Ethereum",
        decimals: chain.nativeCurrency.decimals || 18
      });
      await this.web3AuthInstance.switchChain({
        chainId: `0x${chain.id.toString(16)}`
      });
      return chain;
    } catch (error) {
      log.error("Error: Cannot change chain", error);
      throw error;
    }
  }
  async disconnect() {
    await this.web3AuthInstance.logout();
    this.provider = null;
  }
  onAccountsChanged(accounts) {
    if (accounts.length === 0) this.emit("disconnect");else this.emit("change", {
      account: utils.getAddress(accounts[0])
    });
  }
  isChainUnsupported(chainId) {
    return !this.chains.some(x => x.id === chainId);
  }
  onChainChanged(chainId) {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", {
      chain: {
        id,
        unsupported
      }
    });
  }
  onDisconnect() {
    this.emit("disconnect");
  }
}

export { Web3AuthConnector };
//# sourceMappingURL=web3authWagmiConnector.esm.js.map
