import { HttpContextToken } from '@angular/common/http';

export const SILENT_API_ERROR = new HttpContextToken<boolean>(() => false);
export const SKIP_AUTH_TOKEN = new HttpContextToken<boolean>(() => false);
