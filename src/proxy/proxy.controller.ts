// src/proxy/proxy.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Response } from 'express';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  async getModifiedContent(@Query('url') url: string, @Res() res: Response) {
    const targetUrl = `https://docs.nestjs.com${url || ''}`;
    this.proxyService.fetchAndModifyContent(targetUrl).subscribe(data => {
      res.set('Content-Type', this.getContentType(url));
      res.send(data);
    });
  }

  private getContentType(url: string): string {
    if (!url) return 'text/plain';
    if (url.endsWith('.js')) {
      return 'application/javascript';
    } else if (url.endsWith('.css')) {
      return 'text/css';
    } else if (url.endsWith('.html')) {
      return 'text/html';
    } else if (url.endsWith('.png')) {
      return 'image/png';
    } else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
      return 'image/jpeg';
    } else {
      return 'text/plain';
    }
  }
}
