// src/proxy/proxy.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import * as cheerio from 'cheerio';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}

  fetchAndModifyContent(url: string) {
    return this.httpService.get(url, { responseType: 'arraybuffer' }).pipe(
      map(response => {
        const contentType = response.headers['content-type'];

        if (contentType && contentType.includes('text/html')) {
          const $ = cheerio.load(response.data.toString('utf-8'));

          // Modify text to add "™" to six-letter words
          $('body').find('*').each((i, el) => {
            const element = $(el);
            if (element.children().length === 0) {
              const text = element.text();
              const modifiedText = text.replace(/\b(\w{6})\b/g, '$1™');
              element.text(modifiedText);
            }
          });

          // Update internal links to proxy
          $('a, link, script, img').each((i, el) => {
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
