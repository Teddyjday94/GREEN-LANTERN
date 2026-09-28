import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const TYPES={
  '.css':'text/css; charset=utf-8',
  '.dae':'model/vnd.collada+xml',
  '.html':'text/html; charset=utf-8',
  '.jpg':'image/jpeg',
  '.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8',
  '.png':'image/png',
  '.svg':'image/svg+xml',
  '.webp':'image/webp',
};

export function createStaticServer({root=path.resolve('dist')}={}) {
  const resolvedRoot=path.resolve(root);
  return createServer(async (request,response)=>{
    try {
      const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
      const requested=path.resolve(resolvedRoot,`.${pathname}`);
      if(requested!==resolvedRoot && !requested.startsWith(`${resolvedRoot}${path.sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      let target=requested;
      try {
        if((await stat(target)).isDirectory()) target=path.join(target,'index.html');
      } catch {
        target=path.join(resolvedRoot,'index.html');
      }
      const body=await readFile(target);
      response.writeHead(200,{'Content-Type':TYPES[path.extname(target).toLowerCase()]||'application/octet-stream'});
      response.end(body);
    } catch(error) {
      response.writeHead(error?.code==='ENOENT'?404:500).end(error?.code==='ENOENT'?'Not found':'Server error');
    }
  });
}

if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  const port=Number(process.env.PORT)||4173;
  createStaticServer().listen(port,'127.0.0.1',()=>console.log(`Green Lantern preview: http://127.0.0.1:${port}`));
}
