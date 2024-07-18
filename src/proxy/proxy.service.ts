// src/proxy/proxy.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import * as cheerio from 'cheerio';

@Injectable()export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  fetchAndModifyContent(url: string) {
    return this.httpService.get(url, { responseType: 'arraybuffer' }).pipe(
      map(response => {
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
          const $ = cheerio.load(response.data.toString('utf-8'), {
            decodeEntities: false  // Preserve entities
          });

          // Modify text
          $('body *').not('script, style, iframe').contents().each((i, el) => {
            if (el.type === 'text') {
              const text = $(el).text();
              const modifiedText = text.replace(/\b(\w{6})\b/g, '$1™');
              $(el).replaceWith(modifiedText);
            }
          });

          // Update internal links to proxy
          $('a[href], link[href], script[src], img[src]').each((i, el) => {
            const element = $(el);
            const href = element.attr('href');
            const src = element.attr('src');
            if (href && href.startsWith('/')) {
              element.attr('href', `/proxy?url=${href}`);
            }
            if (src && src.startsWith('/')) {
              element.attr('src', `/proxy?url=${src}`);
            }
          });

          return {
            data: $.html(),
            headers: {
              'content-type': 'text/html',
            },
          };
        } else {
          return {
            data: response.data,
            headers: {
              'content-type': contentType,
            },
          };
        }
      }),
    );
  }
}