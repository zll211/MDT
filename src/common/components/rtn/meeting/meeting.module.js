export class AttachmentFileType {
  static ct = 'ct';
  static mri = 'mri';
  static cr = 'cr';
  static dr = 'dr';
  static dsa = 'dsa';
  static rf = 'rf';
  static us = 'us';
  static ultrasonic = 'ultrasonic';
  static endoscopy = 'endoscopy';
  static kfb = 'kfb';
  static ecg = 'ecg';
  static other = 'other';
}
export class AttachmentFileOriginalType {
  static ct = 'CT';
  static mri = 'MRI';
  static cr = 'CR';
  static dr = 'DR';
  static dsa = 'DSA';
  static rf = 'RF';
  static us = 'US';
  static ultrasonic = '超声';
  static endoscopy = '内镜';
  static kfb = '病理';
  static ecg = '心电图';
  static other = '其他';
}
export const dicomsType = [
  AttachmentFileOriginalType.ct,
  AttachmentFileOriginalType.mri,
  AttachmentFileOriginalType.cr,
  AttachmentFileOriginalType.dr,
  AttachmentFileOriginalType.dsa,
  AttachmentFileOriginalType.rf,
  AttachmentFileOriginalType.us,
];
const translateOriginalType = type => {
  switch (type) {
    case 'CT':
      return AttachmentFileType.ct;
    case 'MRI':
      return AttachmentFileType.mri;
    case 'CR':
      return AttachmentFileType.cr;
    case 'DR':
      return AttachmentFileType.dr;
    case 'DSA':
      return AttachmentFileType.dsa;
    case 'RF':
      return AttachmentFileType.rf;
    case 'US':
      return AttachmentFileType.us;
    case '超声':
      return AttachmentFileType.ultrasonic;
    case '内镜':
      return AttachmentFileType.endoscopy;
    case '病理':
      return AttachmentFileType.kfb;
    case '心电图':
      return AttachmentFileType.ecg;
    default:
      return AttachmentFileType.other;
  }
};
export class AttachmentFile {
  id;
  filename;
  path;
  type;
  orginalType;
  isPicture;
  isDicom;
  constructor(data) {
    this.id = data.id;
    this.filename = data.filename;
    this.path = data.path;
    this.orginalType = data.type;
    this.type = translateOriginalType(data.type);
    const tailIndex = data.filename.lastIndexOf('.');
    const tail = data.filename.substr(tailIndex + 1).toLowerCase();
    this.isPicture = ['jpg', 'jpeg', 'png'].indexOf(tail) !== -1;
    this.isDicom = dicomsType.indexOf(data.type) !== -1;
  }
}
