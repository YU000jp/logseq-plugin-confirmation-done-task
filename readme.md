# Logseq Plugin: *Confirmation DONE task* 💪

[English](https://github.com/YU000jp/logseq-plugin-confirmation-done-task) | [日本語](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/blob/main/readme.ja.md)

- When a task is marked as `DONE`, a confirmation dialog is displayed. A property with a date is added to the block.
  > Embeds a `string` property that allows discovery in queries.

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-confirmation-done-task)](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-confirmation-done-task?color=blue)](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-confirmation-done-task/total.svg)](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/releases)
 Published 2023/06/12

## Overview

Add completed property to the DONE task
> Logseq has a issue where it does not record the `DONE` date. To address this issue, a solution is to add a `completed` property to the block after the task is completed. And embeds a `string` property that allows discovery in queries.
- Mark a task as `DONE`

   ![DONEpropety](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/assets/111847207/2e7a224f-6efe-4f30-91d9-0e020c2274ce)

##### Option > Keep date and time on the property (multiple value) [#22](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/22#issuecomment-1615900974)

  - Select the bullet menu item (`💪Add into DONE property`)

---

## Getting Started

Install from Logseq Marketplace
  - Press [`---`] on the top right toolbar to open [`Plugins`]. Select `Marketplace`. Type `DONE` in the search field, select it from the search results and install.

   ![image](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/assets/111847207/4b1e6c54-16a9-40d7-98dc-61478b2023cc)

### Usage

- To use this solution, After marking as `DONE`, which will prompt to add a `completed` property. It is possible to edit the date and time if necessary. The `completed` property date will act as a link, allowing you to view completed tasks in the Journal Linked References.

#### The "string" property for Queries

```clojure
#+BEGIN_QUERY
  {
    :title "Tasks completed today"
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

#### Plugin Settings

> [Document](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/wiki/Plugin-Settings)

---

## Showcase / Questions / Ideas / Help

> Go to the [discussion](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/discussions) tab to ask and find this kind of things.

## Prior art & Credit

Logseq Plugin > [DimitryDushkin/ task completion tracker](https://github.com/DimitryDushkin/logseq-plugin-task-check-date)

Icon > [icooon-mono.com](https://icooon-mono.com/13942-%e3%83%9e%e3%83%83%e3%83%81%e3%83%a7%e3%81%ae%e3%82%a4%e3%83%a9%e3%82%b9%e3%83%884/)

Author > [YU000jp (GitHub)](https://github.com/YU000jp)

<a href="https://www.buymeacoffee.com/yu000japan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="🍌Buy Me A Coffee" style="height: 42px;width: 152px" ></a>
