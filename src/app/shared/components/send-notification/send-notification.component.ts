import { Component } from '@angular/core';

import 'froala-editor/js/plugins/link.min.js';
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/js/plugins/colors.min.js';

@Component({
  selector: 'app-send-notification',
  standalone: false,
  templateUrl: './send-notification.component.html',
  styleUrl: './send-notification.component.scss'
})
export class SendNotificationComponent {
  froalaOptions = {
    toolbarButtons: [
      'bold', 'italic', 'underline', 'strikeThrough',
      '|', 'insertLink', 'insertImage', 'textColor', 'backgroundColor',
      '|', 'undo', 'redo'
    ],
    pluginsEnabled: ['link', 'image', 'colors'],
    colorsHEXTemplate: true,
    colorsBackground: true,
  };
}
