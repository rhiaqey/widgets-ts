# rq-mt-sparkline



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description | Type                                    | Default                                     |
| ------------- | -------------- | ----------- | --------------------------------------- | ------------------------------------------- |
| `dataset`     | --             |             | `{ labels: string[]; data: number[]; }` | `{       labels: [],       data: [],     }` |
| `maxElements` | `max-elements` |             | `number`                                | `31`                                        |


## Methods

### `appendData(label: string, data: number) => Promise<void>`



#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `label` | `string` |             |
| `data`  | `number` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [rq-mt-spark](../rq-mt-spark)

### Graph
```mermaid
graph TD;
  rq-mt-spark --> rq-mt-sparkline
  style rq-mt-sparkline fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
