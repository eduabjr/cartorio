import { SetMetadata } from '@nestjs/common';

export const API_VERSION_KEY = 'apiVersion';

export const ApiVersion = (version: string) => SetMetadata(API_VERSION_KEY, version);

export const V1 = () => ApiVersion('v1');
export const V2 = () => ApiVersion('v2');
export const V3 = () => ApiVersion('v3');
