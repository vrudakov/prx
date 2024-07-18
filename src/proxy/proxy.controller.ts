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
    this.proxyService.fetchAndModifyContent(targetUrl).subscribe(response => {
      res.setHeader('Content-Type', response.headers['content-type']);
      res.send(response.data);
    });
  }
}
