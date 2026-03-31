export interface TPL_TABLE_COLUMN {
  label: string,
  propName: string,
  secondPropName?: string,
  align?: 'center' | 'left' | 'right';
  type?: 'string' | 'number' | 'date' | 'template' | 'enumLabel';
  width?: string,
  template?: any,
  hasRowSpan?: boolean,
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
  danger?: true;
  click: (rowData: T) => void;
  hidden?: (rowData: T) => boolean;
}
