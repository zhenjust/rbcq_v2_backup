import { inject, Pipe, PipeTransform } from '@angular/core';
import { MeterProcessTypes } from '@shared/enums';
import { settlementPipeline, TableColumn } from '@shared/interfaces';
import { DateFormatterUtilService } from '@shared/services/utils';

@Pipe({
  name: 'settlementTblFormatter',
  standalone: false
})
export class SettlementTableFormatterPipe implements PipeTransform {
  private dfs = inject(DateFormatterUtilService);

  transform(data: settlementPipeline, column: TableColumn): string {
    switch (column.key) {
      case 'workspaceId':
        return data.workspaceId || data?.id?.toString();
      case 'runDatetime':
        return this.dfs.formatDateTime(data.runDatetime);
      case 'processType':
        return data.processType === MeterProcessTypes.ADJUSTED ? `${data.processType + ' - ' + data.adjNo}` : data.processType;
      case 'tradingDate':
        return ((data.billingPeriod || data.billingStartDate) ? `${data.billingStartDate} - ${data.billingEndDate}` : data.tradingDate) || '';
      case 'status':
        return data.status;
      case 'lineRentalStatus':
        return data?.lineRentalStatus || '';
      case 'progress':
        return '';
      case 'actions':
        return '';
      default:
        return '';
    }
  }
}
