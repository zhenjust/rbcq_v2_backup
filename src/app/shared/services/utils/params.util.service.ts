import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TableParams } from '@shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ParamsUtilService {
  public buildParams(data: Record<string, any>, tableParams?: TableParams): HttpParams {
    let params = new HttpParams();

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (this.isValidValue(value)) {
          if (Array.isArray(value)) {
            // Handle arrays
            value.forEach(item => params = params.append(key, item.toString()));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    if (tableParams) {
      const _tableParams = {...tableParams};
      const page = _tableParams?.page ? _tableParams.page - 1 : 0;

      params = params
        .append('page', page?.toString())
        .append('size', _tableParams?.size?.toString());

        const toParam = (sort: any) => {
          let dir = sort.dir && sort.dir.toString().toLowerCase();
          dir = dir === 'ascend' ? 'asc' : 'desc';
          const sortParam = decodeURIComponent(sort.prop + ',' + dir);
          return sortParam;
        };

        if (_tableParams.sort) {
          if (Array.isArray(_tableParams.sort)) {
            _tableParams.sort.forEach((sort: any) => {
              params = params.append('sort', toParam(sort));
            });
          } else {
            params = params.append('sort', toParam(_tableParams.sort));
          }
        }

    }

      return params;
    }

    private isValidValue(value: any): boolean {
      return value !== undefined &&
            value !== null &&
            value !== '' &&
            (!Array.isArray(value) || value.length > 0);
    }
}
