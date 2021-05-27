from ima_predeployed.contracts.token_manager import TokenManagerGenerator


class TokenManagerErc20Generator(TokenManagerGenerator):
    ARTIFACT_FILENAME = "TokenManagerERC20.json"

    # ---------- storage ----------
    # --------Initializable--------
    # 0:    _initialized, _initializing;
    # -----ContextUpgradeable------
    # 1:    __gap
    # ...   __gap
    # 50:   __gap
    # --AccessControlUpgradeable---
    # 51:   _roles
    # 52:   __gap
    # ...   __gap
    # 100:  __gap
    # ---------TokenManager---------
    # 101:  messageProxy
    # 102:  tokenManagerLinker
    # 103:  communityLocker
    # 104:  schainHash
    # 105:  depositBox, automaticDeploy
    # 106:  tokenManagers
    # ------TokenManagerERC20------
    # 107:  clonesErc20
    # 108:  totalSupplyOnMainnet

    def __init__(self, deployer_address: str, deposit_box_address: str, schain_name: str):
        super().__init__(deployer_address, deposit_box_address, schain_name)