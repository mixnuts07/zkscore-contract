# zkScore-contracts

- 使用したtech stacks: 
  - フロント:
    - 言語：TypeScript
    - ライブラリ：React
    - フレームワーク：Next.js
    - CSS：tailwindcss
  - バックエンド
    - 言語：C#
    - インフラ：Azure functions, Azure SQL
  - スマートコントラクト
    - 言語：Solidity
    - 開発環境：Hardhat

- 使用したBlockchain：Ethereum (Goerli)
- deployしたContract(ExplorerでOK)
  - [link](https://goerli.etherscan.io/address/0x774D1ceB846730A2226E4BdC0f47E11a98f2Db8A)
  - Address：0x774D1ceB846730A2226E4BdC0f47E11a98f2Db8A
- application codeやその他のfile
  - Please check this repository, [frontend](https://github.com/gkScore/frontend), [backend](https://github.com/gkScore/azfunc). 
- テスト手順を含むリポジトリへのリンク
  - 以下画像
![](image.png)

- 審査やテストのためにプロジェクトにアクセスする方法など
  - https://frontend-zkscore.vercel.app/  
  -https://tokyoweb3zkscore.azurewebsites.net/

## Contractのテスト
- zkSBT(スコアを表現したSBT)が対象アドレスに発行されていること
- zkSBTは譲渡できないこと

```shell
git clone git@github.com:gkScore/zkscore.git
cd zkscore
npm i
REPORT_GAS=true npx hardhat test
```
