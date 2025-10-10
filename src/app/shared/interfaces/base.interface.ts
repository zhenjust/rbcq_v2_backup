export interface TPL_TABLE_COLUMN {
  label: string,
  propName: string,
  secondPropName?: string,
  align?: 'center' | 'left' | 'right';
  type?: 'string' | 'number' | 'date' | 'template';
  width?: string,
  template?: any,
}

export interface BaseResponse {
  message?: string;
}