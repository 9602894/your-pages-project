export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const filename = url.searchParams.get('filename');
  const password = url.searchParams.get('password');

  if (!filename || filename.trim() === '') {
    return new Response(JSON.stringify({error: '请提供文件名'}), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const safeFilename = sanitizeFilename(filename.trim());
  
  // 检查文件是否存在
  const fileContent = await env.FILES.get('file_' + safeFilename);
  if (!fileContent) {
    return new Response(JSON.stringify({error: '文件不存在'}), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 检查密码文件是否存在
  const storedPassword = await env.FILES.get('pwd_' + safeFilename);
  if (!storedPassword) {
    return new Response(JSON.stringify({error: '密码文件不存在'}), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 验证密码
  if (!password || password.trim() === '') {
    return new Response(JSON.stringify({error: '请提供密码'}), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  if (storedPassword !== password.trim()) {
    return new Response(JSON.stringify({error: '密码错误'}), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 构建返回结果
  const domain = request.headers.get('host');
  const fileLink = 'https://' + domain + '/z/' + encodeURIComponent(safeFilename);

  const response = {
    content: fileContent,
    fileLink: fileLink
  };

  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5.]/g, '_');
}
