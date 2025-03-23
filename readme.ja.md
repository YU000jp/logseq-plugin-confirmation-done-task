# Logseq Plugin: *DONE task property* 💪

- ブロックプロパティまたはその他のメソッドを使用して、DONE タスクに日付と時刻を割り当てます。
  > クエリでの検索が可能な `string` プロパティを埋め込みます。

> [!WARNING]
> このプラグインはLogseq v0.10.9より新しいバージョンとdbバージョンでは使用できません。これはタスク機能のブレークチェンジによるものです。

<div align="right">

[English](https://github.com/YU000jp/logseq-plugin-confirmation-done-task) | [日本語](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/blob/main/readme.ja.md)
[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-confirmation-done-task)](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/releases) [![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-confirmation-done-task?color=blue)](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/LICENSE) [![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-confirmation-done-task/total.svg)](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/releases) 公開日 20230612 <a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
</div>

## 概要

「完了」タスクに完了プロパティを追加
> Logseqには「完了」の日付が記録されない問題があります。この問題に対処するための解決策は、タスクが完了した後にブロックに「completed」プロパティを追加することです。そして、クエリでの検索が可能な `string` プロパティを埋め込みます。
- タスクを「完了」としてマーク

   ![DONEプロパティ](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/assets/111847207/2e7a224f-6efe-4f30-91d9-0e020c2274ce)

##### オプション > プロパティに日付と時刻を保持（複数の値） [#22](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/22#issuecomment-1615900974)

  - 箇条書きのメニュー項目から、`💪 完了のプロパティの中に追加する` を選択する

---

## はじめに

Logseq マーケットプレイスからインストール
  - 右上のツールバーで [`---`] を押して [`プラグイン`] を開きます。 `プラグインマーケット` を選択します。検索フィールドに `DONE` と入力し、検索結果から選択してインストールします。

### 使用方法

- 「DONE」とマークした後に「completed」プロパティを追加するためのダイアログが表示されます。そこで必要に応じて日付と時刻を編集することができます。 `completed` プロパティの日付は、Journal Linked Referencesで完了タスクを表示するためのリンクとして機能します。

#### プラグインの設定

> [ドキュメント](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/wiki/%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E8%A8%AD%E5%AE%9A%E3%81%AE%E9%A0%85%E7%9B%AE%E4%B8%80%E8%A6%A7)

---

## ショーケース / 質問 / アイデア / ヘルプ

> [ディスカッション](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/discussions) タブに移動して、この種の情報を質問し、見つけてください。

1. "string" プロパティを使ってクエリーで探す

```clojure
#+BEGIN_QUERY
  {
    :title "今日中に完了したタスク一覧"
    :query [
        :find (pull ?b [*])
        :in $ ?start ?end
        :where
            [?b :block/properties ?properties]
            [(get ?properties :string) ?completed]
            [(>= ?completed ?start)]
            [(< ?completed ?end)]
    ]
    :inputs [:today :tomorrow]
  }
  #+END_QUERY
```

## 先行技術とクレジット

- Logseq プラグイン > [DimitryDushkin/タスク完了トラッカー](https://github.com/DimitryDushkin/logseq-plugin-task-check-date)
- アイコン > [icooon-mono.com](https://icooon-mono.com/13942-%e3%83%9e%e3%83%83%e3%83%81%e3%83%a7%e3%81%ae%e3%82%a4%e3%83%a9%e3%82%b9%e3%83%84/)
- 製作者 > [@YU000jp](https://github.com/YU000jp)
