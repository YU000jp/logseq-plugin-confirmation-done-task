import { key, keySmallDONEproperty } from "."

export const provideStyleMain = () => logseq.provideStyle(`
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
      
      & div#addProperty {
        & :is(input, select) {
          color: var(--ls-secondary-text-color);
          border-radius: 0.5em;
          font-size: .96em;
        }
        & input {
          background-color: var(--ls-secondary-background-color);
          color: var(--ls-secondary-text-color);

        }
        & select {
          font-size: .92em;
          background-color: var(--ls-secondary-background-color);
          color: var(--ls-secondary-text-color);
        }
        & button#DONEpropertyButton {
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
  &:not(.${keySmallDONEproperty})>div#root>div>main>div div.block-properties:has(a[data-ref="${logseq.settings!.customPropertyName || "completed"}"]){
    display: flex;
    justify-content: flex-end;
    background: unset;
    &>div {
      font-size: 0.8em;
      display: inline-block;
      border-radius: 2em;
      background-color: var(--ls-secondary-background-color);
      padding: 0.1em 0.5em;
    }
  }
}
`)
