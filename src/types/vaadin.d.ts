export interface VaadinGrid extends HTMLElement {
  cellClassGenerator: (cell: any) => string
  rowClassGenerator: (row: any) => string
  rowDetailsGenerator: (rowIndex: number) => HTMLElement
  columnReorderingAllowed: boolean
  columns: Array<GridColumn>
  detailedEvents: Array<string>
  disabled: boolean
  footer: any
  frozenColumns: number
  header: any
  items: Array<any>
  selection: GridSelection
  size: number
  sortOrder: Array<GridSortOrder>
  visibleRows: number

  addColumn(column: GridColumn, beforeColumn: string): void
  getItem(rowIndex: number,
          callback: (err: Error, item: any) => void,
          onlyCached: boolean): void
  refreshItems():void
  removeColumn(id: string):void
  scrollToEnd(): VaadinGrid
  scrollToRow(index: number, scrollDestination: string): VaadinGrid
  scrollToStart(): VaadinGrid
  setRowDetailsVisible(rowIndex: number, visible: boolean): void
  then(callback: Function): Promise<any>
}

interface GridSortOrder {
  column: number
  direction: 'asc' | 'desc'
}

interface GridSelection {
  selected(): Array<number>
  select(index: number): void
  deselect(index: number): void
  selectAll(): void
  clear(): void
}

interface GridColumn {
  name: string
  resizable?: boolean
  sortable?: boolean
}
