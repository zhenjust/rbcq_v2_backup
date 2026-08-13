import {Pipe, PipeTransform} from '@angular/core';
import {PipelineRun} from '@shared/interfaces';

@Pipe({
  name: 'hasFinalizedPipeline',
  standalone: false
})
export class HasFinalizedPipelinePipe implements PipeTransform {

  transform(pipelines: PipelineRun[] | null | undefined): boolean {
    return pipelines?.some(
      pipeline => pipeline.name === 'additionalCompensation-finalize' && ['Succeeded', 'Completed'].includes(pipeline.status)
    ) ?? false;
  }

}
