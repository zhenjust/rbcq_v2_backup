import { Pipe, PipeTransform } from '@angular/core';
import { PipelineRun } from '@shared/interfaces';

@Pipe({
  name: 'pipelineSome',
  standalone: false
})
export class HasCompletedStatusPipe implements PipeTransform {

  transform(pipeline: PipelineRun[], name: string[], pipelineStatus: string): boolean {
    if (pipeline?.length && name?.length) {
      const isValid = name?.some(key => pipeline.some(p => p.name === key && (pipelineStatus ? p.status === pipelineStatus : true)));
      console.log({pipeline, name, isValid})
      return isValid;
    }

    return false;
  }

}
