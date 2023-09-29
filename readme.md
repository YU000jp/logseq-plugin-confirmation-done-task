# Logseq Plugin: *Confirmation DONE task* 💪

- When a task is marked as `DONE`, a confirmation dialog is displayed, and a property with a date is added to the block.

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-confirmation-done-task)](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-confirmation-done-task?color=blue)](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-confirmation-done-task/total.svg)](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/releases)
 Published 2023/06/12

---

## Feature

### Add completed property to the DONE task

> Mark the task as `DONE`

- Logseq has a problem where it does not record the `DONE` date. To address this issue, a solution is to add a `completed` property to the block after the task is completed.

   ![DONEpropety](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/assets/111847207/2e7a224f-6efe-4f30-91d9-0e020c2274ce)

---

## Getting Started

### Install from Logseq Marketplace

- Press [`---`] on the top right toolbar to open [`Plugins`]
- Select `Marketplace`
- Type `DONE` in the search field, select it from the search results and install

   ![image](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/assets/111847207/4b1e6c54-16a9-40d7-98dc-61478b2023cc)

### Usage

- To use this solution, After marking as `DONE`, which will prompt to add a `completed` property. It is possible to edit the date and time if necessary. The `completed` property date will act as a link, allowing you to view completed tasks in the Journal Linked References.

#### Query

[#36](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/36#issuecomment-1740490239)

#### Plugin Settings

- Custom property name: string
  - `completed` default
- Use the function to add the date to the property
  - `true` default
  - `false`
- Create the date link: toggle
  - `true` default
  - `false`
- Use the function to add a timestamp to the property: toggle
  - `true` default
  - `false`
- Emphasis on time in property (like below **10:00**): select [#11](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/13)
  - `*` default
  - `**`
  - `none`
- Small DONE property and right align: toggle [#17](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/17)
  - `true` default
  - `false`
  > ⚠️Logseq v0.9.11 or later
- Timeout mode [#18](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/18)
  - `true`
  - `false` default
- Timeout (ms) when timeout mode is enabled: select [#18](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/18)
  - `3000`
  - `5000` default
  - `7000`
  - `9000`
- Default mode select: select [#26](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/26)
  - `As block property` default
  - `Insert block property`
  - `Insert block`
  - `Update block`
- Insert block mode: Use reference: toggle [#26](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/26)
  - `true` default
  - `false`
- Insert block: Collapsed: toggle [#26](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/26)
  - `true`
  - `false` default
- Remove property without DONE marker: toggle [#34](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/34) 🆕
  - `true` default
  - `false`

#### Option

##### Keep date and time on the property (multiple value) [#22](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/issues/22#issuecomment-1615900974)

- Trigger `💪Add to DONE property`
  - From the block context menu (to open the options, right-click the bullet that has the desired property)

---

## Showcase / Questions / Ideas / Help

> Go to the [discussion](https://github.com/YU000jp/logseq-plugin-confirmation-done-task/discussions) tab to ask and find this kind of things.

## Author

- GitHub: [YU000jp](https://github.com/YU000jp)

## Prior art & Credit

### Logseq-plugin

- [DimitryDushkin/ task completion tracker](https://github.com/DimitryDushkin/logseq-plugin-task-check-date)

### Icon

- [icooon-mono.com](https://icooon-mono.com/13942-%e3%83%9e%e3%83%83%e3%83%81%e3%83%a7%e3%81%ae%e3%82%a4%e3%83%a9%e3%82%b9%e3%83%884/)

---

<a href="https://www.buymeacoffee.com/yu000japan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="🍌Buy Me A Coffee" style="height: 42px;width: 152px" ></a>
