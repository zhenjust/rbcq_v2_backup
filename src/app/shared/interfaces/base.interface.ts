export interface TPL_TABLE_COLUMN {
  label: string,
  propName: string,
  secondPropName?: string,
  align?: 'center' | 'left' | 'right';
  type?: 'string' | 'number' | 'date' | 'template' | 'enumLabel' | 'amount' | 'boolean';
  width?: string,
  template?: any,
  sort?: boolean;
}

export interface BaseResponse {
  message?: string;
}

export interface HttpResponseProgress {
  loaded: number;
  total?: number;
}

export interface TableColumn {
  name: string;
  key: string;
  align?: 'center' | 'left' | 'right';
}

export class TableParams {
  totalPages: number;
  totalElements: number;
  sortBy: number;
  numberOfElements: number;
  size = 20;
  page = 0;
  sort?: {
    prop?: string;
    dir?: string;
  }
}

export interface TableDataResult<T> {
  data: T[];
  draw: number;
  recordsTotal: number;
}

export interface TableAction<T> {
  label: string;
  value: string;
  danger?: boolean;
  click: (rowData?: T) => void;
  hidden?: (rowData?: T) => boolean;
}

export interface ReferenceOption1 {
  name: string;
  label: string;
}
