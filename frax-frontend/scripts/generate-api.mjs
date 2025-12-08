import { resolve } from 'path';
import { generateApi } from 'swagger-typescript-api';
import process from 'process';



generateApi({
  name: 'Api.ts',
  output: resolve(process.cwd(), './src/api'),
  url: 'http://192.168.0.153:8090/swagger/doc.json', 
  httpClientType: 'axios',
  generateClient: true,
  generateResponses: true,
});