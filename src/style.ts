import { key, keySmallDONEproperty, keyStyle } from "."

export const provideStyleMain = (configUpper: boolean, logseqVersionMd: boolean) => logseq.provideStyle({
  key: keyStyle, style: `
body {
  &>div {
    &#root>div>main>div div.block-properties>div {
      &:has(div>a[data-ref="string"].block-property),
      &:has(a[data-ref="string"].block-property) {
        display: none;
      }
    }
    &#${logseq.baseInfo.id}--${key} {
      & p{
        margin: 0;
      }

      & div.th h3 {
        max-width: 80%;
        text-overflow: ellipsis;
      }
      
      & div#addProperty>div {
        &>label>input,
        &>select {
          color: var(--ls-secondary-text-color);
          background-color: var(--ls-secondary-background-color);
        }
        &>label {
          position: relative;
          display: inline-block;
          
          &>input {
            ${logseqVersionMd === true ? `&[type="date"]::after {
                content: '📅';
            }
            &[type="time"]::after {
                content: '🕒';
            }` : ""}
                
            &[type="date"],
            &[type="time"] {
              font-size: .96em;
              position: relative;
              &::after {
                color: var(--ls-secondary-text-color);
                cursor: pointer;
                font-size: 1.2em;
              }
              &::-webkit-calendar-picker-indicator,
              &::-webkit-time-picker-indicator {
                position: absolute;
                right: 0.5em;
                top: 0.5em;
                padding:auto;
                width: 33px;
                height: 33px;
                cursor: pointer;
                color: transparent;
                background: transparent;
              }
            }
          }
        }
        &>select {
          font-size: .92em;
        }
        &>button#DONEpropertyButton {
          font-size: 1.8em;
          margin-right: .5em;
          &:hover {
            background-color: var(--ls-secondary-background-color);
            color: var(--ls-secondary-text-color);
          }
        }
      }
    }
  }
  &:not(.${keySmallDONEproperty})>div#root>div>main>div div.block-properties {
  &:has(a[data-ref="${logseq.settings!.cancelledTaskPropertyName || "cancelled"}"]),
  &:has(a[data-ref="${logseq.settings!.doingTaskPropertyName || "during"}"]),
  &:has(a[data-ref="${logseq.settings!.waitingTaskPropertyName || "waiting"}"]),
  &:has(a[data-ref="${logseq.settings!.todoTaskPropertyName || "created"}"]),
    &:has(a[data-ref="${logseq.settings!.customPropertyName || "completed"}"]){
      display: flex;
      justify-content: flex-end;
      background: unset;
      margin: unset;
      padding: unset;
      &>div:has(a[data-ref="${logseq.settings!.cancelledTaskPropertyName || "cancelled"}"]),
      &>div:has(a[data-ref="${logseq.settings!.doingTaskPropertyName || "during"}"]),
      &>div:has(a[data-ref="${logseq.settings!.waitingTaskPropertyName || "waiting"}"]),
      &>div:has(a[data-ref="${logseq.settings!.todoTaskPropertyName || "created"}"]),
      &>div:has(a[data-ref="${logseq.settings!.customPropertyName || "completed"}"]) {
        font-size: 0.8em;
        display: inline-block;
        border-radius: 2em;
        background-color: var(--ls-secondary-background-color);
        padding: 0.1em 0.5em;
        ${configUpper === true ? `
        position: absolute;
        top: 1em;
        ` : ""}
      }
    }
  }
}
`})
